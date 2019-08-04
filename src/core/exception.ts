import Toa from '../index';
import Koa from 'koa';
import { HttpException } from './exceptions/HttpException';
import { HttpStatus } from './exceptions/HttpStatus';
import { collectCatchExceptionFilter } from './container';

export function initHttpExceptionHanlder(toa: Toa) {
    let exceptionHandler = collectCatchExceptionFilter(toa);
    toa.use((ctx: Koa.Context, next: () => Promise<void>) => {
        return next().catch((e: Error) => {
            if (e instanceof HttpException) {
                exceptionHandler =
                    exceptionHandler || defaultHttpExceptionHander;
                return exceptionHandler(e, ctx);
            } else {
                ctx.body = {
                    code: HttpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Internal server error',
                };
            }
        });
    });
}

function defaultHttpExceptionHander(
    exception: HttpException,
    ctx: Koa.Context,
) {
    ctx.body = {
        code: exception.code,
        msg: exception.msg,
    };
}
