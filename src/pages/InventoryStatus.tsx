import { useEffect, useState } from 'react';
import type { FC, FormEvent } from 'react';
import axios from 'axios';

interface Book {
  id: number | string;
  title: string;
  author?: string;
  category?: string;
  price?: number;
  total?: number;
  renting?: number;
  stock: number;
}

// Cấu hình Base URL: ưu tiên biến môi trường trên Vercel, nếu không sẽ dùng trực tiếp Render Backend
const API_URL = import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com';

export const InventoryStatus: FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Lập trình');
  const [newPrice, setNewPrice] = useState('50000');
  const [newStock, setNewStock] = useState('10');

  // 1. Hàm gọi API lấy danh sách sách từ NestJS Backend trên Render
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sách:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.toLowerCase().trim();
    const titleMatch = book.title?.toLowerCase().includes(term) || false;
    const authorMatch = book.author?.toLowerCase().includes(term) || false;
    const categoryMatch = book.category?.toLowerCase().includes(term) || false;
    return titleMatch || authorMatch || categoryMatch;
  });

  // 2. Hàm xóa sách gọi API DELETE lên Backend trên Render
  const handleDelete = async (id: number | string) => {
    if (window.confirm(`Bạn có chắc muốn xóa đầu sách mã ${id} khỏi kho không?`)) {
      try {
        await axios.delete(`${API_URL}/books/${id}`);
        setBooks(books.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
        alert('Xóa sách thất bại từ server!');
      }
    }
  };

  // 3. Hàm thêm sách gọi API POST lên Backend và lưu vào Database Aiven
  const handleAddBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên sách!');
      return;
    }

    try {
      const payload = {
        title: newTitle.trim(),
        author: newAuthor.trim() || 'Đang cập nhật',
        category: newCategory,
        price: parseFloat(newPrice) || 0,
        stock: parseInt(newStock) || 0,
        total: parseInt(newStock) || 0,
        renting: 0,
      };

      await axios.post(`${API_URL}/books`, payload);
      await fetchBooks();
      
      setShowModal(false);
      setNewTitle('');
      setNewAuthor('');
      setNewPrice('50000');
      setNewStock('10');
      alert('Thêm sách thành công vào Database Aiven qua Render!');
    } catch (error: any) {
      console.error('Lỗi chi tiết khi thêm sách:', error.response?.data || error.message);
      alert('Thêm sách thất bại lên server! Xem chi tiết ở Console (F12).');
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Tiêu đề & Nút Thêm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800', margin: 0 }}>📊 Trạng Thái Sách Đang Thuê & Còn Lại</h1>
          <p style={{ color: '#64748b', marginTop: '0.3rem', fontSize: '0.95rem' }}>Quản lý số lượng tồn kho và tình trạng sách kết nối từ NestJS API trên Render.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}
        >
          + Thêm Sách Vào Kho
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div style={{ background: '#fff', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>
          Tổng số đầu sách: <span style={{ color: '#0284c7' }}>{filteredBooks.length}</span>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả, thể loại..." 
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
      </div>

      {/* Danh sách Thẻ Sách */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu từ Backend trên Render...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {book.category || 'Chưa phân loại'}
                  </span>
                  <button 
                    onClick={() => handleDelete(book.id)}
                    style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Xóa đầu sách"
                  >
                    🗑️
                  </button>
                </div>

                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                  Tác giả: <span style={{ color: '#334155', fontWeight: '600' }}>{book.author || 'Đang cập nhật'}</span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Giá thuê:</span>
                    <span style={{ fontWeight: '700', color: '#0284c7' }}>{book.price ? Number(book.price).toLocaleString() + ' đ' : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Tổng số lượng:</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{book.total || book.stock || 0} cuốn</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Còn lại trong kho:</span>
                    <span style={{ fontWeight: '700', color: (book.stock ?? 0) > 0 ? '#16a34a' : '#dc2626' }}>{book.stock ?? 0} cuốn</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', color: '#64748b', border: '1px solid #e2e8f0' }}>
              Không tìm thấy đầu sách phù hợp trong kho.
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm Sách */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a', fontWeight: '800' }}>📚 Thêm Sách Mới Vào Kho</h3>
            
            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Tên Sách</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Nhập tên đầu sách..." 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Tác Giả</label>
                <input 
                  type="text" 
                  value={newAuthor} 
                  onChange={(e) => setNewAuthor(e.target.value)} 
                  placeholder="Nhập tên tác giả..." 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Thể Loại</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                >
                  <option value="Lập trình">Lập trình</option>
                  <option value="Khoa học máy tính">Khoa học máy tính</option>
                  <option value="Kỹ năng sống">Kỹ năng sống</option>
                  <option value="Kinh doanh & Tài chính">Kinh doanh & Tài chính</option>
                  <option value="Văn học & Tiểu thuyết">Văn học & Tiểu thuyết</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Giá Sách (VNĐ)</label>
                <input 
                  type="number" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>Số Lượng Tồn Kho</label>
                <input 
                  type="number" 
                  min="1"
                  value={newStock} 
                  onChange={(e) => setNewStock(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Xác Nhận Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};