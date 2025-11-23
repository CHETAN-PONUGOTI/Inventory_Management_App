// frontend/src/components/ProductTable.js
import React, { useState } from 'react';
import ProductRow from './ProductRow';

const ProductTable = ({ products, refreshProducts, setSelectedProduct, sort, setSort }) => {
    
    const handleSortClick = (field) => {
        const newOrder = (sort.field === field && sort.order === 'asc') ? 'desc' : 'asc';
        setSort({ field, order: newOrder });
    };

    const renderSortIndicator = (field) => {
        if (sort.field !== field) return null;
        return sort.order === 'asc' ? ' ▲' : ' ▼';
    };

    const headers = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Product Name', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'brand', label: 'Brand', sortable: true },
        { key: 'stock', label: 'Stock', sortable: true },
        { key: 'status', label: 'Status', sortable: false },
        { key: 'actions', label: 'Actions', sortable: false },
    ];

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map(header => (
                            <th 
                                key={header.key} 
                                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => header.sortable && handleSortClick(header.key)}
                            >
                                {header.label}
                                {header.sortable && renderSortIndicator(header.key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductRow 
                                key={product.id} 
                                product={product} 
                                refreshProducts={refreshProducts} 
                                setSelectedProduct={setSelectedProduct} 
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="p-4 text-center text-gray-500">No products found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;