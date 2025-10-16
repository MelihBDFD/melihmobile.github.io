// ============================================
// MOBILE-ONLY APP.JS - Sadece Mobil Cihazlar İçin
// ============================================

// Veri yönetimi - Mobile optimized
let tasks = [];
let categories = [];
let achievements = [];
let currentFilter = 'all';
let mobileCurrentFilter = 'all';
let currentUser = null;
let aiConversationHistory = [];

// Başarımları yükle
function loadAchievements() {
    try {
        const saved = localStorage.getItem('todo_pro_mobile_achievements');
        if (saved) {
            achievements = JSON.parse(saved);
        } else {
            achievements = [
                {
                    id: 'first_task',
                    name: 'İlk Görev',
                    description: 'İlk görevi tamamla',
                    icon: '🎯',
                    requirement: 1,
                    current: 0,
                    unlocked: false,
                    category: 'baslangic'
                },
                {
                    id: 'task_master',
                    name: 'Görev Ustası',
                    description: '25 görevi tamamla',
                    icon: '🏆',
                    requirement: 25,
                    current: 0,
                    unlocked: false,
                    category: 'tamamlama'
                },
                {
                    id: 'time_tracker',
                    name: 'Zaman Ustası',
                    description: '5 saat zaman takip et',
                    icon: '⏱️',
                    requirement: 5,
                    current: 0,
                    unlocked: false,
                    category: 'zaman'
                },
                {
                    id: 'category_king',
                    name: 'Kategori Kralı',
                    description: '5 kategori oluştur',
                    icon: '👑',
                    requirement: 5,
                    current: 0,
                    unlocked: false,
                    category: 'organizasyon'
                },
                {
                    id: 'perfectionist',
                    name: 'Mükemmeliyetçi',
                    description: '10 görevi arka arkaya tamamla',
                    icon: '💎',
                    requirement: 10,
                    current: 0,
                    unlocked: false,
                    category: 'mukemmelliyet'
                },
                {
                    id: 'early_bird',
                    name: 'Erken Kuş',
                    description: 'Sabah 6-9 arası görev tamamla',
                    icon: '🌅',
                    requirement: 5,
                    current: 0,
                    unlocked: false,
                    category: 'zaman'
                }
            ];
        }
    } catch (e) {
        console.error('Başarımlar yüklenirken hata:', e);
    }
}

// Kategorileri yükle
function loadCategories() {
    try {
        const saved = localStorage.getItem('todo_pro_mobile_categories');
        if (saved) {
            categories = JSON.parse(saved);
        } else {
            categories = [
                {
                    id: 'work',
                    name: 'İş',
                    color: '#667eea'
                },
                {
                    id: 'personal',
                    name: 'Kişisel',
                    color: '#4caf50'
                },
                {
                    id: 'shopping',
                    name: 'Alışveriş',
                    color: '#ff9800'
                }
            ];
        }
    } catch (e) {
        console.error('Kategoriler yüklenirken hata:', e);
    }
}

// Görevleri yükle
function loadTasks() {
    try {
        const saved = localStorage.getItem('todo_pro_mobile_tasks');
        if (saved) {
            tasks = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Görevler yüklenirken hata:', e);
    }
}

// Görevleri kaydet
function saveTasks() {
    try {
        localStorage.setItem('todo_pro_mobile_tasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Görevler kaydedilirken hata:', e);
    }
}

// Kategorileri kaydet
function saveCategories() {
    try {
        localStorage.setItem('todo_pro_mobile_categories', JSON.stringify(categories));
    } catch (e) {
        console.error('Kategoriler kaydedilirken hata:', e);
    }
}

// Başarımları kaydet
function saveAchievements() {
    try {
        localStorage.setItem('todo_pro_mobile_achievements', JSON.stringify(achievements));
    } catch (e) {
        console.error('Başarımlar kaydedilirken hata:', e);
    }
}

// Mobil görev ekleme
function addMobileTask() {
    const input = document.getElementById('mobile-task-input');
    const prioritySelect = document.getElementById('mobile-priority-select');
    const categorySelect = document.getElementById('mobile-category-select');
    const dueDateInput = document.getElementById('mobile-due-date-input');

    const taskText = input.value.trim();
    const priority = prioritySelect.value;
    const categoryId = categorySelect.value;
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null;

    if (taskText) {
        const category = categories.find(c => c.id === categoryId);

        const mainTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            priority: priority,
            categoryId: categoryId,
            categoryName: category ? category.name : '',
            categoryColor: category ? category.color : '',
            dueDate: dueDate,
            isRecurring: false,
            created: new Date().toISOString(),
            timeSpent: 0,
            comments: []
        };

        // Tekrarlayan görev kontrolü
        if (document.getElementById('mobile-recurring-task').checked) {
            const recurringType = document.getElementById('mobile-recurring-type').value;
            const recurringCount = parseInt(document.getElementById('mobile-recurring-count').value) || 1;
            createRecurringTasks(mainTask, recurringType, recurringCount);
        } else {
            tasks.unshift(mainTask);
        }

        saveTasks();
        renderMobileTasks();
        updateMobileStats();
        updateAchievementProgress();

        // Form temizleme
        input.value = '';
        dueDateInput.value = '';
        document.getElementById('mobile-recurring-task').checked = false;
        toggleMobileRecurringOptions();

        showToast(`✅ Görev eklendi!`);

        // Haptic feedback (mobil cihazlarda)
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    } else {
        showToast('⚠️ Lütfen görev metni girin!');
    }
}

