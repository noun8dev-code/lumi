import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import ChildDetail from './components/ChildDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/child/:id" element={<ChildDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
