import Toa from '../index';
import path from 'path';
import 'reflect-metadata';
import Glob from 'glob';
import { MiddlewareMetadata, ControllerMetadata } from './interfaces/Metadata';
import { ExceptionFilter } from './baseclass/ExceptionFilter';
import { ToaInterceptor } from './baseclass/ToaInterceptor';
import { BaseController } from './baseclass/BaseController';
import { BaseService } from './baseclass/BaseService';
import { CommonService } from './services/CommonService';

// 收集元数据
export const serviceRegisterMetadata: Map<Function, Function> = new Map();
export const controllerRegisterMetadata: Map<Function, Function> = new Map();
export const middlewareRegisterMetadata: Map<Function, Function> = new Map();
export const catchExceptionRegisterMetadata: Map<
    Function,
    Function
> = new Map();
export const interceptorRegisterMetadata: Map<Function, Function> = new Map();

// 服务实例容器
export const serviceInstanceContainer: Map<Function, any> = new Map();
export const interceptorInstanceContainer: Map<Function, any> = new Map();

const _dir = process.cwd();

function validInjectedService<T>(
    containerConstructor: {
        new (...args: Array<any>): T;
    },
    injectServiceConstructor: Function,
    injectIndex: number,
    serviceMap: Map<Function, Function>,
) {
    if (!injectServiceConstructor) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        // 如果出现循环注入，那么元数据获取循环注入的类型为 null
        throw new Error(`服务被循环注入`);
    }
    // 注入的实例类型本自身类型
    if (injectServiceConstructor === containerConstructor) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        throw new Error(`服务不能注入自身`);
    }
    const _injectServicePrototype = injectServiceConstructor.prototype;
    const isCommonService = _injectServicePrototype instanceof CommonService;
    // 注入的类型不是公共服务类型，且没有继承 baseService
    if (!(_injectServicePrototype instanceof BaseService) && !isCommonService) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        throw new Error('服务必须要继承 BaseService');
    }
    // 注入的类型是公共服务类型，当时没有进行初始化（未设置 app 启动配置）
    if (
        isCommonService &&
        !serviceInstanceContainer.has(injectServiceConstructor)
    ) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        throw new Error('公共服务必须先进行配置');
    }
    // 注入的类型不是公共服务类型，但是没有被 @Service 修饰
    if (
        !serviceRegisterMetadata.has(injectServiceConstructor) &&
        !isCommonService
    ) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        throw new Error(`服务类型必须使用装饰 @Service 修饰`);
    }
    // 服务出现循环注入
    if (serviceMap.has(injectServiceConstructor)) {
        console.error(
            `container:[${containerConstructor.name}]`,
            `inject type: [${injectServiceConstructor.name}]`,
            `params index: ${injectIndex}`,
        );
        throw new Error(`服务被循环注入`);
    }
    return true;
}

function createService<T>(
    serviceConstructor: {
        new (...args: Array<any>): T;
    },
    serviceMap: Map<Function, Function>,
) {
    let injectDependServiceTypes: Array<Function> = Reflect.getMetadata(
        'design:paramtypes',
        serviceConstructor,
    );
    let injectServiceInstance = [];
    if (injectDependServiceTypes && injectDependServiceTypes.length) {
        injectServiceInstance = injectDependServiceTypes.map(
            (injectServiceType, index) => {
                // 验证 injectServiceType 是否符合规定
                validInjectedService(
                    serviceConstructor,
                    injectServiceType,
                    index,
                    serviceMap,
                );
                if (serviceInstanceContainer.has(injectServiceType)) {
                    return serviceInstanceContainer.get(injectServiceType);
                }
                return createService(injectServiceType as any, serviceMap);
            },
        );
    }
    const serviceInstance = new serviceConstructor(...injectServiceInstance);
    // 标记该 controller 为入口所有注入的实例类型
    serviceMap.set(serviceConstructor, serviceConstructor);
    serviceInstanceContainer.set(serviceConstructor, serviceInstance);
    return serviceInstance;
}

