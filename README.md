# Imagica Quotes — website

A quote builder for the Imagica Weddings team, plus a beautiful proposal page for couples.
It's a plain static website (no server, no database), so it can be hosted free on **GitHub Pages**.

- **`index.html`: the team's quote builder.** Create quotes, set crew per event (Bride's side / Groom's side / Both sides / Common event), pick deliverables, and add travel, discount and GST.
- **`proposal.html`: what the couple sees.** A personal, mobile-friendly proposal with a cover, a welcome letter, the event plan, deliverables, a single total, a "Confirm on WhatsApp" button and **Save PDF**.

## Put it online with GitHub Pages (about 5 minutes)

1. Sign in at github.com and create a **new repository**, e.g. `imagica-quotes`.
2. Click **"uploading an existing file"** and drag in **everything inside this folder** (`index.html`, `proposal.html`, `manifest.webmanifest`, and the `css`, `js` and `assets` folders). Click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute, your site will be live at
   `https://<your-github-username>.github.io/imagica-quotes/`
5. On your iPhone, open that link in Safari → **Share → Add to Home Screen**. It opens like an app.

## Everyday use

1. **Quotes → + New Quote.** Enter the couple's name and WhatsApp number.
2. **Add Event** for each function. Each starts with your standard crew; choose *Both sides* to double it, and adjust any count with − / +.
3. Deliverables come pre-filled (1 full-length film, 1 highlight, 2 frames, 1 album with 50 leaves). Change counts as needed.
4. Tap **Send on WhatsApp**. The couple gets a message with a link to their personal proposal.
   - **Preview** opens the proposal as the couple will see it.
   - On the proposal page, **Save PDF** creates an A4 PDF (on iPhone: Print → pinch out on the preview → Share → Save to Files).

The proposal shows *what's included* and **one total**. It doesn't show individual prices, GST or the payment split. The full breakdown is only visible to your team inside the builder.

## Your photos on the proposal

Upload your best wedding photos to the `assets/photos` folder of the repository (GitHub → *Add file → Upload files*). Then in **Settings → Proposal**, enter the paths, e.g. `assets/photos/cover.jpg` for the cover and `assets/photos/gallery-1.jpg` (one per line) for the gallery. Keep each photo under ~500 KB so proposals load fast.

## Good to know

- **Prices are samples.** Set your real rates in the **Price List** tab. "Standard quantity" decides what new events and quotes start with.
- **Quotes are saved in the browser on each device**, not online. Use **Settings → Backup** to download a backup, or to move quotes to another phone or laptop.
- **Each proposal link contains that quote** (name, events, total). Nothing is stored on a server. Anyone with the link can view that one proposal, so send it only to the couple.
- The site is hidden from search engines (`noindex`), but anyone who has the main link can open the builder. Don't share the builder link outside your team.
