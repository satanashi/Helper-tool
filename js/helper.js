// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let quoteType = '"';
let extractMode = 'uuid';

// ===== ФУНКЦИИ ОБРАБОТКИ =====
function addQuotes(event) {
    const button = event.currentTarget;
    const input = document.getElementById('inputQuotes')?.value.trim();
    const output = document.getElementById('outputQuotes');

    if (!input || !output) {
        if (output) output.value = '';
        return;
    }

    const lines = input.split(/\n/);
    const items = [];
    lines.forEach(line => {
        const words = line.split(/[\s,]+/).filter(Boolean);
        items.push(...words);
    });

    const cleanQuotes = str => {
        let cleaned = str.trim();
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) ||
            (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            return cleaned.slice(1, -1);
        }
        return cleaned;
    };

    const result = items.map(item => 
        quoteType === '"' ? `"${cleanQuotes(item)}"` : `'${cleanQuotes(item)}'`
    ).join(quoteType === '"' ? ',\n' : ',');

    output.value = result;
    if (copyToClipboard(result)) {
        showCopyFeedback(button);
    }
}

function extractNumbers(event) {
    const button = event.currentTarget;
    const input = document.getElementById('inputNumbers')?.value;
    const output = document.getElementById('outputNumbers');

    if (!input || !output) {
        if (output) output.value = '';
        return;
    }

    const matches = extractMode === 'num'
        ? input.match(/\d+/g) || []
        : input.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g) || [];

    const uniqueMatches = [...new Set(matches)].filter(Boolean);
    const result = uniqueMatches.map(num => `'${num}'`).join(',');

    output.value = result;
    if (copyToClipboard(result)) {
        showCopyFeedback(button);
    }
}

// ===== ПЕРЕКЛЮЧАТЕЛИ =====
function initQuoteSwitch() {
    const saved = localStorage.getItem('helperToolQuote');
    quoteType = (saved === "'" || saved === '"') ? saved : '"';

    const options = document.querySelectorAll('.quote-option');
    const indicator = document.getElementById('quote-indicator');

    const update = () => {
        const index = quoteType === '"' ? 1 : 0;
        indicator.style.transform = `translateX(${index * 100}%)`;
        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.quote === quoteType);
        });
    };

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            quoteType = opt.dataset.quote;
            localStorage.setItem('helperToolQuote', quoteType);
            update();
        });
    });

    update();
}

function initExtractModeSwitch() {
    const saved = localStorage.getItem('helperToolExtractMode');
    extractMode = (saved === 'num' || saved === 'uuid') ? saved : 'uuid';

    const options = document.querySelectorAll('#extractModeSwitch .quote-option');
    const indicator = document.getElementById('mode-indicator');

    const update = () => {
        const index = extractMode === 'num' ? 0 : 1;
        indicator.style.transform = `translateX(${index * 100}%)`;
        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.mode === extractMode);
        });
    };

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            extractMode = opt.dataset.mode;
            localStorage.setItem('helperToolExtractMode', extractMode);
            update();
        });
    });

    update();
}

// ===== МЕНЮ И ПЕРЕКЛЮЧЕНИЕ ИНСТРУМЕНТОВ =====
function initSideMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuDropdown = document.getElementById('menuDropdown');
    const menuItems = document.querySelectorAll('.menu-item');

    if (!menuToggle || !menuDropdown) return;

    let isMenuOpen = false;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            menuItems.forEach((item, i) => setTimeout(() => item.classList.add('show'), i * 50));
            menuToggle.textContent = '✖️';
        } else {
            menuItems.forEach(item => item.classList.remove('show'));
            menuToggle.textContent = '🛠️';
        }
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tool = item.dataset.tool;
            switchTool(tool);
            menuItems.forEach(i => i.classList.remove('show'));
            isMenuOpen = false;
            menuToggle.textContent = '🛠️';
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-dropdown') && !e.target.closest('.menu-toggle-btn')) {
            menuItems.forEach(item => item.classList.remove('show'));
            isMenuOpen = false;
            menuToggle.textContent = '🛠️';
        }
    });
}

// ===== СОЗДАНИЕ КОНТЕНТА ДЛЯ HELPER TOOL =====
function createHelperToolContent() {
    const fragment = document.createDocumentFragment();

    const header = document.createElement('div');
    header.className = 'header-container';

    const title = document.createElement('h1');
    title.id = 'tool-title';
    title.textContent = 'Helper Tool 😎';
    header.appendChild(title);
    fragment.appendChild(header);

    // --- Extract Numbers ---
    const numbersBox = createToolBox('Извлечь номер', 'inputNumbers', 'outputNumbers', extractNumbers, true);
    fragment.appendChild(numbersBox);

    // --- Add Quotes ---
    const quotesBox = createToolBox('Добавить кавычки', 'inputQuotes', 'outputQuotes', addQuotes, false);
    fragment.appendChild(quotesBox);

    return fragment;
}

function createToolBox(titleText, inputId, outputId, handler, isExtract = false) {
    const box = document.createElement('div');
    box.className = 'tool-box';

    const header = document.createElement('div');
    header.className = 'header-with-toggle';
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    header.appendChild(h2);

    if (isExtract) {
        const switchEl = document.createElement('div');
        switchEl.id = 'extractModeSwitch';
        switchEl.className = 'extract-mode-switch';
        ['num', 'uuid'].forEach(mode => {
            const opt = document.createElement('div');
            opt.className = 'quote-option';
            opt.dataset.mode = mode;
            opt.textContent = mode;
            switchEl.appendChild(opt);
        });
        const indicator = document.createElement('div');
        indicator.id = 'mode-indicator';
        switchEl.appendChild(indicator);
        header.appendChild(switchEl);
    } else {
        const switchEl = document.createElement('div');
        switchEl.id = 'quote-switch';
        switchEl.className = 'quote-switch';
        ["'", '"'].forEach(quote => {
            const opt = document.createElement('div');
            opt.className = 'quote-option';
            opt.dataset.quote = quote;
            opt.textContent = quote;
            switchEl.appendChild(opt);
        });
        const indicator = document.createElement('div');
        indicator.id = 'quote-indicator';
        switchEl.appendChild(indicator);
        header.appendChild(switchEl);
    }

    box.appendChild(header);

    const input = document.createElement('textarea');
    input.id = inputId;
    input.placeholder = 'Введите значения...';
    box.appendChild(input);

    const btn = document.createElement('button');
    btn.textContent = 'Клик👆';
    btn.addEventListener('click', handler);
    box.appendChild(btn);

    const output = document.createElement('textarea');
    output.id = outputId;
    output.readOnly = true;
    output.placeholder = 'Результат появится здесь';
    box.appendChild(output);

    return box;
}

// ===== ГЛОБАЛЬНАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ИНСТРУМЕНТОВ =====
function switchTool(tool) {
    const container = document.querySelector('.container');
    
    // Анимация исчезновения
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        container.innerHTML = '';
        
        if (tool === 'helper') {
            container.appendChild(createHelperToolContent());
            // Инициализация переключателей после добавления контента
            setTimeout(() => {
                initQuoteSwitch();
                initExtractModeSwitch();
            }, 10);
        } else if (tool === 'json') {
            // Используем функцию из json.js
            if (typeof switchToolJson === 'function') {
                switchToolJson();
            } else {
                container.innerHTML = '<p>JSON Tool временно недоступен</p>';
            }
        }
        
        // Анимация появления
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 10);
    }, 300);
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Helper Tool: DOM загружен');
    initSideMenu();
    // Загружаем Helper Tool по умолчанию
    switchTool('helper');
});
