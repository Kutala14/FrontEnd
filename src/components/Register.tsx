import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, MapPin, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBack: () => void;
  onRegister: (user: { email: string; name: string; type: 'user' | 'restaurant' }) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onBack, onRegister, onSwitchToLogin }: RegisterProps) {
  const [userType, setUserType] = useState<'user' | 'restaurant'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    cuisine: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (userType === 'restaurant' && (!formData.phone || !formData.location || !formData.cuisine)) {
      setError('Restaurantes devem preencher todos os campos');
      return;
    }

    // Buscar usuários existentes
    const usersData = localStorage.getItem('tukula_users');
    const users = usersData ? JSON.parse(usersData) : [];

    // Verificar se email já existe
    if (users.some((u: any) => u.email === formData.email)) {
      setError('Este email já está registado');
      return;
    }

    // Criar novo usuário
    const apiUrl = (import.meta.env.API_URL as string) || 'http://localhost:5000';
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: userType,
          restaurantId: userType === 'restaurant' ? `rest_${Date.now()}` : null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Erro ao criar conta');
        return;
      }
      setError('Conta criada com sucesso! Redirecionando...');
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

        <h1 className="text-3xl font-bold text-center mb-2">Criar Conta</h1>
        <p className="text-center text-gray-600 mb-8">Junte-se à comunidade Tukula</p>

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

        {success ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Conta criada com sucesso!</h3>
            <p className="text-sm text-green-700">A redirecionar...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'restaurant' ? 'Nome do Restaurante' : 'Nome Completo'} *
              </label>
              <div className="relative">
                {userType === 'restaurant' ? (
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                ) : (
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                )}
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={userType === 'restaurant' ? 'Restaurante Sabor Angolano' : 'João Silva'}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Restaurant-specific fields */}
            {userType === 'restaurant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+244 923 456 789"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Luanda, Talatona"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cozinha *
                  </label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="Angolana">Angolana</option>
                    <option value="Portuguesa">Portuguesa</option>
                    <option value="Brasileira">Brasileira</option>
                    <option value="Italiana">Italiana</option>
                    <option value="Internacional">Internacional</option>
                    <option value="Frutos do Mar">Frutos do Mar</option>
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
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
              Criar Conta
            </button>
          </form>
        )}

        {/* Login Link */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-red-600 font-semibold hover:underline"
              >
                Entrar
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
