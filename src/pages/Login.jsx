import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constant'
import Swal from 'sweetalert2'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validasi input
        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation',
                text: 'Email and Password are required!',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Email Format',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        // Loading state
        const loadingSwal = Swal.fire({
            title: 'Logging in...',
            text: 'Please wait...',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post(`${API_URL}login`, {
                email,
                password
            });

            const token = response.data.access_token || response.data.token;
            const userData = response.data.user || response.data.data;

            if (token) {
                localStorage.setItem('access_token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                loadingSwal.close();

                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Welcome back!',
                    timer: 1500,
                    showConfirmButton: false
                });

                navigate('/dashboard');
            } else {
                throw new Error('Format respons tidak valid');
            }
        }
        catch (error) {
            loadingSwal.close();
            let errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            let title = 'Login Failed';

            // Check error type to display specific messages
            if (error.response?.status === 401) {
                title = 'Incorrect Password';
                errorMessage = 'The password you entered is incorrect. Please try again.';
            } else if (error.response?.status === 404) {
                title = 'Email Not Found';
                errorMessage = 'The email you entered is not registered.';
            }

            await Swal.fire({
                icon: 'error',
                title: title,
                text: errorMessage,
                confirmButtonColor: '#3B82F6',
                showConfirmButton: true,
                confirmButtonText: 'Try Again',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (error.response?.status === 401) {
                setPassword(''); // Reset password field jika password salah
            }

            setError(errorMessage);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative hidden md:block h-full min-h-[600px]">
                        <img
                            src="/src/assets/image.png"
                            alt="Library"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-black/50 backdrop-blur-[2px]"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white text-3xl font-bold">Library System</h3>
                            <p className="text-white/80 mt-2 text-lg">Modern Library Management System</p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 bg-white">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 animate-fade-in-down">Login</h2>
                        <p className="text-center text-gray-600 mb-8 animate-fade-in-up">Sign in to your library account</p>

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
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
                                </div>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200">Forgot password?</a>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle animate-slide-in-up"
                                style={{ animationDelay: '0.4s' }}>
                                Sign In
                            </button>
                        </form>

                        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                            <p className="text-sm text-gray-600">
                                Don't have an account yet? <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-200">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}