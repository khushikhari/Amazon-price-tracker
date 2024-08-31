const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

// Array of product URLs and threshold prices
const products = [
  { url: 'https://www.amazon.in/dp/B0BX9KB1WZ', threshold: 1000 },
  { url: 'https://www.amazon.in/dp/B09V4B7TS5', threshold: 5000 },
  // Add more products here
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const product of products) {
    await page.goto(product.url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('#priceblock_ourprice, #priceblock_dealprice');

    const price = await page.evaluate(() => {
      const priceElement = document.querySelector('#priceblock_ourprice') || document.querySelector('#priceblock_dealprice');
      return priceElement ? parseFloat(priceElement.innerText.replace(/₹|,/g, '')) : null;
    });

    console.log(`Current Price for ${product.url}: ₹${price}`);

    if (price && price < product.threshold) {
      sendNotification(product.url, price);
    }
  }

  await browser.close();
})();

function sendNotification(url, price) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@gmail.com',
    subject: 'Price Drop Alert',
    text: `The price of the product has dropped to ₹${price}. Check it out here: ${url}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
const cron = require('node-cron');

// Schedule to run every day at 8:00 AM
cron.schedule('0 8 * * *', () => {
  // Insert the price tracking logic here
  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    for (const product of products) {
      await page.goto(product.url, { waitUntil: 'networkidle2' });

      await page.waitForSelector('#priceblock_ourprice, #priceblock_dealprice');

      const price = await page.evaluate(() => {
        const priceElement = document.querySelector('#priceblock_ourprice') || document.querySelector('#priceblock_dealprice');
        return priceElement ? parseFloat(priceElement.innerText.replace(/₹|,/g, '')) : null;
      });

      console.log(`Current Price for ${product.url}: ₹${price}`);

      if (price && price < product.threshold) {
        sendNotification(product.url, price);
      }
    }

    await browser.close();
  })();
}, {
  timezone: "Asia/Kolkata"
});


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
