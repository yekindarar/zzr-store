import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import layoutStyles from './AdminLayout.module.css';
import styles from './AdminProducts.module.css';

export default function AdminUsers() {
  const { user: currentUser, adminUpdateUser, adminCreateUser, adminDeleteUser, getAllUsers } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', name: '', role: 'user' });

  const [error, setError] = useState('');

  const refresh = async () => {
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      setError('加载用户失败：' + (e instanceof Error ? e.message : '未知错误'));
    }
  };

  useEffect(() => { refresh(); }, []);

  const openEdit = (u: any) => {
    setEditing(u);
    setEditName(u.name);
    setEditRole(u.role);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await adminUpdateUser(editing.id, { name: editName, role: editRole });
      setEditing(null);
      refresh();
    } catch {
      alert('保存失败');
    }
  };

  const handleAdd = async () => {
    if (!addForm.email || !addForm.password || !addForm.name) {
      alert('请填写所有字段');
      return;
    }
    try {
      await adminCreateUser(addForm);
      setShowAdd(false);
      setAddForm({ email: '', password: '', name: '', role: 'user' });
      refresh();
    } catch {
      alert('添加失败，邮箱可能已被注册');
    }
  };

  const canManage = currentUser?.role === 'owner';

  const handleDelete = async (id: string, email: string, role: string) => {
    if (role === 'owner') {
      alert('不能删除老板账号');
      return;
    }
    if (!canManage && role === 'admin') {
      alert('无权删除管理员账号');
      return;
    }
    if (confirm('确定删除该用户？')) {
      try {
        await adminDeleteUser(id);
        refresh();
      } catch {
        alert('删除失败');
      }
    }
  };

  return (
    <div>
      <div className={layoutStyles.header}>
        <h1 className={layoutStyles.headerTitle}>用户管理</h1>
        <p className={layoutStyles.headerSub}>共 {users.length} 个用户</p>
      </div>

      {error && <p style={{ color: '#d32f2f', fontSize: 13, padding: '0 0 16px', textAlign: 'center' }}>{error}</p>}

      <div className={styles.toolbar}>
        <div />
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ 添加用户</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['用户', '邮箱', '角色', '注册时间', '操作'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 11, letterSpacing: 0.5, borderBottom: '1px solid var(--border)', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{u.name}</td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{u.email}</td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: u.role === 'owner' ? '#fce4ec' : u.role === 'admin' ? '#e8f5e9' : '#f5f5f5',
                  color: u.role === 'owner' ? '#c62828' : u.role === 'admin' ? '#2e7d32' : 'var(--text-secondary)',
                }}>
                  {u.role === 'owner' ? '老板' : u.role === 'admin' ? '管理员' : '用户'}
                </span>
              </td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12 }}>
                {new Date(u.created_at).toLocaleDateString('zh-CN')}
              </td>
              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <button className={styles.actionBtn} onClick={() => openEdit(u)}>编辑</button>
                {(canManage || u.role !== 'admin') && u.role !== 'owner' && (
                  <button className={styles.deleteBtn} onClick={() => handleDelete(u.id, u.email, u.role)}>删除</button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>暂无用户</td></tr>
          )}
        </tbody>
      </table>

      {/* 编辑弹窗 */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>编辑用户</h2>
            <div className={styles.form}>
              <div className={styles.field}><label>用户名</label><input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
              <div className={styles.field}><label>角色</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
                  <option value="user">用户</option>
                  <option value="admin">管理员</option>
                  {currentUser?.role === 'owner' && <option value="owner">老板</option>}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setEditing(null)}>取消</button>
                <button className={styles.modalSave} onClick={handleSave}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加用户弹窗 */}
      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>添加用户</h2>
            <div className={styles.form}>
              <div className={styles.field}><label>邮箱</label><input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="user@email.com" /></div>
              <div className={styles.field}><label>密码</label><input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="初始密码" /></div>
              <div className={styles.field}><label>用户名</label><input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="姓名" /></div>
              <div className={styles.field}><label>角色</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
                  <option value="user">用户</option>
                  <option value="admin">管理员</option>
                  {currentUser?.role === 'owner' && <option value="owner">老板</option>}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setShowAdd(false)}>取消</button>
                <button className={styles.modalSave} onClick={handleAdd}>创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
