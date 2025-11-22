import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLinkStats } from "../api";
import StatusBanner from "../components/StatusBanner";

function StatsPage() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setStatus(null);
        const data = await getLinkStats(code);
        setLink(data);
      } catch (err) {
        setLink(null);
        setStatus({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stats for <code>{code}</code></h1>
        <p className="page-subtitle">
          View click statistics and metadata for this short link.
        </p>
      </div>

      <Link to="/" className="link-muted">
        ← Back to dashboard
      </Link>

      {status && <StatusBanner type={status.type} message={status.message} />}

      <section className="card" style={{ marginTop: "1rem" }}>
        {loading && <p className="muted">Loading stats…</p>}

        {!loading && !link && !status && (
          <p className="muted">No data available.</p>
        )}

        {!loading && link && (
          <div className="stats-grid">
            <div className="stats-item">
              <div className="stats-label">Short code</div>
              <div className="stats-value"><code>{link.code}</code></div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Target URL</div>
              <div className="stats-value stats-url">{link.url}</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Total clicks</div>
              <div className="stats-value">{link.total_clicks}</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Last clicked</div>
              <div className="stats-value">
                {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "Never"}
              </div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Created at</div>
              <div className="stats-value">
                {new Date(link.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default StatsPage;
