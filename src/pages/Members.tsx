import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';

interface Member {
  id: number;
  memberCode: string;
  fullName: string;
  phone: string;
  address?: string;
  package: string;
  joinDate: string;
  status: string;
}

// Cấu hình Base URL: ưu tiên biến môi trường trên Vercel, nếu không sẽ dùng trực tiếp Render Backend
const API_URL = import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quản lý trạng thái Sửa hay Thêm
  const [editingId, setEditingId] = useState<number | null>(null);

  // State cho Form
  const [memberCode, setMemberCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pkg, setPkg] = useState('Gói Linh Hoạt');
  const [status, setStatus] = useState('Đang hoạt động'); // Mặc định là Đang hoạt động

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hội viên:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Mở modal thêm mới
  const handleOpenAddModal = () => {
    setEditingId(null);
    setMemberCode('');
    setFullName('');
    setPhone('');
    setAddress('');
    setPkg('Gói Linh Hoạt');
    setStatus('Đang hoạt động');
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (member: Member) => {
    setEditingId(member.id);
    setMemberCode(member.memberCode);
    setFullName(member.fullName);
    setPhone(member.phone);
    setAddress(member.address || '');
    setPkg(member.package);
    setStatus(member.status || 'Đang hoạt động');
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toLocaleDateString('vi-VN');
      if (editingId) {
        // Cập nhật hội viên
        await axios.put(`${API_URL}/members/${editingId}`, {
          memberCode,
          fullName,
          phone,
          address,
          package: pkg,
          status,
        });
      } else {
        // Thêm mới hội viên
        await axios.post(`${API_URL}/members`, {
          memberCode: memberCode || `#HV${Math.floor(100 + Math.random() * 900)}`,
          fullName,
          phone,
          address,
          package: pkg,
          joinDate: today,
          status: status,
        });
      }
      setShowModal(false);
      fetchMembers();
    } catch (error) {
      alert('Lỗi khi lưu thông tin hội viên!');
      console.error(error);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hội viên này?')) return;
    try {
      await axios.delete(`${API_URL}/members/${id}`);
      fetchMembers();
    } catch (error) {
      alert('Lỗi khi xóa hội viên!');
      console.error(error);
    }
  };

  // Tùy chỉnh màu sắc badge trạng thái
  const getStatusStyle = (currentStatus: string) => {
    return currentStatus === 'Đang hoạt động'
      ? { background: '#dcfce7', color: '#166534' }
      : { background: '#fee2e2', color: '#dc2626' };
  };

  const filteredMembers = members.filter((member) => {
    const keyword = searchTerm.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(keyword) ||
      member.phone.toLowerCase().includes(keyword) ||
      member.memberCode.toLowerCase().includes(keyword)
    );
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>👥 Quản lý Hội viên</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Danh sách khách hàng đăng ký thẻ thành viên thư viện qua Render & Aiven</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)' }}
        >
          + Thêm Hội viên
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, số điện thoại hoặc mã hội viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#fff'
          }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Mã HV</th>
              <th style={{ padding: '1rem' }}>Họ và Tên</th>
              <th style={{ padding: '1rem' }}>Số Điện Thoại</th>
              <th style={{ padding: '1rem' }}>Gói Đăng Ký</th>
              <th style={{ padding: '1rem' }}>Ngày Tham Gia</th>
              <th style={{ padding: '1rem' }}>Trạng Thái</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải dữ liệu từ Backend...</td></tr>
            ) : filteredMembers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Không tìm thấy hội viên phù hợp.</td></tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#0284c7' }}>{member.memberCode}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{member.fullName}</td>
                  <td style={{ padding: '1rem' }}>{member.phone}</td>
                  <td style={{ padding: '1rem' }}>{member.package}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{member.joinDate}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      ...getStatusStyle(member.status), 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      {member.status || 'Đang hoạt động'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa Hội Viên */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a' }}>{editingId ? 'Chỉnh Sửa Hội Viên' : 'Thêm Hội Viên Mới'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Mã Hội Viên</label>
                <input
                  type="text"
                  placeholder="VD: #HV01"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Họ và Tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên hội viên..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Số Điện Thoại *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số điện thoại..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Gói Đăng Ký</label>
                <select
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="Gói Linh Hoạt">Gói Linh Hoạt</option>
                  <option value="Gói Tiêu Chuẩn (6 Tháng)">Gói Tiêu Chuẩn (6 Tháng)</option>
                  <option value="Gói VIP (1 Năm)">Gói VIP (1 Năm)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Trạng Thái *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Dừng hoạt động">Dừng hoạt động</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingId ? 'Cập Nhật' : 'Lưu Hội Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}