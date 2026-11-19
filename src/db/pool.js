import  pg  from "pg"
import { Pool } from "pg";
import {env} from "../config/env.js"

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (val) => Number(val))

export const pool = new Pool(
  env.DATABASE_URL
  ? {connectionString: env.DATABASE_URL}
  : {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});


