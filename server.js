const axios = require('axios');
const fs = require('fs');
const unzipper = require('unzipper');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const cache = require('memory-cache'); // Add memory-cache

// Set up MongoDB connection
mongoose.connect('mongodb+srv://yash-admin:mm68Epg1jF8ZpCcx@cluster0.o1dcash.mongodb.net/stockDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define MongoDB schema and model
const Stock = mongoose.model('Stock', {
  code: String,
  name: String,
  historicalData: [{
    date: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
  }],
  favorites: { type: Boolean, default: false },
});

// Function to fetch and store stock data for the last 50 days
async function fetchAndStoreStockData() {
  for (let i = 0; i < 50; i++) {
    const date = getPastDate(i);
    
    // Check if data is already in cache
    const cachedData = cache.get(date);
    if (cachedData) {
      console.log(`Data for ${date} found in cache.`);
      continue;
    }

    const url = `https://www.bseindia.com/download/BhavCopy/Equity/EQ${date}_CSV.ZIP`;

    try {
      const response = await axios.get(url, { responseType: 'stream' });
      response.data.pipe(unzipper.Extract({ path: 'temp' }))
        .on('close', () => readCSVFile(date));
    } catch (error) {
      console.log(`Error fetching data for ${date}.`);
    }
  }
}

// Function to read CSV file and store data in MongoDB
async function readCSVFile(date) {
  fs.createReadStream(`temp/EQ${date}.CSV`)
    .pipe(csv())
    .on('data', async (row) => {
      const stockData = {
        code: row.SC_CODE,
        name: row.SC_NAME.toString(),
        historicalData: {
          date: date,
          open: parseFloat(row.OPEN),
          high: parseFloat(row.HIGH),
          low: parseFloat(row.LOW),
          close: parseFloat(row.CLOSE),
        },
        favorites: false, // Default value, can be updated later
      };

      try {
        await Stock.findOneAndUpdate(
          { code: stockData.code },
          {
            name: stockData.name,
            favorites: stockData.favorites,
            $push: { historicalData: stockData.historicalData },
          },
          { upsert: true }
        );

        // Cache the data for future requests
        cache.put(date, stockData, 3600000); // Cache for 1 hour (adjust as needed)
      } catch (error) {
        console.error(`Error updating data for ${stockData.code} on ${date}:`, error);
      }
    })
    .on('end', () => {
      console.log(`Data for ${date} stored successfully.`);
    });
}

// Function to get formatted date (ddmmyy) for the past days
function getPastDate(daysAgo) {
  const today = new Date();
  today.setDate(today.getDate() - daysAgo);
  const year = today.getFullYear().toString().substr(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${day}${month}${year}`;
}

// Run the script
fetchAndStoreStockData();

