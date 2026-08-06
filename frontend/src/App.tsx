import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/context/auth-context';
import { router } from '@/routes/router';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