// Tekrarlayan görevleri oluştur
function createRecurringTasks(baseTask, recurringType, count) {
    const baseDate = baseTask.dueDate ? new Date(baseTask.dueDate) : new Date();

    for (let i = 0; i <= count; i++) {
        const recurringTask = { ...baseTask };
        recurringTask.id = `${baseTask.id}_recurring_${i}`;

        // Tarih hesaplaması
        const taskDate = new Date(baseDate);
        switch (recurringType) {
            case 'daily':
                taskDate.setDate(baseDate.getDate() + i);
                break;
            case 'weekly':
                taskDate.setDate(baseDate.getDate() + (i * 7));
                break;
            case 'monthly':
                taskDate.setMonth(baseDate.getMonth() + i);
                break;
        }

        recurringTask.dueDate = taskDate.toISOString();
        recurringTask.recurringType = recurringType;
        recurringTask.recurringCount = i;

        tasks.unshift(recurringTask);
    }
}

// Mobil görevleri göster
function renderMobileTasks() {
    const container = document.getElementById('mobile-tasks-list');
    const filteredTasks = getMobileFilteredTasks();

    container.innerHTML = '';

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="mobile-empty-state">
                <div class="mobile-empty-icon">📋</div>
                <h3>Henüz görev yok</h3>
                <p>Yeni görev eklemek için yukarıyı kullanın!</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `mobile-task-item ${task.completed ? 'completed' : ''}`;

        const priorityClass = `priority-${task.priority || 'medium'}`;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

        taskElement.innerHTML = `
            <div class="mobile-task-content">
                <input type="checkbox" class="mobile-task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleMobileTask('${task.id}')">
                <div class="mobile-task-text">${task.text}</div>
                <div class="mobile-task-meta">
                    <span class="mobile-priority-badge ${priorityClass}">${getPriorityText(task.priority)}</span>
                    ${task.categoryName ? `<span class="mobile-category-badge" style="background: ${task.categoryColor}">${task.categoryName}</span>` : ''}
                    ${task.dueDate ? `<span class="mobile-due-date-badge ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>` : ''}
                </div>
            </div>
            <div class="mobile-task-actions">
                <button class="mobile-task-btn edit-btn" onclick="editMobileTask('${task.id}')" title="Düzenle">✏️</button>
                <button class="mobile-task-btn time-btn" onclick="trackMobileTime('${task.id}')" title="Zaman Takibi">⏱️</button>
                <button class="mobile-task-btn delete-btn" onclick="deleteMobileTask('${task.id}')" title="Sil">🗑️</button>
            </div>
        `;

        container.appendChild(taskElement);
    });
}

// Mobil filtreleme
function getMobileFilteredTasks() {
    let filtered = [...tasks];

    switch (mobileCurrentFilter) {
        case 'completed':
            filtered = tasks.filter(task => task.completed);
            break;
        case 'pending':
            filtered = tasks.filter(task => !task.completed);
            break;
        case 'high':
            filtered = tasks.filter(task => task.priority === 'high');
            break;
        case 'medium':
            filtered = tasks.filter(task => task.priority === 'medium');
            break;
        case 'low':
            filtered = tasks.filter(task => task.priority === 'low');
            break;
        case 'overdue':
            filtered = tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed);
            break;
        default:
            if (mobileCurrentFilter && categories.find(c => c.id === mobileCurrentFilter)) {
                filtered = tasks.filter(task => task.categoryId === mobileCurrentFilter);
            }
            break;
    }

    return filtered;
}

// Mobil filtre ayarla
function setMobileFilter(filter) {
    mobileCurrentFilter = filter;

    document.querySelectorAll('.mobile-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderMobileTasks();
}

// Mobil kategorileri göster
function renderMobileCategories() {
    const container = document.getElementById('mobile-categories-container');
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'mobile-category-item';
        categoryElement.onclick = () => setMobileFilter(category.id);

        categoryElement.innerHTML = `
            <div class="mobile-category-color" style="background: ${category.color};"></div>
            <div class="mobile-category-name">${category.name}</div>
        `;

        container.appendChild(categoryElement);
    });
}

// Mobil başarımları göster
function renderMobileAchievements() {
    const container = document.getElementById('mobile-achievements-container');
    container.innerHTML = '';

    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `mobile-achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;

        const progressPercent = Math.min((achievement.current / achievement.requirement) * 100, 100);

        achievementElement.innerHTML = `
            <div class="mobile-achievement-icon">${achievement.icon}</div>
            <div class="mobile-achievement-name">${achievement.name}</div>
            <div class="mobile-achievement-progress">
                <div class="mobile-achievement-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div class="mobile-achievement-status">
                ${achievement.unlocked ? '✅' : `${achievement.current}/${achievement.requirement}`}
            </div>
        `;

        container.appendChild(achievementElement);
    });
}

