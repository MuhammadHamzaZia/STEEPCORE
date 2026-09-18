const fs = require('fs');
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

const replacement = `
const BlueprintCard = React.memo<BlueprintCardProps>(({ id, username, repo, title, description, nodesCount, price, originType, onCardClick, isBookmarked, onBookmarkClick }) => (
  <div 
    onClick={() => onCardClick?.(id)}
    onMouseEnter={() => {
        // Prefetch blueprint details on hover
        api.getBlueprintById(id).catch(() => {});
    }}
    className="bg-[#161b22] border border-border-default hover:border-[#8b949e] rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer group hover:bg-[#1f242c]"
  >
`;

code = code.replace(
  `const BlueprintCard = React.memo<BlueprintCardProps>(({ id, username, repo, title, description, nodesCount, price, originType, onCardClick, isBookmarked, onBookmarkClick }) => (
  <div 
    onClick={() => onCardClick?.(id)}
    className="bg-[#161b22] border border-border-default hover:border-[#8b949e] rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer group hover:bg-[#1f242c]"
  >`,
  replacement
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
