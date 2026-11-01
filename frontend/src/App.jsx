import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './page/home';
import DashboardLayout from './components/DashboardLayout';
import ReservationPage from './page/user/index';
import MyPage from './page/user/mypage/index';
import BookingPage from './page/admin/booking/index';
import AttendancePage from './page/admin/attendance/index';
import RequireSession from './components/auth/RequireSession';
import { isUserPage } from './utils/authRoutes';

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
const userRoutes = nonAdminRoutes.filter(({ path }) => isUserPage(path));
const publicRoutes = nonAdminRoutes.filter(({ path }) => !isUserPage(path));

function SessionHome() {
  const location = useLocation();
  return <Home key={location.key} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SessionHome />} />
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.path === '/login' || route.path === '/home' ? <SessionHome /> : <route.Element />} />
        ))}
        <Route element={<RequireSession />}>
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/mypage" element={<MyPage />} />
          {userRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.Element />} />
          ))}
        </Route>
        <Route element={<RequireSession adminOnly />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="booking" element={<BookingPage />} />
          <Route path="class" element={<BookingPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="instructor/attendance" element={<AttendancePage />} />
          {adminRoutes.map((route) => (
            <Route
              key={route.index ? 'admin-index' : route.path}
              index={route.index}
              path={route.index ? undefined : route.path}
              element={<route.Element />}
            />
          ))}
        </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
