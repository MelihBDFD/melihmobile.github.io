const defaultState = {
    tasks: [],
    archive: [],
    categories: ["Genel"],
    settings: {
        theme: "light",
        notifications: false,
        defaultSort: "createdAtNewest",
        defaultView: "list",
        reminderLead: 30
    },
    filters: {
        search: "",
        category: "all",
        priority: "all",
        startDate: "",
        endDate: ""
    },
    sort: "createdAtNewest",
    view: "list",
    selection: new Set(),
    formMode: "create",
    editingId: null,
    subtasksBuffer: [],
    checklistBuffer: [],
    auth: {
        isAuthenticated: false,
        currentUser: null,
        users: {} 
    }
};

let state = { ...defaultState };

function loadState() {
    const data = localStorage.getItem("mobil-todo-data");
    if (data) {
        const parsed = JSON.parse(data);
        state.tasks = parsed.tasks || [];
        state.archive = parsed.archive || [];
        state.categories = parsed.categories || ["Genel"];
        state.settings = { ...defaultState.settings, ...parsed.settings };
        state.auth = { ...defaultState.auth, ...parsed.auth };
    }
}

function saveState() {
    localStorage.setItem("mobil-todo-data", JSON.stringify({
        tasks: state.tasks,
        archive: state.archive,
        categories: state.categories,
        settings: state.settings,
        auth: state.auth
    }));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
}

function populateCategories() {
    const selects = [dom.categorySelect, dom.filterCategory];
    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '';
        state.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    });

    if (dom.categoryManager) {
        dom.categoryManager.innerHTML = '';
        state.categories.forEach(cat => {
            if (cat === 'Genel') return;
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = cat;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => {
                state.categories = state.categories.filter(c => c !== cat);
                state.tasks.forEach(task => {
                    if (task.category === cat) task.category = 'Genel';
                });
                saveState();
                populateCategories();
                render();
            };
            tag.appendChild(removeBtn);
            dom.categoryManager.appendChild(tag);
        });
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(dom.form);
    const taskData = {
        title: dom.title.value.trim(),
        description: dom.description.value.trim(),
        category: dom.categorySelect.value,
        priority: dom.prioritySelect.value,
        dueDate: dom.dueDate.value || null,
        subtasks: state.subtasksBuffer.map(text => ({ text, completed: false })),
        checklist: state.checklistBuffer.map(item => ({ id: item.id, text: item.text, completed: item.completed }))
    };

    if (!taskData.title) return;

    if (state.formMode === "edit") {
        const task = state.tasks.find(t => t.id === state.editingId);
        if (task) {
            Object.assign(task, taskData);
            task.updatedAt = Date.now();
            saveState();
        }
    } else {
        const task = {
            id: generateId(),
            ...taskData,
            completedAt: null,
            createdAt: Date.now()
        };
        state.tasks.push(task);
        saveState();
    }

    resetForm();
    render();
}

function resetForm() {
    dom.form.reset();
    state.formMode = "create";
    state.editingId = null;
    state.subtasksBuffer = [];
    state.checklistBuffer = [];
    syncSubtasksBuffer();
    syncChecklistBuffer();
    dom.saveTask.textContent = "Görevi Kaydet";
}

function handleSubtaskInput() {
    const text = dom.subtaskInput.value.trim();
    if (text) {
        state.subtasksBuffer.push(text);
        syncSubtasksBuffer();
        dom.subtaskInput.value = '';
        dom.subtaskInput.focus();
    }
}

function handleChecklistInput() {
    const text = dom.checklistInput.value.trim();
    if (text) {
        state.checklistBuffer.push({
            id: generateId(),
            text: text,
            completed: false
        });
        syncChecklistBuffer();
        dom.checklistInput.value = '';
        dom.checklistInput.focus();
    }
}

function syncSubtasksBuffer() {
    dom.subtaskList.innerHTML = '';
    state.subtasksBuffer.forEach((text, index) => {
        addSubtaskToForm(text, index);
    });
}

function syncChecklistBuffer() {
    dom.checklistContainer.innerHTML = '';
    state.checklistBuffer.forEach((item, index) => {
        addChecklistItemToForm(item.text, item.completed, item.id);
    });
}

