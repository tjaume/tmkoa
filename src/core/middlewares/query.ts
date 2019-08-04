import Toa from '../../index';
import Koa from 'koa';

export function unifyQuery(toa: Toa) {
    toa.use(async (ctx: Koa.Context, next: Function) => {
        Object.assign(ctx.query, ctx.request.body);
        return next();
    });
}
