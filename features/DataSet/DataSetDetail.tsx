'use client'
import { saveJob, getJob, getAllJobs, updateJob } from '@/lib/db';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
interface Dataset {
    id: string;
    fileName: string;
    createdAt: string;
}

interface Job {
    id: string;
    datasetId: string;
    status: string;
    createdAt: string;
    result?: any;
}

export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, [dataset.id]);

    const fetchJobs = async () => {
        const jobs = await getAllJobs(dataset.id);
        setJobs(jobs)
        // const response = await fetch(`/api/jobs?datasetId=${dataset.id}`);
        // if (response.ok) {
        //     const fetchedJobs = await response.json();
        //     setJobs(fetchedJobs);
        // }
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

            console.log(newJob)
            await saveJob(newJob);

            // Simulate a long-running process (15 minutes)
            setTimeout(async () => {
                // Generate some dummy result data
                const result = {
                    processedAt: new Date().toISOString(),
                    summary: "Processing completed successfully",
                    details: {
                        totalItems: Math.floor(Math.random() * 1000),
                        processedItems: Math.floor(Math.random() * 1000),
                    }
                };

                // Update the job with the result and mark as completed
                newJob.status = 'completed';
                newJob.result = result;
                await updateJob(newJob);
            }, 1 * 60 * 1000);
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

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{dataset.fileName}</h2>
            <p>Created: {new Date(dataset.createdAt).toLocaleString()}</p>
            <button
                onClick={startProcess}
                disabled={processing}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300"
            >
                {processing ? 'Starting Job...' : 'Start New Job'}
            </button>
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
                            <pre className="bg-gray-100 p-2 rounded-md mt-1">
                                {JSON.stringify(job.result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}