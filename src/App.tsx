import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Rentals } from './pages/Rentals';
import { InventoryStatus } from './pages/InventoryStatus';
import { Orders } from './pages/Orders';
import Staff from './pages/Staff'; // Đã sửa: bỏ dấu ngoặc nhọn
import { Revenue } from './pages/Revenue';
import { Settings } from './pages/Settings';
import Login from './pages/Login'; // Đã sửa: bỏ dấu ngoặc nhọn
import Members from './pages/Members';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  // Nếu chưa đăng nhập, chỉ hiển thị trang Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Nếu đã đăng nhập, cho phép truy cập toàn bộ hệ thống Admin
  return (
    <Router>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#f8fafc' }}>
        
        {/* Sidebar Quản Trị */}
        <Sidebar onLogout={handleLogout} />

        {/* Khu Vực Nội Dung */}
        <div style={{ flex: 1, minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/inventory" element={<InventoryStatus />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Nếu đã đăng nhập mà truy cập /login thì tự điều hướng về trang chủ */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}