import React, { useState, useEffect, useMemo, useRef } from "react";

/* =========================================================================
   VERTEX COMPUTER — monochrome tech/e-commerce experience
   Tokens
   - bg      #0A0A0B (near-black)
   - panel   #131315
   - line    #232326
   - mute    #8A8A90
   - fg      #F4F4F5 (near-white)
   - accent  #4DE3FF (signal-blue, used only for glow/status — the "VX pulse")
   Type
   - display: "Space Grotesk" (headlines, prices) — technical, geometric
   - body:    "Inter" (paragraphs, UI)
   - mono:    "JetBrains Mono" (specs, SKUs, prices in cards) — reads like a spec sheet
   Signature: a scanning "VX" glyph that assembles itself from line segments on
   load, and a hairline "spec strip" (mono, letter-spaced) used across product
   cards / detail pages instead of icon soup.
   ========================================================================= */

const FONT_LINK_ID = "vx-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

/* ---------------------------- product data ------------------------------ */

const CATEGORIES = [
  "PC Rakitan", "Processor", "VGA / GPU", "RAM", "SSD", "Motherboard",
  "Power Supply", "Casing", "Keyboard", "Mouse", "Headset", "Gaming Gear",
];

const PRODUCTS = [
  { id: "vx-01", name: "Vertex Gaming PC — Ryzen 7 / RTX 4060", cat: "PC Rakitan", price: 18999000, oldPrice: 20500000, rating: 4.9, sold: 214, stock: 6, badge: "Terlaris", icon: "tower",
    desc: "Rakitan siap pakai untuk gaming 1440p dan konten kreator ringan. Sudah termasuk sistem pendingin udara triple-fan dan kabel tersusun rapi.",
    specs: [["Processor","AMD Ryzen 7 5700X"], ["GPU","RTX 4060 8GB"], ["RAM","16GB DDR4 3200MHz"], ["Storage","1TB NVMe SSD"], ["PSU","650W 80+ Bronze"], ["Garansi","2 tahun sparepart"]] },
  { id: "vx-02", name: "Keyboard Mechanical RGB Vertex K1", cat: "Keyboard", price: 649000, rating: 4.7, sold: 892, stock: 34, badge: "Terlaris", icon: "keyboard",
    desc: "Hot-swappable mechanical switch dengan pencahayaan RGB per-key dan casing aluminium.",
    specs: [["Switch","Hot-swap Blue/Red"], ["Layout","TKL 87 key"], ["Konektivitas","USB-C kabel"], ["Lampu","RGB per-key"]] },
  { id: "vx-03", name: "Mouse Gaming Vertex M2 Wireless", cat: "Mouse", price: 379000, rating: 4.6, sold: 601, stock: 40, icon: "mouse",
    desc: "Sensor optik presisi tinggi dengan bobot ringan 62g, cocok untuk FPS dan MOBA.",
    specs: [["Sensor","19,000 DPI optik"], ["Berat","62g"], ["Baterai","70 jam"], ["Polling rate","1000Hz"]] },
  { id: "vx-04", name: "Headset Gaming Vertex H3 7.1", cat: "Headset", price: 549000, rating: 4.5, sold: 340, stock: 22, badge: "Promo", icon: "headset",
    desc: "Suara surround 7.1 dengan microphone noise-cancelling yang bisa dilepas.",
    specs: [["Driver","50mm neodymium"], ["Surround","7.1 virtual"], ["Mic","Detachable, noise-cancel"], ["Konektor","USB / 3.5mm"]] },
  { id: "vx-05", name: "SSD NVMe Vertex S500 512GB", cat: "SSD", price: 549000, rating: 4.8, sold: 1204, stock: 58, badge: "Terlaris", icon: "ssd",
    desc: "Kecepatan baca hingga 3500MB/s, ideal untuk sistem operasi dan game berat.",
    specs: [["Kapasitas","512GB"], ["Interface","PCIe Gen3 x4 NVMe"], ["Baca","3500 MB/s"], ["Tulis","3000 MB/s"]] },
  { id: "vx-06", name: "RAM Vertex R16 16GB DDR4 3200MHz", cat: "RAM", price: 419000, rating: 4.7, sold: 977, stock: 61, icon: "ram",
    desc: "Modul memori dengan heatsink low-profile, kompatibel untuk gaming dan multitasking.",
    specs: [["Kapasitas","16GB (1x16GB)"], ["Kecepatan","3200MHz"], ["Latency","CL16"], ["Voltase","1.35V"]] },
  { id: "vx-07", name: "Keyboard Mechanical Vertex K1 Pro", cat: "Keyboard", price: 899000, rating: 4.8, sold: 188, stock: 15, icon: "keyboard",
    desc: "Versi Pro dengan knob volume, kaki magnetik, dan kabel coiled aviator.",
    specs: [["Switch","Hot-swap Brown"], ["Layout","75% 82 key"], ["Ekstra","Volume knob, kaki magnet"]] },
  { id: "vx-08", name: "Monitor Gaming Vertex V27 165Hz", cat: "Gaming Gear", price: 2599000, rating: 4.9, sold: 156, stock: 9, badge: "Promo", icon: "monitor",
    desc: "Panel IPS 27 inci QHD dengan refresh rate 165Hz dan response time 1ms.",
    specs: [["Ukuran","27 inci QHD"], ["Refresh rate","165Hz"], ["Panel","IPS"], ["Response time","1ms"]] },
  { id: "vx-09", name: "Casing Vertex C4 Mid Tower", cat: "Casing", price: 749000, rating: 4.6, sold: 264, stock: 18, icon: "case",
    desc: "Panel kaca tempered penuh dengan airflow depan mesh dan dudukan 6 kipas.",
    specs: [["Tipe","Mid tower ATX"], ["Panel","Tempered glass"], ["Fan preinstalled","3 buah ARGB"]] },
  { id: "vx-10", name: "Power Supply Vertex P650 80+ Bronze", cat: "Power Supply", price: 599000, rating: 4.7, sold: 412, stock: 27, icon: "psu",
    desc: "Sertifikasi 80+ Bronze dengan kabel modular parsial untuk kerapian instalasi.",
    specs: [["Daya","650W"], ["Sertifikasi","80+ Bronze"], ["Modular","Semi-modular"]] },
  { id: "vx-11", name: "VGA Vertex RTX 4060 8GB", cat: "VGA / GPU", price: 5399000, oldPrice: 5799000, rating: 4.9, sold: 143, stock: 7, badge: "Promo", icon: "gpu",
    desc: "Performa 1440p tinggi dengan efisiensi daya baik, siap untuk ray tracing dan DLSS.",
    specs: [["VRAM","8GB GDDR6"], ["Boost clock","2460 MHz"], ["TDP","115W"], ["Output","3x DP, 1x HDMI"]] },
  { id: "vx-12", name: "Motherboard Vertex B650 AM5", cat: "Motherboard", price: 2199000, rating: 4.6, sold: 98, stock: 11, icon: "mobo",
    desc: "Chipset B650 dengan dukungan DDR5, PCIe 4.0, dan konektivitas WiFi 6.",
    specs: [["Socket","AM5"], ["Chipset","B650"], ["Memori","DDR5, 4 slot"], ["Konektivitas","WiFi 6, BT 5.2"]] },
];

const SERVICES = [
  ["Servis PC","Diagnosa dan perbaikan menyeluruh untuk PC desktop."],
  ["Servis Laptop","Perbaikan hardware dan software laptop segala merek."],
  ["Install Windows","Instalasi ulang sistem operasi beserta driver."],
  ["Install Software","Pemasangan aplikasi kerja, kreatif, dan produktivitas."],
  ["Upgrade RAM","Penambahan atau penggantian memori untuk performa lebih baik."],
  ["Upgrade SSD","Migrasi ke penyimpanan lebih cepat tanpa kehilangan data."],
  ["Cleaning PC","Pembersihan debu dan penggantian thermal paste."],
  ["Perbaikan Hardware","Penanganan kerusakan komponen fisik."],
  ["Rakit PC","Perakitan PC custom sesuai kebutuhan dan budget."],
  ["Konsultasi","Diskusi kebutuhan komputer sebelum membeli atau upgrade."],
];

/* Product photo. Defaults to a stable placeholder photo (so cards are never
   empty) — swap any product's `image` field with a real link any time,
   e.g. { id:"vx-01", ..., image:"https://your-link.com/photo.jpg" }. */
function imgFor(p) {
  return p.image || `https://picsum.photos/seed/${p.id}/700/500`;
}

const ARTICLES = [
  { title: "5 Tanda SSD Kamu Perlu Diupgrade", tag: "Tips", excerpt: "Loading lama dan sering not responding? Ini saatnya evaluasi penyimpanan." },
  { title: "Review Vertex Gaming PC Ryzen 7 / RTX 4060", tag: "Review", excerpt: "Kami uji untuk gaming 1440p dan render video — hasilnya konsisten." },
  { title: "Cara Memilih PSU yang Tepat", tag: "Tutorial", excerpt: "Menghitung kebutuhan daya sebelum membeli power supply." },
  { title: "GPU Entry-Level Terbaik 2026", tag: "Berita", excerpt: "Perbandingan performa dan harga untuk budget terbatas." },
  { title: "Promo Akhir Bulan: SSD & RAM", tag: "Promo", excerpt: "Diskon untuk komponen upgrade paling dicari bulan ini." },
  { title: "Panduan Merakit PC Pertama Kali", tag: "Tutorial", excerpt: "Langkah demi langkah agar rakitan pertamamu berjalan mulus." },
];

/* --------------------------------- icons --------------------------------- */
/* Minimal monoline icon set, drawn to match the spec-sheet aesthetic. */
function Icon({ name, className }) {
  const s = { strokeWidth: 1.4, fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    tower: <><rect x="7" y="3" width="10" height="18" rx="1.5" {...s} /><line x1="9" y1="6" x2="13" y2="6" {...s} /><circle cx="9" cy="16" r="1" {...s} /><line x1="9" y1="10" x2="15" y2="10" {...s} /></>,
    keyboard: <><rect x="2" y="7" width="20" height="10" rx="1.5" {...s} /><line x1="5" y1="10" x2="5.01" y2="10" {...s} /><line x1="8" y1="10" x2="8.01" y2="10" {...s} /><line x1="11" y1="10" x2="11.01" y2="10" {...s} /><line x1="14" y1="10" x2="14.01" y2="10" {...s} /><line x1="6" y1="14" x2="18" y2="14" {...s} /></>,
    mouse: <><rect x="7" y="3" width="10" height="18" rx="5" {...s} /><line x1="12" y1="3" x2="12" y2="10" {...s} /></>,
    headset: <><path d="M4 13v-1a8 8 0 0116 0v1" {...s} /><rect x="2" y="13" width="4" height="6" rx="1.5" {...s} /><rect x="18" y="13" width="4" height="6" rx="1.5" {...s} /></>,
    ssd: <><rect x="3" y="7" width="18" height="10" rx="1.5" {...s} /><line x1="6" y1="12" x2="10" y2="12" {...s} /><circle cx="17" cy="12" r="1" {...s} /></>,
    ram: <><rect x="3" y="8" width="18" height="8" rx="1" {...s} /><line x1="6" y1="8" x2="6" y2="6" {...s} /><line x1="10" y1="8" x2="10" y2="6" {...s} /><line x1="14" y1="8" x2="14" y2="6" {...s} /><line x1="18" y1="8" x2="18" y2="6" {...s} /></>,
    monitor: <><rect x="3" y="4" width="18" height="12" rx="1.5" {...s} /><line x1="9" y1="20" x2="15" y2="20" {...s} /><line x1="12" y1="16" x2="12" y2="20" {...s} /></>,
    case: <><rect x="6" y="2" width="12" height="20" rx="1.5" {...s} /><circle cx="12" cy="7" r="1.5" {...s} /><line x1="9" y1="14" x2="15" y2="14" {...s} /></>,
    psu: <><rect x="4" y="6" width="16" height="12" rx="1.5" {...s} /><circle cx="9" cy="12" r="2.4" {...s} /><line x1="14" y1="10" x2="17" y2="10" {...s} /><line x1="14" y1="14" x2="17" y2="14" {...s} /></>,
    gpu: <><rect x="2" y="8" width="20" height="8" rx="1.5" {...s} /><circle cx="7" cy="12" r="2" {...s} /><circle cx="14" cy="12" r="2" {...s} /><line x1="19" y1="16" x2="19" y2="19" {...s} /><line x1="21" y1="16" x2="21" y2="19" {...s} /></>,
    mobo: <><rect x="3" y="3" width="18" height="18" rx="1.5" {...s} /><rect x="6" y="6" width="5" height="5" {...s} /><line x1="14" y1="7" x2="18" y2="7" {...s} /><line x1="14" y1="10" x2="18" y2="10" {...s} /><line x1="6" y1="15" x2="18" y2="15" {...s} /><line x1="6" y1="18" x2="12" y2="18" {...s} /></>,
    cart: <><circle cx="9" cy="20" r="1.2" {...s} /><circle cx="17" cy="20" r="1.2" {...s} /><path d="M2 3h2l2.2 12.2a2 2 0 002 1.8h8.6a2 2 0 002-1.7L21 8H6" {...s} /></>,
    heart: <path d="M12 20s-7-4.3-9.5-8.7C.8 8 2.3 4.5 5.8 4a4.9 4.9 0 016.2 2 4.9 4.9 0 016.2-2c3.5.5 5 4 3.3 7.3C19 15.7 12 20 12 20z" {...s} />,
    star: <path d="M12 2.5l2.9 6 6.6.6-5 4.4 1.5 6.5L12 16.8 6 20l1.5-6.5-5-4.4 6.6-.6z" {...s} fill="currentColor" stroke="none" />,
    check: <><circle cx="12" cy="12" r="10" {...s} /><path d="M8 12.5l2.5 2.5L16 9.5" {...s} /></>,
    minus: <line x1="5" y1="12" x2="19" y2="12" {...s} />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" {...s} /><line x1="5" y1="12" x2="19" y2="12" {...s} /></>,
    trash: <><path d="M4 7h16" {...s} /><path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" {...s} /><path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" {...s} /></>,
    wa: <path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4.1-1.1z" {...s} />,
    ig: <><rect x="3" y="3" width="18" height="18" rx="5" {...s} /><circle cx="12" cy="12" r="4" {...s} /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" {...s} /><path d="M3 6l9 7 9-7" {...s} /></>,
    pin: <><path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" {...s} /><circle cx="12" cy="10" r="2.3" {...s} /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className}>
      {paths[name] || paths.tower}
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--fg)" }}>
      <Icon name="star" className="vx-star" />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "var(--mute)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

/* ------------------------------- VX mark --------------------------------- */
function VXMark({ size = 34, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={animated ? "vx-mark vx-mark--anim" : "vx-mark"}>
      <rect x="1" y="1" width="38" height="38" rx="9" className="vx-mark-bg" />
      <path className="vx-stroke vx-stroke-1" d="M9 11 L18 29" />
      <path className="vx-stroke vx-stroke-2" d="M20 11 L11 29" />
      <path className="vx-stroke vx-stroke-3" d="M22 29 L31 11" />
      <path className="vx-stroke vx-stroke-4" d="M22 11 L31 29" />
    </svg>
  );
}

/* -------------------------------- Navbar --------------------------------- */
function Navbar({ page, go, cartCount, compact }) {
  const [open, setOpen] = useState(false);
  const items = [
    ["home", "Home"], ["shop", "Shop"], ["service", "Service"],
    ["about", "About"], ["info", "Info"], ["contact", "Contact"],
  ];
  return (
    <header className={`vx-nav ${compact ? "vx-nav--compact" : ""}`}>
      <div className="vx-nav-inner">
        <button className="vx-brand" onClick={() => go("home")}>
          <VXMark size={compact ? 26 : 32} />
          <span className="vx-brand-text">VERTEX<span className="vx-brand-sub">COMPUTER</span></span>
        </button>
        <nav className="vx-nav-links">
          {items.map(([id, label]) => (
            <button key={id} className={`vx-nav-link ${page === id ? "is-active" : ""}`} onClick={() => go(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="vx-nav-actions">
          <button className="vx-icon-btn" onClick={() => go("cart")} aria-label="Keranjang">
            <Icon name="cart" />
            {cartCount > 0 && <span className="vx-badge-dot">{cartCount}</span>}
          </button>
          <button className="vx-icon-btn vx-nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <Icon name={open ? "minus" : "plus"} />
          </button>
        </div>
      </div>
      {open && (
        <div className="vx-nav-mobile">
          {items.map(([id, label]) => (
            <button key={id} className={`vx-nav-link ${page === id ? "is-active" : ""}`} onClick={() => { go(id); setOpen(false); }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

/* -------------------------------- Footer ---------------------------------- */
function Footer({ go }) {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-top">
        <div className="vx-footer-brand">
          <VXMark size={30} />
          <div>
            <div className="vx-brand-text">VERTEX<span className="vx-brand-sub">COMPUTER</span></div>
            <p className="vx-footer-tag">Solusi Komputer, Pilihan Terbaik!</p>
          </div>
        </div>
        <div className="vx-footer-cols">
          <div>
            <div className="vx-footer-h">Navigasi</div>
            <button onClick={() => go("shop")}>Shop</button>
            <button onClick={() => go("service")}>Service</button>
            <button onClick={() => go("about")}>About</button>
            <button onClick={() => go("info")}>Info</button>
          </div>
          <div>
            <div className="vx-footer-h">Kontak</div>
            <a href="#" onClick={(e) => e.preventDefault()}><Icon name="wa" /> WhatsApp</a>
            <a href="#" onClick={(e) => e.preventDefault()}><Icon name="ig" /> Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}><Icon name="mail" /> Email</a>
            <a href="#" onClick={(e) => e.preventDefault()}><Icon name="pin" /> Lokasi</a>
          </div>
        </div>
      </div>
      <div className="vx-footer-bottom">© 2026 Vertex Computer. All Rights Reserved.</div>
    </footer>
  );
}

/* ------------------------------ Product card ------------------------------ */
function ProductCard({ p, go, addToCart, wishlist, toggleWish }) {
  return (
    <div className="vx-card">
      {p.badge && <span className={`vx-tag ${p.badge === "Promo" ? "vx-tag--promo" : ""}`}>{p.badge}</span>}
      <button className={`vx-wish ${wishlist.includes(p.id) ? "is-on" : ""}`} onClick={() => toggleWish(p.id)} aria-label="Wishlist">
        <Icon name="heart" />
      </button>
      <button className="vx-card-media" onClick={() => go("product", p.id)}>
        <img
          className="vx-card-photo"
          src={imgFor(p)}
          alt={p.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
        <span className="vx-card-icon-fallback"><Icon name={p.icon} className="vx-card-icon" /></span>
      </button>
      <button className="vx-card-name" onClick={() => go("product", p.id)}>{p.name}</button>
      <div className="vx-card-meta">
        <Stars rating={p.rating} />
        <span className="vx-dot">·</span>
        <span className="vx-sold">{p.sold} terjual</span>
      </div>
      <div className="vx-card-price">
        <span className="vx-price">{fmt(p.price)}</span>
        {p.oldPrice && <span className="vx-price-old">{fmt(p.oldPrice)}</span>}
      </div>
      <div className="vx-card-stock">Stok {p.stock}</div>
      <div className="vx-card-actions">
        <button className="vx-btn vx-btn--ghost" onClick={() => addToCart(p.id, 1)}>+ Keranjang</button>
        <button className="vx-btn vx-btn--solid" onClick={() => { addToCart(p.id, 1); go("cart"); }}>Beli</button>
      </div>
    </div>
  );
}

/* --------------------------------- Pages ---------------------------------- */

function Home({ go }) {
  return (
    <>
      <section className="vx-hero">
        <div className="vx-hero-copy">
          <div className="vx-eyebrow">VERTEX COMPUTER</div>
          <h1 className="vx-hero-title">UPGRADE PERFORMA,<br />MAKSIMALKAN<br />POTENSIMU.</h1>
          <p className="vx-hero-sub">Solusi komputer untuk gaming, kerja, belajar, dan kebutuhan digital.</p>
          <div className="vx-hero-actions">
            <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("shop")}>Belanja Sekarang</button>
            <button className="vx-btn vx-btn--ghost vx-btn--lg" onClick={() => go("contact")}>Konsultasi Gratis</button>
          </div>
        </div>
        <div className="vx-hero-visual">
          <div className="vx-hero-ring" />
          <svg viewBox="0 0 200 220" className="vx-hero-rig">
            <rect x="40" y="10" width="120" height="200" rx="10" className="vx-rig-body" />
            <rect x="55" y="28" width="90" height="140" rx="3" className="vx-rig-panel" />
            <circle cx="100" cy="188" r="9" className="vx-rig-fan" />
            <circle cx="100" cy="188" r="3" className="vx-rig-fan-core" />
            <line x1="65" y1="45" x2="135" y2="45" className="vx-rig-line" />
            <line x1="65" y1="58" x2="120" y2="58" className="vx-rig-line" />
            <line x1="65" y1="80" x2="135" y2="150" className="vx-rig-line vx-rig-line--glow" />
          </svg>
        </div>
      </section>

      <section className="vx-strip">
        {[["Produk Berkualitas","Komponen original dengan performa teruji"],
          ["Harga Bersaing","Harga transparan, mudah dibandingkan"],
          ["Garansi Resmi","Klaim garansi cepat dan jelas"],
          ["Pelayanan Terbaik","Konsultasi sebelum & sesudah beli"]].map(([t, d]) => (
          <div className="vx-strip-item" key={t}>
            <div className="vx-strip-t">{t}</div>
            <div className="vx-strip-d">{d}</div>
          </div>
        ))}
      </section>

      <section className="vx-section">
        <div className="vx-section-head">
          <h2>Produk Pilihan</h2>
          <button className="vx-link" onClick={() => go("shop")}>Lihat semua →</button>
        </div>
        <div className="vx-grid vx-grid--preview">
          {PRODUCTS.slice(0, 4).map((p) => (
            <MiniCard key={p.id} p={p} go={go} />
          ))}
        </div>
      </section>

      <section className="vx-cta">
        <div>
          <h2>Butuh rakitan sesuai budget?</h2>
          <p>Konsultasi gratis dengan tim Vertex sebelum kamu checkout.</p>
        </div>
        <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("contact")}>Konsultasi Sekarang</button>
      </section>
    </>
  );
}

function MiniCard({ p, go }) {
  return (
    <button className="vx-mini" onClick={() => go("product", p.id)}>
      <div className="vx-mini-media">
        <img
          src={imgFor(p)}
          alt={p.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
        />
        <span className="vx-mini-icon-fallback"><Icon name={p.icon} className="vx-mini-icon" /></span>
      </div>
      <div className="vx-mini-name">{p.name}</div>
      <div className="vx-mini-price">{fmt(p.price)}</div>
    </button>
  );
}

function Shop({ go, addToCart, wishlist, toggleWish }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [maxPrice, setMaxPrice] = useState(20000000);
  const [sort, setSort] = useState("relevan");

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) =>
      (cat === "Semua" || p.cat === cat) &&
      p.price <= maxPrice &&
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "murah") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "mahal") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "terlaris") list = [...list].sort((a, b) => b.sold - a.sold);
    return list;
  }, [query, cat, maxPrice, sort]);

  return (
    <section className="vx-shop">
      <div className="vx-shop-head">
        <h1>VERTEX COMPUTER SHOP</h1>
        <div className="vx-search">
          <input placeholder="Cari produk…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="vx-shop-body">
        <aside className="vx-filters">
          <div className="vx-filter-block">
            <div className="vx-filter-h">Kategori</div>
            <button className={`vx-filter-opt ${cat === "Semua" ? "is-on" : ""}`} onClick={() => setCat("Semua")}>Semua</button>
            {CATEGORIES.map((c) => (
              <button key={c} className={`vx-filter-opt ${cat === c ? "is-on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="vx-filter-block">
            <div className="vx-filter-h">Harga maksimum</div>
            <input type="range" min="300000" max="20000000" step="100000" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
            <div className="vx-filter-price">{fmt(maxPrice)}</div>
          </div>
          <div className="vx-filter-block">
            <div className="vx-filter-h">Urutkan</div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevan">Relevan</option>
              <option value="murah">Harga terendah</option>
              <option value="mahal">Harga tertinggi</option>
              <option value="rating">Rating tertinggi</option>
              <option value="terlaris">Terlaris</option>
            </select>
          </div>
        </aside>

        <div className="vx-shop-grid-wrap">
          <div className="vx-shop-count">{filtered.length} produk ditemukan</div>
          <div className="vx-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} go={go} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} />
            ))}
            {filtered.length === 0 && <div className="vx-empty">Tidak ada produk yang cocok dengan filter ini.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductDetail({ id, go, addToCart }) {
  const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  useEffect(() => setQty(1), [id]);

  return (
    <section className="vx-detail">
      <button className="vx-back" onClick={() => go("shop")}>← Kembali ke Shop</button>
      <div className="vx-detail-grid">
        <div className="vx-detail-media">
          <img
            src={imgFor(p)}
            alt={p.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
          <span className="vx-detail-icon-fallback"><Icon name={p.icon} className="vx-detail-icon" /></span>
        </div>
        <div className="vx-detail-info">
          {p.badge && <span className={`vx-tag ${p.badge === "Promo" ? "vx-tag--promo" : ""}`}>{p.badge}</span>}
          <h1>{p.name}</h1>
          <div className="vx-detail-meta">
            <Stars rating={p.rating} /><span className="vx-dot">·</span>
            <span className="vx-sold">{p.sold} terjual</span><span className="vx-dot">·</span>
            <span className="vx-sold">Stok {p.stock}</span>
          </div>
          <div className="vx-card-price vx-detail-price">
            <span className="vx-price">{fmt(p.price)}</span>
            {p.oldPrice && <span className="vx-price-old">{fmt(p.oldPrice)}</span>}
          </div>
          <p className="vx-detail-desc">{p.desc}</p>

          <div className="vx-spec-strip">
            {p.specs.map(([k, v]) => (
              <div className="vx-spec-row" key={k}><span>{k}</span><span>{v}</span></div>
            ))}
          </div>

          <div className="vx-qty-row">
            <span>Jumlah</span>
            <div className="vx-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" /></button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))}><Icon name="plus" /></button>
            </div>
          </div>

          <div className="vx-card-actions vx-detail-actions">
            <button className="vx-btn vx-btn--ghost vx-btn--lg" onClick={() => addToCart(p.id, qty)}>Tambah ke Keranjang</button>
            <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => { addToCart(p.id, qty); go("cart"); }}>Beli Sekarang</button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="vx-section">
          <div className="vx-section-head"><h2>Produk Terkait</h2></div>
          <div className="vx-grid vx-grid--preview">
            {related.map((r) => <MiniCard key={r.id} p={r} go={go} />)}
          </div>
        </div>
      )}
    </section>
  );
}

function Cart({ cart, go, updateQty, removeItem }) {
  const items = cart.map((c) => ({ ...c, p: PRODUCTS.find((p) => p.id === c.id) })).filter((c) => c.p);
  const subtotal = items.reduce((sum, c) => sum + c.p.price * c.qty, 0);

  if (items.length === 0) {
    return (
      <section className="vx-cart vx-empty-state">
        <h1>KERANJANG</h1>
        <p>Keranjangmu masih kosong.</p>
        <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("shop")}>Mulai Belanja</button>
      </section>
    );
  }

  return (
    <section className="vx-cart">
      <h1>KERANJANG</h1>
      <div className="vx-cart-list">
        {items.map((c) => (
          <div className="vx-cart-row" key={c.id}>
            <div className="vx-cart-media">
              <img src={imgFor(c.p)} alt={c.p.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
              <span className="vx-cart-icon-fallback"><Icon name={c.p.icon} /></span>
            </div>
            <div className="vx-cart-name">
              <button onClick={() => go("product", c.id)}>{c.p.name}</button>
              <span className="vx-sold">{fmt(c.p.price)}</span>
            </div>
            <div className="vx-qty">
              <button onClick={() => updateQty(c.id, Math.max(1, c.qty - 1))}><Icon name="minus" /></button>
              <span>{c.qty}</span>
              <button onClick={() => updateQty(c.id, Math.min(c.p.stock, c.qty + 1))}><Icon name="plus" /></button>
            </div>
            <div className="vx-cart-subtotal">{fmt(c.p.price * c.qty)}</div>
            <button className="vx-icon-btn" onClick={() => removeItem(c.id)} aria-label="Hapus"><Icon name="trash" /></button>
          </div>
        ))}
      </div>
      <div className="vx-cart-summary">
        <div className="vx-cart-total-row"><span>Total belanja</span><span className="vx-price">{fmt(subtotal)}</span></div>
        <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("checkout")}>Checkout</button>
      </div>
    </section>
  );
}

function Checkout({ cart, go, clearCart }) {
  const items = cart.map((c) => ({ ...c, p: PRODUCTS.find((p) => p.id === c.id) })).filter((c) => c.p);
  const subtotal = items.reduce((sum, c) => sum + c.p.price * c.qty, 0);
  const shippingOptions = [["Reguler", 0], ["Express", 35000], ["Ambil di Toko", 0]];
  const [shipIdx, setShipIdx] = useState(0);
  const [payment, setPayment] = useState("Transfer Bank");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const shippingCost = shippingOptions[shipIdx][1];
  const total = subtotal + shippingCost;
  const canSubmit = form.name.trim() && form.phone.trim() && form.address.trim() && items.length > 0;

  return (
    <section className="vx-checkout">
      <h1>CHECKOUT</h1>
      <div className="vx-checkout-grid">
        <div className="vx-checkout-form">
          <div className="vx-field">
            <label>Nama</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
          </div>
          <div className="vx-field">
            <label>Nomor WhatsApp</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="vx-field">
            <label>Alamat</label>
            <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap pengiriman" />
          </div>
          <div className="vx-field">
            <label>Pilihan Pengiriman</label>
            <div className="vx-radio-group">
              {shippingOptions.map(([label, cost], i) => (
                <button key={label} className={`vx-radio ${shipIdx === i ? "is-on" : ""}`} onClick={() => setShipIdx(i)}>
                  {label} {cost > 0 ? `(${fmt(cost)})` : "(Gratis)"}
                </button>
              ))}
            </div>
          </div>
          <div className="vx-field">
            <label>Metode Pembayaran</label>
            <div className="vx-radio-group">
              {["Transfer Bank", "E-Wallet", "COD"].map((m) => (
                <button key={m} className={`vx-radio ${payment === m ? "is-on" : ""}`} onClick={() => setPayment(m)}>{m}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="vx-checkout-summary">
          <div className="vx-summary-h">Ringkasan Pesanan</div>
          {items.map((c) => (
            <div className="vx-summary-row" key={c.id}><span>{c.p.name} × {c.qty}</span><span>{fmt(c.p.price * c.qty)}</span></div>
          ))}
          <div className="vx-summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="vx-summary-row"><span>Pengiriman</span><span>{shippingCost > 0 ? fmt(shippingCost) : "Gratis"}</span></div>
          <div className="vx-summary-row vx-summary-total"><span>Total Pembayaran</span><span className="vx-price">{fmt(total)}</span></div>
          <button className="vx-btn vx-btn--solid vx-btn--lg" disabled={!canSubmit} onClick={() => { clearCart(); go("success"); }}>
            Buat Pesanan
          </button>
        </div>
      </div>
    </section>
  );
}

function Success({ go }) {
  return (
    <section className="vx-success">
      <div className="vx-success-check"><Icon name="check" /></div>
      <h1>Pesanan Berhasil Dibuat!</h1>
      <p>Tim Vertex akan menghubungi kamu lewat WhatsApp untuk konfirmasi pesanan.</p>
      <div className="vx-hero-actions">
        <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("shop")}>Belanja Lagi</button>
        <button className="vx-btn vx-btn--ghost vx-btn--lg" onClick={() => go("home")}>Kembali ke Home</button>
      </div>
    </section>
  );
}

function Service({ go }) {
  return (
    <section className="vx-page">
      <h1>SERVIS KOMPUTER</h1>
      <p className="vx-page-lead">Tim teknisi Vertex siap membantu, dari perbaikan ringan hingga rakitan custom.</p>
      <div className="vx-grid vx-grid--service">
        {SERVICES.map(([t, d]) => (
          <div className="vx-service-card" key={t}>
            <div className="vx-service-t">{t}</div>
            <div className="vx-service-d">{d}</div>
          </div>
        ))}
      </div>
      <div className="vx-cta">
        <div><h2>Butuh servis segera?</h2><p>Konsultasikan keluhan komputermu ke tim kami.</p></div>
        <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => go("contact")}>Konsultasi Servis</button>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="vx-page">
      <h1>ABOUT VERTEX COMPUTER</h1>
      <p className="vx-page-lead vx-about-copy">
        Vertex Computer adalah bisnis yang bergerak di bidang komputer dan teknologi. Kami menyediakan komponen,
        aksesoris, rakit PC, upgrade, serta layanan servis komputer.
      </p>
      <div className="vx-grid vx-grid--values">
        {[["Quality","Setiap komponen dipilih dan diuji sebelum sampai ke tangan pelanggan."],
          ["Trust","Transparansi harga dan status pesanan di setiap tahap."],
          ["Innovation","Mengikuti perkembangan hardware untuk rekomendasi terbaik."],
          ["Service","Dukungan konsultasi sebelum dan sesudah pembelian."]].map(([t, d]) => (
          <div className="vx-value-card" key={t}>
            <div className="vx-value-t">{t}</div>
            <div className="vx-value-d">{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info() {
  return (
    <section className="vx-page">
      <h1>INFO &amp; TEKNOLOGI</h1>
      <p className="vx-page-lead">Tips, review, dan berita seputar dunia komputer.</p>
      <div className="vx-grid vx-grid--articles">
        {ARTICLES.map((a) => (
          <div className="vx-article-card" key={a.title}>
            <span className="vx-tag">{a.tag}</span>
            <div className="vx-article-t">{a.title}</div>
            <div className="vx-article-e">{a.excerpt}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", cat: CATEGORIES[0], msg: "" });
  const [sent, setSent] = useState(false);
  return (
    <section className="vx-page">
      <h1>ADA YANG BISA KAMI BANTU?</h1>
      <div className="vx-contact-grid">
        <div className="vx-contact-channels">
          <a href="#" onClick={(e) => e.preventDefault()} className="vx-channel"><Icon name="wa" /><span>WhatsApp</span></a>
          <a href="#" onClick={(e) => e.preventDefault()} className="vx-channel"><Icon name="ig" /><span>Instagram</span></a>
          <a href="#" onClick={(e) => e.preventDefault()} className="vx-channel"><Icon name="mail" /><span>Email</span></a>
        </div>
        <div className="vx-checkout-form vx-contact-form">
          {sent ? (
            <div className="vx-empty-state" style={{ padding: "40px 0" }}>
              <div className="vx-success-check" style={{ margin: "0 auto 16px" }}><Icon name="check" /></div>
              <p>Pesan terkirim. Tim kami akan segera menghubungimu.</p>
            </div>
          ) : (
            <>
              <div className="vx-field"><label>Nama</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="vx-field"><label>Nomor WhatsApp</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="vx-field">
                <label>Kategori Kebutuhan</label>
                <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="Servis">Servis</option>
                </select>
              </div>
              <div className="vx-field"><label>Pesan</label><textarea rows={4} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} /></div>
              <button className="vx-btn vx-btn--solid vx-btn--lg" onClick={() => setSent(true)}>Kirim Pesan</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Audio ----------------------------------
   Expects two folders next to this page when you host it yourself:
     AUDIO/backsound.mp3   — looping background music
     SOUND/click.mp3       — short click sound
   Both are optional: if a file is missing, playback just fails silently
   (browsers also block autoplay until the visitor interacts once). */
function useAppAudio() {
  const bgmRef = useRef(null);
  const clickRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    bgmRef.current = new Audio("AUDIO/backsound.mp3");
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.35;
    clickRef.current = new Audio("SOUND/click.mp3");
    clickRef.current.volume = 0.5;
    return () => { bgmRef.current && bgmRef.current.pause(); };
  }, []);

  function ensureStarted() {
    if (started || muted) return;
    bgmRef.current?.play().catch(() => {});
    setStarted(true);
  }
  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (bgmRef.current) {
        if (next) bgmRef.current.pause();
        else { bgmRef.current.play().catch(() => {}); setStarted(true); }
      }
      return next;
    });
  }
  function playClick() {
    if (muted) return;
    const el = clickRef.current;
    if (!el) return;
    try { el.currentTime = 0; el.play().catch(() => {}); } catch (e) {}
  }

  return { ensureStarted, toggleMute, playClick, muted };
}

function SoundToggle({ muted, onToggle }) {
  return (
    <button className="vx-sound-toggle" onClick={onToggle} aria-label={muted ? "Aktifkan suara" : "Matikan suara"}>
      {muted ? (
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><line x1="16" y1="9" x2="21" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><line x1="21" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 9v6h4l5 5V4L8 9H4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M16 8.5a5 5 0 010 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      )}
    </button>
  );
}

/* --------------------------------- Loader --------------------------------- */
function Loader({ show }) {
  return (
    <div className={`vx-loader ${show ? "" : "vx-loader--out"}`}>
      <VXMark size={64} animated />
    </div>
  );
}

/* ---------------------------------- App ----------------------------------- */
export default function App() {
  useFonts();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(PRODUCTS[0].id);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compact, setCompact] = useState(false);
  const [entering, setEntering] = useState(true);
  const mainRef = useRef(null);
  const { ensureStarted, toggleMute, playClick, muted } = useAppAudio();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go(nextPage, productId) {
    if (productId) setSelected(productId);
    setEntering(false);
    requestAnimationFrame(() => {
      setPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      requestAnimationFrame(() => setEntering(true));
    });
  }

  function addToCart(id, qty) {
    setCart((c) => {
      const existing = c.find((i) => i.id === id);
      if (existing) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id, qty }];
    });
  }
  function updateQty(id, qty) { setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i))); }
  function removeItem(id) { setCart((c) => c.filter((i) => i.id !== id)); }
  function clearCart() { setCart([]); }
  function toggleWish(id) { setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])); }

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <div
      className="vx-root"
      onClickCapture={(e) => {
        ensureStarted();
        if (e.target.closest("button, a")) playClick();
      }}
    >
      <style>{CSS}</style>
      <Loader show={loading} />
      <SoundToggle muted={muted} onToggle={toggleMute} />
      <Navbar page={page} go={go} cartCount={cartCount} compact={compact} />
      <main ref={mainRef} className={`vx-main ${entering ? "vx-main--in" : "vx-main--out"}`}>
        {page === "home" && <Home go={go} />}
        {page === "shop" && <Shop go={go} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} />}
        {page === "product" && <ProductDetail id={selected} go={go} addToCart={addToCart} />}
        {page === "cart" && <Cart cart={cart} go={go} updateQty={updateQty} removeItem={removeItem} />}
        {page === "checkout" && <Checkout cart={cart} go={go} clearCart={clearCart} />}
        {page === "success" && <Success go={go} />}
        {page === "service" && <Service go={go} />}
        {page === "about" && <About />}
        {page === "info" && <Info />}
        {page === "contact" && <Contact />}
      </main>
      <Footer go={go} />
    </div>
  );
}

/* ----------------------------------- CSS ----------------------------------- */
const CSS = `
:root{
  --bg:#0A0A0B; --panel:#131315; --panel-2:#1A1A1D; --line:#232326;
  --mute:#8A8A90; --fg:#F4F4F5; --accent:#4DE3FF;
}
*{box-sizing:border-box;}
.vx-root{
  background:var(--bg); color:var(--fg); min-height:100vh;
  font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased;
}
/* Hard reset so buttons never fall back to browser default text color
   (this is what made some button labels appear to "disappear" — the
   browser's own button color was winning on :active/:focus in some
   browsers). Every button below now carries an explicit color at
   every state, and color/background never animate on the same
   transition as a click, only hover transform does. */
.vx-root button{
  appearance:none; -webkit-appearance:none; -moz-appearance:none;
  background-color:transparent; color:inherit; -webkit-text-fill-color:currentColor;
  font:inherit;
}
.vx-root button:focus{ outline:none; }
.vx-root button:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.vx-root input, .vx-root select, .vx-root textarea{ font-family:inherit; color:inherit; }
.vx-root h1,.vx-root h2{ font-family:'Space Grotesk',sans-serif; margin:0; }
@media (prefers-reduced-motion: reduce){ .vx-root *{ animation-duration:0.001ms !important; transition-duration:0.001ms !important; } }

/* sound toggle */
.vx-sound-toggle{ position:fixed; right:20px; bottom:20px; z-index:90; width:44px; height:44px; border-radius:50%; background:var(--panel-2); border:1px solid var(--line); color:var(--fg); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 22px rgba(0,0,0,.4); transition:transform .15s ease, border-color .2s; }
.vx-sound-toggle:hover{ transform:translateY(-2px) scale(1.05); border-color:var(--accent); }

/* loader */
.vx-loader{ position:fixed; inset:0; background:var(--bg); display:flex; align-items:center; justify-content:center; z-index:999; transition:opacity .6s ease, visibility .6s ease; }
.vx-loader--out{ opacity:0; visibility:hidden; pointer-events:none; }

/* VX mark */
.vx-mark{ display:block; }
.vx-mark-bg{ fill:var(--panel-2); stroke:var(--line); stroke-width:1; }
.vx-stroke{ stroke:var(--fg); stroke-width:3.4; stroke-linecap:round; fill:none; }
.vx-mark--anim .vx-stroke{ stroke-dasharray:30; stroke-dashoffset:30; animation:vxDraw 0.5s ease forwards; }
.vx-mark--anim .vx-stroke-1{ animation-delay:.05s; }
.vx-mark--anim .vx-stroke-2{ animation-delay:.15s; }
.vx-mark--anim .vx-stroke-3{ animation-delay:.25s; }
.vx-mark--anim .vx-stroke-4{ animation-delay:.35s; stroke:var(--accent); filter:drop-shadow(0 0 6px var(--accent)); }
@keyframes vxDraw{ to{ stroke-dashoffset:0; } }
.vx-mark:hover .vx-stroke-4{ filter:drop-shadow(0 0 10px var(--accent)); transition:filter .3s ease; }

/* navbar */
.vx-nav{ position:sticky; top:0; z-index:100; background:rgba(10,10,11,.82); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); transition:padding .3s ease; }
.vx-nav-inner{ max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:18px 24px; transition:padding .3s ease; }
.vx-nav--compact .vx-nav-inner{ padding:10px 24px; }
.vx-brand{ display:flex; align-items:center; gap:10px; background:none; border:none; cursor:pointer; }
.vx-brand-text{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; letter-spacing:.04em; line-height:1.1; display:block; text-align:left; }
.vx-brand-sub{ display:block; font-size:9px; font-weight:500; color:var(--mute); letter-spacing:.18em; }
.vx-nav-links{ display:flex; gap:4px; }
.vx-nav-link{ background:none; border:none; color:var(--mute); font-size:14px; padding:8px 14px; border-radius:20px; cursor:pointer; transition:color .2s, background .2s; }
.vx-nav-link:hover{ color:var(--fg); background:var(--panel-2); }
.vx-nav-link.is-active{ color:var(--bg); background:var(--fg); }
.vx-nav-actions{ display:flex; align-items:center; gap:6px; }
.vx-icon-btn{ position:relative; background:var(--panel-2); border:1px solid var(--line); width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--fg); transition:transform .15s ease, border-color .2s; }
.vx-icon-btn:hover{ transform:translateY(-2px); border-color:var(--fg); }
.vx-badge-dot{ position:absolute; top:-4px; right:-4px; background:var(--accent); color:#001318; font-size:10px; font-weight:700; min-width:17px; height:17px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; }
.vx-nav-burger{ display:none; }
.vx-nav-mobile{ display:none; }
@media (max-width:860px){
  .vx-nav-links{ display:none; }
  .vx-nav-burger{ display:flex; }
  .vx-nav-mobile{ display:flex; flex-direction:column; padding:8px 24px 18px; gap:2px; border-top:1px solid var(--line); }
  .vx-nav-mobile .vx-nav-link{ text-align:left; }
}

/* page transitions */
.vx-main{ max-width:1180px; margin:0 auto; padding:0 24px; opacity:0; transform:translateY(14px); }
.vx-main--in{ animation:vxFadeUp .5s cubic-bezier(.2,.7,.3,1) forwards; }
@keyframes vxFadeUp{ to{ opacity:1; transform:translateY(0); } }

/* shared bits */
.vx-btn{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:13.5px; letter-spacing:.02em; padding:11px 22px; border-radius:999px; border:1px solid var(--fg); cursor:pointer; transition:transform .15s ease, box-shadow .25s ease, background .2s, color .2s; }
.vx-btn--lg{ padding:14px 28px; font-size:14.5px; }
.vx-btn--solid{ background:var(--fg); color:var(--bg); }
.vx-btn--solid:hover{ transform:translateY(-2px); box-shadow:0 8px 24px rgba(244,244,245,.15); }
.vx-btn--ghost{ background:transparent; color:var(--fg); border-color:var(--line); }
.vx-btn--ghost:hover{ border-color:var(--fg); transform:translateY(-2px); }
.vx-btn:disabled{ opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; color:inherit; }
.vx-btn--solid:disabled{ color:var(--bg); }
.vx-link{ background:none; border:none; color:var(--mute); font-size:13.5px; cursor:pointer; }
.vx-link:hover{ color:var(--fg); }
.vx-dot{ color:var(--line); }
.vx-sold{ color:var(--mute); font-size:12.5px; }
.vx-price{ font-family:'JetBrains Mono',monospace; font-weight:500; font-size:16px; }
.vx-price-old{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:var(--mute); text-decoration:line-through; margin-left:8px; }
.vx-star{ width:14px; height:14px; }
.vx-tag{ display:inline-block; font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.05em; padding:4px 9px; border-radius:5px; background:var(--panel-2); border:1px solid var(--line); color:var(--mute); }
.vx-tag--promo{ color:#001318; background:var(--accent); border-color:var(--accent); }

/* hero */
.vx-hero{ display:grid; grid-template-columns:1.1fr .9fr; gap:40px; align-items:center; padding:64px 0 40px; }
.vx-eyebrow{ font-family:'JetBrains Mono',monospace; font-size:11.5px; letter-spacing:.22em; color:var(--mute); margin-bottom:18px; }
.vx-hero-title{ font-size:clamp(32px,4.6vw,56px); font-weight:700; line-height:1.06; letter-spacing:-.01em; }
.vx-hero-sub{ color:var(--mute); font-size:16px; max-width:440px; margin:20px 0 30px; line-height:1.6; }
.vx-hero-actions{ display:flex; gap:12px; flex-wrap:wrap; }
.vx-hero-visual{ position:relative; display:flex; align-items:center; justify-content:center; min-height:280px; }
.vx-hero-ring{ position:absolute; width:260px; height:260px; border:1px solid var(--line); border-radius:50%; animation:vxSpin 26s linear infinite; }
.vx-hero-ring::before{ content:""; position:absolute; inset:-1px; border-radius:50%; border-top:1px solid var(--accent); opacity:.5; }
@keyframes vxSpin{ to{ transform:rotate(360deg); } }
.vx-hero-rig{ width:200px; height:220px; position:relative; animation:vxFloat 5s ease-in-out infinite; }
@keyframes vxFloat{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-10px);} }
.vx-rig-body{ fill:var(--panel); stroke:var(--line); stroke-width:1.5; }
.vx-rig-panel{ fill:var(--panel-2); stroke:var(--line); stroke-width:1; }
.vx-rig-line{ stroke:var(--line); stroke-width:1.5; }
.vx-rig-line--glow{ stroke:var(--accent); filter:drop-shadow(0 0 5px var(--accent)); opacity:.8; }
.vx-rig-fan{ fill:none; stroke:var(--mute); stroke-width:1; animation:vxSpin 4s linear infinite; transform-origin:100px 188px; }
.vx-rig-fan-core{ fill:var(--accent); }

/* feature strip */
.vx-strip{ display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--line); border:1px solid var(--line); border-radius:16px; overflow:hidden; margin:20px 0 60px; }
.vx-strip-item{ background:var(--panel); padding:22px 20px; }
.vx-strip-t{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14.5px; margin-bottom:6px; }
.vx-strip-d{ font-size:12.5px; color:var(--mute); line-height:1.5; }
@media (max-width:760px){ .vx-strip{ grid-template-columns:repeat(2,1fr);} }

/* section */
.vx-section{ padding:36px 0; }
.vx-section-head{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:22px; }
.vx-section-head h2{ font-size:24px; }

/* mini card */
.vx-grid--preview{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
@media (max-width:900px){ .vx-grid--preview{ grid-template-columns:repeat(2,1fr);} }
.vx-mini{ background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px; text-align:left; cursor:pointer; transition:transform .2s ease, border-color .2s; }
.vx-mini:hover{ transform:translateY(-4px); border-color:var(--mute); }
.vx-mini-media{ position:relative; height:110px; border-radius:10px; overflow:hidden; background:var(--panel-2); border:1px solid var(--line); margin-bottom:14px; }
.vx-mini-media img{ width:100%; height:100%; object-fit:cover; filter:grayscale(.25) contrast(1.05); transition:transform .4s ease, filter .3s ease; }
.vx-mini:hover .vx-mini-media img{ transform:scale(1.08); filter:grayscale(0); }
.vx-mini-icon-fallback{ display:none; align-items:center; justify-content:center; position:absolute; inset:0; }
.vx-mini-icon{ width:30px; height:30px; color:var(--mute); transition:color .2s; }
.vx-mini:hover .vx-mini-icon{ color:var(--accent); }
.vx-mini-name{ font-size:13px; margin-bottom:8px; line-height:1.4; min-height:36px; }
.vx-mini-price{ font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--fg); }

/* cta */
.vx-cta{ display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; background:var(--panel); border:1px solid var(--line); border-radius:20px; padding:34px 36px; margin:20px 0 60px; }
.vx-cta h2{ font-size:22px; margin-bottom:6px; }
.vx-cta p{ color:var(--mute); margin:0; font-size:14px; }

/* shop */
.vx-shop{ padding:44px 0 60px; }
.vx-shop-head{ display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:30px; }
.vx-shop-head h1{ font-size:30px; letter-spacing:-.01em; }
.vx-search input{ background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:12px 20px; width:280px; font-size:13.5px; outline:none; transition:border-color .2s; }
.vx-search input:focus{ border-color:var(--fg); }
.vx-shop-body{ display:grid; grid-template-columns:220px 1fr; gap:32px; align-items:start; }
@media (max-width:860px){ .vx-shop-body{ grid-template-columns:1fr; } }
.vx-filters{ position:sticky; top:100px; }
.vx-filter-block{ margin-bottom:26px; }
.vx-filter-h{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--mute); margin-bottom:10px; }
.vx-filter-opt{ display:block; width:100%; text-align:left; background:none; border:none; color:var(--mute); font-size:13.5px; padding:6px 0; cursor:pointer; transition:color .2s; }
.vx-filter-opt:hover{ color:var(--fg); }
.vx-filter-opt.is-on{ color:var(--fg); font-weight:600; }
.vx-filter-opt.is-on::before{ content:"— "; color:var(--accent); }
.vx-filter-price{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:var(--mute); margin-top:6px; }
.vx-filter-block select{ width:100%; background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:9px 10px; font-size:13px; }
.vx-shop-count{ font-size:12.5px; color:var(--mute); margin-bottom:16px; font-family:'JetBrains Mono',monospace; }
.vx-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:1040px){ .vx-grid{ grid-template-columns:repeat(2,1fr);} }
@media (max-width:560px){ .vx-grid{ grid-template-columns:1fr;} }
.vx-empty{ grid-column:1/-1; color:var(--mute); padding:40px; text-align:center; border:1px dashed var(--line); border-radius:14px; }

/* product card */
.vx-card{ position:relative; background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:18px; display:flex; flex-direction:column; transition:transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
.vx-card:hover{ transform:translateY(-5px); border-color:var(--mute); box-shadow:0 14px 30px rgba(0,0,0,.35); }
.vx-card .vx-tag{ position:absolute; top:14px; left:14px; z-index:2; }
.vx-wish{ position:absolute; top:12px; right:12px; z-index:2; background:rgba(19,19,21,.8); border:1px solid var(--line); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--mute); cursor:pointer; transition:color .2s, transform .2s; }
.vx-wish:hover{ transform:scale(1.08); }
.vx-wish.is-on{ color:var(--accent); border-color:var(--accent); }
.vx-card-media{ position:relative; background:var(--panel-2); border:1px solid var(--line); border-radius:12px; height:150px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; cursor:pointer; overflow:hidden; padding:0; }
.vx-card-photo{ width:100%; height:100%; object-fit:cover; transition:transform .4s ease, filter .3s ease; filter:grayscale(.25) contrast(1.05); }
.vx-card-media:hover .vx-card-photo{ transform:scale(1.08); filter:grayscale(0) contrast(1.1); }
.vx-card-icon-fallback{ display:none; align-items:center; justify-content:center; width:100%; height:100%; }
.vx-card-icon{ width:56px; height:56px; color:var(--mute); transition:transform .35s ease, color .3s ease; }
.vx-card-media:hover .vx-card-icon{ transform:scale(1.15) rotate(-3deg); color:var(--accent); }
.vx-card-name{ background:none; border:none; text-align:left; color:var(--fg); font-size:13.5px; line-height:1.4; cursor:pointer; margin-bottom:8px; min-height:38px; }
.vx-card-name:hover{ color:var(--accent); }
.vx-card-meta{ display:flex; align-items:center; gap:6px; margin-bottom:8px; }
.vx-card-price{ margin-bottom:4px; }
.vx-card-stock{ font-size:11.5px; color:var(--mute); margin-bottom:14px; }
.vx-card-actions{ display:flex; gap:8px; margin-top:auto; }
.vx-card-actions .vx-btn{ flex:1; padding:10px 10px; font-size:12.5px; text-align:center; }

/* product detail */
.vx-detail{ padding:32px 0 50px; }
.vx-back{ background:none; border:none; color:var(--mute); font-size:13px; cursor:pointer; margin-bottom:20px; }
.vx-back:hover{ color:var(--fg); }
.vx-detail-grid{ display:grid; grid-template-columns:1fr 1fr; gap:44px; }
@media (max-width:860px){ .vx-detail-grid{ grid-template-columns:1fr; } }
.vx-detail-media{ position:relative; background:var(--panel); border:1px solid var(--line); border-radius:18px; height:380px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.vx-detail-media img{ width:100%; height:100%; object-fit:cover; filter:grayscale(.2) contrast(1.05); }
.vx-detail-icon-fallback{ display:none; align-items:center; justify-content:center; position:absolute; inset:0; }
.vx-detail-icon{ width:120px; height:120px; color:var(--mute); }
.vx-detail-info h1{ font-size:26px; margin:12px 0 10px; line-height:1.25; }
.vx-detail-meta{ display:flex; align-items:center; gap:6px; margin-bottom:16px; }
.vx-detail-price{ margin-bottom:16px; }
.vx-detail-price .vx-price{ font-size:24px; }
.vx-detail-desc{ color:var(--mute); font-size:14px; line-height:1.7; margin-bottom:22px; }
.vx-spec-strip{ border-top:1px solid var(--line); margin-bottom:24px; }
.vx-spec-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-family:'JetBrains Mono',monospace; font-size:12.5px; }
.vx-spec-row span:first-child{ color:var(--mute); }
.vx-qty-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; font-size:13.5px; }
.vx-qty{ display:flex; align-items:center; gap:14px; background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:6px 14px; }
.vx-qty button{ background:none; border:none; color:var(--fg); cursor:pointer; display:flex; }
.vx-qty span{ font-family:'JetBrains Mono',monospace; min-width:16px; text-align:center; }
.vx-detail-actions{ gap:12px; }

/* cart */
.vx-cart{ padding:40px 0 60px; max-width:900px; margin:0 auto; }
.vx-cart h1, .vx-checkout h1, .vx-page h1, .vx-success h1{ font-size:28px; margin-bottom:26px; letter-spacing:-.01em; }
.vx-cart-list{ display:flex; flex-direction:column; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:16px; overflow:hidden; margin-bottom:26px; }
.vx-cart-row{ background:var(--panel); display:grid; grid-template-columns:56px 1fr auto auto auto; align-items:center; gap:16px; padding:14px 16px; }
@media (max-width:640px){ .vx-cart-row{ grid-template-columns:44px 1fr; grid-template-areas:"media name" "qty subtotal" "trash trash"; } }
.vx-cart-media{ position:relative; width:56px; height:56px; border-radius:10px; background:var(--panel-2); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; color:var(--mute); overflow:hidden; }
.vx-cart-media img{ width:100%; height:100%; object-fit:cover; filter:grayscale(.25); }
.vx-cart-icon-fallback{ display:none; align-items:center; justify-content:center; position:absolute; inset:0; }
.vx-cart-name{ display:flex; flex-direction:column; gap:4px; }
.vx-cart-name button{ background:none; border:none; color:var(--fg); text-align:left; font-size:13.5px; cursor:pointer; padding:0; }
.vx-cart-name button:hover{ color:var(--accent); }
.vx-cart-subtotal{ font-family:'JetBrains Mono',monospace; font-size:13.5px; }
.vx-cart-summary{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:24px; }
.vx-cart-total-row{ display:flex; justify-content:space-between; align-items:center; font-size:15px; margin-bottom:18px; }
.vx-empty-state{ text-align:center; padding:80px 20px; }
.vx-empty-state p{ color:var(--mute); margin:0 0 24px; }

/* checkout */
.vx-checkout{ padding:40px 0 60px; }
.vx-checkout-grid{ display:grid; grid-template-columns:1.3fr .8fr; gap:36px; align-items:start; }
@media (max-width:900px){ .vx-checkout-grid{ grid-template-columns:1fr; } }
.vx-field{ margin-bottom:18px; }
.vx-field label{ display:block; font-size:12px; color:var(--mute); margin-bottom:8px; letter-spacing:.03em; }
.vx-field input, .vx-field textarea, .vx-field select{ width:100%; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 14px; font-size:13.5px; outline:none; resize:vertical; transition:border-color .2s; }
.vx-field input:focus, .vx-field textarea:focus, .vx-field select:focus{ border-color:var(--fg); }
.vx-radio-group{ display:flex; flex-wrap:wrap; gap:8px; }
.vx-radio{ background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:9px 16px; font-size:12.5px; cursor:pointer; color:var(--mute); transition:.2s; }
.vx-radio:hover{ color:var(--fg); }
.vx-radio.is-on{ background:var(--fg); color:var(--bg); border-color:var(--fg); }
.vx-checkout-summary{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:24px; position:sticky; top:100px; }
.vx-summary-h{ font-family:'Space Grotesk',sans-serif; font-weight:600; margin-bottom:14px; }
.vx-summary-row{ display:flex; justify-content:space-between; font-size:12.5px; color:var(--mute); padding:7px 0; }
.vx-summary-total{ border-top:1px solid var(--line); margin-top:6px; padding-top:14px; color:var(--fg); font-size:14px; }
.vx-checkout-summary .vx-btn{ width:100%; margin-top:18px; }

/* success */
.vx-success{ text-align:center; padding:100px 20px; max-width:520px; margin:0 auto; }
.vx-success-check{ width:76px; height:76px; border-radius:50%; background:var(--panel); border:1px solid var(--accent); color:var(--accent); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; animation:vxPop .5s cubic-bezier(.2,1.4,.4,1); box-shadow:0 0 30px rgba(77,227,255,.25); }
.vx-success-check svg{ width:36px; height:36px; }
@keyframes vxPop{ 0%{ transform:scale(0); } 70%{ transform:scale(1.15); } 100%{ transform:scale(1); } }
.vx-success p{ color:var(--mute); margin:0 0 26px; }

/* generic page */
.vx-page{ padding:44px 0 60px; }
.vx-page h1{ font-size:30px; }
.vx-page-lead{ color:var(--mute); font-size:14.5px; max-width:560px; margin:12px 0 32px; line-height:1.6; }
.vx-about-copy{ max-width:720px; font-size:16px; }

/* service */
.vx-grid--service{ grid-template-columns:repeat(4,1fr); }
@media (max-width:940px){ .vx-grid--service{ grid-template-columns:repeat(2,1fr);} }
@media (max-width:560px){ .vx-grid--service{ grid-template-columns:1fr;} }
.vx-service-card{ background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:20px; transition:transform .2s, border-color .2s; }
.vx-service-card:hover{ transform:translateY(-4px); border-color:var(--mute); }
.vx-service-t{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14.5px; margin-bottom:8px; }
.vx-service-d{ font-size:12.5px; color:var(--mute); line-height:1.55; }

/* values */
.vx-grid--values{ grid-template-columns:repeat(4,1fr); }
@media (max-width:860px){ .vx-grid--values{ grid-template-columns:repeat(2,1fr);} }
.vx-value-card{ border-top:2px solid var(--fg); padding-top:14px; }
.vx-value-t{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:16px; margin-bottom:8px; }
.vx-value-d{ font-size:12.5px; color:var(--mute); line-height:1.6; }

/* articles */
.vx-grid--articles{ grid-template-columns:repeat(3,1fr); }
@media (max-width:900px){ .vx-grid--articles{ grid-template-columns:repeat(2,1fr);} }
@media (max-width:600px){ .vx-grid--articles{ grid-template-columns:1fr;} }
.vx-article-card{ background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:20px; transition:transform .2s, border-color .2s; }
.vx-article-card:hover{ transform:translateY(-4px); border-color:var(--mute); }
.vx-article-t{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600; margin:12px 0 8px; line-height:1.4; }
.vx-article-e{ font-size:12.5px; color:var(--mute); line-height:1.55; }

/* contact */
.vx-contact-grid{ display:grid; grid-template-columns:.7fr 1.3fr; gap:36px; }
@media (max-width:820px){ .vx-contact-grid{ grid-template-columns:1fr; } }
.vx-contact-channels{ display:flex; flex-direction:column; gap:10px; }
.vx-channel{ display:flex; align-items:center; gap:12px; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px; color:var(--fg); text-decoration:none; font-size:13.5px; transition:transform .2s, border-color .2s; }
.vx-channel:hover{ transform:translateX(4px); border-color:var(--mute); }
.vx-contact-form{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:24px; }

/* footer */
.vx-footer{ border-top:1px solid var(--line); margin-top:20px; }
.vx-footer-top{ max-width:1180px; margin:0 auto; padding:44px 24px 24px; display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap; }
.vx-footer-brand{ display:flex; align-items:center; gap:12px; }
.vx-footer-tag{ color:var(--mute); font-size:12.5px; margin:4px 0 0; }
.vx-footer-cols{ display:flex; gap:60px; flex-wrap:wrap; }
.vx-footer-h{ font-size:11.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--mute); margin-bottom:12px; }
.vx-footer-cols button, .vx-footer-cols a{ display:flex; align-items:center; gap:8px; background:none; border:none; color:var(--mute); text-decoration:none; font-size:13px; padding:5px 0; cursor:pointer; text-align:left; }
.vx-footer-cols button:hover, .vx-footer-cols a:hover{ color:var(--fg); }
.vx-footer-bottom{ text-align:center; font-size:11.5px; color:var(--mute); border-top:1px solid var(--line); padding:16px; font-family:'JetBrains Mono',monospace; }
`;
