import fetch from 'node-fetch';

async function test() {
  try {
    const prompt = "Complete guide to Electric Vehicle (EV) Maintenance";
    const res = await fetch('https://steepcoreapi.onrender.com/api/Ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
