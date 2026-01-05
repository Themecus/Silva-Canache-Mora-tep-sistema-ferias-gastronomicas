const http = require('http');

function request(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function verify() {
    console.log('--- Verification: Order Status Update ---');

    // 1. Create Order
    console.log('1. Creating Order...');
    const order = await request('POST', '/pedidos', {
        puestoId: 'uuid-test',
        items: [{ productoId: 'prod-1', cantidad: 1 }],
    });
    console.log('   Created Order ID:', order.id);

    if (!order.id) {
        console.error('Failed to create order. Response:', JSON.stringify(order, null, 2));
        return;
    }

    // 2. Update Status to PREPARANDO
    console.log('2. Updating Status to PREPARANDO...');
    const updated = await request('PATCH', `/pedidos/${order.id}`, {
        estado: 'PREPARANDO',
    });
    console.log('   Response Body:', JSON.stringify(updated, null, 2));

    // 3. Verify Persistence
    console.log('3. Verifying Persistence via GET...');
    const fetched = await request('GET', `/pedidos/${order.id}`);
    console.log('   Fetched Status:', fetched.estado);

    if (fetched.estado === 'PREPARANDO') {
        console.log('✅ SUCCESS: Status updated correctly.');
    } else {
        console.error('❌ FAILURE: Status did not update.');
    }
}

verify();
