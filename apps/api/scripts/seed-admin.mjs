import pg from 'pg';
import bcrypt from 'bcryptjs';
const { DATABASE_URL,ADMIN_EMAIL,ADMIN_PASSWORD }=process.env;
if(!DATABASE_URL||!ADMIN_EMAIL||!ADMIN_PASSWORD||ADMIN_PASSWORD.length<12)
 throw new Error('DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) required');
const pool=new pg.Pool({connectionString:DATABASE_URL});
try{
 const exists=await pool.query('SELECT id FROM users WHERE role=$1 LIMIT 1',['ADMIN']);
 if(exists.rowCount) console.log('Admin already exists. No changes made.');
 else{
  const hash=await bcrypt.hash(ADMIN_PASSWORD,12);
  await pool.query('INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,$4)',
   ['FieldOps Admin',ADMIN_EMAIL.trim().toLowerCase(),hash,'ADMIN']);
  console.log('Initial administrator created');
 }
}finally{await pool.end();}
