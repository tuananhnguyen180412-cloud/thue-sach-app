import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onLogout }) => {
  // Lấy tên người dùng đã lưu từ localStorage hoặc dùng mặc định
  const userName = localStorage.getItem('user_name') || 'Nguyễn Tuấn Anh';

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '650',
    color: '#fff',
    background: isActive ? '#0284c7' : 'transparent',
    transition: '0.2s',
  });

  return (
    <div style={{ width: '260px', background: '#0f172a', color: '#fff', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Phần trên: Logo và Danh sách Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#38bdf8' }}>
          ⚡ QUẢN TRỊ VIÊN<br/><span style={{ fontSize: '1.5rem', color: '#fff' }}>BOOKHUB</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <NavLink to="/dashboard" style={linkStyle}>📊 Tổng quan</NavLink>
          <NavLink to="/members" style={linkStyle}>👥 Quản lý Hội viên</NavLink>
          <NavLink to="/inventory" style={linkStyle}>📦 Kho sách</NavLink>
          <NavLink to="/orders" style={linkStyle}>📋 Quản lý Đơn thuê</NavLink>
          <NavLink to="/staff" style={linkStyle}>🛡️ Nhân sự</NavLink>
          <NavLink to="/revenue" style={linkStyle}>💰 Doanh thu</NavLink>
          <NavLink to="/settings" style={linkStyle}>⚙️ Cài đặt hệ thống</NavLink>
        </div>
      </div>

      {/* Phần dưới: Khối thông tin Admin & Nút Đăng xuất */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
        
        {/* Thẻ User Profile: Hình ảnh, Tên và Trạng thái */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0.25rem' }}>
          <div style={{ position: 'relative' }}>
            {/* Ảnh đại diện Avatar */}
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '1.1rem', border: '2px solid #38bdf8' }}>
              {userName.charAt(0)}
            </div>
            {/* Chấm tròn báo trạng thái Trực tuyến (Online) */}
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px', background: '#22c55e', border: '2px solid #0f172a', borderRadius: '50%' }} title="Đang hoạt động"></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              ● Đang hoạt động
            </span>
          </div>
        </div>

        {/* Nút Đăng Xuất */}
        <button 
          onClick={onLogout}
          style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '0.7rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.2s', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}
        >
          🚪 Đăng Xuất
        </button>
      </div>

    </div>
  );
};