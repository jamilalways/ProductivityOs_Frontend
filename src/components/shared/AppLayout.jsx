import Sidebar from './Sidebar';
import Header  from './Header';

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-area">
        <Header />
        {children}
      </div>
    </div>
  );
}
