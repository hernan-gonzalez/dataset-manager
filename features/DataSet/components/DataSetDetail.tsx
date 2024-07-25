'use client'
import { saveJob, getJob, getAllJobs, updateJob } from '@/lib/db';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dataset } from '../types';
import { Job } from '../../Job/types';

export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [processing, setProcessing] = useState(false);

    const pendingJobs = jobs.filter(job => job.status === "processing");

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

                    // Update the job with the result and mark as completed
                    job.status = 'completed';
                    job.result = result;
                    await updateJob(job);
                }, 1 * 60 * 1000);
            })
        }

    }, [pendingJobs])
    useEffect(() => {
        fetchJobs();
    }, [dataset.id]);

    const fetchJobs = async () => {
        const jobs = await getAllJobs(dataset.id);
        setJobs(jobs)
    };

    const startProcess = async () => {
        setProcessing(true);
        try {
            const jobId = uuidv4();
            const newJob = {
                id: jobId,
                datasetId: dataset.id,
                status: 'processing',
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
            if (job.status === 'processing') {
                const intervalId = setInterval(async () => {
                    try {

                        const data = await getJob(job.id)
                        setJobs(prevJobs =>
                            prevJobs.map(j => j.id === job.id ? { ...j, ...data } : j)
                        );
                        if (data.status === 'completed') {
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

    const downloadFile = () => {
        if (dataset.file) {
            const url = URL.createObjectURL(new Blob([dataset.file]));
            const link = document.createElement('a')
            link.href = url;
            link.download = dataset.fileName;
            document.body.appendChild(link);
            link.click()
            URL.revokeObjectURL(url);

        }
    }

    return (
        <div className="flex flex-col gap-y-4 mt-8 divide-y">
            <div>
                <h2 className="text-2xl font-bold mb-4">{dataset.fileName}</h2>
                <p>Created: {new Date(dataset.createdAt).toLocaleString()}</p>
                <div className="flex gap-x-2">
                    <button
                        onClick={startProcess}
                        disabled={processing}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300"
                    >
                        {processing ? 'Starting Job...' : 'Start New Job'}
                    </button>
                    <button
                        onClick={downloadFile}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300"
                    >
                        Download File
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mt-6">Jobs:</h3>
                {jobs.map(job => (
                    <div key={job.id} className="mt-4 p-4 border rounded-md">
                        <p>Job ID: {job.id}</p>
                        <p>Status: {job.status}</p>
                        <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
                        {job.status === 'processing' && (
                            <p className="text-blue-500">Processing... This may take up to 15 minutes.</p>
                        )}
                        {job.status === 'completed' && job.result && (
                            <div className="mt-2">
                                <h4 className="font-semibold">Result:</h4>
                                <pre className="bg-gray-100 text-black p-2 rounded-md mt-1">
                                    {JSON.stringify(job.result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}