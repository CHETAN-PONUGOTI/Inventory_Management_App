// backend/routes/productRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const { validateProductUpdate, validateProductImport } = require('../middleware/validation');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

module.exports = (db) => {
    const router = express.Router();

    // --- 2.1 A. Get Products List API (GET /api/products) ---
    router.get('/', (req, res) => {
        // Bonus: Simple search/filter implementation
        const { search, category, sort = 'id', order = 'asc' } = req.query;

        let query = 'SELECT * FROM products';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(name LIKE ? OR brand LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Basic validation for sorting to prevent SQL injection
        const allowedSorts = ['id', 'name', 'stock', 'category', 'brand'];
        const safeSort = allowedSorts.includes(sort) ? sort : 'id';
        const safeOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        query += ` ORDER BY ${safeSort} COLLATE NOCASE ${safeOrder}`;

        db.all(query, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching products', error: err.message });
            }
            res.json(rows);
        });
    });

    // --- 2.1 B. Update Product API (PUT /api/products/:id) ---
    router.put('/:id', validateProductUpdate, (req, res) => {
        const { id } = req.params;
        const { name, unit, category, brand, stock, status, image } = req.body;
        const newStock = parseInt(stock);

        // STEP 1: Check if the product name is already taken by a *different* product ID
        db.get('SELECT id FROM products WHERE name = ? AND id != ?', [name, id], (nameErr, existingProduct) => {
            if (nameErr) {
                return res.status(500).json({ message: 'Error checking name uniqueness.', error: nameErr.message });
            }
            if (existingProduct) {
                // Name is taken by a different product
                return res.status(400).json({ message: 'Product name already exists for another product.' });
            }

            // STEP 2: Fetch Old Stock for History Tracking (only runs if name is valid)
            db.get('SELECT stock FROM products WHERE id = ?', [id], (err, product) => {
                if (err) {
                    return res.status(500).json({ message: 'Error fetching product for history check.', error: err.message });
                }
                if (!product) {
                    return res.status(404).json({ message: 'Product not found.' });
                }

                const oldStock = product.stock;

                // STEP 3: Perform the Update
                const updateQuery = `
                    UPDATE products 
                    SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ? 
                    WHERE id = ?
                `;
                db.run(updateQuery, [name, unit, category, brand, newStock, status, image, id], function (updateErr) {
                    if (updateErr) {
                        return res.status(500).json({ message: 'Error updating product.', error: updateErr.message });
                    }

                    // STEP 4: Inventory History Tracking
                    if (oldStock !== newStock) {
                        db.run(
                            'INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date) VALUES (?, ?, ?, ?)',
                            [id, oldStock, newStock, new Date().toISOString()],
                            (historyErr) => {
                                if (historyErr) {
                                    console.error('Error inserting inventory history:', historyErr.message);
                                }
                            }
                        );
                    }

                    if (this.changes > 0) {
                        res.json({ message: 'Product updated successfully.', changes: this.changes });
                    } else {
                        res.json({ message: 'No changes made.' });
                    }
                });
            });
        });
    });

    // --- 2.2 A. Import Products API (POST /api/products/import) ---
    router.post('/import', upload.single('csvFile'), validateProductImport, (req, res) => {
        const filePath = req.file.path;
        let addedCount = 0;
        let skippedCount = 0;
        const skippedProducts = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const product = {
                    name: row.name ? row.name.trim() : null,
                    unit: row.unit || '',
                    category: row.category || '',
                    brand: row.brand || '',
                    stock: parseInt(row.stock) || 0,
                    status: row.status || 'In Stock',
                    image: row.image || '',
                };

                if (!product.name || isNaN(product.stock)) {
                    skippedCount++;
                    skippedProducts.push({ name: product.name || 'Invalid Name', reason: 'Missing Name or Invalid Stock' });
                    return;
                }

                // Check for duplicate name
                db.get('SELECT id FROM products WHERE name = ?', [product.name], (err, existingProduct) => {
                    if (err) {
                        console.error('DB error during import check:', err.message);
                        skippedCount++;
                        return;
                    }

                    if (existingProduct) {
                        // Product exists, skip or consider updating (skipped for simplicity here)
                        skippedCount++;
                        skippedProducts.push({ ...product, reason: 'Duplicate Name' });
                    } else {
                        // Insert new product
                        db.run(`INSERT INTO products (name, unit, category, brand, stock, status, image) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [product.name, product.unit, product.category, product.brand, product.stock, product.status, product.image],
                            (insertErr) => {
                                if (insertErr) {
                                    console.error('DB error during import insert:', insertErr.message);
                                    skippedCount++;
                                } else {
                                    addedCount++;
                                }
                            }
                        );
                    }
                });
            })
            .on('end', () => {
                // Wait a moment for all DB operations to complete (due to async nature of db.get/db.run)
                // A better approach would be to use Promises/async-await with a serial queue.
                setTimeout(() => {
                    fs.unlinkSync(filePath); // Clean up the uploaded file
                    res.json({
                        message: 'CSV import finished.',
                        added: addedCount,
                        skipped: skippedCount,
                        skippedProducts: skippedProducts,
                    });
                }, 500); // Small timeout to ensure async DB calls finish
            })
            .on('error', (error) => {
                fs.unlinkSync(filePath); // Clean up on error
                res.status(500).json({ message: 'Error processing CSV file.', error: error.message });
            });
    });

    // --- 2.2 B. Export Products API (GET /api/products/export) ---
    router.get('/export', (req, res) => {
        db.all('SELECT name, unit, category, brand, stock, status FROM products ORDER BY name ASC', [], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching products for export.', error: err.message });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'No products to export.' });
            }

            // Manually create CSV string
            const headers = ['name', 'unit', 'category', 'brand', 'stock', 'status'];
            let csvData = headers.join(',') + '\n';

            rows.forEach(row => {
                // Ensure values are quoted and escaped if they contain commas
                const values = headers.map(header => {
                    let value = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
                    // Simple quoting logic (not comprehensive for all edge cases but functional)
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvData += values.join(',') + '\n';
            });

            // Set appropriate response headers
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
            res.status(200).send(csvData);
        });
    });

    // --- 2.3 Inventory History Endpoint (GET /api/products/:id/history) ---
    router.get('/:id/history', (req, res) => {
        const { id } = req.params;

        const query = `
            SELECT * FROM inventory_history 
            WHERE product_id = ? 
            ORDER BY change_date DESC
        `;

        db.all(query, [id], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching inventory history.', error: err.message });
            }
            res.json(rows);
        });
    });

    // --- Bonus: Add Product Endpoint (Required for 'Add New Product' button) ---
    router.post('/', validateProductUpdate, (req, res) => {
        const { name, unit, category, brand, stock, status, image } = req.body;
        const insertQuery = `
            INSERT INTO products (name, unit, category, brand, stock, status, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [name, unit, category, brand, stock, status, image], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Product name already exists.' });
                }
                return res.status(500).json({ message: 'Error adding product.', error: err.message });
            }
            res.status(201).json({ 
                message: 'Product added successfully.', 
                id: this.lastID 
            });
        });
    });

    // --- Bonus: Delete Product Endpoint ---
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error deleting product.', error: err.message });
            }
            if (this.changes > 0) {
                // Note: The inventory_history records will be automatically deleted due to ON DELETE CASCADE
                res.json({ message: 'Product deleted successfully.' });
            } else {
                res.status(404).json({ message: 'Product not found.' });
            }
        });
    });

    return router;
};