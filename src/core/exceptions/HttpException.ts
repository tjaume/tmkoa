export class HttpException {
    code: number;
    msg: string;
    constructor(msg: string, code: number) {
        this.code = code;
        this.msg = msg;
    }
}
