
// verify_auth.js
async function verifyRegister() {
    const baseUrl = 'http://localhost:3000';
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    try {
        console.log('Attempting to register user:', email);
        const res = await fetch(`${baseUrl}/api/user/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }) // Not passing role here, relying on route.js to add it
        });

        if (res.ok) {
            const data = await res.json();
            console.log('SUCCESS: Registration passed!', data);
        } else {
            const text = await res.text();
            console.error('FAILED: Registration status', res.status);
            console.error('Error:', text);
        }
    } catch (err) {
        console.error('Verification error:', err);
    }
}

verifyRegister();
