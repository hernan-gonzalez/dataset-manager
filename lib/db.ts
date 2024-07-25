import { Dataset } from '@/features/DataSet/types';
import { Job } from '@/features/Job/types';
import { openDB } from 'idb';

let dbPromise: Promise<any> | null = null;

if (typeof window !== 'undefined') {
    dbPromise = openDB('dataset-manager', 1, {
        upgrade(db) {
            db.createObjectStore('datasets', { keyPath: 'id' });
            db.createObjectStore('jobs', { keyPath: 'id' });
        },
    });
}

export async function saveDataset(dataset: Dataset) {
    const db = await dbPromise;
    await db.put('datasets', dataset);
}

export async function getDataset(id: string) {
    console.log(id)
    const db = await dbPromise;
    return db.get('datasets', id);
}

export async function getAllDatasets() {
    const db = await dbPromise;
    return db.getAll('datasets');
}

export async function saveJob(job: Job) {
    const db = await dbPromise;
    await db.put('jobs', job);
}

export async function updateJob(job: Job) {
    const db = await dbPromise;
    await db.put('jobs', job);
}

export async function getJob(id: string) {
    const db = await dbPromise;
    return db.get('jobs', id);
}

export async function getAllJobs(datasetId: string) {
    const db = await dbPromise;
    const jobs = await db.getAll('jobs');
    return jobs.filter((job: Job)=> job.datasetId === datasetId);
}