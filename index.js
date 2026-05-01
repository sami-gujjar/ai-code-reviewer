const express = require("express");
const app = express();
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.send(`
    <html>
    <head><title>AI Code Reviewer</title></head>
    <body style="font-family:Arial; max-width:800px; margin:50px auto; padding:20px;">
      <h1>🤖 AI Code Reviewer</h1>
      <p>Powered by Multiple AI Models</p>
      <textarea id="code" rows="15" cols="80" placeholder="Paste your code here..."></textarea>
      <br><br>
      <button onclick="reviewCode()" style="padding:10px 20px; background:blue; color:white; border:none; cursor:pointer; font-size:16px;">
        Review My Code
      </button>
      <div id="result" style="margin-top:20px; white-space:pre-wrap; background:#f4f4f4; padding:15px;"></div>
      <script>
        async function reviewCode() {
          const code = document.getElementById('code').value;
          document.getElementById('result').innerText = 'Reviewing... please wait';
          const res = await fetch('/review', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({code})
          });
          const data = await res.json();
          document.getElementById('result').innerText = data.review;
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/review", async (req, res) => {
  const { code } = req.body;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: `You are an expert code reviewer. Review this code and provide feedback on bugs, improvements, and best practices:\n\n${code}`
        }
      ]
    })
  });
  const data = await response.json();
 const review = data.choices?.[0]?.message?.content || JSON.stringify(data);
  res.json({ review });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));