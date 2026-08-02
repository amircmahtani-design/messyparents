/* ============================================================================
   Firebase config for The Messy Parents Collection.

   Leave FIREBASE_CONFIG = null  ->  LOCAL PREVIEW MODE
     (site + Studio use the bundled guides.js; Studio "Save" downloads a file)

   Paste your web-app config  ->  LIVE FIREBASE MODE
     (Studio signs in with Firebase Auth and saves to Firestore; the public
      site reads guides live from Firestore)

   Get this from: Firebase console → Project settings → General → Your apps.
   ========================================================================== */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAGHZgw1Thl82LTJTUcpceQXa-Fjwzdn_E",
  authDomain: "messy-parents.firebaseapp.com",
  projectId: "messy-parents",
  storageBucket: "messy-parents.firebasestorage.app",
  messagingSenderId: "678138643116",
  appId: "1:678138643116:web:ff1fb9b63e207893715509"
};
