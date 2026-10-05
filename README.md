# Buck's Holsters Orders

A fast, tap-first order app for taking holster and mag carrier orders at gun shows.
It runs in the phone or tablet browser, works with no signal once it has been opened, and keeps orders on the device until they are emailed to **Erin@bucksholsters.com** (testing; will switch to support@bucksholsters.com).

## How it works

1. Tap **New Show** and enter the show name and dates (any length, 1 day to 8+). Pick the show from the list on later days.
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

## Changing option lists

All choices (accent ring colors, IWB styles, clips, mag carrier types, and so on) are lists near the top of the
`<script>` in `index.html`. Add a name to a list and it shows up as a new button.

## Storage note

Orders live in the browser's storage on that one device. Different phones keep separate order lists, and clearing
the browser's site data deletes unsent orders. Email orders before clearing anything.
