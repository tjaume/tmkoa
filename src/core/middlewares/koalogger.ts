import Toa from '../../index';
import logger from 'koa-logger';

export function koaLogger(toa: Toa) {
    toa.use(logger());
}
