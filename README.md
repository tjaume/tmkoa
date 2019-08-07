# tmkoa

[toc]

## 简介

最近在学习 `nestjs` 框架，其面向对象的思想，完美支持 TypeScript，以及基于依赖注入的方式实现业务与框架解耦，均是笔者比较青睐的服务端框架特性，但是 `nestjs` 底层是封装了 `express` http 框架，而笔者目前的技术栈使用 `koa`，两者之间对于中间件等一些功能还是有区别的。因此笔者采用 `koa` http 框架，模仿 `nestjs` 的特性（形似神不似），开发了 `mtkoa`，采用 TypeScript 进行开发，同时去除 `nestjs` 对于模块的概念，使其变的精简，又满足中小型服务端程序的需求，主要包括以下 6 部分内容。

1. 路由
2. 控制器
3. 服务
4. 中间件
5. 异常处理
6. 拦截器

示例请参考 [tmkoa-demo](https://github.com/tjaume/tmkoa-demo)

nestjs 文档参考：https://nestjs.com/

安装：

```bash
yarn add tmkoa
# or
npm install tmkoa
```

> 确保机器上的 node 版本 >=8.9.0

## 快速开始

项目结构如下：

```
src
    index.ts
    controller
        hello.controller.ts
tsconfig.json
package.json
```

1. tsconfig.json

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "removeComments": true,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "target": "esnext",
        "sourceMap": true,
        "outDir": "./dist/",
        "baseUrl": "./",
        "incremental": true
    },
    "exclude": ["node_modules"]
}
```

2. package.json

```json
{
    "scripts": {
        "dev": "ts-node ./src/index.ts",
        "build": "tsc",
        "run:prod": "tsc && node ./dist/index.js"
    },
    "dependencies": {
        "koa": "^2.7.0",
        "tmkoa": "^1.0.1"
    },
    "devDependencies": {
        "@types/koa": "^2.0.49",
        "ts-node": "^8.3.0",
        "typescript": "^3.5.3"
    }
}
```

3. /src/index.ts

```ts
import Toa from 'tmkoa';
import { AppOption } from 'tmkoa';
import path from 'path';

async function main() {
    const toa = new Toa();
    const appConfig: AppOption = {
        name: 'tmkoa-server',
        controllerDir: path.resolve(__dirname, './controller'),
    };
    toa.run(appConfig);
}

main();
```

4. /src/controller/hello.controller.ts

```ts
import { BaseController, Controller, Get } from 'tmkoa';
import Koa from 'koa';

@Controller('hello')
export default class HelloController extends BaseController {
    @Get('ask')
    getAsk() {
        return {
            code: 200,
            msg: 'ask a question',
            data: true,
        };
    }
}
```

安装依赖：

```bash
yarn
# or
npm install
```

启动服务：

```bash
yarn dev
# or
npm run dev
```

浏览器访问： localhost:3000/hello/ask

```json
{
    "code": 200,
    "msg": "ask a question",
    "data": true
}
```

需要注意的点：

1. 默认端口为：3000，可以通过 `AppOption.port` 进行更改
2. 需指定 controller 的目录，且 controller 文件必须以 `controller.ts 或者 controller.js` 结尾，才能被框架加载。

`AppOption` 的配置如下：

```ts
export interface AppOption {
    name?: string; //
    env?: string; // 环境
    notListen?: boolean; // 是否框架开启服务监听
    viewDir?: string; // ejs 模版目录
    staticDir?: string; // 静态资源目录
    port?: number; // 端口
    controllerDir?: string; // 控制器目录
    middlewares?: Array<Type<any>>; // 中间件
    catchException?: Type<any>; // 异常过滤器
    interceptor?: Type<any>; // 拦截器
    dbConfig?: ConnectionOptions; // typeorm 数据库配置
    bodyParserOptions?: bodyParser.Options; // body 解析可选项
}
```

## 路由

路由均是通过装饰器限定的，装饰器与 `koa-router` 提供的方法一致。

1. Get
2. Post
3. Put
4. Patch
5. Delete

路由模式同样与 `koa-router` 保持一致。

## 控制器

控制层负责处理传入的请求, 并返回对客户端的响应。实现一个控制器类必须要满足如下要求：

1. 控制器类必须采用 `Controller` 装饰器修饰
2. 控制器必须继承 `BaseController` 类型
3. 控制器文件必须有一个默认导出，且文件名以 `controller.ts` 或者 `controller.js` 结尾

`Controller` 装饰器方式提供一个额外的参数：`prefix`，即路由前缀，与 `koa-router` 一致。

example:

```ts
// src/hello.controller.ts

