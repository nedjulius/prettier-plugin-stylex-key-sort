import * as prettier from 'prettier';
import * as stylexKeySortPlugin from '../src/index';

async function format(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: 'babel',
    plugins: [stylexKeySortPlugin],
  });
}

test('prettier-plugin-stylex-key-sort', () => {
  describe('should correctly sort regular stylex.create arguments', async () => {
    const code = `
      import stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          display: 'flex',
          borderColor: 'red',
          alignItems: 'center',
        },
      });
    `;

    const res = await format(code);

    expect(res).toEqual(`
      import stylex from '@stylexjs/stylex';
      const styles = stylex.create({
        foo: {
          alignItems: 'center',
          borderColor: 'red',
          display: 'flex',
        },
      });
    `);
  });
});
