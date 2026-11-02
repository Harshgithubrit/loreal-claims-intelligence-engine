
import { useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';

import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

function Settings() {
  const [settings, setSettings] = useState({
    applicationName: 'Claims Intelligence',
    aiProvider: 'OpenAI',
    model: 'gpt-4.1-mini',
    notifications: true,
  });

  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setSaved(false);
  }

  function handleSave(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <h1>Settings</h1>
              <p>
                Manage your Claims Intelligence application preferences.
              </p>
            </div>
          </div>

          <form className="settings-card" onSubmit={handleSave}>
            <div className="settings-section-heading">
              <SettingsIcon size={22} />
              <h2>General Settings</h2>
            </div>

            <div className="settings-field">
              <label htmlFor="applicationName">
                Application Name
              </label>

              <input
                id="applicationName"
                name="applicationName"
                value={settings.applicationName}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="aiProvider">AI Provider</label>

              <select
                id="aiProvider"
                name="aiProvider"
                value={settings.aiProvider}
                onChange={handleChange}
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Mock">Mock</option>
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="model">AI Model</label>

              <input
                id="model"
                name="model"
                value={settings.model}
                onChange={handleChange}
              />
            </div>

            <div className="settings-checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />
                Enable notifications
              </label>
            </div>

            <button
              type="submit"
              className="create-claim-button"
            >
              <Save size={18} />
              Save Settings
            </button>

            {saved && (
              <p className="success-message">
                Settings updated in this session.
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

export default Settings;
