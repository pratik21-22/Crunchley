const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/checkout',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let html = '';
  
  res.on('data', (chunk) => {
    html += chunk;
  });
  
  res.on('end', () => {
    const codMatches = html.match(/cod|Cash on Delivery|India Favorite/gi) || [];
    const upiMatches = html.match(/upi|UPI/gi) || [];
    const emeraldMatches = html.match(/emerald/gi) || [];
    
    console.log('COD mentions:', codMatches.length);
    console.log('UPI mentions:', upiMatches.length);
    console.log('Emerald (styling):', emeraldMatches.length);
    
    if (html.includes('value="cod"')) {
      console.log('✓ COD radio button found');
    }
    if (html.includes('India Favorite')) {
      console.log('✓ "India Favorite" section found');
    }
    if (html.includes('Safe & Secure')) {
      console.log('✓ Trust badge found');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
