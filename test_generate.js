import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://steepcoreapi.onrender.com/api/Ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Learning roadmap for Rust programming" })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}
test();
