
import { Search, Bell, UserCircle } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div>
        <h2>Dashboard</h2>
        <p>Manage and evaluate cosmetic product claims</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search claims..." />
        </div>

        <Bell size={21} />
        <UserCircle size={27} />
      </div>
    </header>
  );
}

export default Header;
