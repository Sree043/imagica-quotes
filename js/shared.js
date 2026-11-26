// Shared helpers used by both the quote builder (index.html) and the proposal page (proposal.html).

const IQ = (() => {
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const inr = (n) => money.format(Math.round(Number(n) || 0));

  const SIDES = ["Bride's side", "Groom's side", "Both sides", "Common event"];
  const CATEGORIES = [
    { key: "coverage", label: "Crew & Coverage" },
    { key: "deliverable", label: "Deliverables" },
    { key: "addon", label: "Add-ons" },
  ];
  const EVENT_NAMES = ["Engagement", "Betrothal", "Haldi", "Mehendi / Mylanchi", "Sangeet", "Wedding", "Nikah", "Reception", "Pre-Wedding Shoot", "Post-Wedding Shoot"];
  const WEDDING_TYPES = ["Hindu Wedding", "Christian Wedding", "Muslim Wedding", "Engagement", "Destination Wedding", "Other"];

  const uid = () =>
    (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

  const clone = (x) => JSON.parse(JSON.stringify(x));

  const itemTotal = (i) => (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0);
  const sum = (items) => (items || []).reduce((t, i) => t + itemTotal(i), 0);

  function totals(q, s) {
    const events = (q.events || []).reduce((t, e) => t + sum(e.items), 0);
    const extras = sum(q.extras);
    const travel = Number(q.travel) || 0;
    const subtotal = events + extras + travel;
    const discount = Math.min(Number(q.discount) || 0, subtotal);
    const taxable = Math.max(subtotal - discount, 0);
    const gstRate = q.includeGST ? Number(s.gstRate) || 0 : 0;
    const gst = Math.round((taxable * gstRate) / 100);
    const grand = taxable + gst;
    const advance = Math.round((grand * (Number(s.advancePercent) || 0)) / 100);
    return { events, extras, travel, subtotal, discount, gstRate, gst, grand, advance, balance: Math.max(grand - advance, 0) };
  }

  // Dates are stored as "YYYY-MM-DD" (local, no time zone surprises).
  function parseDay(str) {
    if (!str) return null;
    const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const fmt = (d, opts) => (d ? d.toLocaleDateString("en-IN", opts) : "");
  const shortDay = (str) => fmt(parseDay(str), { day: "numeric", month: "short", year: "numeric" });
  const longDay = (str) => fmt(parseDay(str), { day: "numeric", month: "long", year: "numeric" });
  const toDayString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const addDays = (str, n) => {
    const d = parseDay(str) || new Date();
    d.setDate(d.getDate() + n);
    return toDayString(d);
  };

  function validUntil(q, s) {
    const created = new Date(q.createdAt || Date.now());
    created.setDate(created.getDate() + (Number(s.validityDays) || 15));
    return toDayString(created);
  }

  const waDigits = (phone) => {
    const d = String(phone || "").replace(/\D/g, "");
    return d.length === 10 ? "91" + d : d;
  };
  const waLink = (phone, text) =>
    `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---- Proposal links: the whole proposal is packed into the URL (#p=...) ----
  // Nothing is stored on a server; the link itself carries the proposal.

  const packItem = (i) => [i.name, i.detail || "", Number(i.unitPrice) || 0, Number(i.quantity) || 0];
  const unpackItem = (a) => ({ name: a[0], detail: a[1], unitPrice: a[2], quantity: a[3] });

  function absoluteURL(path) {
    if (!path) return "";
    try { return new URL(path, location.href).href; } catch { return path; }
  }

  function pack(q, s) {
    const settings = {
      name: s.name, tagline: s.tagline, phone1: s.phone1, phone2: s.phone2, instagram: s.instagram, website: s.website,
      gstRate: s.gstRate, advancePercent: s.advancePercent, validityDays: s.validityDays, terms: s.terms,
      contactPerson: s.contactPerson, welcomeMessage: s.welcomeMessage, stats: s.stats,
      coverPhoto: absoluteURL(s.coverPhoto), galleryPhotos: (s.galleryPhotos || []).filter(Boolean).map(absoluteURL),
    };
    return {
      v: 1, n: q.number, d: q.createdAt, c: q.clientName, p: q.phone, w: q.weddingType,
      e: (q.events || []).map((e) => [e.name, e.date, e.venue || "", e.side, (e.items || []).filter((i) => i.quantity > 0).map(packItem)]),
      x: (q.extras || []).filter((i) => i.quantity > 0).map(packItem),
      t: Number(q.travel) || 0, ds: Number(q.discount) || 0, g: !!q.includeGST, no: q.notes || "", s: settings,
    };
  }

  function unpack(p) {
    return {
      quote: {
        number: p.n, createdAt: p.d, clientName: p.c, phone: p.p, weddingType: p.w,
        events: (p.e || []).map((e) => ({ name: e[0], date: e[1], venue: e[2], side: e[3], items: (e[4] || []).map(unpackItem) })),
        extras: (p.x || []).map(unpackItem), travel: p.t, discount: p.ds, includeGST: p.g, notes: p.no,
      },
      settings: p.s,
    };
  }

  const encode = (q, s) => LZString.compressToEncodedURIComponent(JSON.stringify(pack(q, s)));
  const decode = (str) => unpack(JSON.parse(LZString.decompressFromEncodedURIComponent(str)));
  const proposalURL = (q, s) => new URL("proposal.html", location.href).href.split("#")[0] + "#p=" + encode(q, s);

  return {
    inr, SIDES, CATEGORIES, EVENT_NAMES, WEDDING_TYPES, uid, clone, itemTotal, sum, totals,
    parseDay, shortDay, longDay, toDayString, addDays, validUntil, waDigits, waLink, esc,
    pack, unpack, encode, decode, proposalURL,
  };
})();