function addSubtaskToForm(text, index) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
        state.subtasksBuffer.splice(index, 1);
        syncSubtasksBuffer();
    };
    tag.appendChild(removeBtn);
    dom.subtaskList.appendChild(tag);
}

function addChecklistItemToForm(text, completed = false, id) {
    const item = document.createElement('div');
    item.className = 'checklist-item';
    item.dataset.id = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.onchange = () => {
        const bufferItem = state.checklistBuffer.find(item => item.id === id);
        if (bufferItem) {
            bufferItem.completed = checkbox.checked;
        }
    };

    const span = document.createElement('span');
    span.textContent = text;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
        state.checklistBuffer = state.checklistBuffer.filter(item => item.id !== id);
        syncChecklistBuffer();
    };

    item.appendChild(checkbox);
    item.appendChild(span);
    item.appendChild(removeBtn);
    dom.checklistContainer.appendChild(item);
}

function getFilteredTasks(tasks) {
    return tasks.filter(task => {
        if (state.filters.search) {
            const searchTerm = state.filters.search.toLowerCase();
            const matches = task.title.toLowerCase().includes(searchTerm) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm));
            if (!matches) return false;
        }

        if (state.filters.category !== 'all' && task.category !== state.filters.category) {
            return false;
        }

        if (state.filters.priority !== 'all' && task.priority !== state.filters.priority) {
            return false;
        }

        if (state.filters.startDate) {
            const startDate = new Date(state.filters.startDate);
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            if (!taskDate || taskDate < startDate) return false;
        }

        if (state.filters.endDate) {
            const endDate = new Date(state.filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            if (!taskDate || taskDate > endDate) return false;
        }

        return true;
    });
}

