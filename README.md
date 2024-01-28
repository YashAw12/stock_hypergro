# stock_hypergro

A backend application to access and manage data from the Bombay Stock Exchange (BSE) using Node.js.

The script includes:

● Downloading the Equity Bhavcopy ZIP from the BSE website.

● Extracting and reading the CSV file in the ZIP.

● Storing the data in MongoDB database including fields like code, name, open, high, low, close and favorites.

● Option to change the date in the zip url to get historic data.

● Support to fetch last 50 days data.


API features:

● A RESTful API built  using Express.js

● A GET route for the top 10 stocks having highest closing price with an option to select date

● A GET route to find stocks by name.

● A GET route to get stock price history list for UI graph.

● A PATCH route to add a stock to favourites.

● A GET route to see favourite stocks.

● A DELETE route to remove a stock from favourites.


Rest Api documentation: https://documenter.getpostman.com/view/27825879/2s9YyqihQt

Video Demo: https://drive.google.com/file/d/1HANUJ3i5BH4OAmRO1PdTnV3gMfjv77vb/view?usp=sharing


Instructions:

Firstly do npm i to install all dependencies.

Run server.js first, wait for it to finish execution

Now run api.js on port 3000.

Now open postman and send requests by following above documentation and video demo.
