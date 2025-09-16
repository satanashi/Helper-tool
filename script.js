// Переменная для хранения типа кавычек
let quoteType = "'";

// Обработчики кликов на кнопки кавычек
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

// Функция: Добавить кавычки + копировать + эффект
function addQuotes() {
    const input = document.getElementById('inputQuotes').value.trim();
    const output = document.getElementById('outputQuotes');
    const button = event.target;

    if (!input) {
        output.value = '';
        return;
    }

    // Разбиваем текст на строки и слова
    const lines = input.split('\n');
    const items = [];
    lines.forEach(line => {
        const words = line.split(/\s+/).filter(word => word.length > 0);
        items.push(...words);
    });

    // Генерируем результат в зависимости от выбранной кавычки
    let result = '';
    if (quoteType === '"') {
        result = items.map(item => `"${item}"`).join(',\n'); // каждая на новой строке
    } else {
        result = items.map(item => `'${item}'`).join(','); // всё в одну строку
    }

    output.value = result;

    // Копируем в буфер
    copyTextToClipboard(result);

    // Эффект на кнопке
    showCopiedFeedback(button);
}

// Функция: Извлечь номера (только 7+ цифр) + копировать + эффект
function extractNumbers() {
    const input = document.getElementById('inputNumbers').value;
    const output = document.getElementById('outputNumbers');
    const button = event.target;

    if (!input) {
        output.value = '';
        return;
    }

    // Извлекаем все цифровые последовательности
    const numbers = input.match(/\d+/g) || [];

    // Фильтруем: оставляем только числа длиной 7 и более
    const filteredNumbers = numbers.filter(num => num.length >= 7);

    // Убираем дубликаты
    const uniqueNumbers = [...new Set(filteredNumbers)];

    // Формируем результат
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
    button.innerText = 'Скопировано 👌';
    button.disabled = true;
    button.style.opacity = '0.7';

    setTimeout(() => {
        button.innerText = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    }, 500); // 0.5 секунды — достаточно для обратной связи
}
