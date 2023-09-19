// Calculator JS

// Values of the button ids and their usage forms
values = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "divide": '÷',
    "multiply": 'x',
    "add": '+',
    "subtract": '-',
    "dot": '.'
};

// Operators
operatorsNames = ["divide", "multiply", "add", "subtract"];
operators =  ["÷", "x", "+", "-"];

// Evaluation Criteria
let canCalculate = false;

// Displays 
const screenTop = document.querySelector('.screen-last')
const screenCurrent = document.querySelector('.text-current');
const screen = document.querySelector('.screen')

// Initial variables
let current = [];
let lastArray = [];
let displayedEquations = new Set();
let remHeight = 0;
let pElements = [];

// Declare button names
const buttonIds = ["clear", "delete", "zero", "one", "two", "three", "four", "five", "six", "seven",
    "eight", "nine", "divide", "multiply", "add", "subtract", "equal", "dot"
];

// Declare buttons and event listeners
const buttons = {};
buttonIds.map(buttonId => {
    const button = document.querySelector(`#${buttonId}`);
    button.addEventListener('click', () => {
        calculator(buttonId);
    });
    return buttons[buttonId] = button;
});

// Functions
function calculator(input) {

    // CLEAR BUTTON
    if(input === "clear") {
        if(screenCurrent.textContent !== '') {
            // Just clear primary screen on first press
            current = [];
            screenCurrent.textContent = '';
        } else if(screenCurrent.textContent === '' && lastArray.length > 0) {
            // Clear secondary screen on second press
            clearAllLast();
        } else {
            // Error if pressed too many times
            errorFlash(input);
        }
        // Cannot calculate if screen is clear
        canCalculate = false;

    // DELETE BUTTON
    } else if(input==="delete") {
        if (current.length > 0) {
            /// Need to delete only the last digit if it is a number OR DECIMAL FIXXX
            if (isLastNumber() && current[current.length-1].length > 1) {
                let shortenedNum = (current[current.length-1]).slice(0, -1);
                current[current.length-1] = shortenedNum;
            } else {
                current.pop();
            }
            displayCurrent(current);
        } else {
            // Error if pressed too many times
            errorFlash(input);
        }

        // Re-evaluate if command can be evaluated
        if(current.length > 0) {
            canCalculate = isLastNumber();
        } else {
            canCalculate = false;
        }
        
    // EQUAL BUTTON
    } else if(input==="equal") {
        if(canCalculate) {
            // Save function before evaluting which will lose the equation
            lastArray.push([...current]);
            const solution = evaluate(current);
            // Solution gets added to last to be in upper display
            lastArray[lastArray.length-1].push(solution);
            // Displays equation history
            displayAllLast();

            // Operate on last answer available option
            screenCurrent.textContent = solution;
            screenCurrent.classList.add('grayed');
            canCalculate = false;
            
            // Should I put current as the answer, or put the answer up top after an equals sign?

            current = [];
        } else {
            errorFlash(input);
        }
        
    // OPERATOR BUTTONS
    } else if(operatorsNames.includes(input)) {
        // Avoid having two operators in a row
        if(current.length > 0 && isLastNumber()) {
            // An operator is pressed after a number
            current.push(values[input]);
        } else if(current.length === 0) {
            // Pressed when nothing is on the main screen
            if (lastArray.length === 0) {
                    // Mis-press when nothing on screen or in last memory
                    errorFlash(input);
                } else {
                    // If the user will operate on the previous answer
                    const lastLast = lastArray[lastArray.length-1];
                    current.push(lastLast[lastLast.length-1]);
                    current.push(values[input]);
                    // Makes color go back to regular
                    if(screenCurrent.classList.contains('grayed')) {
                        screenCurrent.classList.remove('grayed');
                    }
                }
        } else {
            if (current[current.length-1] === values[input]) {
                // User pressed the same operator that is already there - flash error
                errorFlash(input);
            } else {
                // If the user wants to change the operator
                current.pop();
                current.push(values[input]);
            }
    }
        // Turn cant calculate off if the operator is the last thing in the command
        canCalculate = false;
        displayCurrent(current);

    // NUMBER & DECIMAL BUTTONS
    } else {
        if (isLastNumber()) {
            // Add onto existing number
            current[current.length-1] += values[input].toString();
        } else {
            // New number aka new element in current
            current.push(values[input].toString());
            canCalculate = true;
        }
        // If starting new equation, ensure it is not grayed out
        if(screenCurrent.classList.contains('grayed')) {
            screenCurrent.classList.remove('grayed');
        }
        displayCurrent(current);
    }
    console.log(current);
}

