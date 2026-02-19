import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BandApp from "./pages/BandApp";
import NotFound from "./pages/NotFound";

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
            element={isBandSubdomain() ? <BandApp /> : <Index />}
          />
          <Route path="/band" element={<BandApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
