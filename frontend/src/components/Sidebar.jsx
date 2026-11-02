
import {
  NavLink,
} from 'react-router-dom';

import {
  LayoutDashboard,
  FileText,
  Microscope,
  ClipboardCheck,
  Settings,
  FlaskConical,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Claims',
    path: '/claims',
    icon: FileText,
  },
  {
    label: 'Clinical Evidence',
    path: '/clinical-evidence',
    icon: Microscope,
  },
  {
    label: 'Assessments',
    path: '/assessments',
    icon: ClipboardCheck,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <FlaskConical size={27} />
        <span>Claims Intelligence</span>
      </div>

      <p className="menu-heading">WORKSPACE</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
