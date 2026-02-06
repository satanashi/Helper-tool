// ===== JSON COMPARE TOOL =====
class JsonCompareTool {
    constructor() {
        this.state = {
            left: { text: '', lines: [], obj: null },
            right: { text: '', lines: [], obj: null },
            isComparing: false
        };
        this.formatTimeout = null;
    }
    
showModal() {
    this.resetState();
    
    const { overlay, modal } = DomUtils.createModal('', 'compare-modal');
    overlay.className = 'modal-overlay compare-overlay';
    
    // Заголовок
    const header = DomUtils.createElement('div', 'modal-header-container');
    const title = DomUtils.createElement('h3', '', 'Сравнение Json');
    
    // Статус (добавляем сразу после заголовка)
    const statusDiv = DomUtils.createElement('div', 'compare-status');
    statusDiv.id = 'compareStatus';
    
    const clearBtn = DomUtils.createElement('button', 'compare-clear-btn', 'Очистить');
    clearBtn.title = 'Очистить оба окна';
    clearBtn.onclick = (e) => {
        e.stopPropagation();
        this.clearFields();
    };
    
    // Добавляем элементы в правильном порядке
    header.appendChild(title);
    header.appendChild(statusDiv);  // <-- статус между заголовком и кнопкой
    header.appendChild(clearBtn);
    modal.appendChild(header);
    
    // Контейнер для двух окон
    const compareContainer = DomUtils.createElement('div', 'compare-container');
    
    // Левое окно
    const leftSection = this.createCompareSection('compareLeft', 'Первый Json...');
    const rightSection = this.createCompareSection('compareRight', 'Второй Json...');
    
    compareContainer.appendChild(leftSection);
    compareContainer.appendChild(rightSection);
    modal.appendChild(compareContainer);
    
    overlay.appendChild(modal);
    
    this.initCompareEvents();
    setTimeout(() => document.getElementById('compareLeft')?.focus(), 100);
}
    
    createCompareSection(id, placeholder) {
        const section = DomUtils.createElement('div', 'compare-section');
        
        const textarea = DomUtils.createElement('textarea', 'compare-textarea', '');
        textarea.id = id;
        textarea.placeholder = placeholder;
        textarea.spellcheck = false;
        
        const pre = DomUtils.createElement('pre', 'compare-display');
        pre.id = `${id}Display`;
        
        section.appendChild(textarea);
        section.appendChild(pre);
        
        return section;
    }
    
    initCompareEvents() {
        const leftTextarea = document.getElementById('compareLeft');
        const rightTextarea = document.getElementById('compareRight');
        
        if (!leftTextarea || !rightTextarea) return;
        
        const handleInput = (textarea, isLeft) => {
            if (this.formatTimeout) clearTimeout(this.formatTimeout);
            this.formatTimeout = setTimeout(() => {
                this.formatJson(textarea.value, isLeft);
            }, 500);
        };
        
        leftTextarea.addEventListener('input', () => handleInput(leftTextarea, true));
        rightTextarea.addEventListener('input', () => handleInput(rightTextarea, false));
        
        this.bindSyncScroll();
    }
    
    bindSyncScroll() {
        setTimeout(() => {
            const leftDisplay = document.getElementById('compareLeftDisplay');
            const rightDisplay = document.getElementById('compareRightDisplay');
            
            if (!leftDisplay || !rightDisplay) return;
            
            leftDisplay.addEventListener('scroll', () => {
                if (rightDisplay.style.display === 'block') {
                    rightDisplay.scrollTop = leftDisplay.scrollTop;
                }
            });
            
            rightDisplay.addEventListener('scroll', () => {
                if (leftDisplay.style.display === 'block') {
                    leftDisplay.scrollTop = rightDisplay.scrollTop;
                }
            });
        }, 100);
    }
    
