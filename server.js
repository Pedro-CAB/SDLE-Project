
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

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

// Endpoint to get a list of shopping lists for the authenticated user
app.get('/api/lists', (req, res) => {
    const userId = req.session.userId;

    // Fetch shopping lists associated with the user from the database
    const query = `
        SELECT sl.*
        FROM ShoppingList sl
        JOIN UserList ul ON sl.idList = ul.idList
        WHERE ul.idUser = ?
    `;
    console.log("Query userId: " + userId)
    db.all(query, [userId], (err, rows) => {
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
    if (req.session && req.session.idUser) {
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
            // Ensure the 'amountNeeded' attribute is present in the response
            const itemsWithAmount = rows.map(item => ({
                idItem: item.idItem,
                itemName: item.itemName,
                amountNeeded: item.amountNeeded,
                idList: item.idList
            }));

            res.json(itemsWithAmount);
        }
    });
});


// Endpoint to handle user login with MD5 hashing
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
            // User found, now compare hashed passwords
            const hashedPassword = md5(password);

            if (user.password === hashedPassword) {
                // Passwords match, store user ID in the session
                req.session.userId = user.idUser;

                console.log('User ID stored in session:', req.session.userId); // Add this line for debugging

                // Send success response with user ID and username
                res.json({ success: true, userId: user.idUser, username: user.username });
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

// Serve createAccount.html
app.get('/pages/createAccount.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'createAccount.html'));
});

// Endpoint to handle user account creation
app.post('/api/createAccount', (req, res) => {
    const { name, username, password } = req.body;

    // Check if the username is already taken
    const checkUsernameQuery = 'SELECT * FROM User WHERE username = ?';
    db.get(checkUsernameQuery, [username], (err, existingUser) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else if (existingUser) {
            // Username is already taken
            res.json({ success: false, message: 'Username is already taken' });
        } else {
            // Hash the password using MD5
            const hashedPassword = md5(password);

            // Insert the new user into the User table
            const createUserQuery = 'INSERT INTO User (name, username, password) VALUES (?, ?, ?)';
            db.run(createUserQuery, [name, username, hashedPassword], function (err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                } else {
                    // Send success response
                    res.json({ success: true, message: 'Account created successfully' });
                }
            });
        }
    });
});

// Endpoint to handle shopping list creation
app.post('/api/createList', (req, res) => {
    const listName = req.body.listName;

    // Insert the new shopping list into the ShoppingList table
    const createListQuery = 'INSERT INTO ShoppingList (listName) VALUES (?)';
    db.run(createListQuery, [listName], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            const newListId = this.lastID; // Get the ID of the newly inserted list

            // Create a UserList entry connecting the current user to the new list
            const createRelationQuery = 'INSERT INTO UserList (idUser, idList) VALUES (?, ?)';
            db.run(createRelationQuery, [req.session.userId, newListId], function (err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                } else {
                    // Send success response with the new list ID
                    res.json({ success: true, listId: parseInt(newListId), message: 'List created successfully' });
                }
            });
        }
    });
});


// Endpoint to get the list name
app.get('/api/listName', (req, res) => {
    const userId = req.session.userId;
    const listId = req.query.listId; // Get listId from the query parameters

    console.log("User ID:" + userId)
    console.log("List ID:" + listId)

    // Fetch the list name associated with the authenticated user and listId from the database
    const query = `
        SELECT sl.listName
        FROM ShoppingList sl
        JOIN UserList ul ON sl.idList = ul.idList
        WHERE ul.idUser = ? AND sl.idList = ?
        LIMIT 1
    `;

    db.get(query, [userId, listId], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            // Send the list name in the response
            res.json({ listName: row ? row.listName : null });
        }
    });
});

// Endpoint for creating list items
app.post('/api/createItem', (req, res) => {
    const { itemName, itemAmount, listId } = req.body;

    // Insert the new item into the Item table
    const createItemQuery = 'INSERT INTO Item (itemName, amountNeeded, idList) VALUES (?, ?, ?)';
    db.run(createItemQuery, [itemName, itemAmount, listId], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            // Send success response
            res.json({ success: true, message: 'Item created successfully' });
        }
    });
});

// Endpoint to delete a specific item
app.delete('/api/deleteItem/:itemId', (req, res) => {
    const itemId = req.params.itemId;

    // Delete the item from the Item table
    const deleteItemQuery = 'DELETE FROM Item WHERE idItem = ?';
    db.run(deleteItemQuery, [itemId], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            // Send success response
            res.json({ success: true, message: 'Item deleted successfully' });
        }
    });
});

// Endpoint to handle item edits
app.put('/api/editItem', (req, res) => {
    const { itemId, newItemName, newAmountNeeded } = req.body;

    console.log(req.body);

    // Update the item in the database
    const updateItemQuery = 'UPDATE Item SET itemName = ?, amountNeeded = ? WHERE idItem = ?';
    db.run(updateItemQuery, [newItemName, newAmountNeeded, itemId], function (err) {
        if (err) {
            console.error('Error editing item:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        } else if (this.changes === 0) {
            // No rows were affected, item not found
            res.status(404).json({ success: false, message: 'Item not found' });
        } else {
            res.json({ success: true, message: 'Item edited successfully' });
        }
    });
});

// Add this endpoint to fetch the current user's information
app.get('/api/currentUser', (req, res) => {
    const userId = req.session.userId;

    // Fetch user information based on the user ID
    const query = 'SELECT name AS userName FROM User WHERE idUser = ?';
    db.get(query, [userId], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ userName: user ? user.userName : null });
        }
    });
});
