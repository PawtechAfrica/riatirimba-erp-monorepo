import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env variables

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.REPORTING_DB_USER,
    password: process.env.REPORTING_DB_PASSWORD,
    database: process.env.REPORTING_DB_NAME,
    entities: ['src/**/*.entity.ts', 'dist/**/*.entity.js'], // Use JS files in dist for the CLI
    migrations: [
        // 'dist/database/migrations/*.js',
        'src/database/migrations/*.ts',
    ],
    synchronize: false, // NEVER set this to true in production
});
