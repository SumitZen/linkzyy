import { Client, Account, Databases, Storage } from 'appwrite';

const appwriteConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT || 'placeholder',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'linkzy_db',
    profilesCollectionId: import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID || 'profiles',
    storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'backgrounds'
};

const isConfigured = (config: Record<string, string | undefined>) => {
    return !!config.projectId && config.projectId.length > 5 && config.projectId !== 'placeholder';
};

export const APPWRITE_READY = isConfigured(appwriteConfig as Record<string, string | undefined>);
export const APPWRITE_CONFIG = appwriteConfig;

const client = new Client();

if (APPWRITE_READY) {
    client
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
