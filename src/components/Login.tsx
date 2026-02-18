import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useSession } from '../context/SessionProvider';
import { ApiError } from '../lib/auth-client';
import { UserRole } from '../types/session';
import { GoogleAuthButton } from './GoogleAuthButton';

interface LoginProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export function Login({ onBack, onSwitchToRegister, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password, type: userType });
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 0) {
          setError('Erro de conexão com o servidor');
          return;
        }
        const payload = err.payload as { message?: string; error?: string } | null;
        setError(payload?.error || payload?.message || err.message || 'Credenciais inválidas');
      } else {
        setError('Erro de conexão com o servidor');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      await loginWithGoogle({ credential, type: userType });
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        const payload = err.payload as { message?: string; error?: string } | null;
        setError(payload?.error || payload?.message || err.message || 'Falha no login com Google');
      } else {
        setError('Falha no login com Google');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 mb-6"
      >
        <ArrowLeft className="size-5" />
        <span>Voltar</span>
      </button>

      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">TK</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Bem-vindo de volta!</h1>
        <p className="text-center text-gray-600 mb-8">Entre na sua conta Tukula</p>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setUserType('user')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              userType === 'user'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Utilizador
          </button>
          <button
            type="button"
            onClick={() => setUserType('hotel')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              userType === 'hotel'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Hotel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-2 text-gray-500">ou</span>
            </div>
          </div>

          <GoogleAuthButton
            text="signin_with"
            onCredential={handleGoogleLogin}
            disabled={isSubmitting}
          />
        </form>

        {/* Forgot Password */}
        <div className="text-center mt-4">
          <button className="text-sm text-red-600 hover:underline">
            Esqueceu a senha?
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-red-600 font-semibold hover:underline"
            >
              Registar-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
