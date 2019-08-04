import { interceptorRegisterMetadata } from '../container';

export function Interceptor(): Function {
    return (target: Function) => {
        interceptorRegisterMetadata.set(target, target);
    };
}
