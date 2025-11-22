import React from "react";
import { Link } from "react-router-dom";

// What you want to DISPLAY in the UI (no domain)
const DISPLAY_PREFIX = "TL";

// Where the REAL redirect lives (backend URL)
const REDIRECT_BASE =
  process.env.REACT_APP_BACKEND_REDIRECT_URL || "http://localhost:4000";

function sortIndicator(active, dir) {
  if (!active) return "⇅";
  return dir === "asc" ? "↑" : "↓";
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  } catch (e) {
    alert("Unable to copy link.");
  }
}

function LinksTable({ links, onDelete, onSort, sortBy, sortDir }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => onSort("code")}
              >
                Code {sortIndicator(sortBy === "code", sortDir)}
              </button>
            </th>
            <th>Short link</th>
            <th>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => onSort("created_at")}
              >
                Target URL {sortIndicator(sortBy === "created_at", sortDir)}
              </button>
            </th>
            <th>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => onSort("total_clicks")}
              >
                Clicks {sortIndicator(sortBy === "total_clicks", sortDir)}
              </button>
            </th>
            <th>
              <button
                type="button"
                className="table-sort-btn"
                onClick={() => onSort("last_clicked")}
              >
                Last clicked {sortIndicator(sortBy === "last_clicked", sortDir)}
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((link) => {
            // What user SEES in the table
            const displayShort = `${DISPLAY_PREFIX}/${link.code}`;

            // What actually works when opened/clicked/copied
            const actualShort = `${REDIRECT_BASE}/${link.code}`;

            return (
              <tr key={link.code}>
                <td>
                  <Link to={`/code/${link.code}`} className="code-pill">
                    {link.code}
                  </Link>
                </td>

                <td>
                  <div className="short-url-cell">
                    {/* Clickable short link that OPENS the real backend URL */}
                    <a
                      href={actualShort}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-url-text"
                      title={actualShort}
                    >
                      {displayShort}
                    </a>

                    {/* Copy button copies the REAL working URL */}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => copyToClipboard(actualShort)}
                    >
                      Copy
                    </button>
                  </div>
                </td>

                <td>
                  <span className="truncate" title={link.url}>
                    {link.url}
                  </span>
                </td>

                <td>{link.total_clicks}</td>
                <td>
                  {link.last_clicked
                    ? new Date(link.last_clicked).toLocaleString()
                    : "Never"}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-xs"
                    onClick={() => onDelete(link.code)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LinksTable;
