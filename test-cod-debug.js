const http = require('http');
const fs = require('fs');

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
    fs.writeFileSync('checkout.html', html);
    
    // Count different payment method references
    const codCount = (html.match(/cod/gi) || []).length;
    const upiCount = (html.match(/upi/gi) || []).length;
    const cardCount = (html.match(/card/gi) || []).length;
    const indiaFavCount = (html.match(/india favorite/gi) || []).length;
    const paymentMethodCount = (html.match(/paymentMethod/gi) || []).length;
    const radioCount = (html.match(/RadioGroupItem/gi) || []).length;
    
    console.log('HTML saved to checkout.html (length:', html.length + ')');
    console.log('COD:', codCount);
    console.log('UPI:', upiCount);
    console.log('Card:', cardCount);
    console.log('India Favorite:', indiaFavCount);
    console.log('paymentMethod:', paymentMethodCount);
    console.log('RadioGroupItem:', radioCount);
    
    // Check for key elements
    if (html.includes('Checkout')) console.log('✓ Checkout page loaded');
    if (html.includes('placeholder="Select')) console.log('✓ Form inputs found');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
