/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { RoadmapGenerator } from './components/RoadmapGenerator';
import { LandingPage } from './components/LandingPage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { EditorPage } from './components/EditorPage';
import { DashboardPage } from './components/DashboardPage';
import { Layout } from './components/Layout';
import { useUIStore } from './store/useUIStore';

type Page = 'landing' | 'catalog' | 'roadmap' | 'product' | 'editor' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const { setSearchQuery, setSelectedPromptType, searchQuery, selectedPromptType } = useUIStore();

  const handleGeneratePrompt = (prompt: string, promptType: string) => {
    setSearchQuery(prompt);
    setSelectedPromptType(promptType);
    setIsAiLoading(true);
    
    // Simulate AI Smart Resolution
    setTimeout(() => {
      setIsAiLoading(false);
      setSelectedRole(prompt); 
      setCurrentPage('roadmap'); 
    }, 1500);
  };

  const handleBackToLanding = () => {
    setSelectedRole(null);
    setCurrentPage('landing');
  };

  if (currentPage === 'editor') {
    return <EditorPage onBack={() => setCurrentPage('product')} />;
  }

  return (
    <>
      <Layout onNavigate={setCurrentPage} currentPage={currentPage}>
        {currentPage === 'landing' && (
          <LandingPage 
            onGeneratePrompt={handleGeneratePrompt} 
            onNavigateToCatalog={() => setCurrentPage('catalog')}
            onNavigateToProduct={() => setCurrentPage('product')}
          />
        )}
        {currentPage === 'catalog' && (
          <CatalogPage 
            onNavigateToProduct={() => setCurrentPage('product')} 
            onNavigateToRoadmap={() => {
              if (searchQuery) {
                handleGeneratePrompt(searchQuery, selectedPromptType || 'System Architecture');
              } else {
                setCurrentPage('landing');
                setTimeout(() => {
                  const input = document.querySelector('input[type="text"]');
                  if (input instanceof HTMLElement) input.focus();
                }, 100);
              }
            }}
          />
        )}
        {currentPage === 'roadmap' && selectedRole && (
          <RoadmapGenerator initialRole={selectedRole} onBack={handleBackToLanding} />
        )}
        {currentPage === 'product' && (
          <ProductDetailPage onNavigateToEditor={() => setCurrentPage('editor')} />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage 
            onNavigateToEditor={() => setCurrentPage('editor')} 
            onNavigateToCatalog={() => setCurrentPage('catalog')}
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
    </>
  );
}
