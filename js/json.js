// ===== JSON TOOL =====
class JsonTool {
    constructor() {
        this.input = null;
        this.submitBtn = null;
        this.mainBox = null;
    }
    
    init() {
        this.createToolContent();
        this.bindEvents();
    }
    
    createToolContent() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const header = DomUtils.createElement('div', 'header-container');
        const title = DomUtils.createElement('h1', '', 'Json Tool 🗃️');
        title.id = 'tool-title';
        header.appendChild(title);
        container.appendChild(header);
        
        this.mainBox = DomUtils.createElement('div', 'tool-box json-main-box');

        const jsonHeader = DomUtils.createElement('div', 'json-header');
        const h2 = DomUtils.createElement('h2', '', 'Форматирование Json');
        
        const compareBtn = DomUtils.createElement('button', 'json-compare-btn', 'Сравнить');
        compareBtn.title = 'Сравнить два Json';
        compareBtn.addEventListener('click', () => {
            if (typeof showJsonCompareModal === 'function') {
                showJsonCompareModal();
            }
        });
        
        jsonHeader.appendChild(h2);
        jsonHeader.appendChild(compareBtn);
        this.mainBox.appendChild(jsonHeader);
        
        this.input = DomUtils.createElement('textarea', '', '');
        this.input.id = 'jsonInput';
        this.input.placeholder = 'Вставьте текст с Json...';
        this.mainBox.appendChild(this.input);

        this.submitBtn = DomUtils.createElement('button', '', 'Преобразовать');
        this.submitBtn.id = 'jsonSubmitBtn';
        this.submitBtn.addEventListener('click', () => this.process());
        this.mainBox.appendChild(this.submitBtn);
        
        container.appendChild(this.mainBox);
        
        setTimeout(() => this.input.focus(), 100);
    }
    
    bindEvents() {
        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') this.process();
            });
        }
    }
    
    async process() {
        const originalText = this.submitBtn.textContent;
        this.submitBtn.textContent = '⏳ Обработка...';
        this.submitBtn.disabled = true;
        
        try {
            const rawText = this.input.value.trim();
            if (!rawText) {
                DomUtils.showStatusMessage(this.mainBox, 'Введите текст для обработки', 'error');
                return;
            }
            
            JsonUtils.detectFormat(rawText);
            
            let jsonString = JsonUtils.cleanAndExtract(rawText);
            if (!jsonString) {
                DomUtils.showStatusMessage(this.mainBox, 'Не удалось извлечь Json из текста', 'error');
                return;
            }
            
            jsonString = JsonUtils.fixErrors(jsonString);
            const jsonObject = JSON.parse(jsonString);
            const formattedJson = JSON.stringify(jsonObject, null, 2);
            
            this.showResult(formattedJson);
            DomUtils.showStatusMessage(this.mainBox, '✅ Json отформатирован', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка обработки Json:', error);
            let errorMessage = `Ошибка: ${error.message}`;
            if (errorMessage.length > 100) {
                errorMessage = errorMessage.substring(0, 100) + '...';
            }
            DomUtils.showStatusMessage(this.mainBox, `❌ ${errorMessage}`, 'error');
            
        } finally {
            this.submitBtn.textContent = originalText;
            this.submitBtn.disabled = false;
        }
    }
    
    showResult(formattedJson) {
        const { overlay, modal } = DomUtils.createModal();
        
        const header = DomUtils.createElement('div', 'modal-header-container');
        const title = DomUtils.createElement('h3', '', 'Отформатированный Json');
        
        const copyBtn = DomUtils.createElement('button', 'modal-copy-btn', '📋');
        copyBtn.title = 'Скопировать Json';
        copyBtn.onclick = async (e) => {
            e.stopPropagation();
            if (await JsonUtils.copyToClipboard(formattedJson)) {
                const orig = copyBtn.textContent;
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = orig, 2000);
            }
        };
        
        header.appendChild(title);
        header.appendChild(copyBtn);
        modal.appendChild(header);
        
        const content = DomUtils.createElement('pre', 'modal-content-text');
        content.innerHTML = JsonUtils.highlight(formattedJson);
        modal.appendChild(content);
        
        overlay.appendChild(modal);
    }
    
    switchToJsonTool() {
        const container = document.querySelector('.container');
        if (!container) return;
        
        container.innerHTML = '';
        this.init();
        
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }
}

const jsonTool = new JsonTool();

if (typeof window !== 'undefined') {
    window.switchToolJson = jsonTool.switchToJsonTool.bind(jsonTool);
    window.processJson = jsonTool.process.bind(jsonTool);
    window.showJsonModal = jsonTool.showResult.bind(jsonTool);
}

console.log('✅ Json Tool загружен');

