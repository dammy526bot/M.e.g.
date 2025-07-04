require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const webhookURL = process.env.WEBHOOK_URL;

if (!webhookURL) {
  console.error('⚠️ WEBHOOK_URL 尚未設定！');
  process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('/submit', (req, res, next) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
  } else {
    next();
  }
});

// 基本輸入驗證函數
function sanitizeInput(str, maxLen = 1000) {
  if (!str) return '未填';
  str = str.trim();
  if (str.length === 0) return '未填';
  if (str.length > maxLen) return str.slice(0, maxLen) + '...';
  return str;
}

app.post('/submit', async (req, res) => {
  try {
    const { roblox, discord, age, profile, rank, reason, intro } = req.body;

    // 簡單清理與預設
    const payload = {
      embeds: [{
        title: '📝 Discord 申請',
        color: 0x38bdf8,
        fields: [
          { name: 'Roblox', value: sanitizeInput(roblox, 100) },
          { name: 'Discord', value: sanitizeInput(discord, 100) },
          { name: '年齡', value: sanitizeInput(age?.toString(), 10) },
          { name: '個人頁面', value: sanitizeInput(profile, 300) },
          { name: '階級', value: sanitizeInput(rank, 100) },
          { name: '申請理由', value: sanitizeInput(reason, 1000) },
          { name: '自我介紹', value: sanitizeInput(intro, 1000) }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const r = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('Webhook 發送錯誤:', r.status, text);
      return res.status(500).send(`Webhook 發送失敗，狀態碼：${r.status}`);
    }

    res.send('✅ 成功送出');
  } catch (e) {
    console.error('處理申請時發生錯誤:', e);
    res.status(500).send('❌ 發送失敗，伺服器錯誤');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

