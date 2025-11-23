// frontend/src/components/ProductRow.js
import React, { useState } from 'react';
import { updateProduct, deleteProduct } from '../api/productApi';

const ProductRow = ({ product, refreshProducts, setSelectedProduct }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(product);
    const [error, setError] = useState(null);

    const status = product.stock === 0 ? 'Out of Stock' : 'In Stock';
    const colorClass = product.stock === 0 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setError(null);
        // Ensure stock is parsed as an integer for the API
        const dataToSave = { ...formData, stock: parseInt(formData.stock) };

        updateProduct(product.id, dataToSave)
            .then(() => {
                setIsEditing(false);
                refreshProducts(); // Refresh the main product list
            })
            .catch(err => {
                const message = err.response?.data?.message || 'Failed to update product.';
                setError(message);
                console.error('Update Error:', err);
            });
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete product: ${product.name}?`)) {
            deleteProduct(product.id)
                .then(() => {
                    refreshProducts();
                })
                .catch(err => {
                    console.error('Delete Error:', err);
                    alert('Failed to delete product.');
                });
        }
    };

    const displayField = (field) => {
        if (isEditing) {
            // Simple input for name, stock, brand (can be expanded)
            if (['name', 'stock', 'brand'].includes(field)) {
                return (
                    <input
                        type={field === 'stock' ? 'number' : 'text'}
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                    />
                );
            }
            // Simple select for category (can be made dynamic)
            if (field === 'category') {
                return (
                    <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                    >
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Other">Other</option>
                    </select>
                );
            }
            return formData[field];
        }
        return product[field];
    };

    return (
        <tr className="hover:bg-gray-50 border-b">
            <td className="p-3 text-sm">{product.id}</td>
            <td className="p-3 text-sm">{displayField('name')}</td>
            <td className="p-3 text-sm">{displayField('category')}</td>
            <td className="p-3 text-sm">{displayField('brand')}</td>
            <td className="p-3 text-sm text-center font-bold">
                {displayField('stock')}
            </td>
            <td className="p-3 text-sm text-center">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
                    {status}
                </span>
            </td>
            <td className="p-3 text-sm flex space-x-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800 font-medium">Save</button>
                        <button onClick={() => { setIsEditing(false); setFormData(product); setError(null); }} className="text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        <button onClick={handleDelete} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                        <button onClick={() => setSelectedProduct(product)} className="text-purple-600 hover:text-purple-800 font-medium">History</button>
                    </>
                )}
            </td>
        </tr>
    );
};

export default ProductRow;