import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/authContext";
import ClubForm from "../components/ClubForm";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import Icon from "../components/Icon";
import {
  Alert,
  ClubAvatar,
  EmptyState,
  Field,
  Loader,
  Modal,
  StatusBadge,
  SubmitButton,
} from "../components/ui";
import { formatDate, formatDateTime, initials, timeAgo } from "../utils/format";

function ClubDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("events");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // modals
  const [eventModal, setEventModal] = useState(null); // {} = new, event = edit
  const [attendeesFor, setAttendeesFor] = useState(null);
  const [attendees, setAttendees] = useState(null);

  const load = useCallback(
    () =>
      Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/clubs/${id}/events`),
        api.get(`/clubs/${id}/announcements`),
        api.get(`/clubs/${id}/members`),
      ])
        .then(([c, e, a, m]) => {
          setClub(c.data.club);
          setEvents(e.data.events);
          setAnnouncements(a.data.announcements);
          setMembers(m.data.members);
        })
        .catch((err) => {
          if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true);
          else setError(errorMessage(err));
        }),
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, okMessage) => {
    setError("");
    setSuccess("");
    try {
      setBusy(true);
      const res = await fn();
      setSuccess(okMessage || res?.data?.message || "Done");
      await load();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <EmptyState
        icon="search"
        title="Club not found"
        action={
          <Link className="btn btn-primary" to="/clubs">
            Back to clubs
          </Link>
        }
      >
        This club may have been removed.
      </EmptyState>
    );
  }
  if (!club) return error ? <Alert>{error}</Alert> : <Loader />;

  const canManage = club.can_manage;
  const canChangeRoles = isAdmin || (club.my_role === "president" && club.my_status === "approved");
  const approved = members.filter((m) => m.status === "approved");
  const pending = members.filter((m) => m.status === "pending");
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.event_date.replace(" ", "T")) >= now);
  const past = events.filter((e) => new Date(e.event_date.replace(" ", "T")) < now).reverse();

  const tabs = [
    { key: "events", label: "Events", count: upcoming.length },
    { key: "announcements", label: "Announcements", count: announcements.length },
    { key: "members", label: "Members", count: approved.length, alert: canManage ? pending.length : 0 },
    ...(canManage ? [{ key: "settings", label: "Settings" }] : []),
  ];

  const openAttendees = async (event) => {
    setAttendeesFor(event);
    setAttendees(null);
    try {
      const res = await api.get(`/events/${event.id}/attendees`);
      setAttendees(res.data.attendees);
    } catch (err) {
      setAttendeesFor(null);
      setError(errorMessage(err));
    }
  };

  return (
    <div className="page">
      <Link to="/clubs" className="back-link">
        <Icon name="arrowLeft" size={16} /> All clubs
      </Link>

      {/* ---------- Club header ---------- */}
      <section className="club-hero">
        <div className="club-hero-main">
          <ClubAvatar name={club.name} logoUrl={club.logo_url} size={84} />
          <div className="club-hero-text">
            <div className="club-hero-tags">
              <span className="category-tag on-dark">{club.category}</span>
              <StatusBadge status={club.my_status} role={club.my_role} />
            </div>
            <h1>{club.name}</h1>
            <p>{club.description}</p>
            <div className="club-hero-meta">
              <span>
                <Icon name="users" size={16} /> {club.member_count} member{Number(club.member_count) === 1 ? "" : "s"}
              </span>
              {club.president_name && (
                <span>
                  <Icon name="user" size={16} /> President: {club.president_name}
                </span>
              )}
              {club.contact_email && (
                <a href={`mailto:${club.contact_email}`}>
                  <Icon name="mail" size={16} /> {club.contact_email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="club-hero-actions">
          {(!club.my_status || club.my_status === "rejected") && (
            <button className="btn btn-accent" disabled={busy} onClick={() => run(() => api.post(`/clubs/${club.id}/join`))}>
              <Icon name="plus" size={18} /> Join club
            </button>
          )}
          {club.my_status === "pending" && (
            <button
              className="btn btn-outline-light"
              disabled={busy}
              onClick={() => run(() => api.delete(`/clubs/${club.id}/leave`))}
            >
              Cancel request
            </button>
          )}
          {club.my_status === "approved" && club.my_role !== "president" && (
            <button
              className="btn btn-outline-light"
              disabled={busy}
              onClick={() =>
                window.confirm(`Leave ${club.name}?`) && run(() => api.delete(`/clubs/${club.id}/leave`))
              }
            >
              Leave club
            </button>
          )}
        </div>
      </section>

      <Alert onClose={() => setError("")}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess("")}>
        {success}
      </Alert>

      {/* ---------- Tabs ---------- */}
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count !== undefined && <span className="tab-count">{t.count}</span>}
            {t.alert > 0 && <span className="tab-alert">{t.alert}</span>}
          </button>
        ))}
      </div>

      {/* ---------- Events ---------- */}
      {tab === "events" && (
        <section>
          {canManage && (
            <div className="section-actions">
              <button className="btn btn-primary" onClick={() => setEventModal({})}>
                <Icon name="plus" size={18} /> New event
              </button>
            </div>
          )}

          {events.length === 0 ? (
            <EmptyState icon="calendar" title="No events yet">
              {canManage ? "Create the first event for your club." : "This club hasn't posted any events yet."}
            </EmptyState>
          ) : (
            <>
              <div className="event-list">
                {upcoming.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    showClub={false}
                    onChange={load}
                    onError={setError}
                    actions={
                      canManage && (
                        <ManageEventButtons
                          onAttendees={() => openAttendees(ev)}
                          onEdit={() => setEventModal(ev)}
                          onDelete={() =>
                            window.confirm(`Delete "${ev.title}"?`) && run(() => api.delete(`/events/${ev.id}`))
                          }
                        />
                      )
                    }
                  />
                ))}
              </div>
              {upcoming.length === 0 && <p className="muted">No upcoming events.</p>}

              {past.length > 0 && (
                <>
                  <h3 className="section-title">Past events</h3>
                  <div className="event-list">
                    {past.map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        showClub={false}
                        actions={
                          canManage && (
                            <ManageEventButtons
                              onAttendees={() => openAttendees(ev)}
                              onDelete={() =>
                                window.confirm(`Delete "${ev.title}"?`) && run(() => api.delete(`/events/${ev.id}`))
                              }
                            />
                          )
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}

      {/* ---------- Announcements ---------- */}
      {tab === "announcements" && (
        <section className="two-col">
          <div>
            {announcements.length === 0 ? (
              <EmptyState icon="megaphone" title="No announcements yet" />
            ) : (
              <ul className="announcement-list">
                {announcements.map((a) => (
                  <li key={a.id} className="card announcement">
                    <div className="announcement-head">
                      <div>
                        <strong>{a.title}</strong>
                        <span className="muted">
                          {a.author_name || "Club"} · {timeAgo(a.created_at)}
                        </span>
                      </div>
                      {canManage && (
                        <button
                          className="icon-button danger"
                          title="Delete announcement"
                          aria-label="Delete announcement"
                          onClick={() =>
                            window.confirm("Delete this announcement?") &&
                            run(() => api.delete(`/announcements/${a.id}`))
                          }
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      )}
                    </div>
                    <p>{a.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {canManage && (
            <AnnouncementForm
              onSubmit={(data) => run(() => api.post(`/clubs/${club.id}/announcements`, data))}
              busy={busy}
            />
          )}
        </section>
      )}

      {/* ---------- Members ---------- */}
      {tab === "members" && (
        <section>
          {canManage && pending.length > 0 && (
            <div className="card pending-card">
              <div className="card-header">
                <h2>Join requests</h2>
                <span className="badge badge-warning">{pending.length} pending</span>
              </div>
              <ul className="member-list">
                {pending.map((m) => (
                  <li key={m.membership_id}>
                    <MemberIdentity member={m} />
                    <span className="muted small">Requested {formatDate(m.joined_at)}</span>
                    <div className="row-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={busy}
                        onClick={() =>
                          run(() => api.put(`/clubs/${club.id}/members/${m.user_id}`, { status: "approved" }), `${m.name} approved`)
                        }
                      >
                        <Icon name="check" size={16} /> Approve
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={busy}
                        onClick={() =>
                          run(() => api.put(`/clubs/${club.id}/members/${m.user_id}`, { status: "rejected" }), "Request rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2>Members</h2>
              <span className="muted">{approved.length} total</span>
            </div>
            {approved.length === 0 ? (
              <EmptyState icon="users" title="No members yet" />
            ) : (
              <ul className="member-list">
                {approved.map((m) => (
                  <li key={m.membership_id}>
                    <MemberIdentity member={m} you={m.user_id === user.id} />
                    <span className="muted small">Since {formatDate(m.joined_at)}</span>
                    <div className="row-actions">
                      {canChangeRoles && m.user_id !== user.id && (m.role !== "president" || isAdmin) ? (
                        <select
                          className="select-sm"
                          value={m.role}
                          disabled={busy}
                          onChange={(e) => {
                            const role = e.target.value;
                            if (role === "president" && !window.confirm(`Make ${m.name} the club president? The current president becomes an officer.`)) return;
                            run(() => api.put(`/clubs/${club.id}/members/${m.user_id}`, { role }), "Role updated");
                          }}
                        >
                          <option value="member">Member</option>
                          <option value="officer">Officer</option>
                          <option value="president">President</option>
                        </select>
                      ) : (
                        <StatusBadge status="approved" role={m.role} />
                      )}
                      {canManage && m.user_id !== user.id && (m.role !== "president" || isAdmin) && (
                        <button
                          className="icon-button danger"
                          title="Remove member"
                          aria-label={`Remove ${m.name}`}
                          disabled={busy}
                          onClick={() =>
                            window.confirm(`Remove ${m.name} from the club?`) &&
                            run(() => api.delete(`/clubs/${club.id}/members/${m.user_id}`), "Member removed")
                          }
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ---------- Settings ---------- */}
      {tab === "settings" && canManage && (
        <section className="two-col">
          <div className="card">
            <div className="card-header">
              <h2>Club details</h2>
            </div>
            <ClubForm
              key={club.id + club.name}
              club={club}
              onSaved={() => {
                setSuccess("Club details saved");
                load();
              }}
            />
          </div>
          {isAdmin && (
            <div className="card danger-zone">
              <h2>Danger zone</h2>
              <p>Deleting a club permanently removes its members, events and announcements.</p>
              <button
                className="btn btn-danger"
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm(`Delete ${club.name}? This cannot be undone.`)) return;
                  try {
                    await api.delete(`/clubs/${club.id}`);
                    navigate("/clubs");
                  } catch (err) {
                    setError(errorMessage(err));
                  }
                }}
              >
                <Icon name="trash" size={18} /> Delete club
              </button>
            </div>
          )}
        </section>
      )}

      {/* ---------- Modals ---------- */}
      {eventModal && (
        <Modal title={eventModal.id ? "Edit event" : "New event"} onClose={() => setEventModal(null)}>
          <EventForm
            clubId={club.id}
            event={eventModal.id ? eventModal : null}
            onCancel={() => setEventModal(null)}
            onSaved={() => {
              setSuccess(eventModal.id ? "Event updated" : "Event created");
              setEventModal(null);
              load();
            }}
          />
        </Modal>
      )}

      {attendeesFor && (
        <Modal title={`Attendees · ${attendeesFor.title}`} onClose={() => setAttendeesFor(null)}>
          <p className="muted">{formatDateTime(attendeesFor.event_date)}</p>
          {!attendees ? (
            <Loader />
          ) : attendees.length === 0 ? (
            <EmptyState icon="users" title="No one has registered yet" />
          ) : (
            <ul className="member-list compact">
              {attendees.map((a) => (
                <li key={a.id}>
                  <MemberIdentity member={a} />
                  <span className="muted small">{a.email}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

function MemberIdentity({ member, you }) {
  return (
    <div className="member-identity">
      <div className="avatar small">{initials(member.name)}</div>
      <div>
        <strong>
          {member.name} {you && <span className="muted">(you)</span>}
        </strong>
        <span className="muted small">
          {[member.student_id, member.faculty].filter(Boolean).join(" · ") || member.email || ""}
        </span>
      </div>
    </div>
  );
}

function ManageEventButtons({ onAttendees, onEdit, onDelete }) {
  return (
    <div className="manage-buttons">
      <button className="icon-button" title="View attendees" aria-label="View attendees" onClick={onAttendees}>
        <Icon name="users" size={18} />
      </button>
      {onEdit && (
        <button className="icon-button" title="Edit event" aria-label="Edit event" onClick={onEdit}>
          <Icon name="edit" size={18} />
        </button>
      )}
      <button className="icon-button danger" title="Delete event" aria-label="Delete event" onClick={onDelete}>
        <Icon name="trash" size={18} />
      </button>
    </div>
  );
}

function AnnouncementForm({ onSubmit, busy }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const ok = await onSubmit({ title, content });
    if (ok) {
      setTitle("");
      setContent("");
    }
  };

  return (
    <form className="card form sticky-card" onSubmit={submit}>
      <div className="card-header">
        <h2>Post an announcement</h2>
      </div>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Meeting moved to Friday" />
      </Field>
      <Field label="Message">
        <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your message to members..." />
      </Field>
      <div className="form-actions">
        <SubmitButton loading={busy}>
          <Icon name="megaphone" size={18} /> Post
        </SubmitButton>
      </div>
    </form>
  );
}

export default ClubDetails;
