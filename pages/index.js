import { useState } from 'react';

export default function Home() {
  const [accountManager, setAccountManager] = useState('');
  const [outputName, setOutputName] = useState('');
  const [folderUrl, setFolderUrl] = useState('');

  return (
    <div className="container">
      <h1>Flourish Wizard</h1>
      
      <div className="form-group">
        <label>Welcome. Please select inputting user name below</label>
        <select 
          value={accountManager}
          onChange={(e) => setAccountManager(e.target.value)}
          className="form-control"
        >
          <option value="">-- Select --</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
        </select>
      </div>

      <div className="form-group">
        <label>Name your output file</label>
        <input
          type="text"
          value={outputName}
          onChange={(e) => setOutputName(e.target.value)}
          className="form-control"
          placeholder="e.g., Client_App_Date"
        />
      </div>

      <div className="form-group">
        <label>Output folder location</label>
        <input
          type="text"
          value={folderUrl}
          onChange={(e) => setFolderUrl(e.target.value)}
          className="form-control"
          placeholder="e.g., /path/to/folder"
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
} 