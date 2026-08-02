/* Seed / re-sync Firestore from data/guides.json
   ---------------------------------------------------------------------------
   One-time (or whenever you want to reset Firestore to the file):
     1) Firebase console → Project settings → Service accounts → Generate key
     2) Save it next to this file as  serviceAccount.json
     3) npm install
     4) npm run seed
   ------------------------------------------------------------------------- */
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "serviceAccount.json");
if (!fs.existsSync(keyPath)) {
  console.error("Missing serviceAccount.json (see instructions at the top of seed.js).");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
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
