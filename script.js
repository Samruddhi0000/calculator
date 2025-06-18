const display = document.getElementById('display');
const historyPanel = document.getElementById('history');
const sound = document.getElementById('click-sound');
const historyList = [];

function playSound() {
  sound.currentTime = 0;
  sound.play();
}

function append(value) {
  playSound();
  if (display.innerText === "0" || display.innerText === "Error") {
    display.innerText = value;
  } else {
    display.innerText += value;
  }
}

function clearDisplay() {
  playSound();
  display.innerText = "0";
}

function backspace() {
  playSound();
  display.innerText = display.innerText.slice(0, -1) || "0";
}

function calculate() {
  playSound();
  try {
    const expression = display.innerText.replace('÷', '/').replace('×', '*');
    const result = eval(expression);
    addToHistory(display.innerText + " = " + result);
    display.innerText = result;
  } catch (e) {
    display.innerText = "Error";
  }
}

function scientific(func) {
  playSound();
  try {
    let val = parseFloat(display.innerText);
    let result;
    switch (func) {
      case 'sqrt': result = Math.sqrt(val); break;
      case 'sin': result = Math.sin(val * Math.PI / 180); break;
      case 'cos': result = Math.cos(val * Math.PI / 180); break;
      case 'tan': result = Math.tan(val * Math.PI / 180); break;
      case 'log': result = Math.log10(val); break;
    }
    addToHistory(`${func}(${val}) = ${result}`);
    display.innerText = result;
  } catch {
    display.innerText = "Error";
  }
}

function insertConstant(name) {
  playSound();
  const value = name === 'pi' ? Math.PI : Math.E;
  append(value.toFixed(5));
}

function addToHistory(entry) {
  historyList.push(entry);
  const item = document.createElement("div");
  item.className = "history-item";
  item.innerText = entry;
  historyPanel.appendChild(item);
}

function toggleMode() {
  document.body.classList.toggle("dark");
  playSound();
}

function downloadHistory() {
  playSound();
  const blob = new Blob([historyList.join('\n')], { type: 'text/plain' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "calculator-history.txt";
  link.click();
}

document.addEventListener("keydown", function (e) {
  const key = e.key;
  if ((key >= 0 && key <= 9) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
    append(key);
  } else if (key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Escape') {
    clearDisplay();
  }
});

function startListening() {
  playSound();
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    const speech = event.results[0][0].transcript.toLowerCase();
    const expression = convertSpeechToMath(speech);
    display.innerText = expression;

    try {
      const result = eval(expression);
      display.innerText = result;
      addToHistory(`${expression} = ${result}`);
    } catch {
      display.innerText = "Error";
    }
  };

  recognition.onerror = function(event) {
    alert("Speech recognition error: " + event.error);
  };
}

function convertSpeechToMath(speech) {
  return speech
    .replace(/plus/g, '+')
    .replace(/minus/g, '-')
    .replace(/times|into|multiplied by/g, '*')
    .replace(/divided by|over/g, '/')
    .replace(/square root of ([0-9.]+)/g, 'Math.sqrt($1)')
    .replace(/pi/g, Math.PI)
    .replace(/\be\b/g, Math.E)
    .replace(/to the power of ([0-9]+)/g, '**$1');
}
