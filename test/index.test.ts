import { format as prettierFormat } from 'prettier';
import * as stylexKeySortPlugin from '../src/index';

async function format(code: string): Promise<string> {
  return await prettierFormat(code, {
    parser: 'babel',
    plugins: [stylexKeySortPlugin],
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
    input: `
      import stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          display: 'flex',
          borderColor: 'red',
          alignItems: 'center',
        },
      });
    `,
    output: `
      import stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          alignItems: 'center',
          borderColor: 'red',
          display: 'flex',
        },
      });
    `,
  },
];

describe('prettier-plugin-stylex-key-sort', () => {
  for (const { description, input, output } of TEST_CASES) {
    it(description, async () => {
      expect(await format(input)).toEqual(output);
    });
  }
});
