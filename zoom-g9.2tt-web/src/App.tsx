import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { PatchProvider } from './contexts/PatchContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { SyncProvider } from './contexts/SyncContext';
import { SessionProvider } from './contexts/SessionContext';
import { ToastContainer } from './components/common/Toast';
import { LoadingScreen } from './components/common/LoadingScreen';
import { Splash } from './pages/Splash';
import { Editor } from './pages/Editor';
import { JoinSession } from './pages/JoinSession';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DeviceProvider>
          <PatchProvider>
            <SessionProvider>
              <SyncProvider>
                <HistoryProvider>
                  {/* Loading Screen overlay */}
                  {isLoading && (
                    <LoadingScreen
                      onLoadComplete={() => setIsLoading(false)}
                      minDisplayTime={2000}
                    />
                  )}

                  {/* Main App - always rendered */}
                  <Routes>
                    <Route path="/" element={<Splash />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/join/:sessionCode" element={<JoinSession />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <ToastContainer />
                </HistoryProvider>
              </SyncProvider>
            </SessionProvider>
          </PatchProvider>
        </DeviceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
