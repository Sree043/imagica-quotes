// Imagica Quotes — quote builder (index.html). Data is saved in this browser (localStorage).

const STORAGE_KEY = "imagica-quotes-v1";
const DEF = window.IMAGICA_DEFAULTS;

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        quotes: Array.isArray(d.quotes) ? d.quotes : [],
        catalog: Array.isArray(d.catalog) && d.catalog.length ? d.catalog : IQ.clone(DEF.catalog),
        settings: Object.assign(IQ.clone(DEF.settings), d.settings || {}),
      };
    }
  } catch (e) {
    console.warn("Could not read saved data", e);
  }
  return { quotes: [], catalog: IQ.clone(DEF.catalog), settings: IQ.clone(DEF.settings) };
}

document.addEventListener("alpine:init", () => {
  Alpine.data("quoteApp", () => ({
    tab: "quotes",
    search: "",
    quotes: [],
    catalog: [],
    settings: {},
    editingId: null,
    editingService: null,
    newEventName: "Wedding",
    galleryText: "",
    toastText: "",
    toastTimer: null,

    // constants for templates
    SIDES: IQ.SIDES,
    CATEGORIES: IQ.CATEGORIES,
    EVENT_NAMES: IQ.EVENT_NAMES,
    WEDDING_TYPES: IQ.WEDDING_TYPES,
    STATUSES: ["Draft", "Sent", "Booked", "Lost"],
    inr: IQ.inr,
    shortDay: IQ.shortDay,
    longDay: IQ.longDay,

    init() {
      const d = loadData();
      this.quotes = d.quotes;
      this.catalog = d.catalog;
      this.settings = d.settings;
      this.galleryText = (this.settings.galleryPhotos || []).join("\n");
    },

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ quotes: this.quotes, catalog: this.catalog, settings: this.settings }));
      } catch (e) {
        this.toast("Couldn't save on this device");
      }
    },

    toast(text) {
      this.toastText = text;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => (this.toastText = ""), 2200);
    },

    // ---------- Quotes ----------

    get current() {
      return this.quotes.find((q) => q.id === this.editingId) || null;
    },

    get filteredQuotes() {
      const s = this.search.trim().toLowerCase();
      if (!s) return this.quotes;
      return this.quotes.filter((q) =>
        [q.clientName, q.number, q.phone].some((v) => String(v || "").toLowerCase().includes(s)));
    },

    totals(q) {
      return IQ.totals(q, this.settings);
    },

    numberFor(n) {
      return `IMG-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`;
    },

    firstDate(q) {
      const dates = (q.events || []).map((e) => e.date).filter(Boolean).sort();
      return dates.length ? IQ.shortDay(dates[0]) : "";
    },

    newQuote() {
      const q = {
        id: IQ.uid(),
        number: this.numberFor(this.settings.nextQuoteNumber),
        createdAt: new Date().toISOString(),
        clientName: "", phone: "", email: "",
        weddingType: "Hindu Wedding",
        status: "Draft",
        events: [],
        extras: [...this.standardItems("deliverable"), ...this.standardItems("addon")],
        travel: 0, discount: 0, includeGST: false, notes: "",
      };
      this.settings.nextQuoteNumber++;
      this.quotes.unshift(q);
      this.editingId = q.id;
      this.persist();
      window.scrollTo(0, 0);
    },

    openQuote(q) {
      this.editingId = q.id;
      window.scrollTo(0, 0);
    },

    closeEditor() {
      const q = this.current;
      // Throw away a brand-new quote that was never filled in.
      if (q && !q.clientName && !q.phone && q.events.length === 0) {
        this.quotes = this.quotes.filter((x) => x.id !== q.id);
        if (q.number === this.numberFor(this.settings.nextQuoteNumber - 1)) this.settings.nextQuoteNumber--;
      }
      this.editingId = null;
      this.persist();
      window.scrollTo(0, 0);
    },

    duplicateQuote(q) {
      const copy = IQ.clone(q);
      copy.id = IQ.uid();
      copy.number = this.numberFor(this.settings.nextQuoteNumber++);
      copy.createdAt = new Date().toISOString();
      copy.status = "Draft";
      this.quotes.unshift(copy);
      this.persist();
      this.openQuote(copy);
      this.toast("Duplicated as " + copy.number);
    },

    deleteQuote(q) {
      if (!confirm(`Delete quote ${q.number}${q.clientName ? " for " + q.clientName : ""}? This can't be undone.`)) return;
      this.quotes = this.quotes.filter((x) => x.id !== q.id);
      if (this.editingId === q.id) this.editingId = null;
      this.persist();
    },

    // ---------- Items & counters ----------

    servicesIn(category) {
      return this.catalog.filter((s) => s.category === category);
    },

    itemFrom(service, quantity) {
      return {
        id: IQ.uid(), serviceID: service.id, name: service.name, detail: service.detail || "",
        unitPrice: Number(service.price) || 0, quantity,
      };
    },

    findItem(items, serviceID) {
      return items.find((i) => i.serviceID === serviceID);
    },

    qty(items, service) {
      const item = this.findItem(items, service.id);
      return item ? item.quantity : 0;
    },

    setQty(items, service, n) {
      n = Math.max(0, Math.min(50, Math.round(n) || 0));
      const index = items.findIndex((i) => i.serviceID === service.id);
      if (index >= 0) {
        if (n === 0) items.splice(index, 1);
        else items[index].quantity = n;
      } else if (n > 0) {
        items.push(this.itemFrom(service, n));
        this.sortItems(items);
      }
      this.persist();
    },

    setPrice(items, serviceID, value) {
      const item = this.findItem(items, serviceID);
      if (item) item.unitPrice = Number(value) || 0;
    },

    sortItems(items) {
      const order = new Map(this.catalog.map((s, i) => [s.id, i]));
      const rank = (i) => (order.has(i.serviceID) ? order.get(i.serviceID) : 1e9);
      items.sort((a, b) => rank(a) - rank(b));
    },

    standardItems(category, multiplier = 1) {
      return this.catalog
        .filter((s) => s.category === category && Number(s.standardQty) > 0)
        .map((s) => this.itemFrom(s, Number(s.standardQty) * multiplier));
    },

    customItems(items, categories) {
      const ids = new Set(this.catalog.filter((s) => categories.includes(s.category)).map((s) => s.id));
      return items.filter((i) => !i.serviceID || !ids.has(i.serviceID));
    },

    addCustom(items) {
      items.push({ id: IQ.uid(), serviceID: null, name: "", detail: "", unitPrice: 0, quantity: 1 });
      this.persist();
    },

    removeItem(items, item) {
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) items.splice(index, 1);
      this.persist();
    },

    // ---------- Events ----------

    multiplier(side) {
      return side === "Both sides" ? 2 : 1;
    },

    coverageIDs() {
      return new Set(this.servicesIn("coverage").map((s) => s.id));
    },

    crewKey(items) {
      const ids = this.coverageIDs();
      return items.filter((i) => ids.has(i.serviceID)).map((i) => `${i.serviceID}:${i.quantity}`).sort().join("|");
    },

    applyStandardCrew(ev, side) {
      const ids = this.coverageIDs();
      const keep = ev.items.filter((i) => !i.serviceID || !ids.has(i.serviceID));
      ev.items.splice(0, ev.items.length, ...this.standardItems("coverage", this.multiplier(side)), ...keep);
      this.persist();
    },

    // Changing the side re-applies the standard crew only if the crew wasn't edited by hand.
    changeSide(ev, newSide) {
      const untouched = this.crewKey(ev.items) === this.crewKey(this.standardItems("coverage", this.multiplier(ev.side)));
      ev.side = newSide;
      if (untouched) this.applyStandardCrew(ev, newSide);
      this.persist();
    },

    addEvent() {
      const q = this.current;
      const last = q.events[q.events.length - 1];
      const side = last ? last.side : "Both sides";
      const date = last ? IQ.addDays(last.date, 1) : IQ.addDays(IQ.toDayString(new Date()), 30);
      q.events.forEach((e) => (e.open = false));
      q.events.push({
        id: IQ.uid(), name: this.newEventName || "Event", date, venue: "", side,
        items: this.standardItems("coverage", this.multiplier(side)), open: true,
      });
      this.persist();
    },

    removeEvent(ev) {
      if (!confirm(`Remove ${ev.name || "this event"} from the quote?`)) return;
      const q = this.current;
      q.events.splice(q.events.findIndex((e) => e.id === ev.id), 1);
      this.persist();
    },

    moveEvent(ev, direction) {
      const list = this.current.events;
      const i = list.findIndex((e) => e.id === ev.id);
      const j = i + direction;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      this.persist();
    },

    crewSummary(ev) {
      const parts = ev.items.filter((i) => i.quantity > 0).map((i) => `${i.quantity} ${i.name || "item"}`);
      return parts.length ? parts.join(" · ") : "No crew selected";
    },

    resetDeliverables() {
      const q = this.current;
      const ids = new Set(this.servicesIn("deliverable").map((s) => s.id));
      const keep = q.extras.filter((i) => !i.serviceID || !ids.has(i.serviceID));
      const next = [...keep, ...this.standardItems("deliverable")];
      this.sortItems(next);
      q.extras.splice(0, q.extras.length, ...next);
      this.persist();
    },

    // ---------- Sharing ----------

    proposalLink() {
      return IQ.proposalURL(this.current, this.settings);
    },

    openProposal() {
      this.persist();
      window.open(this.proposalLink(), "_blank");
    },

    async copyLink() {
      const link = this.proposalLink();
      try {
        await navigator.clipboard.writeText(link);
        this.toast("Proposal link copied");
      } catch {
        prompt("Copy this proposal link:", link);
      }
    },

    whatsAppText(q) {
      const t = this.totals(q);
      const lines = [
        `Hi ${q.clientName || "there"}! 💍`,
        `Thank you for considering ${this.settings.name}. We've prepared a proposal especially for you:`,
        "",
        this.proposalLink(),
        "",
        `Total investment: ${IQ.inr(t.grand)}`,
        "",
        `Valid until ${IQ.longDay(IQ.validUntil(q, this.settings))}. Reply here with any questions — we'd love to tell your story.`,
      ];
      return lines.join("\n");
    },

    sendWhatsApp() {
      const q = this.current;
      if (q.status === "Draft") q.status = "Sent";
      this.persist();
      window.open(IQ.waLink(q.phone, this.whatsAppText(q)), "_blank");
    },

    // ---------- Price list ----------

    addService(category) {
      const s = { id: IQ.uid(), category, name: "New service", price: 0, standardQty: 0, detail: "" };
      this.catalog.push(s);
      this.editingService = s.id;
      this.persist();
    },

    deleteService(s) {
      if (!confirm(`Delete "${s.name}" from the price list? Existing quotes keep it.`)) return;
      this.catalog = this.catalog.filter((x) => x.id !== s.id);
      this.persist();
    },

    resetCatalog() {
      if (!confirm("Replace your price list with the sample prices? Saved quotes are not affected.")) return;
      this.catalog = IQ.clone(DEF.catalog);
      this.persist();
      this.toast("Price list reset");
    },

    standardHint(category) {
      return {
        coverage: "Crew a new event gets for ONE side (\"Both sides\" doubles it)",
        deliverable: "Included in every new quote",
        addon: "Added to every new quote (usually 0)",
      }[category];
    },

    // ---------- Settings ----------

    saveGallery() {
      this.settings.galleryPhotos = this.galleryText.split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 6);
      this.persist();
    },

    exportBackup() {
      const data = JSON.stringify({ quotes: this.quotes, catalog: this.catalog, settings: this.settings }, null, 2);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      a.download = `imagica-quotes-backup-${IQ.toDayString(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    },

    importBackup(event) {
      const file = event.target.files[0];
      event.target.value = "";
      if (!file) return;
      file.text().then((text) => {
        try {
          const d = JSON.parse(text);
          if (!Array.isArray(d.quotes) || !Array.isArray(d.catalog)) throw new Error("Not a backup file");
          if (!confirm(`Replace everything on this device with the backup (${d.quotes.length} quotes)?`)) return;
          this.quotes = d.quotes;
          this.catalog = d.catalog;
          this.settings = Object.assign(IQ.clone(DEF.settings), d.settings || {});
          this.galleryText = (this.settings.galleryPhotos || []).join("\n");
          this.persist();
          this.toast("Backup restored");
        } catch (e) {
          alert("That file isn't an Imagica Quotes backup.");
        }
      });
    },
  }));
});
