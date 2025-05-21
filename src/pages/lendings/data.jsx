import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import Modal from '../../components/Modal';
import jsPDF from 'jspdf';
import { API_URL } from '../../constant';

const MemberHistory = () => {
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([])
    const [lendingData, setLendingData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLending, setSelectedLending] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [groupedLendings, setGroupedLendings] = useState([]);

    // Calculate pagination values
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / pageSize);

    // Set filtered data when lending data changes
    useEffect(() => {
        setFilteredMembers(groupedLendings);
    }, [groupedLendings]);

    // Function to handle page changes
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const getToken = localStorage.getItem('token');
                if (!getToken) throw new Error('No token found');

                // Fetch all needed data
                const [membersRes, booksRes, lendingRes, finesRes] = await Promise.all([
                    axios.get(`${API_URL}member`, {
                        headers: { Authorization: `Bearer ${getToken}` }
                    }),
                    axios.get(`${API_URL}buku`, {
                        headers: { Authorization: `Bearer ${getToken}` }
                    }),
                    axios.get(`${API_URL}peminjaman`, {
                        headers: { Authorization: `Bearer ${getToken}` }
                    }),
                    axios.get(`${API_URL}denda`, {
                        headers: { Authorization: `Bearer ${getToken}` }
                    }),
                ]);

                const members = membersRes.data || [];
                const books = Array.isArray(booksRes.data) ? booksRes.data : booksRes.data?.data || [];
                const lendings = lendingRes.data?.data || [];
                const fines = finesRes.data?.data || [];

                // Proses data berdasarkan member
                const groupedByMember = members.map(member => {
                    const memberLendings = lendings
                        .filter(l => l.id_member === member.id)
                        .map(l => {
                            const relatedBook = books.find(b => parseInt(b.id) === parseInt(l.id_buku));


                            const relatedFines = fines.filter(f =>
                                f.id_member === l.id_member && f.id_buku === l.id_buku
                            );
                            return {
                                ...l,
                                bookTitle: relatedBook?.judul || `Book #${l.id_buku}`,
                                bookID: relatedBook?.id || 'Unknown Book ID',
                                fines: relatedFines,
                                totalFines: relatedFines.reduce((sum, fine) => sum + parseFloat(fine.jumlah_denda || 0), 0),
                                status: l.status
                            };
                        });
                    // console.log('memberLendings:', memberLendings);

                    const memberFines = fines.filter(f => f.id_member === member.id);
                    const totalFines = memberFines.reduce((sum, fine) => sum + parseFloat(fine.jumlah_denda || 0), 0);

                    return {
                        memberID: member.id,
                        memberName: member.nama || 'Unknown Member',
                        memberNumberID: member.no_ktp || 'No ID Number',
                        lendings: memberLendings,
                        fines: memberFines,
                        totalFines,
                        // status: member.status
                    };
                });

                setGroupedLendings(groupedByMember); // Untuk tampilkan per member
                setLendingData(lendings); // Untuk referensi data asli jika dibutuhkan
                setBooks(books);
                setMembers(members);
            } catch (error) {
                console.error('Error loading data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load data: ' + (error.response?.data?.message || error.message),
                    confirmButtonColor: '#3B82F6'
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);


    const handleShowDetails = (memberGroup) => {
        if (!memberGroup) {
            console.warn('handleShowDetails dipanggil tanpa lending');
            return;
        }
        // console.log('memberGroup:', memberGroup);
        // Get all lendings for this member
        setSelectedLending({
            ...memberGroup,
            borrowHistory: memberGroup.lendings, // gunakan langsung dari hasil group
        });

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLending(null);
    };

    const handleExportByMember = () => {
        if (!selectedLending) return;

        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`Book Lending Report`, 105, 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Member Name   : ${selectedLending.memberName}`, 14, 25);
        doc.text(`Member ID No. : ${selectedLending.memberNumberID}`, 14, 32);
        doc.text(`Date          : ${currentDate}`, 14, 39);

        let y = 47;

        // Table Header
        doc.setFont("helvetica", "bold");
        doc.text("No", 14, y);
        doc.text("Book Title", 24, y);
        doc.text("Fine (Rp)", 145, y);
        doc.text("Status", 170, y);
        y += 6;
        doc.setDrawColor(0);
        doc.line(14, y, 196, y); // line under header
        y += 4;

        doc.setFont("helvetica", "normal");

        if (selectedLending.lendings.length === 0) {
            doc.text("No borrowings available.", 14, y);
            y += 8;
        } else {
            selectedLending.lendings.forEach((lend, index) => {
                const fineText = lend.totalFines > 0 ? `Rp${lend.totalFines.toFixed(0)}` : "-";

                let status = "-";
                if (lend.status === 'dikembalikan') status = "Returned";
                else if (lend.status === 'belum dikembalikan') status = "Borrowed";
                else if (lend.status === 'terlambat') status = "Overdue";

                // Wrap long titles
                const titleLines = doc.splitTextToSize(lend.bookTitle, 115);
                doc.text(`${index + 1}`, 14, y);
                doc.text(titleLines, 24, y);
                doc.text(fineText, 145, y);
                doc.text(status, 170, y);

                y += (titleLines.length * 6) + 2;

                // Add page if needed
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
        }

        console.log('selectedLending:', selectedLending.lendings); // Log selectedLending detai
        

        y += 5;
        doc.setDrawColor(150);
        doc.line(14, y, 196, y);
        y += 8;

        // Total fine
        doc.setFont("helvetica", "bold");
        doc.text(`Total Fine: Rp${selectedLending.totalFines.toFixed(0)}`, 14, y);

        doc.save(`report_${selectedLending.memberName.replace(/\s+/g, '_')}.pdf`);
    };

    // const uniqueBookTitles = selectedLending && selectedLending.borrowHistory
    //     ? [...new Set(selectedLending.borrowHistory.map(borrow => borrow.bookTitle))]
    //     : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
                    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12">
                        <div className="relative z-10">
                            <h1 className="text-2xl font-bold text-white mb-2">Lending History</h1>
                            <p className="text-blue-100 text-xs">Comprehensive view of all lending activities</p>
                            <div className="mt-4 flex items-center space-x-4">
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-xs">Total Records</span>
                                    <h3 className="text-xl font-bold text-white">{lendingData.length}</h3>
                                </div>
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-xs">Active Lendings</span>
                                    <h3 className="text-xl font-bold text-white">
                                        {lendingData.filter(l => !l.status_pengembalian).length}
                                    </h3>
                                </div>
                                <div className="bg-blue-900/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <span className="text-blue-100 text-xs">Late Returns</span>
                                    <h3 className="text-xl font-bold text-white">
                                        {lendingData.filter(l => !l.status_pengembalian && moment().isAfter(moment(l.tgl_pengembalian))).length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-blue-800/50"></div>
                        <div className="absolute right-0 bottom-0 transform translate-y-1/3">
                            <svg className="w-64 h-64 text-blue-800/20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        {lendingData.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <p className="text-xl text-gray-500 font-medium">No lending records available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {groupedLendings.map((memberGroup, index) => {
                                    const memberLendings = memberGroup.lendings;
                                    // const memberLendings = lendingData.filter(l => l.id_member === lending.id_member);
                                    const memberStats = {
                                        totalFines: memberGroup.fines.length,
                                        returned: memberLendings.filter(l => l.status_pengembalian).length,
                                        active: memberLendings.filter(l => !l.status_pengembalian).length,
                                    };

                                    return (
                                        <div key={index}
                                            className="group bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 ease-in overflow-hidden">
                                            {/* Card Header - Keep existing header */}
                                            <div className={`relative px-6 py-4 ${memberGroup.lendings[0]?.status_pengembalian
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                                : moment().isAfter(moment(memberGroup.lendings[0]?.tgl_pengembalian))
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                }`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                                            {memberGroup.memberName}
                                                        </h2>
                                                        <p className="text-white/90 text-xs mt-1 font-medium">
                                                            Latest Book : {memberGroup.lendings[0]?.bookTitle || '-'}
                                                        </p>
                                                    </div>
                                                    <h3 className="text-xs font-semibold text-white">{memberGroup.lendings[0]?.bookID}</h3>
                                                </div>
                                                <div className="absolute bottom-0 right-0 transform translate-y-1/2">
                                                    <svg className="w-24 h-24 text-white/10" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Card Content - Updated to show member statistics */}
                                            <div className="p-6">
                                                <div className="mb-6">
                                                    {/* Member Statistics */}
                                                    <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                                                        <div className="text-center p-3 bg-red-50 rounded-lg">
                                                            <p className="text-xs text-red-600 font-medium text-xs">Fines Applied</p>
                                                            <p className="text-xl mt-1 font-bold text-red-700">{memberStats.totalFines}</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                            <p className="text-xs text-emerald-600 font-medium text-xs">Returned</p>
                                                            <p className="text-xl mt-1 font-bold text-emerald-700">{memberStats.returned}</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                            <p className="text-xs text-blue-600 font-medium text-xs">Active</p>
                                                            <p className="text-xl mt-1 font-bold text-blue-700">{memberStats.active}</p>
                                                        </div>
                                                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                            <p className="text-xs text-yellow-600 font-medium text-xs">Books Borrowed</p>
                                                            <p className="text-xl mt-1 font-bold text-yellow-700">{memberGroup.lendings.length}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center text-gray-500">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Member ID: {memberGroup.lendings[0]?.id_member}
                                                        </div>
                                                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => handleShowDetails(memberGroup)}>
                                                            View Details →
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {currentMembers.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    {/* Entries per page selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-700">Show</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                const newSize = Number(e.target.value);
                                                setPageSize(newSize);
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value={9}>9</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="text-xs text-gray-700">entries</span>
                                    </div>

                                    {/* Pagination info and controls */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-gray-700">
                                            Showing {currentMembers.length > 0 ? indexOfFirstItem + 1 : 0}
                                            to {Math.min(indexOfLastItem, currentMembers.length)}
                                            of {currentMembers.length} entries
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* First Page */}
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Previous */}
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNum = index + 1;
                                                    // Show first page, last page, current page, and pages around current page
                                                    if (
                                                        pageNum === 1 ||
                                                        pageNum === totalPages ||
                                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => handlePageChange(pageNum)}
                                                                className={`px-3 py-1 text-xs rounded-lg ${currentPage === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    }
                                                    // Show dots for skipped pages
                                                    if (
                                                        pageNum === currentPage - 2 ||
                                                        pageNum === currentPage + 2
                                                    ) {
                                                        return <span key={pageNum}>...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            {/* Next */}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L11.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Last Page */}
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
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
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title="Lending Details"
            >
                {selectedLending && (
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex">
                            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${selectedLending.status_pengembalian
                                ? 'bg-emerald-100 text-emerald-800'
                                : moment().isAfter(moment(selectedLending.tgl_pengembalian))
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {selectedLending.status_pengembalian
                                    ? 'Returned'
                                    : moment().isAfter(moment(selectedLending.tgl_pengembalian))
                                        ? 'Late'
                                        : 'Active'
                                }
                            </span>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-xs text-gray-500">Member Name</p>
                                <p className="font-medium text-gray-900">{selectedLending.memberName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Member ID</p>
                                <p className="font-medium text-gray-900">{selectedLending.memberNumberID}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Member ID</p>
                                <p className="font-medium text-gray-900">#{selectedLending.memberID}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Export To</p>
                                <a href="" onClick={handleExportByMember} className='text-red-400 hover:text-red-700 underline'>PDF</a>
                            </div>
                        </div>

                        {/* Dates Section */}
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-xs text-gray-500">Lending Date</p>
                                <p className="font-medium text-gray-900">
                                    {moment(selectedLending.tgl_pinjam).format('DD MMMM YYYY')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Return Date</p>
                                <p className="font-medium text-gray-900">
                                    {moment(selectedLending.tgl_pengembalian).format('DD MMMM YYYY')}
                                </p>
                            </div>
                            {!selectedLending.status_pengembalian && moment().isAfter(moment(selectedLending.tgl_pengembalian)) && (
                                <div className="col-span-2">
                                    <p className="text-xs text-red-600">
                                        Overdue by {moment().diff(moment(selectedLending.tgl_pengembalian), 'days')} days
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Member's Borrowing History */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Member's Borrowing History</h3>
                            <div className="border border-gray-100 rounded-lg">
                                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div className="divide-y divide-gray-100">
                                        {selectedLending.borrowHistory.map((borrow, index) => (
                                            <div key={index} className="p-3 hover:bg-gray-50">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{borrow.bookTitle}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {moment(borrow.tgl_pinjam).format('DD MMM YYYY')} - {moment(borrow.tgl_pengembalian).format('DD MMM YYYY')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs text-center font-medium rounded-full ${borrow.status_pengembalian
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : moment().isAfter(moment(borrow.tgl_pengembalian))
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`} style={{ width:'70px' }}>
                                                        {borrow.status_pengembalian
                                                            ? 'Returned'
                                                            : moment().isAfter(moment(borrow.tgl_pengembalian))
                                                                ? 'Late'
                                                                : 'Active'
                                                        }
                                                    </span>
                                                </div>
                                                {borrow.fines.length > 0 && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        Fines: ${borrow.totalFines.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                    <span className="font-medium text-gray-700">Total Lending History</span>
                                    <span className="font-semibold text-blue-600">
                                        {selectedLending.borrowHistory.length} Books
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Fines History */}
                        {selectedLending.fines.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Fines History</h3>
                                <div className="border border-gray-50 bg-gray-50 rounded-lg">
                                    <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        <div className="space-y-2 p-3">
                                            {selectedLending.fines.map((fine, index) => (
                                                <div key={index} className="bg-red-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-red-700 font-medium">
                                                            ${parseFloat(fine.jumlah_denda).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-red-600">
                                                            {moment(fine.created_at).format('DD MMM YYYY')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                        <span className="font-semibold">Total Fines</span>
                                        <span className="text-red-600 font-semibold">
                                            Rp.{selectedLending.totalFines.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MemberHistory;
