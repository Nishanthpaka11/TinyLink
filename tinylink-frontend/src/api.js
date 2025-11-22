const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

// 🔁 flip this to false once backend is ready
const USE_MOCK = false;

// sample mock data
let mockLinks = [
  {
    code: "abc123",
    url: "https://example.com/landing-page",
    total_clicks: 12,
    last_clicked: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
  },
  {
    code: "xyz789",
    url: "https://github.com/",
    total_clicks: 3,
    last_clicked: null,
    created_at: new Date().toISOString(),
  },
];

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listLinks() {
  if (USE_MOCK) {
    await delay();
    return [...mockLinks];
  }

  const res = await fetch(`${API_BASE}/api/links`);
  if (!res.ok) throw new Error("Failed to load links");
  return res.json();
}

export async function createLink(payload) {
  if (USE_MOCK) {
    await delay();
    const { url, code } = payload;

    if (!url) throw new Error("URL is required");

    let finalCode = code || Math.random().toString(36).slice(2, 8);

    // ensure unique
    if (mockLinks.some((l) => l.code === finalCode)) {
      throw new Error("Code already exists (mock)");
    }

    const newItem = {
      code: finalCode,
      url,
      total_clicks: 0,
      last_clicked: null,
      created_at: new Date().toISOString(),
    };
    mockLinks = [newItem, ...mockLinks];
    return newItem;
  }

  const res = await fetch(`${API_BASE}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 409) {
    const msg = await res.text();
    throw new Error(msg || "Code already exists");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create link");
  }

  return res.json();
}

export async function deleteLink(code) {
  if (USE_MOCK) {
    await delay();
    mockLinks = mockLinks.filter((l) => l.code !== code);
    return;
  }

  const res = await fetch(`${API_BASE}/api/links/${code}`, {
    method: "DELETE",
  });
  if (res.status === 404) throw new Error("Link not found");
  if (!res.ok) throw new Error("Failed to delete link");
}

export async function getLinkStats(code) {
  if (USE_MOCK) {
    await delay();
    const item = mockLinks.find((l) => l.code === code);
    if (!item) {
      throw new Error("Link not found");
    }
    return item;
  }

  const res = await fetch(`${API_BASE}/api/links/${code}`);
  if (res.status === 404) throw new Error("Link not found");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}
