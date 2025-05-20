import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../constant';

const MemberData = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [filteredData, setFilteredData] = useState([]);

    // Hitung nilai pagination
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Set filtered data ketika data member berubah
    useEffect(() => {
        setFilteredData(members);
    }, [members]);

    // Fungsi untuk menangani perubahan halaman
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const getToken = localStorage.getItem('token');
                if (!getToken) {
                    throw new Error('Token autentikasi tidak ditemukan');
                }

                // Ambil data member dan peminjaman
                const [membersRes, lendingRes] = await Promise.all([
                    axios.get(`${API_URL}member`),
                    axios.get(`${API_URL}peminjaman`)
                ]);

                const members = membersRes.data?.data || [];
                const lendings = lendingRes.data?.data || [];

                // Proses data member dengan statistik peminjaman
                const processedMembers = members.map(member => {
                    const memberLendings = lendings.filter(l => 
                        parseInt(l.id_member) === parseInt(member.id)
                    );

                    return {
                        ...member,
                        stats: {
                            totalPeminjaman: memberLendings.length,
                            peminjamanAktif: memberLendings.filter(l => !l.status_pengembalian).length,
                            terlambat: memberLendings.filter(l => 
                                !l.status_pengembalian && 
                                new Date(l.tgl_pengembalian) < new Date()
                            ).length
                        }
                    };
                });

                setMembers(processedMembers);
                setLoading(false);

            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal memuat data: ' + (error.response?.data?.message || error.message),
                    confirmButtonColor: '#3B82F6'
                });
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12">
                        <div className="relative z-10">
                            <h1 className="text-4xl font-semibold text-white mb-2">Data Member</h1>
                            <p className="text-blue-100 text-lg">Informasi lengkap semua member perpustakaan</p>
                            <div className="mt-4 flex items-center space-x-4">
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-sm">Total Member</span>
                                    <h3 className="text-2xl font-bold text-white">{members.length}</h3>
                                </div>
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-sm">Member Aktif</span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {members.filter(m => m.stats.peminjamanAktif > 0).length}
                                    </h3>
                                </div>
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-sm">Member Terlambat</span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {members.filter(m => m.stats.terlambat > 0).length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-blue-800/50"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        {members.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <p className="text-xl text-gray-500 font-medium">Tidak ada data member</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {currentItems.map((member) => (
                                    <div key={member.id}
                                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                        <div className={`relative px-6 py-4 ${
                                            member.stats.terlambat > 0
                                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                : member.stats.peminjamanAktif > 0
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                        }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">{member.nama}</h2>
                                                    <p className="text-white/90 mt-1">{member.no_telp}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    member.stats.terlambat > 0
                                                        ? 'bg-red-100 text-red-800'
                                                        : member.stats.peminjamanAktif > 0
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {member.stats.terlambat > 0
                                                        ? 'Terlambat'
                                                        : member.stats.peminjamanAktif > 0
                                                            ? 'Aktif'
                                                            : 'Tidak Ada Peminjaman'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-6">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-blue-600 font-medium">Total</p>
                                                        <p className="text-2xl font-bold text-blue-700">
                                                            {member.stats.totalPeminjaman}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                        <p className="text-sm text-emerald-600 font-medium">Aktif</p>
                                                        <p className="text-2xl font-bold text-emerald-700">
                                                            {member.stats.peminjamanAktif}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                                        <p className="text-sm text-red-600 font-medium">Terlambat</p>
                                                        <p className="text-2xl font-bold text-red-700">
                                                            {member.stats.terlambat}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center text-gray-500">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        ID: {member.id}
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        Lihat Detail →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {members.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Tampilkan</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value={9}>9</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="text-sm text-gray-700">data</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {members.length > 0 ? indexOfFirstItem + 1 : 0} 
                                            sampai {Math.min(indexOfLastItem, members.length)} 
                                            dari {members.length} data
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={`px-3 py-1 rounded-lg ${
                                                        currentPage === index + 1
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberData;