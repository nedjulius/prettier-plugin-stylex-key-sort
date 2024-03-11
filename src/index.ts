import { AstPath, Doc, Parser, ParserOptions } from 'prettier';
import * as parserBabel from 'prettier/plugins/babel';

function withStylexKeySort(parser: Parser): Parser {
  return {
    ...parser,
    parse: function(text: string, options: ParserOptions) {
      return traverse(parser.parse(text, options));
    },
  };
}

function traverse(node: any) {
  console.log(node, 'node');

  return node;
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
