async function testProductionDiagnostic() {
  const url = 'https://crunchley.vercel.app/api/auth/diagnostic';

  console.log('Testing production diagnostic API...');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Cache-Control:', response.headers.get('cache-control'));
    console.log('');

    if (data.success) {
      console.log('✅ DIAGNOSTIC SUCCESS');
      console.log('');
      console.log('Environment Variables:');
      console.log('  MONGO_URI:', data.environment.MONGO_URI ? '✅ SET' : '❌ MISSING');
      console.log('  AUTH_SECRET:', data.environment.AUTH_SECRET ? '✅ SET' : '❌ MISSING');
      console.log('  AUTH_URL:', data.environment.AUTH_URL ? '✅ SET' : '❌ MISSING');
      console.log('  NODE_ENV:', data.environment.NODE_ENV);
      console.log('');

      console.log('Admin Account:');
      console.log('  Exists:', data.adminAccount.exists ? '✅ YES' : '❌ NO');
      console.log('  Role:', data.adminAccount.role);
      console.log('  Password Hash Exists:', data.adminAccount.passwordHashExists ? '✅ YES' : '❌ NO');
      console.log('');

      console.log('Password Test:', data.passwordTest === true ? '✅ PASSES' : '❌ FAILS');
      console.log('');

      console.log('Login Simulation:');
      console.log('  User Found:', data.loginSimulation.userFound ? '✅ YES' : '❌ NO');
      console.log('  Password Valid:', data.loginSimulation.passwordValid ? '✅ YES' : '❌ FAILS');
      if (data.loginSimulation.error) {
        console.log('  Error:', data.loginSimulation.error);
      }
      console.log('');

      if (data.environment.MONGO_URI && data.environment.AUTH_SECRET &&
          data.adminAccount.exists && data.passwordTest === true &&
          data.loginSimulation.userFound && data.loginSimulation.passwordValid) {
        console.log('🎉 ALL CHECKS PASS - ADMIN LOGIN SHOULD WORK!');
        console.log('');
        console.log('Try logging in with:');
        console.log('Email: admin@crunchley.com');
        console.log('Password: Crunchley@Admin123');
      } else {
        console.log('❌ ISSUES FOUND - CHECK DETAILS ABOVE');
      }

    } else {
      console.log('❌ DIAGNOSTIC FAILED');
      console.log('Error:', data.error);
      console.log('');
      console.log('Possible causes:');
      console.log('- Environment variables not set in Vercel');
      console.log('- Database connection issues');
      console.log('- Vercel function runtime errors');
    }

  } catch (error) {
    console.log('❌ NETWORK ERROR');
    console.log('Error:', error.message);
    console.log('');
    console.log('Possible causes:');
    console.log('- Vercel deployment not ready yet');
    console.log('- Network connectivity issues');
    console.log('- Vercel function timeout');
  }
}

testProductionDiagnostic();