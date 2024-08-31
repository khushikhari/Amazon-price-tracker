const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create a table for products
db.serialize(() => {
  db.run("CREATE TABLE products (url TEXT, threshold INTEGER, lastPrice INTEGER)");

  const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?)");
  products.forEach(product => {
    stmt.run(product.url, product.threshold, 0);
  });
  stmt.finalize();
});

// Update lastPrice after checking
function updateLastPrice(url, price) {
  db.run("UPDATE products SET lastPrice = ? WHERE url = ?", [price, url]);
}
