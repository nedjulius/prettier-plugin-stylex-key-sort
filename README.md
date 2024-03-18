# prettier-plugin-stylex-key-sort

Prettier plugin that sorts StyleX keys according to StyleX [property priorities](https://github.com/facebook/stylex/blob/main/packages/shared/src/utils/property-priorities.js).

## Installation

`npm install --save-dev prettier-plugin-stylex-key-sort`

## Usage

### With `.prettierrc`

```json
{
  "plugins": ["prettier-plugin-stylex-key-sort"]
}
```

`npx prettier --write '**/*.{ts|js|tsx|jsx}'`

### Without config

`npx prettier --write '**/*.{ts|js|tsx|jsx}' --plugin=prettier-plugin-stylex-key-sort`

## Options

### minKeys

- Minimum number of keys required after which the sort is enforced
- **Default value**: `2`

```json
{
  "plugins": ["prettier-plugin-stylex-key-sort"],
  "minKeys": 2
}
```

### validImports

- Possible string from where you can import StyleX modules
- **Default value**: `["@stylexjs/stylex", "stylex"]`

```json
{
  "plugins": ["prettier-plugin-stylex-key-sort"],
  "validImports": ["stlx"]
}
```

## Contributing

- Any contributions are welcome
- Please open an issue if you encounter any bugs
- Make sure an issue exists before you create a pull request
- Act according to the code of conducting when contributing to the project
