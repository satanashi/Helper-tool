// ===== JSON TOOL - АДАПТИРОВАННАЯ ПОД СКРИНШОТ ВЕРСИЯ =====

// Гарантируем наличие copyToClipboard
function ensureCopyToClipboard() {
    if (typeof window.copyToClipboard !== 'function') {
        window.copyToClipboard = function(text) {
            if (!text?.trim()) return false;
            if (navigator.clipboard) {
                return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
            }
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            try {
                return document.execCommand('copy');
            } catch {
                return false;
            } finally {
                document.body.removeChild(temp);
            }
        };
    }
}

// ===== ОСНОВНАЯ ФУНКЦИЯ ОБРАБОТКИ JSON =====
function processJson() {
    const input = document.getElementById('jsonInput');
    const submitBtn = document.getElementById('jsonSubmitBtn');
    if (!input || !submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Обработка...';
    submitBtn.disabled = true;

    try {
        const rawText = input.value.trim();
        if (!rawText) {
            showJsonStatusMessage('Введите текст для обработки', 'error');
            return;
        }

        let jsonString = cleanAndExtractJson(rawText);
        if (!jsonString) {
            showJsonStatusMessage('Не удалось извлечь JSON из текста', 'error');
            return;
        }

        jsonString = fixCommonJsonErrors(jsonString);
        const jsonObject = JSON.parse(jsonString);
        const formattedJson = JSON.stringify(jsonObject, null, 2);

        showJsonModal(formattedJson);
        showJsonStatusMessage('✅ Json успешно отформатирован', 'success');

    } catch (error) {
        console.error('❌ Ошибка обработки Json:', error);
        let errorMessage = `Ошибка: ${error.message}`;
        if (errorMessage.length > 100) {
            errorMessage = errorMessage.substring(0, 100) + '...';
        }
        showJsonStatusMessage(`❌ ${errorMessage}`, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ===== ОЧИСТКА И ИЗВЛЕЧЕНИЕ JSON =====
function cleanAndExtractJson(text) {
    if (!text) return null;
    let cleaned = text.trim();

    // Удаляем всё до первого { или [
    const startMatch = cleaned.match(/[\{\[].*/s);
    if (startMatch) cleaned = startMatch[0];

    // Удаляем всё после последнего } или ]
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (lastBrace !== -1) cleaned = cleaned.substring(0, lastBrace + 1);

    // Убираем оборачивающие кавычки
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }

    // Исправляем экранирование
    cleaned = cleaned.replace(/\\(?![\\\/"bfnrtu])/g, '\\\\');
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned;
}

// ===== ИСПРАВЛЕНИЕ ОШИБОК JSON =====
function fixCommonJsonErrors(jsonString) {
    let fixed = jsonString;

    // Исправляем незакрытые значения (без кавычек)
    fixed = fixed.replace(/:\s*([^"{\[\d\s-][^,}\]]*)(?=,|\s*[}\]])/g, ': "$1"');

    // Исправляем ключи без кавычек
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');

    // Убираем лишние запятые
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // Одинарные → двойные кавычки
    fixed = fixed.replace(/'/g, '"');

    // Убираем лишние пробелы
    fixed = fixed.replace(/\s+/g, ' ');

    return fixed;
}

// ===== СТАТУСНЫЕ СООБЩЕНИЯ =====
function showJsonStatusMessage(message, type = 'success') {
    const mainBox = document.querySelector('.json-main-box');
    if (!mainBox) return;

    const existing = mainBox.querySelector('.json-status-overlay');
    if (existing) existing.remove();

    const statusEl = document.createElement('div');
    statusEl.className = `json-status-overlay ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'none';
    mainBox.appendChild(statusEl);

    mainBox.style.overflow = 'hidden';
    const initialHeight = mainBox.scrollHeight + 'px';
    statusEl.style.display = 'block';
    const expandedHeight = mainBox.scrollHeight + 'px';
    mainBox.style.height = initialHeight;

    setTimeout(() => {
        mainBox.style.height = expandedHeight;
        setTimeout(() => statusEl.classList.add('show'), 10);
    }, 10);

    const duration = (type === 'error') ? 5000 : 3000;
    setTimeout(() => {
        mainBox.style.height = initialHeight;
        setTimeout(() => {
            statusEl.classList.remove('show');
            setTimeout(() => {
                if (statusEl.parentNode) statusEl.remove();
                mainBox.style.height = '';
                mainBox.style.overflow = '';
            }, 400);
        }, 400);
    }, duration);
}

// ===== БЕЗОПАСНАЯ ПОДСВЕТКА JSON =====
function highlightJson(json) {
    if (!json) return '';

    const escapeHtml = str => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return json.split('\n').map(line => {
        return line.replace(/("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
            let cls = 'json-number';

            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    const key = match.slice(0, -1);
                    return `<span class="${cls}">${escapeHtml(key)}</span><span class="json-punctuation">:</span>`;
                }
                cls = 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }

            return `<span class="${cls}">${escapeHtml(match)}</span>`;
        });
    }).join('\n');
}

// ===== МОДАЛЬНОЕ ОКНО =====
function showJsonModal(formattedJson) {
    ensureCopyToClipboard();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header-container';

    const title = document.createElement('h3');
    title.textContent = 'Отформатированный Json';
    header.appendChild(title);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'modal-copy-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Скопировать Json';
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        if (copyToClipboard(formattedJson)) {
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✅';
            setTimeout(() => copyBtn.textContent = orig, 2000);
        }
    };
    header.appendChild(copyBtn);
    modal.appendChild(header);

    const content = document.createElement('pre');
    content.className = 'modal-content-text';
    content.innerHTML = highlightJson(formattedJson);
    modal.appendChild(content);

    overlay.appendChild(modal);
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };

    document.body.appendChild(overlay);
}

// ===== СОЗДАНИЕ КОНТЕНТА =====
function createJsonToolContent() {
    const frag = document.createDocumentFragment();

    const header = document.createElement('div');
    header.className = 'header-container';
    const title = document.createElement('h1');
    title.id = 'tool-title';
    title.textContent = 'Json Tool 🗃️';
    header.appendChild(title);
    frag.appendChild(header);

    const mainBox = document.createElement('div');
    mainBox.className = 'tool-box json-main-box';

    const jsonHeader = document.createElement('div');
    jsonHeader.className = 'json-header';
    const h2 = document.createElement('h2');
    h2.textContent = 'Форматирование Json';
    jsonHeader.appendChild(h2);
    mainBox.appendChild(jsonHeader);

    const input = document.createElement('textarea');
    input.id = 'jsonInput';
    input.placeholder = 'Вставьте текст с JSON...';
    mainBox.appendChild(input);

    const btn = document.createElement('button');
    btn.id = 'jsonSubmitBtn';
    btn.textContent = 'Преобразовать';
    btn.addEventListener('click', processJson);
    mainBox.appendChild(btn);

    frag.appendChild(mainBox);
    return frag;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initJsonTool() {
    const input = document.getElementById('jsonInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') processJson();
        });
        setTimeout(() => input.focus(), 100);
    }
}

// ===== ПЕРЕКЛЮЧЕНИЕ НА JSON =====
function switchToolJson() {
    const container = document.querySelector('.container');
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(createJsonToolContent());
    initJsonTool();

    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
}

// Экспорт
if (typeof window !== 'undefined') {
    window.switchToolJson = switchToolJson;
    ensureCopyToClipboard();
}
console.log('✅ JSON Tool: адаптирован под скриншот');