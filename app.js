// Temel React uygulaması
console.log('Uygulama başlatıldı');

const App = () => {
  return (
    <div>
      <h1>Advanced Todo App</h1>
      {/* Tüm özellikler buraya eklenecek */}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
