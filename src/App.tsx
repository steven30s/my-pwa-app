import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Transaction from "@/pages/Transaction";
import Report from "@/pages/Report";
import TransactionRecords from "@/pages/TransactionRecords";
import { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import InstallPrompt from "@/components/InstallPrompt";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 检查是否已安装
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        // 延迟显示提示，避免干扰用户体验
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // 检查是否已安装
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallPrompt(false);
      }
    };
    
    window.addEventListener('appinstalled', () => {
      toast.success('应用已成功安装到主屏幕');
      setShowInstallPrompt(false);
    });

    checkInstalled();
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          toast.success('应用已添加到主屏幕');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transaction" element={<Transaction />} />
        <Route path="/records" element={<TransactionRecords />} />
        <Route path="/report" element={<Report />} />
      </Routes>
      {showInstallPrompt && (
        <InstallPrompt 
          onInstall={handleInstallClick} 
          onDismiss={() => {
            setShowInstallPrompt(false);
            // 用户拒绝后，24小时内不再显示
            localStorage.setItem('installPromptDismissed', Date.now().toString());
          }} 
        />
      )}
    </AuthContext.Provider>
  );
}
