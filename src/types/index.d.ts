import './context';
import Koa from 'koa';
import { AppOption } from '../core/interfaces/AppOption';
export default class Toa extends Koa {
    name: string;
    env: string;
    CONFIG: AppOption;
    constructor();
    private init;
    private start;
    run(options: AppOption, ownInit?: Function): Promise<void>;
    private _onErrorHandler;
}

export * from '../core';
