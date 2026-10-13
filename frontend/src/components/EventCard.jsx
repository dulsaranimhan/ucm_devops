import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { formatTime, toDate } from "../utils/format";
import Icon from "./Icon";

// One event row with a date block and Register / Cancel button.
// `onChange` is called after registering so the parent can reload.
export default function EventCard({ event, onChange, onError, showClub = true, actions }) {
  const [busy, setBusy] = useState(false);
  const date = toDate(event.event_date);
  const isPast = date && date < new Date();
  const registered = Number(event.is_registered) > 0;
  const count = Number(event.registered_count) || 0;
  const full = event.capacity && count >= event.capacity;

  const toggle = async () => {
    try {
      setBusy(true);
      if (registered) await api.delete(`/events/${event.id}/register`);
      else await api.post(`/events/${event.id}/register`);
      onChange?.();
    } catch (err) {
      onError?.(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`event-card ${isPast ? "past" : ""}`}>
      <div className="date-block">
        <span className="date-month">{date?.toLocaleDateString("en-US", { month: "short" })}</span>
        <span className="date-day">{date?.getDate()}</span>
        <span className="date-weekday">{date?.toLocaleDateString("en-US", { weekday: "short" })}</span>
      </div>

      <div className="event-body">
        {showClub && event.club_name && (
          <Link to={`/clubs/${event.club_id}`} className="event-club">
            {event.club_name}
          </Link>
        )}
        <h3>{event.title}</h3>
        {event.description && <p className="event-description">{event.description}</p>}
        <div className="event-meta">
          <span>
            <Icon name="clock" size={15} /> {formatTime(event.event_date)}
          </span>
          {event.venue && (
            <span>
              <Icon name="pin" size={15} /> {event.venue}
            </span>
          )}
          <span>
            <Icon name="users" size={15} /> {count}
            {event.capacity ? ` / ${event.capacity}` : ""} going
          </span>
        </div>
      </div>

      <div className="event-actions">
        {actions}
        {isPast ? (
          <span className="badge badge-muted">Ended</span>
        ) : registered ? (
          <button className="btn btn-registered" onClick={toggle} disabled={busy}>
            <Icon name="check" size={16} /> <span>Going</span>
          </button>
        ) : (
          <button className="btn btn-primary" onClick={toggle} disabled={busy || Boolean(full)}>
            {full ? "Full" : "Register"}
          </button>
        )}
      </div>
    </article>
  );
}
