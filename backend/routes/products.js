const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../config/db');

const router = express.Router();

// Middleware to ensure `db` is available
const getDb = async (req, res, next) => {
  try {
    req.db = await connectToDatabase(); // Attach the database to the request
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
};

// 1. Fetch all products
router.get('/', getDb, (req, res) => {
  req.db.collection('products')
    .find()
    .toArray()
    .then(products => res.json(products))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Fetch a product by name
router.get('/search', getDb, (req, res) => {
  const productName = req.query.name;

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  req.db.collection('products')
    .find({ name: { $regex: new RegExp(productName, 'i') } })
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
router.get('/:id', getDb, (req, res) => {
  const productId = req.params.id;

  req.db.collection('products')
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
router.post('/', getDb, (req, res) => {
  const { name, price } = req.body;

  if (!name || typeof name !== 'string' || isNaN(price)) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  req.db.collection('products')
    .insertOne({ name, price })
    .then(result => res.status(201).json(result.ops[0]))
    .catch(err => res.status(500).json({ error: err.message }));
});

// 4. Update a product by ID
router.put('/:id', getDb, (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;

  if (!name || typeof name !== 'string' || isNaN(price)) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  req.db.collection('products')
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
router.delete('/:id', getDb, (req, res) => {
  const productId = req.params.id;

  req.db.collection('products')
    .deleteOne({ _id: new ObjectId(productId) })
    .then(result => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
