import fs from 'fs';

let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

const target = `      try {
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
      }`;

const replace = `      try {
        await api.requestBlueprintAccess(blueprint.id);
        setIsAccessRequested(true);
      } catch (err) {
        console.error("Error requesting access:", err);
      } finally {
        setIsProcessingCheckout(false);
      }`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