import { BaseController, Controller, Get } from 'tmkoa';
import HelloService from '../service/hello.service';
import Koa from 'koa';

@Controller('hello')
export default class HelloController extends BaseController {
    @Get('ask')
    getAsk() {
        return {
            code: 200,
            msg: 'ask a question',
            data: true,
        };
    }
}
```

在 controller 类中，每个处理请求的方法，可以带一个额外的参数，即请求的上下文 `ctx`，类型为 `Koa.Context`，通过该参数可以获取请求的相关数据。

controller 类不仅能返回 ajax 接口，还能返回一个 html 文档，框架支持 `ejs` 模版渲染，扩展类型为 html，渲染方法 `render` 挂载在 `ctx` 上。在使用 `ejs` 模版时，需要在 app 的配置中设置模版的路径，字段为 `viewDir`。

```ts
// 在 AppOption 配置中添加模版设置
const appConfig: AppOption = {
    name: 'tmkoa-server',
    controllerDir: path.resolve(__dirname, './controller'),
    viewDir: path.resolve(__dirname, './view'),
};
```

view 目录中包含一个 index.html 文件。

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title><%= title %></title>
    </head>
    <body>
        <%= msg %>
    </body>
</html>
```

controller 类如下：

```ts
// src/controller/html/home.controller.ts
import { BaseController, Controller, Get } from 'tmkoa';
import Koa from 'koa';

@Controller('home')
export default class HelloController extends BaseController {
    @Get('index')
    getIndex(ctx: Koa.Context) {
        return ctx.render('index', {
            title: 'tmkoa',
            msg: 'hello world',
        });
    }
}
```

路由 `/home/index` 将返回一个 html 文档。

## 服务

一般来说，处理请求的方法会调用一个服务去读取数据、处理数据逻辑等，因此框架提供服务层的概念，服务分为自定义服务与内置服务。

### 自定义服务

每个自定义服务类都必须满足如下要求：

1. 必须被 `Service` 装饰器修饰
2. 必须继承 `BaseService` 类

example: 为 hello.controller 提供一个服务

```ts
// src/service/hello.service.ts
import { BaseService, Service } from 'tmkoa';

@Service()
export default class HelloService extends BaseService {
    getGreetString(name: string) {
        return `hello ${name || 'tjuame'}`;
    }
}
```

然后将这个服务类通过构造模式注入到 `hello.controller` 中即可。

```ts
// src/hello.controller.ts

import { BaseController, Controller, Get } from 'tmkoa';
import HelloService from '../service/hello.service';
import Koa from 'koa';

@Controller('hello')
export default class HelloController extends BaseController {
    constructor(protected helloService: HelloService) {
        super();
    }
    @Get('ask')
    getAsk() {
        return {
            code: 200,
            msg: 'ask a question',
            data: true,
        };
    }

    @Get('/greet')
    getGreetString(ctx: Koa.Context) {
        const { name } = ctx.query;
        return {
            code: 200,
            msg: this.helloService.getGreetString(name),
            data: true,
        };
    }
}
```

服务除了可以注入到控制器中外，还能注入到其他服务中，即服务依赖服务。

### 内置服务

目前内置服务主要包括数据库服务: `DBService`。

