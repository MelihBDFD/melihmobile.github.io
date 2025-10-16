const dom = {
    body: document.body,
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

function renderTaskList(container, tasks) {
    container.innerHTML = "";
    if (!tasks.length) {
        container.classList.add("empty");
        return;
    }
    container.classList.remove("empty");
    tasks.forEach(task => {
        const element = createTaskElement(task);
        container.appendChild(element);
    });
}

function render() {
    const filtered = getFilteredTasks(state.tasks);
    const sorted = sortTasks(filtered);
    renderTaskList(dom.taskContainer, sorted);
    const archiveFiltered = getFilteredTasks(state.archive);
    const archiveSorted = sortTasks(archiveFiltered);
    renderTaskList(dom.archiveContainer, archiveSorted);
    updateAnalytics();
}

function updateAnalytics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completedAt).length;
    const active = total - completed;
    const overdue = state.tasks.filter(t => t.dueDate && !t.completedAt && new Date(t.dueDate) < Date.now()).length;
    dom.statTotal.textContent = total;
    dom.statCompleted.textContent = completed;
    dom.statActive.textContent = active;
    dom.statOverdue.textContent = overdue;
    renderCategoryChart();
    renderDailySummary();
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

function init() {
    loadState();
    applyTheme();
    populateCategories();
    resetFilters();
    render();
    dom.taskForm.addEventListener("submit", handleFormSubmit);
    dom.addCategoryBtn.addEventListener("click", handleAddCategory);
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
    dom.saveCategory.addEventListener("click", saveNewCategory);
    dom.cancelCategory.addEventListener("click", cancelNewCategory);
    dom.newCategoryModalInput.addEventListener("keypress", event => {
        if (event.key === "Enter") saveNewCategory();
    });
    dom.categoryModal.addEventListener("click", event => {
        if (event.target === dom.categoryModal) cancelNewCategory();
    });
    setupDragAndDrop();
    setInterval(checkReminders, 60000);
}

document.addEventListener("DOMContentLoaded", init);
