import Koa from 'koa';

export interface ToaInterceptor {
    request(ctx: Koa.Context): void;
    response(ctx: Koa.Context): void;
}
