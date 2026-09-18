/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { RoadmapWorkspace } from "./components/RoadmapWorkspace";
import { LandingPage } from './components/LandingPage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { DashboardPage } from './components/DashboardPage';
import { Layout } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { ToastProvider } from './components/Toast';
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';

type Page = 'landing' | 'catalog' | 'roadmap' | 'product' | 'editor' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const { setSearchQuery, setSelectedPromptType, searchQuery, selectedPromptType, isAuthModalOpen, setIsAuthModalOpen, selectedBlueprintId } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const handleNavigate = (page: Page) => {
    if (page === 'editor' && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleGeneratePrompt = (prompt: string, promptType: string) => {
    setSearchQuery(prompt);
    setSelectedPromptType(promptType);
    setIsAiLoading(true);
    
    // Simulate AI Smart Resolution
    setTimeout(() => {
      setIsAiLoading(false);
      setSelectedRole(prompt); 
      handleNavigate('roadmap'); 
    }, 1500);
  };

  const handleBackToLanding = () => {
    setSelectedRole(null);
    handleNavigate('landing');
  };

  if (currentPage === 'editor') {
    return (
      <ToastProvider>
        <RoadmapWorkspace initialBlueprintId={selectedBlueprintId || undefined} onBack={() => handleNavigate('product')} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Layout onNavigate={handleNavigate} currentPage={currentPage}>
        {currentPage === 'landing' && (
          <LandingPage 
            onGeneratePrompt={handleGeneratePrompt} 
            onNavigateToCatalog={() => handleNavigate('catalog')}
            onNavigateToProduct={() => handleNavigate('product')}
          />
        )}
        {currentPage === 'catalog' && (
          <CatalogPage 
            onNavigateToProduct={() => handleNavigate('product')} 
            onNavigateToRoadmap={() => {
              if (searchQuery) {
                handleGeneratePrompt(searchQuery, selectedPromptType || 'System Architecture');
              } else {
                handleNavigate('landing');
                setTimeout(() => {
                  const input = document.querySelector('input[type="text"]');
                  if (input instanceof HTMLElement) input.focus();
                }, 100);
              }
            }}
          />
        )}
        {currentPage === 'roadmap' && selectedRole && (
          <RoadmapWorkspace initialRole={selectedRole} onBack={handleBackToLanding} />
        )}
        {currentPage === 'product' && (
          <ProductDetailPage onNavigateToEditor={() => handleNavigate('editor')} onNavigateToCatalog={() => handleNavigate('catalog')} />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage 
            onNavigateToEditor={() => handleNavigate('editor')} 
            onNavigateToCatalog={() => handleNavigate('catalog')}
          />
        )}
      </Layout>

      {/* AI Smart Resolution Modal */}
      {isAiLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-canvas-surface border border-border-default rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-8 flex flex-col items-center justify-center text-center relative">
            <div className="absolute inset-0 bg-action-primary/5 blur-3xl rounded-full"></div>
            <img src="/loader.svg" alt="Loading" className="w-16 h-16 animate-spin mb-6 object-contain drop-shadow-md z-10" />
            <h3 className="font-bold text-fg-default text-xl mb-3 z-10 tracking-tight">AI Smart Resolution</h3>
            <p className="text-fg-muted text-sm font-medium flex items-center gap-2 z-10 bg-canvas-inset px-4 py-1.5 rounded-full border border-border-default">
              <span className="inline-block w-2 h-2 rounded-full bg-action-primary animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.6)]"></span>
              Structuring Architecture...
            </p>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </ToastProvider>
  );
}
