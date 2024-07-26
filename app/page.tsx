'use client'
import { DataSetListItem } from "@/features/DataSet/components/DataSetListItem";
import { Dataset } from "@/features/DataSet/types";
import FileUpload from "@/features/FileUpload/FileUpload";
import { getAllDatasets } from "@/lib/db";
import { useEffect, useState } from "react";

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

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
        <h1 className="text-3xl font-bold text-center mb-8">Dataset manager</h1>
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
              {datasets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((dataset: Dataset) => <DataSetListItem dataset={dataset} />)}
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
