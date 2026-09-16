import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

const t1 = `  GitMerge,
  Clock,
  Play,
  User
} from 'lucide-react';`;

const r1 = `  GitMerge,
  Clock,
  Play,
  User,
  Activity
} from 'lucide-react';`;

content = content.replace(t1, r1);

fs.writeFileSync('src/components/DashboardPage.tsx', content);
