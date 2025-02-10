/*********************************************************************************

Name: Seungwan Hong
Email: mambo9991@gmail.com
Date: Dec 2, 2024
GitHub Repository URL: https://github.com/WanE1003/Product-Store

********************************************************************************/  
// require mongoose and setup the Schema
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// require bcrypt
const bcrypt = require('bcryptjs');

// connect to Your MongoDB Atlas Database
let connectionString = 'mongodb+srv://mambo9991:HDvpeFkVafnQB5LZ@cluster0.qhr2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let userSchema = new Schema({
    userName : {
        type : String,
        unique : true,
    },
    password : String,
    email : String,
    loginHistory : [{
        dateTime : Date,
        userAgent : String,
    }]
});

let User; // to be defined on new connection (see initialize)

// initialize function()
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://mambo9991:HDvpeFkVafnQB5LZ@cluster0.qhr2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

//
module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        // Validate user name: it should not be empty or null
        if(userData.userName == '' || userData.userName == null)
        {
            return reject('The username cannot be empty.');
        }
        // Validate email: it should not be empty and should match a basic email format
        else if(!userData.email || !/\S+@\S+\.\S+/.test(userData.email))
        {
            return reject('Please provide a valid email address.');
        }
        // Validate password: it should not be empty or null
        else if(userData.password == '' || userData.password == null)
        {   
            return reject('The password cannot be empty.');
        }
        // Ensure passwords match
        else if(userData.password != userData.password2)
        {
            return reject('The passwords do not match. Please check and try again.');
        }
        
        // Check if the email already exists in the database (properly handle the promise)
        User.findOne({ email: userData.email })
            .then((existingUser) => {
                if (existingUser) {
                    // If an existing user with the same email is found, reject the promise
                    return reject('The email is already registered.');
                }

                bcrypt.hash(userData.password, 10)
                .then(hash => {
                    // Replace the plain password with the hashed password
                    userData.password = hash;

                    // Create a new user object with the provided data
                    let newUser = new User(userData);

                    // Attempt to save the new user to the database
                    newUser.save()
                        .then(() => {
                            resolve(); // Successfully registered
                        })
                        .catch((err) => {
                            // Handle duplicate username error (err.code 11000)
                            if (err.code == 11000) {
                                reject('User Name already taken.');
                            } else {
                                // General error message for any other errors
                                reject(`There was an error creating the user: ${err.message}`);
                            }
                        });
                })
                .catch((err) => {
                    // Handle errors related to bcrypt hashing
                    reject('There was an error encrypting the password');
                })
            })
            .catch((err) => {
                // Handle errors while checking the email in the database
                reject(`There was an error checking the email: ${err.message}`);
            });
    });
};


module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        // Find the user by userName in the database
        User.findOne({ userName: userData.userName })
            .then((user) => {
                // Check if the user was found
                if (user.length === 0) 
                {
                    reject(`Unable to find user: ${userData.userName}`);
                } 
                bcrypt.compare(userData.password, user.password)
                .then((result) => {
                    if(result === false)
                    {
                        // Password does not match
                        return reject(`Incorrect Password for user: ${userData.userName}`);
                    }
                    else
                    {
                        // Add login history
                        user.loginHistory.push({
                        dateTime: new Date().toString(),
                        userAgent: userData.userAgent,
                        });
                        // Update the user's loginHistory in the database
                        user.save()
                        .then(() => {
                            resolve(user); // Successfully logged in
                        })
                        .catch((err) => {
                            reject(`There was an error verifying the user: ${err}`);
                        });
                    }
                })
                .catch((err) => {
                    reject(`There was an error comparing passwords: ${err}`);
                });
            })
            .catch(() => {
                // Handle errors during the find operation
                reject(`Unable to find user: ${userData.userName}`);
            });
    })
}
