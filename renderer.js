// renderer.js
const zerorpc = require("zerorpc");
let client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");

// Input: A string with numbers and '-' signs. Assume the string is non-empty.
// Output: A boolean. True if negative signs are to the left of numbers. False if negative signs are to the right.
function validMinusSignPlacement(s) {
  // get the last value -- should be a minus sign
  let minusSign = s[s.length - 1];

  // iterate from the last position to the first position
  for (let idx = s.length - 1; idx >= 0; idx--) {
    // check if the charcatcer code in each position is not equal to the value for a minus sign
    if (s.charCodeAt(idx) != minusSign.charCodeAt(0)) {
      // return false as the position is invalid
      return false;
    }
  }

  return true;
}

// Input: A string with numbers, minus signs, and perhaps decimal separators. Assume the string is non-empty.
// Outpus: A boolean that indicates if the newest decimal separator entry to the string is valid.
// Note: Valid means there is only one decimal separator in the string.
function validDecimalSeparator(s) {
  // get the last value -- should be a minus sign
  let decimalSeparator = s[s.length - 1];

  // iterate from the last position to the first position
  for (let idx = s.length - 2; idx >= 0; idx--) {
    // check if the charcatcer code in each position is not equal to the value for a minus sign
    if (s.charCodeAt(idx) == decimalSeparator.charCodeAt(0)) {
      // return false as the position is invalid
      return false;
    }
  }

  return true;
}

function writeError(s) {
  errorMessageBox.firstElementChild.textContent = s;
  errorMessageBox.style = "visibilty: visible";
}

// register change handlers for the integer inputs -- only allow numbers or decimals or minus signs
let integerInputs = document.querySelectorAll(".integer");
integerInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    // get the current input value
    let currentValue = e.target.value;
    // get the most recently added value
    let newInput = e.target.value.slice(currentValue.length - 1);

    // check if the input value is a minus sign
    if (newInput.charCodeAt(0) == 45) {
      if (!validMinusSignPlacement(currentValue)) {
        e.target.value = currentValue.slice(0, currentValue.length - 1);
        writeError("Error: Minus signs can only be to the right of a number");
      }
      return;
    }

    // check if input value is a decimal separator
    if (newInput.charCodeAt(0) == 46) {
      if (!validDecimalSeparator(currentValue)) {
        e.target.value = currentValue.slice(0, currentValue.length - 1);
        writeError(
          "Error: There can only be one decimal separator in each box"
        );
      }
      return;
    }

    // check that the newinput is in the whitelist -- only numbers are allowed
    if (newInput.charCodeAt(0) < 48 || newInput.charCodeAt(0) > 58) {
      // remove the invalid value from the input node
      e.target.value = currentValue.slice(0, currentValue.length - 1);
      writeError("Error: Invalid character");
    }
  });
});

let sumBtn = document.querySelector(".sum_btn");
let result = document.querySelector(".result");
// add a listener to handle the sum event
sumBtn.addEventListener("click", (e) => {
  // get the sum inputs
  let integerInputs = document.querySelectorAll(".integer");
  // create an array that will store the individual values
  let leftHandSide = [];
  // iterate through the integerInputs and get the textcontent into the leftHandSide array
  integerInputs.forEach((input) => {
    let value = input.value;
    leftHandSide.push(value);
  });

  // join the values into a string with a '+' as a separator
  let leftHandSideString = leftHandSide.join("|");

  // send the the values together in a signle string with a '+' inbetween
  // by invoking the client
  client.invoke("calc", leftHandSideString, (error, res) => {
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

// Event for closing the error message box
let errorMessageBox = document.querySelector(".error-message");
errorMessageBox.addEventListener("click", function (e) {
  // hide the error message when the 'x' button is clicked
  if (e.target.name == "close-error-btn") {
    // hide the error message box
    this.style = "visibility: hidden";
  }
});
