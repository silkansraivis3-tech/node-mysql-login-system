# Node MySQL Login System

A simple login system built with Node.js, Express, MySQL, bcrypt, and sessions.

## Features

- User registration
- Password hashing with bcrypt
- Login system
- Protected dashboard page
- Logout system
- MySQL database storage
- Environment variables using `.env`

## Technologies Used

- Node.js
- Express.js
- MySQL
- bcrypt
- express-session
- dotenv
- HTML

## How It Works

The user registers with a username, email, and password.

The server hashes the password using bcrypt before saving it to MySQL.

When the user logs in, the server checks the email and compares the typed password with the saved password hash.

If the login is correct, the server creates a session.

The dashboard page is protected, so only logged-in users can access it.

When the user logs out, the session is destroyed.

## How to Run This Project

1. Install dependencies:

npm install
Create a .env file based on .env.example.
Create the MySQL database and users table:

    CREATE DATABASE IF NOT EXISTS login_demo;

    USE login_demo;

    CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
Start the development server:

    npm run dev 

Open the website:

    http://localhost:3000

What I Learned
    How to create a basic Express server
    How to connect Node.js to MySQL
    How to save users in a database
    Why passwords should be hashed
    How sessions keep users logged in
    How to protect private pages
    How to structure a small backend project
    