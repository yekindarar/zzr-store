import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import styles from './AdminProducts.module.css';
import layoutStyles from './AdminLayout.module.css';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category: 'mouse', price: '', description: '', image: '' });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data.products);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', category: 'mouse', price: '', description: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, price: String(p.price), description: p.description || '', image: p.image || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    try {
      if (editing) {
        await adminApi.updateProduct(editing.id, {
          name: form.name, category: form.category, price: Number(form.price),
          description: form.description, image: form.image,
        });
      } else {
        await adminApi.createProduct({
          name: form.name, category: form.category, price: Number(form.price),
          description: form.description, image: form.image || '/zzr-store/images/mouse-m1.svg',
        });
      }
      setShowModal(false);
      refresh();
    } catch {
      alert('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除该商品？')) {
      try {
        await adminApi.deleteProduct(id);
        refresh();
      } catch {
        alert('删除失败');
      }
    }
  };

  return (
    <div>
      <div className={layoutStyles.header}>
        <h1 className={layoutStyles.headerTitle}>商品管理</h1>
        <p className={layoutStyles.headerSub}>共 {products.length} 件商品</p>
      </div>

      <div className={styles.toolbar}>
        <div />
        <button className={styles.addBtn} onClick={openAdd}>+ 添加商品</button>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>加载中...</p>}

      {!loading && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>商品</th><th>分类</th><th>价格</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productInfo}>
                    <div className={styles.productThumb}><img src={p.image} alt={p.name} /></div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.category === 'mouse' ? '鼠标' : '鼠标垫'}</td>
                <td style={{ fontWeight: 500 }}>¥{p.price}</td>
                <td>
                  <button className={styles.actionBtn} onClick={() => openEdit(p)}>编辑</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editing ? '编辑商品' : '添加商品'}</h2>
            <div className={styles.form}>
              <div className={styles.field}><label>商品名称</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如 Z1" /></div>
              <div className={styles.field}><label>分类</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="mouse">鼠标</option>
                  <option value="mousepad">鼠标垫</option>
                </select>
              </div>
              <div className={styles.field}><label>价格 (¥)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="699" /></div>
              <div className={styles.field}><label>描述</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="商品描述" /></div>
              <div className={styles.field}><label>图片路径</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/zzr-store/images/mouse-m1.svg" /></div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setShowModal(false)}>取消</button>
                <button className={styles.modalSave} onClick={handleSave}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
