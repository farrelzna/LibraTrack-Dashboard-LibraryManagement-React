import { useState, useEffect } from 'react';
import axios from 'axios';

const Restorations = () => {
    const [form, setForm] = useState({
        id_member: '',
        id_buku: '',
        jumlah_denda: '',
        jenis_denda: '',
        deskripsi: ''
    });

    const [dendaData, setDendaData] = useState([]);
    const [detailDenda, setDetailDenda] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const apiUrl = 'http://45.64.100.26:88/perpus-api/public/api/denda';
    const getToken = localStorage.getItem('token');

    const fetchDenda = async () => {
        try {
            const res = await axios.get(apiUrl, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDendaData(res.data.data || []);
        } catch (error) {
            console.error('Gagal ambil data denda:', error);
            setErrorMessage('Gagal mengambil data denda');
        }
    };

    const handleShowDetail = (id_member) => {
        const detail = dendaData.find((denda) => denda.id_member === id_member);
        if (detail) {
            setDetailDenda(detail);
            setShowModal(true);
        } else {
            setErrorMessage('Data tidak ditemukan');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateDenda = async () => {
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
            setSuccessMessage('Data denda berhasil ditambahkan');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Gagal menambahkan denda:', error);
            setErrorMessage('Gagal menambahkan data denda');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    useEffect(() => {
        fetchDenda();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setDetailDenda(null);
    };

    return (
        <div className="container mt-4">
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Form>
                <h3>Form Tambah Denda</h3>
                <Form.Group className="mb-3">
                    <Form.Label>ID Member</Form.Label>
                    <Form.Control
                        type="text"
                        name="id_member"
                        value={form.id_member}
                        onChange={handleChange}
                        placeholder="Masukkan ID Member"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>ID Buku</Form.Label>
                    <Form.Control
                        type="text"
                        name="id_buku"
                        value={form.id_buku}
                        onChange={handleChange}
                        placeholder="Masukkan ID Buku"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Jumlah Denda</Form.Label>
                    <Form.Control
                        type="number"
                        name="jumlah_denda"
                        value={form.jumlah_denda}
                        onChange={handleChange}
                        placeholder="Masukkan Jumlah Denda"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Jenis Denda</Form.Label>
                    <Form.Control
                        type="text"
                        name="jenis_denda"
                        value={form.jenis_denda}
                        onChange={handleChange}
                        placeholder="Masukkan Jenis Denda"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Deskripsi</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="deskripsi"
                        value={form.deskripsi}
                        onChange={handleChange}
                        placeholder="Masukkan Deskripsi"
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleCreateDenda}>
                    Tambah Denda
                </Button>
            </Form>

            <h3 className="mt-4">Daftar Data Denda</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID Member</th>
                        <th>ID Buku</th>
                        <th>Jumlah Denda</th>
                        <th>Jenis Denda</th>
                        <th>Deskripsi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dendaData.map((denda, index) => (
                        <tr key={`${denda.id_member}-${index}`}>
                            <td>{denda.id_member}</td>
                            <td>{denda.id_buku}</td>
                            <td>{denda.jumlah_denda}</td>
                            <td>{denda.jenis_denda}</td>
                            <td>{denda.deskripsi}</td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => handleShowDetail(denda.id_member)}
                                >
                                    Lihat Detail
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal Detail Denda */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detail Denda</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailDenda ? (
                        <div>
                            <p><strong>ID Member:</strong> {detailDenda.id_member}</p>
                            <p><strong>ID Buku:</strong> {detailDenda.id_buku}</p>
                            <p><strong>Jumlah Denda:</strong> {detailDenda.jumlah_denda}</p>
                            <p><strong>Jenis Denda:</strong> {detailDenda.jenis_denda}</p>
                            <p><strong>Deskripsi:</strong> {detailDenda.deskripsi}</p>
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Restorations;