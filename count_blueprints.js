import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://steepcoreapi.onrender.com/api/Blueprints/published');
    const data = await res.json();
    console.log("Total published blueprints:", data.length);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