// Mobil kategori seçimini güncelle
function updateMobileCategorySelect() {
    const select = document.getElementById('mobile-category-select');
    select.innerHTML = '<option value="">📂 Kategori Seçin</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Mobil istatistikleri güncelle
function updateMobileStats() {
    const totalCount = document.getElementById('mobile-total-count');
    const completedCount = document.getElementById('mobile-completed-count');
    const pendingCount = document.getElementById('mobile-pending-count');

    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
    pendingCount.textContent = tasks.filter(t => !t.completed).length;
}

// Yardımcı fonksiyonlar
function toggleMobileRecurringOptions() {
    const checkbox = document.getElementById('mobile-recurring-task');
    const options = document.getElementById('mobile-recurring-options');

    if (checkbox.checked) {
        options.style.display = 'flex';
    } else {
        options.style.display = 'none';
    }
}

function handleMobileKeyPress(event) {
    if (event.key === 'Enter') {
        addMobileTask();
    }
}

function toggleMobileTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderMobileTasks();
        updateMobileStats();
        updateAchievementProgress();
        showToast(task.completed ? '✅ Görev tamamlandı!' : '⏳ Görev aktif!');

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
}

function deleteMobileTask(taskId) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderMobileTasks();
        updateMobileStats();
        updateAchievementProgress();
        showToast('🗑️ Görev silindi!');

        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}

function editMobileTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newText = prompt('Görev metnini düzenleyin:', task.text);
    if (newText && newText.trim() !== task.text) {
        task.text = newText.trim();
        saveTasks();
        renderMobileTasks();
        showToast('✅ Görev güncellendi!');
    }
}

function trackMobileTime(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.isTracking) {
        const now = Date.now();
        const elapsed = Math.floor((now - task.trackingStart) / 1000 / 60);
        task.timeSpent = (task.timeSpent || 0) + elapsed;
        task.isTracking = false;
        task.trackingStart = null;

        showToast(`⏱️ ${elapsed} dakika kaydedildi!`);
    } else {
        task.isTracking = true;
        task.trackingStart = Date.now();
        saveTasks();
        renderMobileTasks();
        updateMobileStats();
    }
}

function showMobileAddCategoryDialog() {
    const categoryName = prompt('Yeni kategori adını girin:');
    if (categoryName && categoryName.trim()) {
        const colors = [
            '#667eea', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#2196f3',
            '#ff5722', '#795548', '#607d8b', '#3f51b5', '#00bcd4', '#009688',
            '#8bc34a', '#ffc107', '#ff7043', '#f48fb1', '#ce93d8', '#90caf9'
        ];
        const newCategory = {
            id: Date.now().toString(),
            name: categoryName.trim(),
            color: colors[Math.floor(Math.random() * colors.length)]
        };

        categories.push(newCategory);
        saveCategories();
        renderMobileCategories();
        updateMobileCategorySelect();
        showToast(`✅ "${newCategory.name}" kategorisi eklendi!`);
    }
}

