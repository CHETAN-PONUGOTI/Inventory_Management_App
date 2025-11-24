import React, { useRef, useState, useEffect } from 'react';
import { exportProducts, importProducts, createNewProduct } from '../api/productApi';

const Header = ({ search, setSearch, category, setCategory, refreshProducts, products }) => {
    const fileInputRef = useRef(null);
    const [importMessage, setImportMessage] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newProductData, setNewProductData] = useState({ name: '', stock: 0, category: 'Electronics', brand: '' });

    const uniqueCategories = Array.isArray(products) 
        ? [...new Set(products.map(p => p.category))].filter(c => c)
        : [];

    const handleImportClick = () => {
        setImportMessage('');
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csvFile', file);

        importProducts(formData)
            .then(res => {
                setImportMessage(`Import successful! Added: ${res.data.added}, Skipped: ${res.data.skipped}.`);
                refreshProducts();
            })
            .catch(err => {
                const message = err.response?.data?.message || 'An error occurred during import.';
                setImportMessage(`Import Failed: ${message}`);
            })
            .finally(() => {
                event.target.value = null; 
            });
    };
    
    const handleAddNewProduct = () => {
        if (!newProductData.name.trim() || newProductData.stock < 0) {
            alert('Please provide a valid name and non-negative stock.');
            return;
        }

        createNewProduct({
            ...newProductData,
            unit: 'N/A',
            status: newProductData.stock > 0 ? 'In Stock' : 'Out of Stock'
        })
        .then(() => {
            alert('Product added successfully!');
            setNewProductData({ name: '', stock: 0, category: 'Electronics', brand: '' });
            setIsAddingNew(false);
            refreshProducts();
        })
        .catch(err => {
            const message = err.response?.data?.message || 'Failed to add product.';
            alert(message);
        });
    }

    return (
        <header className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex space-x-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search products by name/brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full md:w-64"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex space-x-3">
                    <button 
                        onClick={() => setIsAddingNew(true)} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add New Product
                    </button>
                    <button 
                        onClick={handleImportClick} 
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                        Import CSV
                    </button>
                    <button 
                        onClick={exportProducts} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Export CSV
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".csv" 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                </div>
            </div>
            
            {importMessage && <p className="mt-3 text-sm text-center text-gray-600">{importMessage}</p>}

            {isAddingNew && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-inner">
                    <h4 className="font-semibold mb-2">Add New Product</h4>
                    <div className="flex space-x-3 items-end">
                        <input
                            type="text"
                            placeholder="Name (Required)"
                            value={newProductData.name}
                            onChange={(e) => setNewProductData(p => ({ ...p, name: e.target.value }))}
                            className="p-2 border rounded-lg flex-1"
                        />
                        <input
                            type="number"
                            placeholder="Stock (Required)"
                            value={newProductData.stock}
                            onChange={(e) => setNewProductData(p => ({ ...p, stock: e.target.value }))}
                            className="p-2 border rounded-lg w-24"
                        />
                        <select
                            value={newProductData.category}
                            onChange={(e) => setNewProductData(p => ({ ...p, category: e.target.value }))}
                            className="p-2 border rounded-lg"
                        >
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Brand"
                            value={newProductData.brand}
                            onChange={(e) => setNewProductData(p => ({ ...p, brand: e.target.value }))}
                            className="p-2 border rounded-lg flex-1"
                        />
                        <button onClick={handleAddNewProduct} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            Save
                        </button>
                        <button onClick={() => setIsAddingNew(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;