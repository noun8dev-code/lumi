import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Home from './components/Home';
import ChildDetail from './components/ChildDetail';
import './App.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/child/:id" element={<ChildDetail />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
