import { Pool } from 'pg';
import { config } from './config.js';

const pool = new Pool({ connectionString: config.databaseUrl, max: 5 });
export default pool;
