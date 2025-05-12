import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';

const MemberHistory = () => {
    const [memberData, setMemberData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberHistory();
    }, []);

    const fetchMemberHistory = async () => {
        const getToken = localStorage.getItem('token');
        try {
            // Fetch lending data
            const lendingRes = await axios.get('http://45.64.100.26:88/perpus-api/public/api/peminjaman', {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });

            // Fetch fine data
            const fineRes = await axios.get('http://45.64.100.26:88/perpus-api/public/api/denda', {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });

            // Group data by member ID
            const groupedData = {};
            
            // Process lending data
            lendingRes.data.data.forEach(lending => {
                if (!groupedData[lending.id_member]) {
                    groupedData[lending.id_member] = {
                        lendings: [],
                        fines: [],
                        totalBooks: 0,
                        totalFines: 0
                    };
                }
                groupedData[lending.id_member].lendings.push(lending);
                groupedData[lending.id_member].totalBooks += 1;
            });

            // Process fine data
            fineRes.data.data.forEach(fine => {
                if (groupedData[fine.id_member]) {
                    groupedData[fine.id_member].fines.push(fine);
                    groupedData[fine.id_member].totalFines += parseFloat(fine.jumlah_denda);
                }
            });

            setMemberData(groupedData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch member history:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch member history',
                confirmButtonColor: '#3B82F6'
            });
            setLoading(false);
        }
    };

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
        <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Member History</h1>
                <p className="mt-2 text-gray-600">View lending and fine history for each member</p>
            </div>

            {/* Grid of Member Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(memberData).map(([memberId, data]) => (
                    <div key={memberId} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Member ID: {memberId}</h2>
                                    <p className="text-sm text-gray-500 mt-1">Total Books Borrowed: {data.totalBooks}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">Total Fines</p>
                                    <p className={`text-lg font-semibold ${data.totalFines > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Rp {data.totalFines.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Recent Lendings */}
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Lendings</h3>
                                <div className="space-y-2">
                                    {data.lendings.slice(0, 3).map((lending, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-600">Book ID: {lending.id_buku}</span>
                                                <span className={`font-medium ${moment().isAfter(moment(lending.tgl_pengembalian)) ? 'text-red-600' : 'text-green-600'}`}>
                                                    {moment().isAfter(moment(lending.tgl_pengembalian)) ? 'Late' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="text-gray-500">
                                                {moment(lending.tgl_pinjam).format('DD MMM YYYY')} - {moment(lending.tgl_pengembalian).format('DD MMM YYYY')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Fines */}
                            {data.fines.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Fines</h3>
                                    <div className="space-y-2">
                                        {data.fines.slice(0, 2).map((fine, index) => (
                                            <div key={index} className="bg-red-50 rounded-lg p-3 text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-600">Book ID: {fine.id_buku}</span>
                                                    <span className="font-medium text-red-600">
                                                        Rp {parseFloat(fine.jumlah_denda).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-gray-500">{fine.jenis_denda}</div>
                                                {fine.deskripsi && (
                                                    <div className="text-gray-500 text-xs mt-1">{fine.deskripsi}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemberHistory;