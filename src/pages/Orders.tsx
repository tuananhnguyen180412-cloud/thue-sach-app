import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';

interface Rental {
  id: number;
  rentalCode: string;
  memberName: string;
  bookTitle: string;
  status: string;
  borrowDate: string;
}

// Sách trong kho. Backend có thể dùng "title" hoặc "name", code hỗ trợ cả hai
interface BookItem {
  id: number;
  title?: string;
  name?: string;
}

const getBookName = (book: BookItem): string => book.title ?? book.name ?? '';

// Cấu hình Base URL: ưu tiên biến môi trường trên Vercel, nếu không sẽ dùng trực tiếp Render Backend
const API_URL = import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com';

export function Orders() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quản lý trạng thái Sửa hay Thêm mới
  const [editingId, setEditingId] = useState<number | null>(null);

  const [rentalCode, setRentalCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [status, setStatus] = useState('Đang thuê');

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/rentals`);
      setRentals(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn thuê:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách sách từ Kho sách để đưa vào ô chọn
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách sách:', err);
    }
  };

  useEffect(() => {
    fetchRentals();
    fetchBooks();
  }, []);

  // Mở modal tạo đơn mới
  const handleOpenAddModal = () => {
    setEditingId(null);
    setRentalCode(`#DH-${Math.floor(1000 + Math.random() * 9000)}`);
    setMemberName('');
    setBookTitle('');
    setStatus('Đang thuê');
    setShowModal(true);
  };

  // Mở modal chỉnh sửa đơn
  const handleOpenEditModal = (item: Rental) => {
    setEditingId(item.id);
    setRentalCode(item.rentalCode);
    setMemberName(item.memberName);
    setBookTitle(item.bookTitle);
    setStatus(item.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toLocaleDateString('vi-VN');
      if (editingId) {
        // Cập nhật đơn thuê
        await axios.put(`${API_URL}/rentals/${editingId}`, {
          rentalCode,
          memberName,
          bookTitle,
          status,
        });
      } else {
        // Tạo đơn thuê mới
        await axios.post(`${API_URL}/rentals`, {
          rentalCode,
          memberName,
          bookTitle,
          status,
          borrowDate: today,
        });
      }
      setShowModal(false);
      fetchRentals();
    } catch (err) {
      alert('Lỗi khi lưu đơn thuê!');
    }
  };

  const handleDeleteRental = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn này không?')) return;
    try {
      await axios.delete(`${API_URL}/rentals/${id}`);
      fetchRentals();
    } catch (err) {
      alert('Lỗi khi xóa!');
    }
  };

  // Tùy chỉnh màu sắc cho trạng thái
  const getStatusStyle = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Đang thuê':
        return { background: '#e0f2fe', color: '#0369a1' };
      case 'Đã trả':
        return { background: '#dcfce7', color: '#166534' };
      case 'Quá hạn':
        return { background: '#fee2e2', color: '#dc2626' };
      case 'Đang giao':
        return { background: '#fef3c7', color: '#92400e' };
      default:
        return { background: '#f1f5f9', color: '#334155' };
    }
  };

  // Lọc danh sách đơn thuê theo từ khóa tìm kiếm
  const filteredRentals = rentals.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    return (
      item.rentalCode.toLowerCase().includes(keyword) ||
      item.memberName.toLowerCase().includes(keyword) ||
      item.bookTitle.toLowerCase().includes(keyword)
    );
  });

  // Danh sách tên sách (bỏ tên rỗng và tên trùng)
  const bookNames = Array.from(new Set(books.map(getBookName).filter(Boolean)));

  return (
    <div translate="no" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>📋 Quản lý Đơn Thuê Sách</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Theo dõi trạng thái nhận, thanh toán và mượn trả qua Render & Aiven.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          + Tạo đơn mới
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo mã đơn, tên hội viên hoặc tên sách..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '450px',
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
              <th style={{ padding: '1rem' }}>Mã Đơn</th>
              <th style={{ padding: '1rem' }}>Hội Viên Thuê</th>
              <th style={{ padding: '1rem' }}>Tên Sách</th>
              <th style={{ padding: '1rem' }}>Ngày Thuê</th>
              <th style={{ padding: '1rem' }}>Trạng Thái</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu từ Backend...</td></tr>
            ) : filteredRentals.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Không tìm thấy đơn thuê phù hợp.</td></tr>
            ) : (
              filteredRentals.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#0284c7' }}>{item.rentalCode}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{item.memberName}</td>
                  <td style={{ padding: '1rem' }}>{item.bookTitle}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{item.borrowDate}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      ...getStatusStyle(item.status),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRental(item.id)}
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

      {/* Modal Thêm / Sửa Đơn Thuê */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Chỉnh Sửa Đơn Thuê' : 'Tạo Đơn Thuê Sách Mới'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Mã Đơn</label>
                <input
                  type="text"
                  value={rentalCode}
                  onChange={(e) => setRentalCode(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Tên Hội Viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên hội viên..."
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Tên Sách Mượn *</label>
                <select
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="">-- Chọn sách --</option>
                  {bookNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  {/* Giữ lại tên sách cũ khi sửa đơn mà sách đó không còn trong kho */}
                  {bookTitle && !bookNames.includes(bookTitle) && (
                    <option value={bookTitle}>{bookTitle}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Trạng Thái Đơn *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="Đang thuê">Đang thuê</option>
                  <option value="Đã trả">Đã trả</option>
                  <option value="Quá hạn">Quá hạn</option>
                  <option value="Đang giao">Đang giao</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer' }}
                >
                  {editingId ? 'Cập Nhật' : 'Lưu Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}