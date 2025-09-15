// Переменная для хранения типа кавычек
let quoteType = "'";

// Обработчики кликов на кнопки
document.getElementById('single-quote-btn').addEventListener('click', () => {
    document.getElementById('single-quote-btn').classList.add('active');
    document.getElementById('double-quote-btn').classList.remove('active');
    quoteType = "'";
});

document.getElementById('double-quote-btn').addEventListener('click', () => {
    document.getElementById('double-quote-btn').classList.add('active');
    document.getElementById('single-quote-btn').classList.remove('active');
    quoteType = '"';
});

function addQuotes() {
    const input = document.getElementById('inputQuotes').value.trim();
    if (!input) {
        document.getElementById('outputQuotes').value = '';
        return;
    }

    // Разбиваем текст на строки и очищаем каждую
    const lines = input.split('\n');
    const items = [];
    lines.forEach(line => {
        const words = line.split(/\s+/).filter(word => word.length > 0);
        items.push(...words);
    });

    let result = '';

    if (quoteType === '"') {
        // Двойные кавычки — каждый элемент на новой строке
        result = items.map(item => `"${item}"`).join(',\n');
    } else {
        // Одинарные кавычки — все в одну строку
        result = items.map(item => `'${item}'`).join(',');
    }

    document.getElementById('outputQuotes').value = result;
}

function extractNumbers() {
    const input = document.getElementById('inputNumbers').value;
    if (!input) {
        document.getElementById('outputNumbers').value = '';
        return;
    }

    // Извлекаем все последовательности цифр
    const numbers = input.match(/\d+/g) || [];
    const uniqueNumbers = [...new Set(numbers)]; // убираем дубликаты
    const result = uniqueNumbers.map(num => `'${num}'`).join(',');

    document.getElementById('outputNumbers').value = result;
}

function addQuotes() {
    const input = document.getElementById('inputQuotes').value.trim();
    const output = document.getElementById('outputQuotes');
    const button = event.target; // кнопка, по которой кликнули

    if (!input) {
        output.value = '';
        return;
    }

    const lines = input.split('\n');
    const items = [];
    lines.forEach(line => {
        const words = line.split(/\s+/).filter(word => word.length > 0);
        items.push(...words);
    });

    let result = '';

    if (quoteType === '"') {
        result = items.map(item => `"${item}"`).join(',\n');
    } else {
        result = items.map(item => `'${item}'`).join(',');
    }

    output.value = result;

    // Копируем в буфер
    copyTextToClipboard(result);

    // Эффект на кнопке
    showCopiedFeedback(button);
}

function extractNumbers() {
    const input = document.getElementById('inputNumbers').value;
    const output = document.getElementById('outputNumbers');
    const button = event.target;

    if (!input) {
        output.value = '';
        return;
    }

    const numbers = input.match(/\d+/g) || [];
    const uniqueNumbers = [...new Set(numbers)];
    const result = uniqueNumbers.map(num => `'${num}'`).join(',');

    output.value = result;

    // Копируем в буфер
    copyTextToClipboard(result);

    // Эффект на кнопке
    showCopiedFeedback(button);
}

// Универсальная функция копирования — тихо и просто
function copyTextToClipboard(text) {
    if (!text.trim()) return;
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
}

// Эффект "Скопировано!" на кнопке
function showCopiedFeedback(button) {
    const originalText = button.innerText;
    button.innerText = 'Скопировано!';
    button.disabled = true; // опционально: блокируем на мгновение
    button.style.opacity = '0.7';

    setTimeout(() => {
        button.innerText = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    }, 500); // 1.5 секунды
}
