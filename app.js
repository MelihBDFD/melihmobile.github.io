// Basit Todo Uygulaması - Çalışan Sürüm

const App = () => {
  const [todos, setTodos] = React.useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  // Görev ekleme
  const addTodo = () => {
    if (input.trim()) {
      const newTodos = [...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }];
      setTodos(newTodos);
      localStorage.setItem('todos', JSON.stringify(newTodos));
      setInput('');
    }
  };

  // Görev silme
  const deleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  // Görev tamamlama
  const toggleTodo = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  // Filtrelenmiş görevler
  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  return (
    <div className="app">
      <h1>Yapılacaklar Listesi</h1>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Yeni görev ekle..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Ekle</button>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Aktif
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Tamamlanan
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