可以直接在服务或者控制器中注入该服务类型，在注入前必须在 `AppOption.dbConfig` 中设置数据库的配置，tmkoa 内使用 [typeorm](https://typeorm.io/) 数据库框架，`AppOption.dbConfig` 为 `ConnectionOptions` 类型，只要设置了数据库的配置，即可使用 `DBService` 内置服务，该类提供如下方法：

```ts
import { ConnectionOptions, Connection } from 'typeorm';
export declare class DBService extends CommonService {
    connection: Connection;
    getRepository<T>(model: {
        new (...args: Array<any>): T;
    }): import('typeorm').Repository<T>;
}
```

## 中间件

### 自定义中间件

tmkoa 的中间与 `koa` 中间件保持一致，一个自定义中间件必须满足如下条件：

1. 必须被 `@Middleware` 装饰器修饰，该装饰器提供一个可选参数，支持 `exclude` 路由，默认为 `*`
2. 必须实现 `BaseMiddleware` 接口

example:

```ts
import { Middleware, BaseMiddleware } from 'tmkoa';
import Koa from 'koa';

@Middleware({
    exclude: ['/hello/default'],
})
export class AuthMiddleware implements BaseMiddleware {
    use(ctx: Koa.Context, next: Function): void {
        console.log('auth success');
        return next();
    }
}
```

编写完自定义中间件后，还需配置在 `AppOption.middlewares` 中，该字段为一个数组类型，支持多个中间件，中间件的加载顺序与数组中的顺序保持一致。

### 内置中间件

1. query
   query 中间件可以让 post 请求与 get 请求的参数都挂载在 `ctx.query` 上。其内部使用了`koa-bodyparser` 中间件。

2. koa-ejs
   渲染引擎，前文有提到过。

3. koa-helmet
4. koa-logger
5. koa-static
   静态资源服务，需要配置 `AppOption.staticDir`，设置静态资源的目录。

## 异常处理

框架内提供统一的异常类 `HttpException`，凡是抛出该类型的异常，均会被统一处理。类型构造函数需提供两个参数：msg、code。

example:

```ts
throw new HttpException('test error', HttpStatus.FORBIDDEN);
```

返回结果为：

```json
{
    "code": 403,
    "msg": "test error"
}
```

使用者还可以继承 `HttpException` 进行自定义扩展。

若放回的异常不是 `HttpException` 类型则统一对外返回：

```json
{
    "code": 500,
    "msg": "Internal server error"
}
```

### 异常过滤器

框架还提供异常过滤器，即对抛出的异常进行过滤，然后自定义返回。

异常过滤器必须满足如下条件：

1. 必须被 `Catch` 装饰器修饰
2. 必须实现 `ExceptionFilter` 接口

example：对错误状态为 `HttpStatus.FORBIDDEN` 实现自定义放回。

```ts
// src/exception/HttpException.filter.ts
import { Catch, ExceptionFilter, HttpStatus, HttpException } from 'tmkoa';
import Koa from 'koa';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, ctx: Koa.Context): void {
        if (exception.code === HttpStatus.FORBIDDEN) {
            ctx.body = {
                code: exception.code,
                message: 'FORBIDEN',
                data: null,
            };
        } else {
            ctx.body = {
                code: exception.code,
                message: exception.msg,
                data: null,
            };
        }
    }
}
```

定义好异常过滤器后，还需配置到 `AppOption.catchException` 中。

## 拦截器

框架提供拦截器，拦截器分为 `request` 与 `response`，一次 http 请求到达服务端，会执行 `request` 拦截器，在响应对应路由返回结果后，会调用 `response` 拦截器，然后再返回给客户端。因此，拦截器可以允许用户做一些自定义操作。

实现一个拦截器必须满足如下要求：

1. 必须使用 `Interceptor` 修饰
2. 必须实现 `ToaInterceptor` 接口

example:

```ts
import { Interceptor, ToaInterceptor } from 'tmkoa';
import Koa from 'koa';

@Interceptor()
export class LoggingInterceptor implements ToaInterceptor {
    request(ctx: Koa.Context): void {
        console.log(`before begin...`);
    }
    response(ctx: import('koa').Context): void {
        console.log(`after end...`);
    }
}
```

定义好异常过滤器后，还需配置到 `AppOption.interceptor` 中。

运行结果如下：

```
before begin...
  <-- GET /hello/default
after end...
```

## 结语

非常感谢 koa、nestjs、typeorm 等优秀的开源框架。
