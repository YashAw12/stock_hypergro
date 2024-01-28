const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

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

app.use(bodyParser.json());

// API routes

// GET historical data for a specific stock by name
app.get('/stocksByName/:name', async (req, res) => {
    const { name } = req.params;
  
    try {
      const stockData = await Stock.findOne({ name: { $regex: new RegExp(name, 'i') } });
  
      if (stockData) {
        res.json(stockData);
      } else {
        res.status(404).json({ error: 'Stock not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  // GET top 10 stocks with the highest closing value on a particular date
  app.get('/top10stocks/:date', async (req, res) => {
    const { date } = req.params;
  
    try {
      const topStocks = await Stock.find({ 'historicalData.date': date })
        .sort({ 'historicalData.close': -1 })
        .limit(10);
  
      res.json(topStocks);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // PATCH request to make a stock favorite
  app.patch('/favorites/:name', async (req, res) => {
    const { name } = req.params;
  
    try {
      const updatedStock = await Stock.findOneAndUpdate({ name: { $regex: new RegExp(name, 'i') } }, { favorites: true }, { new: true });
  
      if (updatedStock) {
        res.json({ message: 'Stock marked as favorite successfully' });
      } else {
        res.status(404).json({ error: 'Stock not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // DELETE request to remove a stock from favorites
  app.delete('/favorites/:name', async (req, res) => {
    const { name } = req.params;
  
    try {
      const deletedStock = await Stock.findOneAndUpdate({ name: { $regex: new RegExp(name, 'i') } }, { favorites: false }, { new: true });
  
      if (deletedStock) {
        res.json({ message: 'Stock removed from favorites successfully' });
      } else {
        res.status(404).json({ error: 'Stock not found in favorites' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // GET request to display historical data of all favorite stocks
  app.get('/favorites', async (req, res) => {
    try {
      const favoriteStocks = await Stock.find({ favorites: true });
      res.json(favoriteStocks.map(stock => ({
        code: stock.code,
        name: stock.name,
        historicalData: stock.historicalData,
      })));
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });