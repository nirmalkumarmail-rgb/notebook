import { useState } from 'react';
import './admin.css';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export default function Admin() {
  const [key, setKey] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/admin/stats?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-heading">App Stats</h1>

        {!stats && (
          <form onSubmit={fetchStats} className="admin-form">
            <input
              type="password"
              placeholder="Admin key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="admin-input"
              autoFocus
            />
            <button type="submit" className="admin-btn" disabled={loading || !key}>
              {loading ? 'Loading…' : 'View Stats'}
            </button>
            {error && <p className="admin-error">{error}</p>}
          </form>
        )}

        {stats && (
          <>
            <div className="stat-grid">
              <StatCard label="Total Users" value={stats.users.total} />
              <StatCard label="New Today" value={stats.users.today} />
              <StatCard label="New This Week" value={stats.users.thisWeek} />
              <StatCard label="Active This Week" value={stats.users.activeThisWeek} sub="(wrote a note)" />
              <StatCard label="Total Notes" value={stats.notes.total} />
            </div>

            {stats.users.list?.length > 0 && (
              <div className="admin-section">
                <h2 className="admin-subheading">All users</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Email</th><th>Joined</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {stats.users.list.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td>{u.email}</td>
                        <td>{u.joined}</td>
                        <td>{u.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {stats.users.perDay.length > 0 && (
              <div className="admin-section">
                <h2 className="admin-subheading">New signups — last 30 days</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>Date</th><th>New Users</th></tr>
                  </thead>
                  <tbody>
                    {stats.users.perDay.map((r) => (
                      <tr key={r.day}>
                        <td>{r.day}</td>
                        <td>{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="admin-btn admin-btn-secondary" onClick={() => { setStats(null); setKey(''); }}>
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
