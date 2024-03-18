import { create as cr } from '@stylexjs/stylex';
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
