import {
  Program,
  Identifier,
  MemberExpression,
  Node,
  StringLiteral,
  ObjectProperty,
  ObjectMethod,
  SpreadElement,
  PrivateName,
} from '@babel/types';
import { Parser, ParserOptions, SupportOption } from 'prettier';
import * as parserBabel from 'prettier/plugins/babel';
import getKeyValuePriorityAndType from './get-key-value-priority-and-type';

type StylexKeySortPluginOptions = {
  minKeys: number;
  validImports: string[];
  allowLineSeparatedGroups: boolean;
};

function getStylexImportContext(
  program: Program,
  validImports: string[],
): {
  namespaces: Set<string>;
  identifiers: Set<string>;
} {
  return program.body.reduce(
    (context, node) => {
      if (
        node.type !== 'ImportDeclaration' ||
        !isStylexImportSource(node.source)
      ) {
        // skip if node is not an ImportDeclaration
        return context;
      }

      node.specifiers.forEach((specifier) => {
        if (
          specifier.type === 'ImportDefaultSpecifier' ||
          specifier.type === 'ImportNamespaceSpecifier'
        ) {
          context.namespaces.add(specifier.local.name);
        }

        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          (specifier.imported.name === 'create' ||
            specifier.imported.name === 'keyframes')
        ) {
          context.identifiers.add(specifier.local.name);
        }
      });

      return context;
    },
    { namespaces: new Set<string>(), identifiers: new Set<string>() },
  );

  function isStylexImportSource(source: StringLiteral) {
    return validImports.includes(source.value);
  }
}

function stylexKeySort(
  program: Program,
  sourceCode: string,
  options: ParserOptions & StylexKeySortPluginOptions,
) {
  const { validImports, minKeys, allowLineSeparatedGroups } = options;
  const { namespaces, identifiers } = getStylexImportContext(
    program,
    validImports,
  );

  if (namespaces.size === 0 && identifiers.size === 0) {
    return;
  }

  for (const node of program.body) {
    if (node.type !== 'VariableDeclaration') {
      continue;
    }

    node.declarations.forEach((declarator) => {
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.init?.type === 'CallExpression' &&
        (isExpressionStylexIdentifier(declarator.init.callee) ||
          isExpressionStylexMemberExpression(declarator.init.callee)) &&
        declarator.init.arguments?.[0].type === 'ObjectExpression'
      ) {
        sortObjectKeys(declarator.init.arguments[0], sourceCode, {
          minKeys,
          allowLineSeparatedGroups,
        });
      }
    });
  }

  function isExpressionStylexMemberExpression(
    node: Node,
  ): node is MemberExpression {
    return (
      node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      node.property.type === 'Identifier' &&
      namespaces.has(node.object.name) &&
      isCreateOrKeyframes(node.property.name)
    );
  }

  function isExpressionStylexIdentifier(node: Node): node is Identifier {
    return node.type === 'Identifier' && identifiers.has(node.name);
  }
}

function isCreateOrKeyframes(value: string) {
  return value === 'create' || value === 'keyframes';
}

function sortObjectKeys(
  node: Node,
  sourceCode: string,
  options: Pick<
    StylexKeySortPluginOptions,
    'minKeys' | 'allowLineSeparatedGroups'
  >,
) {
  if (node.type !== 'ObjectExpression') {
    return;
  }

  if (node.properties.length >= options.minKeys) {
    const lineSeparatedGroups = getLineSeparatedGroups(
      node.properties,
      sourceCode,
    );

    const properties = options.allowLineSeparatedGroups
      ? lineSeparatedGroups
      : [lineSeparatedGroups.flat()];

    node.properties = properties.flatMap((group) =>
      group.sort(compareProperties),
    );
  }

  node.properties.forEach((node) => {
    if (node.type === 'ObjectProperty') {
      sortObjectKeys(node.value, sourceCode, options);
    }
  });
}

function compareProperties(
  a: ObjectProperty | ObjectMethod | SpreadElement,
  b: ObjectProperty | ObjectMethod | SpreadElement,
): number {
  if (a.type === 'SpreadElement' || b.type === 'SpreadElement') {
    return 0;
  }

  const aKeyValue = getKeyValue(
    a.key as Identifier | PrivateName | StringLiteral,
  );
  const bKeyValue = getKeyValue(
    b.key as Identifier | PrivateName | StringLiteral,
  );

  const prev = getKeyValuePriorityAndType(aKeyValue);
  const curr = getKeyValuePriorityAndType(bKeyValue);

  if (prev.type !== 'string' || curr.type !== 'string') {
    return prev.priority > curr.priority ? 1 : -1;
  }

  return aKeyValue > bKeyValue ? 1 : -1;
}

function getKeyValue(key: Identifier | PrivateName | StringLiteral): string {
  if (key.type === 'StringLiteral') {
    return key.value;
  }

  if (key.type === 'PrivateName') {
    return key.id.name;
  }

  return key.name;
}

function getLineSeparatedGroups(
  properties: (ObjectProperty | SpreadElement | ObjectMethod)[],
  sourceCode: string,
) {
  const groups = [];
  let currGroup = [];

  for (let i = 0; i < properties.length; i++) {
    const aNode = properties[i];
    const bNode = properties[i + 1];

    currGroup.push(aNode);

    if (
      bNode === undefined ||
      isBlankLineBetweenProperties(aNode, bNode, sourceCode)
    ) {
      groups.push(currGroup);
      currGroup = [];
    }
  }

  return groups;
}

function isBlankLineBetweenProperties(
  a: ObjectProperty | ObjectMethod | SpreadElement,
  b: ObjectProperty | ObjectMethod | SpreadElement,
  sourceCode: string,
) {
  return a.end && b.start && /\n\s*\n/.test(sourceCode.slice(a.end, b.start));
}

function withStylexKeySort(parser: Parser): Parser {
  return {
    ...parser,
    parse: function(text: string, options: ParserOptions) {
      const ast = parser.parse(text, options);

      stylexKeySort(
        ast.program,
        text,
        options as ParserOptions & StylexKeySortPluginOptions,
      );

      return ast;
    },
  };
}

export const languages = [
  {
    name: 'JavaScript',
    parsers: ['babel'],
    extensions: ['.js', '.jsx'],
  },
  {
    name: 'TypeScript',
    parsers: ['babel-ts'],
    extensions: ['.ts', '.tsx'],
  },
  {
    name: 'Flow',
    parsers: ['babel-flow'],
    extensions: ['.js', '.jsx'],
  },
];

export const options: {
  [K in keyof StylexKeySortPluginOptions]: SupportOption;
} = {
  validImports: {
    type: 'string',
    array: true,
    default: [{ value: ['@stylexjs/stylex', 'stylex'] }],
    category: 'Global',
    description: 'Possible string where you can import stylex from',
  },
  minKeys: {
    type: 'int',
    default: 2,
    category: 'Global',
    description:
      'Minimum number of keys required after which the sort is enforced',
  },
  allowLineSeparatedGroups: {
    type: 'boolean',
    default: false,
    category: 'Global',
    description:
      'Sort groups of keys that have a blank line between them separately',
  },
};

export const parsers = {
  babel: withStylexKeySort(parserBabel.parsers.babel),
  'babel-ts': withStylexKeySort(parserBabel.parsers['babel-ts']),
  'babel-flow': withStylexKeySort(parserBabel.parsers['babel-flow']),
};
