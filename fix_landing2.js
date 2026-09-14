import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const targetStr = `      </div>
      </div>
      {/* TRENDING BLUEPRINTS */}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, `      </div>\n      {/* TRENDING BLUEPRINTS */}`);
} else {
  // Try with \r\n
  const targetStr2 = `      </div>\r\n      </div>\r\n      {/* TRENDING BLUEPRINTS */}`;
  if (code.includes(targetStr2)) {
    code = code.replace(targetStr2, `      </div>\r\n      {/* TRENDING BLUEPRINTS */}`);
  }
}

fs.writeFileSync('src/components/LandingPage.tsx', code);
