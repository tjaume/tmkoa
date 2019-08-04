import { catchExceptionRegisterMetadata } from '../container';

export function Catch(): Function {
    return (target: Function) => {
        catchExceptionRegisterMetadata.set(target, target);
    };
}
