import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize Firebase Admin cleanly
try {
  const CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");
  const firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  if (getApps().length === 0) {
    initializeApp({
      projectId: firebaseConfig.projectId
    });
  }
  console.log("Firebase Admin successfully initialized on server with projectId:", firebaseConfig.projectId);
} catch (error) {
  console.error("Failed to initialize Firebase Admin on server startup:", error);
}

const DB_PATH = process.env.VERCEL 
  ? "/tmp/db.json"
  : path.join(process.cwd(), "db.json");

let isFirestoreWorking = true;

function readLocalJsonDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (!parsed.Transactions) parsed.Transactions = [];
      if (parsed.App_Settings) {
        parsed.App_Settings = {
          logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg",
          clioAlias: "khazain.earth",
          clioPhone: "0790000000",
          clioName: "الخزائن الأرض للتمويل الذاتي",
          currencySymbol: "د.أ",
          ...parsed.App_Settings
        };
      } else {
        parsed.App_Settings = {
          logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg",
          clioAlias: "khazain.earth",
          clioPhone: "0790000000",
          clioName: "الخزائن الأرض للتمويل الذاتي",
          currencySymbol: "د.أ"
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading db.json:", e);
  }
  return {
    Users: {},
    Main_Feed: [],
    Likes: [],
    Messages: [],
    App_Settings: { 
      logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg",
      clioAlias: "khazain.earth",
      clioPhone: "0790000000",
      clioName: "الخزائن الأرض للتمويل الذاتي",
      currencySymbol: "د.أ"
    },
    Courses: [],
    Events: [],
    Transactions: []
  };
}

function writeLocalJsonDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}

class QueryDocumentSnapshotMock {
  constructor(public id: string, private _data: any, public ref: any) {}
  data() {
    return this._data;
  }
}

class QuerySnapshotMock {
  constructor(public docs: QueryDocumentSnapshotMock[]) {}
  get empty() {
    return this.docs.length === 0;
  }
  get size() {
    return this.docs.length;
  }
}

class DocumentSnapshotMock {
  constructor(public id: string, private _data: any | null, public ref: any) {}
  get exists() {
    return this._data !== null && this._data !== undefined;
  }
  data() {
    return this._data;
  }
}

class DocumentReferenceMock {
  constructor(public parent: CollectionReferenceMock, public id: string) {}

  async get() {
    const data = this.parent.getDocumentData(this.id);
    return new DocumentSnapshotMock(this.id, data, this);
  }

  async set(data: any, options?: { merge?: boolean }) {
    this.parent.setDocumentData(this.id, data, options);
    return { writeTime: new Date().toISOString() };
  }

  async delete() {
    this.parent.deleteDocumentData(this.id);
    return { writeTime: new Date().toISOString() };
  }
}

class CollectionReferenceMock {
  public _filters: Array<{ field: string; op: string; value: any }> = [];
  public _orderByField: string | null = null;
  public _orderByDir: string = "asc";
  public _limitVal: number | null = null;

  constructor(public dbMock: FallbackFirestore, public name: string) {}

  where(field: string, op: string, value: any) {
    const cl = new CollectionReferenceMock(this.dbMock, this.name);
    cl._filters = [...this._filters, { field, op, value }];
    cl._orderByField = this._orderByField;
    cl._orderByDir = this._orderByDir;
    cl._limitVal = this._limitVal;
    return cl;
  }

  orderBy(field: string, direction: string = "asc") {
    const cl = new CollectionReferenceMock(this.dbMock, this.name);
    cl._filters = [...this._filters];
    cl._orderByField = field;
    cl._orderByDir = direction;
    cl._limitVal = this._limitVal;
    return cl;
  }

  limit(val: number) {
    const cl = new CollectionReferenceMock(this.dbMock, this.name);
    cl._filters = [...this._filters];
    cl._orderByField = this._orderByField;
    cl._orderByDir = this._orderByDir;
    cl._limitVal = val;
    return cl;
  }

  doc(id: string) {
    return new DocumentReferenceMock(this, id);
  }

