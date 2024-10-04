const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const HTTP_PORT = process.env.PORT || 8080;
const storeService = require('./store-service');
const { error } = require('console');

app.use(express.static('public')); 

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/views/about.html'));
 });



// shop route
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
    .then((data) => {
        res.json(data); // Returns filtered items in JSON format
    })
    .catch((err) => {
        console.log(err);
    })
    
})

// /items route
app.get('/items', (req, res) => {
    storeService.getAllItems()
    .then((data) => {
        res.json(data); // Returns all items in JSON format
    })
    .catch((err) => {
        console.log(err);
    })
});

// /categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then((data) => {
        res.json(data); // Returns the category in JSON format
    })
    .catch((err) => {
        console.log(err);
    })
});

// Handling mismatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html')); //Return a 404 status code and message
});

// Start server after initialization
storeService.initialize()
.then(() => {
    // Start server
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`)
    });
})
.catch((error) => {
    console.error("Error initializing the store service:", error);
})
