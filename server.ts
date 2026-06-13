import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const app = express();
const PORT = 3000;

const DB_PATH = path.join(process.cwd(), "db.json");

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch (e) {
    return { Users: {}, Main_Feed: [], Likes: [], Messages: [], App_Settings: {} };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API routes for Users
app.get("/api/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const dbData = readDB();
    const user = dbData.Users[email];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { User_Email, User_Name, Capital_Amount, Investment_Layer } = req.body;
    const dbData = readDB();
    const userData = {
      User_Email,
      User_Name,
      Capital_Amount: Number(Capital_Amount) || 0,
      Investment_Layer: Investment_Layer || "General",
      Sovereignty_Points: dbData.Users[User_Email]?.Sovereignty_Points || 0,
      is_active: dbData.Users[User_Email]?.is_active || false,
      updatedAt: new Date().toISOString(),
    };
    dbData.Users[User_Email] = userData;
    writeDB(dbData);
    res.json(dbData.Users[User_Email]);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const dbData = readDB();
    if (!dbData.Users[email]) {
      return res.status(404).json({ error: "User not found" });
    }
    dbData.Users[email] = { ...dbData.Users[email], ...req.body, updatedAt: new Date().toISOString() };
    writeDB(dbData);
    res.json(dbData.Users[email]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users/:email/activate", async (req, res) => {
  try {
    const { email } = req.params;
    const dbData = readDB();
    if (!dbData.Users[email]) {
      return res.status(404).json({ error: "User not found" });
    }
    dbData.Users[email].is_active = true;
    writeDB(dbData);
    res.json(dbData.Users[email]);
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
    const dbData = readDB();
    dbData.Likes = dbData.Likes || [];
    
    const existingLike = dbData.Likes.find((l: any) => l.postId === postId && l.userEmail === userEmail);
    if (existingLike) {
      dbData.Likes = dbData.Likes.filter((l: any) => !(l.postId === postId && l.userEmail === userEmail));
    } else {
      dbData.Likes.push({ postId, userEmail, createdAt: new Date().toISOString() });
    }
    
    writeDB(dbData);
    res.json({ success: true, isLiked: !existingLike });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const dbData = readDB();
    
    // Find likes on user's posts
    // Note: To be accurate, we'd need to know which posts belong to which user. 
    // Let's assume posts in Main_Feed have an authorEmail (I'll add it in the post creation API).
    const userPosts = (dbData.Main_Feed || []).filter((p: any) => p.authorEmail === email);
    const userPostIds = userPosts.map((p: any) => p.Post_ID);
    
    const likes = (dbData.Likes || []).filter((l: any) => userPostIds.includes(l.postId) && l.userEmail !== email);
    const messages = (dbData.Messages || []).filter((m: any) => m.senderId !== email);
    
    res.json({ likes, messages });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Messages
app.get("/api/messages", async (req, res) => {
  try {
    const dbData = readDB();
    res.json(dbData.Messages || []);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const dbData = readDB();
    const message = {
      id: `msg_${Date.now()}`,
      ...req.body,
      timestamp: Date.now(),
    };
    dbData.Messages = dbData.Messages || [];
    dbData.Messages.push(message);
    writeDB(dbData);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for Main_Feed
app.get("/api/feed", async (req, res) => {
  try {
    const { isAdmin } = req.query;
    const dbData = readDB();
    
    let posts = (dbData.Main_Feed || []);
    
    // Regular users don't see deleted posts
    if (isAdmin !== "true") {
      posts = posts.filter((p: any) => !p.isDeleted);
    }

    posts = posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(posts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/feed/delete", async (req, res) => {
  try {
    const { postId, userEmail } = req.body;
    const dbData = readDB();
    const postIndex = (dbData.Main_Feed || []).findIndex((p: any) => p.Post_ID === postId);
    
    if (postIndex !== -1) {
      // Sovereign requirement: Never truly delete from server
      dbData.Main_Feed[postIndex].isDeleted = true;
      dbData.Main_Feed[postIndex].deletedBy = userEmail;
      dbData.Main_Feed[postIndex].deletedAt = new Date().toISOString();
      writeDB(dbData);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/feed", async (req, res) => {
  try {
    const { Post_Content, Post_Category, Allowed_Layer, authorEmail, authorName, imageUrl, videoUrl } = req.body;
    const dbData = readDB();
    const postData = {
      Post_ID: `post_${Date.now()}`,
      Post_Content,
      Post_Category: Post_Category || "نبض السوق",
      Allowed_Layer: Allowed_Layer || "All",
      authorEmail,
      authorName,
      imageUrl,
      videoUrl,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    dbData.Main_Feed = dbData.Main_Feed || [];
    dbData.Main_Feed.push(postData);
    writeDB(dbData);
    res.json(postData);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API routes for App_Settings
app.get("/api/settings", async (req, res) => {
  try {
    const dbData = readDB();
    res.json(dbData.App_Settings || { logoUrl: "/src/assets/images/app_logo_coin_v3_1781318698537.jpg" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/settings", async (req, res) => {
  try {
    const dbData = readDB();
    dbData.App_Settings = { ...(dbData.App_Settings || {}), ...req.body };
    writeDB(dbData);
    res.json(dbData.App_Settings);
  } catch (error) {
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
