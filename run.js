var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var customer = require("./bamazonCustomer.js");
var manager = require("./bamazonManager.js");
var supervisor = require("./bamazonSupervisor.js");


startUp();



function startUp() {
    inquirer.prompt({
            type: "list",
            message: "Select One",
            name: "action",
            choices: ["Customer", "Manager", "Supervisor", "< Exit"]
        },

    ).then(function (choice) {
        // console.log(choice.action)
        switch (choice.action) {
            case "Customer":
                customer(startUp);
                break;

            case "Manager":
                manager(startUp);
                break;

            case "Supervisor":
                supervisor(startUp);
                break;

            case "< Exit":
                console.log("Good Bye.");
                break;
        }

    });
}