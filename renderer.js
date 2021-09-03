// renderer.js
const zerorpc = require("zerorpc");
let client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

// Note: The error handling in this minor project uses a 'function that acts as a procedure' approach. Any function that can have an error will take
//        an output argument, called error. If the status variable returned is false, that output variable has been modified.
//        Use it in writing the error message to the user. If the status is true, then do nothing with the error.

// Code for handling input sanitization -------------------------------------------------------------------------------------------------------
// Input: A string with numbers and '-' signs. Assume the string is non-empty.
// Output: A boolean. True if there is only one minus sign that is to the left of all numbers and decimal separators.
//        False if there is already a minus sign in the string or if the minus sign is to the right of a number or decimal separator
function validMinusSignPlacement(s, error) {
  // create an array from the input
  let stringArray = s.split("");
  const MINUS_SIGN_CHARACTER_CODE = 45;

  // filter out the minus signs from the input array
  let minusSigns = stringArray.filter((elem) => {
    return elem.charCodeAt(0) == MINUS_SIGN_CHARACTER_CODE;
  });

  // true if there is only one minus sign, false if there are two or more
  let hasValidMinusSignAmt = minusSigns.length <= 1;

  // return false if the minus sign amount is invalid
  if (!hasValidMinusSignAmt) {
    error.message = "Error: There can only be one minus sign in each box.";
    return false;
  }
  // check that the minus sign is in the first position (only way to be to the left of all numbers) -- if not the minus sign placement is invalid
  if (stringArray[0].charCodeAt(0) != MINUS_SIGN_CHARACTER_CODE) {
    error.message = "Error: A minus sign must be placed at the start of a box.";
    return false;
  }
  // minus sign is valid
  return true;
}

// Input: A non-empty string that contains numbers, up to one minus sign, and up to one decimal separator
// Outpus: A boolean that indicates if the newest decimal separator entry to the string is valid.
// Note: Valid means there is only one decimal separator in the string, and that it is to rhe right of a minus sign if one exists.
function validDecimalSeparatorPlacement(s, error) {
  // make sure there is only one decimal separator in the code
  let decimalSeparatorAmt = 0;
  const DECIMAL_SEPARATOR_CHARACTER_CODE = 46;

  for (const char of s) {
    if (char.charCodeAt(0) == DECIMAL_SEPARATOR_CHARACTER_CODE) {
      decimalSeparatorAmt += 1;
    }
  }

  let validDecimalSeparatorAmt = decimalSeparatorAmt <= 1;
  if (!validDecimalSeparatorAmt) {
    error.message =
      "Error: Cannot place more than one decimal separator in a number";
    return false;
  }
  // check that the decimal separator is not to the left of a minus sign
  if (!validCharacterPlacement(s)) {
    error.message =
      "Error: Decimal separators must be to the right of a minus sign.";
    return false;
  }

  return true;
}

// Input: A non-empty string that contains numbers, up to one minus sign, and up to one decimal separator
// Output: A boolean. False when a number/decimal separator is placed to the left of a minus sign. True any other time
function validCharacterPlacement(s) {
  // get the minus sign's position from the string
  let minusSignIdx = s.indexOf("-");

  // if there isn't a minus sign in the string then the number placement is valid
  if (minusSignIdx == -1) return true;

  if (minusSignIdx > 0) return false;

  return true;
}

// Input: A non empty string with one character
// Output: True or false. True if the character is a valid input: '.', '-', or 0-9 -- false otherwise
function validCharacter(inputCharacter) {
  return (
    inputCharacter.charCodeAt(0) == 45 ||
    inputCharacter.charCodeAt(0) == 46 ||
    (inputCharacter.charCodeAt(0) >= 48 && inputCharacter.charCodeAt(0) <= 58)
  );
}