    formatJson(text, isLeft) {
        const side = isLeft ? 'left' : 'right';
        const textarea = document.getElementById(`compare${side.charAt(0).toUpperCase() + side.slice(1)}`);
        const display = document.getElementById(`compare${side.charAt(0).toUpperCase() + side.slice(1)}Display`);
        const statusDiv = document.getElementById('compareStatus');
        
        if (!textarea || !display || !statusDiv) return;
        
        statusDiv.textContent = '';
        statusDiv.className = 'compare-status';
        
        const rawText = text.trim();
        if (!rawText) {
            display.innerHTML = '';
            display.style.display = 'none';
            textarea.style.display = 'block';
            this.state[side] = { text: '', lines: [], obj: null };
            this.checkReady();
            return;
        }
        
        try {
            let jsonString = JsonUtils.cleanAndExtract(rawText);
            if (!jsonString) throw new Error('Не удалось извлечь Json');
            
            jsonString = JsonUtils.fixErrors(jsonString);
            const jsonObject = JSON.parse(jsonString);
            const formattedJson = JSON.stringify(jsonObject, null, 2);
            
            this.state[side] = {
                text: formattedJson,
                lines: formattedJson.split('\n'),
                obj: jsonObject
            };
            
            display.innerHTML = JsonUtils.highlight(formattedJson);
            textarea.style.display = 'none';
            display.style.display = 'block';
            display.scrollTop = 0;
            
            this.checkReady();
            
        } catch (error) {
            console.warn('Ошибка форматирования Json:', error);
            
            this.state[side] = {
                text: rawText,
                lines: rawText.split('\n'),
                obj: null
            };
            
            const escapedText = rawText.replace(/&/g, '&amp;')
                                     .replace(/</g, '&lt;')
                                     .replace(/>/g, '&gt;');
            display.innerHTML = escapedText;
            textarea.style.display = 'none';
            display.style.display = 'block';
            display.scrollTop = 0;
            
            statusDiv.textContent = `⚠️ Json ${isLeft ? 'слева' : 'справа'} не отформатирован, но можно сравнить`;
            statusDiv.className = 'compare-status warning';
            
            this.checkReady();
        }
    }
    
    checkReady() {
        const statusDiv = document.getElementById('compareStatus');
        if (!statusDiv) return;
        
        if (this.state.left.text && this.state.right.text) {
            this.state.isComparing = true;
            this.compare();
        } else if (this.state.left.text || this.state.right.text) {
            statusDiv.textContent = 'Ожидание второго Json...';
            statusDiv.className = 'compare-status info';
        } else {
            statusDiv.textContent = 'Введите Json в оба поля';
            statusDiv.className = 'compare-status';
        }
    }
    
    compare() {
        const leftDisplay = document.getElementById('compareLeftDisplay');
        const rightDisplay = document.getElementById('compareRightDisplay');
        const statusDiv = document.getElementById('compareStatus');
        
        if (!leftDisplay || !rightDisplay || !statusDiv) return;
        
        // Очищаем предыдущую подсветку
        this.clearDiffHighlighting(leftDisplay, rightDisplay);
        
        if (this.state.left.obj && this.state.right.obj) {
            const differences = this.compareStructure(this.state.left.obj, this.state.right.obj);
            
            if (differences.length === 0) {
                statusDiv.textContent = '✅ Json идентичны';
                statusDiv.className = 'compare-status success';
            } else {
                statusDiv.textContent = `🔍 Найдено различий: ${differences.length}`;
                statusDiv.className = 'compare-status diff';
            }
        }
        
        this.highlightLineDifferences();
    }
    
    clearDiffHighlighting(leftDisplay, rightDisplay) {
        const diffWordRegex = /<span class="diff-word"[^>]*>(.*?)<\/span>/g;
        if (leftDisplay) leftDisplay.innerHTML = leftDisplay.innerHTML.replace(diffWordRegex, '$1');
        if (rightDisplay) rightDisplay.innerHTML = rightDisplay.innerHTML.replace(diffWordRegex, '$1');
    }
    
