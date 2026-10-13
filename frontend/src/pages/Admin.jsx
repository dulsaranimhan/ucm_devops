import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/authContext";
import ClubForm from "../components/ClubForm";
import Icon from "../components/Icon";
import { Alert, ClubAvatar, Loader, Modal, PageHeader } from "../components/ui";
import { formatDate, initials } from "../utils/format";

function Admin() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(null);
  const [clubs, setClubs] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(
    () =>
      Promise.all([api.get("/users"), api.get("/clubs")])
        .then(([u, c]) => {
          setUsers(u.data.users);
          setClubs(c.data.clubs);
        })
        .catch((err) => setError(errorMessage(err))),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, message) => {
    setError("");
    setSuccess("");
    try {
      await fn();
      setSuccess(message);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (!users || !clubs) return error ? <Alert>{error}</Alert> : <Loader />;

  const term = search.trim().toLowerCase();
  const visibleUsers = users.filter(
    (u) =>
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.student_id || "").toLowerCase().includes(term)
  );
  const visibleClubs = clubs.filter((c) => !term || c.name.toLowerCase().includes(term));
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administration"
        title="Manage the system"
        subtitle={`${users.length} users · ${adminCount} administrator${adminCount === 1 ? "" : "s"} · ${clubs.length} clubs`}
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Icon name="plus" size={18} /> New club
          </button>
        }
      />

      <Alert onClose={() => setError("")}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess("")}>
        {success}
      </Alert>

      <div className="toolbar">
        <div className="tabs inline" role="tablist">
          <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
            Users <span className="tab-count">{users.length}</span>
          </button>
          <button className={`tab ${tab === "clubs" ? "active" : ""}`} onClick={() => setTab("clubs")}>
            Clubs <span className="tab-count">{clubs.length}</span>
          </button>
        </div>
        <div className="search-box">
          <Icon name="search" size={18} />
          <input
            placeholder={tab === "users" ? "Search by name, email, reg. no..." : "Search clubs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {tab === "users" && (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Registration no.</th>
                <th>Faculty</th>
                <th>Clubs</th>
                <th>Joined</th>
                <th>Role</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="member-identity">
                      <div className="avatar small">{initials(u.name)}</div>
                      <div>
                        <strong>{u.name}</strong>
                        <span className="muted small">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.student_id || "-"}</td>
                  <td>{u.faculty || "-"}</td>
                  <td>{u.club_count}</td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    {u.id === me.id ? (
                      <span className="badge badge-accent">Admin (you)</span>
                    ) : (
                      <select
                        className="select-sm"
                        value={u.role}
                        onChange={(e) =>
                          act(() => api.put(`/users/${u.id}/role`, { role: e.target.value }), `${u.name} is now ${e.target.value === "admin" ? "an administrator" : "a student"}`)
                        }
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="cell-actions">
                    {u.id !== me.id && (
                      <button
                        className="icon-button danger"
                        title="Delete user"
                        aria-label={`Delete ${u.name}`}
                        onClick={() =>
                          window.confirm(`Delete ${u.name}'s account? This cannot be undone.`) &&
                          act(() => api.delete(`/users/${u.id}`), "User deleted")
                        }
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleUsers.length === 0 && <p className="muted table-empty">No users match your search.</p>}
        </div>
      )}

      {tab === "clubs" && (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Club</th>
                <th>Category</th>
                <th>President</th>
                <th>Members</th>
                <th>Upcoming events</th>
                <th>Created</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {visibleClubs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/clubs/${c.id}`} className="member-identity">
                      <ClubAvatar name={c.name} logoUrl={c.logo_url} size={34} />
                      <strong>{c.name}</strong>
                    </Link>
                  </td>
                  <td>
                    <span className="category-tag">{c.category}</span>
                  </td>
                  <td>{c.president_name || <span className="muted">Not assigned</span>}</td>
                  <td>{c.member_count}</td>
                  <td>{c.upcoming_event_count}</td>
                  <td>{formatDate(c.created_at)}</td>
                  <td className="cell-actions">
                    <Link className="icon-button" to={`/clubs/${c.id}`} title="Manage club" aria-label={`Manage ${c.name}`}>
                      <Icon name="edit" size={18} />
                    </Link>
                    <button
                      className="icon-button danger"
                      title="Delete club"
                      aria-label={`Delete ${c.name}`}
                      onClick={() =>
                        window.confirm(`Delete ${c.name}? Its members, events and announcements are removed too.`) &&
                        act(() => api.delete(`/clubs/${c.id}`), "Club deleted")
                      }
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleClubs.length === 0 && <p className="muted table-empty">No clubs match your search.</p>}
        </div>
      )}

      {showCreate && (
        <Modal title="Create a new club" onClose={() => setShowCreate(false)}>
          <ClubForm
            onCancel={() => setShowCreate(false)}
            onSaved={() => {
              setShowCreate(false);
              setTab("clubs");
              setSuccess("Club created");
              load();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default Admin;
