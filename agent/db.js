import pg from 'pg';
import {config} from './config.js';
const {Pool}=pg;
export const pool=config.databaseUrl?new Pool({connectionString:config.databaseUrl}):null;
export async function query(text,params=[]){if(!pool)return {rows:[]};return pool.query(text,params);}
export async function closeDb(){if(pool)await pool.end();}
