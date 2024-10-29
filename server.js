/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seungwan Hong
Student ID: 167572221
Date: Oct 29, 2024
Vercel Web App URL: web322-gxc5zdwc5-seungwans-projects-ff6067f4.vercel.app
GitHub Repository URL: https://github.com/WanE1003/web322-app.git

********************************************************************************/ 

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const HTTP_PORT = process.env.PORT || 8080;
const storeService = require('./store-service');
const { error } = require('console');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dyhjckz8c',
    api_key: '983288362233439',
    api_secret: '8uQqQLDn0JRgu9YDforwdI7E8lQ',
    secure: true
});

app.use(express.static('public')); 
const upload = multer(); // no { storage: storage } since we are not using disk storage


// Homepage
app.get('/', (req, res) => {
    res.redirect("/about");
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"))
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

// items route
app.get('/items', (req, res) => {
    const category = req.query.category; // these are from query
    const minDate = req.query.minDate;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ error: err.message }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        storeService.getAllItems()
            .then(items => res.json(items))
            .catch(err => res.status(500).json({ error: err.message }));
    }
});
// item route with id
app.get('/item/:id', (req, res) => {
    const itemId = req.params.id; // this is from params

    storeService.getItemById(itemId)
        .then(item => {
            if (item) {
                res.json(item); 
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then((data) => {
        res.json(data); // Returns the category in JSON format
    })
    .catch((err) => {
        console.log(err);
    })
});

app.get('/items/add', (req,res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
})

app.post('/items/add', upload.single("featureImage"), (req,res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }

     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
        
        const fullDate = new Date();
        const formattedDate = fullDate.toISOString().split('T')[0];

        let itemData = {
            id: req.body.id,
            category: req.body.category,
            postDate: formattedDate,
            featureImage: req.body.featureImage,
            price: req.body.price,
            title: req.body.title,
            body: req.body.body,
            published: req.body.published
        }

        storeService.addItem(itemData)
        .then((newItem) => {
            res.redirect('/items');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error processing item');
        });
    } 
})

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
