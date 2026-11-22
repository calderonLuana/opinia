import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './authContext';
import { traducirErrorAuth } from '../utils/erroresAuth';

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setSesion(data.session);
      setCargando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      setCargando(false);
    });

    return () => {
      activo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const registrarse = async (correo, contrasena) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: { emailRedirectTo: `${window.location.origin}/acceso` },
    });

    if (error) throw new Error(traducirErrorAuth(error));

    // Con la confirmación de correo activada, un correo ya registrado
    // devuelve un usuario sin identidades
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Ese correo ya está registrado. Iniciá sesión o recuperá tu contraseña.');
    }

    return { requiereConfirmacion: !data.session };
  };

  const iniciarSesion = async (correo, contrasena) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    if (error) throw new Error(traducirErrorAuth(error));
  };

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(traducirErrorAuth(error));
  };

  const recuperarContrasena = async (correo) => {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    if (error) throw new Error(traducirErrorAuth(error));
  };

  const actualizarContrasena = async (nuevaContrasena) => {
    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
    if (error) throw new Error(traducirErrorAuth(error));
  };

  return (
    <AuthContext.Provider
      value={{
        sesion,
        usuario: sesion?.user ?? null,
        cargando,
        registrarse,
        iniciarSesion,
        cerrarSesion,
        recuperarContrasena,
        actualizarContrasena,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}