// Tema yönetimi
function toggleMobileTheme() {
    const switcher = document.getElementById('mobile-theme-switcher');
    switcher.classList.toggle('show');

    if (switcher.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeMobileThemeOnOutsideClick);
        }, 1);
    } else {
        document.removeEventListener('click', closeMobileThemeOnOutsideClick);
    }
}

function closeMobileThemeOnOutsideClick(event) {
    const switcher = document.getElementById('mobile-theme-switcher');
    const themeBtn = document.querySelector('.mobile-view-toggle-btn[title="Tema"]');

    if (!switcher.contains(event.target) && event.target !== themeBtn) {
        switcher.classList.remove('show');
        document.removeEventListener('click', closeMobileThemeOnOutsideClick);
    }
}

function setMobileTheme(themeName) {
    // Önceki tema class'ını kaldır
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '');

    // Yeni tema class'ını ekle
    if (themeName !== 'original') {
        document.documentElement.classList.add(`theme-${themeName}`);
    }

    // Tema seçici butonlarını güncelle
    document.querySelectorAll('.mobile-theme-option').forEach(option => {
        option.classList.remove('active');
    });

    // Aktif tema butonunu işaretle
    const activeThemeBtn = document.querySelector(`.mobile-theme-${themeName}`);
    if (activeThemeBtn) {
        activeThemeBtn.classList.add('active');
    }

    // Tema değiştiriciyi kapat
    const switcher = document.getElementById('mobile-theme-switcher');
    switcher.classList.remove('show');
    document.removeEventListener('click', closeMobileThemeOnOutsideClick);

    // Temayı kaydet
    localStorage.setItem('todo_pro_mobile_theme', themeName);

    showToast(`🎨 ${getThemeDisplayName(themeName)} teması aktif!`);
}

function getThemeDisplayName(themeName) {
    const themeNames = {
        'original': 'Orijinal',
        'ocean': 'Okyanus',
        'forest': 'Orman',
        'sunset': 'Gün Batımı',
        'rose': 'Gül',
        'purple': 'Mor',
        'midnight': 'Gece Yarısı',
        'cyber': 'Siber'
    };
    return themeNames[themeName] || themeName;
}

// Başarım ilerlemesini güncelle
function updateAchievementProgress() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTime = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);

    // İlk görev
    if (completedTasks >= 1 && !achievements.find(a => a.id === 'first_task').unlocked) {
        achievements.find(a => a.id === 'first_task').unlocked = true;
        achievements.find(a => a.id === 'first_task').current = 1;
    }

    // Görev ustası
    achievements.find(a => a.id === 'task_master').current = completedTasks;
    if (completedTasks >= 25 && !achievements.find(a => a.id === 'task_master').unlocked) {
        achievements.find(a => a.id === 'task_master').unlocked = true;
    }

    // Zaman ustası (saat cinsinden)
    achievements.find(a => a.id === 'time_tracker').current = Math.floor(totalTime / 60);
    if (totalTime >= 300 && !achievements.find(a => a.id === 'time_tracker').unlocked) {
        achievements.find(a => a.id === 'time_tracker').unlocked = true;
    }

    // Kategori kralı
    achievements.find(a => a.id === 'category_king').current = categories.length;
    if (categories.length >= 5 && !achievements.find(a => a.id === 'category_king').unlocked) {
        achievements.find(a => a.id === 'category_king').unlocked = true;
    }

    saveAchievements();
    renderMobileAchievements();
}

// Yardımcı fonksiyonlar
function getPriorityText(priority) {
    const priorities = {
        'high': '🔴 Yüksek',
        'medium': '🟡 Orta',
        'low': '🟢 Düşük'
    };
    return priorities[priority] || '🟡 Orta';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `⏰ ${Math.abs(diffDays)} gün geçti`;
    } else if (diffDays === 0) {
        return 'Bugün';
    } else if (diffDays === 1) {
        return 'Yarın';
    } else {
        return `${diffDays} gün sonra`;
    }
}

