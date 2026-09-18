import { useAppDispatch, useAppState } from '../state/store';
import { useAuth } from '../state/auth';
import { ViewName } from '../types';
import { IconBox, IconCart, IconChart, IconDash, IconInvoice, IconSettings, IconTruck } from './icons';

interface NavItemDef {
  view: ViewName;
  label: string;
  icon: JSX.Element;
}

const TRADE_ITEMS: NavItemDef[] = [
  { view: 'inventory', label: 'Inventory', icon: <IconBox /> },
  { view: 'b2b', label: 'B2B Wholesale Invoice', icon: <IconInvoice /> },
  { view: 'pos', label: 'B2C Retail POS', icon: <IconCart /> },
];

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();

  const go = (view: ViewName) => {
    dispatch({ type: 'SET_VIEW', view });
    onNavigate();
  };

  const NavButton = ({ view, label, icon }: NavItemDef) => (
    <button className={`nav-item ${state.view === view ? 'active' : ''}`} onClick={() => go(view)}>
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="mark">
          Vyapaar<span>•</span>
        </div>
        <div className="sub">Wholesale + Retail Billing Suite</div>
      </div>
      <nav className="nav">
        <div className="nav-group-label">Overview</div>
        <NavButton view="dashboard" label="Dashboard" icon={<IconDash />} />
        <div className="nav-group-label">Trade</div>
        {TRADE_ITEMS.map((item) => (
          <NavButton key={item.view} {...item} />
        ))}
        <div className="nav-group-label">Supply Chain</div>
        <NavButton view="suppliers" label="Suppliers & Purchases" icon={<IconTruck />} />
        <div className="nav-group-label">Compliance</div>
        <NavButton view="reports" label="GST & Reports" icon={<IconChart />} />
        <div className="nav-group-label">System</div>
        <NavButton view="settings" label="Settings" icon={<IconSettings />} />
      </nav>
      {user ? (
        <div className="user-chip">
          <div>
            <div className="name">{user.name}</div>
            <div className="role">{user.role}</div>
          </div>
          <button onClick={logout}>Log out</button>
        </div>
      ) : null}
      <div className="sidebar-foot">
        Demo data only · No backend
        <br />
        All figures are illustrative.
      </div>
    </aside>
  );
}
