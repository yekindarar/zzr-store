import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, sendCode, resetPassword } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async () => {
    if (!email) { setError('请先输入邮箱'); return; }
    setCodeSending(true);
    setError('');
    const ok = await sendCode(email);
    setCodeSending(false);
    if (ok) {
      setCodeSent(true);
      setSuccess('验证码已发送到邮箱');
    } else {
      setError('验证码发送失败，请稍后重试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tab === 'register') {
      if (!name || !email || !code || !password) {
        setError('请填写所有字段');
        return;
      }
      if (password.length < 6) {
        setError('密码至少6位');
        return;
      }
      const ok = await register(email, password, name, code);
      if (ok) {
        setSuccess('注册成功！');
        setTimeout(() => navigate('/account'), 800);
      } else {
        setError('该邮箱已被注册');
      }
      return;
    }

    if (tab === 'reset') {
      if (!email || !code || !password) {
        setError('请填写所有字段');
        return;
      }
      if (password.length < 6) {
        setError('密码至少6位');
        return;
      }
      const ok = await resetPassword(email, code, password);
      if (ok) {
        setSuccess('密码已重置，请登录');
        setTimeout(() => setTab('login'), 1500);
      } else {
        setError('验证码错误或已过期');
      }
      return;
    }

    // login
    if (!email || !password) {
      setError('请填写所有必填项');
      return;
    }
    const ok = await login(email, password);
    if (ok) {
      navigate('/account');
    } else {
      setError('邮箱或密码错误');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <svg className={styles.logo} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 26 L46 26 L18 38 L46 38" stroke="#c0a060" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <h1 className={styles.title}>账号</h1>
          <p className={styles.subtitle}>
            {tab === 'login' && '登录 ZZR 账号'}
            {tab === 'register' && '注册新账号'}
            {tab === 'reset' && '重置密码'}
          </p>
        </div>

        {tab !== 'reset' && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setTab('login'); setError(''); setSuccess(''); setCodeSent(false); setCode(''); }}
            >
              登录
            </button>
            <button
              className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
              onClick={() => { setTab('register'); setError(''); setSuccess(''); setCodeSent(false); setCode(''); }}
            >
              注册
            </button>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className={styles.field}>
              <label>用户名</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="你的名字" />
            </div>
          )}

          <div className={styles.field}>
            <label>邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          {(tab === 'register' || tab === 'reset') && (
            <div className={styles.field}>
              <label>验证码</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6位验证码" style={{ flex: 1 }} />
                <button type="button" className={styles.codeBtn} onClick={handleSendCode} disabled={codeSending}>
                  {codeSending ? '发送中' : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label>{tab === 'reset' ? '新密码' : '密码'}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'register' ? '至少6位密码' : tab === 'reset' ? '至少6位新密码' : '输入密码'} />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" className={styles.submitBtn}>
            {tab === 'login' && '登录'}
            {tab === 'register' && '注册'}
            {tab === 'reset' && '重置密码'}
          </button>

          {tab === 'login' && (
            <button type="button" className={styles.forgotBtn} onClick={() => { setTab('reset'); setError(''); setSuccess(''); setPassword(''); setCode(''); setCodeSent(false); }}>
              忘记密码？
            </button>
          )}

          {tab === 'reset' && (
            <button type="button" className={styles.forgotBtn} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
              返回登录
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
