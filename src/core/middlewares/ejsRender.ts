import Toa from '../../index';
import render from 'koa-ejs';

export function ejxRender(toa: Toa) {
    if (toa.CONFIG.viewDir) {
        render(toa, {
            root: toa.CONFIG.viewDir,
            layout: false,
            viewExt: 'html',
            cache: true,
        });
    }
}
