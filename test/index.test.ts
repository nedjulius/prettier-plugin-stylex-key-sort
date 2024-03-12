import { format as prettierFormat } from 'prettier';
import * as stylexKeySortPlugin from '../src/index';

async function format(code: string): Promise<string> {
  return await prettierFormat(code, {
    parser: 'babel',
    plugins: [stylexKeySortPlugin],
    semi: true,
    tabWidth: 2,
    singleQuote: true,
  });
}

type TestCase = {
  description: string;
  input: string;
  output: string;
};

const TEST_CASES: TestCase[] = [
  {
    description: 'should correctly sort regular stylex.create arguments',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex',
  },
});
`,
  },
  {
    description: 'should correctly sort regular keyframes arguments',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.keyframes({
  '0%': {
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.keyframes({
  '0%': {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex',
  },
});
`,
  },
  {
    description: 'should correctly sort arguments of custom specifier',
    input: `import { create as cr } from '@stylexjs/stylex';
const styles = cr({
  foo: {
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import { create as cr } from '@stylexjs/stylex';
const styles = cr({
  foo: {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex',
  },
});
`,
  },
  {
    description: 'should correctly sort with line comments',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    display: 'flex', // foo
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex', // foo
  },
});
`,
  },
];

describe('prettier-plugin-stylex-key-sort', () => {
  for (const { description, input, output } of TEST_CASES) {
    it(description, async () => {
      const code = await format(input);

      expect(code).toEqual(output);
    });
  }
});