// Toast mesajı göster
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Hızlı işlemler menüsü
function showMobileQuickActions() {
    const actions = [
        { icon: '📝', text: 'Yeni Görev', action: 'document.getElementById("mobile-task-input").focus()' },
        { icon: '📂', text: 'Yeni Kategori', action: 'showMobileAddCategoryDialog()' },
        { icon: '📤', text: 'Verileri Dışa Aktar', action: 'exportMobileTasks()' },
        { icon: '📥', text: 'Verileri İçe Aktar', action: 'importMobileTasks()' },
        { icon: '🧹', text: 'Tamamlananları Temizle', action: 'clearCompletedMobileTasks()' },
        { icon: '📊', text: 'Detaylı İstatistikler', action: 'showMobileDetailedStats()' },
        { icon: '⚙️', text: 'Ayarlar', action: 'showMobileSettings()' },
        { icon: '❓', text: 'Yardım', action: 'showMobileHelp()' }
    ];

    let actionsHTML = '<div style="padding: 20px;"><h3 style="color: #667eea; margin-bottom: 20px;">⚡ Hızlı İşlemler</h3><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;">';

    actions.forEach(action => {
        actionsHTML += `
            <button onclick="${action.action}; closeMobileQuickActions()" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 15px 10px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                min-height: 80px;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="font-size: 20px;">${action.icon}</span>
                <span>${action.text}</span>
            </button>
        `;
    });

    actionsHTML += '</div><div style="margin-top: 20px; text-align: center;"><button onclick="closeMobileQuickActions()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Kapat</button></div></div>';

    const modal = document.createElement('div');
    modal.id = 'mobile-quick-actions-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    modal.innerHTML = `<div style="background: white; border-radius: 16px; max-width: 90vw; max-height: 80vh; overflow-y: auto;">${actionsHTML}</div>`;

    document.body.appendChild(modal);
}

function closeMobileQuickActions() {
    const modal = document.getElementById('mobile-quick-actions-modal');
    if (modal) {
        modal.remove();
    }
}

