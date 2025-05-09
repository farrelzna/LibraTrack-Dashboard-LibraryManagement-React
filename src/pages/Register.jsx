import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constant'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [c_password, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validasi password
        if (password !== c_password) {
            setError('Password dan konfirmasi password tidak cocok')
            setLoading(false)
            return
        }

        try {
            const response = await axios.post(`${API_URL}register`, {
                name,
                email,
                password,
                c_password
            })

            console.log('Registrasi berhasil:', response.data)
            // Redirect ke halaman login setelah registrasi berhasil
            navigate('/')
        } catch (e) {
            console.error('Error:', e)
            setError(e.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 animate-fade-in-down">Daftar</h2>
                    <p className="text-center text-gray-600 mb-8 animate-fade-in-up">Buat akun perpustakaan baru</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-shake" role="alert">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Nama</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Nama lengkap"
                                required
                            />
                        </div>

                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                            <label htmlFor="c_password" className="block text-gray-700 text-sm font-semibold mb-2">Konfirmasi Password</label>
                            <input
                                type="password"
                                id="c_password"
                                value={c_password}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle animate-slide-in-up disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ animationDelay: '0.5s' }}
                        >
                            {loading ? 'Mendaftar...' : 'Daftar'}
                        </button>
                    </form>

                    <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <p className="text-sm text-gray-600">
                            Sudah punya akun? <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200">Masuk sekarang</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}