    highlightLineDifferences() {
        const leftDisplay = document.getElementById('compareLeftDisplay');
        const rightDisplay = document.getElementById('compareRightDisplay');
        if (!leftDisplay || !rightDisplay) return;
        
        const maxLines = Math.max(this.state.left.lines.length, this.state.right.lines.length);
        
        const leftLinesHtml = leftDisplay.innerHTML.split('\n');
        const rightLinesHtml = rightDisplay.innerHTML.split('\n');
        
        for (let i = 0; i < maxLines; i++) {
            const leftLine = this.state.left.lines[i] || '';
            const rightLine = this.state.right.lines[i] || '';
            
            if (leftLine.trim() !== rightLine.trim()) {
                const highlighted = this.highlightDiffInLine(leftLine, rightLine);
                
                if (i < leftLinesHtml.length && highlighted.left) {
                    leftLinesHtml[i] = highlighted.left;
                }
                if (i < rightLinesHtml.length && highlighted.right) {
                    rightLinesHtml[i] = highlighted.right;
                }
            }
        }
        
        leftDisplay.innerHTML = leftLinesHtml.join('\n');
        rightDisplay.innerHTML = rightLinesHtml.join('\n');
    }
    
    highlightDiffInLine(leftLine, rightLine) {
        // Базовая реализация подсветки различий
        // Можно улучшить для более точного сравнения
        return {
            left: leftLine ? `<span class="diff-line">${leftLine}</span>` : '',
            right: rightLine ? `<span class="diff-line">${rightLine}</span>` : ''
        };
    }
    
    compareStructure(obj1, obj2) {
        // Упрощенная реализация сравнения структур
        // Можно расширить для более детального сравнения
        const differences = [];
        
        const compareObjects = (a, b, path = '') => {
            if (typeof a !== typeof b) {
                differences.push(`${path}: разные типы (${typeof a} vs ${typeof b})`);
                return;
            }
            
            if (typeof a === 'object' && a !== null && b !== null) {
                const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
                keys.forEach(key => {
                    const newPath = path ? `${path}.${key}` : key;
                    if (!(key in a)) {
                        differences.push(`${newPath}: отсутствует в первом Json`);
                    } else if (!(key in b)) {
                        differences.push(`${newPath}: отсутствует во втором Json`);
                    } else {
                        compareObjects(a[key], b[key], newPath);
                    }
                });
            } else if (a !== b) {
                differences.push(`${path}: разные значения (${a} vs ${b})`);
            }
        };
        
        compareObjects(obj1, obj2);
        return differences;
    }
    
    clearFields() {
        ['Left', 'Right'].forEach(side => {
            const textarea = document.getElementById(`compare${side}`);
            const display = document.getElementById(`compare${side}Display`);
            
            if (textarea) {
                textarea.value = '';
                textarea.style.display = 'block';
            }
            if (display) {
                display.innerHTML = '';
                display.style.display = 'none';
            }
        });
        
        const statusDiv = document.getElementById('compareStatus');
        if (statusDiv) {
            statusDiv.textContent = '🫣';
            statusDiv.className = 'compare-status';
        }
        
        this.resetState();
        setTimeout(() => document.getElementById('compareLeft')?.focus(), 10);
    }
    
    resetState() {
        this.state = {
            left: { text: '', lines: [], obj: null },
            right: { text: '', lines: [], obj: null },
            isComparing: false
        };
        if (this.formatTimeout) {
            clearTimeout(this.formatTimeout);
            this.formatTimeout = null;
        }
    }
}

// Создаем и экспортируем экземпляр
const jsonCompareTool = new JsonCompareTool();

if (typeof window !== 'undefined') {
    window.showJsonCompareModal = jsonCompareTool.showModal.bind(jsonCompareTool);
}

console.log('✅ JSON Compare Tool загружен');
