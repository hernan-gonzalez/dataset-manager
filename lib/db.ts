import { openDB } from 'idb';

const dbPromise = openDB('dataset-manager', 1, {
    upgrade(db) {
        db.createObjectStore('datasets', { keyPath: 'id' });
        db.createObjectStore('jobs', { keyPath: 'id' });
    },
});

export async function saveDataset(dataset) {
    const db = await dbPromise;
    await db.put('datasets', dataset);
}

export async function getDataset(id) {
    console.log(id)
    const db = await dbPromise;
    return db.get('datasets', id);
}

export async function getAllDatasets() {
    const db = await dbPromise;
    return db.getAll('datasets');
}

export async function saveJob(job) {
    const db = await dbPromise;
    await db.put('jobs', job);
}

export async function updateJob(job) {
    const db = await dbPromise;
    await db.put('jobs', job);
}

export async function getJob(id) {
    const db = await dbPromise;
    return db.get('jobs', id);
}

export async function getAllJobs(datasetId) {
    const db = await dbPromise;
    const jobs = await db.getAll('jobs');
    return jobs.filter(job => job.datasetId === datasetId);
}