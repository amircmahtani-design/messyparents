/* Seed / re-sync Firestore from data/guides.json
   ---------------------------------------------------------------------------
   Runs two ways:
     • In GitHub Actions  — reads the service-account key from the
       FIREBASE_SERVICE_ACCOUNT repo secret (env var). Nothing to install locally.
     • On your own computer (optional) — put the key next to this file as
       serviceAccount.json, then: npm install && npm run seed
   ------------------------------------------------------------------------- */
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
} else {
  const keyPath = path.join(__dirname, "serviceAccount.json");
  if (!fs.existsSync(keyPath)) {
    console.error("No credentials found. Set FIREBASE_SERVICE_ACCOUNT, or add serviceAccount.json.");
    process.exit(1);
  }
  credential = admin.credential.cert(require(keyPath));
}

admin.initializeApp({ credential });
const db = admin.firestore();
const guides = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "guides.json"), "utf8"));

(async () => {
  const batch = db.batch();
  guides.forEach((g, i) => {
    g.order = i;                         // preserve display order
    batch.set(db.collection("guides").doc(g.id), g);
  });
  await batch.commit();
  console.log(`Seeded ${guides.length} guides into Firestore.`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
