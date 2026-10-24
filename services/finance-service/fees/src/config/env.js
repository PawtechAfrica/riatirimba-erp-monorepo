// // src/config/env.js
// // Loads and validates process.env once, at boot, using zod.
// // Everything else in the app should import `env` from here instead of
// // touching process.env directly.

// const path = require('path');
// require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// const { z } = require('zod');

// const boolFromString = z
//   .string()
//   .optional()
//   .transform((val) => val === 'true');

// const envSchema = z.object({
//   PORT: z.coerce.number().int().positive().default(4000),
//   NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

//   FEES_DB_HOST: z.string().min(1),
//   FEES_DB_PORT: z.coerce.number().int().positive().default(5432),
//   FEES_DB_NAME: z.string().min(1),
//   FEES_DB_USER: z.string().min(1),
//   FEES_DB_PASSWORD: z.string().default(''),
//   FEES_DB_DIALECT: z.enum(['postgres']).default('postgres'),
//   FEES_DB_SSL: boolFromString,
//   FEES_DB_LOGGING: boolFromString,
//   FEES_DB_SYNC: boolFromString,
//   FEES_DB_SYNC_ALTER: boolFromString,

//   JWT_SECRET: z.string().min(1),
//   JWT_ISSUER: z.string().optional(),

//   ACADEMICS_SERVICE_URL: z.string().url().optional(),
// });

// const parsed = envSchema.safeParse(process.env);

// if (!parsed.success) {
//   console.error('❌ Invalid/missing environment variables:');
//   console.error(parsed.error.flatten().fieldErrors);
//   process.exit(1);
// }

// module.exports = parsed.data;
