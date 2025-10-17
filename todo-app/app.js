// Gelişmiş Yapılacaklar Uygulaması - Tüm Özellikler

const App = () => {
  // Ana state yönetimi
  const [todos, setTodos] = React.useState(() => {
    const saved = localStorage.getItem('advanced-todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('created');
  const [activeList, setActiveList] = React.useState('Genel');
  const [darkMode, setDarkMode] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [details, setDetails] = React.useState('');
  const [newSubtask, setNewSubtask] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [deadline, setDeadline] = React.useState('');

  // Toast sistemi
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Akıllı metin analizi (tarih, etiket, öncelik algılama)
  const parseInput = (text) => {
    // Tarih algılama (örn: "Satın al - 12 Mayıs" veya "Toplantı 15/06/2024")
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+\w+|\d{1,2}\.\d{1,2}\.\d{2,4})/);
    
    // Etiket algılama (örn: "#iş #acil")
    const tagMatches = text.match(/#(\w+)/g) || [];
    const tags = tagMatches.map(tag => tag.substring(1));
    
    // Öncelik algılama (örn: "!!!kritik!!!" veya "yüksek")
    const priorityMatch = text.match(/(yüksek|orta|düşük|kritik|acil)/i);
    
    return {
      text: text.replace(dateMatch?.[0] || '', '').replace(/#\w+/g, '').trim(),
      date: dateMatch?.[0],
      tags: tags,
      priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'orta'
    };
  };

  // Görev ekleme
  const addTodo = () => {
    if (input.trim()) {
      const parsed = parseInput(input);
      const newTodo = {
        id: Date.now(),
        text: parsed.text,
        completed: false,
        details: '',
        subtasks: [],
        deadline: parsed.date || deadline,
        tags: parsed.tags,
        list: activeList,
        priority: parsed.priority || priority,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      localStorage.setItem('advanced-todos', JSON.stringify(updatedTodos));
      setInput('');
      setDeadline('');
      setPriority('orta');
      showToast('Görev eklendi');
    }
  };

  // Görev güncelleme
  const updateTodo = (id, updates) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? {...todo, ...updates} : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem('advanced-todos', JSON.stringify(updatedTodos));
  };

  // Görev silme
  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem('advanced-todos', JSON.stringify(updatedTodos));
    showToast('Görev silindi');
  };

  // Alt görev ekleme
  const addSubtask = (todoId) => {
    if (newSubtask.trim()) {
      const updatedTodos = todos.map(todo => {
        if (todo.id === todoId) {
          return {
            ...todo,
            subtasks: [...todo.subtasks, {
              id: Date.now(),
              text: newSubtask,
              completed: false
            }]
          };
        }
        return todo;
      });
      
      setTodos(updatedTodos);
      localStorage.setItem('advanced-todos', JSON.stringify(updatedTodos));
      setNewSubtask('');
    }
  };

  // Görevleri filtreleme
  const getFilteredTodos = () => {
    let filtered = todos;
    
    // Liste filtresi
    if (activeList !== 'Genel') {
      filtered = filtered.filter(todo => todo.list === activeList);
    }
    
    // Durum filtresi
    if (filter === 'completed') filtered = filtered.filter(todo => todo.completed);
    if (filter === 'active') filtered = filtered.filter(todo => !todo.completed);
    if (filter === 'overdue') filtered = filtered.filter(todo => 
      todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed
    );
    
    // Sıralama
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'deadline':
          return new Date(a.deadline || '2099') - new Date(b.deadline || '2099');
        case 'priority':
          const priorityOrder = {yüksek: 3, kritik: 3, orta: 2, düşük: 1};
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return filtered;
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="header">
        <h1>📋 Advanced Todo App</h1>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Liste Seçimi */}
      <div className="list-selector">
        {['Genel', 'İş', 'Kişisel', 'Alışveriş', 'Önemli'].map(list => (
          <button 
            key={list}
            className={activeList === list ? 'active' : ''}
            onClick={() => setActiveList(list)}
          >
            {list}
          </button>
        ))}
      </div>

      {/* Görev Girişi */}
      <div className="input-section">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Görev ekle (örn: 'Ekmek al - 12 Mayıs #market' veya 'Toplantı 15/06/2024 #iş !!!kritik!!!')"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <button onClick={addTodo} className="add-btn">➕ Ekle</button>
        </div>
        
        <div className="input-options">
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="düşük">🔵 Düşük</option>
            <option value="orta">🟡 Orta</option>
            <option value="yüksek">🟠 Yüksek</option>
            <option value="kritik">🔴 Kritik</option>
          </select>
          
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Son tarih"
          />
        </div>
      </div>

      {/* Filtreleme ve Sıralama */}
      <div className="controls">
        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Tümü
          </button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
            Aktif
          </button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
            Tamamlanan
          </button>
          <button className={filter === 'overdue' ? 'active' : ''} onClick={() => setFilter('overdue')}>
            Geciken
          </button>
        </div>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created">Oluşturulma Tarihi</option>
          <option value="deadline">Son Tarih</option>
          <option value="priority">Öncelik</option>
          <option value="alphabetical">Alfabetik</option>
        </select>
      </div>

      {/* Görev Listesi */}
      <ul className="todo-list">
        {getFilteredTodos().map(todo => (
          <li key={todo.id} className={`todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
              <div className="todo-header">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => updateTodo(todo.id, {completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : null})}
                />
                <span className="todo-text">{todo.text}</span>
                
                <div className="todo-badges">
                  {todo.deadline && (
                    <span className={`badge ${new Date(todo.deadline) < new Date() && !todo.completed ? 'overdue' : ''}`}>
                      📅 {todo.deadline}
                    </span>
                  )}
                  {todo.tags.map(tag => (
                    <span key={tag} className="badge tag">#{tag}</span>
                  ))}
                </div>
              </div>
              
              {/* Görev Detayları */}
              {editingId === todo.id && (
                <div className="todo-details">
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Açıklama ekle..."
                    onBlur={() => {
                      updateTodo(todo.id, {details});
                      setEditingId(null);
                    }}
                  />
                  
                  {/* Alt Görevler */}
                  <div className="subtasks">
                    <h4>📋 Alt Görevler</h4>
                    {todo.subtasks.map(sub => (
                      <div key={sub.id} className="subtask">
                        <input 
                          type="checkbox" 
                          checked={sub.completed}
                          onChange={() => {
                            const updatedSubtasks = todo.subtasks.map(s => 
                              s.id === sub.id ? {...s, completed: !s.completed} : s
                            );
                            updateTodo(todo.id, {subtasks: updatedSubtasks});
                          }}
                        />
                        <span>{sub.text}</span>
                      </div>
                    ))}
                    
                    <div className="add-subtask">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Alt görev ekle"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSubtask(todo.id);
                          }
                        }}
                      />
                      <button onClick={() => addSubtask(todo.id)}>Ekle</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="todo-actions">
              <button onClick={() => {
                setEditingId(editingId === todo.id ? null : todo.id);
                setDetails(todo.details);
              }}>
                {editingId === todo.id ? '💾 Kaydet' : '✏️ Düzenle'}
              </button>
              <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
                🗑️ Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* İstatistikler */}
      {todos.length > 0 && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
            <span className="stat-label">Aktif Görev</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{todos.filter(t => t.completed).length}</span>
            <span className="stat-label">Tamamlanan</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round((todos.filter(t => t.completed).length / Math.max(todos.length, 1)) * 100)}%
            </span>
            <span className="stat-label">Verimlilik</span>
          </div>
        </div>
      )}

      {/* Toast Bildirimleri */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