// Veri yönetimi fonksiyonları
function exportMobileTasks() {
    const data = {
        tasks: tasks,
        categories: categories,
        achievements: achievements,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `todo_pro_mobile_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('📤 Veriler dışa aktarıldı!');
    closeMobileQuickActions();
}

function importMobileTasks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);

                    if (data.tasks && Array.isArray(data.tasks)) {
                        tasks = data.tasks;
                        saveTasks();
                    }

                    if (data.categories && Array.isArray(data.categories)) {
                        categories = data.categories;
                        saveCategories();
                    }

                    if (data.achievements && Array.isArray(data.achievements)) {
                        achievements = data.achievements;
                        saveAchievements();
                    }

                    // UI'yi güncelle
                    renderMobileTasks();
                    renderMobileCategories();
                    renderMobileAchievements();
                    updateMobileCategorySelect();
                    updateMobileStats();
                    updateAchievementProgress();

                    showToast('📥 Veriler başarıyla içe aktarıldı!');
                } catch (error) {
                    showToast('❌ Geçersiz dosya formatı!');
                    console.error('İçe aktarma hatası:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
    closeMobileQuickActions();
}

function clearCompletedMobileTasks() {
    if (confirm('Tamamlanan tüm görevleri silmek istediğinizden emin misiniz?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderMobileTasks();
        updateMobileStats();
        updateAchievementProgress();
        showToast('🧹 Tamamlanan görevler temizlendi!');
    }
    closeMobileQuickActions();
}

// Ayarlar ve yardım
function showMobileSettings() {
    const settingsHTML = `
        <div style="padding: 20px;">
            <h3 style="color: #667eea; margin-bottom: 20px;">⚙️ Mobil Ayarlar</h3>
            <div style="display: grid; gap: 15px;">
                <button onclick="exportMobileTasks()" style="background: #4caf50; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600;">📤 Verileri Dışa Aktar</button>
                <button onclick="importMobileTasks()" style="background: #2196f3; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600;">📥 Verileri İçe Aktar</button>
                <button onclick="clearCompletedMobileTasks()" style="background: #ff9800; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600;">🧹 Tamamlananları Temizle</button>
                <button onclick="if(confirm('TÜM VERİLERİ KALICI OLARAK SİLMEK istediğinizden emin misiniz?')) { clearAllMobileData(); }" style="background: #f44336; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600;">💀 Tüm Verileri Sil</button>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="closeMobileSettings()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Kapat</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'mobile-settings-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    modal.innerHTML = `<div style="background: white; border-radius: 16px; max-width: 90vw; max-height: 80vh; overflow-y: auto;">${settingsHTML}</div>`;

    document.body.appendChild(modal);
    closeMobileQuickActions();
}

function closeMobileSettings() {
    const modal = document.getElementById('mobile-settings-modal');
    if (modal) {
        modal.remove();
    }
}

function clearAllMobileData() {
    if (confirm('TÜM VERİLERİ KALICI OLARAK SİLMEK istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        tasks = [];
        categories = [];
        achievements = [];

        localStorage.clear();

        // Temel kategorileri yeniden oluştur
        categories = [
            { id: 'work', name: 'İş', color: '#667eea' },
            { id: 'personal', name: 'Kişisel', color: '#4caf50' },
            { id: 'shopping', name: 'Alışveriş', color: '#ff9800' }
        ];

        // Başarımları yeniden yükle
        loadAchievements();

        saveTasks();
        saveCategories();
        saveAchievements();

        renderMobileTasks();
        renderMobileCategories();
        renderMobileAchievements();
        updateMobileCategorySelect();
        updateMobileStats();

        showToast('🗑️ Tüm veriler temizlendi!');
    }
    closeMobileSettings();
}

function showMobileDetailedStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const totalTime = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !task.completed).length;

    const statsHTML = `
        <div style="padding: 20px;">
            <h3 style="color: #667eea; margin-bottom: 20px; text-align: center;">📊 Detaylı İstatistikler</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">📊</div>
                    <div style="font-size: 18px; font-weight: bold; color: #1976d2;">${tasks.length}</div>
                    <div style="color: #666; font-size: 12px;">Toplam Görev</div>
                </div>
                <div style="background: linear-gradient(135deg, #e8f5e8, #d4edda); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">✅</div>
                    <div style="font-size: 18px; font-weight: bold; color: #388e3c;">${completedTasks}</div>
                    <div style="color: #666; font-size: 12px;">Tamamlanan</div>
                </div>
                <div style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">⏱️</div>
                    <div style="font-size: 18px; font-weight: bold; color: #f57c00;">${Math.floor(totalTime / 60)}sa ${totalTime % 60}dk</div>
                    <div style="color: #666; font-size: 12px;">Toplam Zaman</div>
                </div>
                <div style="background: linear-gradient(135deg, #ffebee, #ffcdd2); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 5px;">⏰</div>
                    <div style="font-size: 18px; font-weight: bold; color: #d32f2f;">${overdueTasks}</div>
                    <div style="color: #666; font-size: 12px;">Geciken</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="closeMobileStats()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Kapat</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'mobile-stats-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    modal.innerHTML = `<div style="background: white; border-radius: 16px; max-width: 90vw; max-height: 80vh; overflow-y: auto;">${statsHTML}</div>`;

    document.body.appendChild(modal);
    closeMobileQuickActions();
}

function closeMobileStats() {
    const modal = document.getElementById('mobile-stats-modal');
    if (modal) {
        modal.remove();
    }
}

function showMobileHelp() {
    const helpHTML = `
        <div style="padding: 20px;">
            <h3 style="color: #667eea; margin-bottom: 20px;">📚 Mobil Kullanım Kılavuzu</h3>
            <div style="margin-bottom: 20px;">
                <h4>🎯 Temel Kullanım</h4>
                <p>Üst kısımda görev ekleyin, orta kısımda görevlerinizi görün, alt kısımda hızlı erişim araçları bulun.</p>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>📱 Mobil Özellikler</h4>
                <ul style="line-height: 1.6;">
                    <li>• Dokunmatik optimizasyon</li>
                    <li>• Kolay navigasyon</li>
                    <li>• Hızlı işlemler menüsü</li>
                    <li>• Tema değiştirici</li>
                    <li>• AI asistan</li>
                    <li>• Başarım sistemi</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="closeMobileHelp()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Anladım</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'mobile-help-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    modal.innerHTML = `<div style="background: white; border-radius: 16px; max-width: 90vw; max-height: 80vh; overflow-y: auto;">${helpHTML}</div>`;

    document.body.appendChild(modal);
    closeMobileQuickActions();
}

function closeMobileHelp() {
    const modal = document.getElementById('mobile-help-modal');
    if (modal) {
        modal.remove();
    }
}

