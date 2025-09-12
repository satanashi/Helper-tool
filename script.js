function addQuotes() {
    const input = document.getElementById('inputQuotes').value.trim();
    if (!input) {
        document.getElementById('outputQuotes').value = '';
        return;
    }

    const items = input.split(/\s+/).filter(item => item.length > 0);
    const result = items.map(item => `'${item}'`).join(',');
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