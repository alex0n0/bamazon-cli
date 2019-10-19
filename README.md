# Bamazon Storefront

This application is a customer and manager interface for purchasing and managing products, respectively.

## Project Structure

To begin, create a .env file and add your MySql database password.

The main scripts for customer and manager interfaces exist inside ./assets/scripts.

initializeDB.js should be run before using the customer and manager interfaces with:

    npm run initializeDB

## Instructions

Clone the repository and run the following commands in the command line/terminal from the root of the project folder:

    npm run customer
    npm run manager

Customer Interface
![Image - Prompts](./assets/screenshots/customer_screenshot.png)

Manager Interface
![Image - Prompts](./assets/screenshots/manager_screenshot.png)

## Technologies Used

* Node.js
* Node packages
  * inquirer
  * mysql
  * figlet
  * table
  * colors
