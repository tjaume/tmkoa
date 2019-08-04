import Koa from 'koa';
import { initRouter } from './core/router';
import { initCommonService } from './core/service';
import { initCommonMiddleware, initCustomeMiddleware } from './core/middleware';
import { AppOption } from './core/interfaces/AppOption';
import { initHttpExceptionHanlder } from './core/exception';
import {
    initRequestInterceptor,
    initResponseInterceptor,
} from './core/interceptor';

export default class Toa extends Koa {
    name: string;
    env: string;
    CONFIG: AppOption;
    constructor() {
        super();
        this.CONFIG = {
            port: 8080,
            env: process.env.NODE_ENV || 'development',
            name: 'toa-server',
            notListen: false,
        };
    }

    /**
     * server 初始化配置、统一中间件、错误注册
     * @param options app配置
     */
    private async init(options: AppOption, ownInit?: Function) {
        try {
            options = options || ({} as any);
            // 合并配置
            this.CONFIG = Object.assign({}, this.CONFIG, options);
            this.name = this.CONFIG.name;
            this.env = this.CONFIG.env;
            this.proxy = true;
            // 注册错误处理回调
            this.on('error', (e, ctx: Koa.Context) => {
                ctx.logger && ctx.logger.error(e);
                console.log(e);
            });
            // 初始化 http exception 处理
            initHttpExceptionHanlder(this);
            // 初始化 request 拦截器
            initRequestInterceptor(this);
            // 初始化公共服务
            await initCommonService(this);
            //初始化内置中间件
            initCommonMiddleware(this);
            // 挂载自定义 middlerware
            initCustomeMiddleware(this);
            // 挂载自定义 router
            initRouter(this);
            // 初始化自定义异步事件
            if (ownInit) {
                await ownInit();
            }
            // 初始化 response 拦截器
            initResponseInterceptor(this);
        } catch (e) {
            this._onErrorHandler(e);
        }
    }

    private async start() {
        try {
            const port = this.CONFIG.port;
            if (!this.CONFIG.notListen) {
                this.listen(port);
            }
            console.log('Server start listen ' + port + ' success!');
        } catch (e) {
            this._onErrorHandler(e);
        }
    }

    async run(options: AppOption, ownInit?: Function) {
        try {
            await this.init(options, ownInit);
            await this.start();
        } catch (e) {
            this._onErrorHandler(e);
        }
    }

    private _onErrorHandler(e: Error) {
        console.log(e);
        process.exit(1);
    }
}

export * from './core';