function sortTasks(tasks) {
    return tasks.sort((a, b) => {
        switch (state.sort) {
            case 'createdAtOldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'priority':
                const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
                return priorities[b.priority] - priorities[a.priority];
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
}

function createTaskElement(task, isArchive = false) {
    const element = dom.template.content.cloneNode(true).firstElementChild;
    element.dataset.id = task.id;
    element.draggable = !isArchive;

    // Görünürlük garantisi
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.display = 'flex';

    const title = element.querySelector('.task-title');
    const meta = element.querySelector('.task-meta');
    const description = element.querySelector('.task-description');
    const checklist = element.querySelector('.task-checklist');
    const subtasks = element.querySelector('.task-subtasks');
    const completeBtn = element.querySelector('.complete-btn');
    const archiveBtn = element.querySelector('.archive-btn');
    const editBtn = element.querySelector('.edit-btn');
    const deleteBtn = element.querySelector('.delete-btn');
    const selectCheckbox = element.querySelector('.task-select');

    title.textContent = task.title;

    const metaParts = [task.category, `Öncelik: ${task.priority}`];
    if (task.dueDate) {
        metaParts.push(`Son: ${formatDate(task.dueDate)}`);
    }
    meta.textContent = metaParts.join(' • ');

    if (task.description) {
        description.textContent = task.description;
        description.style.display = 'block';
    } else {
        description.style.display = 'none';
    }

    if (task.checklist && task.checklist.length > 0) {
        checklist.innerHTML = '';
        task.checklist.forEach(item => {
            const checkItem = document.createElement('div');
            checkItem.className = 'checklist-item';
            checkItem.innerHTML = `${item.completed ? '☑' : '☐'} ${item.text}`;
            checklist.appendChild(checkItem);
        });
        checklist.style.display = 'block';
    } else {
        checklist.style.display = 'none';
    }

    if (task.subtasks && task.subtasks.length > 0) {
        subtasks.innerHTML = '';
        task.subtasks.forEach(sub => {
            const subItem = document.createElement('div');
            subItem.className = 'subtask-item';
            subItem.textContent = `• ${sub.text}`;
            subtasks.appendChild(subItem);
        });
        subtasks.style.display = 'block';
    } else {
        subtasks.style.display = 'none';
    }

    if (task.completedAt) {
        element.classList.add('completed');
    }

    if (task.dueDate && !task.completedAt && new Date(task.dueDate) < new Date()) {
        element.classList.add('overdue');
    }

    // Archive'deki görevler için farklı davranış
    if (isArchive) {
        completeBtn.style.display = 'none';
        archiveBtn.style.display = 'none';
        editBtn.style.display = 'none';
        selectCheckbox.style.display = 'none';
        deleteBtn.onclick = () => {
            if (confirm('Bu görevi kalıcı olarak silmek istediğinizden emin misiniz?')) {
                deleteTaskFromArchive(task.id);
            }
        };
    } else {
        if (task.completedAt) {
            completeBtn.textContent = '↩️ Geri Al';
        } else {
            completeBtn.textContent = '✅ Tamamlandı';
        }
        completeBtn.onclick = () => toggleComplete(task.id);
        archiveBtn.onclick = () => archiveTask(task.id);
        editBtn.textContent = '✏️';
        editBtn.onclick = () => editTask(task.id);
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => {
            if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                deleteTask(task.id);
            }
        };

        selectCheckbox.checked = state.selection.has(task.id);
        selectCheckbox.onchange = () => {
            if (selectCheckbox.checked) {
                state.selection.add(task.id);
            } else {
                state.selection.delete(task.id);
            }
            render();
        };
    }

    return element;
}

const dom = {
    body: document.body,
    loginScreen: document.getElementById("loginScreen"),
    appContent: document.getElementById("appContent"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    usernameInput: document.getElementById("usernameInput"),
    passwordInput: document.getElementById("passwordInput"),
    registerUsernameInput: document.getElementById("registerUsernameInput"),
    registerPasswordInput: document.getElementById("registerPasswordInput"),
    userInfo: document.getElementById("userInfo"),
    currentUserName: document.getElementById("currentUserName"),
    userStats: document.getElementById("userStats"),
    userTaskCount: document.getElementById("userTaskCount"),
    form: document.getElementById("taskForm"),
    title: document.getElementById("taskTitle"),
    description: document.getElementById("taskDescription"),
    categorySelect: document.getElementById("taskCategory"),
    prioritySelect: document.getElementById("taskPriority"),
    dueDate: document.getElementById("taskDueDate"),
    subtaskList: document.getElementById("subtaskList"),
    subtaskInput: document.getElementById("subtaskInput"),
    addSubtask: document.getElementById("addSubtask"),
    checklistContainer: document.getElementById("checklistItems"),
    checklistInput: document.getElementById("checklistInput"),
    addChecklist: document.getElementById("addChecklist"),
    saveTask: document.getElementById("saveTask"),
    addCategoryBtn: document.getElementById("addCategory"),
    searchInput: document.getElementById("searchInput"),
    filterCategory: document.getElementById("filterCategory"),
    filterPriority: document.getElementById("filterPriority"),
    filterStartDate: document.getElementById("filterStartDate"),
    filterEndDate: document.getElementById("filterEndDate"),
    sortSelect: document.getElementById("sortSelect"),
    listViewBtn: document.getElementById("listViewBtn"),
    cardViewBtn: document.getElementById("cardViewBtn"),
    resetFilters: document.getElementById("resetFilters"),
    taskContainer: document.getElementById("taskContainer"),
    archiveContainer: document.getElementById("archiveContainer"),
    template: document.getElementById("taskTemplate"),
    selectAll: document.getElementById("selectAll"),
    clearSelection: document.getElementById("clearSelection"),
    bulkComplete: document.getElementById("bulkComplete"),
    bulkDelete: document.getElementById("bulkDelete"),
    bulkArchive: document.getElementById("bulkArchive"),
    statTotal: document.getElementById("statTotal"),
    statCompleted: document.getElementById("statCompleted"),
    statActive: document.getElementById("statActive"),
    statOverdue: document.getElementById("statOverdue"),
    categoryChart: document.getElementById("categoryChart"),
    dailySummary: document.getElementById("dailySummary"),
    archivePanel: document.getElementById("archivePanel"),
    clearArchive: document.getElementById("clearArchive"),
    themeToggle: document.getElementById("themeToggle"),
    notificationToggle: document.getElementById("notificationToggle"),
    exportData: document.getElementById("exportData"),
    importData: document.getElementById("importData"),
    settingsForm: document.getElementById("settingsForm"),
    defaultSort: document.getElementById("defaultSort"),
    defaultView: document.getElementById("defaultView"),
    reminderLead: document.getElementById("reminderLead"),
    categoryManager: document.getElementById("categoryManager"),
    newCategoryInput: document.getElementById("newCategoryInput"),
    addCategoryFromSettings: document.getElementById("addCategoryFromSettings"),
    categoryModal: document.getElementById("categoryModal"),
    newCategoryModalInput: document.getElementById("newCategoryModalInput"),
    cancelCategory: document.getElementById("cancelCategory"),
    saveCategory: document.getElementById("saveCategory")
};

function renderTaskList(container, tasks, isArchive = false) {
    container.innerHTML = "";
    container.style.display = 'grid';
    container.style.gap = '14px';

    if (!tasks.length) {
        container.classList.add("empty");
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        return;
    }
    container.classList.remove("empty");
    container.style.display = 'grid';

    tasks.forEach((task, index) => {
        const element = createTaskElement(task, isArchive);
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.display = 'flex';
        container.appendChild(element);
    });
}

function render() {
    const filtered = getFilteredTasks(state.tasks);
    const sorted = sortTasks(filtered);
    renderTaskList(dom.taskContainer, sorted);
    const archiveFiltered = getFilteredTasks(state.archive);
    const archiveSorted = sortTasks(archiveFiltered);
    renderTaskList(dom.archiveContainer, archiveSorted, true);
    updateAnalytics();
    updateUserInfo();
}

function updateUserInfo() {
    if (state.auth.currentUser) {
        dom.userInfo.style.display = 'inline-flex';
        dom.currentUserName.textContent = state.auth.currentUser;

        // Kullanıcının görev sayısını göster
        const userTaskCount = state.tasks.length;
        dom.userTaskCount.textContent = userTaskCount;
    } else {
        dom.userInfo.style.display = 'none';
    }
}

function renderCategoryChart() {
    const chart = dom.categoryChart;
    chart.innerHTML = "";
    const categories = {};
    state.tasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
    });
    if (!Object.keys(categories).length) {
        chart.textContent = "Kategori verisi yok";
        return;
    }
    const list = document.createElement("ul");
    Object.entries(categories).forEach(([cat, count]) => {
        const li = document.createElement("li");
        li.textContent = `${cat}: ${count}`;
        list.appendChild(li);
    });
    chart.appendChild(list);
}

function renderDailySummary() {
    const timeline = dom.dailySummary;
    timeline.innerHTML = "";
    const days = {};
    state.tasks.forEach(task => {
        const date = task.completedAt ? new Date(task.completedAt).toDateString() : new Date().toDateString();
        days[date] = (days[date] || 0) + 1;
    });
    if (!Object.keys(days).length) {
        timeline.textContent = "Günlük özet verisi yok";
        return;
    }
    const list = document.createElement("ul");
    Object.entries(days).sort().forEach(([date, count]) => {
        const li = document.createElement("li");
        li.textContent = `${date}: ${count} görev`;
        list.appendChild(li);
    });
    timeline.appendChild(list);
}

function toggleComplete(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    task.completedAt = task.completedAt ? null : Date.now();
    saveState();
    render();
}

function archiveTask(id) {
    const index = state.tasks.findIndex(t => t.id === id);
    if (index === -1) return;
    const task = state.tasks.splice(index, 1)[0];
    state.archive.push(task);
    saveState();
    render();
}

function deleteTask(id) {
    const index = state.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        state.tasks.splice(index, 1);
        state.selection.delete(id);
        saveState();
        render();
    }
}

