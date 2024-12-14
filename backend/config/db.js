const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const dbName = 'productDB'; // Database name

let db;

// Connect to MongoDB
const connectToDatabase = async () => {
  if (db) {
    return db; // Return the existing connection if already established
  }

  const client = await MongoClient.connect(uri); // No options needed for modern drivers
  db = client.db(dbName); // Set the database
  console.log(`Connected to MongoDB: Database=${dbName}`);
  return db;
};

module.exports = { connectToDatabase };
