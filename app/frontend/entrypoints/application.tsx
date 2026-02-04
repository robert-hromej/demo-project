import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@/styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Viktor Demo Project
            </h1>
            <p className="mt-4 text-gray-600">
              React 19 + TypeScript + Vite + Rails 8
            </p>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
