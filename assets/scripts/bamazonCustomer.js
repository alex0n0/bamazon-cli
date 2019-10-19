// Imports
const mysql = require('mysql');
const inquirer = require('inquirer');
const figlet = require('figlet');
const colors = require('colors');
const { table } = require('table');

const keys = require('../../keys.js');
const db_password = keys.keys.db_password;

// Connection to database
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: db_password,
    database: 'bamazon'
});
connection.connect();









// Output heading
figlet('Bamazon', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data + ' Customer Interface');

    // This function is used to display
    //// table of products AND
    //// prompts to make product order
    runPrompt();
});







function runPrompt() {
    connection.query(`SELECT * FROM products`, function (error, results, fields) {
        if (error) { throw error };

        renderProductTable(results);

        var matchedItem; // Matched item is captured for later use
        inquirer.prompt([
            {
                type: 'input',
                name: 'itemId',
                message: 'Enter item ID (e.g. 4)',
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
                message: 'Enter item quantity (e.g. 3)',
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
            // Items in stock must be greater than order quantity
            if (Number(answers.itemQuantity) > Number(matchedItem[0].stock_quantity)) {
                console.log(colors.red.bold('INSUFFICIENT STOCK!'));
                continuePrompt();
            } else {
                if (Number(answers.itemQuantity) == 0) {
                    console.log(colors.green.bold('You chose 0 - on action'));
                    continuePrompt();
                } else {
                    console.log(colors.green.bold('SUFFICIENT STOCK'));
                    // Update stock quantity of ordered item
                    connection.query(`UPDATE products
                        SET stock_quantity = ${Number(matchedItem[0].stock_quantity) - Number(answers.itemQuantity)}
                        WHERE item_id = ${Number(answers.itemId)}
                    `, function (error, results, fields) {
                        if (error) { throw error };
                        continuePrompt();
                    });
                }
            }
        });
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

// This function is a prompt allowing user to quit the application
function continuePrompt() {
    var enumContinueChoices = { continue: 'Continue', quit: colors.red.bold('Quit') };

    inquirer.prompt([
        {
            type: 'list',
            name: 'continueOrdering',
            choices: [enumContinueChoices.continue, enumContinueChoices.quit],
            default: 0,
            message: 'Continue ordering?'
        }
    ]).then(answer => {
        if (answer.continueOrdering == enumContinueChoices.continue) {
            runPrompt();
        } else {
            connection.end(); // End connection when quitting
            return;
        }
    });
}



