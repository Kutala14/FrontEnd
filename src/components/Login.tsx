import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onLogin: (user: { email: string; name: string; type: 'user' | 'restaurant' }) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onBack, onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'restaurant'>('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Por favor, preencha todos os campos');
    return;
  }

  const apiUrl = (import.meta.env.API_URL as string) || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${apiUrl}/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        type: userType
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Credenciais envalidas');
      return;
    }

    // Salvar token e sessão
    localStorage.setItem('tukula_token', data.token);

    localStorage.setItem(
      'tukula_session',
      JSON.stringify({
        email: data.user.email,
        name: data.user.name,
        type: data.user.type,
        restaurantId: data.user.restaurantId
      })
    );

    onLogin(data.user);

    } catch (error) {
      setError('Erro de conexão com o servidor');
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
            onClick={() => setUserType('restaurant')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              userType === 'restaurant'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Restaurante
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
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Entrar
          </button>
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

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-900 mb-2">Contas de demonstração:</p>
          <div className="space-y-1 text-xs text-blue-800">
            <p><strong>Utilizador:</strong> user@tukula.ao / senha123</p>
            <p><strong>Restaurante:</strong> restaurant@tukula.ao / senha123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
