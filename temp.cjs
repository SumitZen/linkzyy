const { Client, Databases, Query } = require('appwrite');
const client = new Client().setEndpoint('https://sgp.cloud.appwrite.io/v1').setProject('69a6db540006bba97f34');
const databases = new Databases(client);

databases.listDocuments('69a6ddcb0034d9168c0e', 'profiles', [
    Query.equal('userId', '69a6eeb1003b0e1cf803')
]).then(r => {
    console.log('Docs found:', r.documents.length);
    r.documents.forEach(d => console.log(d.$id, d.username));
}).catch(console.error);