// AI Asistan fonksiyonları
function toggleMobileAI() {
    const chat = document.getElementById('mobile-ai-chat');
    const toggleBtn = document.getElementById('mobile-ai-toggle-btn');

    if (chat.classList.contains('show')) {
        chat.classList.remove('show');
        toggleBtn.classList.remove('active');
    } else {
        chat.classList.add('show');
        toggleBtn.classList.add('active');
    }
}

function sendMobileAIMessage() {
    const input = document.getElementById('mobile-ai-input');
    const message = input.value.trim();

    if (message) {
        addMobileAIMessage(message, 'user');
        input.value = '';

        setTimeout(() => {
            const response = generateMobileAIResponse(message);
            addMobileAIMessage(response, 'ai');
        }, 1000 + Math.random() * 1000);
    }
}

function handleMobileAIKeyPress(event) {
    if (event.key === 'Enter') {
        sendMobileAIMessage();
    }
}

function addMobileAIMessage(text, type) {
    const messages = document.getElementById('mobile-ai-chat-messages');
    if (!messages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `mobile-ai-message ${type}`;

    const now = new Date();
    const time = now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `
        <div class="mobile-ai-message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
        <div class="mobile-ai-message-content">
            <div class="mobile-ai-message-text">${text}</div>
            <div class="mobile-ai-message-time">${time}</div>
        </div>
    `;

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;

    // Konuşma geçmişini kaydet
    aiConversationHistory.push({ text, type, time });
    localStorage.setItem('todo_pro_mobile_ai_history', JSON.stringify(aiConversationHistory));
}

function generateMobileAIResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
        return 'Merhaba! 📱 Mobil To-Do PRO asistanınızım. Görev yönetimi, kategoriler, zaman takibi ve diğer özellikler hakkında sorularınızı yanıtlayabilirim.';
    }

    if (lowerMessage.includes('görev') && (lowerMessage.includes('ekle') || lowerMessage.includes('yeni'))) {
        return '📝 Yeni görev eklemek için: Üst kısımdaki input alanına görev metnini yazın, öncelik seviyesini seçin, kategori belirleyin, bitiş tarihi ekleyin ve "EKLE" butonuna basın!';
    }

    if (lowerMessage.includes('zaman') || lowerMessage.includes('takip')) {
        return '⏱️ Zaman takibi için: Göreve ⏱️ butonuna tıklayarak zaman takibi başlatın. Yeşil animasyon aktif olduğunu gösterir. Tekrar tıklayarak zamanı kaydedin.';
    }

    if (lowerMessage.includes('kategori')) {
        return '📂 Kategoriler görevlerinizi organize etmenizi sağlar. Kategori bölümünden yeni kategori ekleyebilir, kategoriye tıklayarak filtreleyebilirsiniz.';
    }

    if (lowerMessage.includes('başarım')) {
        return '🏆 Başarımlarınızı görüntülemek için başarımlar bölümüne bakın. Görev tamamladıkça yeni başarımlar açılır!';
    }

    if (lowerMessage.includes('tema')) {
        return '🎨 Tema değiştirmek için üst kısımdaki 🎨 butonuna tıklayın. 8 farklı tema seçeneği mevcut - hepsi mobil için optimize edilmiş!';
    }

    if (lowerMessage.includes('mobil') || lowerMessage.includes('telefon')) {
        return '📱 Bu uygulama tamamen mobil cihazlar için optimize edilmiştir. Dokunmatik dostu arayüz, hızlı işlemler ve mobil-first tasarım ile mükemmel bir deneyim sunar.';
    }

    return `🤖 "${message}" hakkında yardımcı olmaya çalışayım. Mobil To-Do PRO ile ilgili sorularınızı sorun!`;
}

