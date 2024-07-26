export interface Job {
    id: string;
    datasetId: string;
    status: string;
    createdAt: string;
    result?: any;
    file?: Blob
}

export enum JobStatus {
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED"
}