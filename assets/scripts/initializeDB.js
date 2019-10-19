var mysql = require('mysql');
const keys = require('../../keys.js');
const db_password = keys.keys.db_password;

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: db_password,
    database: 'bamazon'
});

connection.connect();

connection.query('CREATE DATABASE IF NOT EXISTS bamazon', function (error, results, fields) {
    if (error) { throw error };
});

connection.query(`CREATE TABLE IF NOT EXISTS products (
        item_id INTEGER AUTO_INCREMENT,
        product_name VARCHAR(255),
        department_name VARCHAR(255),
        price DOUBLE,
        stock_quantity INT,
        PRIMARY KEY (item_id)
    )`, function (error, results, fields) {
    if (error) { throw error };
});

connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
    VALUES
        ('Bamazon Detergent', 'Kitchen', 12.50, 59),
        ('Bamazon Plastic Bottle', 'Kitchen', 11.25, 105),
        ('Bamazon Crackers', 'Pantry', 4.99, 15),
        ('Bamazon Cookies', 'Pantry', 3.50, 2),
        ('Bamazon Ice Cream', 'Freezer', 5.80, 33),
        ('Bamazon Frozen Peas', 'Freezer', 12.00, 28),
        ('Bamazon Chew Toy', 'Pet', 9.45, 1000),
        ('Bamazon Flea Drops', 'Pet', 22.20, 88),
        ('Bamazon Beer', 'Liquor', 30.00, 14),
        ('Bamazon Fruit Juice', 'Drinks', 5.80, 51)
    `, function (error, results, fields) {
    if (error) { throw error };
});

connection.end();