// Giriş sistemi
function showMobileLogin() {
    const loginHTML = `
        <div style="padding: 30px; max-width: 350px; margin: 0 auto;">
            <h3 style="color: #667eea; margin-bottom: 25px; text-align: center;">🔐 Giriş Yap</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button onclick="showMobileLoginForm()" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">Giriş Yap</button>
                <button onclick="showMobileRegisterForm()" style="flex: 1; background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">Kaydol</button>
            </div>
            <div id="mobile-auth-form-container">
                <div id="mobile-login-form" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 500;">İsim</label>
                        <input type="text" id="mobile-login-name" placeholder="İsminizi girin" style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 500;">Şifre</label>
                        <input type="password" id="mobile-login-password" placeholder="Şifrenizi girin" style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <button onclick="mobileLogin()" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Giriş Yap</button>
                </div>
                <div id="mobile-register-form" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 500;">İsim</label>
                        <input type="text" id="mobile-register-name" placeholder="İsminizi girin" style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-primary); font-weight: 500;">Şifre</label>
                        <input type="password" id="mobile-register-password" placeholder="Şifre oluşturun" style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <button onclick="mobileRegister()" style="width: 100%; background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Kaydol</button>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="closeMobileLogin()" style="background: none; border: none; color: #666; cursor: pointer; text-decoration: underline;">İptal</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'mobile-login-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    modal.innerHTML = `<div style="background: white; border-radius: 16px; width: 90vw; max-width: 400px;">${loginHTML}</div>`;

    document.body.appendChild(modal);
}

function showMobileLoginForm() {
    document.getElementById('mobile-login-form').style.display = 'block';
    document.getElementById('mobile-register-form').style.display = 'none';
}

function showMobileRegisterForm() {
    document.getElementById('mobile-register-form').style.display = 'block';
    document.getElementById('mobile-login-form').style.display = 'none';
}

function mobileLogin() {
    const name = document.getElementById('mobile-login-name').value.trim();
    const password = document.getElementById('mobile-login-password').value.trim();

    if (!name || !password) {
        showToast('⚠️ Lütfen isim ve şifre girin!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('todo_pro_mobile_users') || '[]');
    const user = users.find(u => u.name === name && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('todo_pro_mobile_current_user', JSON.stringify(user));
        updateMobileUserUI();
        showToast(`✅ Hoş geldiniz, ${user.name}!`);
        closeMobileLogin();
    } else {
        showToast('❌ İsim veya şifre yanlış!');
    }
}

function mobileRegister() {
    const name = document.getElementById('mobile-register-name').value.trim();
    const password = document.getElementById('mobile-register-password').value.trim();

    if (!name || !password) {
        showToast('⚠️ Lütfen isim ve şifre girin!');
        return;
    }

    if (password.length < 4) {
        showToast('⚠️ Şifre en az 4 karakter olmalı!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('todo_pro_mobile_users') || '[]');
    const existingUser = users.find(u => u.name === name);

    if (existingUser) {
        showToast('❌ Bu isim zaten kullanılıyor!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name: name,
        password: password,
        created: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('todo_pro_mobile_users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('todo_pro_mobile_current_user', JSON.stringify(newUser));

    updateMobileUserUI();
    showToast(`✅ Kayıt başarılı! Hoş geldiniz, ${newUser.name}!`);
    closeMobileLogin();
}

function closeMobileLogin() {
    const modal = document.getElementById('mobile-login-modal');
    if (modal) {
        modal.remove();
    }
}

function updateMobileUserUI() {
    const loginBtn = document.getElementById('mobile-login-btn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.innerHTML = `👤 ${currentUser.name}`;
        } else {
            loginBtn.innerHTML = '🔐';
        }
    }
}

function loadMobileUserData() {
    const savedUser = localStorage.getItem('todo_pro_mobile_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    // AI konuşma geçmişini yükle
    const savedHistory = localStorage.getItem('todo_pro_mobile_ai_history');
    if (savedHistory) {
        aiConversationHistory = JSON.parse(savedHistory);
        // Son 10 mesajı göster
        aiConversationHistory.slice(-10).forEach(msg => {
            addMobileAIMessage(msg.text, msg.type);
        });
    }
}

// Uygulama başlatma
function initMobileApp() {
    console.log('🚀 Mobile To-Do PRO başlatılıyor...');

    // Verileri yükle
    loadTasks();
    loadCategories();
    loadAchievements();
    loadMobileUserData();

    // UI'yi başlat
    renderMobileTasks();
    renderMobileCategories();
    renderMobileAchievements();
    updateMobileCategorySelect();
    updateMobileStats();
    updateMobileUserUI();

    // Kayıtlı temayı yükle
    const savedTheme = localStorage.getItem('todo_pro_mobile_theme');
    if (savedTheme) {
        setMobileTheme(savedTheme);
    }

    // Mobil optimizasyonlar
    if ('ontouchstart' in window) {
        document.addEventListener('touchstart', function() {}, { passive: true });
    }

    // Welcome mesajı
    setTimeout(() => {
        showToast('📱 Mobile To-Do PRO\'ya hoş geldiniz!');
    }, 1000);

    console.log('✅ Mobile To-Do PRO başarıyla yüklendi!');
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', initMobileApp);
