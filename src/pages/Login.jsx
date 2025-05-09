import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constant'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            axios.post(`${API_URL}login`, {
                email,
                password
            })
                .then((res) => {
                    // Periksa struktur respons dan akses token dengan benar
                    console.log('Response:', res.data);

                    // Asumsikan struktur respons adalah { access_token, user } langsung di res.data
                    // atau sesuaikan dengan struktur respons API yang sebenarnya
                    const token = res.data.access_token || res.data.token;
                    const userData = res.data.user || res.data.data;

                    if (token) {
                        localStorage.setItem('access_token', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                        navigate('/dashboard');
                        console.log('Login berhasil');
                    } else {
                        setError('Format respons tidak valid. Hubungi administrator.');
                    }
                })
                .catch((e) => {
                    console.error('Error:', e)
                    setError('Login gagal. Silakan periksa email dan password Anda.')
                })
        } catch (e) {
            setError(e.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 animate-fade-in-down">Login</h2>
                    <p className="text-center text-gray-600 mb-8 animate-fade-in-up">Masuk ke akun perpustakaan Anda</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-shake" role="alert">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
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

                        <div className="mb-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
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

                        <div className="flex items-center justify-between mb-6 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Ingat saya</label>
                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200">Lupa password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle animate-slide-in-up"
                            style={{ animationDelay: '0.4s' }}
                        >
                            Masuk
                        </button>
                    </form>

                    <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <p className="text-sm text-gray-600">
                            Belum punya akun? <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200">Daftar sekarang</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}