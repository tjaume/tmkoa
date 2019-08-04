import Toa from '../../index';
import koahelmet from 'koa-helmet';

export function helmet(toa: Toa) {
    toa.use(koahelmet());
}
