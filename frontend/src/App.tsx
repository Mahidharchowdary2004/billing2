import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ModalRoot, ToastRoot } from './components/Modal';
import { useAppState } from './state/store';
import { useAuth } from './state/auth';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Inventory from './views/inventory/Inventory';
import B2BView from './views/b2b/B2BView';
import POSView from './views/pos/POSView';
import SuppliersView from './views/suppliers/SuppliersView';
import ReportsView from './views/reports/ReportsView';

export default function App() {
  const { view } = useAppState();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Login />;

  return (
    <div id="app">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <main className="main">
        <Topbar view={view} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <div className="content">
          {view === 'dashboard' && <Dashboard />}
          {view === 'inventory' && <Inventory />}
          {view === 'b2b' && <B2BView />}
          {view === 'pos' && <POSView />}
          {view === 'suppliers' && <SuppliersView />}
          {view === 'reports' && <ReportsView />}
        </div>
      </main>
      <ModalRoot />
      <ToastRoot />
    </div>
  );
}
