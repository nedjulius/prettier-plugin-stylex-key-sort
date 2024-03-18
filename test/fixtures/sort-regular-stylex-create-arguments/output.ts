import stylex from '@stylexjs/stylex';
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
