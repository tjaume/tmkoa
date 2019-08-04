import Toa from '../index';
import Koa from 'koa';
import Router from 'koa-router';
import { collectController } from './container';

export function initRouter(app: Toa) {
    const controllerMetadataStorage = collectController(app);
    const router = new Router();
    controllerMetadataStorage.forEach(control => {
        const controllerRouter: any = new Router({
            prefix: control.prefix,
        });
        if (control.actions && control.actions.length) {
            control.actions.forEach(action => {
                const target: Function = control[action.name];
                if (action.middlewares && action.middlewares.length) {
                    controllerRouter[action.method](
                        action.route,
                        ...action.middlewares,
                        controllerContainer(target.bind(control)),
                    );
                } else {
                    controllerRouter[action.method](
                        action.route,
                        controllerContainer(target.bind(control)),
                    );
                }
            });
            router.use(
                controllerRouter.routes(),
                controllerRouter.allowedMethods(),
            );
        }
    });
    app.use(router.routes());
    app.use(router.allowedMethods());
}

function controllerContainer(
    action: (ctx: Koa.Context, next: Function) => Promise<any>,
) {
    return async (ctx: Koa.Context, next: Function) => {
        const r = await action(ctx, () => {});
        if (r) {
            ctx.body = r;
        }
        return next();
    };
}