  getCollectionData(): Record<string, any> {
    const dbData = readLocalJsonDb();
    const rawValue = dbData[this.name];
    
    const dict: Record<string, any> = {};
    if (rawValue) {
      if (Array.isArray(rawValue)) {
        rawValue.forEach((item: any) => {
          let docId = item.id || item.Post_ID || item.User_Email;
          if (this.name === "Likes" && !docId) {
            docId = `${item.postId}_${item.userEmail}`;
          }
          if (docId) {
            dict[docId] = item;
          }
        });
      } else if (typeof rawValue === 'object') {
        if (this.name === "App_Settings") {
          if (rawValue.logoUrl && !rawValue.global) {
            dict["global"] = rawValue;
          } else {
            Object.keys(rawValue).forEach(k => {
              dict[k] = rawValue[k];
            });
          }
        } else {
          Object.keys(rawValue).forEach(k => {
            dict[k] = rawValue[k];
          });
        }
      }
    }
    return dict;
  }

  saveCollectionData(dict: Record<string, any>) {
    const dbData = readLocalJsonDb();
    if (this.name === "Users") {
      dbData[this.name] = dict;
    } else if (this.name === "App_Settings") {
      dbData[this.name] = dict.global || dict;
    } else {
      dbData[this.name] = Object.values(dict);
    }
    writeLocalJsonDb(dbData);
  }

  getDocumentData(id: string): any | null {
    const dict = this.getCollectionData();
    return dict[id] || null;
  }

  setDocumentData(id: string, data: any, options?: { merge?: boolean }) {
    const dict = this.getCollectionData();
    const existing = dict[id] || {};
    if (options?.merge) {
      dict[id] = { ...existing, ...data };
    } else {
      dict[id] = data;
    }
    this.saveCollectionData(dict);
  }

  deleteDocumentData(id: string) {
    const dict = this.getCollectionData();
    delete dict[id];
    this.saveCollectionData(dict);
  }

  async get() {
    const dict = this.getCollectionData();
    let docs = Object.keys(dict).map(id => {
      return new QueryDocumentSnapshotMock(id, dict[id], this.doc(id));
    });

    for (const filter of this._filters) {
      docs = docs.filter(doc => {
        const val = doc.data()[filter.field];
        if (filter.op === "==") return val === filter.value;
        if (filter.op === "!=") return val !== filter.value;
        if (filter.op === ">") return val > filter.value;
        if (filter.op === "<") return val < filter.value;
        if (filter.op === ">=") return val >= filter.value;
        if (filter.op === "<=") return val <= filter.value;
        return true;
      });
    }

    if (this._orderByField) {
      const field = this._orderByField;
      const desc = this._orderByDir === "desc";
      docs.sort((a, b) => {
        const valA = a.data()[field];
        const valB = b.data()[field];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
      });
    }

    if (this._limitVal !== null && this._limitVal !== undefined) {
      docs = docs.slice(0, this._limitVal);
    }

    return new QuerySnapshotMock(docs);
  }
}

class WriteBatchMock {
  private _ops: Array<() => void> = [];

  delete(docRef: any) {
    this._ops.push(() => {
      if (docRef && docRef.parent && typeof docRef.parent.deleteDocumentData === 'function') {
        docRef.parent.deleteDocumentData(docRef.id);
      } else if (docRef && docRef.delete) {
        docRef.delete();
      }
    });
  }

  async commit() {
    this._ops.forEach(op => op());
    return { writeTime: new Date().toISOString() };
  }
}

class FallbackFirestore {
  collection(name: string) {
    return new CollectionReferenceMock(this, name);
  }
  batch() {
    return new WriteBatchMock();
  }
}

let firestoreDb: any = null;
const localDbMockInstance = new FallbackFirestore();

