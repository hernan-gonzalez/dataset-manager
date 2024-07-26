import Link from "next/link"
import { Dataset } from "../types"

export const DataSetListItem = ({ dataset }: { dataset: Dataset }) => {
    return (
        <div key={dataset.id} className="bg-white text-gray-600 shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{dataset.name}</h3>
            <p className="text-sm  mb-4">
                Created: {new Date(dataset.createdAt).toLocaleString()}
            </p>
            <Link href={`/dataset/${dataset.id}`} prefetch={false} >
                <span className="inline-block bg-blue-500 hover:bg-blue-600 transition duration-300 text-white px-4 py-2 rounded-md ">
                    View Details
                </span>
            </Link>
        </div>
    )
}