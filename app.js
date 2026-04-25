// Simple calculator logic with robust state machine (no eval)

const display = document.getElementById('display');
const keys = document.getElementById('keys');

const calc = {
  displayValue: '0',
  firstOperand: null,
  waitingForSecondOperand: false,
  operator: null,
};

function updateDisplay() {
  display.textContent = calc.displayValue;
}

function inputDigit(digit) {
  const { displayValue, waitingForSecondOperand } = calc;
  if (waitingForSecondOperand) {
    calc.displayValue = digit;
    calc.waitingForSecondOperand = false;
  } else {
    calc.displayValue = displayValue === '0' ? digit : displayValue + digit;
  }
}

function inputDecimal() {
  if (calc.waitingForSecondOperand) {
    // Start new number with "0."
    calc.displayValue = '0.';
    calc.waitingForSecondOperand = false;
    return;
  }
  if (!calc.displayValue.includes('.')) {
    calc.displayValue += '.';
  }
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(calc.displayValue);

  if (calc.operator && calc.waitingForSecondOperand) {
    calc.operator = nextOperator; // allow operator change before typing 2nd operand
    return;
  }

  if (calc.firstOperand === null) {
    calc.firstOperand = inputValue;
  } else if (calc.operator) {
    const result = performCalculation(calc.operator, calc.firstOperand, inputValue);
    calc.displayValue = String(result);
    calc.firstOperand = result;
  }

  calc.waitingForSecondOperand = true;
  calc.operator = nextOperator;
}

function performCalculation(operator, a, b) {
  switch (operator) {
    case '+': return round(a + b);
    case '-': return round(a - b);
    case '*': return round(a * b);
    case '/': return b === 0 ? '∞' : round(a / b);
    default: return b;
  }
}

function round(n) {
  return Math.round((Number(n) + Number.EPSILON) * 1e12) / 1e12;
}

function resetCalculator() {
  calc.displayValue = '0';
  calc.firstOperand = null;
  calc.waitingForSecondOperand = false;
  calc.operator = null;
}

function backspace() {
  if (calc.waitingForSecondOperand) return; // nothing to delete in a new entry state
  if (calc.displayValue.length <= 1 || (calc.displayValue.length === 2 && calc.displayValue.startsWith('-'))) {
    calc.displayValue = '0';
  } else {
    calc.displayValue = calc.displayValue.slice(0, -1);
  }
}

function equals() {
  if (calc.operator === null || calc.waitingForSecondOperand) return;
  const inputValue = parseFloat(calc.displayValue);
  const result = performCalculation(calc.operator, calc.firstOperand ?? 0, inputValue);
  calc.displayValue = String(result);
  calc.firstOperand = null;
  calc.operator = null;
  calc.waitingForSecondOperand = false;
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.hasAttribute('data-digit')) {
    inputDigit(btn.textContent.trim());
  } else if (btn.dataset.action === 'decimal') {
    inputDecimal();
  } else if (btn.dataset.action === 'operator') {
    handleOperator(btn.dataset.operator);
  } else if (btn.dataset.action === 'clear') {
    resetCalculator();
  } else if (btn.dataset.action === 'delete') {
    backspace();
  } else if (btn.dataset.action === 'equals') {
    equals();
  }

  updateDisplay();
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    handleOperator(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    equals();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key.toLowerCase() === 'c') {
    // Allow quick clear via "c"
    resetCalculator();
  }
  updateDisplay();
});

updateDisplay();

