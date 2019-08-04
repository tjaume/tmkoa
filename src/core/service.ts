import Toa from '../index';
import { DBService } from './services/DbService';
import { serviceInstanceContainer } from './container';

export async function initCommonService(toa: Toa) {
    if (toa.CONFIG.dbConfig) {
        const dbService = new DBService(toa.CONFIG.dbConfig);
        await dbService._init();
        console.log('db init success');
        serviceInstanceContainer.set(DBService, dbService);
    }
}
