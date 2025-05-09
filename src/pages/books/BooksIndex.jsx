import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from '../../components/Modal';

export default function BooksIndex() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    const [error, setError] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const [editForm, setEditForm] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "http://45.64.100.26:88/perpus-api/public/api/buku",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setBooks(response.data);
            setError("");
        } catch (err) {
            setError("Gagal mengambil data buku.");
        }
        setLoading(false);
    };

    // Handle form input change (Tambah)
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Submit tambah buku
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            await axios.post(
                "http://45.64.100.26:88/perpus-api/public/api/buku",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            Swal.fire("Berhasil!", "Buku baru telah ditambahkan.", "success");
            setShowAddModal(false);
            setForm({
                no_rak: "",
                judul: "",
                pengarang: "",
                tahun_terbit: "",
                penerbit: "",
                stok: "",
                detail: "",
            });
            fetchBooks();
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat menambahkan buku.", "error");
        }
    };

    // Ambil detail buku untuk modal detail dan edit
    const handleDetail = async (id) => {
        try {
            const response = await axios.get(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setSelectedBook(response.data);
            setShowDetailModal(true);
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengambil data buku.", "error");
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setSelectedBook(response.data);
            setEditForm({
                no_rak: response.data.no_rak || "",
                judul: response.data.judul || "",
                pengarang: response.data.pengarang || "",
                tahun_terbit: response.data.tahun_terbit || "",
                penerbit: response.data.penerbit || "",
                stok: response.data.stok || "",
                detail: response.data.detail || "",
            });
            setShowEditModal(true);
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengambil data buku.", "error");
        }
    };

    // Handle form input change (Edit)
    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value,
        });
    };

    // Submit update buku
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("_method", "PUT");

            await axios.post(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${selectedBook.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            Swal.fire("Berhasil!", "Buku berhasil diupdate.", "success");
            setShowEditModal(false);
            setSelectedBook(null);
            fetchBooks();
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengupdate buku.", "error");
        }
    };

    // Update the handleDelete function
    const handleDelete = (id) => {
        setSelectedBook(books.find(book => book.id === id));
        setShowDeleteModal(true);
    };

    // Add the actual delete function
    const confirmDelete = async () => {
        try {
            await axios.delete(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${selectedBook.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setBooks(books.filter((book) => book.id !== selectedBook.id));
            setShowDeleteModal(false);
            setSelectedBook(null);
            Swal.fire("Berhasil!", "Buku telah dihapus.", "success");
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat menghapus buku.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Book Management</h1>
                <p className="mt-2 text-gray-600">Manage your library's book collection</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Books</p>
                            <h3 className="text-2xl font-bold text-gray-800">{books.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <button
                            // onClick={() => setView('table')}
                            // className={`p-2 rounded-lg ${view === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            // onClick={() => setView('grid')}
                            // className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            // value={filterStatus}
                            // onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Members</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                // value={dateRange.start}
                                // onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                // value={dateRange.end}
                                // onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 bg-gray-50  rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="dropdown relative">
                            <button
                                // onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Export</span>
                            </button>
                            <div
                                // className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ${showExportDropdown ? 'block' : 'hidden'
                                //     }`}
                            >
                                <button
                                    onClick={() => {
                                        // handleExportData('csv');
                                        // setShowExportDropdown(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => {
                                        // handleExportData('excel');
                                        // setShowExportDropdown(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Export as Excel
                                </button>
                            </div>
                        </div>

                        {/* {selectedRows.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete Selected ({selectedRows.length})
                            </button>
                        )} */}

                        <button
                            onClick={() => setShowAddModal(true)}
                           className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Book
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white py-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search books . . ."
                            className="px-4 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                        />
                        <select className="px-4 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">All Categories</option>
                            <option value="fiction">Fiction</option>
                            <option value="non-fiction">Non-Fiction</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Books Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                        <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{book.judul}</h3>
                                        <p className="text-sm text-gray-600">{book.pengarang}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        {book.stok}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">Publisher:</span> {book.penerbit}</p>
                                    <p className="text-sm"><span className="font-medium">Year:</span> {book.tahun_terbit}</p>
                                    <p className="text-sm"><span className="font-medium">Rack:</span> {book.no_rak}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleDetail(book.id)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(book.id)}
                                            className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Book Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Tambah Buku Baru"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No Rak</label>
                            <input
                                type="text"
                                name="no_rak"
                                value={form.no_rak}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Judul</label>
                            <input
                                type="text"
                                name="judul"
                                value={form.judul}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pengarang</label>
                            <input
                                type="text"
                                name="pengarang"
                                value={form.pengarang}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tahun Terbit</label>
                            <input
                                type="number"
                                name="tahun_terbit"
                                value={form.tahun_terbit}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Penerbit</label>
                            <input
                                type="text"
                                name="penerbit"
                                value={form.penerbit}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stok</label>
                            <input
                                type="number"
                                name="stok"
                                value={form.stok}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Detail</label>
                            <textarea
                                name="detail"
                                value={form.detail}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Buku"
            >
                {selectedBook && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">No Rak</p>
                                <p className="font-medium">{selectedBook.no_rak}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Judul</p>
                                <p className="font-medium">{selectedBook.judul}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pengarang</p>
                                <p className="font-medium">{selectedBook.pengarang}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tahun Terbit</p>
                                <p className="font-medium">{selectedBook.tahun_terbit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Penerbit</p>
                                <p className="font-medium">{selectedBook.penerbit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Stok</p>
                                <p className="font-medium">{selectedBook.stok}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Detail</p>
                                <p className="font-medium">{selectedBook.detail}</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Buku"
            >
                {selectedBook && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No Rak</label>
                                <input
                                    type="text"
                                    name="no_rak"
                                    value={editForm.no_rak}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={editForm.judul}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pengarang</label>
                                <input
                                    type="text"
                                    name="pengarang"
                                    value={editForm.pengarang}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Terbit</label>
                                <input
                                    type="number"
                                    name="tahun_terbit"
                                    value={editForm.tahun_terbit}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Penerbit</label>
                                <input
                                    type="text"
                                    name="penerbit"
                                    value={editForm.penerbit}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stok</label>
                                <input
                                    type="number"
                                    name="stok"
                                    value={editForm.stok}
                                    onChange={handleEditChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Detail</label>
                                <textarea
                                    name="detail"
                                    value={editForm.detail}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
            >
                <div className="space-y-4">
                    {selectedBook && (
                        <>
                            <p className="text-gray-600">
                                Apakah Anda yakin ingin menghapus buku ini?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-800">{selectedBook.judul}</h3>
                                <p className="text-sm text-gray-600">Pengarang: {selectedBook.pengarang}</p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                >
                                    Hapus
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}