function getSharedDbProxy(realDb: any): any {
  return new Proxy(realDb, {
    get(target, prop, receiver) {
      if (!isFirestoreWorking) {
        return Reflect.get(localDbMockInstance, prop, localDbMockInstance);
      }
      const propStr = typeof prop === "string" ? prop : String(prop);

      if (propStr === "collection") {
        return function (collectionName: string) {
          try {
            const realColl = target.collection(collectionName);
            return getCollectionProxy(realColl, collectionName);
          } catch (e) {
            console.warn("Collection fetch failed, switching to local DB fallback:", e);
            isFirestoreWorking = false;
            return localDbMockInstance.collection(collectionName);
          }
        };
      }
      if (propStr === "batch") {
        return function () {
          try {
            const realBatch = target.batch();
            return getBatchProxy(realBatch);
          } catch (e) {
            console.warn("Batch init failed, switching to local DB fallback:", e);
            isFirestoreWorking = false;
            return localDbMockInstance.batch();
          }
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

function getCollectionProxy(realColl: any, collectionName: string): any {
  return new Proxy(realColl, {
    get(target, prop, receiver) {
      if (!isFirestoreWorking) {
        const mockColl = localDbMockInstance.collection(collectionName);
        return Reflect.get(mockColl, prop, mockColl);
      }

      const propStr = typeof prop === "string" ? prop : String(prop);
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return function (...args: any[]) {
          try {
            const result = value.apply(target, args);
            if (result && (propStr === "where" || propStr === "orderBy" || propStr === "limit")) {
              return getCollectionProxy(result, collectionName);
            }
            if (result && propStr === "doc") {
              return getDocRefProxy(result, collectionName);
            }
            if (result instanceof Promise) {
              return result.catch((err: any) => {
                const errMsg = String(err);
                if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("FirebaseAppError") || errMsg.includes("unauthenticated")) {
                  console.warn(`Firestore async operation ${propStr} failed on ${collectionName}, falling back to local DB:`, errMsg);
                  isFirestoreWorking = false;
                  const mockColl = localDbMockInstance.collection(collectionName);
                  return (mockColl as any)[propStr](...args);
                }
                throw err;
              });
            }
            return result;
          } catch (err: any) {
            const errMsg = String(err);
            if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("FirebaseAppError") || errMsg.includes("unauthenticated")) {
              console.warn(`Firestore sync operation ${propStr} failed on ${collectionName}, falling back to local DB:`, errMsg);
              isFirestoreWorking = false;
              const mockColl = localDbMockInstance.collection(collectionName);
              return (mockColl as any)[propStr](...args);
            }
            throw err;
          }
        };
      }
      return value;
    }
  });
}

function getDocRefProxy(realDocRef: any, collectionName: string): any {
  return new Proxy(realDocRef, {
    get(target, prop, receiver) {
      if (!isFirestoreWorking) {
        const mockDoc = localDbMockInstance.collection(collectionName).doc(target.id);
        return Reflect.get(mockDoc, prop, mockDoc);
      }

      const propStr = typeof prop === "string" ? prop : String(prop);
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return function (...args: any[]) {
          try {
            const result = value.apply(target, args);
            if (result instanceof Promise) {
              return result.catch((err: any) => {
                const errMsg = String(err);
                if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("FirebaseAppError") || errMsg.includes("unauthenticated")) {
                  console.warn(`Firestore doc operation ${propStr} failed on ${collectionName}/${target.id}, falling back to local DB:`, errMsg);
                  isFirestoreWorking = false;
                  const mockDoc = localDbMockInstance.collection(collectionName).doc(target.id);
                  return (mockDoc as any)[propStr](...args);
                }
                throw err;
              });
            }
            return result;
          } catch (err: any) {
            const errMsg = String(err);
            if (errMsg.includes("PERMISSION_DENIED") || errMsg.includes("FirebaseAppError") || errMsg.includes("unauthenticated")) {
              console.warn(`Firestore doc sync operation ${propStr} failed on ${collectionName}/${target.id}, falling back to local DB:`, errMsg);
              isFirestoreWorking = false;
              const mockDoc = localDbMockInstance.collection(collectionName).doc(target.id);
              return (mockDoc as any)[propStr](...args);
            }
            throw err;
          }
        };
      }
      return value;
    }
  });
}

function getBatchProxy(realBatch: any): any {
  return new Proxy(realBatch, {
    get(target, prop, receiver) {
      if (!isFirestoreWorking) {
        return Reflect.get(localDbMockInstance.batch(), prop, localDbMockInstance.batch());
      }

      const propStr = typeof prop === "string" ? prop : String(prop);
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return function (...args: any[]) {
          try {
            const result = value.apply(target, args);
            if (result instanceof Promise) {
              return result.catch((err: any) => {
                console.warn(`Batch operation ${propStr} async failed, falling back to local DB:`, err);
                isFirestoreWorking = false;
                return { writeTime: new Date().toISOString() };
              });
            }
            return result;
          } catch (err) {
            console.warn(`Batch operation ${propStr} failed, falling back to local DB:`, err);
            isFirestoreWorking = false;
            return { writeTime: new Date().toISOString() };
          }
        };
      }
      return value;
    }
  });
}

