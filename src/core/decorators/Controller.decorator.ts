import { HttpMethod, MiddlewareCall } from '../interfaces/Metadata';
import { controllerRegisterMetadata } from '../container';

function normalizePath(path: string) {
    if (!path) return '';
    if (!path.startsWith('/')) {
        path = `/${path}`;
    }
    return path;
}

function BaseMethod(
    route: string,
    method: HttpMethod,
    middlewareArr: Array<MiddlewareCall>,
) {
    return (target: Function, name: string) => {
        const controller = target.constructor.prototype; // ?
        if (!controller.actions) {
            controller.actions = [];
        }
        controller.actions.push({
            method,
            name,
            target: target[name],
            route: normalizePath(route),
            middlewares: middlewareArr,
        });
    };
}

export function Controller(prefix: string = ''): Function {
    return (target: Function) => {
        target.prototype.prefix = normalizePath(prefix);
        controllerRegisterMetadata.set(target, target);
    };
}

export function Get(
    route: string,
    ...middlewares: Array<MiddlewareCall>
): Function {
    return BaseMethod(route, HttpMethod.Get, middlewares);
}
export function Post(
    route: string,
    ...middleware: Array<MiddlewareCall>
): Function {
    return BaseMethod(route, HttpMethod.Post, middleware);
}
export function Put(
    route: string,
    ...middleware: Array<MiddlewareCall>
): Function {
    return BaseMethod(route, HttpMethod.Put, middleware);
}
export function Patch(
    route: string,
    ...middleware: Array<MiddlewareCall>
): Function {
    return BaseMethod(route, HttpMethod.Patch, middleware);
}
export function Delete(
    route: string,
    ...middleware: Array<MiddlewareCall>
): Function {
    return BaseMethod(route, HttpMethod.Delete, middleware);
}
