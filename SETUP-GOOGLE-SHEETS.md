# Setting up Google Sheets for Buck's Holsters Orders

When this is set up, every show gets its own Google Sheet in your Google Drive, and every phone that uses
the app sees the same shows and orders. It takes about 10 minutes and is free. You do it once.

## What you get

- A Google Drive folder called **Buck's Holsters Show Orders**.
- Inside it, one Google Sheet per show, named like **West Palm Gun Show (2026-10-10 to 2026-10-11)**.
  Each row is one order, numbered from 1. The sheet updates as orders are entered or edited.
- A **Show Index** sheet in the same folder that lists every show with a link to its sheet.

Shows are removed from the app 90 days after their last day. Their Google Sheets stay in Drive until you
delete them yourself.

## Step 1: Create the Google script

1. On a computer, sign in to the Google account the business uses, then go to **https://script.google.com**.
2. Click **New project**. Click "Untitled project" at the top and rename it **Buck's Holsters Orders**.
3. Delete everything in the `Code.gs` box.
4. Open `google-apps-script/Code.gs` from this project, copy all of it, and paste it into the box.
5. Near the top, change `const TEAM_CODE = 'change-me';` to a code your team will type into the app,
   for example `const TEAM_CODE = 'bucks-2026';`. Anyone with the link **and** this code can read and add
   orders, so don't make it something obvious.
6. Click the **Save** icon.

## Step 2: Publish it as a web app

1. Click **Deploy** (top right), then **New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
   (The app on employees' phones needs to reach it without signing in to Google. The team code is what
   keeps strangers out.)
4. Click **Deploy**, then **Authorize access** and choose your Google account.
5. Google shows "Google hasn't verified this app". That's expected for a script you wrote yourself. Click
   **Advanced**, then **Go to Buck's Holsters Orders (unsafe)**, then **Allow**.
6. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy.../exec`.

If you open that link in a browser, you'll see a short line of text: `ok: true, app: "Buck's Holsters Orders"`.
That means the Google side is working. The link isn't the app itself; it's the address the app sends orders to.

## Step 3: Connect each phone

On each phone or tablet:

1. Open the app and tap **Google Sheets setup** at the bottom of the first screen.
2. Paste the **Web app URL** into **Connection link** and type the **Team code**.
3. Tap **Save and test connection**. It should say "Everything is saved to Google Sheets".

Text the link and team code to employees so they can paste them in. Keep both private: together they
give access to customer names, phone numbers and addresses.

## Day to day

- The first screen shows the save status: "Everything is saved to Google Sheets", or how many changes are
  waiting for signal. Orders without signal are kept on the phone and sent automatically when signal
  comes back.
- If two phones use the same order number while offline, the second one is renumbered to the next free
  number when it reconnects, and the phone shows a message saying so.
- On a show's page, **Open this show's Google Sheet** opens that show's sheet.

## If you change the script later

Use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. This keeps the same
link, so phones don't need to be set up again. Choosing **New deployment** instead makes a new link.
