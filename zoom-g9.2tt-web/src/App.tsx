import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { PatchProvider } from './contexts/PatchContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { SyncProvider } from './contexts/SyncContext';
import { ToastContainer } from './components/common/Toast';
import { Splash } from './pages/Splash';
import { Editor } from './pages/Editor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DeviceProvider>
          <PatchProvider>
            <SyncProvider>
              <HistoryProvider>
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/editor" element={<Editor />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
              </HistoryProvider>
            </SyncProvider>
          </PatchProvider>
        </DeviceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
