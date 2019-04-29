function customer(run) {
    var mysql = require("mysql");
    var inquirer = require("inquirer");
    var Table = require("cli-table");

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
        // console.log("connected as id " + connection.threadId);
        afterConnection();
    });

    function afterConnection() {
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            // console.log(res);

            var allProducts = new Table({
                head: ['ID', 'Name', 'Department', 'Price', 'Quantity', 'Sales'],
                colWidths: [10, 40, 20, 10, 10, 15]
            });

            for (i = 0; i < res.length; i++) {
                var rowArr = [];
                rowArr.push(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity, res[i].product_sales);
                allProducts.push(rowArr);
            }

            console.log("");
            console.log(allProducts.toString());
            console.log("");
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
            var buyQuantity = parseInt(choice.quantity);

            purchaseCheck(itemId, buyQuantity)
        })
    };

    function purchaseCheck(itemId, buyQuantity) {
        connection.query(
            "SELECT product_name,stock_quantity,price,product_sales FROM products WHERE item_id = ?",
            [itemId],
            function (err, res) {
                if (err) throw err;

                var itemName = res[0].product_name;
                var itemPrice = parseFloat(res[0].price);
                var itemSales = parseFloat(res[0].product_sales);
                var currentStock = parseInt(res[0].stock_quantity);

                console.log(currentStock);

                if (currentStock < buyQuantity) {
                    console.log("\nNot enough stock available to complete order.\n");
                    connection.end();
                    run();
                } else {

                    var newQuantity = currentStock - buyQuantity;
                    var customerTotal = buyQuantity * itemPrice;
                    var itemSalesTotal = itemSales + customerTotal;

                    connection.query(
                        "UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?", [
                            newQuantity,
                            itemSalesTotal,
                            itemId
                        ],
                        function (err, res) {
                            if (err) throw err;

                            console.log(`\nYour Order
${itemName};
Quantity: ${buyQuantity}
Total: $${customerTotal}\n`)

                            connection.end();
                            run();

                        }
                    );
                }
            });

    }
}

module.exports = customer