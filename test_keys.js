import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://steepcoreapi.onrender.com/api/Ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Learning roadmap for Rust programming" })
    });
    const data = await res.json();
    console.log(Object.keys(data));
    console.log(data.title);
    console.log(data.description);
  } catch (err) {
    console.error(err);
  }
}
test();
