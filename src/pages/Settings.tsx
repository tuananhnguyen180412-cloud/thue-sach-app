import { useState } from 'react';
import type { FC, FormEvent } from 'react';

export const Settings: FC = () => {
  // Lấy dữ liệu đã lưu hoặc dùng mặc định
  const [systemName, setSystemName] = useState(() => localStorage.getItem('setting_system_name') || 'Admin BookHub Vietnam');
  const [reportEmail, setReportEmail] = useState(() => localStorage.getItem('setting_report_email') || 'manager@bookhub.vn');
  const [finePerDay, setFinePerDay] = useState(() => localStorage.getItem('setting_fine') || '5000');
  const [maxRentDays, setMaxRentDays] = useState(() => localStorage.getItem('setting_max_days') || '14');
  const [autoEmailNotify, setAutoEmailNotify] = useState(() => localStorage.getItem('setting_auto_email') === 'true');
  
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('setting_system_name', systemName);
    localStorage.setItem('setting_report_email', reportEmail);
    localStorage.setItem('setting_fine', finePerDay);
    localStorage.setItem('setting_max_days', maxRentDays);
    localStorage.setItem('setting_auto_email', String(autoEmailNotify));

    setSuccessMessage('Đã lưu cấu hình hệ thống thành công!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Tiêu đề trang */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>⚙️ Cài Đặt Hệ Thống</h1>
        <p style={{ color: '#64748b', marginTop: '0.3rem', fontSize: '0.95rem' }}>Tùy chỉnh thông tin thư viện, cấu hình phí phạt trễ hạn và các thiết lập vận hành.</p>
      </div>

      {/* Thông báo thành công */}
      {successMessage && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Cột trái: Cấu hình chung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              🏢 Thông Tin Định Danh Hệ Thống
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Tên hệ thống quản lý</label>
                <input 
                  type="text" 
                  value={systemName} 
                  onChange={(e) => setSystemName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Email nhận báo cáo tài chính & hệ thống</label>
                <input 
                  type="email" 
                  value={reportEmail} 
                  onChange={(e) => setReportEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              📚 Quy Định Thuê Sách & Phí Phạt
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Tiền phạt trễ hạn (VNĐ/ngày)</label>
                <input 
                  type="number" 
                  value={finePerDay} 
                  onChange={(e) => setFinePerDay(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Thời gian thuê tối đa (Ngày)</label>
                <input 
                  type="number" 
                  value={maxRentDays} 
                  onChange={(e) => setMaxRentDays(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="checkbox" 
                id="autoEmail" 
                checked={autoEmailNotify} 
                onChange={(e) => setAutoEmailNotify(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="autoEmail" style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600', cursor: 'pointer' }}>
                Tự động gửi email cảnh báo khi khách hàng sắp đến hạn trả sách
              </label>
            </div>
          </div>

        </div>

        {/* Cột phải: Thẻ hành động & Thông tin phiên bản */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>💾 Lưu Cấu Hình</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
              Nhấn nút bên dưới để áp dụng toàn bộ thay đổi cấu hình cho toàn hệ thống BookHub.
            </p>
            <button 
              type="submit"
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(2,132,199,0.2)', transition: '0.2s' }}
            >
              Lưu Thay Đổi
            </button>
          </div>

          <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>ℹ️ Thông Tin Ứng Dụng</h4>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
              • <b>Phiên bản:</b> v2.5.0 Stable<br/>
              • <b>Cơ chế lưu trữ:</b> LocalStorage Active<br/>
              • <b>Môi trường:</b> Quản trị nội bộ (Admin)
            </div>
          </div>

        </div>

      </form>

    </div>
  );
};