import { Job } from "../types"

export const JobDetail = ({ job }: { job: Job }) => {
    return (<div key={job.id} className="mt-4 p-4 border rounded-md">
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
    </div>)
}