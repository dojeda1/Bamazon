function manager(run) {
    var mysql = require("mysql");
    var inquirer = require("inquirer");
    var Table = require("cli-table");

    var pw = "pass"

    inquirer.prompt({
        type: "password",
        message: "Enter Password",
        name: "password",
    }).then(function (choice) {
        if (choice.password === pw) {

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
                startUp();

            });

            function startUp() {
                inquirer.prompt({
                        type: "list",
                        message: "Which action would you like to perform?",
                        name: "action",
                        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "< Main Menu"]
                    },

                ).then(function (choice) {
                    // console.log(choice.action)
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
                            addProduct();
                            break;

                        case "< Main Menu":
                            connection.end();
                            run();
                            break;
                    }

                })
            }

            function viewProducts() {
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
            };

            function viewLowInv() {
                connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function (err, res) {
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
                    var idPresent = false;

                    connection.query("SELECT item_id FROM products", function (err, res) {
                        var idArr = []
                        if (err) throw err;
                        // console.log(res)
                        for (i = 0; i < res.length; i++) {
                            idArr.push(String(res[i].item_id));
                        }
                        idPresent = idArr.includes(itemId);

                        // console.log(idArr);

                        if (addQuantity > 0 && itemId > 0 && idPresent === true) {

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

                                            startUp();

                                        }
                                    );
                                });
                        } else {
                            console.log("\nUser inputs must fit given fields. Try again.\n")
                            startUp();
                        }
                    })

                });
            };

            function addProduct() {
                var depArr = [];

                connection.query("SELECT department_name FROM departments", function (err, res) {
                    if (err) throw err;
                    for (i = 0; i < res.length; i++) {
                        depArr.push(res[i].department_name);
                    }
                    // console.log(depArr);
                });

                inquirer.prompt([{
                        type: "input",
                        message: "Enter Product Name",
                        name: "name",
                    },
                    {
                        type: "list",
                        message: "Choose Department",
                        name: "department",
                        choices: depArr
                    },
                    {
                        type: "input",
                        message: "Enter Product Price",
                        name: "price",
                    },
                    {
                        type: "input",
                        message: "Enter Product Quantity",
                        name: "quantity",
                    }
                ]).then(function (choice) {
                    var itemName = choice.name
                    var itemDep = choice.department;
                    var itemPrice = parseFloat(choice.price);
                    var itemQuantity = parseInt(choice.quantity);

                    if (itemPrice > 0 && itemQuantity > 0 && itemName.length > 0) {
                        connection.query(
                            "INSERT INTO products(product_name,department_name,price,stock_quantity,product_sales) VALUES (?,?,?,?,0);",
                            [itemName,
                                itemDep,
                                itemPrice,
                                itemQuantity
                            ],
                            function (err, res) {
                                if (err) throw err;

                                console.log(`\nYou added ${itemName} to products\n`)

                                startUp();

                            }
                        );

                    } else {
                        console.log("\nUser inputs must fit given fields. Try again.\n")
                        startUp();
                    }


                });

            };

        } else {
            console.log("\nIncorrect Password.\n")
            run();
        }
    });
};

module.exports = manager;