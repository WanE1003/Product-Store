/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seungwan Hong
Student ID: 167572221
Date: Nov 13, 2024
Vercel Web App URL: https://web322-app-plum.vercel.app/
GitHub Repository URL: https://github.com/WanE1003/web322-app.git

********************************************************************************/ 

const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const stripJs = require('strip-js');
const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dyhjckz8c',
    api_key: '983288362233439',
    api_secret: '8uQqQLDn0JRgu9YDforwdI7E8lQ',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage
const app = express();

// add the express-handlebars module
const exphbs = require("express-handlebars");

// Create a Handlebars instance and register helpers
const hbs = exphbs.create({
    helpers: {
        navLink: function (url, options) {
            return (
                '<li class="nav-item"><a ' +
                (url === app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') +
                ' href="' + url + '">' + options.fn(this) + '</a></li>'
            );
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            }
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
        
    },
    defaultLayout: 'main',
    extname: '.hbs'
});

// tell express we are using the HBS engine
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

app.use(express.static('public')); 

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Homepage
app.get('/', (req, res) => {
    res.redirect("/shop");
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

// shop route
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.storeService) - new Date(a.storeService));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
});


app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned items by category
        if(req.query.category){
            // Obtain the published "items" by category
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "items"
            items = await storeService.getPublishedItems();
        }
  
        // sort the published items by itemDate
        items.sort((a,b) => new Date(b.storeService) - new Date(a.storeService));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await storeService.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await storeService.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

// items route
app.get('/items', (req, res) => {
    const category = req.query.category; // these are from query
    const minDate = req.query.minDate;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(data => res.render("items", {items: data}))
            .catch(err => res.render("items", {message: "no results"}));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(data => res.render("items", {items: data}))
            .catch(err => res.render("items", {message: "no results"}));
    } else {
        storeService.getAllItems()
            .then(data => res.render("items", {items: data}))
            .catch(err => res.render("items", {message: "no results"}));
    }
});
// item route with id
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});


app.get('/items/add', (req,res) => {
    res.render('addItem');
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

// categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then((data) => {
        res.render("categories", {categories: data});
    })
    .catch((err) => {
        res.render("categories", {message: "no results"});
    })
});

// Handling mismatched routes
app.use((req, res) => {
   res.status(404).render('404'); //Return a 404 status code and message
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
