import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/home';
import DashboardLayout from './components/DashboardLayout';

const pages = import.meta.glob('./page/**/*.jsx', { eager: true });

const routes = Object.keys(pages).map((path) => {
  // 파일 경로에서 이름을 추출 (예: ./page/login.jsx -> login)
  const name = path.match(/\.\/page\/(.*)\.jsx$/)[1].toLowerCase().replace(/\/index$/, '');
  return {
    path: `/${name}`,
    Element: pages[path].default,
  };
});

const adminRoutes = routes
  .filter(({ path }) => path === '/admin' || path.startsWith('/admin/'))
  .map(({ path, Element }) => ({
    path: path === '/admin' ? '' : path.replace('/admin/', ''),
    index: path === '/admin',
    Element,
  }));

const nonAdminRoutes = routes.filter(({ path }) => !(path === '/admin' || path.startsWith('/admin/')));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {nonAdminRoutes.map(({ path, Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
        <Route path="/admin" element={<DashboardLayout />}>
          {adminRoutes.map(({ path, index, Element }) => (
            <Route
              key={index ? 'admin-index' : path}
              index={index}
              path={index ? undefined : path}
              element={<Element />}
            />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
