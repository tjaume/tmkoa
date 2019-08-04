import { CommonService } from './CommonService';
import { ConnectionOptions, createConnection, Connection } from 'typeorm';

export class DBService extends CommonService {
    public connection: Connection = null;
    private _config: ConnectionOptions = null;
    constructor(config?: ConnectionOptions) {
        super();
        this._config = config;
    }
    async _init() {
        this.connection = await createConnection(this._config);
    }
    public getRepository<T>(model: { new (...args: Array<any>): T }) {
        return this.connection.getRepository<T>(model);
    }
}
