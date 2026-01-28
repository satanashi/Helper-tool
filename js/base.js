// ===== БАЗОВЫЕ ФУНКЦИИ =====

// ===== АВТОМАТИЧЕСКОЕ ВКЛЮЧЕНИЕ ТЕМЫ ВЕЧЕРОМ =====
function autoDarkTheme() {
    const now = new Date();
    const hour = now.getHours();
    const savedTheme = localStorage.getItem('theme');
    const manualOverride = localStorage.getItem('themeManualOverride') === 'true';

    if (manualOverride) return;

    if (hour >= 18 || hour < 6) {
        if (document.body.classList.contains('dark-theme')) return;
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        if (!document.body.classList.contains('dark-theme')) return;
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) themeBtn.textContent = '🌙';
    }
}


// ===== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ БЕЗ МОРГАНИЯ =====
function toggleTheme() {
    const scrollY = window.scrollY;
    document.body.classList.add('theme-transitioning');
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = isDark ? '☀️' : '🌙';
    }
    
    setTimeout(() => {
        window.scrollTo(0, scrollY);
        document.body.classList.remove('theme-transitioning');
    }, 300);
}

// ===== ИНИЦИАЛИЗАЦИЯ ТЕМЫ ПРИ ЗАГРУЗКЕ =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    }
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    setTimeout(() => {
        document.body.classList.add('theme-loaded');
    }, 50);
}

// ===== УВЕДОМЛЕНИЯ (вместо alert) =====
function showNotification(message, type = 'info') {
    // Создаём кастомное уведомление
    const notif = document.createElement('div');
    notif.className = `notification notification--${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => document.body.removeChild(notif), 300);
    }, 2500);
}

// ===== КОПИРОВАНИЕ =====
function copyToClipboard(text) {
    if (!text?.trim()) return false;
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    // fallback
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
}

function showCopyFeedback(button) {
    if (!button) return;
    const originalHTML = button.innerHTML;
    button.innerHTML = 'Скопировано 👌';
    button.disabled = true;
    button.style.opacity = '0.7';
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
}

// ===== АНИМАЦИИ =====
function fadeInElement(element, duration = 300) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    element.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}

function fadeOutElement(element, duration = 300) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    element.style.transition = `all ${duration}ms ease`;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Base JS initialized');
    initTheme();
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const textToCopy = e.target.getAttribute('data-copy');
            if (textToCopy && copyToClipboard(textToCopy)) {
                showCopyFeedback(e.target);
            }
        }
    });
});

// Экспорт для тестов
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        initTheme,
        copyToClipboard,
        showCopyFeedback,
        fadeInElement,
        fadeOutElement,
        showNotification,
        autoDarkTheme
    };

}