function getFirestoreDb(): any {
  if (!isFirestoreWorking) {
    return localDbMockInstance;
  }
  if (!firestoreDb) {
    try {
      const CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");
      const firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
      firestoreDb = getFirestore(dbId);
    } catch (e) {
      console.warn("Firestore initialization failed, switching to local DB:", e);
      isFirestoreWorking = false;
      return localDbMockInstance;
    }
  }
  return getSharedDbProxy(firestoreDb);
}

// Automatically sync the initial/local db.json data to Firestore if Firestore is empty
async function syncLocalDbToFirestore() {
  try {
    const db = getFirestoreDb();
    const feedSnap = await db.collection("Main_Feed").limit(1).get();
    if (feedSnap.empty && fs.existsSync(DB_PATH)) {
      console.log("Firestore collections appear empty. Syncing local db.json records to the Cloud database...");
      const originalContent = fs.readFileSync(DB_PATH, "utf-8");
      const localData = JSON.parse(originalContent);

      // Migrate Users
      const users = localData.Users || {};
      for (const email of Object.keys(users)) {
        await db.collection("Users").doc(email).set(users[email]);
      }

      // Migrate Main_Feed
      const feed = localData.Main_Feed || [];
      for (const post of feed) {
        await db.collection("Main_Feed").doc(post.Post_ID).set(post);
      }

      // Migrate Likes
      const likes = localData.Likes || [];
      for (const like of likes) {
        const likeId = `${like.postId}_${like.userEmail}`;
        await db.collection("Likes").doc(likeId).set(like);
      }

      // Migrate Messages
      const messages = localData.Messages || [];
      for (const msg of messages) {
        await db.collection("Messages").doc(msg.id).set(msg);
      }

      // Migrate Courses
      const courses = localData.Courses || [];
      for (const course of courses) {
        await db.collection("Courses").doc(course.id).set(course);
      }

      // Migrate Events
      const events = localData.Events || [];
      for (const ev of events) {
        await db.collection("Events").doc(ev.id).set(ev);
      }

      // Migrate App_Settings
      const settings = localData.App_Settings || { logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" };
      await db.collection("App_Settings").doc("global").set(settings);

      console.log("Sync to Firestore cloud database is fully completed!");
    }
  } catch (error: any) {
    console.warn("Migration warning (non-blocking): unable to sync local db.json to Firestore, falling back to local DB storage mode:", error ? (error.message || error) : "unknown error");
    isFirestoreWorking = false;
  }
}

// Trigger non-blocking cloud migration on server spin up
syncLocalDbToFirestore().catch(console.error);

// API routes for Users
app.get("/api/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getFirestoreDb();
    const doc = await db.collection("Users").doc(email).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(doc.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const snapshot = await db.collection("Users").get();
    const users = snapshot.docs.map(d => d.data());
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { User_Email, User_Name, Capital_Amount, Investment_Layer } = req.body;
    const db = getFirestoreDb();
    const userDoc = await db.collection("Users").doc(User_Email).get();
    const existing = userDoc.exists ? userDoc.data() || {} : {};
    
    const userData = {
      User_Email,
      User_Name,
      Capital_Amount: Number(Capital_Amount) || 0,
      Investment_Layer: Investment_Layer || "General",
      Sovereignty_Points: existing.Sovereignty_Points || 0,
      is_active: existing.is_active || false,
      updatedAt: new Date().toISOString(),
    };
    await db.collection("Users").doc(User_Email).set(userData, { merge: true });
    res.json(userData);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getFirestoreDb();
    const userRef = db.collection("Users").doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedData = { ...req.body, updatedAt: new Date().toISOString() };
    await userRef.set(updatedData, { merge: true });
    const finalDoc = await userRef.get();
    res.json(finalDoc.data());
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users/:email/activate", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getFirestoreDb();
    const userRef = db.collection("Users").doc(email);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      const userData = {
        User_Email: email,
        User_Name: email.split('@')[0] || "عضو المجتمع",
        Capital_Amount: 0,
        Investment_Layer: "General",
        Sovereignty_Points: 0,
        is_active: true,
        updatedAt: new Date().toISOString()
      };
      await userRef.set(userData);
    } else {
      await userRef.set({ is_active: true }, { merge: true });
    }
    const finalDoc = await userRef.get();
    res.json(finalDoc.data());
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Likes
app.post("/api/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userEmail } = req.body;
    const db = getFirestoreDb();
    const likeId = `${postId}_${userEmail}`;
    const likeRef = db.collection("Likes").doc(likeId);
    const doc = await likeRef.get();
    const isLiked = !doc.exists;
    if (doc.exists) {
      await likeRef.delete();
    } else {
      await likeRef.set({ postId, userEmail, createdAt: new Date().toISOString() });
    }
    res.json({ success: true, isLiked });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/posts/:postId/watch", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userEmail } = req.body;
    const db = getFirestoreDb();
    const userRef = db.collection("Users").doc(userEmail);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = doc.data() || {};
    const watchedPostIds = userData.watchedPostIds || [];
    const isWatched = watchedPostIds.includes(postId);
    const updatedWatched = isWatched 
      ? watchedPostIds.filter((id: string) => id !== postId)
      : [...watchedPostIds, postId];
    await userRef.set({ watchedPostIds: updatedWatched }, { merge: true });
    res.json({ success: true, isWatched: !isWatched });
  } catch (error) {
    console.error("Error toggling watch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const db = getFirestoreDb();
    
    // Fetch user posts
    const postSnap = await db.collection("Main_Feed").where("authorEmail", "==", email).get();
    const userPostIds = postSnap.docs.map(d => d.data().Post_ID);
    
    let likes: any[] = [];
    if (userPostIds.length > 0) {
      const likesSnap = await db.collection("Likes").get();
      likes = likesSnap.docs
        .map(d => d.data())
        .filter(l => userPostIds.includes(l.postId) && l.userEmail !== email);
    }
    
    const messagesSnap = await db.collection("Messages").get();
    const messages = messagesSnap.docs
      .map(d => d.data())
      .filter((m: any) => m.senderId !== email);
      
    res.json({ likes, messages });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Messages
app.get("/api/messages", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection("Messages").orderBy("timestamp", "asc").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (error) {
    console.error("Error listing messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const messageId = `msg_${Date.now()}`;
    const message = {
      id: messageId,
      ...req.body,
      timestamp: Date.now(),
    };
    await db.collection("Messages").doc(messageId).set(message);
    res.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Main_Feed with auto 30-day cleanup
let lastCleanupTime = 0;

async function cleanupOldPosts(db: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const snapshot = await db.collection("Main_Feed")
      .where("createdAt", "<", thirtyDaysAgoStr)
      .get();

    if (!snapshot.empty) {
      console.log(`Cleaning up ${snapshot.size} posts older than 30 days...`);
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("Cleanup of old posts completed successfully!");
    }
  } catch (error) {
    console.error("Error during cleaning up old posts:", error);
  }
}

app.get("/api/feed", async (req, res) => {
  try {
    const { isAdmin } = req.query;
    const db = getFirestoreDb();

    // Rates limit 30-day post cleanup
    const now = Date.now();
    if (now - lastCleanupTime > 3600 * 1000) {
      lastCleanupTime = now;
      cleanupOldPosts(db).catch(console.error);
    }

    const snap = await db.collection("Main_Feed").get();
    let posts = snap.docs.map(d => d.data());
    
    // Fetch users for hydration magnet effect
    const usersSnap = await db.collection("Users").get();
    const users: any = {};
    usersSnap.docs.forEach((d) => {
      const u = d.data();
      users[u.User_Email] = u;
    });

    if (isAdmin !== "true") {
      posts = posts.filter((p: any) => !p.isDeleted);
    }

    const enhancedPosts = posts.map((post: any) => {
      const author = users[post.authorEmail];
      return {
        ...post,
        authorName: author?.User_Name || post.authorName || "عضو المجتمع",
        authorPhotoUrl: author?.photoUrl || post.authorPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.User_Name || post.authorName || 'U')}&background=C5A059&color=121212`
      };
    });

    const sortedPosts = enhancedPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sortedPosts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/feed/delete", async (req, res) => {
  try {
    const { postId, userEmail } = req.body;
    const db = getFirestoreDb();
    const postRef = db.collection("Main_Feed").doc(postId);
    const doc = await postRef.get();
    
    if (doc.exists) {
      await postRef.set({
        isDeleted: true,
        deletedBy: userEmail,
        deletedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/feed", async (req, res) => {
  try {
    const { Post_Content, Post_Category, Allowed_Layer, authorEmail, authorName, authorPhotoUrl, imageUrl, videoUrl } = req.body;
    const db = getFirestoreDb();
    const postId = `post_${Date.now()}`;
    const postData = {
      Post_ID: postId,
      Post_Content,
      Post_Category: Post_Category || "نبض السوق",
      Allowed_Layer: Allowed_Layer || "All",
      authorEmail,
      authorName,
      authorPhotoUrl,
      imageUrl,
      videoUrl,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    await db.collection("Main_Feed").doc(postId).set(postData);
    res.json(postData);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Courses
app.get("/api/courses", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection("Courses").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (error) {
    console.error("Error listing courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/courses", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const courseId = `course_${Date.now()}`;
    const course = {
      id: courseId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    await db.collection("Courses").doc(courseId).set(course);
    res.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Events
app.get("/api/events", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection("Events").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (error) {
    console.error("Error listing events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const eventId = `event_${Date.now()}`;
    const event = {
      id: eventId,
      ...req.body,
      attendees: [],
      createdAt: new Date().toISOString()
    };
    await db.collection("Events").doc(eventId).set(event);
    res.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/events/:id/attend", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    const db = getFirestoreDb();
    const eventRef = db.collection("Events").doc(id);
    const doc = await eventRef.get();
    
    if (doc.exists) {
      const eventData = doc.data() || {};
      const attendees = eventData.attendees || [];
      const updatedAttendees = attendees.includes(userEmail)
        ? attendees.filter((e: string) => e !== userEmail)
        : [...attendees, userEmail];
      await eventRef.set({ attendees: updatedAttendees }, { merge: true });
      const finalDoc = await eventRef.get();
      res.json(finalDoc.data());
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (error) {
    console.error("Error toggling attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for App_Settings
app.get("/api/settings", async (req, res) => {
  try {
    const db = getFirestoreDb();
    const doc = await db.collection("App_Settings").doc("global").get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.json({ logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" });
    }
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/settings", async (req, res) => {
  try {
    const db = getFirestoreDb();
    await db.collection("App_Settings").doc("global").set(req.body, { merge: true });
    const finalDoc = await db.collection("App_Settings").doc("global").get();
    res.json(finalDoc.data());
  } catch (error) {
    console.error("Error patching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- TRANSACTIONS API ENDPOINTS ---

// List all transactions (optional filter by userEmail)
app.get("/api/transactions", async (req, res) => {
  try {
    const { userEmail } = req.query;
    const db = getFirestoreDb();
    const snap = await db.collection("Transactions").get();
    let txs = snap.docs.map((d: any) => d.data());
    
    if (userEmail) {
      txs = txs.filter((t: any) => t.userEmail === userEmail);
    }
    
    // Sort transactions chronologically (newest first)
    const sorted = txs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (error) {
    console.error("Error listing transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a deposit or withdrawal request
app.post("/api/transactions", async (req, res) => {
  try {
    const { userEmail, userName, type, amount, method, referenceNumber, senderDetails, targetDetails, receiptImg, notes } = req.body;
    const db = getFirestoreDb();
    
    const txId = `tx_${Date.now()}`;
    const cleanAmount = Number(amount) || 0;
    
    // If it is a withdrawal, we MUST reserve (deduct) user balance instantly to prevent double-spending!
    if (type === "withdrawal") {
      const userRef = db.collection("Users").doc(userEmail);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }
      const userData = userDoc.data() || {};
      const currentCapital = Number(userData.Capital_Amount) || 0;
      
      if (currentCapital < cleanAmount) {
        return res.status(400).json({ error: "رصيدك الحالي غير كافٍ لإتمام طلب السحب" });
      }
      
      // Deduct immediately
      await userRef.set({ Capital_Amount: currentCapital - cleanAmount }, { merge: true });
    }
    
    const txData = {
      id: txId,
      userEmail,
      userName,
      type, // 'deposit' | 'withdrawal'
      amount: cleanAmount,
      method, // 'Zain Cash' | 'CliQ'
      referenceNumber: referenceNumber || null,
      senderDetails: senderDetails || null,
      targetDetails: targetDetails || null,
      receiptImg: receiptImg || null, // Base64 uploader image
      status: "pending", // 'pending' | 'approved' | 'rejected'
      createdAt: new Date().toISOString(),
      notes: notes || ""
    };
    
    await db.collection("Transactions").doc(txId).set(txData);
    res.json(txData);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Approve Transaction
app.post("/api/transactions/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestoreDb();
    const txRef = db.collection("Transactions").doc(id);
    const txDoc = await txRef.get();
    
    if (!txDoc.exists) {
      return res.status(404).json({ error: "العملية غير موجودة" });
    }
    
    const txData = txDoc.data();
    if (txData.status !== "pending") {
      return res.status(400).json({ error: "لقد تم معالجة هذه العملية مسبقاً" });
    }
    
    // If it's a deposit, we ADD the approved value to the user's Capital_Amount
    if (txData.type === "deposit") {
      const userRef = db.collection("Users").doc(txData.userEmail);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        const currentCapital = Number(userData.Capital_Amount) || 0;
        await userRef.set({ Capital_Amount: currentCapital + Number(txData.amount) }, { merge: true });
      }
    }
    // Note: for withdrawals, we already reserved/deducted the amount when the request was initiated, 
    // so approving simply finalizes it (it stays deducted).
    
    await txRef.set({ status: "approved", processedAt: new Date().toISOString() }, { merge: true });
    
    const finalTx = await txRef.get();
    res.json(finalTx.data());
  } catch (error) {
    console.error("Error approving transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Reject Transaction
app.post("/api/transactions/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;
    const db = getFirestoreDb();
    const txRef = db.collection("Transactions").doc(id);
    const txDoc = await txRef.get();
    
    if (!txDoc.exists) {
      return res.status(404).json({ error: "العملية غير موجودة" });
    }
    
    const txData = txDoc.data();
    if (txData.status !== "pending") {
      return res.status(400).json({ error: "لقد تم معالجة هذه العملية مسبقاً" });
    }
    
    // If it was a withdrawal, we MUST refund the reserved amount to the user's wallet!
    if (txData.type === "withdrawal") {
      const userRef = db.collection("Users").doc(txData.userEmail);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        const currentCapital = Number(userData.Capital_Amount) || 0;
        await userRef.set({ Capital_Amount: currentCapital + Number(txData.amount) }, { merge: true });
      }
    }
    
    await txRef.set({ 
      status: "rejected", 
      processedAt: new Date().toISOString(),
      rejectReason: rejectReason || "مرفوض من مدير النظام"
    }, { merge: true });
    
    const finalTx = await txRef.get();
    res.json(finalTx.data());
  } catch (error) {
    console.error("Error rejecting transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Instant P2P Inner Transfer between users
app.post("/api/transactions/transfer", async (req, res) => {
  try {
    const { senderEmail, recipientEmail, amount, notes } = req.body;
    const db = getFirestoreDb();
    
    const cleanAmount = Number(amount) || 0;
    if (cleanAmount <= 0) {
      return res.status(400).json({ error: "المبلغ المحول يجب أن يكون أكبر من الصفر" });
    }
    
    if (senderEmail === recipientEmail) {
      return res.status(400).json({ error: "لا يمكنك التحويل لنفس حسابك" });
    }
    
    // Validate Sender
    const senderRef = db.collection("Users").doc(senderEmail);
    const senderDoc = await senderRef.get();
    if (!senderDoc.exists) {
      return res.status(404).json({ error: "حساب المرسل غير مسجل" });
    }
    const senderData = senderDoc.data() || {};
    const senderCapital = Number(senderData.Capital_Amount) || 0;
    
    if (senderCapital < cleanAmount) {
      return res.status(400).json({ error: "رصيدك غير كافٍ لإتمام عملية التحويل الفوري" });
    }
    
    // Validate Recipient
    const recipientRef = db.collection("Users").doc(recipientEmail);
    const recipientDoc = await recipientRef.get();
    if (!recipientDoc.exists) {
      return res.status(404).json({ error: "البريد الإلكتروني للمستلم غير مسجل بـ مجتمع خزائن الأرض" });
    }
    const recipientData = recipientDoc.data() || {};
    const recipientCapital = Number(recipientData.Capital_Amount) || 0;
    
    // Deduct from Sender and Add to Recipient
    await senderRef.set({ Capital_Amount: senderCapital - cleanAmount }, { merge: true });
    await recipientRef.set({ Capital_Amount: recipientCapital + cleanAmount }, { merge: true });
    
    // Create audit ledger records for both
    const txId = `tx_p2p_${Date.now()}`;
    const txData = {
      id: txId,
      userEmail: senderEmail,
      userName: senderData.User_Name || senderData.name,
      type: "transfer_out", // Outward transfer
      recipientEmail,
      recipientName: recipientData.User_Name || recipientData.name,
      amount: cleanAmount,
      method: "Inner Transfer / تحويل داخلي",
      status: "approved", // Instantly processed
      createdAt: new Date().toISOString(),
      notes: notes || "تحويل داخلي فوري"
    };
    
    // Recipient transaction ledger record
    const rxId = `tx_p2p_rx_${Date.now()}`;
    const rxData = {
      id: rxId,
      userEmail: recipientEmail,
      userName: recipientData.User_Name || recipientData.name,
      type: "transfer_in", // Inward transfer
      senderEmail,
      senderName: senderData.User_Name || senderData.name,
      amount: cleanAmount,
      method: "Inner Transfer / تحويل داخلي",
      status: "approved",
      createdAt: new Date().toISOString(),
      notes: notes || "تحويل داخلي فوري"
    };
    
    await db.collection("Transactions").doc(txId).set(txData);
    await db.collection("Transactions").doc(rxId).set(rxData);
    
    res.json({ success: true, transaction: txData });
  } catch (error) {
    console.error("Error in P2P transfer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vite middleware for development
async function setupVite(app: express.Express) {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Setting up Vite middleware for development...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("Setting up static file serving for production...");
      const distPath = path.join(process.cwd(), "dist");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      } else {
        console.error("Dist path not found! Falling back to simple response.");
        app.get("*", (req, res) => {
          res.status(404).send("Production build not found. Please run build first.");
        });
      }
    }
  } catch (error) {
    console.error("Error setting up Vite:", error);
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
});

if (!process.env.VERCEL) {
  setupVite(app).then(() => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
    
    server.on('error', (err) => {
      console.error("Server error:", err);
    });
  }).catch(err => {
    console.error("Failed to start server during setupVite:", err);
  });
}

export default app;
