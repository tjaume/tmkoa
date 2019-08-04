export interface ToaContext {
    render(view: string, _context: Object): void;
}
declare module 'koa' {
    export interface Context extends ToaContext {}
}
