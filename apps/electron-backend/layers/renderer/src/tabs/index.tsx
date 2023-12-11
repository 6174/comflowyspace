import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Hello, World! {count}</p>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);