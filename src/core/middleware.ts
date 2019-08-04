import Toa from '../index';
import Koa from 'koa';
import componse from 'koa-compose';
import { collectMiddleware } from './container';
import pathToRegexp from 'path-to-regexp';
import {
    bodyParser,
    ejxRender,
    helmet,
    koaLogger,
    unifyQuery,
    staticServer,
} from './middlewares';

export function initCommonMiddleware(toa: Toa) {
    koaLogger(toa);
    helmet(toa);
    bodyParser(toa);
    unifyQuery(toa);
    ejxRender(toa);
    staticServer(toa);
}

/**
 * 初始化自定义中间件
 * @param toa application object
 */
export function initCustomeMiddleware(toa: Toa) {
    const middlewareMetadataStorage = collectMiddleware(toa);
    const midllewares = [];
    for (let index = 0; index < middlewareMetadataStorage.length; index++) {
        const middlewareMetadata = middlewareMetadataStorage[index];
        midllewares.push((ctx: Koa.Context, next: Function) => {
            if (!middlewareMetadata.exclude) {
                return middlewareMetadata.target(ctx, next as any);
            }
            const keys = [],
                options = { end: false, sensitive: false, strict: false };
            const excludesRegexpArr = (middlewareMetadata.exclude || []).map(
                exclude => {
                    return pathToRegexp(exclude, keys, options);
                },
            );
            const excluded = excludesRegexpArr.some(exReg => {
                return exReg.test(ctx.path);
            });
            if (excluded) {
                return next();
            } else {
                return middlewareMetadata.target(ctx, next as any);
            }
        });
    }
    const m = componse(midllewares as any);
    toa.use(m);
}
