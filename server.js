// Load settings from the .env file into process.env
require("dotenv").config();

// Import Express so we can create a web server
const express = require("express");

// Import mysql2 with promise support so we can use async/await
const mysql = require("mysql2/promise");

// Import bcrypt so we can hash and check passwords safely
const bcrypt = require("bcrypt");

// Import express-session so users can stay logged in
const session = require("express-session");

// Import path so file paths work correctly on Windows/Mac/Linux
const path = require("path");

// Create the main Express app
const app = express();

// Create a MySQL connection pool
// A pool reuses database connections instead of creating a new one every time
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Tell Express to read data sent from HTML forms
// This makes req.body work in POST routes
app.use(express.urlencoded({ extended: false }));

// Tell Express to serve normal frontend files from the public folder
// Example: public/login.html becomes http://localhost:3000/login.html
app.use(express.static(path.join(__dirname, "public")));

// Set up sessions
// Sessions let the server remember that a user is logged in
app.use(session({
  // Secret is used to sign the session cookie
  secret: process.env.SESSION_SECRET,

  // Do not save session again if nothing changed
  resave: false,

  // Do not create empty sessions for visitors who are not logged in
  saveUninitialized: false,

  // Cookie settings for the browser
  cookie: {
    // Makes cookie safer because JavaScript in browser cannot read it
    httpOnly: true,

    // Session cookie lasts for 1 hour
    maxAge: 1000 * 60 * 60
  }
}));

// Middleware function to protect pages
// If user is not logged in, send them to login page
function requireLogin(req, res, next) {
  // If there is no userId in session, user is not logged in
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }

  // If user is logged in, continue to the protected route
  next();
}

// Small helper to make username safe before showing it in HTML
// This helps avoid putting unsafe text directly into the page
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Test route to check if server works
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// Test route to check if database connection works
app.get("/db-test", async (req, res) => {
  try {
    // Ask MySQL which database we are connected to
    const [rows] = await pool.execute("SELECT DATABASE() AS database_name");

    // Show success message in browser
    res.send(`
      <h1>Database connection works!</h1>
      <p>Connected to database: <strong>${rows[0].database_name}</strong></p>
      <a href="/">Back to homepage</a>
    `);
  } catch (error) {
    // Show real error in terminal for debugging
    console.error(error);

    // Show simple error in browser
    res.status(500).send(`
      <h1>Database connection failed</h1>
      <p>Check your .env settings and MySQL server.</p>
    `);
  }
});

// Register new user
app.post("/register", async (req, res) => {
  // Get values from the register form
  const { username, email, password } = req.body;

  // Check that user filled all fields
  if (!username || !email || !password) {
    return res.status(400).send(`
      <p>All fields are required.</p>
      <a href="/register.html">Go back</a>
    `);
  }

  // Simple password length check
  if (password.length < 6) {
    return res.status(400).send(`
      <p>Password must be at least 6 characters.</p>
      <a href="/register.html">Go back</a>
    `);
  }

  try {
    // Hash password before saving it
    // Number 12 is the bcrypt cost factor; higher means stronger but slower
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user into users table
    // Question marks are safe placeholders for user input
    await pool.execute(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );

    // After successful registration, send user to login page
    res.redirect("/login.html");
  } catch (error) {
    // If email already exists, MySQL gives duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send(`
        <p>This email is already registered.</p>
        <a href="/login.html">Login here</a>
      `);
    }

    // Print unexpected error in terminal
    console.error(error);

    // Show simple error in browser
    res.status(500).send(`
      <p>Something went wrong during registration.</p>
      <a href="/register.html">Go back</a>
    `);
  }
});

// Login existing user
app.post("/login", async (req, res) => {
  // Get email and password from login form
  const { email, password } = req.body;

  // Check that both fields were filled
  if (!email || !password) {
    return res.status(400).send(`
      <p>Email and password are required.</p>
      <a href="/login.html">Go back</a>
    `);
  }

  try {
    // Find user by email
    const [rows] = await pool.execute(
      "SELECT id, username, password_hash FROM users WHERE email = ?",
      [email]
    );

    // If no user was found, login fails
    if (rows.length === 0) {
      return res.status(401).send(`
        <p>Wrong email or password.</p>
        <a href="/login.html">Try again</a>
      `);
    }

    // Get the first matching user from database result
    const user = rows[0];

    // Compare typed password with saved password hash
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    // If password does not match, login fails
    if (!passwordMatches) {
      return res.status(401).send(`
        <p>Wrong email or password.</p>
        <a href="/login.html">Try again</a>
      `);
    }

    // Create a fresh session after successful login
    // This is safer than reusing an old session
    req.session.regenerate((error) => {
      // If session creation fails, show error
      if (error) {
        console.error(error);
        return res.status(500).send("Session error.");
      }

      // Save user info into the session
      // This is how the server remembers who is logged in
      req.session.userId = user.id;
      req.session.username = user.username;

      // Send logged-in user to dashboard
      res.redirect("/dashboard");
    });
  } catch (error) {
    // Print unexpected error in terminal
    console.error(error);

    // Show simple error in browser
    res.status(500).send(`
      <p>Something went wrong during login.</p>
      <a href="/login.html">Go back</a>
    `);
  }
});

// Protected dashboard page
// requireLogin runs before the dashboard function
app.get("/dashboard", requireLogin, (req, res) => {
  // Make username safe before showing it in HTML
  const safeUsername = escapeHtml(req.session.username);

  // Show dashboard only to logged-in users
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard</title>
    </head>
    <body>
      <h1>Dashboard</h1>

      <p>You are logged in as <strong>${safeUsername}</strong>.</p>

      <form action="/logout" method="POST">
        <button type="submit">Logout</button>
      </form>
    </body>
    </html>
  `);
});

// Logout route
app.post("/logout", (req, res) => {
  // Destroy the session so server forgets the user
  req.session.destroy((error) => {
    // If logout fails, show error
    if (error) {
      console.error(error);
      return res.status(500).send("Could not log out.");
    }

    // Clear session cookie from browser
    res.clearCookie("connect.sid");

    // Send user back to login page
    res.redirect("/login.html");
  });
});

// Choose website port from .env, or use 3000 as backup
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});