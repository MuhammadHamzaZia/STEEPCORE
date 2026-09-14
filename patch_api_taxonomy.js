import fs from 'fs';
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const newTaxonomy = `
  async getCategories(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/categories');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Categories' },
        { name: 'Role-Based', label: 'Role-Based Paths' },
        { name: 'Skill-Based', label: 'Skill-Based Guides' },
        { name: 'Project-Based', label: 'Project-Based Guides' },
      ];
    }
  },
  async getIndustries(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/industries');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Industries' },
        { name: 'IT & Software', label: 'IT & Software' },
        { name: 'Construction', label: 'Construction & Architecture' },
        { name: 'Automotive', label: 'Automotive & Mechanics' },
        { name: 'Healthcare', label: 'Healthcare & Medical' },
        { name: 'Business', label: 'Business & Finance' },
        { name: 'Creative', label: 'Creative & Design' },
      ];
    }
  },
  async getDomains(): Promise<{name: string, label: string}[]> {
    try {
      const res = await apiClient.get<{name: string, label: string}[]>('/api/Taxonomy/domains');
      if (res && res.length > 0) return res;
      throw new Error('fallback');
    } catch {
      return [
        { name: 'all', label: 'All Domains' },
        { name: 'AI & Data Science', label: 'AI & Data Science' },
        { name: 'Web & Mobile', label: 'Web & Mobile Dev' },
        { name: 'Cloud & DevOps', label: 'Cloud & DevOps' },
        { name: 'Core Engineering', label: 'Core Engineering' },
        { name: 'Other', label: 'Other' }
      ];
    }
  },
`;

code = code.replace(
  /export const api = \{/,
  'export const api = {\n' + newTaxonomy
);

fs.writeFileSync('src/services/api.ts', code);
console.log('patched api taxonomy');
