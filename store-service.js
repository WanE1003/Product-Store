/*********************************************************************************
WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Seungwan Hong
Student ID: 167572221
Date: Dec 2, 2024
Vercel Web App URL: https://web322-app-plum.vercel.app/
GitHub Repository URL: https://github.com/WanE1003/web322-app.git

********************************************************************************/  
const Sequelize = require('sequelize');
// set up sequelize to point to our postgres database
var sequelize = new Sequelize('web322', 'web322_owner', 'W1E9sVOxKXmy', {
    host: 'ep-raspy-credit-a5p0xsd7.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true }
});

const Item = sequelize.define('Item', {
    body: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    itemDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    featureImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    published: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    price: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
  });

  const Category = sequelize.define('Category', {
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
  });

  Item.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            resolve('Database sync successful');
        })
        .catch((err) => {
            reject('Unable to sync the database: ' + err.message);
        });
    });
}

module.exports.getAllItems = function () {
    return new Promise((resolve, reject) => {
        sequelize.findAll()
        .then((data) => {
            if (data.length > 0) {
                resolve(data);
            } else {
                reject('No results returned');
            }
        })
        .catch((err) => {
            reject('No results returned: ' + err.message);
        });
    });
}

module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category},
        })
        .then((data) => {
            if (data.length > 0) {
              resolve(data);
            } else {
              reject('No results returned'); 
            }
          })
          .catch((err) => {
            reject('No results returned: ' + err.message);
          });
    });
}

module.exports.getItemsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {itemDate: {[gte]: new Date(minDateStr)}}
        })
        .then((data) => {
            if (data.length > 0) {
              resolve(data); 
            } else {
              reject('No results returned'); 
            }
        })
        .catch((err) => {
            reject('No results returned: ' + err.message);
        });
    });
}

module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {id : id}
        })
        .then((data) => {
            if (data.length > 0) {
              resolve(data); 
            } else {
              reject('No results returned'); 
            }
        })
        .catch((err) => {
            reject('No results returned: ' + err.message);
        });
    });
}

module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;

        for (const key in itemData) {
            if (itemData[key] === "") {
              itemData[key] = null;
            }
          }

        itemData.itemDate = new Date();

        Item.create(itemData)
        .then(() => {
            resolve("Item successfully created");
        })
        .catch((err) => {
            reject("Unable to create item: " + err.message);
        });
    });
}

module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
      for (const key in categoryData) {
          if (categoryData[key] === "") {
            categoryData[key] = null;
          }
        }

      Category.create(categoryData)
      .then(() => {
          resolve("Category successfully created");
      })
      .catch((err) => {
          reject("Unable to create category: " + err.message);
      });
  });
}

module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {published: true},
        })
        .then((data) => {
            if (data.length > 0) {
              resolve(data); 
            } else {
              reject('No results returned'); 
            }
        })
        .catch((err) => {
            reject('No results returned: ' + err.message);
        });
    });
}

module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { 
              published: true,  
              category: category 
            },
          })
            .then((data) => {
              if (data.length > 0) {
                resolve(data);
              } else {
                reject("No results returned"); 
              }
            })
            .catch((err) => {
              reject("No results returned: " + err.message); 
            });
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then((data) => {
            if (data.length > 0) {
              resolve(data);
            } else {
              reject("No results returned"); 
            }
          })
        .catch((err) => {
            reject("No results returned: " + err.message); 
          });
    });
}

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {id: id}
    })
    .then((rowDeleted) => {
      if(rowDeleted > 0)
        resolve("Category deleted successfully");
      else
        reject("No category found with the specified ID");
    })
    .catch((err) => {
        reject("Unable to delete category: " + err.message);
    });
  });
}

module.exports.deleteItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: {id: id}
    })
    .then((rowDeleted) => {
      if(rowDeleted > 0)
        resolve("Item deleted successfully");
      else
        reject("No item found with the specified ID");
    })
    .catch((err) => {
        reject("Unable to delete item: " + err.message);
    });
  });
}


