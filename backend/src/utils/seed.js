require('dotenv').config();
const faker = require('faker'); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_mgmt';

async function main(){
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  const testEmail = 'test@erino.test';
  const testPassword = 'Test1234!';

  await User.deleteMany({});
  await Lead.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(testPassword, salt);
  const user = await User.create({ email: testEmail, password: hash, name: 'Test User', role: 'user' });

  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const admin = await User.create({ email: 'admin@erino.test', password: adminHash, name: 'Admin User', role: 'admin' });

  const sources = ['website','facebook_ads','google_ads','referral','events','other'];
  const statuses = ['new','contacted','qualified','lost','won'];

  const leads = [];
  for (let i=0;i<120;i++){
    const first_name = faker.name.firstName();
    const last_name = faker.name.lastName();
    const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${i}@example.com`;
    const score = Math.floor(Math.random()*101);
    const lead_value = parseFloat((Math.random()*10000).toFixed(2));
    const created_at = faker.date.past(1);
    const last_activity_at = Math.random() > 0.3 ? faker.date.between(created_at, new Date()) : null;

    const owner = Math.random() > 0.2 ? user._id : admin._id;

    leads.push({
      first_name, last_name, email, phone: faker.phone.phoneNumber(),
      company: faker.company.companyName(), city: faker.address.city(), state: faker.address.state(),
      source: sources[Math.floor(Math.random()*sources.length)],
      status: statuses[Math.floor(Math.random()*statuses.length)],
      score, lead_value, last_activity_at, is_qualified: Math.random() > 0.7,
      created_at, updated_at: new Date(),
      created_by: owner
    });
  }

  await Lead.insertMany(leads);
  console.log('Seeded test user, admin and leads.');
  console.log('Test credentials:', testEmail, testPassword);
  console.log('Admin credentials: admin@erino.test / Admin1234!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
