import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import FigurinePage from "./pages/FigurinePage";
import FigurinaConfigPage from "./pages/FigurinaConfigPage";
import AlbumPage from "./pages/AlbumPage";
import AlbumConfigPage from "./pages/AlbumConfigPage";
import PacchettiPage from "./pages/PacchettiPage";
import PacchettoConfigPage from "./pages/PacchettoConfigPage";
import NotFound from "./pages/NotFound";
import AlbumCreatePage from "./pages/AlbumCreatePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/figurine" element={<FigurinePage />} />
            <Route
              path="/figurine/:figurinaId"
              element={<FigurinaConfigPage />}
            />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/album/:albumId" element={<AlbumConfigPage />} />
            <Route path="/album/new" element={<AlbumCreatePage />} />

            <Route path="/pacchetti" element={<PacchettiPage />} />
            <Route
              path="/pacchetti/:pacchettoId"
              element={<PacchettoConfigPage />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
