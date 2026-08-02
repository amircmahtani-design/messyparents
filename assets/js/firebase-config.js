/* ============================================================================
   Firebase config for The Messy Parents Collection.

   Leave FIREBASE_CONFIG = null  ->  LOCAL PREVIEW MODE
     (site + Studio use the bundled guides.js; Studio "Save" downloads a file)

   Paste your web-app config  ->  LIVE FIREBASE MODE
     (Studio signs in with Firebase Auth and saves to Firestore; the public
      site reads guides live from Firestore)

   Get this from: Firebase console → Project settings → General → Your apps.
   ========================================================================== */
window.FIREBASE_CONFIG = null;

/* Example (fill and uncomment):
window.FIREBASE_CONFIG = {
  apiKey: "AIza…",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:0000000000:web:abcdef"
};
*/
