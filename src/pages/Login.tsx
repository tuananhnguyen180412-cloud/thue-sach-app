import { useState, type FormEvent } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

// Cấu hình API endpoint tới Render Backend
const API_URL = `${import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com'}/staff`;

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Gọi API lấy danh sách nhân sự từ Database Aiven MySQL qua Render Backend
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Không thể kết nối tới server.');
      }

      const staffList = await response.json();

      // Tìm kiếm nhân sự theo email
      const staff = staffList.find((s: any) => s.email.toLowerCase() === email.toLowerCase());

      if (!staff) {
        setError('Tài khoản quản trị không tồn tại trong hệ thống!');
        setLoading(false);
        return;
      }

      // Kiểm tra trạng thái tài khoản
      if (staff.status === 'Tạm khóa') {
        setError(`Tài khoản "${staff.fullName}" hiện đang bị Tạm khóa. Không thể đăng nhập!`);
        setLoading(false);
        return;
      }

      // Đăng nhập thành công: Lưu trạng thái và gọi callback để App.tsx mở khóa giao diện
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentStaff', JSON.stringify(staff));
      onLoginSuccess();
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Không thể kết nối đến Backend trên Render. Vui lòng kiểm tra lại server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '800' }}>⚡ BOOKHUB</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Đăng Nhập Quản Trị Viên (Render & MySQL)</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center', border: '1px solid #fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>Email Quản Trị</label>
            <input
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>Mật Khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem', background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
          <strong>Lưu ý:</strong> Tài khoản phải tồn tại trong cơ sở dữ liệu nhân sự trên Render/MySQL thì mới đăng nhập được vào hệ thống.
        </div>
      </div>
    </div>
  );
}