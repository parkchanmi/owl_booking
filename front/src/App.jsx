import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/home';

const pages = import.meta.glob('./page/**/*.jsx', { eager: true });

const routes = Object.keys(pages).map((path) => {
  // 파일 경로에서 이름을 추출 (예: ./page/login.jsx -> login)
  const name = path.match(/\.\/page\/(.*)\.jsx$/)[1].toLowerCase();
  return {
    path: `/${name}`,
    Element: pages[path].default,
  };
});

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {routes.map(({ path, Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;