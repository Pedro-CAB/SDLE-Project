const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to the SQLite database
const db = new sqlite3.Database('db.db'); // Replace 'your-database-file.db' with your actual database file name

// Serve static files from the 'public' directory (adjust based on your directory structure)
app.use(express.static(path.join(__dirname, '/')));

// Define API endpoints

// Endpoint to get a list of shopping lists
app.get('/api/lists', (req, res) => {
    // Fetch shopping lists from the database
    db.all('SELECT * FROM ShoppingList', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

// Serve myLists.html
app.get('/pages/myLists.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/myLists.html'));
});

// Serve itemList.html
app.get('/pages/itemList.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/itemList.html'));
});

// Endpoint to get items for a specific shopping list
app.get('/api/items', (req, res) => {
    const listId = req.query.listId;
    console.log('Received request for listId:', listId);

    // Log the SQL query being executed
    const query = 'SELECT * FROM Item WHERE idList = ?';
    console.log('Executing query:', query, 'with parameters:', [listId]);

    // Fetch items for the specified shopping list from the database
    db.all(query, [parseInt(listId)], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
