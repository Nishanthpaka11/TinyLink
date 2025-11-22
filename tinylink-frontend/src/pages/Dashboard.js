import React, { useEffect, useMemo, useState } from "react";
import LinkForm from "../components/LinkForm";
import LinksTable from "../components/LinksTable";
import StatusBanner from "../components/StatusBanner";
import { listLinks, createLink, deleteLink } from "../api";

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const loadLinks = async () => {
    try {
      setInitialLoading(true);
      const data = await listLinks();
      setLinks(data);
      setStatus(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleCreate = async (payload) => {
    try {
      setLoading(true);
      setStatus(null);
      await createLink(payload);
      await loadLinks();
      setStatus({ type: "success", message: "Short link created successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete link with code "${code}"?`)) return;
    try {
      setLoading(true);
      setStatus(null);
      await deleteLink(code);
      await loadLinks();
      setStatus({ type: "success", message: "Link deleted." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSortClick = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const filteredAndSortedLinks = useMemo(() => {
    const q = search.toLowerCase();
    let result = links.filter(
      (link) =>
        link.code.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q)
    );

    result = result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "code") {
        return a.code.localeCompare(b.code) * dir;
      }
      if (sortBy === "total_clicks") {
        return (a.total_clicks - b.total_clicks) * dir;
      }
      if (sortBy === "last_clicked") {
        return (new Date(a.last_clicked || 0) - new Date(b.last_clicked || 0)) * dir;
      }
      // default: created_at
      return (new Date(a.created_at) - new Date(b.created_at)) * dir;
    });

    return result;
  }, [links, search, sortBy, sortDir]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">
          Create, manage, and monitor your short links.
        </p>
      </div>

      {status && <StatusBanner type={status.type} message={status.message} />}

      <section className="card">
        <h2>Create short link</h2>
        <LinkForm onCreate={handleCreate} disabled={loading} />
      </section>

      <section className="card">
        <div className="card-header-row">
          <h2>All links</h2>
          <input
            type="text"
            className="input"
            placeholder="Search by code or URL"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {initialLoading ? (
          <p className="muted">Loading links…</p>
        ) : filteredAndSortedLinks.length === 0 ? (
          <p className="muted">
            No links found. Create your first short link above.
          </p>
        ) : (
          <LinksTable
            links={filteredAndSortedLinks}
            onDelete={handleDelete}
            onSort={handleSortClick}
            sortBy={sortBy}
            sortDir={sortDir}
          />
        )}
      </section>
    </div>
  );
}

export default Dashboard;
