import pg from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
 const sql=await readFile(new URL('../migrations/001_init.sql',import.meta.url),'utf8');
 await pool.query(sql);
 console.log('Migration 001_init applied');
} finally { await pool.end(); }
