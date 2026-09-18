global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
import { apiClient } from './src/services/apiClient.ts';
(async () => {
  try {
    const res = await apiClient.post('http://localhost:3000/api/ai/Chat', { messages: [], context: {} });
    console.log("Success:", res);
  } catch (e) {
    console.log("Caught:", e.message);
  }
})();
