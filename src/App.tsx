import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { isAuthenticated } from "@/lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Variants from "./pages/Variants";
import EbomManager from "./pages/EbomManager";
import MbomManager from "./pages/MbomManager";
import ServiceBom from "./pages/ServiceBom";
import SoftwareBom from "./pages/SoftwareBom";
import Changes from "./pages/Changes";
import BomCompare from "./pages/BomCompare";
import PartMaster from "./pages/PartMaster";
import SupplierIntel from "./pages/SupplierIntel";
import FieldQuality from "./pages/FieldQuality";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/"             element={<Dashboard />} />
              <Route path="/variants"     element={<Variants />} />
              <Route path="/ebom"         element={<EbomManager />} />
              <Route path="/mbom"         element={<MbomManager />} />
              <Route path="/service"      element={<ServiceBom />} />
              <Route path="/software"     element={<SoftwareBom />} />
              <Route path="/changes"      element={<Changes />} />
              <Route path="/changes/:id"  element={<Changes />} />
              <Route path="/compare"      element={<BomCompare />} />
              <Route path="/parts"        element={<PartMaster />} />
              <Route path="/parts/:pn"    element={<PartMaster />} />
              <Route path="/suppliers"    element={<SupplierIntel />} />
              <Route path="/field"        element={<FieldQuality />} />
              <Route path="/reports"      element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
