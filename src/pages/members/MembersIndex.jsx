import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal"; // Make sure you have this component
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const API_URL = "http://45.64.100.26:88/perpus-api/public/api";

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [formModal, setFormModal] = useState({
    no_ktp: "",
    nama: "",
    alamat: "",
    tgl_lahir: "",
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

  // Add these new states after existing states
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
      .get(`${API_URL}/member`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then((res) => {
        console.log("Response API:", res.data); // Debug
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
      ? `${API_URL}/member/${currentMemberId}`
      : `${API_URL}/member`;

    const method = isEditMode ? axios.put : axios.post;

    method(url, formModal, {
      headers: { Authorization: `Bearer ${getToken}` },
    })
      .then(() => {
        setIsModalOpen(false);
        setSuccessMessage(
          isEditMode ? "Successfully updated data" : "Successfully added data"
        );
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
          navigate("/login");
        } else {
          setError(err.response?.data || { message: "Something went wrong" });
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
      .delete(`${API_URL}/member/${deleteTargetId}`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then(() => {
        setSuccessMessage("Successfully deleted member data");
        setIsDeleteModalOpen(false);
        setDeleteTargetId(null);
        fetchMembers();
      })
      .catch((err) => {
        setError(err.response?.data || { message: "Failed to delete data" });
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
      .get(`${API_URL}/member/${id}`, {
        headers: { Authorization: `Bearer ${getToken}` },
      })
      .then((res) => {
        console.log("Detail member:", res.data);
        setSelectedMember(res.data); // Perhatikan perubahan di sini
        setIsDetailModalOpen(true);
      })
      .catch((err) => {
        setError(err.response?.data || { message: "Gagal memuat detail member" });
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

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
          axios.delete(`${API_URL}/member/${id}`, {
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

  // Add this with your other functions
  const handleCreateMember = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}/member`,
        formModal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        setSuccessMessage("Member added successfully");
        setIsModalOpen(false);
        setFormModal({
          no_ktp: "",
          nama: "",
          alamat: "",
          tgl_lahir: "",
        });
        fetchMembers(); // Refresh the members list
      }
    } catch (error) {
      setError({
        message: error.response?.data?.message || "Failed to create member"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-sm p-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Member's Management</h1>
        <p className="mt-2 text-gray-600">Manage your library member account</p>
      </div>

      <div className="mx-auto">
        {/* Header Section with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <h3 className="text-2xl font-bold text-gray-800">{calculateStats().total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+{calculateStats().newThisMonth} new this month</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('table')}
                className={`p-2 rounded-lg ${view === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
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
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExportData('excel');
                      setShowExportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>

              {selectedRows.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Member
              </button>
            </div>
          </div>
        </div>

        {/* Existing table code with new features */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredMembers.map(member => member.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    checked={selectedRows.length === filteredMembers.length}
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('no_ktp')}
                >
                  ID Number {sortConfig.key === 'no_ktp' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('nama')}
                >
                  Name {sortConfig.key === 'nama' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('alamat')}
                >
                  Address {sortConfig.key === 'alamat' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('tgl_lahir')}
                >
                  Birth Date {sortConfig.key === 'tgl_lahir' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
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
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.no_ktp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.alamat}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.tgl_lahir}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => fetchMemberDetail(member.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-gray-50 rounded-lg"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {Math.ceil(filteredMembers.length / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(filteredMembers.length / pageSize)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Detail Modal */}
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Member Details">
          {selectedMember ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Id Number</p>
                  <p className="font-medium">{selectedMember.no_ktp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedMember.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedMember.alamat}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-medium">{selectedMember.tgl_lahir}</p>
                </div>
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
                <label className="block text-sm font-medium text-gray-700">ID Number</label>
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
                <label className="block text-sm font-medium text-gray-700">Name</label>
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
                <label className="block text-sm font-medium text-gray-700">Address</label>
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
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isEditMode ? "Update Member" : "Create Member"}
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
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