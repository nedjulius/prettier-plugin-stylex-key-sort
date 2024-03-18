import stylex from '@stylexjs/stylex';
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
