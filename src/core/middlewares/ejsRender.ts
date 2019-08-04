import Toa from '../../index';
import render from 'koa-ejs';

export function ejxRender(toa: Toa) {
    render(toa, {
        root: toa.CONFIG.viewDir,
        layout: 'template',
        viewExt: 'html',
        cache: true,
    });
}
