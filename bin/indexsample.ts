interface Notes
 {
     five: number;
     ten: number;
     twenty: number;
 }
 
let messageTimerOn = false;
let pin: string = "";
let toWithdraw: string = "";
let balance: number = 0;
let loginScreen = true;
let userAmount = 0;
let initialBalance = 0;
 
 const overdraftLimit: number = 100;
 
 let terminalMessenger= "terminal-message"
 

 const trueBalance = () => balance + overdraftLimit;

 const availableNotes = {five: 4, ten: 15, twenty: 7};
 

 const userNotes = {five: 0, ten: 0, twenty: 0};
 const insertionError = "No more can be inserted!!";
 
 
 const pinMessage = () => "Pin: " + pinToAstrisk();

 const withdrawalMessage = () => 
 {
     if(balance < 0) 
         return "Overdraft: " + (userAmount - initialBalance)  + " | Balance: " + trueBalance() + " | Amount to withdraw: " + toWithdraw;
     else
         return "Balance: " + trueBalance() + " | Amount to withdraw: " + toWithdraw;
 }

 const inputManager = (digit: string) =>
 {
     // If we are still on the login screen...
     if(loginScreen)
         // Keep inserting pin numbers.
         pinInserter(digit);
     // If we have already logged in...
     else
         // Keep inserting withdrawal numbers.
         withdrawalInserter(digit);
 }
 
 const pinInserter = (digit: string) => 
 {
     if(digit.length == 1 && pin.length < 4 && !messageTimerOn)
     {
         pin += digit;
         terminalMessenger = pinMessage();
         console.log("New pin:" + pin);
     }
     else
         displayTimedMessage(insertionError, pinMessage());
 }

 const withdrawalInserter = (digit: string) =>
 {
     if(digit.length == 1 && toWithdraw.length < 5 && !messageTimerOn)
     {
         toWithdraw += digit;
         //terminalMessenger.textContent = withdrawalMessage();
     }
     else
         displayTimedMessage(insertionError, withdrawalMessage());
 }
 

 const digitRemover = () =>
 {
     const deletionError = "No more can be deleted!!";
     if(loginScreen)
     {
         if(pin.length > 0 && !messageTimerOn)
         {
             pin = pin.substring(0, pin.length - 1);
             terminalMessenger = pinMessage();
         }
         else 
             displayTimedMessage(deletionError, pinMessage());
     }
     else
     {
         if(toWithdraw.length > 0 && !messageTimerOn)
         {
             toWithdraw = toWithdraw.substring(0, toWithdraw.length - 1);
             terminalMessenger = withdrawalMessage();
         }
         else 
             displayTimedMessage(deletionError, withdrawalMessage());
     }
 }

 const displayTimedMessage = (message: string, default_message: string) => 
 {
     if(!messageTimerOn)
     {
         messageTimerOn = true;
         const returnToDefaultTime = 2000;
         terminalMessenger = message;
         setTimeout(() => 
         {
             terminalMessenger = default_message;
             messageTimerOn = false;
         }, returnToDefaultTime);
     }
 }
 

 function attemptUserInput()
 {
     // If we are on the Login screen.
     // Attempt to login and retrieve the balance...
     if(loginScreen)
     {
         if(login(pin))
         {
             loginScreen = false;
             displayTimedMessage("PIN correct!", withdrawalMessage());
         }
         else 
         {
             pin = "";
             displayTimedMessage("PIN incorrect!", pinMessage());
         }
     }
     // If we are on the withdrawal screen.
     // Attempt to dispense notes matching the required amount...
     else
     {
         // Cast our string amount to integer.
         const castedWithdrawalAmount = parseInt(toWithdraw);
         // Make sure we have enough before withdrawal attempt...
         if(castedWithdrawalAmount <= trueBalance())
         {
             // Calculate that we got enough notes...
             const enoughCashPresent = haveEnoughCash(castedWithdrawalAmount);
             // Verify that the amount is divisible by our common denominator and
             // that enough notes are present to complete the withdrawal...
             if(castedWithdrawalAmount % 5 == 0 && enoughCashPresent)
             {
                 withdraw(castedWithdrawalAmount);
                 toWithdraw = "";
                 displayTimedMessage("Withdrawn: " + castedWithdrawalAmount, withdrawalMessage());
             }
             // If we don't got enough notes, inform the user...
             else if(!enoughCashPresent)
             {
                 toWithdraw = "";
                 displayTimedMessage("Not enougth notes present!", withdrawalMessage());
             }
             // If we can't dispense that denomination, inform the user...
             else 
             {
                 toWithdraw = "";
                 displayTimedMessage("Can't dispense that denomination!!", withdrawalMessage());
             }
         }
         // If the user doesn't have enough in their account, inform them...
         else 
         {
             toWithdraw = "";
             displayTimedMessage("Not enough in Account!", withdrawalMessage());
         }
     }
 }
 

 function login(pin: string)
 {
     // Indicates whether the pin was correct once passed to the verification url.
     let valid = false;
     // AJAX for http post call.
     const request = new XMLHttpRequest();
     // Set post verb and target url.
     // Also set async to false so that the connection blocks.
     request.open("POST", "https://frontend-challenge.screencloud-michael.now.sh/api/pin/", false);
     // Set contect type as json.
     request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
 
     // Set our callback function.
     request.onreadystatechange =  function () { 
         // If status is 200 = OK
         // Set balance to retrieved balance
         if (request.readyState == 4 && request.status == 200) {
             // Create object from retrieved json.
             var json = JSON.parse(request.responseText);
             // Set the balance the user has from the retrieved balance figure.
             balance = json.currentBalance;
             initialBalance = balance;
             // Indicate that the login was successful.
             valid = true;
         }
     }
     // Create JSON string from object.
     const postJSON = JSON.stringify({"pin": pin})
     // Make request.
     request.send(postJSON);
 
     return valid;
 }
 

 function withdraw(amount_to_withdraw: number)
 {
     let trueBalance: number = balance + overdraftLimit;
 
     if(amount_to_withdraw > 0 && amount_to_withdraw <= trueBalance)
     {
         // Calculate the number of notes to dispense and the total 
         // amount withdrawn.
         const batchOfNotes = getDenominationsNeeded(amount_to_withdraw);
     
         // Update user and atm globals.
         updateUserStats(batchOfNotes);
         // Update html panel containing notes and total.
         //updateStatsPanel();
     }
 }
 
 
 function getDenominationsNeeded(amount: number)
 {
     const denominations = [20, 10, 5];
     const notesAvailable = [availableNotes.twenty, availableNotes.ten, availableNotes.five];
     const totalNotes = availableNotes.twenty + availableNotes.ten + availableNotes.five;
     const noteLimits = [amount / totalNotes, amount / totalNotes, amount / totalNotes]
     const notesNeeded = [0, 0, 0];
 
     // iterate through each denomination.
     for(let i = 0; i < denominations.length; i ++)
         // count each one required until amount is zero.
         while(amount >= denominations[i] && notesAvailable[i] > 0 && notesNeeded[i] < noteLimits[i])
         {
             notesNeeded[i] ++;
             notesAvailable[i] --;
             amount -= denominations[i];
         }
 
     // If we still haven't enough notes for dispensing, reiterate until we have enough...
     if(amount != 0)
         // iterate through each denomination.
         for(let i = 0; i < denominations.length; i ++)
         // count each one required until amount is zero.
         while(amount >= denominations[i] && notesAvailable[i] > 0)
         {
             notesNeeded[i] ++;
             notesAvailable[i] --;
             amount -= denominations[i];
         }
 
     // Update the global notes available
     availableNotes.twenty = notesAvailable[0];
     availableNotes.ten = notesAvailable[1];
     availableNotes.five = notesAvailable[2];
 
     // Return as a Notes object.
     return {twenty: notesNeeded[0], ten: notesNeeded[1], five: notesNeeded[2]};
 }
 
 function updateUserStats(notesWithdrawn: Notes)
 {
     // Calcualate amount withdrawn by denomination of notes.
     const totalWithdrawn = (notesWithdrawn.five * 5) + (notesWithdrawn.ten * 10) + (notesWithdrawn.twenty * 20);
     // Update the balance.
     balance -= totalWithdrawn;
     // Update the amount the user has.
     userAmount += totalWithdrawn;
 
     // Update the number of notes the user has.
     userNotes.five += notesWithdrawn.five;
     userNotes.ten += notesWithdrawn.ten;
     userNotes.twenty += notesWithdrawn.twenty;
 }
 
//  function updateStatsPanel()
//  {
//      document.getElementById('twenty-notes').textContent = "£20 notes: " + userNotes.twenty;
//      document.getElementById('ten-notes').textContent = "£10 notes: " + userNotes.ten;
//      document.getElementById('five-notes').textContent = "£5 notes:  " + userNotes.five;
//      document.getElementById('total').textContent = "Total:   " + userAmount;
//  }
 

 function pinToAstrisk()
 {
     let astrisks = "";
     for(let i = 0;i < pin.length; i ++)
         astrisks += "*";
 
     return astrisks;
 }

 function calculateTotalRemainingCash()
 {
     return (availableNotes.five * 5) + (availableNotes.ten * 10) + (availableNotes.twenty * 20);
 }
 
 
 function isATMEmpty()
 {
     return calculateTotalRemainingCash() == 0;
 }

 function haveEnoughCash(to_withdraw: number)
 {
     return to_withdraw <= calculateTotalRemainingCash();
 }