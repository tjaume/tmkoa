import { Type } from '../interfaces/Type';
import { ConnectionOptions } from 'typeorm';
import bodyParser from 'koa-bodyparser';

export interface AppOption {
    name?: string;
    env?: string;
    notListen?: boolean;
    viewDir?: string;
    staticDir?: string;
    port?: number;
    controllerDir?: string;
    middlewares?: Array<Type<any>>;
    catchException?: Type<any>;
    interceptor?: Type<any>;
    dbConfig?: ConnectionOptions;
    bodyParserOptions?: bodyParser.Options;
}
