import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const BandApp = lazy(() => import("./pages/BandApp"));

const queryClient = new QueryClient();

const isBandSubdomain = () =>
  typeof window !== "undefined" && window.location.hostname === "band.vasilangelov.com";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isBandSubdomain() ? (
                <Suspense fallback={null}>
                  <BandApp />
                </Suspense>
              ) : (
                <Index />
              )
            }
          />
          <Route
            path="/band"
            element={
              <Suspense fallback={null}>
                <BandApp />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
