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
        updateActionContainer(); // Обновляем состояние кнопки
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

    // Обновляем состояние кнопки перестройки
    updateActionContainer();
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

// ============ ДОБАВЛЕНИЕ ФУНКЦИОНАЛА ПЕРЕСТРОЙКИ ОТЧЁТА ============

// Функция проверки: есть ли в outputQuotes хотя бы один UUID в двойных кавычках
function hasValidReportId() {
    const outputText = document.getElementById('outputQuotes').value;
    // Регулярка для UUID в двойных кавычках: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    const uuidRegex = /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/i;
    return uuidRegex.test(outputText);
}

// Функция обновления UI: показать кнопку или Good Luck
function updateActionContainer() {
    const container = document.getElementById('actionContainer');
    if (hasValidReportId()) {
        container.innerHTML = `
            <button id="rebuildBtn" class="btn-rebuild">Перестроить отчёт 👀</button>
        `;
        // Назначаем обработчик после вставки в DOM
        document.getElementById('rebuildBtn').addEventListener('click', handleRebuildClick);
    } else {
        container.innerHTML = `<h1>Good Luck!</h1>`;
    }
}

// Обработчик клика по кнопке "Перестроить отчёт"
async function handleRebuildClick() {
    const outputText = document.getElementById('outputQuotes').value;
    const uuidRegex = /"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/gi;
    const matches = [...outputText.matchAll(uuidRegex)];

    if (matches.length === 0) {
        alert("Не найдено ни одного валидного UUID в двойных кавычках!");
        return;
    }

    const reportIds = matches.map(match => match[1]); // чистые UUID

    const button = document.getElementById('rebuildBtn');
    button.disabled = true;
    button.textContent = "Отправка...";

    try {
        // 🔁 Симулируем отправку всех отчётов
        const result = await simulateRebuildAll(reportIds);

        // ✅ Формируем сообщение
        let message;
        if (result.successCount === 1 && reportIds.length === 1) {
            message = "😌 Отчёт отправлен на перестроение";
        } else {
            message = "😌 Отчёты отправлены на перестроение";
        }

        if (result.failedIds.length > 0) {
            message += `\n⚠️ Не удалось отправить ${result.failedIds.length} отчёт(ов):`;
            message += "\n" + result.failedIds.map(id => `  • ${id}`).join("\n");
        }

        document.getElementById('actionContainer').innerHTML = `
            <div class="status-success">${message.replace(/\n/g, '<br>')}</div>
        `;

    } catch (error) {
        button.disabled = false;
        button.textContent = "Ошибка! Повторить";
        console.error("Ошибка при перестройке:", error);
    }
}

// Симуляция отправки нескольких отчётов
function simulateRebuildAll(reportIds) {
    return new Promise((resolve) => {
        console.log(`[DEBUG] Отправка ${reportIds.length} отчётов:`, reportIds);

        // Имитируем задержку
        setTimeout(() => {
            // 🔥 Искусственно "ломаем" UUID, начинающиеся с "f802"
            const failedIds = reportIds.filter(id => id.startsWith('f802'));
            const successCount = reportIds.length - failedIds.length;

            resolve({
                successCount,
                total: reportIds.length,
                failedIds
            });
        }, 1200);
    });
}

// Следим за изменениями в outputQuotes
const outputQuotes = document.getElementById('outputQuotes');
outputQuotes.addEventListener('input', updateActionContainer);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateActionContainer();
});
