import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceProvider } from './contexts/DeviceContext';
import { PatchProvider } from './contexts/PatchContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { ToastContainer } from './components/common/Toast';
import { Splash } from './pages/Splash';
import { Editor } from './pages/Editor';

function App() {
  return (
    <BrowserRouter>
      <DeviceProvider>
        <PatchProvider>
          <HistoryProvider>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer />
          </HistoryProvider>
        </PatchProvider>
      </DeviceProvider>
    </BrowserRouter>
  );
}

export default App;
