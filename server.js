const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Use session middleware
app.use(session({
    secret: 'a2652fc8dc90f14fcfd7b9fe7f79362602ae5da1fb3faad6c261e58f8338a09c',
    resave: false,
    saveUninitialized: true,
}));

// Connect to the SQLite database
const db = new sqlite3.Database('db.db');

// Serve static files from the public directory
app.use(express.static('public'));

// API ENDPOINTS

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
    console.log("Serving myLists.html...")
    console.log("Checking user authentication...")
    if (req.session && req.session.userId) {
        console.log("User is authenticated! Serving...")
        res.sendFile(path.join(__dirname,'pages','myLists.html'));
    } else {
        console.log("User is not authenticated! Redirecting...")
        res.redirect('/pages/login.html');
    }
});

// Serve itemList.html
app.get('/pages/itemList.html', (req, res) => {
    if (req.session && req.session.userId) {
        res.sendFile(path.join(__dirname, 'pages', 'itemList.html'));
    } else {
        res.redirect('/pages/login.html');
    }
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

// Endpoint to handle user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Fetch user from the database based on the provided username
    const query = 'SELECT * FROM User WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else if (!user) {
            // No user found with the given username
            res.json({ success: false, message: 'Invalid username or password' });
        } else {
            // User found, now compare passwords
            if (user.password === password) {
                // Passwords match, store user ID in the session
                req.session.userId = user.userId;

                // Send success response with user ID and username
                res.json({ success: true, userId: user.userId, username: user.username });
            } else {
                // Passwords do not match
                res.json({ success: false, message: 'Invalid username or password' });
            }
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
