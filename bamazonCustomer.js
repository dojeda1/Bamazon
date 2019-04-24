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
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        startUp();
    })
}

function startUp() {
    inquirer.prompt([{
            type: "input",
            message: "What is the ID of the product you wish to buy?",
            name: "id",
        },
        {
            type: "input",
            message: "How many would you like to buy?",
            name: "quantity",
        },
    ]).then(function (choice) {
        var itemId = choice.id;
        var buyQuantity = choice.quantity;

        purchaseCheck(itemId, buyQuantity)
    })
};

function purchaseCheck(itemId, buyQuantity) {
    connection.query(
        "SELECT product_name,stock_quantity,price FROM products WHERE item_id = ?",
        [itemId],
        function (err, res) {
            if (err) throw err;

            var itemName = res[0].product_name;
            var itemPrice = res[0].price;
            var currentStock = res[0].stock_quantity;

            console.log(currentStock);

            if (currentStock < buyQuantity) {
                console.log("Not enough stock available to complete order.");
            } else {

                var newQuantity = currentStock - buyQuantity;

                connection.query(
                    "UPDATE products SET stock_quantity = ? WHERE item_id = ?", [
                        newQuantity,
                        itemId
                    ],
                    function (err, res) {
                        if (err) throw err;

                        console.log(`\nYour Order
${itemName};
Quantity: ${buyQuantity}
Total: $${buyQuantity * itemPrice}\n`)

                        connection.end();

                    }
                );
            }
        });

}