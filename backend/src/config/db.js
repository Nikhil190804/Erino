const mongoose = require('mongoose');

module.exports = function dbConnect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_mgmt';
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
};
