const { rejects } = require("assert");
var fs = require("fs");
const { resolve } = require("path");


let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        // read item.json file
        fs.readFile('./data/items.json', 'utf8', (err,data) => {
            if(err) {
                return reject("unable to read items file");
            }
            try {
                // convert files to array
                items = JSON.parse(data);
            } catch (parseError) {
                return reject("unable to parse items file");
            }
        })
        
        // read categories file
        fs.readFile('./data/categories.json', 'utf8', (err,data) => {
            if(err) {
                return reject("unable to read categories file");
            }
            try {
                // convert files to array
                categories = JSON.parse(data);
            } catch (parseError) {
                return reject("unable to parse categories file");
            }
        })
        // call resolve if it read successfuly
        resolve();
    })
}

function getAllItems() {
    return new Promise((resolve, reject) => {

        if(items.length > 0)
            {
            return resolve(items); // return resolve if the array has a item
        }
        else 
        {
            reject("The array is empty"); // return reject if the array is empty
        }
    })
}

function getPublishedItems() {
    return new Promise((resolve, rejects) => {
        // Filter items that published is true
        const publishedItems = items.filter(item => item.published === true);
        
        if (publishedItems.length > 0) {
            resolve(publishedItems); // Returns an array of filtered items
        } else {
            reject("no results returned"); // Returns an error if no filtered items are found
        }
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories); // Return resolve if the array has categories
        } else {
            reject("The array is empty"); // Return reject if the array is empty
        }
    });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories,items, categories };