import { FormEvent, useState } from 'react';
import { MOCK_USERS } from '../data/users';
import { useAuth } from '../state/auth';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) setError('Incorrect username or password.');
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="login-screen">
      <div className="login-card card">
        <div className="brand" style={{ padding: 0, marginBottom: 20, border: 'none' }}>
          <div className="mark" style={{ color: 'var(--ink)' }}>
            Vyapaar<span>•</span>
          </div>
          <div className="sub" style={{ color: 'var(--ink-soft)' }}>Wholesale + Retail Billing Suite</div>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin" autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error ? <div className="login-error">{error}</div> : null}
          <button className="btn primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Sign in
          </button>
        </form>

        <div className="login-demo">
          <div className="login-demo-label">Demo credentials</div>
          {MOCK_USERS.map((u) => (
            <button key={u.username} type="button" className="login-demo-row" onClick={() => fillDemo(u.username, u.password)}>
              <span>
                <span className="mono">{u.username}</span> / <span className="mono">{u.password}</span>
              </span>
              <span className="badge muted">{u.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
