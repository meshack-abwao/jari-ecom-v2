import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pg;

const c = new Client('postgresql://postgres:ZGBTeEyOBSnEAZbgxkmYbAXLNzNhlqtB@turntable.proxy.rlwy.net:16265/railway');

const email = process.argv[2] || 'nimo@ration.com';
const newPassword = process.argv[3] || 'password123';

async function resetPassword() {
  try {
    await c.connect();
    
    const hash = await bcrypt.hash(newPassword, 10);
    
    const result = await c.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [hash, email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
    } else {
      console.log('✅ Password reset for:', result.rows[0].email);
      console.log('   New password:', newPassword);
    }
    
    await c.end();
  } catch (error) {
    console.error('Error:', error.message);
    await c.end();
  }
}

resetPassword();
