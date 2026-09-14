import fs from 'fs';

// 1. Patch DbSeeder.cs
let seeder = fs.readFileSync('STEEPCOREAPI/Shared/Database/DbSeeder.cs', 'utf8');
seeder = seeder.replace(/Price\s*=\s*[\d\.]+m/g, 'Price = 0m');
fs.writeFileSync('STEEPCOREAPI/Shared/Database/DbSeeder.cs', seeder);

// 2. Patch frontend api.ts
let frontendApi = fs.readFileSync('src/services/api.ts', 'utf8');

// For getBlueprints
const targetGetBlueprints = `          creator: { name: item.creatorName || 'STEEPCORE' }
        }));`;
const replaceGetBlueprints = `          creator: { name: item.creatorName || 'STEEPCORE' }
        })).map(bp => ({
          ...bp,
          price: (bp.creator.name === 'STEEPCORE' || bp.creator.name === 'System' || bp.creator.name === 'Unknown') ? 0 : bp.price
        }));`;

if (frontendApi.includes(targetGetBlueprints)) {
  frontendApi = frontendApi.replace(targetGetBlueprints, replaceGetBlueprints);
}

// For getTrendingBlueprints
const targetTrending = `  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      return await apiClient.get<Blueprint[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
    } catch (e) {
      return [];
    }
  },`;
const replaceTrending = `  async getTrendingBlueprints(limit: number = 3): Promise<Blueprint[]> {
    try {
      const data = await apiClient.get<any[]>(\`/api/Blueprints/trending?limit=\${limit}\`);
      return data.map(bp => ({
        ...bp,
        price: (bp.creatorName === 'STEEPCORE' || bp.creatorName === 'System' || bp.creatorName === 'Unknown' || !bp.creatorName) ? 0 : bp.price
      }));
    } catch (e) {
      return [];
    }
  },`;
if (frontendApi.includes(targetTrending)) {
  frontendApi = frontendApi.replace(targetTrending, replaceTrending);
}

// For getBlueprintById
const targetById = `      if (data) {
        data.nodesCount = data.nodes?.length || 0;
        data.creator = { name: data.creatorName || 'STEEPCORE' };
        return data;
      }`;
const replaceById = `      if (data) {
        data.nodesCount = data.nodes?.length || 0;
        data.creator = { name: data.creatorName || 'STEEPCORE' };
        if (data.creator.name === 'STEEPCORE' || data.creator.name === 'System' || data.creator.name === 'Unknown') {
          data.price = 0;
        }
        return data;
      }`;
if (frontendApi.includes(targetById)) {
  frontendApi = frontendApi.replace(targetById, replaceById);
}

fs.writeFileSync('src/services/api.ts', frontendApi);
console.log("Success");
