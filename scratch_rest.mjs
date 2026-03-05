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

        if (!loginRes.ok) {
            const err = await loginRes.json();
            throw new Error(`Login failed: ${err.message}`);
        }

        const session = await loginRes.json();

        const fallbackCookies = JSON.stringify({
            [`a_session_${PROJECT_ID}`]: session.secret
        });

        console.log('Logged in! Session secret obtained.');

        const headers = {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': PROJECT_ID,
            'X-Fallback-Cookies': fallbackCookies
        };

        const listRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
            headers
        });

        if (!listRes.ok) {
            console.error('List failed:', await listRes.text());
            return;
        }

        const listData = await listRes.json();
        let docId = null;
        for (let d of listData.documents) {
            if (d.userId === session.userId) {
                docId = d.$id;
                break;
            }
        }

        if (!docId) {
            console.log('No document found for this user. Creating a temporary test document...');
            const createRes = await fetch(`${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    documentId: 'unique()',
                    data: {
                        userId: session.userId,
                        username: 'test_user',
                        displayName: 'Test',
                        bio: 'Init'
                    }
                })
            });
            const createData = await createRes.json();
            if (!createRes.ok) {
                console.error('Create failed:', createData);
                return;
            }
            docId = createData.$id;
            console.log('Created temporary Doc ID:', docId);
        }

        console.log('\nTesting updates on Doc ID:', docId);

        const tests = [
            { key: 'bio', value: 'Local Script Test' },
            { key: 'links', value: JSON.stringify([{ id: 'test', type: 'link', label: 'Local', url: 'https://local.com', icon: 'link', enabled: true }]) },
            { key: 'profilePictureUrl', value: '' },
            { key: 'avatarUrl', value: null },
            { key: 'bgImage', value: null },
            { key: 'bannerUrl', value: null },
            { key: 'theme', value: 'editorial-light' },
            { key: 'bgColor', value: '' },
            { key: 'bgColor', value: null }
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
