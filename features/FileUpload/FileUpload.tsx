import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDataset } from '../../lib/db';

interface FileUploadProps {
    onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const datasetId = uuidv4();
        const dataset = {
            id: datasetId,
            fileName: file.name,
            createdAt: new Date().toISOString(),
        };

        try {
            await saveDataset(dataset);
            setFile(null);
            onUploadComplete();
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-4">
            <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition duration-300"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}