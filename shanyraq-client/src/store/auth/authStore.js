import { create } from 'zustand';
import { toast } from 'react-toastify';

const useAuthStore = create((set) => ({
  role: localStorage.getItem('userRole') || 'Арендатор',
  access: localStorage.getItem('access') || undefined,
  isAuth: localStorage.getItem('access') ? true : false,
  setRole: (role) => {
    try {
      localStorage.setItem('userRole', role);
      set({ role });
    }
    catch {
      toast.error('Произошла ошибка');
    }
  },
  setAccess: (access) => {
    try {

      localStorage.setItem('access', access);
      set({ access });
    }
    catch {
      toast.error('Произошла ошибка');
    }
  }
}));

export default useAuthStore;
