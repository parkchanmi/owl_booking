import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/home';
import DashboardLayout from './components/DashboardLayout';
import ReservationPage from './page/user/index';
import MyPage from './page/user/mypage/index';
import BookingPage from './page/admin/booking/index';
import AttendancePage from './page/admin/attendance/index';

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
  .filter(({ path, Element }) => Boolean(Element) && (path === '/admin' || path.startsWith('/admin/')))
  .filter(({ path }) => !path.startsWith('/admin/booking') && !path.startsWith('/admin/attendance'))
  .map(({ path, Element }) => ({
    path: path === '/admin' ? '' : path.replace('/admin/', ''),
    index: path === '/admin',
    Element,
  }));

const nonAdminRoutes = routes.filter(({ path, Element }) => Boolean(Element) && !(path === '/admin' || path.startsWith('/admin/')));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/mypage" element={<MyPage />} />
        {nonAdminRoutes.map(({ path, Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="booking" element={<BookingPage />} />
          <Route path="class" element={<BookingPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="instructor/attendance" element={<AttendancePage />} />
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
