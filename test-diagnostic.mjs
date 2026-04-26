async function testDiagnostic() {
  try {
    console.log('Testing diagnostic API...');
    const response = await fetch('http://localhost:3000/api/auth/diagnostic');
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDiagnostic();