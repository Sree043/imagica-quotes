// Renders the client-facing proposal from the link (#p=...). Works on phones, and prints to an A4 PDF.

(() => {
  const { esc, inr } = IQ;

  // ---------- Icons (inline SVG so they also appear in the PDF) ----------
  const ICONS = {
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
    drone: '<circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.5 5.5a9 9 0 000 13M18.5 5.5a9 9 0 010 13"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    frame: '<rect x="4" y="3" width="16" height="18" rx="1"/><rect x="7.5" y="6.5" width="9" height="11"/>',
    album: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    drive: '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="5" y="8" width="14" height="14" rx="2"/>',
    sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    pin: '<path d="M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
    chat: '<path d="M4 20l1.4-4A8 8 0 1112 20a8 8 0 01-3.7-.9z"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  };
  const icon = (name, cls = "ico") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkle}</svg>`;

  function iconFor(name) {
    const n = String(name || "").toLowerCase();
    if (n.includes("drone")) return "drone";
    if (n.includes("live")) return "live";
    if (n.includes("cinemat") || n.includes("video")) return "video";
    if (n.includes("photographer") || n.includes("photography")) return "camera";
    if (n.includes("reel") || n.includes("teaser")) return "play";
    if (n.includes("highlight") || n.includes("film")) return "film";
    if (n.includes("frame")) return "frame";
    if (n.includes("album")) return "album";
    if (n.includes("save-the-date") || n.includes("save the date")) return "calendar";
    if (n.includes("shoot")) return "heart";
    if (n.includes("led")) return "tv";
    if (n.includes("same-day") || n.includes("same day")) return "bolt";
    if (n.includes("drive")) return "drive";
    return "sparkle";
  }

  // ---------- Helpers ----------
  const day = (str, opts) => { const d = IQ.parseDay(str); return d ? d.toLocaleDateString("en-IN", opts) : ""; };
  const listJoin = (names) => {
    const n = names.filter(Boolean);
    if (n.length <= 1) return n[0] || "celebrations";
    return n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
  };
  const fmtPct = (v) => String(Number(v) || 0).replace(/\.0+$/, "");
  const site = (s) => (s.website ? (s.website.startsWith("http") ? s.website : "https://" + s.website) : "");
  const insta = (s) => {
    const h = String(s.instagram || "").trim().replace(/^@/, "");
    return h ? "https://instagram.com/" + h : "";
  };
  const firstWord = (s) => String(s || "").split(" ")[0];

  function dateRange(events) {
    const dates = events.map((e) => e.date).filter(Boolean).sort();
    if (!dates.length) return "";
    const a = IQ.parseDay(dates[0]), b = IQ.parseDay(dates[dates.length - 1]);
    if (dates[0] === dates[dates.length - 1]) return day(dates[0], { day: "numeric", month: "long", year: "numeric" });
    const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (sameMonth) return `${a.getDate()} – ${day(dates[dates.length - 1], { day: "numeric", month: "long", year: "numeric" })}`;
    return `${day(dates[0], { day: "numeric", month: "short" })} – ${day(dates[dates.length - 1], { day: "numeric", month: "short", year: "numeric" })}`;
  }

  // ---------- Sections ----------
  function cover(q, s) {
    const photo = s.coverPhoto ? `<img class="cover-photo" src="${esc(s.coverPhoto)}" alt="">` : "";
    return `
    <section class="cover ${s.coverPhoto ? "has-photo" : ""}">
      ${photo}
      <div class="cover-shade"></div>
      <div class="cover-frame"></div>
      <img class="cover-logo" src="assets/logo-gold.png" alt="${esc(s.name)}">
      <div class="cover-text">
        <div class="eyebrow">Wedding Photography &amp; Films</div>
        <div class="cover-for">A proposal prepared exclusively for</div>
        <h1 class="cover-name">${esc(q.clientName || "You")}</h1>
        <div class="cover-rule"></div>
        <div class="cover-meta">${esc([dateRange(q.events), q.weddingType].filter(Boolean).join("  ·  "))}</div>
        <div class="cover-small">Proposal ${esc(q.number)} · ${esc(day(String(q.createdAt).slice(0, 10), { day: "numeric", month: "long", year: "numeric" }))}</div>
      </div>
      <div class="scroll-cue">Scroll to view your proposal ↓</div>
    </section>`;
  }

  function title(text) {
    return `<h2 class="section-title"><span>${esc(text)}</span></h2>`;
  }

  function letter(q, s) {
    const message = String(s.welcomeMessage || "").replace(/\{events\}/g, listJoin(q.events.map((e) => e.name)));
    const signature = s.contactPerson ? s.contactPerson : `Team ${s.name}`;
    return `
    <section class="block letter">
      <p class="dear">Dear ${esc(q.clientName || "friends")},</p>
      <p class="letter-body">${esc(message)}</p>
      <div class="sign">
        <div class="sign-with">With warmth,</div>
        <div class="sign-name">${esc(signature)}</div>
        ${s.contactPerson ? `<div class="sign-small">${esc(s.name)} · ${esc(s.phone1)}</div>` : ""}
      </div>
    </section>`;
  }

  function glance(q) {
    if (!q.events.length) return "";
    const cards = q.events.map((e) => `
      <div class="glance-card">
        <div class="glance-date">
          <span class="glance-day">${esc(day(e.date, { day: "numeric" }))}</span>
          <span class="glance-month">${esc(day(e.date, { month: "short", year: "numeric" }).toUpperCase())}<br><em>${esc(day(e.date, { weekday: "long" }))}</em></span>
        </div>
        <div class="glance-name">${esc(e.name)}</div>
        <div class="glance-side">${esc(e.side || "")}</div>
        ${e.venue ? `<div class="glance-venue">${icon("pin", "ico tiny")} ${esc(e.venue)}</div>` : ""}
      </div>`).join("");
    return `<section class="block">${title("Your celebration at a glance")}<div class="glance">${cards}</div></section>`;
  }

  // The client proposal shows WHAT is included, not individual prices — only the total investment.
  function itemRow(i) {
    return `
      <div class="item">
        <span class="badge-ico">${icon(iconFor(i.name))}</span>
        <div class="item-main">
          <div class="item-name">${esc(i.name || "Item")}</div>
          ${i.detail ? `<div class="item-detail">${esc(i.detail)}</div>` : ""}
        </div>
        <div class="item-count">${i.quantity}<span>${i.quantity > 1 ? " nos." : " no."}</span></div>
      </div>`;
  }

  function coverage(q) {
    if (!q.events.length) return "";
    const events = q.events.map((e) => `
      <div class="event-card">
        <div class="event-top">
          <div>
            <h3>${esc(e.name)}</h3>
            <div class="event-meta">${esc([day(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), e.side, e.venue].filter(Boolean).join("  ·  "))}</div>
          </div>
        </div>
        <div class="items">${e.items.length ? e.items.map(itemRow).join("") : `<div class="item-detail">Crew to be confirmed</div>`}</div>
      </div>`).join("");
    return `<section class="block">${title("Coverage plan")}${events}</section>`;
  }

  function deliverables(q) {
    if (!q.extras.length) return "";
    const cards = q.extras.map((i) => `
      <div class="deliv">
        <span class="badge-ico big">${icon(iconFor(i.name))}</span>
        <div>
          <div class="item-name">${esc(i.name || "Item")} ${i.quantity > 1 ? `<span class="qty">×${i.quantity}</span>` : ""}</div>
          ${i.detail ? `<div class="item-detail">${esc(i.detail)}</div>` : ""}
        </div>
      </div>`).join("");
    return `<section class="block">${title("What you'll receive")}<div class="deliv-grid">${cards}</div></section>`;
  }

  function investment(q, s, t) {
    const included = [
      q.events.length === 1 ? "your event" : `your ${q.events.length} events`,
      q.extras.length ? "all deliverables listed above" : "",
      t.travel > 0 ? "travel & stay" : "",
    ].filter(Boolean);
    return `
    <section class="block">
      ${title("Your investment")}
      <div class="total-card">
        <div>
          <div class="total-label">Total investment</div>
          <div class="total-sub">Includes ${esc(listJoin(included))}</div>
        </div>
        <div class="total-amount">${inr(t.grand)}</div>
      </div>
    </section>`;
  }

  function confirmBlock(q, s) {
    const text = `Hi ${s.name}! We'd like to confirm our booking for proposal ${q.number}${q.clientName ? ` (${q.clientName})` : ""}.`;
    const valid = day(IQ.validUntil(q, s), { day: "numeric", month: "long", year: "numeric" });
    return `
    <section class="block">
      <a class="cta" href="${esc(IQ.waLink(s.phone1, text))}" target="_blank" rel="noopener">
        <span class="cta-ico">${icon("chat")}</span>
        <span class="cta-text"><strong>Ready to lock in your date?</strong><span>Tap here to message us on WhatsApp. We'll reserve our team for your dates.</span></span>
        <span class="cta-arrow">${icon("arrow")}</span>
      </a>
      <p class="fine">This proposal is valid until ${esc(valid)}. Dates are reserved on a first-confirmed basis.</p>
    </section>`;
  }

  function gallery(s) {
    const photos = (s.galleryPhotos || []).filter(Boolean);
    if (!photos.length) return "";
    const imgs = photos.map((src) => `<img src="${esc(src)}" alt="" loading="lazy">`).join("");
    const link = insta(s);
    return `<section class="block">${title("Moments we've captured")}<div class="gallery g${Math.min(photos.length, 6)}">${imgs}</div>
      ${link ? `<p class="fine center"><a href="${esc(link)}" target="_blank" rel="noopener">See more on Instagram ${esc(s.instagram)}</a></p>` : ""}</section>`;
  }

  function stats(s) {
    if (!s.stats || !s.stats.length) return "";
    const items = s.stats.filter((x) => x.value).map((x) => `<div class="stat"><div class="stat-v">${esc(x.value)}</div><div class="stat-l">${esc(x.label)}</div></div>`).join("");
    return `<section class="block">${title(`Why couples choose ${s.name}`)}
      <div class="stats">${items}</div>
      ${s.tagline ? `<p class="magic">${esc(s.tagline)}. That's the magic of ${esc(firstWord(s.name))}.</p>` : ""}</section>`;
  }

  function steps() {
    const list = [
      ["Confirm", "Pay the advance to reserve your dates and our team."],
      ["Plan", "We go through your rituals, timings and must-have moments together."],
      ["Celebrate", "Our team captures your day while you simply enjoy it."],
      ["Relive", "Your photos, films and album are delivered as per the timelines below."],
    ];
    return `<section class="block">${title("What happens next")}<div class="steps">${list.map((x, i) =>
      `<div class="step"><span class="step-n">${i + 1}</span><div class="step-t">${x[0]}</div><div class="step-d">${x[1]}</div></div>`).join("")}</div></section>`;
  }

  function notesAndTerms(q, s) {
    const terms = String(s.terms || "").trim();
    return `
      ${q.notes ? `<section class="block">${title("A note for you")}<p class="prose">${esc(q.notes)}</p></section>` : ""}
      ${terms ? `<section class="block">${title("Terms")}<p class="prose small">${esc(terms)}</p></section>` : ""}`;
  }

  function signOff(s) {
    const signature = s.contactPerson ? s.contactPerson : `Team ${s.name}`;
    const tel = "tel:+" + IQ.waDigits(s.phone1);
    return `
    <section class="block signoff">
      <img src="assets/logo-mark-gold.png" alt="" class="signoff-mark">
      <p class="signoff-line">We would be honoured to tell your story.</p>
      <div class="sign-name small-sign">${esc(signature)}</div>
      <div class="contacts">
        <a href="${esc(IQ.waLink(s.phone1, `Hi ${s.name}!`))}" target="_blank" rel="noopener">${icon("chat", "ico tiny")} WhatsApp us</a>
        <a href="${esc(tel)}">${icon("phone", "ico tiny")} ${esc(s.phone1)}</a>
        ${s.phone2 ? `<a href="tel:+${esc(IQ.waDigits(s.phone2))}">${icon("phone", "ico tiny")} ${esc(s.phone2)}</a>` : ""}
        ${insta(s) ? `<a href="${esc(insta(s))}" target="_blank" rel="noopener">${icon("instagram", "ico tiny")} ${esc(s.instagram)}</a>` : ""}
        ${site(s) ? `<a href="${esc(site(s))}" target="_blank" rel="noopener">${icon("globe", "ico tiny")} ${esc(s.website)}</a>` : ""}
      </div>
    </section>`;
  }

  // Shown only when the team opens Preview from the builder (?preview=1), never to couples.
  function backBar() {
    if (!new URLSearchParams(location.search).has("preview")) return "";
    return `<a class="back-btn" href="index.html">${icon("back", "ico tiny")} Back to quote</a>`;
  }

  function dock(q, s) {
    const text = `Hi ${s.name}! We'd like to confirm our booking for proposal ${q.number}${q.clientName ? ` (${q.clientName})` : ""}.`;
    return `
    <div class="dock">
      <a class="dock-btn primary" href="${esc(IQ.waLink(s.phone1, text))}" target="_blank" rel="noopener">${icon("chat", "ico tiny")} Confirm on WhatsApp</a>
      <button class="dock-btn" type="button" onclick="window.print()">${icon("download", "ico tiny")} Save PDF</button>
    </div>`;
  }

  // ---------- Render ----------
  function render() {
    const root = document.getElementById("proposal");
    const match = location.hash.match(/[#&]p=([^&]+)/);
    let data;
    try {
      data = match ? IQ.decode(match[1]) : null;
    } catch (e) {
      data = null;
    }
    if (!data || !data.quote || !data.settings) {
      root.innerHTML = `<div class="missing"><img src="assets/logo-mark-gold.png" alt=""><h1>Proposal not found</h1>
        <p>This link looks incomplete. Please open the full link from the message you received, or contact us on WhatsApp.</p></div>`;
      return;
    }
    const q = data.quote, s = data.settings;
    q.events = q.events || [];
    q.extras = q.extras || [];
    const t = IQ.totals(q, s);

    document.title = `Proposal for ${q.clientName || "you"} · ${s.name}`;
    root.innerHTML =
      cover(q, s) +
      `<div class="paper">` +
      letter(q, s) + glance(q) + coverage(q) + deliverables(q) + investment(q, s, t) + confirmBlock(q, s) +
      gallery(s) + stats(s) + steps() + notesAndTerms(q, s) + signOff(s) +
      `</div>` + dock(q, s) + backBar();
  }

  window.addEventListener("hashchange", render);
  render();
})();
