# Buck's Holsters Orders

**Live app:** https://erinkohlbrenner.github.io/Bucks-Holsters/

A fast, tap-first order app for taking holster and mag carrier orders at gun shows.
It runs in the phone or tablet browser and works with no signal once it has been opened. Each show gets its own
Google Sheet (see [SETUP-GOOGLE-SHEETS.md](SETUP-GOOGLE-SHEETS.md)), and a show's orders can be emailed to
**Erin@bucksholsters.com** (testing; will switch to support@bucksholsters.com).

## How it works

1. Tap **New Show** and enter the show name, first day and last day. Shows that are on now or coming up are
   listed on the first screen. Past shows are under **Previous shows**, where you can open any order.
2. On the show page, tap **New Order**. Orders are numbered #1, #2, #3... for each show, with the date and time stamped. **Existing orders** lists only that show's orders; tap one to edit it.
3. Fill in the customer, then tap through the holster options. Choices that don't apply stay hidden
   (IWB styles and clips only show for IWB; belt attachment only for Taco; drop only for QLS).
4. Add more holsters or mag carriers to the same order if needed, plus special instructions.
5. Tap **Done**. If anything required is missing, the app lists it. You can fix it or save and finish later.
6. At the end of the show, tap **Email this show's orders** and use **Open in Mail app**
   (or share the CSV spreadsheet, or copy the text).

Everything saves as you type, so closing the app or locking the phone loses nothing.

## Putting it on a phone

The app is plain static files (`index.html`, `sw.js`, `manifest.webmanifest`, icons). Host them anywhere with HTTPS,
for example GitHub Pages (repo **Settings → Pages → Deploy from a branch**). Open the page once on the phone, then
use **Add to Home Screen** so it opens like an app and works offline.

## Changing options and prices

All choices (accent ring colors, IWB styles, belt attachments, mag carrier types, and so on) are lists near the
top of the `<script>` in `index.html`. Add a name to a list and it shows up as a new button.

Prices live in one place, the `PRICE` list in `index.html` (search for "Prices (change them here)"): holster
and mag carrier base prices, add-ons (Level 2, light, Solid Color, Carbon Fiber, Custom Print, leather, belt
attachments) and the $5 shipping per order. Every order shows a price breakdown and total, and the total
goes into the email, the spreadsheet file and the Google Sheet. Sales tax is not added, because it differs by show.

## Still to do

- Switch the email address back to support@bucksholsters.com when testing is done
  (`ORDER_EMAIL` near the top of the `<script>` in `index.html`).
- Open questions from setup: whether Single Clip Hybrid and Other should use the Lil Buck belt attachment
  prices (they do now), and whether a Match Holster mag carrier should match a holster other than Holster 1.

## Where orders are saved

Every order is saved on the phone first, then copied to the show's Google Sheet whenever there is signal.
The first screen says whether everything has reached Google Sheets. Without Google Sheets set up, orders
exist only on that phone.

Shows are removed from the app 90 days after their last day, but only after everything in them has
reached Google Sheets. The Google Sheets themselves are kept in Drive.

`google-apps-script/Code.gs` is the Google script that creates and fills the sheets.
