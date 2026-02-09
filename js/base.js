// ===== БАЗОВЫЕ ФУНКЦИИ =====

// ===== 1. ТЕМА =====
const ThemeManager = {
    init() {
        this.applySavedTheme();
        this.bindThemeToggle();
    },
    
    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-theme');
        }
        this.updateThemeButton();
    },
    
    bindThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggle());
        }
    },
    
    toggle() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        localStorage.setItem('themeManualOverride', 'true');
        this.updateThemeButton();
    },
    
    updateThemeButton() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        }
    },
    
    autoDark() {
        const now = new Date();
        const hour = now.getHours();
        const manualOverride = localStorage.getItem('themeManualOverride') === 'true';
        
        if (manualOverride) return;
        
        if (hour >= 18 || hour < 6) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
        this.updateThemeButton();
    }
};

// ===== 2. JSON УТИЛИТЫ =====
const JsonUtils = {
    detectFormat(text) {
        if (!text) return 'Обычный';
        
        const lower = text.toLowerCase();
        
        if (text.includes('\\\\"') || text.includes('\\\\{')) {
            return 'Java';
        }
        
        if (text.includes('\\"') && (lower.includes('timestamp') || lower.includes('level'))) {
            return 'Node.js';
        }
        
        if (text.includes("{'") || text.includes("'")) {
            return 'Python';
        }
        
        if (text.includes('@') && text.includes('\\"')) {
            return 'C#';
        }
        
        if (text.includes('\\"')) {
            return 'Обычный';
        }
        
        return 'Обычный';
    },
    
    cleanAndExtract(text) {
        if (!text) return null;
        let cleaned = text.trim();
        const format = this.detectFormat(text);
        
        switch (format) {
            case 'Java':
                cleaned = cleaned.replace(/\\\\\\"/g, '"')
                                 .replace(/\\\\n/g, '\n')
                                 .replace(/\\\\t/g, '\t');
                break;
            case 'Node.js':
            case 'C#':
                cleaned = cleaned.replace(/\\"/g, '"');
                break;
            case 'Python':
                cleaned = cleaned.replace(/'/g, '"');
                break;
        }
        
        const startMatch = cleaned.match(/[\{\[].*$/s);
        if (!startMatch) return null;
        cleaned = startMatch[0];
        
        const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        if (lastBrace === -1) return null;
        cleaned = cleaned.substring(0, lastBrace + 1);
        
        cleaned = cleaned.trim();
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1).trim();
        }
        
        try {
            cleaned = cleaned.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
                String.fromCharCode(parseInt(hex, 16))
            );
        } catch (e) {}
        
        return cleaned;
    },
    
    fixErrors(jsonString) {
        if (!jsonString) return jsonString;
        let fixed = jsonString;
        fixed = fixed.replace(/'/g, '"');
        fixed = fixed.replace(/,\s*([\]}])/g, '$1');
        return fixed;
    },
    
    highlight(json) {
        if (!json) return '';
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\btrue\b|\bfalse\b|\bnull\b|\b-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?\b)/g, match => {
            let cls = 'json-number';
            
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            
            return `<span class="${cls}">${match}</span>`;
        });
    },
    
    copyToClipboard(text) {
        if (!navigator.clipboard) {
            return this.fallbackCopyToClipboard(text);
        }
        
        return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    },
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
};

function copyToClipboard(text) {
    return JsonUtils.copyToClipboard(text);
}

function showCopyFeedback(button) {
    if (!button) return false;
    
    const originalHTML = button.innerHTML;
    button.innerHTML = 'Скопировано 👌';
    button.disabled = true;
    button.style.opacity = '0.7';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
    
    return true;
}

function copyWithFeedback(text, button) {
    if (copyToClipboard(text)) {
        showCopyFeedback(button);
        return true;
    }
    return false;
}

// ===== 3. УТИЛИТЫ ДЛЯ DOM =====
const DomUtils = {
    createElement(tag, className, text = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    },
    
    showStatusMessage(container, message, type = 'success') {
        const existing = container.querySelector('.json-status-overlay');
        if (existing) existing.remove();
        
        const statusEl = this.createElement('div', `json-status-overlay ${type}`, message);
        statusEl.style.display = 'none';
        container.appendChild(statusEl);
        
        container.style.overflow = 'hidden';
        const initialHeight = container.scrollHeight + 'px';
        statusEl.style.display = 'block';
        const expandedHeight = container.scrollHeight + 'px';
        container.style.height = initialHeight;
        
        setTimeout(() => {
            container.style.height = expandedHeight;
            setTimeout(() => statusEl.classList.add('show'), 10);
        }, 10);
        
        const duration = (type === 'error') ? 5000 : 3000;
        setTimeout(() => {
            container.style.height = initialHeight;
            setTimeout(() => {
                statusEl.classList.remove('show');
                setTimeout(() => {
                    if (statusEl.parentNode) statusEl.remove();
                    container.style.height = '';
                    container.style.overflow = '';
                }, 400);
            }, 400);
        }, duration);
    },
    
    createModal(content, className = '') {
        const overlay = this.createElement('div', 'modal-overlay');
        const modal = this.createElement('div', `modal-content ${className}`);
        
        overlay.appendChild(modal);
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
        
        document.body.appendChild(overlay);
        return { overlay, modal };
    }
};

// ===== 4. ИНИЦИАЛИЗАЦИЯ =====
function initBase() {
    ThemeManager.init();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => ThemeManager.autoDark(), 1000);
        });
    } else {
        setTimeout(() => ThemeManager.autoDark(), 1000);
    }
}

// Экспорт
window.ThemeManager = ThemeManager;
window.JsonUtils = JsonUtils;
window.DomUtils = DomUtils;
window.detectLogFormat = JsonUtils.detectFormat.bind(JsonUtils);
window.cleanAndExtractJson = JsonUtils.cleanAndExtract.bind(JsonUtils);
window.fixCommonJsonErrors = JsonUtils.fixErrors.bind(JsonUtils);
window.highlightJson = JsonUtils.highlight.bind(JsonUtils);
window.copyToClipboard = JsonUtils.copyToClipboard.bind(JsonUtils);

// Автоинициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBase);
} else {
    initBase();
}

