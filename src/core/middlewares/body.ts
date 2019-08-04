import bodyParse from 'koa-bodyparser';
import Toa from '../../index';

export function bodyParser(toa: Toa) {
    let options = toa.CONFIG.bodyParserOptions || {
        formLimit: '1mb',
    };
    toa.use(bodyParse(options));
}
