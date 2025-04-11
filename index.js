const express = require('express');
const moment = require('moment-timezone');

const app = express();
const port = 5000;
const startTime = Date.now();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  const uptimeInSeconds = Math.floor((Date.now() - startTime) / 1000);
  const uptimeFormatted = new Date(uptimeInSeconds * 1000).toISOString().substr(11, 8); // HH:mm:ss

  res.json({
    nama: 'Delix',
    nrp: '5025231000',
    status: 'UP',
    timestamp: moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
    uptime: `${uptimeFormatted}`,
  });
});

app.listen(port,"0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
