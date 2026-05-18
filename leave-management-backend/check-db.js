const { User } = require('./src/models');
const dotenv = require('dotenv');
dotenv.config();

async function checkUsers() {
  try {
    const users = await User.findAll({ attributes: ['email', 'role'] });
    console.log('Users in DB:');
    users.forEach(u => console.log(`${u.email} (${u.role})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