function sanitizeInput(e) {
  // get the current input value
  let currentValue = e.target.value;
  // get the most recently added value
  let newInputIdx = e.target.selectionStart - 1;
  let newInput = e.target.value[newInputIdx];

  // check if the new input is an invalid character
  if (!validCharacter(newInput)) {
    writeError("Error: Invalid character");
    e.target.value =
      currentValue.slice(0, newInputIdx) + currentValue.slice(newInputIdx + 1);
    e.target.selectionStart = newInputIdx;
    return;
  }

  // check if the input value is a minus sign
  if (newInput.charCodeAt(0) == 45) {
    let error = { message: "" };
    if (!validMinusSignPlacement(currentValue, error)) {
      e.target.value =
        currentValue.slice(0, newInputIdx) +
        currentValue.slice(newInputIdx + 1);
      e.target.selectionStart = newInputIdx;
      writeError(error.message);
    }
    return;
  }

  // check if input value is a decimal separator
  if (newInput.charCodeAt(0) == 46) {
    let error = { message: "" };
    if (!validDecimalSeparatorPlacement(currentValue, error)) {
      e.target.value =
        currentValue.slice(0, newInputIdx) +
        currentValue.slice(newInputIdx + 1);
      e.target.selectionStart = newInputIdx;
      writeError(error.message);
    }
    return;
  }

  // a valid character representing a number 0-9
  if (newInput.charCodeAt(0) >= 48 && newInput.charCodeAt(0) <= 58) {
    if (!validCharacterPlacement(currentValue)) {
      e.target.value =
        currentValue.slice(0, newInputIdx) +
        currentValue.slice(newInputIdx + 1);
      e.target.selectionStart = newInputIdx;
      writeError("Error: A number cannot be placed in front of a minus sign.");
    }
  }
}

// register change handlers for the integer inputs -- only allow numbers, decimals, or minus signs
let integerInputs = document.querySelectorAll(".integer");
integerInputs.forEach((input) => {
  input.addEventListener("input", sanitizeInput);
});

// Handle logic for creating a sum, validating if a sum can be created, and displaying the sum ------------------------------------------------

// select the result div used to display the result of calculations
let result = document.querySelector(".result");

// select the sum button used to begin calculations
let sumBtn = document.querySelector(".sum_btn");

// add a listener to the sum button that takes both user given numbers and sends them to the Python server for calculation
// place the result of that calculation in the result div
sumBtn.addEventListener("click", (e) => {
  // validate that both inputs have input values that can be used to create a sum
  let error = { message: "" };
  if (!inputsCanCreateSum(error)) {
    writeError(error.message);
    return;
  }

  // hide the errir message box if it is still showing
  errorMessageBox.style = "visibility: hidden";

  // get the sum inputs
  let integerInputs = document.querySelectorAll(".integer");
  // create an array that will store the individual values
  let leftHandSide = [];
  // iterate through the integerInputs and get the textcontent into the leftHandSide array
  integerInputs.forEach((input) => {
    let value = input.value;
    leftHandSide.push(value);
  });

  // join the values into a string with a '|' as a separator
  let integersString = leftHandSide.join("|");

  // send the the values together in a signle string with a '+' inbetween
  // by invoking the client
  client.invoke("calc", integersString, (error, res) => {
    // check for an error
    if (error) {
      console.error(error);
    } else {
      // otherwise:
      // set the result into the result div
      result.textContent = res;
    }
  });
});

// Input: A mutable error object.
// output: Boolean. Can be true or false. True when both inputs have at least one number. False when one input does not.
function inputsCanCreateSum(error) {
  // track if each input is valid -- meaning, can it be used to create a sum or not
  let validInputs = [false, false];

  // get both inputs and validate them
  integerInputs.forEach((input, key) => {
    // get the current input
    let currentValue = input.value;

    // iterate through the input's characters
    for (const char of currentValue) {
      // check if the current character's character code is that of a number
      if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 58) {
        // mark the current input box as a valid input
        validInputs[key] = true;
      }
    }
  });

  // check if at least one input is invalid
  if (!validInputs[0] || !validInputs[1]) {
    // spawn an error message telling the user that we cannot create a sum unless they provide numbers in each input box
    error.message =
      "Error: You must place numbers in both boxes before you can create a sum.";
    // notify the caller that the inputs do not have numbers and cannot create a sun
    return false;
  }

  // notify the caller that the inputs can be used to create a sum
  return true;
}

// Handle logic for the error message box -----------------------------------------------------------------------------------

// Write the given string input into the error message container and make the error visible to the user
function writeError(s) {
  errorMessageBox.firstElementChild.textContent = s;
  errorMessageBox.style = "visibilty: visible";
}

// Event for closing the error message box
let errorMessageBox = document.querySelector(".error-message");
errorMessageBox.addEventListener("click", function (e) {
  // hide the error message when the 'x' button is clicked (event is caught in the bubbling phase)
  if (e.target.name == "close-error-btn") {
    // hide the error message box
    this.style = "visibility: hidden";
  }
});
