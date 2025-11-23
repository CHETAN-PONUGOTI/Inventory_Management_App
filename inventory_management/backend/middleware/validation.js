// backend/middleware/validation.js
const { body, validationResult } = require('express-validator');

exports.validateProductUpdate = [
    // --- REQUIRED FIELD: Name ---
    body('name')
        .trim()
        .isLength({ min: 1 }).withMessage('Product name is required.')
        .isString().withMessage('Product name must be a string.'),
        
    // --- REQUIRED FIELD: Stock ---
    body('stock')
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.')
        .toInt(),
        
    // --- OPTIONAL FIELDS (using checkFalsy to handle empty strings) ---
    body('unit').optional({ checkFalsy: true }).isString().withMessage('Unit must be a string.'),
    body('category').optional({ checkFalsy: true }).isString().withMessage('Category must be a string.'),
    body('brand').optional({ checkFalsy: true }).isString().withMessage('Brand must be a string.'),
    body('status').optional({ checkFalsy: true }).isString().withMessage('Status must be a string.'),
    body('image').optional({ checkFalsy: true }).isString().withMessage('Image path must be a string.'),
    
    // --- Error Handler ---
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Log the detailed errors for debugging
            console.error('Validation failed on PUT/POST request:', errors.array()); 
            return res.status(400).json({ 
                message: 'Validation failed.',
                errors: errors.array() 
            });
        }
        next();
    }
];

exports.validateProductImport = [
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No CSV file uploaded.' });
        }
        next();
    }
];