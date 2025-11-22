import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StatsPage from "./pages/Statspage"; // 👈 make sure file is StatsPage.js
import HealthBadge from "./components/HealthBadge";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          {/* Left side: logo + nav */}
          <div className="header-left">
            <Link to="/" className="logo">
              TinyLink
            </Link>
            <nav className="nav-links">
              <Link to="/">Dashboard</Link>
            </nav>
          </div>

          {/* Right side: health badge */}
          <HealthBadge />
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/code/:code" element={<StatsPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>TinyLink &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
