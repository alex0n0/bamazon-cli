// Imports
const mysql = require('mysql');
const inquirer = require('inquirer');
const figlet = require('figlet');
const colors = require('colors');
const { table } = require('table');

const keys = require('../../keys.js');
const db_password = keys.keys.db_password;

const enumOperationOptions = {
    viewAllStock: 'View Products for Sale',
    viewLowStock: 'View Low Inventory',
    addRestock: 'Add More Inventory',
    addNewProduct: 'Add New Product',
    quit: colors.red.bold('QUIT')
}


// Connection to database
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: db_password,
    database: 'bamazon'
});
connection.connect();












figlet('Bamazon', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data + ' Manager Interface');

    runPrompt();
});







function runPrompt() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'operationOptions',
            choices: [
                enumOperationOptions.viewAllStock,
                enumOperationOptions.viewLowStock,
                enumOperationOptions.addRestock,
                enumOperationOptions.addNewProduct,
                enumOperationOptions.quit,
            ],
            default: 0,
            message: 'Choose an operation'
        }
    ]).then(answer => {
        switch (answer.operationOptions) {
            case enumOperationOptions.viewAllStock:
                viewAllStock();
                break;
            case enumOperationOptions.viewLowStock:
                viewLowStock();
                break;
            case enumOperationOptions.addRestock:
                addRestock();
                break;
            case enumOperationOptions.addNewProduct:
                addNewProduct();
                break;
            case enumOperationOptions.quit:
                connection.end();
                return;
        }
    });
}










function viewAllStock() {
    connection.query(`SELECT * FROM products`, function (error, results, fields) {
        if (error) { throw error };

        renderProductTable(results);
        runPrompt();
    });
}
function viewLowStock() {
    connection.query(`SELECT * 
        FROM products
        WHERE stock_quantity <= 5
    `, function (error, results, fields) {
        if (error) { throw error };

        renderProductTable(results);
        runPrompt();
    });
}

function addRestock() {
    connection.query(`SELECT * FROM products`, function (error, results, fields) {
        if (error) { throw error };

        renderProductTable(results);

        var matchedItem; // Matched item is captured for later use
        inquirer.prompt([
            {
                type: 'input',
                name: 'itemId',
                message: 'Enter item ID (e.g. 1)',
                validate: function (input) {
                    // match the item. if no items are returned, do not allow input
                    matchedItem = results.filter((currVal) => {
                        if (input == currVal.item_id) {
                            return true;
                        }
                        return false;
                    });

                    // DO NOT ALLOW: 1) null, 2) non-digit, 3) no match
                    if (input.trim().length == 0
                        || input.search(/[^0-9]/gi) != -1
                        || matchedItem.length == 0) {
                        return false;
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'itemQuantity',
                message: 'Enter quantity to increase by (e.g. 4)',
                validate: function (input) {
                    // DO NOT ALLOW: 1) null, 2) non-digit
                    if (input.trim().length == 0
                        || input.search(/[^0-9]/gi) != -1) {
                        return false;
                    }
                    return true;
                }
            }
        ]).then(answers => {
            // Update stock quantity of ordered item
            connection.query(`UPDATE products
                    SET stock_quantity = ${Number(matchedItem[0].stock_quantity) + Number(answers.itemQuantity)}
                    WHERE item_id = ${Number(answers.itemId)}
                `, function (error, results, fields) {
                if (error) { throw error };
                runPrompt();
            });
        });
    });
}

function addNewProduct() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'productName',
            message: 'Enter a product name',
            validate: function (input) {
                // DO NOT ALLOW: 1) null
                if (input.trim().length == 0) {
                    return false;
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter a department name',
            validate: function (input) {
                // DO NOT ALLOW: 1) null
                if (input.trim().length == 0) {
                    return false;
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'price',
            message: 'Enter a price',
            validate: function (input) {
                // DO NOT ALLOW: 1) null, 2) non-digit, but allow ONE decimal, 3) spaces
                if (input.trim().length == 0 || input.search(/^(\d+\.?\d*|\.\d+)$/g) != 0) {
                    return false;
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'stockQuantity',
            message: 'Enter stock quantity',
            validate: function (input) {
                // DO NOT ALLOW: 1) null, 2) non-digit
                if (input.trim().length == 0 || input.search(/[^0-9]/gi) != -1) {
                    return false;
                }
                return true;
            }
        },
    ]).then(answers => {
        // console.log(`${answers.productName}, ${answers.departmentName}, ${Number(answers.price)}, ${Number(answers.stockQuantity)}`);
        connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
            VALUES ('${answers.productName}', '${answers.departmentName}', ${Number(answers.price)}, ${Number(answers.stockQuantity)})
        `, function (error, results, fields) {
            if (error) { throw error };

            runPrompt();
        });
        // runPrompt();
    });
}








// This function is a utility function for rendering the products table
function renderProductTable(results) {
    var tableData = [['ID', 'PRODUCT NAME', 'DEPARTMENT', 'PRICE', 'STOCK']];
    var tableOutput;
    results.forEach((currVal) => {
        var row = [];
        row.push(currVal.item_id);
        row.push(currVal.product_name);
        row.push(currVal.department_name);
        row.push('$' + currVal.price);
        row.push(currVal.stock_quantity);
        tableData.push(row);
    });
    tableOutput = table(tableData);
    console.log(tableOutput);
}