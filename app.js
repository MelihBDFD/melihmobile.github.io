// TodoMobile - Modern To-Do List Uygulaması JavaScript

class TodoMobile {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.isEditMode = false;
        this.editTaskId = null;
        this.init();
    }

    // Uygulama başlatma
    init() {
        this.bindEvents();
        this.renderTasks();
        this.setupPWA();
    }

    // Olay dinleyicilerini bağla
    bindEvents() {
        // Hızlı ekleme
        const quickAddInput = document.getElementById('quickAddInput');
        const quickAddBtn = document.getElementById('quickAddBtn');
        
        quickAddInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.quickAddTask();
            }
        });
        
        quickAddBtn.addEventListener('click', () => {
            this.quickAddTask();
        });

        // Filtre sekmeleri
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Floating Action Button
        document.getElementById('fab').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Modal işlemleri
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                this.closeTaskModal();
            }
        });

        // Görev formu
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('cancelTask').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Arama
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.openSearchModal();
        });

        document.getElementById('searchModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                this.closeSearchModal();
            }
        });

        // Tema değişikliği için
        this.setupThemeToggle();
    }

    // Hızlı görev ekleme
    quickAddTask() {
        const input = document.getElementById('quickAddInput');
        const title = input.value.trim();
        
        if (!title) return;

        // Basit tarih ve etiket algılama
        const taskData = this.parseQuickInput(title);
        
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            description: '',
            priority: 'medium',
            category: taskData.category,
            dueDate: taskData.dueDate,
            tags: taskData.tags,
            completed: false,
            createdAt: new Date().toISOString(),
            subtasks: []
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        input.value = '';
        
        this.showNotification('Görev eklendi!', 'success');
    }

    // Hızlı girdi ayrıştırma (basit AI benzeri)
    parseQuickInput(input) {
        const result = {
            title: input,
            category: '',
            dueDate: null,
            tags: []
        };

        // Tarih algılama
        const datePatterns = [
            /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, // 15.03.2024
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,  // 15/03/2024
            /yarın/g, /bugün/g, /pazartesi/g, /salı/g, /çarşamba/g, /perşembe/g, /cuma/g, /cumartesi/g, /pazar/g,
            /haftaya/g, /gelecek hafta/g
        ];

        // Öncelik algılama
        if (input.includes('acil') || input.includes('önemli') || input.includes('kritik')) {
            result.priority = 'high';
        } else if (input.includes('düşük') || input.includes('normal')) {
            result.priority = 'low';
        }

        // Kategori algılama
        if (input.includes('alışveriş') || input.includes('market')) {
            result.category = 'shopping';
        } else if (input.includes('iş') || input.includes('proje') || input.includes('toplantı')) {
            result.category = 'work';
        } else if (input.includes('sağlık') || input.includes('doktor') || input.includes('spor')) {
            result.category = 'health';
        } else if (input.includes('eğitim') || input.includes('ders') || input.includes('kitap')) {
            result.category = 'education';
        }

        return result;
    }

    // Görev kaydetme
    saveTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        // Alt görevleri topla
        const subtasksContainer = document.getElementById('subtasksContainer');
        const subtaskItems = subtasksContainer.querySelectorAll('.subtask-item');
        const subtasks = [];
        
        subtaskItems.forEach(item => {
            const input = item.querySelector('.subtask-input');
            const checkbox = item.querySelector('.subtask-checkbox');
            const text = input.value.trim();
            
            if (text) {
                subtasks.push({
                    text: text,
                    completed: checkbox.checked
                });
            }
        });
        
        const taskData = {
            id: this.isEditMode ? this.editTaskId : Date.now().toString(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            dueDate: document.getElementById('taskDueDate').value,
            tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            completed: false,
            createdAt: this.isEditMode ? this.tasks.find(t => t.id === this.editTaskId).createdAt : new Date().toISOString(),
            subtasks: subtasks
        };

        if (this.isEditMode) {
            const index = this.tasks.findIndex(t => t.id === this.editTaskId);
            this.tasks[index] = taskData;
        } else {
            this.tasks.unshift(taskData);
        }

        this.saveTasks();
        this.renderTasks();
        this.closeTaskModal();
        
        const message = this.isEditMode ? 'Görev güncellendi!' : 'Görev eklendi!';
        this.showNotification(message, 'success');
    }

    // Görev silme
    deleteTask(taskId) {
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Görev silindi!', 'success');
        }
    }

    // Görev tamamlama
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            
            const message = task.completed ? 'Görev tamamlandı!' : 'Görev tamamlanmadı olarak işaretlendi!';
            this.showNotification(message, 'success');
        }
    }

    // Görev düzenleme
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.isEditMode = true;
            this.editTaskId = taskId;
            
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskTags').value = task.tags.join(', ');
            
            // Alt görevleri yükle
            this.loadSubtasks(task.subtasks);
            
            this.openTaskModal();
        }
    }

    // Filtre ayarlama
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Aktif sekme güncelleme
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderTasks();
    }

    // Görevleri filtreleme
    getFilteredTasks() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (this.currentFilter) {
            case 'today':
                return this.tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                });
            
            case 'upcoming':
                return this.tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    return dueDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000);
                });
            
            case 'overdue':
                return this.tasks.filter(task => {
                    if (!task.dueDate || task.completed) return false;
                    return new Date(task.dueDate) < now;
                });
            
            case 'completed':
                return this.tasks.filter(task => task.completed);
            
            case 'high-priority':
                return this.tasks.filter(task => task.priority === 'high');
            
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            
            default:
                return this.tasks;
        }
    }

    // Görevleri render etme
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>
                        ${this.currentFilter === 'all' ? 'Henüz görev yok' : 
                          this.currentFilter === 'today' ? 'Bugün için görev yok' :
                          this.currentFilter === 'upcoming' ? 'Yaklaşan görev yok' :
                          this.currentFilter === 'overdue' ? 'Geciken görev yok' :
                          this.currentFilter === 'completed' ? 'Tamamlanan görev yok' :
                          this.currentFilter === 'high-priority' ? 'Yüksek öncelikli görev yok' :
                          'Görev bulunamadı'}
                    </p>
                    <small>
                        ${this.currentFilter === 'all' ? 'Hızlı ekleme alanını kullanarak ilk görevinizi oluşturun' : 
                          'Başka bir filtre deneyin veya yeni görev ekleyin'}
                    </small>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        
        // Görev olaylarını bağla
        this.bindTaskEvents();
    }

    // Görev HTML oluşturma
    createTaskHTML(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-main">
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="app.toggleTask('${task.id}')"></div>
                    <div class="task-content">
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                        <div class="task-meta">
                            ${task.priority !== 'medium' ? `<span class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</span>` : ''}
                            ${task.category ? `<span class="task-category">${this.getCategoryText(task.category)}</span>` : ''}
                            ${dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-calendar-alt"></i>
                                ${this.formatDate(dueDate)}
                            </span>` : ''}
                            ${task.tags.length > 0 ? `<span class="task-tags">${task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}</span>` : ''}
                        </div>
                        ${task.subtasks.length > 0 ? `
                            <div class="task-subtasks">
                                ${task.subtasks.map((subtask, index) => `
                                    <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                                        <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''} onchange="app.toggleSubtask('${task.id}', ${index})">
                                        <span class="subtask-text">${this.escapeHtml(subtask.text)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="app.editTask('${task.id}')" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" onclick="app.deleteTask('${task.id}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Görev olaylarını bağla
    bindTaskEvents() {
        // Bu metod renderTasks içinde çağrılıyor
    }

    // Modal açma/kapama
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        modal.classList.add('active');
        
        if (taskId) {
            this.editTask(taskId);
        } else {
            this.isEditMode = false;
            this.editTaskId = null;
            document.getElementById('taskForm').reset();
            this.loadSubtasks([]); // Yeni görev için boş alt görev listesi
        }
        
        // Alt görev olaylarını bağla
        this.bindSubtaskEvents();
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        this.isEditMode = false;
        this.editTaskId = null;
    }

    // Arama modalı
    openSearchModal() {
        document.getElementById('searchModal').classList.add('active');
        document.getElementById('searchInput').focus();
        
        // Arama olaylarını bağla
        this.bindSearchEvents();
    }

    closeSearchModal() {
        document.getElementById('searchModal').classList.remove('active');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }

    bindSearchEvents() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });
    }

    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = this.tasks.filter(task => {
            const searchText = `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>"${this.escapeHtml(query)}" için sonuç bulunamadı</p>
                    <small>Farklı anahtar kelimeler deneyin</small>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.map(task => `
            <div class="search-result-item" onclick="app.editTask('${task.id}')">
                <div class="search-result-title">${this.escapeHtml(task.title)}</div>
                ${task.description ? `<div class="search-result-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="search-result-meta">
                    ${task.priority !== 'medium' ? `<span class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</span>` : ''}
                    ${task.category ? `<span class="task-category">${this.getCategoryText(task.category)}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Yerel depolama işlemleri
    saveTasks() {
        try {
            localStorage.setItem('todomobile_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Görevler kaydedilirken hata:', error);
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('todomobile_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Görevler yüklenirken hata:', error);
            return [];
        }
    }

    // Yardımcı fonksiyonlar
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Saat farkı
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (date < today) {
            // Geçmiş tarih
            return `Geçmiş: ${date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        } else if (date >= today && date < tomorrow) {
            // Bugün
            return `Bugün ${date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        } else if (diffDays === 1) {
            // Yarın
            return `Yarın ${date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        } else {
            // Gelecek tarih
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    getPriorityText(priority) {
        const map = {
            'high': 'Yüksek',
            'medium': 'Orta',
            'low': 'Düşük'
        };
        return map[priority] || 'Orta';
    }

    getCategoryText(category) {
        const map = {
            'work': 'İş',
            'personal': 'Kişisel',
            'shopping': 'Alışveriş',
            'health': 'Sağlık',
            'education': 'Eğitim'
        };
        return map[category] || category;
    }

    showNotification(message, type = 'info') {
        // Basit bildirim sistemi
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        // Animasyon
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Otomatik kapatma
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // PWA kurulumu
    setupPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Tema değiştirme
    setupThemeToggle() {
        // Daha sonra eklenebilir
    }

    // Alt görev metodları
    loadSubtasks(subtasks) {
        const container = document.getElementById('subtasksContainer');
        container.innerHTML = '';
        
        if (subtasks.length === 0) {
            // Boş alt görev için varsayılan bir tane ekle
            this.addSubtaskInput();
        } else {
            // Mevcut alt görevleri yükle
            subtasks.forEach(subtask => {
                this.addSubtaskInput(subtask.text, subtask.completed);
            });
        }
    }

    addSubtaskInput(text = '', completed = false) {
        const container = document.getElementById('subtasksContainer');
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        
        subtaskItem.innerHTML = `
            <input type="checkbox" class="subtask-checkbox" ${completed ? 'checked' : ''}>
            <input type="text" class="subtask-input" value="${this.escapeHtml(text)}" placeholder="Alt görev ekle...">
            <button type="button" class="btn-icon subtask-delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(subtaskItem);
    }

    bindSubtaskEvents() {
        const container = document.getElementById('subtasksContainer');
        
        // Alt görev silme
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('subtask-delete') || e.target.closest('.subtask-delete')) {
                e.target.closest('.subtask-item').remove();
                
                // Eğer hiç alt görev kalmadıysa yeni bir tane ekle
                if (container.children.length === 0) {
                    this.addSubtaskInput();
                }
            }
        });

        // Enter ile yeni alt görev ekleme
        container.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('subtask-input') && e.key === 'Enter') {
                e.preventDefault();
                this.addSubtaskInput();
                container.lastElementChild.querySelector('.subtask-input').focus();
            }
        });

        // Alt görev ekleme butonu
        document.getElementById('addSubtaskBtn').onclick = () => {
            this.addSubtaskInput();
            container.lastElementChild.querySelector('.subtask-input').focus();
        };
    }

    // Alt görevi değiştirme (global fonksiyon için)
    toggleSubtask(taskId, subtaskIndex) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.subtasks[subtaskIndex]) {
            task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
            this.saveTasks();
            this.renderTasks();
        }
    }
}

// Global app instance
let app;

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoMobile();
});
