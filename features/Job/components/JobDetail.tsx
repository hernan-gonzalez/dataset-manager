import { Spinner } from "@/components/Spinner"
import { downloadFile } from "@/utils/utils"
import { Job, JobStatus } from "../types"

export const JobDetail = ({ job }: { job: Job }) => {
    return (<div key={job.id} className="mt-4 p-4 border rounded-md">
        <p>Job ID: {job.id}</p>
        <p>Status: {job.status}</p>
        <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
        {job.status === JobStatus.PROCESSING && (
            <Spinner title={'This may take up to 15 minutes'} />
        )}
        {job.status === JobStatus.COMPLETED && job.result && (
            <div className="mt-2">
                <h4 className="font-semibold">Result:</h4>
                <pre className="bg-gray-100 text-black p-2 rounded-md mt-1 overflow-x-auto">
                    {JSON.stringify(job.result, null, 2)}
                </pre>
                {job.file && <button className='mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 text-white rounded-md'
                    onClick={() => downloadFile({ file: job.file, name: `result-data-${job.id}.csv` })}>
                    Download Result Data
                </button>}
            </div>
        )}
    </div>)
}