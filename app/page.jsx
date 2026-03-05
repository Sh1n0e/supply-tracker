"use client";

import { useState, useEffect, useCallback } from "react";

// Icons --> Keeping inline as using dependencies has given plenty of headaches
const Icon = {
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  ),
  Warn: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const LOCATION_EMOJI = {
  Fridge: "❄️", Pantry: "🪴", Freezer: "🧊",
};
const getLocationEmoji = (name) => LOCATION_EMOJI[name] || "📦";

// Item form 
function ItemModal({ item, locations, categories, activeLocationId, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    quantity: item?.quantity ?? "",
    unit: item?.unit ?? "item",
    par_level: item?.par_level ?? "",
    location_id: item?.location_id ?? activeLocationId ?? "",
    category_id: item?.category_id ?? "",
    expiry_date: item?.expiry_date ? item.expiry_date.split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.quantity || !form.location_id) {
      setError("Name, quantity and location are required.");
      return;
    }
    setSaving(true);
    try {
      const url = item ? `/api/items/${item.item_id}` : "/api/items";
      const method = item ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          par_level: form.par_level !== "" ? Number(form.par_level) : null,
          location_id: Number(form.location_id),
          category_id: form.category_id !== "" ? Number(form.category_id) : null,
          expiry_date: form.expiry_date || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      onSave(saved);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{item ? "Edit Item" : "Add Item"}</h2>
          <button style={styles.iconBtn} onClick={onClose}><Icon.Close /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <label style={styles.label}>Name *</label>
          <input style={styles.input} value={form.name} onChange={set("name")} placeholder="e.g. Whole Milk" autoFocus />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={styles.label}>Quantity *</label>
              <input style={styles.input} type="number" min="0" step="any" value={form.quantity} onChange={set("quantity")} placeholder="0" />
            </div>
            <div>
              <label style={styles.label}>Unit</label>
              <input style={styles.input} value={form.unit} onChange={set("unit")} placeholder="item" />
            </div>
          </div>

          <label style={styles.label}>Par Level <span style={{ color: "#888", fontWeight: 400 }}>(restock when below)</span></label>
          <input style={styles.input} type="number" min="0" step="any" value={form.par_level} onChange={set("par_level")} placeholder="e.g. 1" />

          <label style={styles.label}>Expiry Date</label>
          <input style={styles.input} type="date" value={form.expiry_date} onChange={set("expiry_date")} />

          <label style={styles.label}>Location *</label>
          <select style={styles.input} value={form.location_id} onChange={set("location_id")}>
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
            ))}
          </select>

          <label style={styles.label}>Category</label>
          <select style={styles.input} value={form.category_id} onChange={set("category_id")}>
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>

          <div style={styles.modalActions}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnPrimary} disabled={saving}>
              {saving ? "Saving…" : item ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete item form
function DeleteModal({ item, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/items/${item.item_id}`, { method: "DELETE" });
    onConfirm(item.item_id);
  }
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 380 }}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Delete Item</h2>
          <button style={styles.iconBtn} onClick={onClose}><Icon.Close /></button>
        </div>
        <p style={{ color: "#ccc", marginBottom: 24 }}>
          Remove <strong style={{ color: "#fff" }}>{item.name}</strong> from {item.location_name}? This can't be undone.
        </p>
        <div style={styles.modalActions}>
          <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.btnPrimary, background: "#c0392b" }} onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatExpiry(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}

// Card for items
function ItemCard({ item, onEdit, onDelete }) {
  const isLow = item.par_level != null && Number(item.quantity) <= Number(item.par_level);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = item.expiry_date ? new Date(item.expiry_date.split("T")[0] + "T00:00:00") : null;
  const daysLeft = expiryDate ? Math.round((expiryDate - today) / 86400000) : null;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  const borderColor = isExpired ? "#e74c3c" : (isLow || isExpiringSoon) ? "#e67e22" : "transparent";

  return (
    <div style={{ ...styles.card, borderColor }}>
      <div style={styles.cardTop}>
        <span style={styles.itemName}>{item.name}</span>
        <div style={styles.cardActions}>
          <button style={styles.cardBtn} onClick={() => onEdit(item)} title="Edit"><Icon.Edit /></button>
          <button style={{ ...styles.cardBtn, color: "#e74c3c" }} onClick={() => onDelete(item)} title="Delete"><Icon.Trash /></button>
        </div>
      </div>
      <div style={styles.cardBottom}>
        <span style={styles.qty}>{item.quantity} <span style={styles.unit}>{item.unit}</span></span>
        {isExpired && (
          <span style={styles.expiredBadge}>
            <Icon.Warn /> Expired
          </span>
        )}
        {!isExpired && isLow && (
          <span style={styles.lowBadge}>
            <Icon.Warn /> Low stock
          </span>
        )}
      </div>
      {item.expiry_date && (
        <div style={styles.expiryRow}>
          <span style={{ color: isExpired ? "#e74c3c" : isExpiringSoon ? "#e67e22" : "#555" }}>
            {isExpired ? "Expired" : isExpiringSoon ? `${daysLeft}d left` : "Expires"} · {formatExpiry(item.expiry_date.split("T")[0])}
          </span>
        </div>
      )}
    </div>
  );
}

// App design
export default function KitchenTracker() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type: "add" | "edit" | "delete", item? }
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch reference data once
  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([locs, cats]) => {
      setLocations(locs);
      setCategories(cats);
      if (locs.length) setActiveLocationId(locs[0].location_id);
    });
  }, []);

  // Fetch items when active location changes
  const fetchItems = useCallback(async () => {
    if (!activeLocationId) return;
    setLoading(true);
    const res = await fetch(`/api/items?location_id=${activeLocationId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [activeLocationId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const key = item.category_name || "Uncategorised";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const activeLocation = locations.find((l) => l.location_id === activeLocationId);

  function handleSaved(savedItem) {
    fetchItems();
    setModal(null);
  }

  function handleDeleted(id) {
    setItems((prev) => prev.filter((i) => i.item_id !== id));
    setModal(null);
  }

  const lowCount = items.filter(
    (i) => i.par_level != null && Number(i.quantity) <= Number(i.par_level)
  ).length;

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 220 : 64 }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <span style={styles.sidebarTitle}>🍳 Kitchen</span>}
          <button style={styles.collapseBtn} onClick={() => setSidebarOpen((o) => !o)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav style={styles.nav}>
          {locations.map((loc) => {
            const active = loc.location_id === activeLocationId;
            return (
              <button
                key={loc.location_id}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                onClick={() => setActiveLocationId(loc.location_id)}
                title={loc.location_name}
              >
                <span style={styles.navEmoji}>{getLocationEmoji(loc.location_name)}</span>
                {sidebarOpen && <span style={styles.navLabel}>{loc.location_name}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>
              {activeLocation ? `${getLocationEmoji(activeLocation.location_name)} ${activeLocation.location_name}` : ""}
            </h1>
            <p style={styles.subtitle}>
              {items.length} item{items.length !== 1 ? "s" : ""}
              {lowCount > 0 && (
                <span style={styles.lowCount}> · {lowCount} low on stock</span>
              )}
            </p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setModal({ type: "add" })}>
            <Icon.Plus /> Add Item
          </button>
        </header>

        {loading ? (
          <div style={styles.empty}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
            <p>Nothing here yet.</p>
            <button style={{ ...styles.btnPrimary, marginTop: 16 }} onClick={() => setModal({ type: "add" })}>
              <Icon.Plus /> Add your first item
            </button>
          </div>
        ) : (
          <div style={styles.content}>
            {Object.entries(grouped).map(([category, catItems]) => (
              <section key={category} style={styles.categorySection}>
                <h2 style={styles.categoryTitle}>{category}</h2>
                <div style={styles.grid}>
                  {catItems.map((item) => (
                    <ItemCard
                      key={item.item_id}
                      item={item}
                      onEdit={(i) => setModal({ type: "edit", item: i })}
                      onDelete={(i) => setModal({ type: "delete", item: i })}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal?.type === "add" && (
        <ItemModal locations={locations} categories={categories} activeLocationId={activeLocationId}
          onClose={() => setModal(null)} onSave={handleSaved} />
      )}
      {modal?.type === "edit" && (
        <ItemModal item={modal.item} locations={locations} categories={categories} activeLocationId={activeLocationId}
          onClose={() => setModal(null)} onSave={handleSaved} />
      )}
      {modal?.type === "delete" && (
        <DeleteModal item={modal.item} onClose={() => setModal(null)} onConfirm={handleDeleted} />
      )}
    </div>
  );
}

// Styling in line (Testing in comparison to other project with separate CSS file to see which I would prefer)
const styles = {
  app: {
    display: "flex", minHeight: "100vh", background: "#0f1117", color: "#f0f0f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  sidebar: {
    background: "#171b26", borderRight: "1px solid #252a38",
    display: "flex", flexDirection: "column",
    transition: "width 0.2s ease", overflow: "hidden", flexShrink: 0,
  },
  sidebarHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 16px 12px", borderBottom: "1px solid #252a38",
  },
  sidebarTitle: { fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" },
  collapseBtn: {
    background: "none", border: "none", color: "#888", cursor: "pointer",
    fontSize: 16, padding: 4, borderRadius: 6, lineHeight: 1,
  },
  nav: { padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 8, border: "none",
    background: "none", color: "#aaa", cursor: "pointer",
    textAlign: "left", width: "100%", transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
  navItemActive: { background: "#252a38", color: "#fff" },
  navEmoji: { fontSize: 18, flexShrink: 0 },
  navLabel: { fontSize: 14, fontWeight: 500 },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "32px 32px 20px", borderBottom: "1px solid #1e2330",
  },
  h1: { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", color: "#666", fontSize: 14 },
  lowCount: { color: "#e67e22", fontWeight: 600 },
  content: { padding: "24px 32px", overflowY: "auto", flex: 1 },
  categorySection: { marginBottom: 32 },
  categoryTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#555", marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#171b26", border: "1px solid",
    borderRadius: 10, padding: "14px 16px",
    transition: "border-color 0.2s",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  itemName: { fontWeight: 600, fontSize: 14, lineHeight: 1.3 },
  cardActions: { display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 },
  cardBtn: {
    background: "none", border: "none", color: "#666", cursor: "pointer",
    padding: 4, borderRadius: 4, display: "flex", alignItems: "center",
    transition: "color 0.15s",
  },
  cardBottom: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  qty: { fontSize: 22, fontWeight: 700, color: "#fff" },
  unit: { fontSize: 13, fontWeight: 400, color: "#666" },
  lowBadge: {
    display: "flex", alignItems: "center", gap: 4,
    background: "#2c1a0a", color: "#e67e22",
    fontSize: 11, fontWeight: 600, padding: "3px 8px",
    borderRadius: 20, border: "1px solid #4a2e0e",
  },
  expiredBadge: {
    display: "flex", alignItems: "center", gap: 4,
    background: "#2c0a0a", color: "#e74c3c",
    fontSize: 11, fontWeight: 600, padding: "3px 8px",
    borderRadius: 20, border: "1px solid #4a0e0e",
  },
  expiryRow: {
    marginTop: 8, fontSize: 11, fontWeight: 500,
  },
  empty: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#555", textAlign: "center", padding: 40,
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#171b26", border: "1px solid #252a38",
    borderRadius: 14, padding: "28px 28px 24px",
    width: "90%", maxWidth: 480,
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 700 },
  form: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4, marginTop: 8, display: "block" },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid #252a38", background: "#0f1117",
    color: "#f0f0f0", fontSize: 14, boxSizing: "border-box",
    outline: "none",
  },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#2563eb", color: "#fff", border: "none",
    padding: "10px 18px", borderRadius: 8, fontWeight: 600,
    fontSize: 14, cursor: "pointer",
  },
  btnSecondary: {
    background: "#252a38", color: "#aaa", border: "none",
    padding: "10px 18px", borderRadius: 8, fontWeight: 600,
    fontSize: 14, cursor: "pointer",
  },
  errorBanner: {
    background: "#2c0a0a", color: "#e74c3c",
    border: "1px solid #4a0e0e", borderRadius: 8,
    padding: "10px 14px", fontSize: 13, marginBottom: 8,
  },
  iconBtn: {
    background: "none", border: "none", color: "#666",
    cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
  },
};
