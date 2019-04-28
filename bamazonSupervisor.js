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
            choices: ["View Products Sales by Department", "Create New Department"]
        },

    ).then(function (choice) {
        console.log(choice.action)
        switch (choice.action) {
            case "View Products Sales by Department":
                viewSales();
                break;

            case "Create New Department":
                addDepartment();
                break;

        }

    })
});

function viewSales() {
    connection.query(`SELECT departments.department_id,departments.department_name,departments.over_head_costs AS "Overhead" ,SUM(products.product_sales) AS "Total Sales", ( SUM(products.product_sales) - departments.over_head_costs) AS "Profit"
FROM departments
LEFT OUTER JOIN products ON departments.department_name = products.department_name
GROUP BY products.department_name
ORDER BY departments.department_id;`, function (err, res) {
        if (err) throw err;
        console.log(res);
        connection.end();
    })
};

function addDepartment() {
    inquirer.prompt([{
            type: "input",
            message: "Enter Product Name",
            name: "name",
        },
        {
            type: "list",
            message: "Choose Department",
            name: "department",
            choices: ["Electronics", "Home & Kitchen", "Books", "Office Products", "Toys & Games", "Clothing", "Sports & Outdoors", "Automotive"]
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

                connection.end();

            }
        );
    });

};