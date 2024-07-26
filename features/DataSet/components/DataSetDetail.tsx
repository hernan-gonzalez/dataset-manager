'use client'
import { saveJob, getJob, getAllJobs, updateJob } from '@/lib/db';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dataset } from '../types';
import { Job } from '../../Job/types';
import { Spinner } from '@/components/Spinner';

export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [processing, setProcessing] = useState(false);

    const pendingJobs = jobs.filter(job => job.status === "processing");

    const generateRandomNumber = () => Math.floor(Math.random() * 100);

    const generateCsvData = (rows: number, cols: number) => {
        let csvContent = '';
        for (let i = 0; i < rows; i++) {
            const row = Array.from({ length: cols }, generateRandomNumber);
            csvContent += row.join(',') + '\n';
        }
        return csvContent;
    };

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

                    const file = generateCsvData(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1)


                    // Update the job with the result and mark as completed
                    job.status = 'completed';
                    job.result = result;
                    job.file = new Blob([file], { type: 'text/csv' })
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

    const downloadFile = ({ file, name }: { file: any, name: string }) => {
        if (file) {
            const url = URL.createObjectURL(new Blob([file]));
            const link = document.createElement('a')
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click()
            URL.revokeObjectURL(url);
        }
    }

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
                {jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(job => (
                    <div key={job.id} className="mt-4 p-4 border rounded-md">
                        <p>Job ID: {job.id}</p>
                        <p>Status: {job.status}</p>
                        <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
                        {job.status === 'processing' && (
                            <Spinner title={'This may take up to 15 minutes'} />
                        )}
                        {job.status === 'completed' && job.result && (
                            <div className="mt-2">
                                <h4 className="font-semibold">Result:</h4>
                                <pre className="bg-gray-100 text-black p-2 rounded-md mt-1 overflow-x-auto">
                                    {JSON.stringify(job.result, null, 2)}
                                </pre>
                                {job.file && <button className='mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white rounded-md'
                                    onClick={() => downloadFile({ file: job.file, name: `result-data-${job.id}}.csv` })}>
                                    Download Result Data
                                </button>}
                            </div>
                        )}
                    </div>
                ))}
                {jobs.length === 0 && (
                    <p className="text-center text-gray-500">No jobs have been started.</p>
                )}
            </div>

        </div>
    );
}