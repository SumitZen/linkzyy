const PROJECT_ID = '69a6db540006bba97f34';
const DATABASE_ID = '69a6ddcb0034d9168c0e';
const COLLECTION_ID = 'profiles';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';

async function runTest() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${ENDPOINT}/account/sessions/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID
            },
            body: JSON.stringify({
                email: 'ss1816434+verifier-new@gmail.com',
                password: 'verifier123'
            })
        });

        const session = await loginRes.json();

        // Extract the actual Set-Cookie header
        const setCookieHeader = loginRes.headers.get('set-cookie') || '';
        // E.g. a_session_69a6db540006bba97f34=eyJ...; Path=/; HttpOnly
        const cookieStr = setCookieHeader.split(';')[0];
        console.log('Obtained Auth Cookie:', cookieStr.substring(0, 30) + '...');

        const headers = {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': PROJECT_ID,
            'Cookie': cookieStr,
            // Appwrite sometimes specifically requires X-Fallback-Cookies if CORS isn't right,
            // but for a Node.js server-to-server request, sending the raw Cookie header works perfectly.
            // Let's also send X-Fallback-Cookies just in case the node fetch doesn't send Cookie header properly:
            'X-Fallback-Cookies': JSON.stringify({
                [`a_session_${PROJECT_ID}`]: cookieStr.split('=')[1]
            })
        };

        const listRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
            headers
        });

        const listData = await listRes.json();
        let docId = null;

        for (let d of listData.documents) {
            if (d.userId === session.userId) {
                console.log('Found corrupted document ID:', d.$id);
                console.log('Attempting to delete it to reset the state...');

                const delRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${d.$id}`, {
                    method: 'DELETE',
                    headers
                });

                if (delRes.ok) {
                    console.log('✅ Deleted corrupted document successfully.');
                } else {
                    console.log('❌ Failed to delete:', await delRes.text());
                }
                break;
            }
        }

        console.log('Creating a fresh, uncorrupted document...');
        const createRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                documentId: 'unique()',
                data: {
                    userId: session.userId,
                    displayName: 'Sumit',
                    bio: 'Testing fresh doc',
                    theme: '7-forest'
                }
            })
        });
        const createData = await createRes.json();

        if (!createRes.ok) {
            console.error('Create failed:', JSON.stringify(createData, null, 2));
            return;
        }

        docId = createData.$id;
        console.log('✅ Created NEW pristine Doc ID:', docId);

        console.log('\nTesting updates on Doc ID:', docId);

        const tests = [
            { key: 'bio', value: 'Testing pure fetch' },
            { key: 'theme', value: 'editorial-light' },
            { key: 'bgColor', value: null },
            { key: 'bgColor', value: '' }, // This should 500
            { key: 'avatarUrl', value: null },
            { key: 'links', value: JSON.stringify([]) }
        ];

        for (const test of tests) {
            try {
                console.log(`\n--- Testing ${test.key} = ${test.value} ---`);
                const updateRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        data: {
                            [test.key]: test.value
                        }
                    })
                });

                if (updateRes.ok) {
                    console.log(`✅ OK: Updated ${test.key}`);
                } else {
                    const err = await updateRes.json();
                    console.log(`❌ FAIL - Status ${updateRes.status}:`, JSON.stringify(err, null, 2));
                }
            } catch (err) {
                console.log(`❌ Network FAIL - ${err.message}`);
            }
        }

    } catch (e) {
        console.error('Fatal Script Error:', e.message);
    }
}

runTest();
