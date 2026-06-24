"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          borderRadius: "10px",
          fontSize: "14px",
          padding: "12px 16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
