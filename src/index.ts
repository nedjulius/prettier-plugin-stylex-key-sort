import {
  ImportDeclaration,
  Program,
  Identifier,
  MemberExpression,
  ObjectExpression,
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

function stylexKeySort(program: Program) {
  const stylexNamespace = new Set<string>();
  const stylexIdentifiers = new Set<string>();

  const stylexImports = program.body.filter(
    (node): node is ImportDeclaration =>
      node.type === 'ImportDeclaration' && isStylexImportSource(node.source),
  );

  if (stylexImports.length === 0) {
    // terminate if there are no stylex imports
    return;
  }

  stylexImports.forEach((node) => {
    node.specifiers.forEach((specifier) => {
      if (
        specifier.type === 'ImportDefaultSpecifier' ||
        specifier.type === 'ImportNamespaceSpecifier'
      ) {
        stylexNamespace.add(specifier.local.name);
      }

      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported.type === 'Identifier' &&
        (specifier.imported.name === 'create' ||
          specifier.imported.name === 'keyframes')
      ) {
        stylexIdentifiers.add(specifier.local.name);
      }
    });
  });

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
    expr: Node,
  ): expr is MemberExpression {
    return (
      expr.type === 'MemberExpression' &&
      expr.object.type === 'Identifier' &&
      expr.property.type === 'Identifier' &&
      stylexNamespace.has(expr.object.name) &&
      isCreateOrKeyframes(expr.property.name)
    );
  }

  function isExpressionStylexIdentifier(expr: Node): expr is Identifier {
    return expr.type === 'Identifier' && stylexIdentifiers.has(expr.name);
  }
}

function isCreateOrKeyframes(value: string) {
  return value === 'create' || value === 'keyframes';
}

function isStylexImportSource(source: StringLiteral) {
  return source.value === '@stylexjs/stylex' || source.value === 'stylex';
}

function sortObjectKeys(expr: Node) {
  if (expr.type !== 'ObjectExpression') {
    return;
  }

  expr.properties.sort((a, b) => {
    if (a.type === 'SpreadElement' || b.type === 'SpreadElement') {
      return 0;
    }

    return a.key.name > b.key.name ? 1 : -1;
  });

  expr.properties
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
];

export const parsers = {
  babel: withStylexKeySort(parserBabel.parsers.babel),
};
