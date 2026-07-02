import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="page-content animate-fade-in">
        {children}
      </main>
    </div>
  );
}
