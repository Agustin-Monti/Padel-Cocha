// app/admin/layout.tsx
import './admin.css';

export const metadata = {
  title: 'Admin - Necesito Esto',
  description: 'Panel de administración para gestionar la página',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="admin-main-container">
      {children}
    </main>
  );
}
