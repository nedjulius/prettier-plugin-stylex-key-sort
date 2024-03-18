import { format as prettierFormat } from 'prettier';
import * as stylexKeySortPlugin from '../src/index';

async function format(code: string, options: object = {}): Promise<string> {
  return await prettierFormat(code, {
    parser: 'babel',
    plugins: [stylexKeySortPlugin],
    semi: true,
    tabWidth: 2,
    singleQuote: true,
    ...options,
  });
}

type TestCase = {
  description: string;
  input: string;
  output: string;
  options?: object;
  only?: boolean;
};

const TEST_CASES: TestCase[] = [
  {
    description: 'should correctly sort regular stylex.create arguments',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    display: 'flex',
    alignItems: 'center',
    borderColor: {
      '@media (min-width: 1400px)': 120,
      ':hover': 'blue',
      default: 'red',
    },
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    alignItems: 'center',
    borderColor: {
      default: 'red',
      ':hover': 'blue',
      '@media (min-width: 1400px)': 120,
    },
    display: 'flex',
  },
});
`,
    only: true,
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
  {
    description: 'should not sort if there are less keys than minKeys option',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    options: { minKeys: 5 },
  },
  {
    description: 'should not sort if there are no valid imports present',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    options: { validImports: ['stlx'] },
  },
  {
    description: 'should sort with different valid imports set',
    input: `import stylex from 'stlx';
import { keyframes as kf } from 'stlx';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',
    borderColor: 'red',
    alignItems: 'center',
  },
});
const keyframes = kf({
  '0%': {
    borderColor: 'red',
    display: 'flex',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from 'stlx';
import { keyframes as kf } from 'stlx';
const styles = stylex.create({
  foo: {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex',
    position: 'absolute',
  },
});
const keyframes = kf({
  '0%': {
    alignItems: 'center',
    borderColor: 'red',
    display: 'flex',
  },
});
`,
    options: { validImports: ['stlx'] },
  },
  {
    description: 'should sort line separated groups',
    input: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    position: 'absolute',
    display: 'flex',

    borderColor: 'red',
    alignItems: 'center',
  },
});
`,
    output: `import stylex from '@stylexjs/stylex';
const styles = stylex.create({
  foo: {
    display: 'flex',
    position: 'absolute',

    alignItems: 'center',
    borderColor: 'red',
  },
});
`,
    options: { allowLineSeparatedGroups: true },
  },
  {
    description: 'should sort keys separated by spread element',
    input: `import { create as cr } from '@stylexjs/stylex';
const props = { padding: '10px' };
const styles = cr({
  foo: {
    display: 'flex',
    alignItems: 'center',
    ...props,
    position: 'absolute',
    borderColor: 'red',
  },
});
`,
    output: `import { create as cr } from '@stylexjs/stylex';
const props = { padding: '10px' };
const styles = cr({
  foo: {
    alignItems: 'center',
    display: 'flex',
    ...props,
    borderColor: 'red',
    position: 'absolute',
  },
});
`,
    only: true,
  },
];

describe('prettier-plugin-stylex-key-sort', () => {
  for (const { description, input, output, options, only } of TEST_CASES) {
    const testFn = only ? it.only : it;

    testFn(description, async () => {
      const code = await format(input, options);

      expect(code).toEqual(output);
    });
  }
});
