import server from 'koa-static';
import Toa from '../../index';

export function staticServer(toa: Toa) {
    if (toa.CONFIG.staticDir) {
        toa.use(server(toa.CONFIG.staticDir));
    }
}
