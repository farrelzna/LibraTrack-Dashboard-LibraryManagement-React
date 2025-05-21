import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import axios from "axios";
import Swal from "sweetalert2";
import Alert from '../../components/Alert';
import Modal from "../../components/Modal";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { API_URL } from "../../constant";

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [formModal, setFormModal] = useState({
    no_ktp: "",
    nama: "",
    alamat: "",
    tgl_lahir: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    message: ''
  });

  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('table'); // 'table' or 'grid'
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    const getToken = localStorage.getItem("token");
    axios
      .get(`${API_URL}member`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then((res) => {
        // console.log("Response API:", res.data); // Debug
        setMembers(res.data); // Fix struktur
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data || {});
        }
      });
  };

  const handleSubmitModal = (e) => {
    e.preventDefault();
    const getToken = localStorage.getItem("token");
    const url = isEditMode
      ? `${API_URL}member/${currentMemberId}`
      : `${API_URL}member`;

    const method = isEditMode ? axios.put : axios.post;

    method(url, formModal, {
      headers: { Authorization: `Bearer ${getToken}` },
    })
      .then(() => {
        setIsModalOpen(false);
        setAlertConfig({
          type: 'success',
          message: isEditMode ? "Member Successfully Updated" : "Failed to Update Member"
        });
        setShowAlert(true);

        setFormModal({
          no_ktp: "",
          nama: "",
          alamat: "",
          tgl_lahir: "",
        });
        setIsEditMode(false);
        setCurrentMemberId(null);
        fetchMembers();
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setAlertConfig({
            type: 'error',
            message: "Sesi telah berakhir, silakan login kembali"
          });
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            navigate("/login");
          }, 2000);
        } else {
          setAlertConfig({
            type: 'error',
            message: err.response?.data?.message || "Terjadi kesalahan"
          });
          setShowAlert(true);
        }
      });
  };

  const handleEdit = (member) => {
    setFormModal({
      no_ktp: member.no_ktp,
      nama: member.nama,
      alamat: member.alamat,
      tgl_lahir: member.tgl_lahir,
    });
    setCurrentMemberId(member.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    const getToken = localStorage.getItem("token");
    axios
      .delete(`${API_URL}member/${deleteTargetId}`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then(() => {
        setAlertConfig({
          type: 'success',
          message: "Member Deleted Successfully"
        });
        setShowAlert(true);
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        fetchMembers();
      })
      .catch((err) => {
        setAlertConfig({
          type: 'error',
          message: err.response?.data?.message || "Failed to Delete Member"
        });
        setShowAlert(true);
      });
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormModal({ ...formModal, [e.target.name]: e.target.value });
  };

  const fetchMemberDetail = (id) => {
    const getToken = localStorage.getItem("token");
    axios
      .get(`${API_URL}member/${id}`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then((res) => {
        console.log("Detail member:", res.data);
        setSelectedMember(res.data); // Perhatikan perubahan di sini
        setIsDetailModalOpen(true);
      })
      .catch((err) => {
        setError(err.response?.data || { message: "Failed to Load Number Details" });
      });
  };

  const sortMembers = (members, sortConfig) => {
    if (!sortConfig.key) return members;

    return [...members].sort((a, b) => {
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

    // Menampilkan notifikasi sorting
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: `Sorted by ${key.replace('_', ' ')} ${direction}`
    });
  };

  const filteredMembers = React.useMemo(() => {
    return sortMembers(members, sortConfig).filter((member) =>
      member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.no_ktp.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm, sortConfig]);

  // Add these functions before the return statement
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} members?`)) {
      setIsLoading(true);
      try {
        await Promise.all(selectedRows.map(id =>
          axios.delete(`${API_URL}member/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
        ));
        setSuccessMessage(`Successfully deleted ${selectedRows.length} members`);
        setSelectedRows([]);
        fetchMembers();
      } catch (err) {
        setError({ message: "Failed to delete members" });
      }
      setIsLoading(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      setExportLoading(true);
      const exportData = filteredMembers.map(member => ({
        'ID Number': member.no_ktp || '',
        'Name': member.nama || '',
        'Address': member.alamat || '',
        'Birth Date': member.tgl_lahir || '',
        'Created At': member.created_at ? new Date(member.created_at).toLocaleDateString() : ''
      }));

      const fileName = `members-${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileName}.csv`);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Members");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }

      setSuccessMessage(`Successfully exported data as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      setError({ message: `Failed to export data: ${error.message}` });
    } finally {
      setExportLoading(false);
      setShowExportDropdown(false);
    }
  };

  const calculateStats = () => {
    const total = members.length;
    const newThisMonth = members.filter(m =>
      new Date(m.created_at).getMonth() === new Date().getMonth()
    ).length;
    return { total, newThisMonth };
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}member`,
        formModal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        setAlertConfig({
          type: 'success',
          message: 'New Member added successfully'
        });
        setShowAlert(true);
        setIsModalOpen(false);
        setFormModal({
          no_ktp: "",
          nama: "",
          alamat: "",
          tgl_lahir: "",
        });
        fetchMembers(); // Refresh daftar member
      }
    } catch (error) {
      setAlertConfig({
        type: 'error',
        message: error.response?.data?.message || 'Failed to Add Member'
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const GridView = ({ members, handleDetail, handleEdit, handleDelete, selectedRows, setSelectedRows }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xs overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
            <div className="relative">
              {/* Header stripe */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-blue-700" />

              <div className="p-6 relative">
                <div>
                  <h3 className="text-sm font-semibold text-white absolute top-5 right-4 leading-tight">{member.nama}</h3>
                </div>
                {/* Profile Icon */}
                <div className="relative z-10 flex flex-col mb-4">
                  <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-white">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {/* Checkbox positioned at top-right */}
                  <div className="absolute top-0 mt-14 right-0 mt-2 mr-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(prev => [...prev, member.id]);
                        } else {
                          setSelectedRows(prev => prev.filter(id => id !== member.id));
                        }
                      }}
                      className="rounded-2xl border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="my-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    ID: {member.no_ktp}
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">{member.alamat}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">{member.tgl_lahir}</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleDetail(member.id)}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center"
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
          </div>
        ))}
      </div>
    );
  };

  const TableView = ({ members, handleDetail, handleEdit, handleDelete, selectedRows, setSelectedRows, sortConfig, requestSort }) => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(members.map(member => member.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={selectedRows.length === members.length}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                onClick={() => requestSort('no_ktp')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              >
                <div className="flex items-center">
                  ID Number
                  <SortIcon direction={sortConfig.key === 'no_ktp' ? sortConfig.direction : null} />
                </div>
              </th>
              <th
                onClick={() => requestSort('nama')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              >
                <div className="flex items-center">
                  Name
                  <SortIcon direction={sortConfig.key === 'nama' ? sortConfig.direction : null} />
                </div>
              </th>
              <th
                onClick={() => requestSort('alamat')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              >
                <div className="flex items-center">
                  Address
                  <SortIcon direction={sortConfig.key === 'alamat' ? sortConfig.direction : null} />
                </div>
              </th>
              <th
                onClick={() => requestSort('tgl_lahir')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
              >
                <div className="flex items-center">
                  Birth Date
                  <SortIcon direction={sortConfig.key === 'tgl_lahir' ? sortConfig.direction : null} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(prev => [...prev, member.id]);
                      } else {
                        setSelectedRows(prev => prev.filter(id => id !== member.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                  {member.no_ktp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                  {member.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                  {member.alamat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                  {member.tgl_lahir}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDetail(member.id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
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

  const paginateBooks = (members, currentPage, pageSize) => {
    const indexOfLastMember = currentPage * pageSize;
    const indexOfFirstMember = indexOfLastMember - pageSize;
    return members.slice(indexOfFirstMember, indexOfLastMember);
  };

  const paginatedMembers = paginateBooks(filteredMembers, currentPage, pageSize);

  // Fungsi untuk menampilkan toast notification
  const showToast = (icon, title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({ icon, title });
  };

  // Update page size handler
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    showToast('info', `Showing ${newSize} entries per page`);
  };

  // View toggle handler
  const handleViewChange = (newView) => {
    setView(newView);
    showToast('info', `Switched to ${newView} view`);
  };

  // Search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      showToast('info', `Searching for "${e.target.value}"`);
    }
  };

  // Filter status handler
  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    showToast('info', `Filtered by ${e.target.value} status`);
  };

  // Date range handler
  const handleDateRangeChange = (type, value) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    if (value) {
      showToast('info', `Updated ${type} date filter`);
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-xs p-10">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Alert
            type={alertConfig.type}
            message={alertConfig.message}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
      {showAlert && (
        <div className="fixed bottom-0 right-2/3 transform z-50">
          <Alert
            type={alertConfig.type}
            message={alertConfig.message}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl text-gray-800 tracking-tight">Member's Management</h1>
        <p className="mt-2 text-xs text-gray-600">Manage your library member account</p>
      </div>

      <div className="mx-auto">
        {/* Header Section with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Members</p>
                <h3 className="text-xl font-bold text-gray-800">{calculateStats().total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+{calculateStats().newThisMonth} new this month</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[60px] max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={handleSearchChange}
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

            <div className="flex flex-wrap items-center text-xs gap-2">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterStatusChange(e)}
                className="px-3 py-2 bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="px-3 py-2 bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="px-3 py-2 text-xs bg-gray-50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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


              {selectedRows.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-xs text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                >
                  Delete Selected ({selectedRows.length})
                </button>
              )}
              {/* Add this after the view toggle buttons in the Action Bar */}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsEditMode(false);
                  setFormModal({
                    no_ktp: "",
                    nama: "",
                    alamat: "",
                    tgl_lahir: "",
                  });
                }}
                className="py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors flex items-center justify-center gap-2"
                style={{ width: '150px' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Member
              </button>
            </div>
          </div>
        </div>

        {/* Existing table code with new features */}
        {view === 'table' ? (
          <TableView
            members={paginatedMembers}
            handleDetail={fetchMemberDetail}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        ) : (
          <GridView
            members={paginatedMembers}
            handleDetail={fetchMemberDetail}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        )}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length} entries
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
                  {[...Array(Math.min(5, Math.ceil(filteredMembers.length / pageSize)))].map((_, index) => {
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
                  {Math.ceil(filteredMembers.length / pageSize) > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredMembers.length / pageSize)))}
                  disabled={currentPage >= Math.ceil(filteredMembers.length / pageSize)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(filteredMembers.length / pageSize))}
                  disabled={currentPage >= Math.ceil(filteredMembers.length / pageSize)}
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

        {/* Detail Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Member Details">
          {selectedMember ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Id Number</p>
                  <p className="font-medium">{selectedMember.no_ktp}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{selectedMember.nama}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium">{selectedMember.alamat}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Birth Date</p>
                  <p className="font-medium">{selectedMember.tgl_lahir}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Modal>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormModal({
              no_ktp: "",
              nama: "",
              alamat: "",
              tgl_lahir: "",
            });
          }}
          title={isEditMode ? "Edit Member" : "Add New Member"}
        >
          <form onSubmit={isEditMode ? handleSubmitModal : handleCreateMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">ID Number</label>
                <input
                  type="text"
                  name="no_ktp"
                  value={formModal.no_ktp}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 rounded-md bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="nama"
                  value={formModal.nama}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 rounded-md bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="alamat"
                  value={formModal.alamat}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 rounded-md bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Birth Date</label>
                <input
                  type="date"
                  name="tgl_lahir"
                  value={formModal.tgl_lahir}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 rounded-md bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormModal({
                    no_ktp: "",
                    nama: "",
                    alamat: "",
                    tgl_lahir: "",
                  });
                }}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isEditMode ? "Update Members" : "Create Members"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Confirmation">
          <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to delete this member?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}