function deleteTaskFromArchive(id) {
    const index = state.archive.findIndex(t => t.id === id);
    if (index !== -1) {
        state.archive.splice(index, 1);
        saveState();
        render();
    }
}

function editTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    state.formMode = "edit";
    state.editingId = id;
    dom.title.value = task.title;
    dom.description.value = task.description;
    dom.categorySelect.value = task.category;
    dom.prioritySelect.value = task.priority;
    dom.dueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "";
    state.subtasksBuffer = task.subtasks.map(s => s.text);
    state.checklistBuffer = task.checklist.map(c => ({ id: c.id, text: c.text, completed: c.completed }));
    syncSubtasksBuffer();
    syncChecklistBuffer();
    dom.subtaskList.innerHTML = "";
    task.subtasks.forEach(sub => addSubtaskToForm(sub.text));
    dom.checklistContainer.innerHTML = "";
    task.checklist.forEach(check => {
        const item = document.createElement("div");
        item.className = "checklist-item";
        item.dataset.id = check.id;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = check.completed;
        checkbox.addEventListener("change", syncChecklistBuffer);
        const span = document.createElement("span");
        span.textContent = check.text;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "×";
        button.addEventListener("click", () => {
            item.remove();
            syncChecklistBuffer();
        });
        item.appendChild(checkbox);
        item.appendChild(span);
        item.appendChild(button);
        dom.checklistContainer.appendChild(item);
    });
    dom.saveTask.textContent = "Güncelle";
    dom.taskFormPanel.scrollIntoView({ behavior: "smooth" });
}

function handleSearch() {
    state.filters.search = dom.searchInput.value;
    render();
}

function handleFilterChange() {
    state.filters.category = dom.filterCategory.value;
    state.filters.priority = dom.filterPriority.value;
    state.filters.startDate = dom.filterStartDate.value;
    state.filters.endDate = dom.filterEndDate.value;
    render();
}

function handleSortChange() {
    state.sort = dom.sortSelect.value;
    render();
}

function handleViewChange(view) {
    state.view = view;
    dom.taskContainer.dataset.view = view;
    dom.archiveContainer.dataset.view = view;
    dom.listViewBtn.classList.toggle("active", view === "list");
    dom.cardViewBtn.classList.toggle("active", view === "card");
    render();
}

function resetFilters() {
    state.filters.search = "";
    state.filters.category = "all";
    state.filters.priority = "all";
    state.filters.startDate = "";
    state.filters.endDate = "";
    state.sort = state.settings.defaultSort;
    state.view = state.settings.defaultView;
    dom.searchInput.value = "";
    dom.filterCategory.value = "all";
    dom.filterPriority.value = "all";
    dom.filterStartDate.value = "";
    dom.filterEndDate.value = "";
    dom.sortSelect.value = state.sort;
    dom.listViewBtn.classList.toggle("active", state.view === "list");
    dom.cardViewBtn.classList.toggle("active", state.view === "card");
    dom.taskContainer.dataset.view = state.view;
    dom.archiveContainer.dataset.view = state.view;
    render();
}

function handleBulkAction(action) {
    const selected = Array.from(state.selection);
    if (!selected.length) return;
    switch (action) {
        case "complete":
            selected.forEach(id => {
                const task = state.tasks.find(t => t.id === id);
                if (task && !task.completedAt) task.completedAt = Date.now();
            });
            break;
        case "delete":
            state.tasks = state.tasks.filter(t => !selected.includes(t.id));
            break;
        case "archive":
            selected.forEach(id => {
                const index = state.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    const task = state.tasks.splice(index, 1)[0];
                    state.archive.push(task);
                }
            });
            break;
    }
    state.selection.clear();
    saveState();
    render();
}

function handleSelectAll() {
    if (state.selection.size === state.tasks.length) {
        state.selection.clear();
    } else {
        state.tasks.forEach(task => state.selection.add(task.id));
    }
    render();
}

function handleClearArchive() {
    state.archive = [];
    saveState();
    render();
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    state.settings.defaultSort = dom.defaultSort.value;
    state.settings.defaultView = dom.defaultView.value;
    state.settings.reminderLead = parseInt(dom.reminderLead.value, 10) || 30;
    saveState();
    state.sort = state.settings.defaultSort;
    state.view = state.settings.defaultView;
    resetFilters();
}

function toggleTheme() {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    applyTheme();
    saveState();
}

function toggleNotifications() {
    state.settings.notifications = !state.settings.notifications;
    if (state.settings.notifications) {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    alert("Bildirim izni verilmedi.");
                    state.settings.notifications = false;
                    saveState();
                }
            });
        } else {
            alert("Bu tarayıcı bildirimleri desteklemiyor.");
            state.settings.notifications = false;
            saveState();
        }
    }
    saveState();
}

function exportData() {
    const data = {
        tasks: state.tasks,
        archive: state.archive,
        categories: state.categories,
        settings: state.settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mobil-yapılacaklar-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tasks) state.tasks = data.tasks;
            if (data.archive) state.archive = data.archive;
            if (data.categories) state.categories = data.categories;
            if (data.settings) state.settings = { ...defaultState.settings, ...data.settings };
            saveState();
            applyTheme();
            populateCategories();
            render();
        } catch (error) {
            alert("Dosya geçersiz.");
        }
    };
    reader.readAsText(file);
}

function checkReminders() {
    if (!state.settings.notifications || Notification.permission !== "granted") return;
    state.tasks.forEach(task => {
        if (!task.dueDate || task.completedAt) return;
        const due = new Date(task.dueDate);
        const now = new Date();
        const diff = due - now;
        if (diff > 0 && diff <= state.settings.reminderLead * 60000) {
            new Notification(`Görev hatırlatıcısı: ${task.title}`, {
                body: `Son tarih: ${formatDate(task.dueDate)}`,
                icon: "/favicon.ico"
            });
        }
    });
}

function setupDragAndDrop() {
    let draggedId = null;
    dom.taskContainer.addEventListener("dragstart", event => {
        draggedId = event.target.dataset.id;
        event.dataTransfer.effectAllowed = "move";
    });
    dom.taskContainer.addEventListener("dragover", event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    });
    dom.taskContainer.addEventListener("drop", event => {
        event.preventDefault();
        if (!draggedId) return;
        const targetId = event.target.closest(".task")?.dataset.id;
        if (!targetId || draggedId === targetId) return;
        const draggedIndex = state.tasks.findIndex(t => t.id === draggedId);
        const targetIndex = state.tasks.findIndex(t => t.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const [dragged] = state.tasks.splice(draggedIndex, 1);
        state.tasks.splice(targetIndex, 0, dragged);
        saveState();
        render();
    });
}

function handleAddCategory() {
    dom.categoryModal.classList.add("show");
    dom.newCategoryModalInput.focus();
}

function saveNewCategory() {
    const name = dom.newCategoryModalInput.value.trim();
    if (!name) return;
    if (!state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        populateCategories();
        dom.categorySelect.value = name;
    }
    dom.categoryModal.classList.remove("show");
    dom.newCategoryModalInput.value = "";
}

function cancelNewCategory() {
    dom.categoryModal.classList.remove("show");
    dom.newCategoryModalInput.value = "";
}

