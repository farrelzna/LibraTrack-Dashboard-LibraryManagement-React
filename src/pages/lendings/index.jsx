import { useEffect, useState } from 'react';
import axios from 'axios';
// import moment from 'moment';

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
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const apiUrl = 'http://45.64.100.26:88/perpus-api/public/api';

    const fetchPeminjaman = async () => {
        const getToken = localStorage.getItem('token');
        try {
            const res = await axios.get(`${apiUrl}/peminjaman`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDataPeminjaman(res.data.data || []);
        } catch (error) {
            console.error('Gagal ambil data peminjaman:', error);
            setErrorMessage('Gagal mengambil data peminjaman');
        }
    };

    useEffect(() => {
        fetchPeminjaman();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePeminjaman = async () => {
        const getToken = localStorage.getItem('token');
        try {
            await axios.post(`${apiUrl}/peminjaman`, form, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setForm({ id_buku: '', id_member: '', tgl_pinjam: '', tgl_pengembalian: '' });
            fetchPeminjaman();
            setSuccessMessage('Peminjaman berhasil ditambahkan');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Gagal menambahkan peminjaman:', error);
            setErrorMessage('Gagal menambahkan peminjaman');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handlePengembalian = async (item) => {
        const getToken = localStorage.getItem('token');
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');

            await axios.post(`${apiUrl}/peminjaman/pengembalian/${item.id}`, formData, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });

            setSuccessMessage('Pengembalian berhasil.');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPeminjaman();
        } catch (error) {
            console.error('Gagal melakukan pengembalian:', error);
            setErrorMessage('Gagal melakukan pengembalian');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleShowDetail = (id) => {
        setSelectedId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedId(null);
    };

    const detailPeminjaman = dataPeminjaman.find((item) => item.id === selectedId);

    return (
        <Container fluid className="py-4 mt-5">
            <Row className="justify-content-center">
                <Col xl={10}>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">Peminjaman Buku</h3>
                        </Card.Header>
                        <Card.Body>
                            {successMessage && <Alert variant="success">{successMessage}</Alert>}
                            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                            <Row>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header className="bg-light">
                                            <h5 className="mb-0">Form Peminjaman</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>ID Buku</Form.Label>
                                                    <Form.Control
                                                        name="id_buku"
                                                        value={form.id_buku}
                                                        onChange={handleChange}
                                                        placeholder="Masukkan ID Buku"
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>ID Member</Form.Label>
                                                    <Form.Control
                                                        name="id_member"
                                                        value={form.id_member}
                                                        onChange={handleChange}
                                                        placeholder="Masukkan ID Member"
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tanggal Pinjam</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="tgl_pinjam"
                                                        value={form.tgl_pinjam}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tanggal Pengembalian</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="tgl_pengembalian"
                                                        value={form.tgl_pengembalian}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                                <Button
                                                    variant="primary"
                                                    onClick={handlePeminjaman}
                                                    className="w-100"
                                                >
                                                    Pinjam Buku
                                                </Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="mb-4">
                                        <Card.Header className="bg-light">
                                            <h5 className="mb-0">Petunjuk</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <ul className="list-unstyled">
                                                <li className="mb-2">
                                                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                                    Pastikan ID Buku dan ID Member valid
                                                </li>
                                                <li className="mb-2">
                                                    <i className="bi bi-calendar-check-fill text-primary me-2"></i>
                                                    Tanggal pengembalian minimal 3 hari dari tanggal pinjam
                                                </li>
                                                <li className="mb-2">
                                                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                                                    Pengembalian terlambat akan dikenakan denda
                                                </li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Card>
                                <Card.Header className="bg-light">
                                    <h5 className="mb-0">Daftar Peminjaman</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="table-responsive">
                                        <Table striped bordered hover className="mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>ID Buku</th>
                                                    <th>ID Member</th>
                                                    <th>Tanggal Pinjam</th>
                                                    <th>Tanggal Kembali</th>
                                                    <th>Status</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataPeminjaman.map((item) => {
                                                    const isLate = moment().isAfter(moment(item.tgl_pengembalian));
                                                    const statusClass = isLate ? 'text-danger' : 'text-success';
                                                    const statusText = isLate ? 'Terlambat' : 'Aktif';

                                                    return (
                                                        <tr key={item.id}>
                                                            <td>{item.id}</td>
                                                            <td>{item.id_buku}</td>
                                                            <td>{item.id_member}</td>
                                                            <td>{moment(item.tgl_pinjam).format('DD/MM/YYYY')}</td>
                                                            <td>{moment(item.tgl_pengembalian).format('DD/MM/YYYY')}</td>
                                                            <td className={statusClass}>{statusText}</td>
                                                            <td className="text-center">
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => handlePengembalian(item)}
                                                                >
                                                                    <i className="bi bi-arrow-return-left"></i> Kembalikan
                                                                </Button>
                                                                <Button
                                                                    variant="info"
                                                                    size="sm"
                                                                    onClick={() => handleShowDetail(item.id)}
                                                                >
                                                                    <i className="bi bi-eye-fill"></i> Detail
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal Detail Peminjaman */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Detail Peminjaman</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailPeminjaman ? (
                        <Row>
                            <Col md={6}>
                                <h5 className="mb-3">Informasi Peminjaman</h5>
                                <p><strong>ID Peminjaman:</strong> {detailPeminjaman.id}</p>
                                <p><strong>ID Member:</strong> {detailPeminjaman.id_member}</p>
                                <p><strong>ID Buku:</strong> {detailPeminjaman.id_buku}</p>
                            </Col>
                            <Col md={6}>
                                <h5 className="mb-3">Jadwal</h5>
                                <p><strong>Tanggal Pinjam:</strong> {moment(detailPeminjaman.tgl_pinjam).format('DD MMMM YYYY')}</p>
                                <p><strong>Tanggal Pengembalian:</strong> {moment(detailPeminjaman.tgl_pengembalian).format('DD MMMM YYYY')}</p>
                                <p><strong>Status:</strong>{' '}
                                    <span className={moment().isAfter(moment(detailPeminjaman.tgl_pengembalian)) ? 'text-danger' : 'text-success'}>
                                        {moment().isAfter(moment(detailPeminjaman.tgl_pengembalian)) ? 'Terlambat' : 'Aktif'}
                                    </span>
                                </p>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted">Data tidak ditemukan</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Tutup</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Lendings;