import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';

const Lendings = () => {
    // ...existing code until table section...

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
            {/* Previous sections remain unchanged */}
            
            {/* Table Section with fixed whitespace */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead><tbody className="bg-white divide-y divide-gray-200">{
                            (filteredData.length > 0 ? filteredData : dataPeminjaman).map((item) => {
                                const isLate = !item.status_pengembalian && moment().isAfter(moment(item.tgl_pengembalian));
                                const isReturned = item.status_pengembalian;
                                let statusClass = 'text-green-600';
                                let statusText = 'Active';
                                
                                if (isReturned) {
                                    statusClass = 'text-blue-600';
                                    statusText = 'Returned';
                                } else if (isLate) {
                                    statusClass = 'text-red-600';
                                    statusText = 'Late';
                                }

                                return (<tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id_buku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id_member}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moment(item.tgl_pinjam).format('DD/MM/YYYY')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moment(item.tgl_pengembalian).format('DD/MM/YYYY')}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${statusClass}`}>{statusText}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handlePengembalian(item)} 
                                            disabled={item.status_pengembalian}
                                            className={`inline-flex items-center px-3 py-1.5 text-sm ${
                                                item.status_pengembalian 
                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            } rounded-lg transition-colors`}
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
                                            </svg>
                                            Return
                                        </button>
                                        <button onClick={() => handleShowDetail(item.id)}
                                            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Details
                                        </button>
                                    </td>
                                </tr>);
                            })
                        }</tbody>
                    </table>
                </div>
            </div>

            {/* Rest of the component remains unchanged */}
        </div>
    );
};

export default Lendings;
