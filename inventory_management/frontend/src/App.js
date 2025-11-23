// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductTable from './components/ProductTable';
import HistorySidebar from './components/HistorySidebar';
import { fetchProducts } from './api/productApi';
// Simple CSS for a clean look (you would typically use index.css or Tailwind CSS)
import './App.css'; 

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState({ field: 'id', order: 'asc' });
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Debounced search (optional, but good practice)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 500); 

        return () => {
            clearTimeout(handler);
        };
    }, [search, category, sort]); 
    // ^^^ Note: Sorting relies on the debounced effect for simplicity here. 
    // A more reactive UI would update sort immediately.

    const fetchData = useCallback(() => {
        setLoading(true);
        fetchProducts(search, category, sort.field, sort.order)
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch Error:', err);
                setLoading(false);
            });
    }, [search, category, sort]);

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]); 
    // ^^^ useEffect dependency on fetchData (which is wrapped in useCallback)

    return (
        <div className={`p-8 min-h-screen bg-gray-100 ${selectedProduct ? 'mr-80' : ''}`}>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Inventory Dashboard</h1>
            
            <Header 
                search={search} 
                setSearch={setSearch} 
                category={category} 
                setCategory={setCategory} 
                refreshProducts={fetchData}
                products={products}
            />

            {loading ? (
                <div className="text-center p-10">Loading products...</div>
            ) : (
                <ProductTable 
                    products={products} 
                    refreshProducts={fetchData} 
                    setSelectedProduct={setSelectedProduct}
                    sort={sort}
                    setSort={setSort}
                />
            )}

            <HistorySidebar 
                selectedProduct={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
            />
        </div>
    );
}

export default App;