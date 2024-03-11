import {
  ImportDeclaration,
  Literal,
  Program,
  VariableDeclarator,
} from 'estree';
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
  const stylexCreate = new Set<string>();
  const stylexKeyframes = new Set<string>();

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
        specifier.imported.name === 'create'
      ) {
        stylexCreate.add(specifier.local.name);
      }

      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported.name === 'keyframes'
      ) {
        stylexKeyframes.add(specifier.local.name);
      }
    });
  });

  for (const node of program.body) {
    if (node.type === 'VariableDeclaration') {
      // this is crazy, will refactor
      // just for testing right now
      //
      // i really dont want to use traverse due to performance
      // but i can probably utilize @babel/types
      const sortable = node.declarations.filter(
        (declaration): declaration is VariableDeclarator =>
          declaration.type === 'VariableDeclarator' &&
          declaration.init?.type === 'CallExpression' &&
          ((declaration.init.callee.type === 'Identifier' &&
            stylexCreate.has(declaration.init.callee.name)) ||
            (declaration.init.callee.type === 'MemberExpression' &&
              declaration.init.callee.object.type === 'Identifier' &&
              declaration.init.callee.property.type === 'Identifier' &&
              stylexNamespace.has(declaration.init.callee.object.name) &&
              declaration.init.callee.property.name === 'create')),
      );

      console.log(sortable, 'sortable');
    }
  }
}

function isStylexImportSource(source: Literal) {
  return source.value === '@stylexjs/stylex' || source.value === 'stylex';
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
