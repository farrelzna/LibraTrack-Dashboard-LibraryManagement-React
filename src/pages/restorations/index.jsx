import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant';

const Restorations = () => {
    const [form, setForm] = useState({
        id_member: '',
        id_buku: '',
        jumlah_denda: '',
        jenis_denda: '',
        deskripsi: ''
    });
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [dendaData, setDendaData] = useState([]);
    const [detailDenda, setDetailDenda] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Search and pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState({
        memberId: '',
        bookId: ''
    });

    // Update filtered data when dendaData or search query changes
    useEffect(() => {
        const filteredResults = dendaData.filter(denda => {
            const matchMember = searchQuery.memberId ? denda.id_member.toString() === searchQuery.memberId : true;
            const matchBook = searchQuery.bookId ? denda.id_buku.toString() === searchQuery.bookId : true;

            return matchMember && matchBook;
        });

        setFilteredData(filteredResults);
        setCurrentPage(1); // Reset to first page when search changes
    }, [dendaData, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when data or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, filteredData]);

    const API_URL = 'http://45.64.100.26:88/perpus-api/public/api';
    const apiUrl = `${API_URL}/denda`;
    const getToken = localStorage.getItem('token');

    const fetchDenda = useCallback(async () => {
        try {
            const res = await axios.get(apiUrl, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDendaData(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch fine data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch fine data',
                confirmButtonColor: '#3B82F6'
            });
        }
    }, [getToken, apiUrl]);

    const fetchBooks = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/buku`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            console.log('Books API Response:', response);

            if (response.data && response.data.data) {
                setBooks(response.data.data);
            } else if (Array.isArray(response.data)) {
                setBooks(response.data);
            } else {
                console.error('Unexpected books data format:', response.data);
                setBooks([]);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            console.error('Error details:', error.response?.data || error.message);
            setBooks([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load books data'
            });
        }
    }, [getToken, API_URL]);

    const fetchMembers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/member`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            console.log('Members API Response:', response);

            if (response.data && response.data.data) {
                setMembers(response.data.data);
            } else if (Array.isArray(response.data)) {
                setMembers(response.data);
            } else {
                console.error('Unexpected members data format:', response.data);
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            console.error('Error details:', error.response?.data || error.message);
            setMembers([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load members data'
            });
        }
    }, [getToken, API_URL]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchDenda(),
                    fetchBooks(),
                    fetchMembers()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, [fetchDenda, fetchBooks, fetchMembers]);

    const handleShowDetail = (id_member) => {
        const detail = dendaData.find((denda) => denda.id_member === id_member);
        if (detail) {
            setDetailDenda(detail);
            setShowModal(true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Data not found',
                confirmButtonColor: '#3B82F6'
            });
        }
    };

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }; const handleChange = (e) => {
        const value = ['id_buku', 'id_member'].includes(e.target.name) ?
            parseInt(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const validFineTypes = ['terlambat', 'kerusakan', 'lainnya'];

    const handleCreateDenda = async () => {
        // Validate required fields
        const errors = [];
        if (!form.id_member) errors.push('Member ID is required');
        if (!form.id_buku) errors.push('Book ID is required');
        if (!form.jumlah_denda) errors.push('Fine amount is required');
        if (!form.jenis_denda) errors.push('Fine type is required');

        if (errors.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: errors.join('<br>'),
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        // Validate fine amount
        if (isNaN(form.jumlah_denda) || parseFloat(form.jumlah_denda) <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Fine amount must be a positive number',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        // Validate fine type
        if (!validFineTypes.includes(form.jenis_denda)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please select a valid fine type',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        try {
            await axios.post(apiUrl, form, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setForm({
                id_member: '',
                id_buku: '',
                jumlah_denda: '',
                jenis_denda: '',
                deskripsi: ''
            });
            fetchDenda();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Fine data successfully added',
                confirmButtonColor: '#3B82F6'
            });
        } catch (error) {
            console.error('Failed to add fine:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add fine data',
                confirmButtonColor: '#3B82F6'
            });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setDetailDenda(null);
    };

    // Handle search input changes
    const handleSearch = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Clear search fields
    const handleClearSearch = () => {
        setSearchQuery({
            memberId: '',
            bookId: ''
        });
    };

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Fine Management</h1>
                <p className="mt-2 text-gray-600">Manage library fines and penalties</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Form Section */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Fine</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Book</label>
                                <select
                                    name="id_buku"
                                    value={form.id_buku}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a Book</option>
                                    {Array.isArray(books) && books.length > 0 ? (
                                        books.map((book) => (
                                            <option key={book.id} value={book.id}>
                                                ID: {book.id} | {book.judul} - (Stock: {book.stok})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading books...</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member</label>
                                <select
                                    name="id_member"
                                    value={form.id_member}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a Member</option>
                                    {Array.isArray(members) && members.length > 0 ? (
                                        members.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                ID: {member.id} | {member.nama}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading members...</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fine Amount</label>
                                <input
                                    type="number"
                                    name="jumlah_denda"
                                    value={form.jumlah_denda}
                                    onChange={handleChange}
                                    placeholder="Enter Fine Amount"
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fine Type</label>
                                <select
                                    name="jenis_denda"
                                    value={form.jenis_denda}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Fine Type</option>
                                    <option value="terlambat">Late Return</option>
                                    <option value="kerusakan">Damage</option>
                                    <option value="lainnya">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="deskripsi"
                                    value={form.deskripsi}
                                    onChange={handleChange}
                                    placeholder="Enter Description"
                                    rows="3"
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleCreateDenda}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Add Fine
                            </button>
                        </div>
                    </div>
                </div>

                {/* Guidelines Section */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Guidelines</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ensure Member ID and Book ID are valid
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Fine amount must be a valid number
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Provide clear description for record keeping
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Fine List</h2>
                    <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Search by Member ID</label>
                                <input
                                    type="number"
                                    name="memberId"
                                    value={searchQuery.memberId}
                                    onChange={handleSearch}
                                    placeholder="Enter member ID"
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Search by Book ID</label>
                                <input
                                    type="number"
                                    name="bookId"
                                    value={searchQuery.bookId}
                                    onChange={handleSearch}
                                    placeholder="Enter book ID"
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Search
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((denda, index) => (
                                <tr key={`${denda.id_member}-${index}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{denda.id_member}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{denda.id_buku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(denda.jumlah_denda)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{denda.jenis_denda}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{denda.deskripsi}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleShowDetail(denda.id_member)}
                                            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    const newSize = Number(e.target.value);
                                    setPageSize(newSize);
                                    setCurrentPage(1);

                                    // Show notification for page size change
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
                                }}
                                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-sm text-gray-700">entries</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-700">
                                Showing {filteredData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`px-3 py-1 text-sm rounded-lg ${
                                                    currentPage === pageNumber
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && (
                                        <span className="px-2 text-gray-500">...</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage >= totalPages}
                                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage >= totalPages}
                                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title="Fine Details"
            >
                {detailDenda ? (
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Member ID</p>
                                <p className="font-medium">{detailDenda.id_member}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Book ID</p>
                                <p className="font-medium">{detailDenda.id_buku}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fine Amount</p>
                                <p className="font-medium">{detailDenda.jumlah_denda}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fine Type</p>
                                <p className="font-medium">{detailDenda.jenis_denda}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="font-medium">{detailDenda.deskripsi}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500">Data not found</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Restorations;