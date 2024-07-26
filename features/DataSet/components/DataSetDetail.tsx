'use client'
import { saveJob, getJob, getAllJobs, updateJob } from '@/lib/db';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dataset } from '../types';
import { Job, JobStatus } from '../../Job/types';
import { downloadFile, generateCsvData } from '@/utils/utils';
import { JobDetail } from '@/features/Job/components/JobDetail';

export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [processing, setProcessing] = useState(false);
    const pendingJobs = jobs.filter(job => job.status === JobStatus.PROCESSING);

    //This useEffect is to simulate the long running process in the backend
    //In a real case with backend this useEffect would not be necessary
    //as the process would be happening in the backend.
    useEffect(() => {
        if (pendingJobs?.length > 0) {
            pendingJobs.forEach((job) => {
                // Simulate a long-running process
                setTimeout(async () => {
                    // Generate dummy result data
                    const result = {
                        processedAt: new Date().toISOString(),
                        summary: "Processing completed successfully",
                        details: {
                            totalItems: Math.floor(Math.random() * 1000),
                            processedItems: Math.floor(Math.random() * 1000),
                        }
                    };

                    job.status = JobStatus.COMPLETED;
                    job.result = result;
                    const file = generateCsvData(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1)

                    job.file = new Blob([file], { type: 'text/csv' })
                    await updateJob(job);
                }, 1 * 60 * 1000);
            })
        }

    }, [pendingJobs]);

    useEffect(() => {
        fetchJobs();
    }, [dataset.id]);

    const fetchJobs = async () => {
        const jobs = await getAllJobs(dataset.id);
        setJobs(jobs)
    };

    //This startProcess method is to simulate a call to an endpoint in the api
    //the 'generation' of the job would happen in the backend itself.
    const startProcess = async () => {
        setProcessing(true);
        try {
            const jobId = uuidv4();
            const newJob = {
                id: jobId,
                datasetId: dataset.id,
                status: JobStatus.PROCESSING,
                createdAt: new Date().toISOString(),
                result: {}
            };

            await saveJob(newJob);

            setJobs(prevJobs => [...prevJobs, newJob]);
        } catch (error) {
            console.error('Error starting process:', error);
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        const intervalIds: NodeJS.Timeout[] = [];

        jobs.forEach(job => {
            if (job.status === JobStatus.PROCESSING) {
                const intervalId = setInterval(async () => {
                    try {
                        const data = await getJob(job.id)
                        setJobs(prevJobs =>
                            prevJobs.map(j => j.id === job.id ? { ...j, ...data } : j)
                        );
                        if (data.status === JobStatus.COMPLETED) {
                            clearInterval(intervalId);
                        }
                    } catch (error) {
                        console.error('Error fetching status:', error);
                    }
                }, 5000); // Poll every 5 seconds
                intervalIds.push(intervalId);
            }
        });

        return () => {
            intervalIds.forEach(clearInterval);
        };
    }, [jobs]);

    return (
        <div className="flex flex-col gap-y-4 mt-8 divide-y">
            <div>
                <h2 className="text-2xl font-bold mb-4">{dataset.name}</h2>
                <p>File: {dataset.fileName}</p>
                <p>Created: {new Date(dataset.createdAt).toLocaleString()}</p>
                <div className="flex gap-x-2">
                    <button
                        onClick={startProcess}
                        disabled={processing}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white rounded-md disabled:bg-gray-300 "
                    >
                        {processing ? 'Starting Job...' : 'Start New Job'}
                    </button>
                    <button
                        onClick={() => downloadFile({ file: dataset.file, name: dataset.fileName })}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white rounded-md"
                    >
                        Download File
                    </button>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mt-6">Jobs:</h3>
                {jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(job => <JobDetail key={job.id} job={job} />)}
                {jobs.length === 0 && (
                    <p className="text-center text-gray-500">No jobs have been started.</p>
                )}
            </div>
        </div>
    );
}