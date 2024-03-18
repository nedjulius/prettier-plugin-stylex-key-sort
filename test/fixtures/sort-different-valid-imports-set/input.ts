import stylex from 'stlx';
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
