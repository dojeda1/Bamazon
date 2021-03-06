function supervisor(run) {
    var mysql = require("mysql");
    var inquirer = require("inquirer");
    var Table = require('cli-table');

    var pw = "word"

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
                        choices: ["View Products Sales by Department", "Create New Department", "< Main Menu"]
                    },

                ).then(function (choice) {
                    // console.log(choice.action)
                    switch (choice.action) {
                        case "View Products Sales by Department":
                            viewSales();
                            break;

                        case "Create New Department":
                            addDepartment();
                            break;

                        case "< Main Menu":
                            connection.end();
                            run();
                            break;
                    }

                });
            }

            function viewSales() {
                connection.query(`SELECT departments.department_id,departments.department_name,departments.over_head_costs AS "overhead" ,SUM(IFNULL(products.product_sales,0)) AS "total_sales", ( SUM(IFNULL(products.product_sales,0)) - departments.over_head_costs) AS "profit"
FROM departments
LEFT OUTER JOIN products ON departments.department_name = products.department_name
GROUP BY products.department_name
ORDER BY departments.department_id;`, function (err, res) {
                    if (err) throw err;
                    // console.log(res);
                    var allDepartments = new Table({
                        head: ['ID', 'Department', 'Overhead', 'Total Sales', 'Profit'],
                        colWidths: [10, 20, 15, 15, 15]
                    });

                    for (i = 0; i < res.length; i++) {
                        var rowArr = [];
                        rowArr.push(res[i].department_id, res[i].department_name, res[i].overhead, res[i].total_sales, res[i].profit);
                        allDepartments.push(rowArr);
                    }

                    console.log("");
                    console.log(allDepartments.toString());
                    console.log("");
                    startUp();
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

                    if (depOverhead > 0 && depName.length > 0) {

                        connection.query(
                            "INSERT INTO departments(department_name,over_head_costs) VALUES (?,?);",
                            [depName,
                                depOverhead,
                            ],
                            function (err, res) {
                                if (err) throw err;

                                console.log(`\nYou added ${depName} to departments\n`)

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
    })


}

module.exports = supervisor;