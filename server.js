const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:'); // Use ':memory:' for an in-memory database, or specify a file path

// Create table for products if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS products (url TEXT, threshold INTEGER, lastPrice INTEGER)");
});

// Route to add a new product
app.post('/add-product', (req, res) => {
  const { url, threshold } = req.body;
  
  // Insert the product into the database
  db.run("INSERT INTO products (url, threshold, lastPrice) VALUES (?, ?, ?)", [url, threshold, 0], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to add product', error: err.message });
    }
    res.json({ message: 'Product added successfully!' });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
