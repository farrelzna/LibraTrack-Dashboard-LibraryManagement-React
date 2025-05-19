import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant';

const Lendings = () => {
    const [form, setForm] = useState({
        id_buku: '',
        id_member: '',
        tgl_pinjam: '',
        tgl_pengembalian: ''
    });
    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState({
        id_buku: '',
        id_member: ''
    });
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [lateFeesData, setLateFeesData] = useState([]); // State untuk data denda
    const getToken = localStorage.getItem('token');

    useEffect(() => {
        fetchPeminjaman();
        fetchBooks();
        fetchMembers(); // Add fetchMembers to useEffect
    }, []);

    const fetchPeminjaman = async () => {
        const getToken = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}peminjaman`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDataPeminjaman(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch lending data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch lending data',
                confirmButtonColor: '#3B82F6'
            });
        }
    };
    const fetchBooks = async () => {
        const getToken = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}buku`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            console.log('Full API Response:', response); // Debug full response
            console.log('Response data:', response.data); // Debug data structure

            // Set books data directly from response.data
            setBooks(response.data);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'success',
                title: 'Books data loaded successfully'
            });
        } catch (error) {
            console.error('Error fetching books:', error);
            if (error.response) {
                console.log('Error response:', error.response);
                console.log('Error response data:', error.response.data);
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load books data'
            });
        }
    };

    const fetchMembers = async () => {
        const getToken = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}member`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            console.log('Members response:', response.data); // Debug log
            setMembers(response.data);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'success',
                title: 'Members data loaded successfully'
            });
        } catch (error) {
            console.error('Error fetching members:', error);
            if (error.response) {
                console.log('Error response:', error.response);
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load members data'
            });
        }
    };

    const handleSearch = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        // Jika kedua field pencarian kosong, tampilkan semua data
        if (searchQuery.id_buku === '' && searchQuery.id_member === '') {
            setFilteredData(dataPeminjaman);
            return;
        }

        // Filter berdasarkan kriteria pencarian
        const filtered = dataPeminjaman.filter(item => {
            const bookIdMatch = searchQuery.id_buku === '' ||
                item.id_buku === parseInt(searchQuery.id_buku);
            const memberIdMatch = searchQuery.id_member === '' ||
                item.id_member === parseInt(searchQuery.id_member);
            return bookIdMatch && memberIdMatch;
        });

        setFilteredData(filtered);
    }, [searchQuery, dataPeminjaman]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function to handle book lending
    const handlePeminjaman = async () => {
        const getToken = localStorage.getItem('token');

        // Validate required fields
        if (!form.id_buku || !form.id_member || !form.tgl_pinjam || !form.tgl_pengembalian) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        try {
            await axios.post(`${API_URL}peminjaman`, form, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setForm({ id_buku: '', id_member: '', tgl_pinjam: '', tgl_pengembalian: '' });
            fetchPeminjaman();
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Book lending successfully added',
                confirmButtonColor: '#3B82F6'
            });
        } catch (error) {
            console.error('Failed to add lending:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add lending',
                confirmButtonColor: '#3B82F6'
            });
        }
    };
    const handlePengembalian = async (item) => {
        try {
            const today = new Date();
            const targetDate = new Date(item.tgl_pengembalian);
            const selisihHari = Math.ceil(
                (today - targetDate) / (1000 * 60 * 60 * 24)
            );

            // Membuat FormData untuk pengembalian
            const formData = new FormData();
            formData.append("_method", "PUT");

            // Case 1: Pengembalian tepat waktu
            const handleNormalReturn = async () => {
                try {
                    const response = await axios.post(
                        `${API_URL}peminjaman/pengembalian/${item.id}`,
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${getToken}`
                            }
                        }
                    );

                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sukses',
                            text: 'Buku berhasil dikembalikan tepat waktu',
                            confirmButtonColor: '#3B82F6'
                        });
                        fetchPeminjaman();
                    }
                } catch (error) {
                    throw new Error('Gagal memproses pengembalian buku');
                }
            };

            // Case 2: Pengembalian terlambat dengan denda
            const handleLateReturn = async () => {
                try {
                    // 1. Proses pengembalian buku terlebih dahulu
                    await axios.post(
                        `${API_URL}peminjaman/pengembalian/${item.id}`,
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${getToken}`
                            }
                        }
                    );

                    // 2. Buat record denda
                    const jumlahDenda = selisihHari * 1000;
                    const dendaData = {
                        id_member: item.id_member,
                        id_buku: item.id_buku,
                        jumlah_denda: String(jumlahDenda),
                        jenis_denda: "terlambat",
                        deskripsi: `User ${item.id_member} telah telat mengembalikan buku ${item.id_buku} selama ${selisihHari} hari`
                    };

                    await axios.post(`${API_URL}denda`, dendaData, {
                        headers: {
                            Authorization: `Bearer ${getToken}`
                        }
                    });

                    Swal.fire({
                        icon: 'warning',
                        title: 'Buku Dikembalikan Terlambat',
                        html: `Kamu telat ${selisihHari} hari.<br>Denda: ${formatRupiah(jumlahDenda)}`,
                        confirmButtonColor: '#3B82F6'
                    });

                    fetchPeminjaman();
                } catch (error) {
                    throw new Error('Gagal memproses pengembalian dan denda');
                }
            };

            // Eksekusi berdasarkan kondisi keterlambatan
            if (selisihHari > 0) {
                await handleLateReturn();
            } else {
                await handleNormalReturn();
            }

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Gagal memproses pengembalian',
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

    const handleShowDetail = async (id) => {
        const detail = dataPeminjaman.find((item) => item.id === id);
        if (detail) {
            const lateFees = await fetchLateFees(detail.id_member);
            setSelectedId(id);
            setLateFeesData(lateFees);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedId(null);
    };

    const PaginateLendings = (data, pageSize, currentPage) => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        // Menampilkan notifikasi sorting
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
            if (sortConfig.key === 'tgl_pinjam' || sortConfig.key === 'tgl_pengembalian') {
                // Sort untuk tanggal
                const dateA = new Date(a[sortConfig.key]);
                const dateB = new Date(b[sortConfig.key]);
                if (sortConfig.direction === 'asc') {
                    return dateA - dateB;
                }
                return dateB - dateA;
            } else {
                // Sort untuk ID (numeric)
                if (sortConfig.direction === 'asc') {
                    return a[sortConfig.key] - b[sortConfig.key];
                }
                return b[sortConfig.key] - a[sortConfig.key];
            }
        });
    };

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
    const paginatedData = PaginateLendings(sortedData, pageSize, currentPage);

    // Update totalPages setiap kali filteredData berubah
    useEffect(() => {
        setTotalPages(Math.ceil(filteredData.length / pageSize));
    }, [filteredData, pageSize]);

    const detailPeminjaman = dataPeminjaman.find((item) => item.id === selectedId);

    // Fungsi untuk mengambil data denda keterlambatan
    const fetchLateFees = async (member_id) => {
        try {
            const response = await axios.get(`${API_URL}denda`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });

            // Filter denda keterlambatan untuk member tertentu
            const memberLateFees = response.data?.data?.filter(denda =>
                denda.jenis_denda === 'terlambat' &&
                denda.id_member === member_id
            );

            return memberLateFees || [];
        } catch (error) {
            console.error('Error fetching late fees:', error);
            return [];
        }
    };    // Modal content

    const handleClearSearch = () => {
        setSearchQuery({
            id_buku: '',
            id_member: ''
        });
    };

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Book Lending</h1>
                <p className="mt-2 text-gray-600">Manage library book lending</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Form Section */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lending Form</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Book</label>
                                <select
                                    name="id_buku"
                                    value={form.id_buku}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a Book</option>
                                    {books.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.judul} - (Stock: {book.stok})
                                        </option>
                                    ))}
                                </select>
                            </div>                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member</label>
                                <select
                                    name="id_member"
                                    value={form.id_member}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a Member</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Borrow Date</label>
                                <input
                                    type="date"
                                    name="tgl_pinjam"
                                    value={form.tgl_pinjam}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Return Date</label>
                                <input
                                    type="date"
                                    name="tgl_pengembalian"
                                    value={form.tgl_pengembalian}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handlePeminjaman}
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors justify-center"
                            >
                                Borrow Book
                            </button>
                        </form>
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
                                Ensure Book ID and Member ID are valid
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Return date must be at least 3 days from borrow date
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Late returns will incur a fine
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className='flex justify-between'>
                        <h2 className="text-lg font-semibold text-gray-800">Lending List</h2>
                        <div>
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search by Book ID</label>
                            <input
                                type="number"
                                name="id_buku"
                                value={searchQuery.id_buku}
                                onChange={handleSearch}
                                placeholder="Enter Book ID"
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search by Member ID</label>
                            <input
                                type="number"
                                name="id_member"
                                value={searchQuery.id_member}
                                onChange={handleSearch}
                                placeholder="Enter Member ID"
                                className="mt-1 block w-full p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('id_buku')}
                                >
                                    <div className="flex items-center">
                                        Book
                                        <SortIcon column="id_buku" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('id_member')}
                                >
                                    <div className="flex items-center">
                                        Member
                                        <SortIcon column="id_member" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('tgl_pinjam')}
                                >
                                    <div className="flex items-center">
                                        Borrow Date
                                        <SortIcon column="tgl_pinjam" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('tgl_pengembalian')}
                                >
                                    <div className="flex items-center">
                                        Return Date
                                        <SortIcon column="tgl_pengembalian" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => {
                                    const isLate = !item.status_pengembalian && moment().isAfter(moment(item.tgl_pengembalian));
                                    const isReturned = item.status_pengembalian;
                                    let statusClass = 'text-green-600';
                                    let statusText = 'Active';

                                    if (isReturned) {
                                        statusClass = 'text-gray-600';
                                        statusText = 'Returned';
                                    } else if (isLate) {
                                        statusClass = 'text-red-600';
                                        statusText = 'Late';
                                    }

                                    return (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {books.find(book => book.id === item.id_buku)?.judul || 'Undefined'} - ID : {item.id_buku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {members.find(member => member.id === item.id_member)?.nama || 'Undefined'} - ID : {item.id_member}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moment(item.tgl_pinjam).format('DD/MM/YYYY')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moment(item.tgl_pengembalian).format('DD/MM/YYYY')}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${statusClass}`}>{statusText}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handlePengembalian(item)}
                                                    disabled={item.status_pengembalian}
                                                    className={`inline-flex items-center px-3 py-1.5 text-sm ${item.status_pengembalian
                                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        } rounded-lg transition-colors`}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                                                    </svg>
                                                    Return
                                                </button>
                                                <button
                                                    onClick={() => handleShowDetail(item.id)}
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
                                    );
                                })
                            )}
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

                                    // Menampilkan notifikasi perubahan page size
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
                                                className={`px-3 py-1 text-sm rounded-lg ${currentPage === pageNumber
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
            {showModal && detailPeminjaman && (
                <Modal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    title="Detail Peminjaman"
                >
                    <div className="y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Id Member</p>
                                <p className="font-medium">{detailPeminjaman.id_member}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Id Buku</p>
                                <p className="font-medium">{detailPeminjaman.id_buku}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Tanggal Peminjaman</p>
                                <p className="font-medium">{detailPeminjaman.tgl_pinjam}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Tanggal Pengembalian</p>
                                <p className="font-medium">{detailPeminjaman.tgl_pengembalian}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{detailPeminjaman.status_pengembalian ? 'Dikembalikan' : 'Belum dikembalikan'}</p>
                            </div>
                            {lateFeesData.map((denda, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="text-sm text-gray-500">Denda</p>
                                        <p className="font-medium">{formatRupiah(denda.jumlah_denda)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Deskripsi</p>
                                        <p className="font-medium">{denda.deskripsi}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Lendings;