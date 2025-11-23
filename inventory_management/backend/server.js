// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const productRoutes = require('./routes/productRoutes');
const fs = require('fs');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DATABASE_PATH || './inventory.db';

// --- Database Initialization ---
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize Tables
        db.serialize(() => {
            // Products Table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                unit TEXT,
                category TEXT,
                brand TEXT,
                stock INTEGER NOT NULL,
                status TEXT,
                image TEXT
            )`);
            // Inventory History Table
            db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                old_quantity INTEGER,
                new_quantity INTEGER,
                change_date TEXT,
                user_info TEXT DEFAULT 'System/Admin',
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            )`);
            console.log('Database tables initialized.');
        });
    }
});

// --- Express App Setup ---
const app = express();

// Create uploads directory if it doesn't exist (for multer)
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json()); // Body parser for JSON
app.use('/uploads', express.static('uploads')); // Serve images/files

// Routes
app.use('/api/products', productRoutes(db));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Inventory Management API is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = db; // Export the database connection