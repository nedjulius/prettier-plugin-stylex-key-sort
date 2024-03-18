import stylex from 'stlx';
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
