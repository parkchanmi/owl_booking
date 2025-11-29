import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/home';
import TablePage from './page/table';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/table" element={<TablePage />} />
      </Routes>
    </Router>
  );
}

export default App;