import { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { data: session, isPending, error } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const user = session?.user || null;
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);

  useEffect(() => {
    if (!isPending) {
        setLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
     // Check for reset token
     const params = new URLSearchParams(window.location.search);
     if (params.get('token') && window.location.pathname === '/update-password') {
         setPasswordRecoveryMode(true);
     }
  }, []);

  const value = {
    signUp: async (data) => {
        return authClient.signUp.email({
            email: data.email,
            password: data.password,
            name: data.options?.data?.name || data.email.split('@')[0], 
        });
    },
    signIn: async (data) => {
        return authClient.signIn.email({
            email: data.email,
            password: data.password
        });
    },
    signOut: () => authClient.signOut(),
    resetPassword: async (email) => {
        return authClient.forgetPassword({
            email,
            redirectTo: "/update-password" 
        });
    },
    updateUserPassword: async (newPassword) => {
       const params = new URLSearchParams(window.location.search);
       const token = params.get('token');
       
       if (token) {
           const res = await authClient.resetPassword({
               newPassword,
               token
           });
           if (!res.error) {
               setPasswordRecoveryMode(false);
           }
           return res;
       }
       return { error: { message: "Missing reset token" } };
    },
    changePassword: async (currentPassword, newPassword) => {
       return authClient.changePassword({
           currentPassword,
           newPassword,
           revokeOtherSessions: true
       });
    },
    user,
    passwordRecoveryMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
