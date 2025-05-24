import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import axios from "axios";
import Swal from "sweetalert2";
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { API_URL } from '../../constant';
import Alert from '../../components/Alert';

export default function BooksIndex() {
    const [books, setBooks] = useState([]);
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
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        message: ''
    });
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

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    const [view, setView] = useState('grid');
    const [selectedRows, setSelectedRows] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [current, setCurrent] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [exportLoading, setExportLoading] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const getToken = localStorage.getItem("token");
        axios
            .get(`${API_URL}buku`, {
                headers: { Authorization: `Bearer ${getToken}` },
            })
            .then((res) => {
                // console.log("Response API:", res.data); // Debug
                setBooks(res.data); // Fix struktur
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    navigate("/login");
                } else {
                    setError(err.response?.data || {});
                }
            });
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
                `${API_URL}buku`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setAlertConfig({
                type: 'success',
                message: 'New book added successfully'
            });
            setShowAlert(true);
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
            setAlertConfig({
                type: 'error',
                message: 'Failed to add a book'
            });
            setShowAlert(true);
        }
    };


    const handleDetail = async (id) => {
        try {
            const response = await axios.get(
                `${API_URL}buku/${id}`,
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
                `${API_URL}buku/${id}`,
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

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("_method", "PUT");

            await axios.post(
                `${API_URL}buku/${selectedBook.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setAlertConfig({
                type: 'success',
                message: 'Book Successfully Updated'
            });
            setShowAlert(true);
            setShowEditModal(false);
            setSelectedBook(null);
            fetchBooks();
        } catch (err) {
            setAlertConfig({
                type: 'error',
                message: 'Failed to Update Book'
            });
            setShowAlert(true);
        }
    };

    const handleDelete = (id) => {
        setSelectedBook(books.find(book => book.id === id));
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(
                `${API_URL}buku/${selectedBook.id}`,
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
            setAlertConfig({
                type: 'success',
                message: 'Book Deleted Successfully'
            });
            setShowAlert(true);
        } catch (err) {
            setAlertConfig({
                type: 'error',
                message: 'Failed to Delete Book'
            });
            setShowAlert(true);
        }
    };

    // Add these functions after your existing functions
    const sortBooks = (books, sortConfig) => {
        if (!sortConfig.key) return books;

        return [...books].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    const SortIcon = ({ direction }) => {
        if (!direction) {
            return (
                <svg className="w-4 h-4 ml-1 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        return direction === 'ascending' ? (
            <svg className="w-4 h-4 ml-1 inline-block text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 ml-1 inline-block text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredBooks = React.useMemo(() => {
        return sortBooks(books, sortConfig).filter((book) =>
            book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.no_rak.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.penerbit.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.tahun_terbit.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [books, searchTerm, sortConfig]);

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} books?`)) {
            setLoading(true);
            try {
                await Promise.all(selectedRows.map(id =>
                    axios.delete(`${API_URL}/buku/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
                    })
                ));
                Swal.fire("Success", `Successfully deleted ${selectedRows.length} books`, "success");
                setSelectedRows([]);
                fetchBooks();
            } catch (err) {
                Swal.fire("Error", "Failed to delete books", "error");
            }
            setLoading(false);
        }
    };

    const handleExportData = async (format) => {
        try {
            setExportLoading(true);
            const exportData = filteredBooks.map(book => ({
                'Rack Number': book.no_rak || '',
                'Title': book.judul || '',
                'Author': book.pengarang || '',
                'Publisher': book.penerbit || '',
                'Publication Year': book.tahun_terbit || '',
                'Stock': book.stok || '',
                'Detail': book.detail || ''
            }));

            const fileName = `books-${new Date().toISOString().split('T')[0]}`;

            if (format === 'csv') {
                const csv = Papa.unparse(exportData);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, `${fileName}.csv`);
            } else if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Books");
                XLSX.writeFile(wb, `${fileName}.xlsx`);
            }

            Swal.fire("Success", `Successfully exported data as ${format.toUpperCase()}`, "success");
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire("Error", `Failed to export data: ${error.message}`, "error");
        } finally {
            setExportLoading(false);
            setShowExportDropdown(false);
        }
    };

    const calculateStats = () => {
        const total = books.length;
        const newThisMonth = books.filter(m =>
            new Date(m.created_at).getMonth() === new Date().getMonth()
        ).length;
        return { total, newThisMonth };
    };

    const GridView = ({ books, handleDetail, handleEdit, handleDelete, selectedRows, setSelectedRows }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-5 gap-6">
                {books.map((book) => (
                    <div key={book.id} className="relative group">
                        {/* Checkbox for selection - positioned top right */}
                        <div className="absolute top-2 right-2 z-20">
                            <input
                                type="checkbox"
                                checked={selectedRows.includes(book.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRows(prev => [...prev, book.id]);
                                    } else {
                                        setSelectedRows(prev => prev.filter(id => id !== book.id));
                                    }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        {/* Book Card */}
                        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                            {/* Book Cover */}
                            <div className="relative h-64 bg-gradient-to-br from-blue-600 to-blue-700 p-4 flex items-center justify-center">
                                {/* Overlay for dim background */}
                                <div className="absolute inset-0 bg-black opacity-10 rounded-lg "></div>

                                {/* Book cover container */}
                                <div className="relative w-40 h-56 bg-white rounded-md shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 ease-in-out group overflow-hidden">

                                    {/* Book spine */}
                                    <div className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-gray-300 via-gray-200 to-transparent rounded-l-md shadow-inner z-10"></div>

                                    {/* Front cover */}
                                    <div className="absolute inset-0 pl-3 pr-2 py-4 flex flex-col justify-between z-20">
                                        <div className="text-center">
                                            <div className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{book.judul}</div>
                                            <div className="text-xs text-gray-500 italic">{book.pengarang}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 text-right pr-1">LibraTrack</div>
                                    </div>

                                    {/* Edge shadow to give 3D depth */}
                                    <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-l from-gray-300 to-transparent"></div>

                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition duration-300 rounded-sm"></div>
                                </div>
                            </div>


                            {/* Book Information */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        Rack: {book.no_rak}
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Stock: {book.stok}
                                    </span>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2">{book.judul}</h3>
                                    <p className="text-xs text-gray-600">By {book.pengarang}</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {book.penerbit}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {book.tahun_terbit}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleDetail(book.id)}
                                        className="flex items-center justify-center px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleEdit(book.id)}
                                        className="flex items-center justify-center px-3 py-1.5 text-xs bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        className="flex items-center justify-center px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const TableView = ({ books, handleDetail, handleEdit, handleDelete, selectedRows, setSelectedRows, sortConfig, requestSort }) => {
        return (
            <div className="bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(books.map(book => book.id));
                                        } else {
                                            setSelectedRows([]);
                                        }
                                    }}
                                    checked={selectedRows.length === books.length}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th
                                onClick={() => requestSort('no_rak')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Rack Number
                                    <SortIcon direction={sortConfig.key === 'no_rak' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th
                                onClick={() => requestSort('judul')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Title
                                    <SortIcon direction={sortConfig.key === 'judul' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th
                                onClick={() => requestSort('pengarang')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Author
                                    <SortIcon direction={sortConfig.key === 'pengarang' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th
                                onClick={() => requestSort('penerbit')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Publisher
                                    <SortIcon direction={sortConfig.key === 'penerbit' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th
                                onClick={() => requestSort('tahun_terbit')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Year
                                    <SortIcon direction={sortConfig.key === 'tahun_terbit' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th
                                onClick={() => requestSort('stok')}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    Stock
                                    <SortIcon direction={sortConfig.key === 'stok' ? sortConfig.direction : null} />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {books.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(book.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRows(prev => [...prev, book.id]);
                                            } else {
                                                setSelectedRows(prev => prev.filter(id => id !== book.id));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.no_rak}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.judul}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.pengarang}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.penerbit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.tahun_terbit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                    {book.stok}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDetail(book.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(book.id)}
                                            className="text-yellow-600 hover:text-yellow-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // First, add this pagination calculation function before the return statement
    const paginateBooks = (books, currentPage, pageSize) => {
        const indexOfLastBook = currentPage * pageSize;
        const indexOfFirstBook = indexOfLastBook - pageSize;
        return books.slice(indexOfFirstBook, indexOfLastBook);
    };

    const paginatedBooks = paginateBooks(filteredBooks, currentPage, pageSize);

    // Button click handlers with notifications
    const handleViewChange = (newView) => {
        setView(newView);
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: `Switched to ${newView} view`
        });
    };

    // Pagination handling with notifications
    const handlePageChange = (page) => {
        setCurrentPage(page);
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'info',
            title: `Page ${page}`
        });
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1);

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'info',
            title: `Showing ${newSize} entries per page`
        });
    };

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);

        if (searchTerm) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'info',
                title: `Searching for "${searchTerm}"`
            });
        }
    };

    const images = [
        '/src/assets/img/1.jpg',
        '/src/assets/img/2.jpg',
        '/src/assets/img/3.jpg',
        '/src/assets/img/image.png',
    ];

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="min-h-screen">
            {showAlert && (
                <Alert
                    type={alertConfig.type}
                    message={alertConfig.message}
                    onClose={() => setShowAlert(false)}
                />
            )}
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-xs p-10">
                <h1 className="text-2xl text-gray-800 tracking-tight">Book's Management</h1>
                <p className="mt-2 text-xs text-gray-600">Manage your library's book collection</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 my-10 gap-6">
                <div className="bg-white rounded-xl shadow-xs p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Total Books</p>
                            <h3 className="text-xl font-bold text-gray-800">{calculateStats().total}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">+{calculateStats().newThisMonth} new this month</p>
                </div>
                <div className="relative w-full h-30 rounded-xl overflow-hidden">
                    {/* Slides */}
                    <div className="relative h-56 md:h-96">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="absolute left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white text-3xl font-bold">Library System</h3>
                            <p className="text-white/80 mt-2 text-lg">Modern Library Management System</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-xs my-10">
                <div className="flex flex-wrap items-center p-4 justify-between gap-4">
                    <div className="flex-1 min-w-[60px] max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleViewChange('table')}
                            className={`p-2 rounded-lg ${view === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleViewChange('grid')}
                            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select className="px-3 py-2 text-xs bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                            <option value="">All Categories</option>
                            <option value="fiction">Fiction</option>
                            <option value="non-fiction">Non-Fiction</option>
                        </select>

                        <div className="flex items-center text-xs gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 bg-gray-50  rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="dropdown relative">
                            <button
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs">Export</span>
                            </button>
                            <div className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ${showExportDropdown ? 'block' : 'hidden'}`}>
                                <button
                                    onClick={() => handleExportData('csv')}
                                    className="block w-full text-xs text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => handleExportData('excel')}
                                    className="block w-full text-xs text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Export as Excel
                                </button>
                            </div>
                        </div>

                        {/* Bulk Delete */}
                        {selectedRows.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-xs text-white rounded-lg hover:bg-red-700"
                            >
                                Delete Selected ({selectedRows.length})
                            </button>
                        )}

                        {/* Add New Book */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-xs text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors flex items-center justify-center gap-2"
                            style={{ width: '150px' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Book
                        </button>
                    </div>
                </div>

                {/* Books Grid/List */}
                {view === 'table' ? (
                    <TableView
                        books={paginatedBooks} // Use paginatedBooks instead of filteredBooks
                        handleDetail={handleDetail}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                    />
                ) : (
                    <GridView
                        books={paginatedBooks} // Use paginatedBooks instead of filteredBooks
                        handleDetail={handleDetail}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                    />
                )}

                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-700">Show</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="px-2 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-xs text-gray-700">Entries</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-700">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredBooks.length)} of {filteredBooks.length} entries
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, Math.ceil(filteredBooks.length / pageSize)))].map((_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-3 py-1 text-xs rounded-lg ${currentPage === pageNumber
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    {Math.ceil(filteredBooks.length / pageSize) > 5 && (
                                        <span className="px-2 text-gray-500">...</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil(filteredBooks.length / pageSize)}
                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handlePageChange(Math.ceil(filteredBooks.length / pageSize))}
                                    disabled={currentPage >= Math.ceil(filteredBooks.length / pageSize)}
                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Book Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Book"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Rack Number</label>
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
                            <label className="block text-xs font-medium text-gray-700">Title</label>
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
                            <label className="block text-xs font-medium text-gray-700">Author</label>
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
                            <label className="block text-xs font-medium text-gray-700">Year Published</label>
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
                            <label className="block text-xs font-medium text-gray-700">Published</label>
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
                            <label className="block text-xs font-medium text-gray-700">Stock</label>
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
                            <label className="block text-xs font-medium text-gray-700">Description</label>
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
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Create Books
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Book Details"
            >
                {selectedBook && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Rack Number</p>
                                <p className="font-medium">{selectedBook.no_rak}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Title</p>
                                <p className="font-medium">{selectedBook.judul}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Author</p>
                                <p className="font-medium">{selectedBook.pengarang}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Year Published</p>
                                <p className="font-medium">{selectedBook.tahun_terbit}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Publisher</p>
                                <p className="font-medium">{selectedBook.penerbit}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className="font-medium">{selectedBook.stok}</p>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Detail</p>
                            <p className="font-medium">{selectedBook.detail}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Book"
            >
                {selectedBook && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Rack Number</label>
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
                                <label className="block text-xs font-medium text-gray-700">Title</label>
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
                                <label className="block text-xs font-medium text-gray-700">Author</label>
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
                                <label className="block text-xs font-medium text-gray-700">TYear Published</label>
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
                                <label className="block text-xs font-medium text-gray-700">Publisher</label>
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
                                <label className="block text-xs font-medium text-gray-700">Stock</label>
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
                                <label className="block text-xs font-medium text-gray-700">Detail</label>
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
                                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                                Update Books
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    {selectedBook && (
                        <>
                            <p className="text-gray-600">
                                Are you sure you want to delete this book?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-800">{selectedBook.judul}</h3>
                                <p className="text-xs text-gray-600">Author: {selectedBook.pengarang}</p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}