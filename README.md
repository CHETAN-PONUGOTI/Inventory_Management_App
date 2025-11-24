# 📦 Inventory Management System

A full-stack web application designed for managing product inventory, built using **ReactJS** for the frontend and **Node.js (Express)** with a **SQLite** database for the backend.

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites

You must have the following installed on your system:

* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)

### 📁 Project Structure

The repository is divided into two main components:

| Folder | Technology | Purpose |
| :--- | :--- | :--- |
| `backend/` | Node.js, Express, SQLite | RESTful API, database operations, and file handling (CSV import/export). |
| `frontend/` | ReactJS, Axios, Tailwind CSS | User interface, routing, and data visualization. |

---

## ⚙️ Setup and Installation

### 1. Backend Setup

1.  Navigate into the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install the required Node.js dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `backend` folder for configuration:
    ```
    # backend/.env
    PORT=5000
    DATABASE_PATH=./inventory.db
    FRONTEND_URL=http://localhost:3000
    ```

4.  Run the server in development mode. This will also initialize the `inventory.db` file and the necessary tables (`products`, `inventory_history`).
    ```bash
    npm run dev
    # The server should start on http://localhost:5000
    ```

### 2. Frontend Setup

1.  Navigate into the `frontend` directory:
    ```bash
    cd ../frontend
    ```

2.  Install the required React dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env.local` file in the `frontend` folder to configure the API base URL:
    ```
    # frontend/.env.local
    REACT_APP_API_BASE_URL=http://localhost:5000/api
    ```

4.  Start the React development server:
    ```bash
    npm start
    # The application should open in your browser on http://localhost:3000
    ```

---

## ✨ Features

The application provides a comprehensive set of tools for inventory management:

### Core Management
* **CRUD Operations:** View, Add, Edit, and Delete products via inline editing on the main table.
* **Stock Tracking:** Products are automatically marked "In Stock" or "Out of Stock" based on the quantity.
* **Search and Filter:** Filter products by category and search by name or brand.

### Inventory History
* **Detailed Logging:** Changes to a product's stock automatically trigger an entry in the `inventory_history` table.
* **History Sidebar:** Clicking the "History" action on a product displays a sidebar with a chronological log of all stock changes for that item.

### Data Handling
* **CSV Import:** Upload a CSV file to bulk-add new products to the inventory. Duplicate entries (by name) are skipped.
* **CSV Export:** Download the entire product list as a CSV file.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **ReactJS** | Single Page Application (SPA) for dynamic UI components. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for fast, responsive design. |
| **HTTP Client** | **Axios** | Used for making promise-based API requests from the frontend. |
| **Backend** | **Node.js / Express** | Fast, unopinionated web framework for API creation. |
| **Database** | **SQLite3** | Lightweight, file-based relational database for development. |
| **File Handling** | **Multer** / **CSV-Parser** | Middleware for handling file uploads and parsing CSV data for import. |
| **Validation** | **Express-Validator** | Middleware for ensuring data integrity and enforcing input rules on the backend. |

---

## 📝 API Endpoints Summary

The backend exposes the following RESTful API endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieves the list of all products (supports filtering, searching, and sorting via query parameters). |
| `POST` | `/api/products` | Creates a new product. |
| `PUT` | `/api/products/:id` | Updates a product's details and records stock changes in history. |
| `DELETE` | `/api/products/:id` | Deletes a product. |
| `GET` | `/api/products/:id/history` | Retrieves the inventory change history for a specific product. |
| `POST` | `/api/products/import` | Uploads and processes a CSV file to add products in bulk. |
| `GET` | `/api/products/export` | Generates and downloads the current product list as a CSV file. |
