import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
              <p className="text-gray-600">Help documentation coming soon...</p>
            </div>
          } />
          <Route path="/templates" element={
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">Templates</h1>
              <p className="text-gray-600">Document templates coming soon...</p>
            </div>
          } />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default App;