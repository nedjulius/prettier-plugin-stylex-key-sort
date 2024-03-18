import { Options, format as prettierFormat } from 'prettier';
import * as stylexKeySortPlugin from '../src/index';
import prettierConfig from '../.prettierrc.json';
import { join } from 'path';
import { readdirSync, readFileSync, existsSync } from 'fs';

describe('prettier-plugin-stylex-key-sort', () => {
  const fixtures = join(__dirname, 'fixtures');
  readdirSync(fixtures).forEach((testName) => {
    const testCaseDir = join(fixtures, testName);

    const input = readFileSync(join(testCaseDir, 'input.ts')).toString();
    const expectedOutput = readFileSync(
      join(testCaseDir, 'output.ts'),
    ).toString();

    const optionsPath = join(testCaseDir, 'options.json');
    const options = existsSync(optionsPath)
      ? JSON.parse(readFileSync(optionsPath).toString())
      : {};

    const testFn = getTestFn(options);

    testFn(testName, async () => {
      const output = await prettierFormat(input, {
        parser: 'babel',
        plugins: [stylexKeySortPlugin],
        ...(prettierConfig as Partial<Options>),
        ...options,
      });

      expect(output).toEqual(expectedOutput);
    });
  });
});

function getTestFn(options: Partial<{ skip: boolean; only: boolean }>) {
  if (options.skip) {
    return it.skip;
  }

  if (options.only) {
    return it.only;
  }

  return it;
}
