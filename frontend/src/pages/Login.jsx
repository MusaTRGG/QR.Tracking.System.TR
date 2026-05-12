import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else {
      const res = register(name, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Google Credential:", credentialResponse);
    // Genellikle backend'e credential gönderilir, biz mock login çağırıyoruz
    const res = loginWithGoogle(credentialResponse);
    if (res.success) {
      navigate('/');
    }
  };

  const handleGoogleError = () => {
    setError('Google ile giriş başarısız oldu.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low font-body-md px-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden">
        <div className="bg-primary p-xl text-center">
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-primary mb-sm">NESNE TAKİP</h1>
          <p className="font-body-md text-on-primary/80">Laboratuvar Envanter Yönetimi</p>
        </div>
        <div className="p-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg text-center">
            {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </h2>

          {error && (
            <div className="mb-md p-sm bg-error-container text-error rounded-lg font-body-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            {!isLogin && (
              <div>
                <label className="block font-label-md text-on-surface-variant mb-xs">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="Ahmet Yılmaz"
                />
              </div>
            )}
            <div>
              <label className="block font-label-md text-on-surface-variant mb-xs">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="ahmet@example.com"
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-xs">Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md hover:opacity-90 transition-opacity mt-sm"
            >
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-lg relative flex items-center justify-center border-t border-outline-variant">
            <span className="absolute bg-surface-container-lowest px-sm text-on-surface-variant font-label-sm top-[-10px]">VEYA</span>
          </div>

          <div className="mt-lg flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              theme="filled_black"
              shape="rectangular"
              size="large"
            />
          </div>

          <p className="mt-lg text-center font-body-sm text-on-surface-variant">
            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
