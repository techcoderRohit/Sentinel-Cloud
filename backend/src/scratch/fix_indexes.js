const mongoose = require('mongoose');
require('dotenv').config();

async function fixDashboardsIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const collection = mongoose.connection.db.collection('dashboards');
    
    // Check existing indexes
    const indexes = await collection.indexes();
    console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

    // Find the unique index on userId
    const userIdIndex = indexes.find(idx => idx.key.userId === 1 && idx.unique);

    if (userIdIndex) {
      console.log(`Found unique index: ${userIdIndex.name}. Dropping it...`);
      await collection.dropIndex(userIdIndex.name);
      console.log('Index dropped successfully! Now you can create multiple boards.');
    } else {
      console.log('No unique index on userId found. Maybe it was already dropped or the issue is different.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error fixing index:', err);
  }
}

fixDashboardsIndex();
