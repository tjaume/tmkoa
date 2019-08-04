import { middlewareRegisterMetadata } from '../container';
import { MiddlewareOption } from '../interfaces/MiddlewareOption';

export function Middleware(options?: MiddlewareOption) {
    return (target: Function) => {
        options = options || ({} as any);
        target.prototype.exclude = options.exclude;
        middlewareRegisterMetadata.set(target, target);
    };
}
