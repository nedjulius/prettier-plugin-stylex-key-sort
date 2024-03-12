import {
  Program,
  Identifier,
  MemberExpression,
  Node,
  StringLiteral,
  ObjectProperty,
} from '@babel/types';
import { Parser, ParserOptions } from 'prettier';
import * as parserBabel from 'prettier/plugins/babel';

function withStylexKeySort(parser: Parser): Parser {
  return {
    ...parser,
    parse: function(text: string, options: ParserOptions) {
      const ast = parser.parse(text, options);

      stylexKeySort(ast.program);

      return ast;
    },
  };
}

function getStylexImportContext(program: Program): {
  namespaces: Set<string>;
  identifiers: Set<string>;
} {
  return program.body.reduce(
    (context, node) => {
      if (node.type !== 'ImportDeclaration') {
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
}

function stylexKeySort(program: Program) {
  const { namespaces, identifiers } = getStylexImportContext(program);

  if (namespaces.size === 0) {
    // skip if there are no namespaces
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
        sortObjectKeys(declarator.init.arguments[0]);
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

function isStylexImportSource(source: StringLiteral) {
  return source.value === '@stylexjs/stylex' || source.value === 'stylex';
}

function sortObjectKeys(node: Node) {
  if (node.type !== 'ObjectExpression') {
    return;
  }

  node.properties.sort((a, b) => {
    if (a.type === 'SpreadElement' || b.type === 'SpreadElement') {
      return 0;
    }

    return a.key.name > b.key.name ? 1 : -1;
  });

  node.properties
    .filter(
      (property): property is ObjectProperty =>
        property.type === 'ObjectProperty',
    )
    .forEach((property) => sortObjectKeys(property.value));
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

export const parsers = {
  babel: withStylexKeySort(parserBabel.parsers.babel),
  'babel-ts': withStylexKeySort(parserBabel.parsers['babel-ts']),
  'babel-flow': withStylexKeySort(parserBabel.parsers['babel-flow']),
};
