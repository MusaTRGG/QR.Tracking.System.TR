import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login logic
    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = { email: foundUser.email, name: foundUser.name, role: foundUser.role || 'Mühendis' };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'E-posta veya şifre hatalı.' };
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Bu e-posta adresi zaten kayıtlı.' };
    }
    
    const newUser = { name, email, password, role: 'Kullanıcı' };
    users.push(newUser);
    localStorage.setItem('auth_users', JSON.stringify(users));
    
    const userData = { email, name, role: 'Kullanıcı' };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    return { success: true };
  };

  const loginWithGoogle = (credentialResponse) => {
    try {
      if (credentialResponse && credentialResponse.credential) {
        // Decode JWT payload
        const payloadBase64 = credentialResponse.credential.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        
        const userData = { 
          email: decodedPayload.email || 'google.user@example.com', 
          name: decodedPayload.name || 'Google Kullanıcısı', 
          role: 'Yönetici' 
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      }
    } catch (error) {
      console.error("JWT Decode Hatası:", error);
    }
    
    // Fallback if no credential provided
    const userData = { email: 'google.user@example.com', name: 'Google Kullanıcısı', role: 'Yönetici' };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