function createController<T>(controllerConstructor: {
    new (...args: Array<any>): T;
}) {
    if (!(controllerConstructor.prototype instanceof BaseController)) {
        throw new Error(
            `控制器:[${controllerConstructor.name}]必须要继承 BaseController`,
        );
    }
    if (!controllerRegisterMetadata.has(controllerConstructor)) {
        throw new Error(
            `控制器:[${
                controllerConstructor.name
            }]必须使用装饰 @Controller 修饰`,
        );
    }
    let injectServiceTypes: Array<Function> = Reflect.getMetadata(
        'design:paramtypes',
        controllerConstructor,
    );
    const serviceMap = new Map<Function, Function>();
    let serviceInstances = [];
    if (injectServiceTypes && injectServiceTypes.length) {
        serviceInstances = injectServiceTypes.map(
            (injectServiceType, injectIndex) => {
                // 验证 injectServiceType 是否符合规定
                validInjectedService(
                    controllerConstructor,
                    injectServiceType,
                    injectIndex,
                    serviceMap,
                );
                return createService(injectServiceType as any, serviceMap);
            },
        );
    }

    const injectInstance = new controllerConstructor(...serviceInstances);
    return injectInstance;
}

/**
 *  // 收集 controller
 * @param app
 */
export function collectController(app: Toa) {
    const controllers: Array<ControllerMetadata> = [];
    const controllerDir =
        path.resolve(app.CONFIG.controllerDir, './**/*.controller.*') ||
        path.resolve(_dir, './src/controller/**/*.controller.*');
    Glob.sync(controllerDir).forEach((controllerFile: string) => {
        if (/\.controller.(js|ts)$/i.test(controllerFile)) {
            const controllerConstructor = require(controllerFile).default;
            const control = createController(controllerConstructor);
            controllers.push(control as any);
        }
    });
    return controllers;
}

export function collectMiddleware(app: Toa) {
    const middlewares: Array<MiddlewareMetadata> = [];
    const injectMiddlewares = app.CONFIG.middlewares;
    if (injectMiddlewares && injectMiddlewares.length) {
        for (let index = 0; index < injectMiddlewares.length; index++) {
            const middlewareConstructor = injectMiddlewares[index];
            const middleware = new middlewareConstructor();
            if (!middleware.use) {
                throw new Error(
                    `中间件middleware:[${
                        middlewareConstructor.name
                    }] 必须实现接口 BaseMiddleware`,
                );
            }
            if (!middlewareRegisterMetadata.has(middlewareConstructor)) {
                throw new Error(
                    `中间件middleware:[${
                        middlewareConstructor.name
                    }]必须使用 @Middleware 装饰器`,
                );
            }
            middlewares.push({
                exclude: middleware.exclude,
                target: middleware.use.bind(middleware),
            });
        }
    }
    return middlewares;
}

export function collectCatchExceptionFilter(app: Toa) {
    if (app.CONFIG.catchException) {
        const catchExceptionFilter = app.CONFIG.catchException;
        const catchException = new catchExceptionFilter() as ExceptionFilter;
        if (!catchException.catch) {
            throw new Error(
                `异常过滤器:[${
                    catchExceptionFilter.name
                }] 必须实现接口 ExceptionFilter`,
            );
        }
        if (!catchExceptionRegisterMetadata.has(catchExceptionFilter)) {
            throw new Error(
                `异常过滤器:[${
                    catchExceptionFilter.name
                }]必须使用 @Catch 装饰器`,
            );
        }
        return catchException.catch;
    }
    return null;
}

export function collectInterceptor(app: Toa) {
    let interceptor: ToaInterceptor = null;
    if (app.CONFIG.interceptor) {
        const interceptorConstructor = app.CONFIG.interceptor;
        if (interceptorInstanceContainer.has(interceptorConstructor)) {
            interceptor = interceptorInstanceContainer.get(
                interceptorConstructor,
            );
        } else {
            interceptor = new interceptorConstructor() as ToaInterceptor;
            interceptorInstanceContainer.set(
                interceptorConstructor,
                interceptor,
            );
        }
        if (!(interceptor.request && interceptor.response)) {
            throw new Error(
                `拦截器:[${
                    interceptorConstructor.name
                }] 必须实现接口 ToaInterceptor`,
            );
        }
        if (!interceptorRegisterMetadata.has(interceptorConstructor)) {
            throw new Error(
                `拦截器:[${
                    interceptorConstructor.name
                }]必须使用 @Interceptor 装饰器`,
            );
        }
    }
    return interceptor;
}
