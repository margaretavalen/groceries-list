import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus,
  Search,
  ShoppingCart,
  CalendarDays,
  Package,
  WalletCards,
  Check,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sprout,
  LayoutDashboard,
  ListChecks,
  Clock3,
  Menu,
} from "lucide-react";
import "./styles.css";

const seed = [
  {
    id: 1,
    name: "Alpukat",
    category: "Sayur & Buah",
    qty: 4,
    unit: "pcs",
    before: 48000,
    after: 42000,
    date: "2026-08-17",
    stock: 2,
    bought: false,
  },
  {
    id: 2,
    name: "Pisang cavendish",
    category: "Sayur & Buah",
    qty: 1,
    unit: "sisir",
    before: 32000,
    after: 28500,
    date: "2026-08-17",
    stock: 0,
    bought: false,
  },
  {
    id: 3,
    name: "Susu segar",
    category: "Susu & Telur",
    qty: 2,
    unit: "liter",
    before: 46000,
    after: 42000,
    date: "2026-08-18",
    stock: 1,
    bought: true,
  },
  {
    id: 4,
    name: "Telur ayam",
    category: "Susu & Telur",
    qty: 1,
    unit: "tray",
    before: 59000,
    after: 56000,
    date: "2026-08-18",
    stock: 0,
    bought: false,
  },
  {
    id: 5,
    name: "Beras pandan wangi",
    category: "Bahan Pokok",
    qty: 5,
    unit: "kg",
    before: 86000,
    after: 79500,
    date: "2026-08-20",
    stock: 2,
    bought: false,
  },
  {
    id: 6,
    name: "Minyak zaitun",
    category: "Bahan Pokok",
    qty: 1,
    unit: "botol",
    before: 99000,
    after: 87500,
    date: "2026-08-16",
    stock: 1,
    bought: true,
  },
  {
    id: 7,
    name: "Greek yoghurt",
    category: "Susu & Telur",
    qty: 3,
    unit: "cup",
    before: 69000,
    after: 63000,
    date: "2026-08-21",
    stock: 0,
    bought: false,
  },
  {
    id: 8,
    name: "Ikan salmon",
    category: "Daging & Protein",
    qty: 500,
    unit: "gram",
    before: 135000,
    after: 119000,
    date: "2026-08-22",
    stock: 0,
    bought: false,
  },
];
const defaultCats = [
  "Sayur & Buah",
  "Susu & Telur",
  "Bahan Pokok",
  "Daging & Protein",
  "Snack & Minuman",
  "Frozen Food",
  "Rumah Tangga",
];
const savedItems = () => {
  try {
    return JSON.parse(localStorage.getItem("grocerie-v1")) || seed;
  } catch {
    return seed;
  }
};
const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL?.trim();
const normalizeDate = (value) => {
  if (!value) return "";
  const text = String(value);
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
};
const loadGoogleItems = async () => {
  if (!googleScriptUrl) return null;
  const response = await fetch(googleScriptUrl);
  if (!response.ok) throw new Error("Gagal membaca Google Sheets");
  const data = await response.json();
  return Array.isArray(data.items)
    ? data.items.map((item) => ({ ...item, date: normalizeDate(item.date) }))
    : null;
};
const saveGoogleItems = async (items) => {
  if (!googleScriptUrl) return;
  await fetch(googleScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ items }),
  });
};
const cats = [
  ...new Set([...defaultCats, ...savedItems().map((item) => item.category)]),
];
const baseColors = {
  "Sayur & Buah": "#6d8b4d",
  "Susu & Telur": "#a8b98a",
  "Bahan Pokok": "#e3b84f",
  "Daging & Protein": "#bd7166",
  "Snack & Minuman": "#d5a86d",
  "Frozen Food": "#7898a2",
  "Rumah Tangga": "#a89b8c",
};
const extraColors = [
  "#8c79a8",
  "#5e9a89",
  "#d2806f",
  "#7794bd",
  "#b48a57",
  "#9b7d90",
];
const colors = new Proxy(baseColors, {
  get: (target, category) =>
    target[category] ||
    extraColors[
      Math.abs(
        String(category)
          .split("")
          .reduce((sum, char) => sum + char.charCodeAt(0), 0),
      ) % extraColors.length
    ],
});
const colorFor = (category) => colors[category];
const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
const todayValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
};

function IconBox({ tone = "green", children }) {
  return <span className={"icon-box " + tone}>{children}</span>;
}
function Stat({ icon, label, value, note, tone }) {
  return (
    <div className="stat">
      <IconBox tone={tone}>{icon}</IconBox>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
function Header({ open, page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const choose = (action) => {
    action();
    setMenuOpen(false);
  };
  const goTo = (id) => {
    setPage("overview");
    setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0);
  };
  return (
    <header>
      <button className="brand" onClick={() => choose(() => setPage("overview"))}>
        <ShoppingCart />
        <span>Grocerie</span>
      </button>
      <nav className={menuOpen ? "open" : ""} aria-label="Navigasi utama">
        <button
          className={page === "overview" ? "active" : ""}
          onClick={() => choose(() => setPage("overview"))}
        >
          <LayoutDashboard />
          <span>Home</span>
        </button>
        <button onClick={() => choose(() => goTo("list"))}>
          <ListChecks />
          <span>Groceries</span>
        </button>
        <button onClick={() => choose(() => goTo("calendar"))}>
          <CalendarDays />
          <span>Calendar</span>
        </button>
        <button
          className={page === "history" ? "active" : ""}
          onClick={() => choose(() => setPage("history"))}
        >
          <Clock3 />
          <span>History</span>
        </button>
      </nav>
      <div className="head-actions">
        <label className="search">
          <Search />
          <input placeholder="Cari barang..." />
        </label>
        <button className="primary" onClick={open}>
          <Plus /> Tambah barang
        </button>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Hero({ items, categories = cats }) {
  const active = items.filter((x) => !x.bought).length,
    stock = items.reduce((s, x) => s + x.stock, 0),
    spent = items.filter((x) => x.bought).reduce((s, x) => s + x.after, 0);
  return (
    <section className="hero">
      <div className="hero-copy">
        <Sprout />
        <h1>Hallo, Veynellope</h1>
        <p>
          Belanja lebih terencana, simpan lebih banyak, dan kurangi makanan
          terbuang.
        </p>
      </div>
      <div className="stats">
        <Stat
          tone="sage"
          icon={<ShoppingCart />}
          label="Perlu dibeli"
          value={active}
          note={`${categories.length} kategori`}
        />
        <Stat
          tone="cream"
          icon={<Package />}
          label="Stok tersedia"
          value={stock}
          note="di dapurmu"
        />
        <Stat
          tone="sage"
          icon={<WalletCards />}
          label="Total bulan ini"
          value={rupiah(spent)}
          note="dari barang terbeli"
        />
      </div>
    </section>
  );
}
function GroceryList({ items, checkout, remove, open }) {
  const grouped = useMemo(
    () =>
      Object.groupBy(
        items.filter((x) => !x.bought),
        (x) => x.category,
      ),
    [items],
  );
  return (
    <section id="list" className="panel grocery">
      <div className="panel-head">
        <div>
          <h2>Daftar Belanja Aktif</h2>
          <p>Centang barang untuk mencatat harga aktual</p>
        </div>
        <button className="text-btn" onClick={open}>
          <Plus /> Tambah
        </button>
      </div>
      <div className="group-list">
        {Object.entries(grouped).map(([cat, rows]) => (
          <div className="group" key={cat}>
            <div className="group-title">
              <span className="dot" style={{ background: colors[cat] }} />
              <b>{cat}</b>
              <small>{rows.length} item</small>
              <span className="col-label">Jumlah · Estimasi</span>
            </div>
            {rows.map((item) => (
              <div className="grocery-row" key={item.id}>
                <button
                  className="check"
                  aria-label={`Beli ${item.name}`}
                  onClick={() => checkout(item)}
                >
                  <Check />
                </button>
                <div className="item-name">
                  <strong>{item.name}</strong>
                  <small>
                    Stok {item.stock} {item.unit}
                  </small>
                </div>
                <span>
                  {item.qty} {item.unit}
                </span>
                <div className="prices">
                  {item.before > item.after ? (
                    <del>{rupiah(item.before)}</del>
                  ) : null}
                  <b>{rupiah(item.after)}</b>
                </div>
                <button
                  className="ghost"
                  onClick={() => remove(item.id)}
                  aria-label="Hapus"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="add-row" onClick={open}>
        <Plus /> Tambah barang baru
      </button>
    </section>
  );
}
function Stock({ items }) {
  const rows = cats
    .map((c) => ({
      c,
      count: items
        .filter((x) => x.category === c)
        .reduce((s, x) => s + x.stock, 0),
    }))
    .filter((x) => x.count);
  const max = Math.max(...rows.map((x) => x.count), 1);
  return (
    <section className="panel stock">
      <div className="panel-head">
        <div>
          <h2>Ringkasan Stok</h2>
          <p>Yang tersedia di rumah</p>
        </div>
      </div>
      {rows.map((x) => (
        <div className="stock-row" key={x.c}>
          <span className="dot" style={{ background: colors[x.c] }} />
          <b>{x.c}</b>
          <span>{x.count} unit</span>
          <i>
            <em
              style={{
                width: `${(x.count / max) * 100}%`,
                background: colors[x.c],
              }}
            />
          </i>
        </div>
      ))}
    </section>
  );
}
function Calendar({ items }) {
  const current = todayValue();
  const [month, setMonth] = useState(() => {
    const [year, monthNumber] = current.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1);
  });
  const [selected, setSelected] = useState(current);
  const year = month.getFullYear(),
    m = month.getMonth(),
    start = (new Date(year, m, 1).getDay() + 6) % 7,
    days = new Date(year, m + 1, 0).getDate();
  const cells = [
    ...Array(start).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const selectedItems = items.filter((x) => normalizeDate(x.date) === selected);
  return (
    <section id="calendar" className="panel calendar">
      <div className="calendar-head">
        <div>
          <h2>
            {month.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p>Pilih tanggal untuk melihat barang</p>
        </div>
        <div>
          <button
            aria-label="Bulan sebelumnya"
            className="ghost"
            onClick={() => setMonth(new Date(year, m - 1, 1))}
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Bulan berikutnya"
            className="ghost"
            onClick={() => setMonth(new Date(year, m + 1, 1))}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="week">
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
          <b key={d}>{d}</b>
        ))}
      </div>
      <div className="days">
        {cells.map((d, i) => {
          const iso = d
            ? `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
            : "";
          const found = items.filter((x) => normalizeDate(x.date) === iso);
          return (
            <button
              key={i}
              className={
                (selected === iso ? "selected-day " : "") +
                (found.length ? "has-items" : "")
              }
              disabled={!d}
              onClick={() => setSelected(iso)}
              aria-label={
                d ? `Tanggal ${d}, ${found.length} barang` : undefined
              }
            >
              <span>{d}</span>
              {found.length ? (
                <i>
                  {found.slice(0, 4).map((x) => (
                    <em
                      key={x.id}
                      style={{ background: colorFor(x.category) }}
                      title={x.category}
                    />
                  ))}
                </i>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="day-agenda">
        <div className="agenda-title">
          <CalendarDays />
          <div>
            <b>
              {new Date(selected + "T00:00:00").toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </b>
            <small>{selectedItems.length} barang</small>
          </div>
        </div>
        {selectedItems.length ? (
          selectedItems.map((x) => (
            <div className="agenda-row" key={x.id}>
              <span
                className="dot"
                style={{ background: colorFor(x.category) }}
              />
              <div>
                <b>{x.name}</b>
                <small>{x.bought ? "Sudah dibeli" : "Direncanakan"}</small>
              </div>
              <strong>{rupiah(x.after)}</strong>
            </div>
          ))
        ) : (
          <p>Belum ada belanja pada tanggal ini.</p>
        )}
      </div>
    </section>
  );
}
function Spending({ items }) {
  const total = items.filter((x) => x.bought).reduce((s, x) => s + x.after, 0);
  const by = cats
    .map((c) => ({
      c,
      v: items
        .filter((x) => x.bought && x.category === c)
        .reduce((s, x) => s + x.after, 0),
    }))
    .filter((x) => x.v);
  let acc = 0;
  const gradient = by
    .map((x) => {
      const a = (acc / total) * 360;
      acc += x.v;
      return `${colors[x.c]} ${a}deg ${(acc / total) * 360}deg`;
    })
    .join(",");
  return (
    <section className="panel spending">
      <div className="panel-head">
        <div>
          <h2>Pengeluaran per Kategori</h2>
          <p>Barang yang sudah dibeli</p>
        </div>
      </div>
      <div className="spend-body">
        <div
          className="donut"
          style={{
            background: `conic-gradient(${gradient || "#e8e6df 0 360deg"})`,
          }}
        >
          <div>
            <b>{rupiah(total)}</b>
            <span>bulan ini</span>
          </div>
        </div>
        <div className="legend">
          {by.map((x) => (
            <div key={x.c}>
              <span className="dot" style={{ background: colors[x.c] }} />
              <b>{x.c}</b>
              <small>{Math.round((x.v / total) * 100)}%</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function History({ items, undo }) {
  const bought = items.filter((x) => x.bought);
  return (
    <section id="history" className="panel history">
      <div className="panel-head">
        <div>
          <h2>Riwayat Pembelian</h2>
          <p>Harga aktual dan selisihnya</p>
        </div>
      </div>
      {bought.length ? (
        bought.map((x) => {
          const diff = (x.before || 0) - (x.after || 0);
          return (
            <div className="history-row" key={x.id}>
              <IconBox tone="sage">
                <Check />
              </IconBox>
              <div>
                <b>{x.name}</b>
                <small>
                  {new Date(x.date + "T00:00:00").toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
                <span className={diff >= 0 ? "saving" : "overspend"}>
                  {diff >= 0 ? "Hemat" : "Boros"} {rupiah(Math.abs(diff))}
                </span>
              </div>
              <strong>{rupiah(x.after)}</strong>
              <button
                aria-label={`Batalkan ${x.name}`}
                className="ghost"
                onClick={() => undo(x.id)}
              >
                <X />
              </button>
            </div>
          );
        })
      ) : (
        <p className="empty">Belum ada barang terbeli.</p>
      )}
    </section>
  );
}

function HistoryPage({ items, undo }) {
  const [dateFilter, setDateFilter] = useState("");
  const allBought = useMemo(
    () =>
      items
        .filter((x) => x.bought)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [items],
  );
  const bought = useMemo(
    () =>
      dateFilter ? allBought.filter((x) => x.date === dateFilter) : allBought,
    [allBought, dateFilter],
  );
  const total = bought.reduce((sum, x) => sum + (x.after || 0), 0);
  const planned = bought.reduce((sum, x) => sum + (x.before || 0), 0);
  const diff = planned - total;
  const grouped = bought.reduce((groups, item) => {
    (groups[item.date] ??= []).push(item);
    return groups;
  }, {});
  return (
    <main className="history-page">
      <section className="history-hero">
        <div className="history-title">
          <CalendarDays />
          <div>
            <h1>History Belanja</h1>
            <p>
              Semua barang yang sudah dibeli, lengkap dengan tanggal dan
              harganya.
            </p>
          </div>
        </div>
        <div className="history-date-search">
          <label>
            <span>Cari berdasarkan tanggal</span>
            <div>
              <CalendarDays />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </label>
          {dateFilter ? (
            <button type="button" onClick={() => setDateFilter("")}>
              <X /> Tampilkan semua
            </button>
          ) : null}
        </div>
        <div className="history-summary">
          <div>
            <span>Total transaksi</span>
            <strong>{bought.length}</strong>
            <small>
              {dateFilter ? "pada tanggal dipilih" : "barang terbeli"}
            </small>
          </div>
          <div>
            <span>Total dibayar</span>
            <strong>{rupiah(total)}</strong>
            <small>pengeluaran aktual</small>
          </div>
          <div className={diff >= 0 ? "good" : "bad"}>
            <span>{diff >= 0 ? "Total hemat" : "Total boros"}</span>
            <strong>{rupiah(Math.abs(diff))}</strong>
            <small>dibanding harga awal</small>
          </div>
        </div>
      </section>
      {bought.length ? (
        Object.entries(grouped).map(([date, rows]) => (
          <section className="history-date-group" key={date}>
            <div className="history-date-head">
              <div className="history-date-icon">
                <CalendarDays />
              </div>
              <div>
                <h2>
                  {new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <p>
                  {rows.length} barang ·{" "}
                  {rupiah(rows.reduce((sum, x) => sum + x.after, 0))}
                </p>
              </div>
            </div>
            <div className="history-table-head">
              <span>Barang</span>
              <span>Kategori</span>
              <span>Harga awal</span>
              <span>Harga bayar</span>
              <span>Selisih</span>
              <span />
            </div>
            {rows.map((item) => {
              const saving = (item.before || 0) - (item.after || 0);
              return (
                <div className="history-table-row" key={item.id}>
                  <div className="history-product">
                    <i style={{ background: colorFor(item.category) }} />
                    <div>
                      <b>{item.name}</b>
                      <small>
                        {item.qty} {item.unit}
                      </small>
                    </div>
                  </div>
                  <span className="history-category">{item.category}</span>
                  <del>{rupiah(item.before)}</del>
                  <strong>{rupiah(item.after)}</strong>
                  <span
                    className={
                      saving >= 0 ? "history-saving" : "history-overspend"
                    }
                  >
                    {saving >= 0 ? "Hemat" : "Boros"} {rupiah(Math.abs(saving))}
                  </span>
                  <button
                    className="ghost"
                    aria-label={`Batalkan pembelian ${item.name}`}
                    title="Batalkan pembelian"
                    onClick={() => undo(item.id)}
                  >
                    <X />
                  </button>
                </div>
              );
            })}
          </section>
        ))
      ) : (
        <section className="history-empty">
          <div>
            <CalendarDays />
          </div>
          <h2>
            {dateFilter
              ? "Tidak ada belanja di tanggal ini"
              : "Belum ada history belanja"}
          </h2>
          <p>
            {dateFilter
              ? "Coba pilih tanggal lain atau tampilkan semua history."
              : "Barang yang sudah dicentang dan dikonfirmasi harganya akan muncul di halaman ini."}
          </p>
          {dateFilter ? (
            <button className="secondary" onClick={() => setDateFilter("")}>
              Tampilkan semua history
            </button>
          ) : null}
        </section>
      )}
    </main>
  );
}
function CategoryPicker({ value, onChange, onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`category-picker ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="category-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          <i style={{ background: colorFor(value) }} />
          {value}
        </span>
        <ChevronDown />
      </button>
      {open ? (
        <div
          className="category-menu"
          role="listbox"
          aria-label="Daftar kategori"
        >
          {cats.map((category) => (
            <button
              type="button"
              role="option"
              aria-selected={value === category}
              className={value === category ? "selected" : ""}
              key={category}
              onClick={() => {
                onChange(category);
                setOpen(false);
              }}
            >
              <span>
                <i style={{ background: colorFor(category) }} />
                {category}
              </span>
              {value === category ? <Check /> : null}
            </button>
          ))}
          <div className="category-menu-separator" />
          <button
            type="button"
            className="category-create"
            onClick={() => {
              onAdd();
              setOpen(false);
            }}
          >
            <Plus /> Tambah kategori
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Modal({ close, add }) {
  const [form, setForm] = useState({
    name: "",
    category: cats[0],
    qty: 1,
    unit: "pcs",
    before: "",
    after: "",
    stock: 0,
    date: todayValue(),
  });
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const saveCategory = () => {
    const category = newCategory.trim();
    if (!category) return;
    if (!cats.includes(category)) cats.push(category);
    set("category", category);
    setAddingCategory(false);
  };
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (addingCategory) {
            saveCategory();
            return;
          }
          add(form);
          close();
        }}
      >
        <div className="modal-head">
          <div>
            <h2>Tambah barang</h2>
            <p>Pilih kategori dari daftar atau tambahkan kategori baru.</p>
          </div>
          <button type="button" className="ghost" onClick={close}>
            <X />
          </button>
        </div>
        <label>
          Nama barang
          <input
            autoFocus
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Mis. Apel fuji"
          />
        </label>
        <div className="form-grid">
          <label>
            Kategori
            <CategoryPicker
              value={form.category}
              onChange={(category) => {
                set("category", category);
                setAddingCategory(false);
              }}
              onAdd={() => {
                setAddingCategory(true);
                setNewCategory("");
              }}
            />
            {addingCategory ? (
              <span className="new-category-row">
                <input
                  autoFocus
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nama kategori baru"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  className="category-add-button"
                  onClick={saveCategory}
                  disabled={!newCategory.trim()}
                >
                  Tambah
                </button>
              </span>
            ) : (
              <small className="field-help">
                Pilih “Tambah kategori” untuk membuat yang baru.
              </small>
            )}
          </label>
          <label>
            Tanggal beli
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </label>
          <label>
            Jumlah
            <input
              type="number"
              min="0"
              value={form.qty}
              onChange={(e) => set("qty", +e.target.value)}
            />
          </label>
          <label>
            Satuan
            <input
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
          </label>
          <label>
            Harga sebelum
            <input
              type="number"
              value={form.before}
              onChange={(e) => set("before", +e.target.value)}
            />
          </label>
          <label>
            Harga setelah
            <input
              required
              type="number"
              value={form.after}
              onChange={(e) => set("after", +e.target.value)}
            />
          </label>
          <label>
            Stok saat ini
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", +e.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>
            Batal
          </button>
          <button className="primary">
            <Plus /> Tambahkan
          </button>
        </div>
      </form>
    </div>
  );
}
function PurchaseModal({ item, close, confirm }) {
  const [actual, setActual] = useState(item.after || item.before || 0);
  const [date, setDate] = useState(item.date || "2026-08-17");
  const diff = (item.before || 0) - actual;
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form
        className="modal purchase-modal"
        onSubmit={(e) => {
          e.preventDefault();
          confirm(item.id, actual, date);
          close();
        }}
      >
        <div className="modal-head">
          <div>
            <h2>Konfirmasi pembelian</h2>
            <p>Catat harga yang benar-benar kamu bayar.</p>
          </div>
          <button type="button" className="ghost" onClick={close}>
            <X />
          </button>
        </div>
        <div className="purchase-item">
          <span className="dot" style={{ background: colors[item.category] }} />
          <div>
            <b>{item.name}</b>
            <small>Harga sebelumnya {rupiah(item.before)}</small>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Harga aktual dibayar
            <input
              autoFocus
              required
              min="0"
              type="number"
              value={actual}
              onChange={(e) => setActual(+e.target.value)}
            />
          </label>
          <label>
            Tanggal pembelian
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <div
          className={"difference-card " + (diff >= 0 ? "positive" : "negative")}
        >
          <span>{diff >= 0 ? "Kamu hemat" : "Kamu boros"}</span>
          <strong>{rupiah(Math.abs(diff))}</strong>
          <small>Dibanding harga sebelumnya {rupiah(item.before)}</small>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>
            Batal
          </button>
          <button className="primary">
            <Check /> Simpan pembelian
          </button>
        </div>
      </form>
    </div>
  );
}
function App() {
  const [items, setItems] = useState(savedItems);
  const [page, setPage] = useState("overview");
  const [modal, setModal] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  useEffect(() => {
    let active = true;
    loadGoogleItems()
      .then((remote) => {
        if (active && remote) {
          setItems(remote);
          localStorage.setItem("grocerie-v1", JSON.stringify(remote));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const save = (fn) =>
    setItems((prev) => {
      const next = fn(prev);
      localStorage.setItem("grocerie-v1", JSON.stringify(next));
      saveGoogleItems(next).catch(() => {});
      return next;
    });
  const confirmPurchase = (id, actual, date) =>
    save((a) =>
      a.map((x) =>
        x.id === id ? { ...x, after: +actual, date, bought: true } : x,
      ),
    );
  const undo = (id) =>
    save((a) => a.map((x) => (x.id === id ? { ...x, bought: false } : x)));
  const remove = (id) => save((a) => a.filter((x) => x.id !== id));
  const add = (f) =>
    save((a) => [{ ...f, id: Date.now(), bought: false }, ...a]);
  return (
    <>
      <Header open={() => setModal(true)} page={page} setPage={setPage} />
      {page === "history" ? (
        <HistoryPage items={items} undo={undo} />
      ) : (
        <main>
          <Hero items={items} />
          <div className="dashboard">
            <GroceryList
              items={items}
              checkout={setCheckoutItem}
              remove={remove}
              open={() => setModal(true)}
            />
            <div className="right-grid">
              <Stock items={items} />
              <Calendar items={items} />
              <Spending items={items} />
              <History items={items} undo={undo} />
            </div>
          </div>
          <footer>
            <Sprout />
            <span>
              <b>Tip hari ini</b> Simpan daun ketumbar dalam segelas air di
              kulkas agar tetap segar lebih lama.
            </span>
          </footer>
        </main>
      )}
      {modal ? <Modal close={() => setModal(false)} add={add} /> : null}
      {checkoutItem ? (
        <PurchaseModal
          item={checkoutItem}
          close={() => setCheckoutItem(null)}
          confirm={confirmPurchase}
        />
      ) : null}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
