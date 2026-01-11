const net = require('net');
// Hardcoded host from user's env
const host = 'ep-broad-rice-ahkk5xrj-pooler.c-3.us-east-1.aws.neon.tech';
const port = 5432;

console.log(`Connecting to ${host}:${port}...`);
const socket = net.createConnection(port, host, () => {
    console.log('✅ TCP Connected successfully!');
    socket.end();
});

socket.on('error', (err) => {
    console.error('❌ TCP Connection Failed:', err.message);
});

socket.setTimeout(10000);
socket.on('timeout', () => {
    console.error('❌ TCP Connection Timed Out (10s)');
    socket.destroy();
});
