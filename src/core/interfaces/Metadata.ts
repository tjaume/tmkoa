export enum HttpMethod {
    Get = 'get',
    Post = 'post',
    Delete = 'delete',
    Put = 'put',
    Patch = 'patch',
    Options = 'options',
    Head = 'head',
}

export interface MiddlewareCall {
    (ctx: any, next: () => Promise<any>): any;
}

export interface ControllerMetadata {
    prefix: string;
    actions?: ActionMetadata[];
}

export interface ActionMetadata {
    route: string | RegExp;
    target: Function;
    method: HttpMethod | string;
    middlewares?: MiddlewareCall[];
    name: string;
}

export interface MiddlewareMetadata {
    target: MiddlewareCall;
    exclude: Array<string>;
}
