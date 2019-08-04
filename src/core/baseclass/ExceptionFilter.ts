import Koa from 'koa';
import { HttpException } from '../exceptions/HttpException';

export interface ExceptionFilter {
    catch(exception: HttpException, ctx: Koa.Context): void;
}
