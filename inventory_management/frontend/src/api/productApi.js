// frontend/src/api/productApi.js
import axios from 'axios';

const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/products`,
});

export const fetchProducts = (search, category, sort, order) => {
    return API.get('/', {
        params: { search, category, sort, order }
    });
};

export const updateProduct = (id, productData) => {
    return API.put(`/${id}`, productData);
};

export const deleteProduct = (id) => {
    return API.delete(`/${id}`);
};

export const importProducts = (formData) => {
    return API.post('/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const exportProducts = () => {
    // This is handled via window.open in the component for easy file download
    window.open(`${process.env.REACT_APP_API_BASE_URL}/products/export`);
};

export const fetchProductHistory = (id) => {
    return API.get(`/${id}/history`);
};

export const createNewProduct = (productData) => {
    return API.post('/', productData);
};