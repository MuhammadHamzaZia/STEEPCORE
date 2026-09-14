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
      <>
        <RoadmapWorkspace initialBlueprintId={selectedBlueprintId || undefined} onBack={() => handleNavigate('product')} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <>
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
          <ProductDetailPage onNavigateToEditor={() => handleNavigate('editor')} />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-action-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="font-semibold text-[#e6edf3] text-lg mb-2">AI Smart Resolution</h3>
            <p className="text-[#7d8590] text-sm font-mono flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Checking 85% vector cache...
            </p>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
