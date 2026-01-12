const result = require('dotenv').config({ debug: true });
if (result.error) {
    console.error('Dotenv Error:', result.error);
} else {
    console.log('Dotenv parsed:', result.parsed);
}

const { Client } = require('pg');

async function test() {
    console.log('--- DB CONNECTION TEST ---');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USERNAME);
    console.log('Database:', process.env.DB_DATABASE);
    // Do not log password for security

    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ Connection Sucessful!');
        const res = await client.query('SELECT NOW() as time');
        console.log('Server Time:', res.rows[0].time);
        await client.end();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    }
}

test();
