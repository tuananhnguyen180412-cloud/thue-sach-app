import { Link, useLocation } from 'react-router-dom';
import type { FC } from 'react';

export const Navbar: FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: '🏠' },
    { path: '/catalog', label: 'Kho hàng', icon: '📦' },
    { path: '/membership', label: 'Hội viên', icon: '🎫' }, // Thêm trang Hội viên ở đây
    { path: '/rentals', label: 'Khách thuê', icon: '👥' },
    { path: '/inventory', label: 'Kho sách', icon: '📊' },
    { path: '/cart', label: 'Giỏ hàng', icon: '🛒' },
    { path: '/login', label: 'Đăng nhập', icon: '👤' },
  ];

  return (
    <div style={{
      width: '90px',
      height: '100vh',
      background: '#1e293b',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '1.5rem',
      boxSizing: 'border-box',
      zIndex: 1000
    }}>
      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '2rem' }}>
        📚
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0.75rem 0.25rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#2563eb' : 'transparent',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'background 0.2s, color 0.2s'
              }}
            >
              <span style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};