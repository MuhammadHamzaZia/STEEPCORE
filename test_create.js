import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://steepcoreapi.onrender.com/api/Ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Learning path for a UX/UI Product Designer" })
    });
    const data = await res.json();
    console.log("Generated:", data.title);
    
    // Now try to save
    const saveRes = await fetch('https://steepcoreapi.onrender.com/api/Blueprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log("Save status:", saveRes.status);
    console.log(await saveRes.text());
  } catch (err) {
    console.error(err);
  }
}
test();
