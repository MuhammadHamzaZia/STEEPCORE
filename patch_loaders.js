import fs from 'fs';

function replaceLoaders(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  // We want to replace <Loader2 className="..." /> with <img src="/loader.svg" className="..." />
  // Note: Loader2 might have size, className, etc.
  
  // We can use a regex that matches <Loader2 ... />
  // We need to keep the className but change size to width/height classes or style if possible, 
  // actually just map size={16} to w-4 h-4 in className or style={{width: 16, height: 16}}.
  
  code = code.replace(/<Loader2([^>]*)\/>/g, (match, p1) => {
    let classNameMatch = p1.match(/className="([^"]+)"/);
    let sizeMatch = p1.match(/size=\{([0-9]+)\}/);
    
    let className = classNameMatch ? classNameMatch[1] : '';
    let size = sizeMatch ? parseInt(sizeMatch[1]) : null;
    
    // We should preserve the animation class if it has 'animate-spin'
    // Actually the image itself can have 'animate-spin'
    
    let styleStr = '';
    if (size) {
      styleStr = ` style={{ width: ${size}, height: ${size} }}`;
    }
    
    // Check if the original string had a className property. If not, add one if there's no size, just to be safe.
    let newProps = p1;
    if (p1.includes('className=')) {
      // replace size={X} if it exists
      newProps = p1.replace(/size=\{[0-9]+\}/, '');
    } else {
      newProps = p1.replace(/size=\{[0-9]+\}/, '');
    }
    
    return `<img src="/loader.svg" alt="Loading" ${newProps}${styleStr} />`;
  });
  
  if (code !== originalCode) {
    fs.writeFileSync(filePath, code);
    console.log(`Patched loaders in ${filePath}`);
  }
}

const files = [
  'src/components/DashboardPage.tsx',
  'src/components/ProductDetailPage.tsx',
  'src/components/RoadmapWorkspace.tsx',
  'src/components/LandingPage.tsx',
  'src/components/CatalogPage.tsx',
  'src/components/AuthModal.tsx'
];

files.forEach(replaceLoaders);
