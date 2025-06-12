import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant'
const apiUrl = `${API_URL}denda`;

const Restorations = () => {
    const [form, setForm] = useState({
        id_member: '',
        id_buku: '',
        jumlah_denda: '',
        jenis_denda: '',
        deskripsi: ''
    });
    const [totalStats, setTotalStats] = useState({
        total: 0,
        defect: 0,
        late: 0,
        other: 0,
        totalCount: 0,
        defectCount: 0,
        lateCount: 0,
        otherCount: 0
    });
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [dendaData, setDendaData] = useState([]);
    const [detailDenda, setDetailDenda] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    // Search and pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

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

    // Reset to first page when data or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, filteredData]);

    const getToken = localStorage.getItem('access_token');

    // Merged fetch function to handle all data types
    const fetchData = useCallback(async () => {
        setLoading(true); // Set loading to true before fetching
        // Define the endpoints to fetch
        const endpoints = [
            { name: 'denda', setter: setDendaData },
            { name: 'buku', setter: setBooks },
            { name: 'member', setter: setMembers }
        ];

        try {
            // Process each endpoint
            const results = await Promise.allSettled(endpoints.map(async ({ name, setter }) => {
                try {
                    const url = `${API_URL}${name.startsWith('/') ? name.substring(1) : name}`;
                    const response = await axios.get(url, {
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${getToken}`
                        }
                    });

                    if (response.data && Array.isArray(response.data.data)) {
                        setter(response.data.data);
                    } else if (Array.isArray(response.data)) {
                        setter(response.data);
                    } else if (response.data && typeof response.data === 'object') {
                        setter([response.data]);
                    } else {
                        setter([]);
                    }
                    return { success: true, name };
                } catch (error) {
                    console.error(`Error fetching ${name}:`, error);
                    setter([]);
                    return { success: false, name, error };
                }
            }));

            const criticalFailures = results.filter(
                (result, index) => result.status === 'rejected' ||
                    (!result.value?.success && endpoints[index].name !== 'denda')
            );

            if (criticalFailures.length > 0) {
                console.error('Critical data loading failures:', criticalFailures);
            }
        } catch (error) {
            console.error('Error in batch data loading:', error);
        } finally {
            setLoading(false); // Set loading to false after all fetches complete
        }
    }, [getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
    };

    const handleChange = (e) => {
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

            fetchData();
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        // Notifikasi sorting
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'success',
            title: `Sorted by ${key} ${direction === 'asc' ? 'ascending' : 'descending'}`
        });
    };

    const sortData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            // Untuk nilai numerik
            if (['jumlah_denda', 'id_buku', 'id_member'].includes(sortConfig.key)) {
                const valueA = parseFloat(a[sortConfig.key]) || 0;
                const valueB = parseFloat(b[sortConfig.key]) || 0;
                return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
            }

            // Untuk tanggal
            if (['created_at', 'updated_at'].includes(sortConfig.key)) {
                const dateA = new Date(a[sortConfig.key]);
                const dateB = new Date(b[sortConfig.key]);
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }

            // Untuk teks (jenis_denda, deskripsi)
            const valueA = String(a[sortConfig.key]).toLowerCase();
            const valueB = String(b[sortConfig.key]).toLowerCase();
            if (sortConfig.direction === 'asc') {
                return valueA.localeCompare(valueB);
            }
            return valueB.localeCompare(valueA);
        });
    };

    // Komponen untuk ikon sorting
    const SortIcon = ({ column }) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? (
                <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        );
    };

    const sortedData = sortData(filteredData);
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Handle search input changes
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        let filtered = dendaData;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(item => {
                switch (filterStatus) {
                    case 'active':
                        return item.jenis_denda === 'kerusakan'; // Defect fines
                    case 'late':
                        return item.jenis_denda === 'terlambat'; // Late return fines
                    case 'returned':
                        return item.jenis_denda === 'lainnya'; // Other types of fines
                    default:
                        return true;
                }
            });
        }

        // Apply search filter if there's a search query
        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(item => {
                const book = books.find(b => b.id === item.id_buku);
                const member = members.find(m => m.id === item.id_member);

                return (
                    String(item.id_buku).toLowerCase().includes(searchTerm) ||
                    (book && book.judul.toLowerCase().includes(searchTerm)) ||
                    String(item.id_member).toLowerCase().includes(searchTerm) ||
                    (member && member.nama.toLowerCase().includes(searchTerm)) ||
                    item.jenis_denda.toLowerCase().includes(searchTerm) ||
                    (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm))
                );
            });
        }

        setFilteredData(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [searchQuery, dendaData, books, members, filterStatus]);


    const handleExportData = (type) => {
        // Prepare the data for export
        const exportData = dendaData.map(item => {
            const book = books.find(b => b.id === item.id_buku);
            const member = members.find(m => m.id === item.id_member);

            return {
                'Fine ID': item.id,
                'Member ID': item.id_member,
                'Member Name': member ? member.nama : 'N/A',
                'Book ID': item.id_buku,
                'Book Title': book ? book.judul : 'N/A',
                'Fine Amount': formatRupiah(item.jumlah_denda),
                'Fine Type': item.jenis_denda,
                'Description': item.deskripsi || 'N/A'
            };
        });

        // Calculate summaries with counts
        const summaries = dendaData.reduce((acc, item) => {
            const amount = parseFloat(item.jumlah_denda.replace(/[^0-9.-]+/g, ''));
            if (item.jenis_denda === 'kerusakan') {
                acc.kerusakanTotal += amount;
                acc.kerusakanCount += 1;
            } else if (item.jenis_denda === 'terlambat') {
                acc.terlambatTotal += amount;
                acc.terlambatCount += 1;
            } else if (item.jenis_denda === 'lainnya') {
                acc.lainnyaTotal += amount;
                acc.lainnyaCount += 1;
            }
            return acc;
        }, { 
            kerusakanTotal: 0, kerusakanCount: 0,
            terlambatTotal: 0, terlambatCount: 0,
            lainnyaTotal: 0, lainnyaCount: 0
        });

        const grandTotal = summaries.kerusakanTotal + summaries.terlambatTotal + summaries.lainnyaTotal;
        const totalCount = summaries.kerusakanCount + summaries.terlambatCount + summaries.lainnyaCount;

        // Add empty row and summary section
        const summaryData = [
            { 'Fine ID': '', 'Member ID': '', 'Member Name': '', 'Book ID': '', 'Book Title': '', 'Fine Amount': '', 'Fine Type': '', 'Description': '' },
            { 'Fine ID': '', 'Member ID': '', 'Member Name': 'SUMMARY', 'Book ID': '', 'Book Title': '', 'Fine Amount': '', 'Fine Type': '', 'Description': '' },
            { 'Fine ID': '', 'Member ID': '', 'Member Name': 'Kerusakan Total', 'Book ID': `(${summaries.kerusakanCount} items)`, 'Book Title': '', 'Fine Amount': formatRupiah(summaries.kerusakanTotal), 'Fine Type': '', 'Description': '' },
            { 'Fine ID': '', 'Member ID': '', 'Member Name': 'Terlambat Total', 'Book ID': `(${summaries.terlambatCount} items)`, 'Book Title': '', 'Fine Amount': formatRupiah(summaries.terlambatTotal), 'Fine Type': '', 'Description': '' },
            { 'Fine ID': '', 'Member ID': '', 'Member Name': 'Lainnya Total', 'Book ID': `(${summaries.lainnyaCount} items)`, 'Book Title': '', 'Fine Amount': formatRupiah(summaries.lainnyaTotal), 'Fine Type': '', 'Description': '' },
            { 'Fine ID': '', 'Member ID': '', 'Member Name': 'GRAND TOTAL', 'Book ID': `(${totalCount} items)`, 'Book Title': '', 'Fine Amount': formatRupiah(grandTotal), 'Fine Type': '', 'Description': '' }
        ];

        const finalExportData = [...exportData, ...summaryData];

        if (type === 'csv') {
            // Export as CSV
            const headers = Object.keys(finalExportData[0]).join(',');
            const csvData = finalExportData.map(row => Object.values(row).join(',')).join('\n');
            const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `restorations_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else if (type === 'excel') {
            // Export as Excel
            const ws = XLSX.utils.json_to_sheet(finalExportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Restorations');
            XLSX.writeFile(wb, `restorations_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        }

        // Show success notification
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'success',
            title: `Successfully exported as ${type.toUpperCase()}`
        });
    };

    useEffect(() => {
        if (!dendaData || dendaData.length === 0) {
            setTotalStats({
                total: 0,
                defect: 0,
                late: 0,
                other: 0,

                totalCount: 0,
                defectCount: 0,
                lateCount: 0,
                otherCount: 0
            });
            return;
        }

        const stats = {
            total: 0,
            defect: 0,
            late: 0,
            other: 0,
            totalCount: dendaData.length,
            defectCount: 0,
            lateCount: 0,
            otherCount: 0
        };


        dendaData.forEach(denda => {
            const amount = parseFloat(denda.jumlah_denda) || 0;
            stats.total += amount;

            switch (denda.jenis_denda) {
                case 'kerusakan':
                    stats.defect += amount;
                    stats.defectCount++;
                    break;
                case 'terlambat':
                    stats.late += amount;
                    stats.lateCount++;
                    break;
                case 'lainnya':
                    stats.other += amount;
                    stats.otherCount++;
                    break;
                default:
                    break;
            }
        });

        setTotalStats(stats);
    }, [dendaData]);

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="container min-h-screen p-10">
                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-xs p-10">
                        <h1 className="text-2xl text-gray-800">Fine's Management</h1>
                        <p className="mt-2 text-xs text-gray-600">Manage library fines and penalties</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                        {/* Form Section */}
                        <div className="bg-white rounded-xl shadow-xs">
                            <div className="p-6">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4">Add Fine</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Book</label>
                                        <select
                                            name="id_buku"
                                            value={form.id_buku}
                                            onChange={handleChange}
                                            className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                        <label className="block text-xs font-medium text-gray-700">Member</label>
                                        <select
                                            name="id_member"
                                            value={form.id_member}
                                            onChange={handleChange}
                                            className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                        <label className="block text-xs font-medium text-gray-700">Fine Amount</label>
                                        <input
                                            type="number"
                                            name="jumlah_denda"
                                            value={form.jumlah_denda}
                                            onChange={handleChange}
                                            placeholder="Enter Fine Amount"
                                            className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Fine Type</label>
                                        <select
                                            name="jenis_denda"
                                            value={form.jenis_denda}
                                            onChange={handleChange}
                                            className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Fine Type</option>
                                            <option value="terlambat">Late Return</option>
                                            <option value="kerusakan">Defect</option>
                                            <option value="lainnya">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="deskripsi"
                                            value={form.deskripsi}
                                            onChange={handleChange}
                                            placeholder="Enter Description"
                                            rows="3"
                                            className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateDenda}
                                        className="w-full px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        Add Fine
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines Section */}
                        <div className="bg-white rounded-xl shadow-xs">
                            <div className="p-6">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4">Guidelines</h2>
                                <ul className="space-y-3">
                                    <li className="flex text-xs items-center text-gray-700">
                                        <svg className="w-3.5 h-3.5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Ensure Member ID and Book ID are valid
                                    </li>
                                    <li className="flex text-xs items-center text-gray-700">
                                        <svg className="w-3.5 h-3.5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Fine amount must be a valid number
                                    </li>
                                    <li className="flex text-xs items-center text-gray-700">
                                        <svg className="w-3.5 h-3.5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Provide clear description for record keeping
                                    </li>
                                    <li className="flex text-xs items-center text-gray-700">
                                        <svg className="w-3.5 h-3.5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1M12 20v1M3 12h1M20 12h1" />
                                        </svg>
                                        "Undefined" Data not available (deleted)
                                    </li>
                                </ul>
                                <div className="grid grid-cols-2 gap-x-4 mt-6">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors duration-300 justify-center p-4 shadow-sm">
                                        <div className='mb-2'>
                                            <p className="text-xs text-white">Total Amount</p>
                                            <p className="text-xl font-semibold text-white truncate w-30">
                                                {formatRupiah(totalStats.total)}
                                            </p>
                                        </div>
                                        <div className='text-end'>
                                            <p className="text-xs text-white">Defect</p>
                                            <div className='flex justify-end'>
                                                <p className="text-sm font-semibold text-white truncate w-30">
                                                    <span className="text-xm ml-1">{totalStats.defectCount}</span> - {formatRupiah(totalStats.defect)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className='mb-2'>
                                            <p className="text-xs text-blue-600 hover:text-blue-400 duration-300">Late</p>
                                            <p className="text-sm font-semibold text-blue-700 hover:text-blue-500 duration-300 truncate w-30">
                                                <span className="text-xl ml-1">{totalStats.lateCount}</span> - {formatRupiah(totalStats.late)}
                                            </p>
                                        </div>
                                        <div className='text-end'>
                                            <p className="text-xs text-blue-600 hover:text-blue-400 duration-300">Other</p>
                                            <div className='flex justify-end'>
                                                <p className="text-sm font-semibold text-blue-700 hover:text-blue-500 duration-300 truncate text-end w-30">
                                                    <span className="text-xl ml-1">{totalStats.otherCount}</span> - {formatRupiah(totalStats.other)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-xs overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">Fine List</h2>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            placeholder="Search by Book ID, Book Title, Member ID, Member Name, or Date..."
                                            className="w-full p-3 pl-10 text-xs rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <div className="absolute left-3 top-4 text-gray-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <div className="dropdown relative">
                                        <button
                                            onClick={() => setShowExportDropdown(!showExportDropdown)}
                                            className="px-4 py-2 w-full bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-xs">Export</span>
                                        </button>
                                        <div
                                            className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ${showExportDropdown ? 'block' : 'hidden'
                                                }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    handleExportData('csv');
                                                    setShowExportDropdown(false);
                                                }}
                                                className="block w-full text-xs text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Export as CSV
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleExportData('excel');
                                                    setShowExportDropdown(false);
                                                }}
                                                className="block w-full text-xs text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Export as Excel
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-6 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'all'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-700 hover:to-blue-600 hover:text-white'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('active')}
                                        className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'active'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-700 hover:to-blue-600 hover:text-white'
                                            }`}
                                    >
                                        Defect
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('late')}
                                        className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'late'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-700 hover:to-blue-600 hover:text-white'
                                            }`}
                                    >
                                        Late
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('returned')}
                                        className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'returned'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-700 hover:to-blue-600 hover:text-white'
                                            }`}
                                    >
                                        Other
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            onClick={() => handleSort('id_buku')}
                                        >
                                            <div className="flex items-center">
                                                Book
                                                <SortIcon column="id_buku" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            onClick={() => handleSort('id_member')}
                                        >
                                            <div className="flex items-center">
                                                Member
                                                <SortIcon column="id_member" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            onClick={() => handleSort('jenis_denda')}
                                        >
                                            <div className="flex items-center">
                                                Fine Type
                                                <SortIcon column="id_buku" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dendaData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                                Tidak ada data denda yang ditampilkan
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((denda, index) => (
                                            <tr key={`${denda.id_member}-${index}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                    {books.find(book => book.id === denda.id_buku)?.judul || 'Undefined'} - ID: {denda.id_buku}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                    {members.find(member => member.id === denda.id_member)?.nama || 'Undefined'} - ID: {denda.id_member}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                    {formatRupiah(denda.jumlah_denda)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                    {denda.jenis_denda}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                    {denda.deskripsi}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                                    <button
                                                        onClick={() => handleShowDetail(denda.id_member)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700">Show</span>
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
                                        className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span className="text-xs text-gray-700">entries</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-gray-700">
                                        Showing {filteredData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                        className={`px-3 py-1 text-xs rounded-lg ${currentPage === pageNumber
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
                                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage >= totalPages}
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
                                        <p className="text-xs text-gray-500">Member ID</p>
                                        <p className="font-medium">{detailDenda.id_member}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Book ID</p>
                                        <p className="font-medium">{detailDenda.id_buku}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Fine Amount</p>
                                        <p className="font-medium">{detailDenda.jumlah_denda}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Fine Type</p>
                                        <p className="font-medium">{detailDenda.jenis_denda}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Description</p>
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
            )}
        </div>
    );
};

export default Restorations;