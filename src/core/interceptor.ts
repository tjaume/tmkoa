import Toa from '../index';
import Koa from 'koa';
import { collectInterceptor } from './container';

export function initRequestInterceptor(toa: Toa) {
    const interceptor = collectInterceptor(toa);
    if (interceptor) {
        toa.use((ctx: Koa.Context, next: Function) => {
            interceptor.request(ctx);
            return next();
        });
    }
}

export function initResponseInterceptor(toa: Toa) {
    const interceptor = collectInterceptor(toa);
    if (interceptor) {
        toa.use((ctx: Koa.Context, next: Function) => {
            interceptor.response(ctx);
            return next();
        });
    }
}
