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
            message: "Enter Department Name",
            name: "name",
        },
        {
            type: "input",
            message: "Enter Department Overhead",
            name: "overhead",
        }
    ]).then(function (choice) {
        var depName = choice.name;
        var depOverhead = parseFloat(choice.overhead);

        connection.query(
            "INSERT INTO departments(department_name,over_head_costs) VALUES (?,?);",
            [depName,
                depOverhead,
            ],
            function (err, res) {
                if (err) throw err;

                console.log(`\nYou added ${depName} to departments\n`)

                connection.end();

            }
        );
    });

};