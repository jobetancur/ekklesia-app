import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Credenciales incorrectas o cuenta sin acceso. Contacta al administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
        
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Ekklesia Logo" 
            className="h-24 w-auto object-contain" 
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a Ekklesia
        </h1>
        <p className="text-gray-500 mb-8">
          Gestión inteligente para tu ministerio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-900">
            <p className="font-semibold">Acceso restringido</p>
            <p className="mt-1">
              Solo el equipo de Ekklesia genera usuarios desde el panel administrador.
              Si ya tienes credenciales válidas, ingresa tu correo y contraseña.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus:border-brand-orange focus:ring focus:ring-brand-orange/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus:border-brand-orange focus:ring focus:ring-brand-orange/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-light text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-70"
          >
            {loading ? 'Validando...' : 'Iniciar sesión'}
          </button>

          <button
            type="button"
            className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Documentación
          </button>
        </form>

        <div className="mt-8 text-xs text-gray-400">
          © 2025 Ekklesia App. V 0.1.0
        </div>
      </div>
    </div>
  );
}
