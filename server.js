/*********************************************************************************
WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seungwan Hong
Student ID: 167572221
Date: Dec 4, 2024
Vercel Web App URL: https://web322-app-plum.vercel.app/
GitHub Repository URL: https://github.com/WanE1003/web322-app.git

********************************************************************************/ 
// Import the express module
const express = require('express');
const app = express();

// Import the path module
const path = require('path');

// Import storeService and authData (external service related code)
const storeService = require('./store-service');
const authData = require('./auth-service');

// Import multer, cloudinary, and streamifier (for file uploads)
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Import strip-js module (for stripping JS code)
const stripJs = require('strip-js');

// Import client-sessions module (for session management)
const clientSessions = require('client-sessions');

// Set environment variables and default port
const HTTP_PORT = process.env.PORT || 8080;

// Client session middleware configuration
app.use(
    clientSessions({
      cookieName: 'session', // The name of the cookie to store session data
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // A secret key to encrypt session data
      duration: 24 * 60 * 60 * 1000,  // Session duration in milliseconds (1 day)
      activeDuration: 1000 * 60 * 5, // Extend session by 5 minutes if active
      httpOnly: true, // Prevent client-side access to cookies
      secure: process.env.NODE_ENV === 'production' || false,  // Send cookies only in HTTPS in production environment
      sameSite: 'strict', // Restrict cross-site requests to enhance security
    })
);

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dyhjckz8c',
    api_key: '983288362233439',
    api_secret: '8uQqQLDn0JRgu9YDforwdI7E8lQ',
    secure: true
});

// Multer setup: for file uploads without disk storage
const upload = multer(); // No storage option as files are not saved to disk

// Add express-handlebars module
const exphbs = require("express-handlebars");
// Create a Handlebars instance and register helpers
const hbs = exphbs.create({
    helpers: {
        // Helper for navigation links with active class based on the current route
        navLink: function (url, options) {
            return (
                '<li class="nav-item"><a ' +
                (url === app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') +
                ' href="' + url + '">' + options.fn(this) + '</a></li>'
            );
        },
        // Helper to check if two values are equal
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
        // Helper to sanitize HTML by stripping JavaScript
        safeHTML: function(context){
            return stripJs(context);
        },
        // Helper to format date as "YYYY-MM-DD"
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }        
    },
    defaultLayout: 'main', // Default layout file name
    extname: '.hbs' // File extension
});

// Tell express to use the HBS engine
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// Use the 'public' directory for serving static files
app.use(express.static('public')); 

// Middleware to parse URL-encoded data
app.use(express.urlencoded({extended: true}));

// Middleware to set activeRoute for current path
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Middleware to make the session object available in templates
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// 'ensureLogin' middleware to check if the user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {  // If session doesn't have userName
        res.redirect('/login');   // Redirect to login page
    } else {
        next();  // If logged in, proceed to the next middleware or route
    }
}

// Apply 'ensureLogin' middleware to specific routes
app.use(['/items', '/categories', '/item', '/category'], ensureLogin);
  



// Homepage
app.get('/', (req, res) => {
    res.redirect("/about");
});

// register page
app.get('/register', (req, res) => {
    res.render('register');
})

// POST /register route
app.post('/register', (req, res) => {
    const userData = req.body;

    authData.registerUser(userData)
    .then(() => {
        res.render('register', { successMessage: "User created" });
    })
    .catch((err) => {
        res.render('register', {errorMessage: err, userName: userData.userName});
    });
});

// login page
app.get('/login', (req, res) => {
    res.render('login');
})

// POST / login route
app.post('/login', (req,res) => {
    // Set the User-Agent in the request body
    req.body.userAgent = req.get('User-Agent');

    // Get the user data from the request body
    const userData = req.body;

    // Authenticate the user
    authData.checkUser(userData)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      console.log(req.session.userAgent);
      res.redirect('/items');
    })
    // Render the login view with an error message and the provided userName
    .catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName} )
    });
});

// logout Route
app.get('/logout', (req, res) => {
    // Destroy the session data
    req.session.reset(); // Clear the session (using client-sessions' reset method)

    // Redirect the user to the home page
    res.redirect('/'); 
});

// Route to render the "userHistory" view
app.get('/userHistory', ensureLogin, (req, res) => { // Protected by ensureLogin middleware to restrict access to logged-in users only
    // Render the "userHistory" view without any additional data
    res.render('userHistory')
})

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
            .then(data => {
                if(data.length > 0)
                {
                    res.render("items", {items: data});
                }
                else
                {
                    res.render("items", {message: "no results"});
                }         
            })
            .catch(err => res.render("items", {message: "no results"}));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(data => {
                if(data.length > 0)
                {
                    res.render("items", {items: data});
                }
                else
                {
                    res.render("items", {message: "no results"});
                }         
            })
            .catch(err => res.render("items", {message: "no results"}));
    } else {
        storeService.getAllItems()
            .then(data => {
                if(data.length > 0)
                {
                    res.render("items", {items: data});
                }
                else
                {
                    res.render("items", {message: "no results"});
                }         
            })
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
    storeService.getCategories()
    .then((data) => {
        res.render("addItem", { categories: data });
    })
    .catch((err) => {
        console.error("Error fetching categories:", err);
            res.render("addItem", { categories: [] });
    });
});

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

app.get('/items/delete/:id', (req, res) => {
    const itemId = req.params.id;

    storeService.deleteItemById(itemId)
        .then(() => {
            res.redirect('/items');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Unable to Remove items / item not found');
        });
});

// categories route
app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then((data) => {
        if(data.length > 0)
            {
                res.render("categories", {categories: data});
            }
            else
            {
                res.render("categories", {message: "no results"});
            } 
    })
    .catch((err) => {
        res.render("categories", {message: "no results"});
    })
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
})

app.post('/categories/add', (req, res) => {
    let itemData = {
        category: req.body.category
    }

    storeService.addCategory(itemData)
    .then((newItem) => {
        res.redirect('/categories');
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error processing categories');
    });
})

app.get('/categories/delete/:id', (req, res) => {
    const categoryId = req.params.id;

    storeService.deleteCategoryById(categoryId)
        .then(() => {
            res.redirect('/categories');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Unable to Remove Category / Category not found');
        });
});




// Handling mismatched routes
app.use((req, res) => {
   res.status(404).render('404'); //Return a 404 status code and message
});

// Start server after initialization
storeService.initialize()
.then(authData.initialize)
.then(() => {
    // Start server
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`)
    });
})
.catch((err) => {
    console.error("Unable to start server:", err);
})
