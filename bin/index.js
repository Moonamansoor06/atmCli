#! /usr/bin/env node
import clear from "clear";
import figlet from "figlet";
import colors from "colors";
import chalk from "chalk";
import inquirer from "inquirer";
function main() {
    clear();
    console.log(chalk.green(figlet.textSync("ATM", { horizontalLayout: "full" })));
    console.log('\n');
    const msg1 = colors.rainbow("input User Id ");
    const msg2 = colors.rainbow("input yout pin ");
    const msg3 = colors.rainbow("input account type  ");
    const msg4 = colors.rainbow(" input your required amount  ");
    console.log("");
    const list = ["current", "savings"];
    // const userIdList=["Moona","Saher","Kiran"]
    // const pinList=["1234","5678","91011"]
    const users = [{
            userId: "01",
            userName: "moona",
            userPin: "1234",
            amountPresent: 200300
        },
        { userId: "02",
            userName: "kiran",
            userPin: "5678",
            amountPresent: 550300
        },
        { userId: "03",
            userName: "sahar",
            userPin: "0180",
            amountPresent: 1250300
        },
        { userId: "04",
            userName: "mansoor",
            userPin: "0372",
            amountPresent: 2250300
        },
    ];
    let userPresent = false;
    let userIDEntered = "";
    let arrayIndex = 0;
    console.log(chalk.green(users.map((user, ind) => {
        console.log(`${ind + 1}. user name ${user.userName} \n user pin ${user.userPin}\n`);
    })));
    async function oper() {
        await inquirer
            .prompt([
            {
                name: "userId",
                type: "string",
                message: msg1,
            },
            {
                name: "pin",
                type: "password",
                message: msg2,
                when: ((answers) => {
                    return answers.userId;
                })
            },
            {
                name: "accType",
                type: "list",
                message: msg3,
                choices: list,
                when: ((answers) => {
                    return answers.pin;
                })
            },
        ]).then((answers) => {
            users.map((user, index) => {
                if (user.userName === answers.userId && user.userPin === answers.pin) {
                    userPresent = true;
                    arrayIndex = index;
                    userIDEntered = user.userId;
                }
            });
            if (!userPresent)
                console.log("incorrect user or pin");
        });
    }
    async function userOper() {
        if (userPresent) {
            await inquirer.prompt([
                {
                    name: "amount",
                    type: "number",
                    message: msg4,
                },
            ]).then((answers) => {
                users.map((useramnt, index) => {
                    if (userIDEntered === useramnt.userId) {
                        if (answers.amount <= useramnt.amountPresent) {
                            console.log("transaction successful");
                        }
                        else
                            console.log("insuffecient amount");
                    }
                });
                users[arrayIndex].amountPresent = users[arrayIndex].amountPresent - answers.amount;
                console.log("your new amount is :", users[arrayIndex].amountPresent);
            });
        }
    }
    async function doAgain() {
        let msg4 = chalk.greenBright('\n Do you wish to continue, press y or Yes');
        let playAgain;
        do {
            await oper();
            await userOper();
            playAgain = await inquirer.prompt([{
                    name: "play",
                    type: "input",
                    message: msg4
                }]);
        } while (playAgain.play == 'yes' || playAgain.play == 'y' || playAgain.play == 'Yes' || playAgain.play == 'Y');
    }
    doAgain();
    // let firstStr = question( colors.rainbow('Enter your First number \n', )) ;
    // console.log("")
    // let secondStr = question(colors.rainbow('Enter your Second number \n') );
    // console.log("")
    // console.log(colors.rainbow("Enter operator"))
    // let operatorStr=Operator.opeartor
    // console.log(operatorStr)
    // let operatorStr = prompt({limit:['+','-','*','/','%']}) ;
    // const isNumber=(str:string):boolean=>{
    //   const convertToNum=parseInt(str)
    //   const isNum:boolean=Boolean(!isNaN(convertToNum) )
    //   return isNum
    // }
    // const firstNum=parseInt(firstStr)
    // const secondNum=parseInt(secondStr)
    //const isValidInput:boolean=isNumber(firstStr) && isOperator(operatorStr) && isNumber(secondStr)
}
main();
