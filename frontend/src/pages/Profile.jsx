import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/authContext";
import { Alert, ClubAvatar, EmptyState, Field, PageHeader, StatusBadge, SubmitButton } from "../components/ui";
import { FACULTIES, formatDate, initials } from "../utils/format";

function Profile() {
  const { user, updateUser, accountType } = useAuth();
  const [clubs, setClubs] = useState([]);

  const [form, setForm] = useState({
    name: user.name || "",
    student_id: user.student_id || "",
    faculty: user.faculty || "",
  });
  const [profileMsg, setProfileMsg] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api
      .get("/users/me/clubs")
      .then((res) => setClubs(res.data.clubs))
      .catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({});
    try {
      setSavingProfile(true);
      const res = await api.put("/users/me", form);
      updateUser(res.data.user);
      setProfileMsg({ success: "Profile updated" });
    } catch (err) {
      setProfileMsg({ error: errorMessage(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg({});
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ error: "New passwords do not match" });
      return;
    }
    try {
      setSavingPw(true);
      const res = await api.put("/users/me/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwMsg({ success: res.data.message });
    } catch (err) {
      setPwMsg({ error: errorMessage(err) });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title="My profile" />

      <div className="profile-grid">
        <aside className="card profile-card">
          <div className="avatar xl">{initials(user.name)}</div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <span className={`badge ${user.role === "admin" ? "badge-accent" : "badge-info"}`}>
            {accountType === "club" ? "Club manager" : user.role === "admin" ? "Administrator" : "Student"}
          </span>
          <dl className="profile-facts">
            <div>
              <dt>Registration no.</dt>
              <dd>{user.student_id || "-"}</dd>
            </div>
            <div>
              <dt>Faculty</dt>
              <dd>{user.faculty || "-"}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(user.created_at) || "-"}</dd>
            </div>
          </dl>

          <h3 className="section-title">My clubs</h3>
          {clubs.length ? (
            <ul className="club-mini-list">
              {clubs.map((c) => (
                <li key={c.id}>
                  <Link to={`/clubs/${c.id}`}>
                    <ClubAvatar name={c.name} logoUrl={c.logo_url} size={34} />
                    <div className="club-mini-info">
                      <strong>{c.name}</strong>
                    </div>
                    <StatusBadge status={c.my_status} role={c.my_role} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="clubs" title="No clubs yet" />
          )}
        </aside>

        <div className="profile-forms">
          <form className="card form" onSubmit={saveProfile}>
            <div className="card-header">
              <h2>Personal details</h2>
            </div>
            <Alert type="success">{profileMsg.success}</Alert>
            <Alert>{profileMsg.error}</Alert>
            <Field label="Full name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email" hint="Contact an administrator to change your email.">
              <input value={user.email} disabled />
            </Field>
            <div className="form-row">
              <Field label="Registration no.">
                <input
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  placeholder="EG/2023/1234"
                />
              </Field>
              <Field label="Faculty">
                <select value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                  <option value="">Select faculty</option>
                  {FACULTIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="form-actions">
              <SubmitButton loading={savingProfile}>Save changes</SubmitButton>
            </div>
          </form>

          <form className="card form" onSubmit={changePassword}>
            <div className="card-header">
              <h2>Change password</h2>
            </div>
            <Alert type="success">{pwMsg.success}</Alert>
            <Alert>{pwMsg.error}</Alert>
            <Field label="Current password">
              <input
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                autoComplete="current-password"
              />
            </Field>
            <div className="form-row">
              <Field label="New password">
                <input
                  type="password"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <div className="form-actions">
              <SubmitButton loading={savingPw}>Update password</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
