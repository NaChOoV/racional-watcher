import { drizzle } from 'drizzle-orm/libsql';

import { migrate } from 'drizzle-orm/libsql/migrator';
import EnvConfig from '../config/enviroments';

const db = drizzle({
    connection: {
        url: EnvConfig.databaseUrl,
        authToken: EnvConfig.databaseToken,
    },
});

const initMigrations = async () => {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Success Database Migration...');
};

export { db, initMigrations };
