import { initMigrations } from './src/db/database';
import { cronjobService } from './src/di-container';

await initMigrations();

cronjobService.setup();
