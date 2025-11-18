const https = require('https');

const url = process.env.SITE_URL || 'https://chronos-prod.web.app';

https.get(url, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Site is healthy');
    process.exit(0);
  } else {
    console.log(`❌ Site returned status ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', (err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
