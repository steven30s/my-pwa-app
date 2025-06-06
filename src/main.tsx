import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" />
    </BrowserRouter>
  </StrictMode>
);

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // 检查更新
        registration.update();
        
        // 监听更新事件
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新版本可用，提示用户刷新
                console.log('New content available; please refresh.');
              }
            });
          }
        });
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
  
  // 监听控制器变化
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
