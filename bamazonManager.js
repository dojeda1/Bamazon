var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);

    inquirer.prompt({
            type: "list",
            message: "Which action would you like to perform?",
            name: "action",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        },

    ).then(function (choice) {
        console.log(choice.action)
        switch (choice.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLowInv();
                break;

            case "Add to Inventory":
                addInv();
                break;

            case "Add New Product":
                AddProduct();
                break;
        }

    })
});

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        connection.end();
    })
};

function viewLowInv() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log(res);
        connection.end();
    })
};

function addInv() {
    inquirer.prompt([{
            type: "input",
            message: "Enter ID of the product you wish to add inventory to.",
            name: "id",
        },
        {
            type: "input",
            message: "How many would you like to add?",
            name: "quantity",
        },
    ]).then(function (choice) {
        var itemId = choice.id;
        var addQuantity = parseInt(choice.quantity);

        connection.query(
            "SELECT product_name,stock_quantity FROM products WHERE item_id = ?",
            [itemId],
            function (err, res) {
                if (err) throw err;

                var itemName = res[0].product_name;
                var currentStock = parseInt(res[0].stock_quantity);

                console.log(currentStock);

                var newQuantity = currentStock + addQuantity;

                connection.query(
                    "UPDATE products SET stock_quantity = ? WHERE item_id = ?", [
                        newQuantity,
                        itemId
                    ],
                    function (err, res) {
                        if (err) throw err;

                        console.log(`\nYou added ${addQuantity} to ${itemName};
New Quantity: ${newQuantity}\n`)

                        connection.end();

                    }
                );
            });

    });
}