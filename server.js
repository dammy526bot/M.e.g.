require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const webhookURL = process.env.WEBHOOK_URL;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit', async (req, res) => {
  const { roblox, discord, age, profile, rank, reason, intro } = req.body;

  const payload = {
    embeds: [{
      title: '📝 Discord 申請',
      color: 0x38bdf8,
      fields: [
        { name: 'Roblox', value: roblox || '未填' },
        { name: 'Discord', value: discord || '未填' },
        { name: '年齡', value: age?.toString() || '未填' },
        { name: '個人頁面', value: profile || '未填' },
        { name: '階級', value: rank || '未填' },
        { name: '申請理由', value: reason || '未填' },
        { name: '自我介紹', value: intro || '未填' }
      ],
      timestamp: new Date()
    }]
  };

  try {
    const r = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) return res.status(500).send('Webhook 發送失敗');
    res.send('✅ 成功送出');
  } catch (e) {
    console.error(e);
    res.status(500).send('❌ 發送失敗');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});