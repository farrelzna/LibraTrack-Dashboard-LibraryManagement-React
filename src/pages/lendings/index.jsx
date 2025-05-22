import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import Chart from 'react-apexcharts';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
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
        // const getToken = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}peminjaman`);
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
        // const getToken = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}buku`);
            // console.log('Full API Response:', response); // Debug full response
            // console.log('Response data:', response.data); // Debug data structure

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
        // const getToken = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}member`);
            // console.log('Members response:', response.data); // Debug log
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
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };
    //     if (!searchQuery.trim()) {
    //         setFilteredData(dataPeminjaman);
    //         return;
    //     }

    //     const searchTerm = searchQuery.toLowerCase().trim();

    //     const filtered = dataPeminjaman.filter(item => {
    //         const book = books.find(b => b.id === item.id_buku);
    //         const member = members.find(m => m.id === item.id_member);

    //         // Mencari berdasarkan ID Buku
    //         const bookIdMatch = String(item.id_buku).toLowerCase().includes(searchTerm);

    //         // Mencari berdasarkan Judul Buku
    //         const titleMatch = book && book.judul.toLowerCase().includes(searchTerm);

    //         // Mencari berdasarkan ID Member
    //         const memberIdMatch = String(item.id_member).toLowerCase().includes(searchTerm);

    //         // Mencari berdasarkan Nama Member
    //         const nameMatch = member && member.nama.toLowerCase().includes(searchTerm);

    //         // Mencari berdasarkan Tanggal
    //         const dateMatch =
    //             item.tgl_pinjam.toLowerCase().includes(searchTerm) ||
    //             item.tgl_pengembalian.toLowerCase().includes(searchTerm);

    //         return bookIdMatch || titleMatch || memberIdMatch || nameMatch || dateMatch;
    //     });

    //     setFilteredData(filtered);
    // }, [searchQuery, dataPeminjaman, books, members]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function to handle book lending
    const handlePeminjaman = async () => {
        // const getToken = localStorage.getItem('token');

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
            await axios.post(`${API_URL}peminjaman`, form)
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
                        formData
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

                    await axios.post(`${API_URL}denda`, dendaData)

                    Swal.fire({
                        icon: 'warning',
                        title: 'Book Returned Late',
                        text: 'Late return penalty has been added',
                        html: `
                            <p>Book: ${item.judul}</p>
                            <p>Days Late: ${selisihHari} days</p>
                            <p>Penalty Fee: ${formatRupiah(jumlahDenda)}</p>
                        `,
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
            const response = await axios.get(`${API_URL}denda`);

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
    };

    const handleExportData = (type) => {
        // Prepare the data for export
        const exportData = dataPeminjaman.map(item => {
            const book = books.find(b => b.id === item.id_buku);
            const member = members.find(m => m.id === item.id_member);

            // Calculate if the book is returned late
            const today = new Date();
            const returnDate = new Date(item.tgl_pengembalian);
            const isLate = today > returnDate;

            // Determine the lending status
            let status = 'Ongoing';
            if (item.tgl_kembali) {
                status = isLate ? 'Returned Late' : 'Returned On Time';
            } else if (isLate) {
                status = 'Late';
            }

            return {
                'Lending ID': item.id,
                'Book ID': item.id_buku,
                'Book Title': book ? book.judul : 'N/A', vcmv,
                'Member ID': item.id_member,
                'Member Name': member ? member.nama : 'N/A',
                'Borrow Date': item.tgl_pinjam,
                'Return Date': item.tgl_pengembalian,
                'Status': status
            };
        });

        if (type === 'csv') {
            // Export as CSV
            const headers = Object.keys(exportData[0]).join(',');
            const csvData = exportData.map(row => Object.values(row).join(',')).join('\n');
            const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lendings_export_${moment().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else if (type === 'excel') {
            // Export as Excel
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Lendings');
            XLSX.writeFile(wb, `lendings_export_${moment().format('YYYY-MM-DD')}.xlsx`);
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
        if (!dataPeminjaman.length || !books.length || !members.length) return;

        const today = new Date();

        const filtered = dataPeminjaman.filter(item => {
            const returnDate = new Date(item.tgl_pengembalian);
            const isReturnDateValid = !isNaN(returnDate.getTime());

            const belumDikembalikan = item.tgl_kembali === null;
            const sudahDikembalikan = item.tgl_kembali !== null;
            const terlambat = isReturnDateValid && today > returnDate;

            switch (filterStatus) {
                case 'active':
                    return belumDikembalikan && (!terlambat);
                case 'late':
                    return belumDikembalikan && terlambat;
                case 'returned':
                    return sudahDikembalikan;
                case 'all':
                default:
                    return true;
            }
        });

        const finalFiltered = searchQuery.trim()
            ? filtered.filter(item => {
                const searchTerm = searchQuery.toLowerCase();
                const book = books.find(b => b.id === item.id_buku);
                const member = members.find(m => m.id === item.id_member);

                return (
                    String(item.id_buku).toLowerCase().includes(searchTerm) ||
                    (book && book.judul.toLowerCase().includes(searchTerm)) ||
                    String(item.id_member).toLowerCase().includes(searchTerm) ||
                    (member && member.nama.toLowerCase().includes(searchTerm)) ||
                    item.tgl_pinjam.toLowerCase().includes(searchTerm) ||
                    item.tgl_pengembalian.toLowerCase().includes(searchTerm)
                );
            })
            : filtered;

        setFilteredData(finalFiltered);
        setCurrentPage(1);
    }, [searchQuery, dataPeminjaman, books, members, filterStatus]);

    const [chartData, setChartData] = useState({
        series: [{
            name: 'Books Borrowed',
            data: []
        }],
        categories: []
    });

    useEffect(() => {
        if (!lendingData || lendingData.length === 0) return;

        // Process data to get monthly borrowing counts
        const processMonthlyData = () => {
            // Get the last 12 months
            const last12Months = [];
            const monthlyData = [];

            // Generate last 12 months in format 'MMM YYYY'
            for (let i = 11; i >= 0; i--) {
                const monthDate = moment().subtract(i, 'months');
                const monthKey = monthDate.format('MMM YYYY');
                last12Months.push(monthKey);
                monthlyData[monthKey] = 0;
            }

            // Count borrowings for each month
            lendingData.forEach(lending => {
                const borrowDate = moment(lending.tgl_pinjam);
                // Only consider data from the last 12 months
                if (borrowDate.isAfter(moment().subtract(12, 'months'))) {
                    const monthKey = borrowDate.format('MMM YYYY');
                    if (monthlyData[monthKey] !== undefined) {
                        monthlyData[monthKey]++;
                    }
                }
            });

            // Convert to arrays for ApexCharts
            const seriesData = last12Months.map(month => monthlyData[month] || 0);

            setChartData({
                series: [{
                    name: 'Books Borrowed',
                    data: seriesData
                }],
                categories: last12Months
            });
        };

        processMonthlyData();
    }, [lendingData]);

    const chartOptions = {
        chart: {
            type: 'area',
            height: 350,
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: chartData.categories,
            labels: {
                style: {
                    fontSize: '10px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Number of Books'
            },
            min: 0,
            forceNiceScale: true,
            labels: {
                formatter: (val) => Math.round(val)
            }
        },
        colors: ['#4f46e5'],
        tooltip: {
            y: {
                formatter: (val) => `${val} books`
            }
        },
        title: {
            text: 'Monthly Book Borrowings',
            align: 'left',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        subtitle: {
            text: 'Last 12 months',
            align: 'left',
            style: {
                fontSize: '12px',
                color: '#9ca3af'
            }
        },
        grid: {
            borderColor: '#f3f4f6',
            row: {
                colors: ['#ffffff', '#f9fafb']
            }
        },
        markers: {
            size: 5,
            hover: {
                size: 7
            }
        }
    };

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-xs p-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl text-gray-800">Book's Lending</h1>
                <p className="mt-2 text-xs text-gray-600">Manage library book lending</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Form Section */}
                <div className="bg-white rounded-xl shadow">
                    <div className="p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Lending Form</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Book</label>
                                <select
                                    name="id_buku"
                                    value={form.id_buku}
                                    onChange={handleChange}
                                    className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a Book</option>
                                    {books.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.judul} - (Stock: {book.stok})
                                        </option>
                                    ))}
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
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Borrow Date</label>
                                <input
                                    type="date"
                                    name="tgl_pinjam"
                                    value={form.tgl_pinjam}
                                    onChange={handleChange}
                                    className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700">Return Date</label>
                                <input
                                    type="date"
                                    name="tgl_pengembalian"
                                    value={form.tgl_pengembalian}
                                    onChange={handleChange}
                                    className="mt-1 block w-full text-xs p-2 rounded-md bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handlePeminjaman}
                                className="w-full px-4 py-2 text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors justify-center"
                            >
                                Borrow Books
                            </button>
                        </form>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow">
                    <div className="p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Guidelines</h2>
                        <ul className="space-y-3">
                            <li className="flex text-xs items-center text-gray-700">
                                <svg className="w-3.5 h-3.5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ensure Book ID and Member ID are valid
                            </li>
                            <li className="flex text-xs items-center text-gray-700">
                                <svg className="w-3.5 h-3.5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Return date must be at least 3 days from borrow date
                            </li>
                            <li className="flex text-xs items-center text-gray-700">
                                <svg className="w-3.5 h-3.5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Late returns will incur a fine
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
                                    <p className="text-xs text-white">Total Records</p>
                                    <p className="text-xl font-bold text-white">
                                        {filteredData.length}
                                    </p>
                                </div>
                                <div className='text-end'>
                                    <p className="text-xs text-white">Active Loans</p>
                                    <p className="text-xl font-bold text-white">
                                        {dataPeminjaman.filter(item => !item.status_pengembalian).length}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className='mb-2'>
                                    <p className="text-xs text-blue-600 hover:text-blue-400 duration-300">Overdue</p>
                                    <p className="text-xl font-bold text-blue-700 hover:text-blue-500 duration-300">
                                        {dataPeminjaman.filter(item =>
                                            !item.status_pengembalian &&
                                            moment().isAfter(moment(item.tgl_pengembalian))
                                        ).length}
                                    </p>
                                </div>
                                <div className='text-end'>
                                    <p className="text-xs text-blue-600 hover:text-blue-400 duration-300">Returned</p>
                                    <p className="text-xl font-bold text-blue-700 hover:text-blue-500 duration-300">
                                        {dataPeminjaman.filter(item =>
                                            !item.status_pengembalian &&
                                            moment().isAfter(moment(item.tgl_pengembalian))
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow mb-8">
                <div className="p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Monthly Borrowing Statistics</h2>
                    <div className="h-80">
                        <Chart
                            options={chartOptions}
                            series={chartData.series}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800">Lending List</h2>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="Search by Book ID, Book Title, Member ID, Member Name, or Date..."
                                    className="w-90 p-2 pl-10 text-xs rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
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
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'active'
                                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-400'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterStatus('late')}
                                className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'late'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-500'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Late
                            </button>
                            <button
                                onClick={() => setFilterStatus('returned')}
                                className={`px-4 py-2 w-full text-xs rounded-full transition-colors duration-300 ${filterStatus === 'returned'
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-500'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Returned
                            </button>
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
                                    <td colSpan="7" className="px-6 py-4 text-center text-xs text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => {
                                    const isLate = !item.status_pengembalian && moment().isAfter(moment(item.tgl_pengembalian));
                                    const isReturned = item.status_pengembalian;
                                    let statusClass = 'text-green-400';
                                    let statusText = 'Active';

                                    if (isReturned) {
                                        statusClass = 'text-gray-400';
                                        statusText = 'Returned';
                                    } else if (isLate) {
                                        statusClass = 'text-red-400';
                                        statusText = 'Late';
                                    }

                                    return (
                                        <tr key={item.id} className='hover:bg-gray-50'>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                {books.find(book => book.id === item.id_buku)?.judul || 'Undefined'} - ID : {item.id_buku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                                {members.find(member => member.id === item.id_member)?.nama || 'Undefined'} - ID : {item.id_member}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">{moment(item.tgl_pinjam).format('DD/MM/YYYY')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">{moment(item.tgl_pengembalian).format('DD/MM/YYYY')}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-xs font-medium ${statusClass}`}>{statusText}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium space-x-2">
                                                <button
                                                    onClick={() => handlePengembalian(item)}
                                                    disabled={item.status_pengembalian}
                                                    className={`inline-flex items-center px-3 py-1.5 text-xs ${item.status_pengembalian
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
                                    );
                                })
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
            {showModal && detailPeminjaman && (
                <Modal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    title="Borrowing Details"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-xs text-gray-500">Member ID</p>
                                <p className="font-medium">{detailPeminjaman.id_member}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Book ID</p>
                                <p className="font-medium">{detailPeminjaman.id_buku}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Borrowing Date</p>
                                <p className="font-medium">{detailPeminjaman.tgl_pinjam}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Return Date</p>
                                <p className="font-medium">{detailPeminjaman.tgl_pengembalian}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="font-medium">
                                    {detailPeminjaman.status_pengembalian
                                        ? 'Returned'
                                        : moment().isAfter(moment(detailPeminjaman.tgl_pengembalian))
                                            ? 'Late'
                                            : 'Active'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Fines History</h3>
                            <div className="border border-gray-50 bg-gray-50 rounded-lg">
                                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div className="space-y-2 p-3">
                                        {lateFeesData.map((denda, index) => (
                                            <div key={index} className="bg-red-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-red-700 font-medium">
                                                        {formatRupiah(denda.jumlah_denda)}
                                                    </span>
                                                    <span className="text-red-700 font-medium max-w-[200px] truncate block">
                                                        {denda.deskripsi}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Lendings;
