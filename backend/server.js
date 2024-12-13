const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB URI and Database/Collection Configuration
const uri = 'mongodb://localhost:27017';
const dbName = 'productDB';
const collectionName = 'products';

let db;

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB: Database=${dbName}`);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Routes

// 1. Fetch all products
app.get('/api/products', (req, res) => {
  db.collection(collectionName)
    .find()
    .toArray()
    .then(products => res.json(products))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Fetch a product by name
app.get('/api/products/search', (req, res) => {
  const productName = req.query.name; // Get the name from query parameters

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  db.collection(collectionName)
    .find({ name: { $regex: new RegExp(productName, 'i') } }) // Case-insensitive search
    .toArray()
    .then(products => {
      if (products.length === 0) {
        return res.status(404).json({ error: 'No products found' });
      }
      res.json(products);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// 2. Fetch a single product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  db.collection(collectionName)
    .findOne({ _id: new ObjectId(productId) })
    .then(product => {
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


// 3. Add a new product
app.post('/api/products', (req, res) => {
  const { name, price } = req.body;

  if (!name || typeof name !== 'string' || isNaN(price)) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  db.collection(collectionName)
    .insertOne({ name, price })
    .then(result => res.status(201).json(result.ops[0]))
    .catch(err => res.status(500).json({ error: err.message }));
});

// 4. Update a product by ID
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;

  if (!name || typeof name !== 'string' || isNaN(price)) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  db.collection(collectionName)
    .updateOne(
      { _id: new ObjectId(productId) },
      { $set: { name, price } }
    )
    .then(result => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// 5. Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  db.collection(collectionName)
    .deleteOne({ _id: new ObjectId(productId) })
    .then(result => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
