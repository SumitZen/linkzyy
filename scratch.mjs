import { Client, Databases, Account } from 'appwrite';

const client = new Client();
client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69a6db540006bba97f34');

const account = new Account(client);
const databases = new Databases(client);

async function runTest() {
    try {
        console.log('Logging in...');
        await account.createEmailPasswordSession('ss1816434+verifier-new@gmail.com', 'verifier123');
        const user = await account.get();
        console.log('Logged in User ID:', user.$id);

        const databaseId = '69a6ddcb0034d9168c0e';
        const collectionId = 'profiles';

        const res = await databases.listDocuments(databaseId, collectionId);
        let docId = null;
        for (let d of res.documents) {
            if (d.userId === user.$id) {
                docId = d.$id;
                break;
            }
        }

        if (!docId) {
            console.log('No document found for this test user.');
            return;
        }

        console.log('Testing updates on Doc ID:', docId);

        const tests = [
            { key: 'bio', value: 'Local Script Test' },
            { key: 'links', value: JSON.stringify([{ id: 'test', type: 'link', label: 'Local', url: 'https://local.com', icon: 'link', enabled: true }]) },
            { key: 'profilePictureUrl', value: '' }, // Often strict URL format in Appwrite
            { key: 'avatarUrl', value: '' },
            { key: 'bgImage', value: '' }
        ];

        for (const test of tests) {
            try {
                process.stdout.write(`Updating ${test.key} = '${test.value}'... `);
                await databases.updateDocument(databaseId, collectionId, docId, { [test.key]: test.value });
                console.log('✅ OK');
            } catch (err) {
                console.log(`❌ FAIL - ${err.message}`);
            }
        }

    } catch (e) {
        console.error('Fatal Script Error:', e.message);
    }
}

runTest();
