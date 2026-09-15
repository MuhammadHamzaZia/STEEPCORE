import fetch from 'node-fetch';

async function test() {
  const username = "ai_agent_" + Date.now();
  const email = username + "@example.com";
  const password = "Password123!";
  
  try {
    const regRes = await fetch('https://steepcoreapi.onrender.com/api/Auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    console.log("Register:", regRes.status, await regRes.text());
    
    const loginRes = await fetch('https://steepcoreapi.onrender.com/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    console.log("Login:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Token:", loginData.token ? "YES" : "NO");
    console.log(loginData.token);
  } catch (err) {
    console.error(err);
  }
}
test();
