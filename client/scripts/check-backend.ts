async function checkBackend() {
    const API_URL = process.env.API_URL || 'http://localhost:8000';

    console.log(`Checking backend at ${API_URL}...`);

    try {
        const response = await fetch(`${API_URL}/health`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is running');
            console.log('   Status:', data.status);
            console.log('');
            console.log('You can now start the frontend:');
            console.log('   npm run dev');
            process.exit(0);
        } else {
            console.log('❌ Backend returned error:', response.status);
            process.exit(1);
        }
    } catch (error) {
        console.log('❌ Backend is not reachable');
        console.log('');
        console.log('Make sure backend is running:');
        console.log('   cd microservices');
        console.log('   docker-compose up');
        console.log('');
        console.log('Error:', (error as Error).message);
        process.exit(1);
    }
}

checkBackend();
