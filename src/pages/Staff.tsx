import { useState, useEffect, type FormEvent } from 'react';

interface StaffMember {
  id: number;
  fullName: string;
  position: string; // backend trả về "position", không phải "role"
  email: string;
  status: string;
}

// Cấu hình Base URL kết nối Render Backend
const API_URL = `${import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com'}/staff`;

const POSITIONS = ['Nhân viên', 'Quản lý thường', 'Quản lý cấp cao'];
const DEFAULT_POSITION = 'Quản lý thường';
const DEFAULT_STATUS = 'Đang hoạt động';

// Đổi các giá trị bị gõ sai / bị Google Dịch làm sai về đúng chức vụ
const LEGACY_POSITIONS: Record<string, string> = {
  'quản lý thời đại cao': 'Quản lý cấp cao',
  'quản lý cấp cao': 'Quản lý cấp cao',
  'quản lý thường': 'Quản lý thường',
  'nhân viên': 'Nhân viên',
};

const normalizePosition = (value: string | undefined | null): string => {
  if (!value) return DEFAULT_POSITION;
  return LEGACY_POSITIONS[value.trim().toLowerCase()] ?? value;
};

export default function Staff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [status, setStatus] = useState(DEFAULT_STATUS);

  // 1. Tải danh sách nhân sự từ Backend trên Render (MySQL)
  const fetchStaffs = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error('Lỗi khi kết nối tới Render Backend:', error);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // 2. Thêm mới hoặc Cập nhật lên Render Backend
  const handleSaveStaff = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và email!');
      return;
    }

    // Chỉ gửi đúng các field mà entity Staff ở backend có
    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      position,
      status,
    };

    try {
      const isEditing = editingId !== null;
      const response = await fetch(isEditing ? `${API_URL}/${editingId}` : API_URL, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `${isEditing ? 'Cập nhật' : 'Thêm mới'} thất bại (${response.status}): ${detail}`
        );
      }

      await fetchStaffs();
      resetForm();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu dữ liệu xuống server Render!');
      console.error(error);
    }
  };

  // 3. Xóa nhân sự trên Render Backend
  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân sự này không?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setStaffList((prev) => prev.filter((staff) => staff.id !== id));
        } else {
          alert('Xóa thất bại từ server!');
        }
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
      }
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingId(staff.id);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setPosition(normalizePosition(staff.position));
    setStatus(staff.status || DEFAULT_STATUS);
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPosition(DEFAULT_POSITION);
    setStatus(DEFAULT_STATUS);
    setShowModal(false);
  };

  // Luôn có 3 chức vụ chuẩn, và thêm giá trị lạ (nếu có) để select không bị lệch
  const positionOptions = Array.from(new Set([...POSITIONS, position]));

  return (
    <div
      translate="no"
      style={{ padding: '2rem', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>🛡️ Quản Lý Nhân Sự & Phân Quyền (Render & MySQL)</h2>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Đồng bộ trực tiếp với Aiven MySQL qua NestJS trên Render.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          + Thêm nhân sự mới
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Họ Tên</th>
              <th style={{ padding: '1rem' }}>Chức Vụ</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Trạng Thái</th>
              <th style={{ padding: '1rem' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Đang tải dữ liệu hoặc chưa có nhân sự nào trên database...
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#0284c7' }}>NV-{staff.id}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{staff.fullName}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{normalizePosition(staff.position)}</td>
                  <td style={{ padding: '1rem', color: '#475569' }}>{staff.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: staff.status === 'Đang hoạt động' ? '#dcfce7' : '#fee2e2',
                      color: staff.status === 'Đang hoạt động' ? '#16a34a' : '#dc2626'
                    }}>
                      {staff.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleEdit(staff)}
                      style={{ marginRight: '0.5rem', background: '#0284c7', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>{editingId !== null ? 'Chỉnh Sửa Nhân Sự' : 'Thêm Nhân Sự Mới'}</h3>
            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Họ và Tên *</label>
                <input
                  type="text"
                  placeholder="Nhập họ tên..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Email đăng nhập *</label>
                <input
                  type="email"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Chức Vụ</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}
                >
                  {positionOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Tạm khóa">Tạm khóa</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: '700' }}
                >
                  {editingId !== null ? 'Cập Nhật' : 'Lưu Nhân Sự'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}