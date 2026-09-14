import fs from 'fs';
let code = fs.readFileSync('src/components/CatalogPage.tsx', 'utf8');

code = code.replace(
  /<\/label>\s*<input type="radio" name="cattype" value=\{d\.name\} checked=\{selectedCategoryType === d\.name\} onChange=\{\(\) => setSelectedCategoryType\(d\.name\)\} className="hidden" \/>/g,
  '<input type="radio" name="cattype" value={d.name} checked={selectedCategoryType === d.name} onChange={() => setSelectedCategoryType(d.name)} className="hidden" />\n                  </label>'
);

code = code.replace(
  /<\/label>\s*<input type="radio" name="industry" value=\{d\.name\} checked=\{selectedIndustry === d\.name\} onChange=\{\(\) => setSelectedIndustry\(d\.name\)\} className="hidden" \/>/g,
  '<input type="radio" name="industry" value={d.name} checked={selectedIndustry === d.name} onChange={() => setSelectedIndustry(d.name)} className="hidden" />\n                  </label>'
);

code = code.replace(
  /<\/label>\s*<input type="radio" name="domain" value=\{d\.name\} checked=\{selectedDomain === d\.name\} onChange=\{\(\) => setSelectedDomain\(d\.name\)\} className="hidden" \/>/g,
  '<input type="radio" name="domain" value={d.name} checked={selectedDomain === d.name} onChange={() => setSelectedDomain(d.name)} className="hidden" />\n                  </label>'
);

fs.writeFileSync('src/components/CatalogPage.tsx', code);
console.log('Fixed inputs');
