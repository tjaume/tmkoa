import { serviceRegisterMetadata } from '../container';

export function Service(): Function {
    return (target: Function) => {
        serviceRegisterMetadata.set(target, target);
    };
}
