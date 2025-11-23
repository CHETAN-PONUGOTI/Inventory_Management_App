// frontend/src/components/HistorySidebar.js
import React, { useState, useEffect } from 'react';
import { fetchProductHistory } from '../api/productApi';

const HistorySidebar = ({ selectedProduct, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedProduct) {
            setLoading(true);
            fetchProductHistory(selectedProduct.id)
                .then(res => {
                    setHistory(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching history:', err);
                    setHistory([]);
                    setLoading(false);
                });
        }
    }, [selectedProduct]);

    if (!selectedProduct) return null;

    return (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl p-4 z-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold">Inventory History: {selectedProduct.name}</h3>
                <button onClick={onClose} className="text-xl font-bold">&times;</button>
            </div>
            
            {loading ? (
                <p>Loading history...</p>
            ) : history.length === 0 ? (
                <p>No inventory changes recorded.</p>
            ) : (
                <ul className="space-y-3">
                    {history.map((item) => (
                        <li key={item.id} className="p-3 border rounded-lg bg-gray-50">
                            <p className="text-sm font-semibold">Change Date: {new Date(item.change_date).toLocaleString()}</p>
                            <p className="text-sm">
                                Stock Change: 
                                <span className={`font-bold ml-1 ${item.new_quantity > item.old_quantity ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.old_quantity} &rarr; {item.new_quantity}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500">Recorded By: {item.user_info}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistorySidebar;