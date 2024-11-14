/********************************************************************************* 

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   Seungwan Hong
Student ID:   167572221
Date:  Nov 14, 2024
Cyclic Web App URL:  
GitHub Repository URL:  https://github.com/WanE1003/web322-app.git

********************************************************************************/  

var fs = require("fs");
const { rejects } = require("assert");
const { resolve } = require("path");


let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                items = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

function getAllItems() {
    return new Promise((resolve,reject)=>{
        (items.length > 0 ) ? resolve(items) : reject("no results returned"); 
    });
}

function getItemById(id) {
    return new Promise((resolve,reject)=>{
        let foundItem = items.find(item => item.id == id);

        if(foundItem){
            resolve(foundItem);
        }else{
            reject("no result returned");
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve,reject)=>{
        (items.length > 0) ? resolve(items.filter(item => items.published)) : reject("no results returned");
    });
}

function getCategories() {
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

function addItem(itemData){
    return new Promise((resolve, reject) => {
        try {
            // check if published is true or not. 
            itemData.published = itemData.published ? true : false;

            //set id to length of the item + 1
            itemData.id = items.length + 1;

            // Get current date in YYYY-M-D format
            const currentDate = new Date();
            const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

            // Add itemDte to itemData
            itemData.postDate = formattedDate;
            
            //push the item onto array of the items
            items.push(itemData);
           
            resolve(itemData);

        } catch(err) {
            reject('Error adding item: ' + err);
        }
    })
}

function getItemsByCategory(category) {
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(post=>post.category == category);

        if(filteredItems.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredItems);
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)))

        if (filteredItems.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredItems);
        }
    });
}

function getPublishedItemsByCategory(category)
{
    return new Promise((resolve, rejects) => {
        // Filter items that published is true
        let publishedItems = items.filter(item => item.published == true && item.category == category);
        
        if (publishedItems.length > 0) {
            resolve(publishedItems); // Returns an array of filtered items
        } else {
            reject("no results returned"); // Returns an error if no filtered items are found
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
    getPublishedItemsByCategory,
    items, 
    categories 
};