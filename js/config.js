// TEAM PASSCODE — set it with:  python3 tools/set-passcode.py   (don't edit this line by hand)
// Only a salted PBKDF2 hash is stored here, never the passcode itself.
window.IMAGICA_AUTH = {"salt": "ac2ebe55859b2f2441a389cc4ccbb591", "iterations": 210000, "hash": "f35eb9bf31184e76675452b39c6f9d8cc1ab7de761e642058cf9f934d933af55"};

// Default business details and price list.
// The team can change all of this inside the app (Settings / Price List);
// these values are only used the first time the app is opened on a device.
// PRICES BELOW ARE SAMPLES — set your real rates in the Price List tab.

window.IMAGICA_DEFAULTS = {
  settings: {
    name: "Imagica Weddings",
    tagline: "Stories, Smiles, Wow Moments",
    phone1: "+91 81390 51362",
    phone2: "+91 82818 14677",
    instagram: "@imagica_weddings.in",
    website: "imagicaweddings.in",
    gstRate: 18,
    advancePercent: 30,
    validityDays: 15,
    nextQuoteNumber: 1,
    contactPerson: "",
    welcomeMessage:
      "Thank you for considering us to be part of your wedding. We know these days happen only once, so we plan every celebration with care — learning your rituals, your timings and the people who matter most — so that no important moment is missed and you can simply enjoy your day.\n\n" +
      "This proposal has been prepared especially for your {events}. Everything here can be tailored to you; just tell us what you would like to change.",
    terms:
      "• An advance payment confirms your date; the balance is due on the wedding day.\n" +
      "• Edited photos are delivered within 30 days; films and albums within 60–90 days.",
    stats: [
      { value: "2018", label: "Capturing weddings since" },
      { value: "364+", label: "Moments captured & counting" },
      { value: "Kerala", label: "& destinations beyond" },
    ],
    // Photos for the proposal. Upload images into assets/photos/ on GitHub
    // and put their paths here (or in Settings), e.g. "assets/photos/cover.jpg".
    coverPhoto: "",
    galleryPhotos: [],
  },

  // category: "coverage" (crew, priced per person per event), "deliverable", "addon"
  // standardQty: coverage = crew per side for a new event ("Both sides" doubles it);
  //              deliverable/addon = included in every new quote.
  catalog: [
    { id: "photographer", category: "coverage", name: "Photographer", price: 10000, standardQty: 1, detail: "Traditional photographer for rituals, family & stage photos" },
    { id: "videographer", category: "coverage", name: "Videographer", price: 12000, standardQty: 1, detail: "Traditional full-coverage video" },
    { id: "candid", category: "coverage", name: "Candid Photographer", price: 15000, standardQty: 0, detail: "Candid moments, edited high-resolution photos" },
    { id: "cinematographer", category: "coverage", name: "Cinematographer", price: 20000, standardQty: 0, detail: "Cinematic video with gimbal & cinema lenses" },
    { id: "drone", category: "coverage", name: "Drone", price: 8000, standardQty: 0, detail: "Aerial photos & video (subject to venue permission)" },
    { id: "live", category: "coverage", name: "Live Streaming", price: 10000, standardQty: 0, detail: "HD live stream for guests abroad" },

    { id: "full-film", category: "deliverable", name: "Full-Length Film", price: 10000, standardQty: 1, detail: "Edited documentary film of the day" },
    { id: "highlight", category: "deliverable", name: "Highlight Film", price: 15000, standardQty: 1, detail: "4–6 minute cinematic highlight" },
    { id: "frame", category: "deliverable", name: "Photo Frame (12×18)", price: 1500, standardQty: 2, detail: "" },
    { id: "album-50", category: "deliverable", name: "Photo Album – 50 Leaves", price: 20000, standardQty: 1, detail: "Premium lay-flat album" },
    { id: "mini-album", category: "deliverable", name: "Mini Album for Parents", price: 6000, standardQty: 0, detail: "" },
    { id: "reel", category: "deliverable", name: "Instagram Teaser / Reel", price: 5000, standardQty: 0, detail: "60-second vertical teaser" },
    { id: "save-date", category: "deliverable", name: "Save-the-Date Video", price: 8000, standardQty: 0, detail: "" },

    { id: "pre-wedding", category: "addon", name: "Pre-Wedding Shoot", price: 25000, standardQty: 0, detail: "Half-day shoot, 1 location, edited photos + reel" },
    { id: "post-wedding", category: "addon", name: "Post-Wedding Shoot", price: 20000, standardQty: 0, detail: "" },
    { id: "led", category: "addon", name: "LED Wall", price: 12000, standardQty: 0, detail: "Live display at the venue" },
    { id: "same-day", category: "addon", name: "Same-Day Edit", price: 15000, standardQty: 0, detail: "Highlight played at the reception" },
    { id: "pendrive", category: "addon", name: "Pen Drive & Gift Box", price: 1500, standardQty: 0, detail: "" },
  ],
};
