import { PoolClient } from 'pg';
declare class DatabaseServiceClass {
    private pool;
    private db;
    private config;
    constructor();
    initialize(): Promise<void>;
    private createSchema;
    private insertSampleData;
    getClient(): Promise<PoolClient>;
    getDrizzleInstance(): any;
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
    close(): Promise<void>;
}
export declare const DatabaseService: DatabaseServiceClass;
export {};
//# sourceMappingURL=database.d.ts.map