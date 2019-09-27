import './context';
import Koa from 'koa';
import { AppOption } from '../core/interfaces/AppOption';
declare class Toa extends Koa {
    name: string;
    env: string;
    CONFIG: AppOption;
    constructor();
    private init;
    private start;
    run(options: AppOption, ownInit?: Function): Promise<void>;
    private _onErrorHandler;
}

declare namespace Toa {
    interface Context extends Koa.Context {
        render(view: string, _context: Object): void;
    }
}

export default Toa;

export * from '../core';
