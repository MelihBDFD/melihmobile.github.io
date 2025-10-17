// Temel React uygulaması buraya eklenecek
console.log('Uygulama başlatıldı');

const App = () => {
  const [todos, setTodos] = React.useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [darkMode, setDarkMode] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [details, setDetails] = React.useState('');
  const [newSubtask, setNewSubtask] = React.useState('');
  const [activeList, setActiveList] = React.useState('Genel');
  const [loading, setLoading] = React.useState(true);
  
  // Firebase konfigürasyonu
  const firebaseConfig = {
    apiKey: "AIzaSyDZpQ3zQxkzQxkzQxkzQxkzQxkzQxkzQ",
    authDomain: "todo-app-12345.firebaseapp.com",
    databaseURL: "https://todo-app-12345.firebaseio.com",
    projectId: "todo-app-12345",
    storageBucket: "todo-app-12345.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:1234567890"
  };

  // Firebase başlatma
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Gerçek zamanlı veri senkronizasyonu
  const syncTodos = () => {
    const userId = firebase.auth().currentUser?.uid;
    if (userId) {
      firebase.database().ref(`users/${userId}/todos`)
        .on('value', (snapshot) => {
          const data = snapshot.val();
          if (data) setTodos(Object.values(data));
        });
    }
  };

  // Konum hatırlatıcıları
  const setupGeofencing = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          checkLocationBasedReminders(position.coords);
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  };

  // AI önerileri
  const getAIRecommendations = async () => {
    const overdue = todos.filter(t => 
      new Date(t.deadline) < new Date() && !t.completed
    );
    
    if (overdue.length > 3) {
      showToast(`⚡ ${overdue.length} geciken görevin var! Öncelik ver.`);
    }
  };

  // Tarih ve etiket algılama
  const parseInput = (text) => {
    const dateMatch = text.match(/(\d{1,2}\s\w+)/);
    const tagMatch = text.match(/#(\w+)/);
    return {
      text: text.replace(dateMatch?.[0] || '', '').replace(tagMatch?.[0] || '', '').trim(),
      date: dateMatch?.[0],
      tag: tagMatch?.[1]
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
        deadline: parsed.date,
        tag: parsed.tag,
        list: activeList,
        priority: 'medium',
        createdAt: new Date().toISOString()
      };
      
      setTodos([...todos, newTodo]);
      localStorage.setItem('todos', JSON.stringify([...todos, newTodo]));
      setInput('');
      showToast('Görev eklendi');
    }
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
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setNewSubtask('');
    }
  };

  // Toast gösterme fonksiyonu
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Görev silme animasyonu
  const deleteTodo = (id) => {
    const todoElement = document.querySelector(`li[data-id="${id}"]`);
    if (todoElement) {
      todoElement.classList.add('removing');
      setTimeout(() => {
        const newTodos = todos.filter(todo => todo.id !== id);
        setTodos(newTodos);
        localStorage.setItem('todos', JSON.stringify(newTodos));
        showToast('Görev silindi');
      }, 300);
    }
  };

  // Görev toggle
  const toggleTodo = (id) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  // Görev detayı göster
  const showDetails = (id) => {
    setEditingId(editingId === id ? null : id);
  };

  // Karanlık mod toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    showToast(`Karanlık mod ${!darkMode ? 'açıldı' : 'kapatıldı'}`);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  React.useEffect(() => {
    syncTodos();
    setupGeofencing();
    getAIRecommendations();
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header ve tema butonu */}
      <div className="header">
        <h1>Yapılacaklar Listesi</h1>
        <button 
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      {/* Liste seçimi */}
      <div className="list-selector">
        {['Genel', 'İş', 'Kişisel', 'Alışveriş'].map(list => (
          <button 
            key={list}
            className={activeList === list ? 'active' : ''}
            onClick={() => setActiveList(list)}
          >
            {list}
          </button>
        ))}
      </div>
      
      {/* Görev girişi */}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Görev ekle (örn: 'Ekmek al - 20 Ekim #market')"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Ekle</button>
      </div>
      
      {/* Görev listesi */}
      <ul className="todo-list">
        {todos
          .filter(todo => activeList === 'Genel' || todo.list === activeList)
          .map(todo => (
            <li key={todo.id} data-id={todo.id} className={`${todo.completed ? 'completed' : ''} priority-${todo.priority}`}>
              <div className="todo-header">
                <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
                {todo.tag && <span className="tag">#{todo.tag}</span>}
              </div>
              
              {todo.deadline && <div className="deadline">⏰ {todo.deadline}</div>}
              
              {editingId === todo.id && (
                <div className="todo-details">
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Açıklama ekle..."
                  />
                  
                  <div className="subtasks">
                    <h4>Alt Görevler</h4>
                    {todo.subtasks.map(sub => (
                      <div key={sub.id} className="subtask">
                        <input type="checkbox" checked={sub.completed} />
                        <span>{sub.text}</span>
                      </div>
                    ))}
                    
                    <div className="add-subtask">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Alt görev ekle"
                        onKeyPress={(e) => e.key === 'Enter' && addSubtask(todo.id)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="todo-actions">
                <button onClick={() => showDetails(todo.id)}>
                  {editingId === todo.id ? 'Kapat' : 'Detay'}
                </button>
                <button onClick={() => deleteTodo(todo.id)}>Sil</button>
              </div>
            </li>
          ))}
      </ul>
      
      {todos.length > 0 && (
        <div className="stats">
          {todos.filter(t => !t.completed).length} aktif görev
        </div>
      )}
      
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
