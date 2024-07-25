export interface Job {
    id: string;
    datasetId: string;
    status: string;
    createdAt: string;
    result?: any;
}