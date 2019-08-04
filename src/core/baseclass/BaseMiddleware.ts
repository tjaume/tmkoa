import Koa from 'koa';

export interface BaseMiddleware {
    use(ctx: Koa.Context, next: Function): void;
}
