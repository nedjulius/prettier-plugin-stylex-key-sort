import { create as cr } from '@stylexjs/stylex';
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
