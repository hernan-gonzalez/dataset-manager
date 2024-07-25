'use client'
import { Dataset } from "@/features/DataSet/types";
import FileUpload from "@/features/FileUpload/FileUpload";
import { getAllDatasets } from "@/lib/db";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [datasets, setDatasets] = useState<any>([]);

  useEffect(() => {
    const fetchDatasets = async () => {
      const data = await getAllDatasets();
      setDatasets(data);
    };
    fetchDatasets();
  }, []);


  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">File Processor App</h1>

        <div className="divide-y">
          <div className="max-w-md mx-auto mb-12">
            <FileUpload onUploadComplete={() => {
              // Refresh the dataset list after a new upload
              getAllDatasets().then(setDatasets);
            }} />
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Datasets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset:Dataset) => (
                <div key={dataset.id} className="bg-white text-gray-600 shadow-md rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{dataset.fileName}</h3>
                  <p className="text-sm  mb-4">
                    Created: {new Date(dataset.createdAt).toLocaleString()}
                  </p>
                  <Link href={`/dataset/${dataset.id}`} prefetch={false} >
                    <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                      View Details
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            {datasets.length === 0 && (
              <p className="text-center text-gray-500">No datasets available. Upload a file to get started.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
