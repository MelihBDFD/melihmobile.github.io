// TodoMobile - Modern To-Do List Uygulaması JavaScript

class TodoMobile {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.isEditMode = false;
        this.editTaskId = null;
        this.currentUser = null;
        this.init();
    }

    // Uygulama başlatma
    init() {
        this.bindEvents();
        this.renderTasks();
        this.setupPWA();
        this.loadTheme();
        this.initNotificationSystem();
        this.initThemeCustomizer();
    }

    // Tema yükleme
    loadTheme() {
        const savedTheme = localStorage.getItem('todomobile_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // Auth kontrolü
    checkAuth() {
        const user = this.getCurrentUser();
        if (user) {
            this.currentUser = user;
            this.showMainApp();
        } else {
            this.showAuthModal();
        }
    }

    // Kullanıcı bilgilerini al
    getCurrentUser() {
        try {
            const user = localStorage.getItem('todomobile_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    }

    // Kullanıcı bilgilerini kaydet
    saveCurrentUser(user) {
        try {
            localStorage.setItem('todomobile_user', JSON.stringify(user));
            this.currentUser = user;
        } catch (error) {
            console.error('Kullanıcı kaydedilirken hata:', error);
        }
    }

    // Ana uygulamayı göster
    showMainApp() {
        document.getElementById('authModal').classList.remove('active');
        // Kullanıcı adını header'da göster
        const headerTitle = document.querySelector('.app-title');
        if (headerTitle && this.currentUser) {
            headerTitle.textContent = `Merhaba, ${this.currentUser.name.split(' ')[0]}!`;
        }
    }

    // Auth modalını göster
    showAuthModal() {
        document.getElementById('authModal').classList.add('active');
        this.bindAuthEvents();
    }

    // Auth olaylarını bağla
    bindAuthEvents() {
        // Auth tabları
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Auth formu
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        // Auth modal kapatma
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                // Demo modda kapatma engelle
            }
        });
    }

    // Auth tab değiştirme
    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        const nameGroup = document.getElementById('nameGroup');
        const authTitle = document.getElementById('authTitle');
        const authBtn = document.getElementById('authBtn');

        if (tab === 'register') {
            nameGroup.style.display = 'block';
            authTitle.textContent = 'TodoMobile\'e Kayıt Ol';
            authBtn.textContent = 'Kayıt Ol';
        } else {
            nameGroup.style.display = 'none';
            authTitle.textContent = 'TodoMobile\'e Giriş Yap';
            authBtn.textContent = 'Giriş Yap';
        }
    }

    // Auth işlemleri
    handleAuth() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value;

        if (!email || !password) {
            this.showNotification('E-posta ve şifre gerekli!', 'error');
            return;
        }

        const isRegister = document.querySelector('.auth-tab.active').dataset.tab === 'register';

        if (isRegister && !name) {
            this.showNotification('Ad soyad gerekli!', 'error');
            return;
        }

        // Demo mod - herhangi bir bilgi ile giriş yapılabilir
        const user = {
            id: Date.now().toString(),
            name: isRegister ? name : 'Demo Kullanıcı',
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(isRegister ? name : 'Demo Kullanıcı')}&background=3b82f6&color=fff&size=128`,
            joinedAt: new Date().toISOString()
        };

        this.saveCurrentUser(user);
        this.showNotification(`Hoş geldiniz, ${user.name}!`, 'success');
        this.showMainApp();
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

        // Menü
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.openMenuModal();
        });

        document.getElementById('menuModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                this.closeMenuModal();
            }
        });

        // Filtre
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.openFilterModal();
        });

        document.getElementById('filterModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                this.closeFilterModal();
            }
        });

        // Filtre seçenekleri
        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.closest('.filter-option').dataset.filter;
                this.setFilter(filter);
                this.closeFilterModal();
            });
        });

        // Not defteri
        document.getElementById('notesBtn').addEventListener('click', () => {
            this.openNotesModal();
        });

        // Admin panel
        document.getElementById('adminBtn').addEventListener('click', () => {
            this.openAdminModal();
        });

        // Menü öğeleri
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAllTasks();
        });

        document.getElementById('statsBtn').addEventListener('click', () => {
            this.showStats();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('aboutBtn').addEventListener('click', () => {
            this.showAbout();
        });

        document.getElementById('dashboardBtn').addEventListener('click', () => {
            this.openDashboard();
        });

        // AI Asistan event listeners
        document.addEventListener('click', (e) => {
            if (e.target.id === 'aiSuggestBtn' || e.target.closest('#aiSuggestBtn')) {
                this.getAISuggestions();
            } else if (e.target.id === 'smartCategorizeBtn' || e.target.closest('#smartCategorizeBtn')) {
                this.smartCategorizeAll();
            } else if (e.target.id === 'saveNotificationSettings' || e.target.closest('#saveNotificationSettings')) {
                this.saveNotificationSettings();
            } else if (e.target.classList.contains('apply-suggestion')) {
                this.applySuggestion(e.target.dataset.suggestion);
            } else if (e.target.id === 'calendarBtn' || e.target.closest('#calendarBtn')) {
                this.openCalendar();
            } else if (e.target.id === 'prevMonth' || e.target.closest('#prevMonth')) {
                this.changeMonth(-1);
            } else if (e.target.id === 'nextMonth' || e.target.closest('#nextMonth')) {
                this.changeMonth(1);
            } else if (e.target.id === 'gamificationBtn' || e.target.closest('#gamificationBtn')) {
                this.openGamification();
            }
        });

        // Görev butonları için event delegation
        document.addEventListener('click', (e) => {
            // Silme butonu
            if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const deleteBtn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
                const taskId = deleteBtn.dataset.taskId;
                console.log('Silme butonu tıklandı, taskId:', taskId);
                this.deleteTask(taskId);
            }
            // Düzenleme butonu
            else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const editBtn = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
                const taskId = editBtn.dataset.taskId;
                console.log('Düzenleme butonu tıklandı, taskId:', taskId);
                this.editTask(taskId);
            }
        });
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
        console.log('Silme işlemi başlatıldı:', taskId);
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                this.tasks.splice(taskIndex, 1);
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Görev başarıyla silindi!', 'success');
                console.log('Görev silindi:', taskId);
            } else {
                console.error('Silinecek görev bulunamadı:', taskId);
                this.showNotification('Görev bulunamadı!', 'error');
            }
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
            
            // XP kazanımı
            if (task.completed) {
                this.addXP(10);
            }
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
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="app.toggleTask('${task.id}')">
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
                    <button class="task-action-btn edit-btn" data-task-id="${task.id}" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-btn" data-task-id="${task.id}" title="Sil">
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

    // Menü modalı
    openMenuModal() {
        document.getElementById('menuModal').classList.add('active');
    }

    closeMenuModal() {
        document.getElementById('menuModal').classList.remove('active');
    }

    // Filtre modalı aç
    openFilterModal() {
        document.getElementById('filterModal').classList.add('active');
    }

    closeFilterModal() {
        document.getElementById('filterModal').classList.remove('active');
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
        } else if (date >= today && date < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
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
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    this.swRegistration = registration;
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Install prompt
        this.setupInstallPrompt();
        
        // Offline/Online detection
        this.setupOfflineDetection();
        
        // Helper bot
        this.addHelperBot();
    }

    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });

        // Install button click
        document.addEventListener('click', (e) => {
            if (e.target.id === 'installApp') {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            this.showNotification('Uygulama yükleniyor...', 'success');
                        }
                        deferredPrompt = null;
                    });
                }
            }
        });
    }

    showInstallButton() {
        // Add install button to menu if not exists
        const menuItems = document.querySelector('.menu-items');
        if (!document.getElementById('installApp')) {
            const installBtn = document.createElement('button');
            installBtn.className = 'menu-item';
            installBtn.id = 'installApp';
            installBtn.innerHTML = `
                <i class="fas fa-download"></i>
                Uygulamayı Yükle
            `;
            menuItems.insertBefore(installBtn, menuItems.firstChild);
        }
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.showNotification('İnternet bağlantısı geri geldi!', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showNotification('Çevrimdışı modda çalışıyorsunuz', 'warning');
        });
    }

    syncOfflineData() {
        // Sync offline changes when back online
        const offlineChanges = JSON.parse(localStorage.getItem('offline_changes') || '[]');
        if (offlineChanges.length > 0) {
            // Process offline changes
            offlineChanges.forEach(change => {
                // Apply changes
                console.log('Syncing offline change:', change);
            });
            localStorage.removeItem('offline_changes');
            this.showNotification('Çevrimdışı değişiklikler senkronize edildi!', 'success');
        }
    }

    // Tema değiştirme
    setupThemeToggle() {
        // Daha sonra eklenebilir
    }

    // Helper bot sistemi
    addHelperBot() {
        // Helper bot butonunu ekle
        const helperBtn = document.createElement('button');
        helperBtn.className = 'btn-icon helper-bot-btn';
        helperBtn.innerHTML = '<i class="fas fa-robot"></i>';
        helperBtn.title = 'TodoBot Yardımcı';
        helperBtn.onclick = () => this.openHelperModal();
        
        // Header'a ekle
        const headerActions = document.querySelector('.header-actions');
        headerActions.insertBefore(helperBtn, headerActions.firstChild);
    }

    // Helper modalı aç
    openHelperModal() {
        document.getElementById('helperModal').classList.add('active');
        this.bindHelperEvents();
    }

    // Helper olaylarını bağla
    bindHelperEvents() {
        const helperInput = document.getElementById('helperInput');
        const helperSend = document.getElementById('helperSend');
        const helperMessages = document.getElementById('helperMessages');

        // Gönder butonu
        helperSend.onclick = () => {
            const message = helperInput.value.trim();
            if (message) {
                this.sendHelperMessage(message);
                helperInput.value = '';
            }
        };

        // Enter ile gönderme
        helperInput.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('helper-input') && e.key === 'Enter') {
                helperSend.click();
            }
        });

        // Öneri butonları
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.onclick = () => {
                const suggestion = btn.dataset.suggestion;
                this.sendHelperMessage(suggestion);
            };
        });

        // Modal kapatma
        document.getElementById('helperModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                document.getElementById('helperModal').classList.remove('active');
            }
        });
    }

    // Helper mesajı gönder
    sendHelperMessage(message) {
        const helperMessages = document.getElementById('helperMessages');
        
        // Kullanıcı mesajını ekle
        const userMessage = document.createElement('div');
        userMessage.className = 'helper-message user-message';
        userMessage.innerHTML = `<div class="message-content">${this.escapeHtml(message)}</div>`;
        helperMessages.appendChild(userMessage);

        // Bot yanıtını ekle
        setTimeout(() => {
            const botResponse = this.getBotResponse(message);
            const botMessage = document.createElement('div');
            botMessage.className = 'helper-message bot-message';
            botMessage.innerHTML = `<div class="message-content">${botResponse}</div>`;
            helperMessages.appendChild(botMessage);
            
            // Scroll to bottom
            helperMessages.scrollTop = helperMessages.scrollHeight;
        }, 500);
    }

    // Bot yanıtlarını al
    getBotResponse(message) {
        const responses = {
            'merhaba': 'Merhaba! Size nasıl yardımcı olabilirim?',
            'selam': 'Selam! TodoBot olarak görev yönetimi konusunda yardımcı olabilirim.',
            'yardım': 'Size şu konularda yardımcı olabilirim:\n• Görev ekleme ve düzenleme\n• Öncelik ayarlama\n• Alt görev kullanımı\n• Filtreleme seçenekleri\n• Veri yönetimi',
            'görev ekleme': 'Görev eklemek için:\n1. Hızlı ekleme kutusuna yazın\n2. Veya + butonuna tıklayın\n3. Detaylı formu doldurun',
            'öncelik': 'Öncelik seviyeleri:\n🔴 Yüksek: Kritik görevler\n🟡 Orta: Normal görevler\n🟢 Düşük: Daha az önemli görevler',
            'alt görev': 'Alt görevler, ana görevi küçük parçalara bölmenizi sağlar. Her alt görevi ayrı ayrı tamamlayabilirsiniz.',
            'filtreleme': 'Filtreleme seçenekleri:\n• Tümü: Tüm görevler\n• Bugün: Bugünün görevleri\n• Yaklaşan: Gelecek görevler\n• Tamamlanan: Biten görevler\n• Yüksek Öncelik: Kritik görevler',
            'veri': 'Verilerinizi:\n• Yerel olarak tarayıcıda saklanır\n• Dışa aktarma ile yedekleyebilirsiniz\n• İçe aktarma ile geri yükleyebilirsiniz',
            'bugün': this.generateTodaySuggestions(),
            'öneri': this.generateTodaySuggestions(),
            'teşekkür': 'Rica ederim! Başka sorunuz var mı?',
            'sağol': 'Rica ederim! Başka bir konuda yardımcı olabilirim.',
            'bye': 'Görüşürüz! Başka zaman yardımcı olurum.',
            'güle güle': 'Görüşürüz! İyi günler!'
        };

        const lowerMessage = message.toLowerCase();
        
        // Anahtar kelimeleri kontrol et
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        // Varsayılan yanıt
        return 'Bu konuda size yardımcı olmak için daha fazla bilgi verebilirim. Lütfen "yardım" yazarak mevcut seçenekleri görün.';
    }

    // Bugün için görev önerileri
    generateTodaySuggestions() {
        const suggestions = [
            '💼 İş görevleri: E-posta kontrolü, proje güncellemesi',
            '🏠 Ev işleri: Çamaşır, market alışverişi',
            '📚 Eğitim: Ders çalışma, kitap okuma',
            '🏃‍♂️ Sağlık: Egzersiz, meditasyon',
            '🎯 Kişisel: Hedef belirleme, planlama'
        ];
        
        return `Bugün için bazı görev önerileri:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
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

    // Not defteri metodları
    openNotesModal() {
        document.getElementById('notesModal').classList.add('active');
        this.loadNotes();
        this.bindNotesEvents();
    }

    loadNotes() {
        const notes = localStorage.getItem('todomobile_notes') || '';
        const lastSaved = localStorage.getItem('todomobile_notes_lastsaved');
        document.getElementById('notesTextarea').value = notes;
        if (lastSaved) {
            document.getElementById('notesLastSaved').textContent = new Date(lastSaved).toLocaleString('tr-TR');
        }
    }

    bindNotesEvents() {
        document.getElementById('saveNotes').onclick = () => {
            const notes = document.getElementById('notesTextarea').value;
            localStorage.setItem('todomobile_notes', notes);
            localStorage.setItem('todomobile_notes_lastsaved', new Date().toISOString());
            document.getElementById('notesLastSaved').textContent = new Date().toLocaleString('tr-TR');
            this.showNotification('Notlar kaydedildi!', 'success');
        };

        document.getElementById('clearNotes').onclick = () => {
            if (confirm('Tüm notları silmek istediğinizden emin misiniz?')) {
                document.getElementById('notesTextarea').value = '';
                localStorage.removeItem('todomobile_notes');
                localStorage.removeItem('todomobile_notes_lastsaved');
                document.getElementById('notesLastSaved').textContent = 'Henüz kaydedilmedi';
                this.showNotification('Notlar temizlendi!', 'success');
            }
        };

        document.getElementById('notesModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                document.getElementById('notesModal').classList.remove('active');
            }
        });
    }

    // Admin panel metodları
    openAdminModal() {
        document.getElementById('adminModal').classList.add('active');
        this.bindAdminEvents();
    }

    bindAdminEvents() {
        const ADMIN_PASSWORD = 'WelcomeOwner';

        document.getElementById('adminLoginBtn').onclick = () => {
            const password = document.getElementById('adminPassword').value;
            if (password === ADMIN_PASSWORD) {
                document.getElementById('adminAuth').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                this.loadAdminStats();
                this.showNotification('Yönetici paneline hoş geldiniz!', 'success');
            } else {
                this.showNotification('Hatalı şifre!', 'error');
            }
        };

        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('adminLoginBtn').click();
            }
        });

        document.getElementById('testNotification').onclick = () => {
            this.testNotification();
        };

        document.getElementById('clearAllDataAdmin').onclick = () => {
            if (confirm('TÜM VERİLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ? Bu işlem geri alınamaz!')) {
                if (confirm('Son kez soruyorum: Tüm görevler, notlar ve ayarlar silinecek!')) {
                    localStorage.clear();
                    this.showNotification('Tüm veriler temizlendi!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            }
        };

        document.getElementById('exportLogsAdmin').onclick = () => {
            const logs = {
                tasks: this.tasks,
                notes: localStorage.getItem('todomobile_notes'),
                user: this.currentUser,
                exportDate: new Date().toISOString()
            };
            const dataStr = JSON.stringify(logs, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `todomobile_logs_${new Date().getTime()}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            this.showNotification('Loglar dışa aktarıldı!', 'success');
        };

        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                document.getElementById('adminModal').classList.remove('active');
                document.getElementById('adminAuth').style.display = 'flex';
                document.getElementById('adminPanel').style.display = 'none';
                document.getElementById('adminPassword').value = '';
            }
        });
    }

    loadAdminStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const storageUsed = (JSON.stringify(localStorage).length / 1024).toFixed(2);

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('storageUsed').textContent = storageUsed + ' KB';
    }

    async testNotification() {
        const status = document.getElementById('notificationStatus');
        
        if (!('Notification' in window)) {
            status.textContent = 'Bu tarayıcı bildirimleri desteklemiyor!';
            status.className = 'notification-status error';
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification('TodoMobile Test', {
                body: 'Bildirimler başarıyla çalışıyor! 🎉',
                icon: '/manifest.json'
            });
            status.textContent = 'Test bildirimi gönderildi! ✅';
            status.className = 'notification-status success';
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('TodoMobile Test', {
                    body: 'Bildirimler başarıyla çalışıyor! 🎉',
                    icon: '/manifest.json'
                });
                status.textContent = 'Test bildirimi gönderildi! ✅';
                status.className = 'notification-status success';
            } else {
                status.textContent = 'Bildirim izni reddedildi!';
                status.className = 'notification-status error';
            }
        } else {
            status.textContent = 'Bildirimler engellenmiş. Tarayıcı ayarlarından izin verin.';
            status.className = 'notification-status error';
        }
    }

    // Menü işlevleri
    exportData() {
        const data = {
            tasks: this.tasks,
            notes: localStorage.getItem('todomobile_notes'),
            user: this.currentUser,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `todomobile_backup_${new Date().getTime()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Veriler dışa aktarıldı!', 'success');
        this.closeMenuModal();
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (confirm('Mevcut veriler silinecek ve yeni veriler yüklenecek. Devam etmek istiyor musunuz?')) {
                        if (data.tasks) {
                            this.tasks = data.tasks;
                            this.saveTasks();
                        }
                        if (data.notes) {
                            localStorage.setItem('todomobile_notes', data.notes);
                        }
                        if (data.user) {
                            this.saveCurrentUser(data.user);
                        }
                        
                        this.renderTasks();
                        this.showNotification('Veriler başarıyla içe aktarıldı!', 'success');
                    }
                } catch (error) {
                    this.showNotification('Geçersiz dosya formatı!', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
        this.closeMenuModal();
    }

    clearAllTasks() {
        if (confirm('TÜM GÖREVLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?')) {
            if (confirm('Bu işlem geri alınamaz! Son kez onaylıyor musunuz?')) {
                this.tasks = [];
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Tüm görevler silindi!', 'success');
            }
        }
        this.closeMenuModal();
    }

    showStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const highPriorityTasks = this.tasks.filter(t => t.priority === 'high').length;
        const overdueTasks = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            return new Date(t.dueDate) < new Date();
        }).length;
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const statsMessage = `📊 İSTATİSTİKLER\n\n` +
            `📋 Toplam Görev: ${totalTasks}\n` +
            `✅ Tamamlanan: ${completedTasks}\n` +
            `⏳ Bekleyen: ${pendingTasks}\n` +
            `🔥 Yüksek Öncelik: ${highPriorityTasks}\n` +
            `⚠️ Geciken: ${overdueTasks}\n` +
            `📈 Tamamlanma Oranı: %${completionRate}`;
        
        alert(statsMessage);
        this.closeMenuModal();
    }

    showSettings() {
        const settings = `⚙️ AYARLAR\n\n` +
            `🎨 Tema: Otomatik\n` +
            `🔔 Bildirimler: ${Notification.permission === 'granted' ? 'Açık' : 'Kapalı'}\n` +
            `💾 Depolama: ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB\n` +
            `📱 PWA: Destekleniyor\n` +
            `🌐 Dil: Türkçe\n\n` +
            `Gelişmiş ayarlar için Yönetici Paneli'ni kullanın.`;
        
        alert(settings);
        this.closeMenuModal();
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('todomobile_theme', 'light');
            this.showNotification('Açık tema aktif!', 'success');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('todomobile_theme', 'dark');
            this.showNotification('Koyu tema aktif!', 'success');
        }
        
        this.closeMenuModal();
    }

    showAbout() {
        const about = `ℹ️ HAKKINDA\n\n` +
            `📱 TodoMobile v1.0\n` +
            `🚀 Modern Görev Yöneticisi\n\n` +
            `✨ Özellikler:\n` +
            `• Akıllı görev ekleme\n` +
            `• Alt görev desteği\n` +
            `• Kategori ve etiketleme\n` +
            `• Not defteri\n` +
            `• Yönetici paneli\n` +
            `• PWA desteği\n\n` +
            `💻 Teknoloji:\n` +
            `• HTML5, CSS3, JavaScript\n` +
            `• Local Storage\n` +
            `• Progressive Web App\n\n` +
            `🎨 Tasarım: Glassmorphism\n` +
            `📅 ${new Date().getFullYear()} - Açık Kaynak`;
        
        alert(about);
        this.closeMenuModal();
    }

    // Dashboard işlevleri
    openDashboard() {
        document.getElementById('dashboardModal').classList.add('active');
        this.loadDashboardData();
        this.bindDashboardEvents();
        this.closeMenuModal();
    }

    loadDashboardData() {
        // Genel progress hesapla
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Progress circle güncelle
        const progressCircle = document.getElementById('overallProgress');
        progressCircle.querySelector('.progress-text').textContent = progressPercent + '%';
        progressCircle.style.background = `conic-gradient(var(--primary-color) ${progressPercent * 3.6}deg, var(--border-color) 0deg)`;

        // Streak hesapla
        const streak = this.calculateStreak();
        document.getElementById('streakDays').textContent = streak;

        // Haftalık chart çiz
        this.drawWeeklyChart();

        // Kategori stats
        this.loadCategoryStats();

        // Activity feed
        this.loadActivityFeed();
    }

    calculateStreak() {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateStr = currentDate.toDateString();
            const dayTasks = this.tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === dateStr && task.completed;
            });
            
            if (dayTasks.length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    drawWeeklyChart() {
        const ctx = document.getElementById('weeklyChart').getContext('2d');
        const last7Days = [];
        const taskCounts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
            
            const dayTasks = this.tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === date.toDateString();
            });
            taskCounts.push(dayTasks.length);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Görevler',
                    data: taskCounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    loadCategoryStats() {
        const categories = {};
        this.tasks.forEach(task => {
            if (task.category) {
                categories[task.category] = (categories[task.category] || 0) + 1;
            }
        });

        const categoryStats = document.getElementById('categoryStats');
        categoryStats.innerHTML = '';

        Object.entries(categories).forEach(([category, count]) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-stat-item';
            categoryItem.innerHTML = `
                <div class="category-name">${this.getCategoryText(category)}</div>
                <div class="category-count">${count}</div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${(count / this.tasks.length) * 100}%"></div>
                </div>
            `;
            categoryStats.appendChild(categoryItem);
        });
    }

    loadActivityFeed() {
        const recentTasks = this.tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const activityFeed = document.getElementById('activityFeed');
        activityFeed.innerHTML = '';

        recentTasks.forEach(task => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            const timeAgo = this.getTimeAgo(new Date(task.createdAt));
            activityItem.innerHTML = `
                <div class="activity-icon ${task.completed ? 'completed' : 'pending'}">
                    <i class="fas fa-${task.completed ? 'check' : 'clock'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(task.title)}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
            activityFeed.appendChild(activityItem);
        });
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} gün önce`;
        if (hours > 0) return `${hours} saat önce`;
        if (minutes > 0) return `${minutes} dakika önce`;
        return 'Az önce';
    }

    bindDashboardEvents() {
        document.getElementById('dashboardModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                document.getElementById('dashboardModal').classList.remove('active');
            }
        });
    }

    // Bildirim sistemi
    initNotificationSystem() {
        this.loadNotificationSettings();
        this.scheduleNotifications();
    }

    loadNotificationSettings() {
        const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        document.getElementById('enableNotifications').checked = settings.enabled || false;
        document.getElementById('dailyReminder').checked = settings.dailyReminder || false;
        document.getElementById('deadlineAlerts').checked = settings.deadlineAlerts || false;
        document.getElementById('reminderTime').value = settings.reminderTime || '09:00';
    }

    saveNotificationSettings() {
        const settings = {
            enabled: document.getElementById('enableNotifications').checked,
            dailyReminder: document.getElementById('dailyReminder').checked,
            deadlineAlerts: document.getElementById('deadlineAlerts').checked,
            reminderTime: document.getElementById('reminderTime').value
        };
        
        localStorage.setItem('notification_settings', JSON.stringify(settings));
        this.showNotification('Bildirim ayarları kaydedildi!', 'success');
        
        if (settings.enabled) {
            this.requestNotificationPermission();
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
    }

    scheduleNotifications() {
        const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        
        if (settings.enabled && settings.dailyReminder) {
            this.scheduleDailyReminder(settings.reminderTime);
        }
        
        if (settings.enabled && settings.deadlineAlerts) {
            this.checkDeadlines();
        }
    }

    scheduleDailyReminder(time) {
        const [hours, minutes] = time.split(':');
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime - now;
        
        setTimeout(() => {
            this.sendDailyReminder();
            // Bir sonraki gün için tekrar planla
            this.scheduleDailyReminder(time);
        }, timeUntilReminder);
    }

    sendDailyReminder() {
        const pendingTasks = this.tasks.filter(t => !t.completed).length;
        
        if (pendingTasks > 0 && Notification.permission === 'granted') {
            new Notification('TodoMobile Hatırlatıcı', {
                body: `${pendingTasks} bekleyen göreviniz var!`,
                icon: '/manifest.json'
            });
        }
    }

    checkDeadlines() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const urgentTasks = this.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate <= tomorrow;
        });
        
        urgentTasks.forEach(task => {
            if (Notification.permission === 'granted') {
                new Notification('Deadline Uyarısı!', {
                    body: `"${task.title}" görevi yakında sona eriyor!`,
                    icon: '/manifest.json'
                });
            }
        });
    }

    // Tema özelleştirme sistemi
    initThemeCustomizer() {
        this.loadCustomTheme();
        this.bindThemeEvents();
    }

    loadCustomTheme() {
        const customTheme = JSON.parse(localStorage.getItem('custom_theme') || '{}');
        
        if (customTheme.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', customTheme.primaryColor);
            document.getElementById('primaryColor').value = customTheme.primaryColor;
        }
        
        if (customTheme.backgroundColor) {
            document.documentElement.style.setProperty('--background-color', customTheme.backgroundColor);
            document.getElementById('backgroundColor').value = customTheme.backgroundColor;
        }
        
        if (customTheme.fontSize) {
            document.documentElement.style.fontSize = customTheme.fontSize + 'px';
            document.getElementById('fontSize').value = customTheme.fontSize;
            document.getElementById('fontSizeValue').textContent = customTheme.fontSize + 'px';
        }
        
        if (customTheme.animationSpeed) {
            document.documentElement.style.setProperty('--transition-fast', customTheme.animationSpeed + 's');
            document.getElementById('animationSpeed').value = customTheme.animationSpeed;
            document.getElementById('animationSpeedValue').textContent = customTheme.animationSpeed + 's';
        }
    }

    bindThemeEvents() {
        document.getElementById('fontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        });
        
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            document.getElementById('animationSpeedValue').textContent = e.target.value + 's';
        });
        
        document.getElementById('applyTheme').addEventListener('click', () => {
            this.applyCustomTheme();
        });
        
        document.getElementById('resetTheme').addEventListener('click', () => {
            this.resetTheme();
        });
    }

    applyCustomTheme() {
        const customTheme = {
            primaryColor: document.getElementById('primaryColor').value,
            backgroundColor: document.getElementById('backgroundColor').value,
            fontSize: document.getElementById('fontSize').value,
            animationSpeed: document.getElementById('animationSpeed').value
        };
        
        document.documentElement.style.setProperty('--primary-color', customTheme.primaryColor);
        document.documentElement.style.setProperty('--background-color', customTheme.backgroundColor);
        document.documentElement.style.fontSize = customTheme.fontSize + 'px';
        document.documentElement.style.setProperty('--transition-fast', customTheme.animationSpeed + 's');
        
        localStorage.setItem('custom_theme', JSON.stringify(customTheme));
        this.showNotification('Tema uygulandı!', 'success');
    }

    resetTheme() {
        localStorage.removeItem('custom_theme');
        location.reload();
    }

    // AI Asistan İşlevleri
    getAISuggestions() {
        const suggestions = this.generateSmartSuggestions();
        this.showAISuggestions(suggestions);
        this.closeMenuModal();
    }

    generateSmartSuggestions() {
        const suggestions = [];
        const now = new Date();
        const pendingTasks = this.tasks.filter(t => !t.completed);
        const overdueTasks = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            return new Date(t.dueDate) < now;
        });

        // Öncelik önerileri
        if (pendingTasks.length > 5) {
            suggestions.push({
                type: 'priority',
                title: 'Öncelik Belirleme',
                description: `${pendingTasks.length} bekleyen göreviniz var. Yüksek öncelikli olanları belirleyin.`,
                action: 'prioritize_tasks'
            });
        }

        // Geciken görevler
        if (overdueTasks.length > 0) {
            suggestions.push({
                type: 'overdue',
                title: 'Geciken Görevler',
                description: `${overdueTasks.length} göreviniz gecikmiş. Bunları öncelikle tamamlayın.`,
                action: 'focus_overdue'
            });
        }

        // Kategori önerisi
        const uncategorized = this.tasks.filter(t => !t.category).length;
        if (uncategorized > 3) {
            suggestions.push({
                type: 'categorize',
                title: 'Kategori Önerisi',
                description: `${uncategorized} göreviniz kategorisiz. Otomatik kategori atayalım mı?`,
                action: 'auto_categorize'
            });
        }

        // Zaman yönetimi
        const todayTasks = this.tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.toDateString() === now.toDateString();
        });

        if (todayTasks.length > 5) {
            suggestions.push({
                type: 'time',
                title: 'Zaman Yönetimi',
                description: `Bugün ${todayTasks.length} göreviniz var. Zamanınızı daha iyi planlayın.`,
                action: 'time_management'
            });
        }

        // Motivasyon
        const completedToday = this.tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return completedDate.toDateString() === now.toDateString();
        }).length;

        if (completedToday > 0) {
            suggestions.push({
                type: 'motivation',
                title: 'Harika İş!',
                description: `Bugün ${completedToday} görev tamamladınız. Devam edin!`,
                action: 'celebrate'
            });
        }

        return suggestions.length > 0 ? suggestions : [{
            type: 'general',
            title: 'Her Şey Yolunda!',
            description: 'Görevleriniz düzenli görünüyor. Böyle devam edin!',
            action: 'keep_going'
        }];
    }

    showAISuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay ai-suggestions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-brain"></i> AI Önerileri</h2>
                    <button class="btn-icon modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="ai-suggestions">
                        ${suggestions.map(suggestion => `
                            <div class="suggestion-card ${suggestion.type}">
                                <div class="suggestion-icon">
                                    <i class="fas fa-${this.getSuggestionIcon(suggestion.type)}"></i>
                                </div>
                                <div class="suggestion-content">
                                    <h3>${suggestion.title}</h3>
                                    <p>${suggestion.description}</p>
                                    <button class="btn-primary apply-suggestion" data-suggestion="${suggestion.action}">
                                        Uygula
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');

        // Close event
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                document.body.removeChild(modal);
            }
        });
    }

    getSuggestionIcon(type) {
        const icons = {
            priority: 'exclamation-triangle',
            overdue: 'clock',
            categorize: 'tags',
            time: 'calendar-alt',
            motivation: 'trophy',
            general: 'lightbulb'
        };
        return icons[type] || 'lightbulb';
    }

    applySuggestion(action) {
        switch (action) {
            case 'prioritize_tasks':
                this.prioritizeTasks();
                break;
            case 'focus_overdue':
                this.focusOverdueTasks();
                break;
            case 'auto_categorize':
                this.smartCategorizeAll();
                break;
            case 'time_management':
                this.showTimeManagementTips();
                break;
            case 'celebrate':
                this.showCelebration();
                break;
            default:
                this.showNotification('Öneri uygulandı!', 'success');
        }
        
        // Close suggestions modal
        const modal = document.querySelector('.ai-suggestions-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    smartCategorizeAll() {
        let categorized = 0;
        this.tasks.forEach(task => {
            if (!task.category) {
                task.category = this.predictCategory(task.title + ' ' + task.description);
                categorized++;
            }
        });

        if (categorized > 0) {
            this.saveTasks();
            this.renderTasks();
            this.showNotification(`${categorized} görev otomatik kategorize edildi!`, 'success');
        } else {
            this.showNotification('Tüm görevler zaten kategorize edilmiş!', 'info');
        }
        this.closeMenuModal();
    }

    predictCategory(text) {
        const keywords = {
            work: ['iş', 'toplantı', 'proje', 'rapor', 'sunum', 'müşteri', 'ofis', 'çalışma'],
            personal: ['kişisel', 'aile', 'ev', 'temizlik', 'alışveriş', 'doktor', 'randevu'],
            health: ['sağlık', 'doktor', 'hastane', 'ilaç', 'egzersiz', 'spor', 'diyet'],
            education: ['eğitim', 'ders', 'ödev', 'sınav', 'kurs', 'öğrenme', 'kitap'],
            shopping: ['alışveriş', 'market', 'satın', 'al', 'mağaza', 'online']
        };

        const lowerText = text.toLowerCase();
        
        for (const [category, words] of Object.entries(keywords)) {
            if (words.some(word => lowerText.includes(word))) {
                return category;
            }
        }
        
        return 'personal'; // Default category
    }

    prioritizeTasks() {
        const pendingTasks = this.tasks.filter(t => !t.completed);
        let updated = 0;

        pendingTasks.forEach(task => {
            const urgencyScore = this.calculateUrgencyScore(task);
            if (urgencyScore > 7 && task.priority !== 'high') {
                task.priority = 'high';
                updated++;
            } else if (urgencyScore > 4 && task.priority === 'low') {
                task.priority = 'medium';
                updated++;
            }
        });

        if (updated > 0) {
            this.saveTasks();
            this.renderTasks();
            this.showNotification(`${updated} görevin önceliği güncellendi!`, 'success');
        }
    }

    calculateUrgencyScore(task) {
        let score = 0;
        
        // Due date proximity
        if (task.dueDate) {
            const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue <= 1) score += 5;
            else if (daysUntilDue <= 3) score += 3;
            else if (daysUntilDue <= 7) score += 1;
        }
        
        // Keywords in title
        const urgentKeywords = ['acil', 'önemli', 'hemen', 'bugün', 'deadline'];
        const title = task.title.toLowerCase();
        urgentKeywords.forEach(keyword => {
            if (title.includes(keyword)) score += 2;
        });
        
        return score;
    }

    focusOverdueTasks() {
        this.setFilter('overdue');
        this.showNotification('Geciken görevlere odaklanın!', 'warning');
    }

    showTimeManagementTips() {
        const tips = [
            '🎯 Günde 3 ana göreve odaklanın',
            '⏰ Pomodoro tekniği kullanın (25dk çalışma, 5dk mola)',
            '📋 Görevleri önem sırasına göre sıralayın',
            '🚫 Dikkat dağıtıcı unsurları minimize edin',
            '✅ Küçük görevleri hemen tamamlayın'
        ];
        
        alert('⏰ ZAMAN YÖNETİMİ İPUÇLARI\n\n' + tips.join('\n\n'));
    }

    showCelebration() {
        this.showNotification('🎉 Harika iş çıkarıyorsunuz! Böyle devam edin!', 'success');
    }

    // Takvim İşlevleri
    openCalendar() {
        document.getElementById('calendarModal').classList.add('active');
        this.currentCalendarDate = new Date();
        this.renderCalendar();
        this.closeMenuModal();
    }

    renderCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                           'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        const dayHeaders = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (currentDate.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }

            const dayTasks = this.getTasksForDate(currentDate);
            dayElement.innerHTML = `
                <div class="day-number">${currentDate.getDate()}</div>
                <div class="day-tasks">
                    ${dayTasks.map(task => `
                        <div class="calendar-task ${task.priority}" title="${task.title}">
                            ${task.title.substring(0, 15)}${task.title.length > 15 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            calendarGrid.appendChild(dayElement);
        }
    }

    getTasksForDate(date) {
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === date.toDateString();
        });
    }

    changeMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.renderCalendar();
    }

    // Gamification Sistemi
    addXP(amount) {
        const userData = this.getUserData();
        userData.xp += amount;
        localStorage.setItem('user_gamification', JSON.stringify(userData));
        this.showNotification(`+${amount} XP kazandınız!`, 'success');
    }

    getUserData() {
        const defaultData = {
            level: 1,
            xp: 0,
            achievements: [],
            totalTasksCompleted: 0,
            streak: 0
        };
        
        const userData = JSON.parse(localStorage.getItem('user_gamification') || JSON.stringify(defaultData));
        userData.totalTasksCompleted = this.tasks.filter(t => t.completed).length;
        userData.streak = this.calculateStreak();
        userData.level = Math.floor(userData.xp / 100) + 1;
        
        return userData;
    }

    // Sosyal Özellikler
    shareProgress() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const shareText = `TodoMobile ile %${progressPercent} ilerleme kaydettim! ${completedTasks}/${totalTasks} görev tamamlandı 🎉`;
        
        if (navigator.share) {
            navigator.share({
                title: 'TodoMobile İlerleme',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            this.showNotification('Paylaşım metni kopyalandı!', 'success');
        }
    }

    // Analytics
    generateWeeklyReport() {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const weeklyTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= lastWeek;
        });
        
        const completedThisWeek = weeklyTasks.filter(t => t.completed).length;
        const report = {
            totalTasks: weeklyTasks.length,
            completed: completedThisWeek,
            completionRate: weeklyTasks.length > 0 ? Math.round((completedThisWeek / weeklyTasks.length) * 100) : 0,
            categories: this.getCategoryStats(weeklyTasks)
        };
        
        return report;
    }

    getCategoryStats(tasks = this.tasks) {
        const stats = {};
        tasks.forEach(task => {
            if (task.category) {
                stats[task.category] = (stats[task.category] || 0) + 1;
            }
        });
        return stats;
    }
}

// Global app instance
let app;

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoMobile();
    app.checkAuth();
});