function handleAddCategoryFromSettings() {
    const name = dom.newCategoryInput.value.trim();
    if (!name) return;
    if (!state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        populateCategories();
        dom.newCategoryInput.value = "";
    }
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function registerUser(username, password) {
    const hashedPassword = hashPassword(password);
    state.auth.users[username] = {
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };
    state.auth.currentUser = username;
    state.auth.isAuthenticated = true;
    saveState();
    hideLoginScreen();
    initApp();
}

function loginUser(username, password) {
    const user = state.auth.users[username];
    if (user && user.password === hashPassword(password)) {
        state.auth.currentUser = username;
        state.auth.isAuthenticated = true;
        saveState();
        hideLoginScreen();
        initApp();
        return true;
    }
    return false;
}

function handleLogin(event) {
    event.preventDefault();
    const username = dom.usernameInput.value.trim();
    const password = dom.passwordInput.value;
    if (loginUser(username, password)) {
        dom.usernameInput.value = "";
        dom.passwordInput.value = "";
    } else {
        alert("❌ Geçersiz kullanıcı adı veya şifre!\nLütfen tekrar deneyin.");
        dom.passwordInput.value = "";
        dom.passwordInput.focus();
    }
}

function handleRegister(event) {
    event.preventDefault();
    const username = dom.registerUsernameInput.value.trim();
    const password = dom.registerPasswordInput.value;

    if (username.length < 3) {
        alert("❌ Kullanıcı adı en az 3 karakter olmalıdır!");
        dom.registerUsernameInput.focus();
        return;
    }

    if (password.length < 4) {
        alert("❌ Şifre en az 4 karakter olmalıdır!");
        dom.registerPasswordInput.focus();
        return;
    }

    if (state.auth.users[username]) {
        alert("❌ Bu kullanıcı adı zaten kullanılıyor!");
        dom.registerUsernameInput.focus();
        return;
    }

    registerUser(username, password);
    dom.registerUsernameInput.value = "";
    dom.registerPasswordInput.value = "";
}

function showLoginScreen() {
    if (!dom.loginScreen) {
        setTimeout(showLoginScreen, 100);
        return;
    }
    dom.loginScreen.style.display = 'flex';
    dom.loginForm.style.display = 'block';
    dom.registerForm.style.display = 'none';
    dom.appContent.style.display = 'none';
}

function hideLoginScreen() {
    if (!dom.loginScreen) {
        setTimeout(hideLoginScreen, 100);
        return;
    }
    dom.loginScreen.style.display = 'none';
    dom.appContent.style.display = 'block';
}

function initApp() {
    applyTheme();
    populateCategories();
    resetFilters();
    updateUserInfo();
    render();

    // Event listener'ları ekle
    dom.form.addEventListener("submit", handleFormSubmit);
    dom.addSubtask.addEventListener("click", handleSubtaskInput);
    dom.subtaskInput.addEventListener("keypress", event => {
        if (event.key === "Enter") handleSubtaskInput();
    });
    dom.addChecklist.addEventListener("click", handleChecklistInput);
    dom.checklistInput.addEventListener("keypress", event => {
        if (event.key === "Enter") handleChecklistInput();
    });
    dom.searchInput.addEventListener("input", handleSearch);
    dom.filterCategory.addEventListener("change", handleFilterChange);
    dom.filterPriority.addEventListener("change", handleFilterChange);
    dom.filterStartDate.addEventListener("change", handleFilterChange);
    dom.filterEndDate.addEventListener("change", handleFilterChange);
    dom.sortSelect.addEventListener("change", handleSortChange);
    dom.listViewBtn.addEventListener("click", () => handleViewChange("list"));
    dom.cardViewBtn.addEventListener("click", () => handleViewChange("card"));
    dom.resetFilters.addEventListener("click", resetFilters);
    dom.selectAll.addEventListener("click", handleSelectAll);
    dom.clearSelection.addEventListener("click", () => {
        state.selection.clear();
        render();
    });
    dom.bulkComplete.addEventListener("click", () => handleBulkAction("complete"));
    dom.bulkDelete.addEventListener("click", () => handleBulkAction("delete"));
    dom.bulkArchive.addEventListener("click", () => handleBulkAction("archive"));
    dom.clearArchive.addEventListener("click", () => {
        if (confirm("Arşivi temizlemek istediğinizden emin misiniz?")) handleClearArchive();
    });
    dom.settingsForm.addEventListener("submit", handleSettingsSubmit);
    dom.themeToggle.addEventListener("click", toggleTheme);
    dom.notificationToggle.addEventListener("click", toggleNotifications);
    dom.exportData.addEventListener("click", exportData);
    dom.importData.addEventListener("change", importData);
    dom.addCategoryFromSettings.addEventListener("click", handleAddCategoryFromSettings);
    dom.addCategoryBtn.addEventListener("click", handleAddCategory);
    dom.saveCategory.addEventListener("click", saveNewCategory);
    dom.cancelCategory.addEventListener("click", cancelNewCategory);
    dom.newCategoryModalInput.addEventListener("keypress", event => {
        if (event.key === "Enter") saveNewCategory();
    });
    dom.categoryModal.addEventListener("click", event => {
        if (event.target === dom.categoryModal) cancelNewCategory();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (dom.categoryModal && dom.categoryModal.classList.contains("show")) {
                cancelNewCategory();
            }
        }
    });

    setupDragAndDrop();
    setInterval(checkReminders, 60000);
}

function init() {
    // İlk kez mi açılıyor kontrolü
    if (Object.keys(state.auth.users).length === 0) {
        // İlk kez - kayıt ekranı göster
        showRegisterScreen();
    } else {
        // Daha önce kullanıcı var - giriş ekranı göster
        showLoginScreen();
        setupAuthListeners();
    }
}

function showRegisterScreen() {
    if (!dom.loginScreen) {
        setTimeout(showRegisterScreen, 100);
        return;
    }
    dom.loginScreen.style.display = 'flex';
    dom.loginForm.style.display = 'none';
    dom.registerForm.style.display = 'block';
    dom.appContent.style.display = 'none';
}

function setupAuthListeners() {
    if (dom.loginForm) dom.loginForm.addEventListener("submit", handleLogin);
    if (dom.registerForm) dom.registerForm.addEventListener("submit", handleRegister);
}

document.addEventListener("DOMContentLoaded", init);
