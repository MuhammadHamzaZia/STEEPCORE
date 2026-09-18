import fs from 'fs';
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const target = `          api.getTrendingBlueprints(3),`;
const replacement = `          api.getTrendingBlueprints(20),`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    
    const setTarget = `        setTrendingBlueprints(trending);`;
    const setReplacement = `        if (trending && trending.length > 0) {
          const shuffledTrending = [...trending].sort(() => 0.5 - Math.random());
          setTrendingBlueprints(shuffledTrending.slice(0, 3));
        } else {
          setTrendingBlueprints([]);
        }`;
    content = content.replace(setTarget, setReplacement);
    
    fs.writeFileSync('src/components/LandingPage.tsx', content);
    console.log("LandingPage patched successfully");
} else {
    console.log("Target not found in LandingPage");
}
