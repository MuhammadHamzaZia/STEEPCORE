import fs from 'fs';

let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  "import { useUIStore } from '../store/useUIStore';",
  "import { useUIStore } from '../store/useUIStore';\nimport { useAuthStore } from '../store/useAuthStore';"
);

code = code.replace(
  "const { selectedBlueprintId } = useUIStore();",
  "const { selectedBlueprintId, setIsAuthModalOpen } = useUIStore();\n  const { isAuthenticated, user } = useAuthStore();"
);

const handlePurchaseTarget = `  const handlePurchaseOrOpen = async () => {
    if (!canAccess) {
      if (isAccessRequested) return;
      setIsProcessingCheckout(true);
      // Simulate API call to request access
      setTimeout(() => {
        setIsAccessRequested(true);
        setIsProcessingCheckout(false);
      }, 1000);
      return;
    }
    if (onNavigateToEditor) {
      onNavigateToEditor();
    }
  };`;

const handlePurchaseReplace = `  const handlePurchaseOrOpen = async () => {
    if (!canAccess) {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }
      
      if (isAccessRequested) return;
      setIsProcessingCheckout(true);
      
      try {
        const res = await fetch('/api/local/access-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blueprintId: blueprint.id,
            userEmail: user?.email || user?.username || 'unknown_user'
          })
        });
        
        if (res.ok) {
          setIsAccessRequested(true);
        } else {
          console.error("Failed to request access");
        }
      } catch (err) {
        console.error("Error requesting access:", err);
      } finally {
        setIsProcessingCheckout(false);
      }
      return;
    }
    if (onNavigateToEditor) {
      onNavigateToEditor();
    }
  };`;

code = code.replace(handlePurchaseTarget, handlePurchaseReplace);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
console.log("Success");
