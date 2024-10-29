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

function addItem(itemData){
    return new Promise((resolve, reject) => {
        try {
            // if published is undefined set it false, if not set it true
           itemData.published = itemData.published !== undefined; 

           //set id to length of the item + 1
           itemData.id = items.length + 1;

           //push the item onto array of the items
           items.push(itemData);
           
           resolve(itemData);

        } catch(err) {
            reject('Error adding item: ' + err);
        }
    })
}

function getItemsByCategory(category) {
    return new Promise((resolve, rejects) => {
        const ItemsByCategory = items.filter(item => item.category === category);
        if (ItemsByCategory.length > 0) {
            resolve(ItemsByCategory);
        } else {
            reject("no results returned");
        }
    })
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, rejects) => {
        const ItemsByDate = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (ItemsByDate.length > 0) {
            resolve(ItemsByDate);
        } else {
            reject("no results returned");
        }
    })
}

function getItemById(id) {
    return new Promise((resolve, rejects) => {
        const foundItem = items.find(item => item.id === id);
        if(foundItem)
        {
            resolve(foundItem);
        }
        else
        {
            rejects("no result returned");
        }
    })
}

module.exports = { 
    initialize, 
    getAllItems, 
    getPublishedItems, 
    getCategories, 
    addItem, 
    getItemsByCategory, 
    getItemsByMinDate,
    getItemById,
    items, 
    categories 
};