// Only checks current, doesn't change it
function isLastNumber() {
    if (current.length > 0 ) {
        // Makes values starting with a decimal place be included as a number
        if (current[current.length-1] === '.') {
            return true;
        } else {
            return !isNaN(current[current.length - 1]);
        }
    } else {
        return false;
    }
}

function displayCurrent(array) {
    neatString = array.reduce((bigString, next) => {
        bigString = bigString + next.toString() + ' ';
        return bigString;
    }, '');
    screenCurrent.textContent = neatString.trim();
}

function displayLast(equation) {
    let solution = equation.pop();
    let leftHalf = equation.reduce((bigString, next) => {
        bigString = bigString + next.toString() + ' ';
        return bigString;
    }, '');
    let rightHalf = ' = ' + solution.toString();
    equation.push(solution);
    return leftHalf + rightHalf;
}

function displayAllLast() {
    if(lastArray.length > 5) {
        lastArray.shift();
        const removed = pElements.shift();
        removed.remove();
        remHeight -= 1.5;
    }
    lastArray.forEach(equation => {
        if(!displayedEquations.has(equation)) {
            // Create new element if equation has not been displayed
            let newLast = document.createElement("p");
            newLast.textContent = displayLast(equation);
            // Add to DOM
            screenTop.insertAdjacentElement("beforeend", newLast);
            // Add to Set
            displayedEquations.add(equation);
            pElements.push(newLast);

            // Now add height to screenTop
            remHeight += 1.5;
            screenTop.style.height = `${remHeight}rem`;
        }
    })
}

function clearAllLast() {
    // Clear lastArray
    lastArray = [];
    // Delete pElements from DOM
    pElements.forEach(element => element.remove());
    // Clear it
    pElements = [];
    // Reset accumulating height variable
    remHeight = 0;
    // Reset origional height of top screen
    screenTop.style.height = '1.5rem';
}

function evaluate(input) {
    // Maintain order of operations; multiply or divide, add subtract, always left to right
    operators.forEach(operator => {
        for ( i=0; i<input.length; i++ ) {
            if (operator === input[i] ) {
                let first = input[i-1].toString();
                let second = input[i+1].toString();
                let newNum = calculate(first, operator, second);
                input.splice(i-1, 3);
                input.splice(i-1, 0, newNum);
            }
        }
    });
    return input[0].toString();
}

function calculate(first, operator, second) {
    if(first.includes('.')) {
        first = parseFloat(first);
    } else {
        first = parseInt(first);
    }
    
    if(second.includes('.')) {
        second = parseFloat(second);
    } else {
        second = parseInt(second);
    }
    
    if (operator === '÷' ) {
        return twoDecimals(first / second);
    } else if (operator === 'x' ) {
        return twoDecimals(first * second);
    } else if (operator === '+' ) {
        return twoDecimals(first + second);
    } else {
        return twoDecimals(first - second);
    }
}

function twoDecimals(number) {
    var m = number * 10000;
    var r = Math.round(m);
    var result = r / 10000;
    return result;
}

function errorFlash(buttonId) {
    buttons[buttonId].classList.add("error");
    screen.classList.add("error");
    setTimeout( () => {
        buttons[buttonId].classList.remove("error"); 
        screen.classList.remove("error");
    }, 100);
}
