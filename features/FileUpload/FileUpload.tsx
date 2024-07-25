'use client'
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDataset } from '../../lib/db';

interface FileUploadProps {
    onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
            file: file
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
            <div className='flex flex-col h-32 w-full gap-y-4 align-center items-center bg-neutral border-dashed rounded border-gray-100 border-2'
            onDrop={(event)=>{
                event.stopPropagation();
                event.preventDefault();
                const dt = event.dataTransfer;
                const files = dt.files;
                if (files.length>0){
                    setFile(files[0])
                    if(inputRef.current){
                        const singleFileDt = new DataTransfer();
                        singleFileDt.items.add(files[0])
                        inputRef.current.files = singleFileDt.files
                    }
                }

            }}
            onDragOver={(event)=>{event.stopPropagation();event.preventDefault();}}
            onDragEnter={(event)=>{event.stopPropagation();event.preventDefault();}}
            onDragLeave={(event)=>{event.stopPropagation();event.preventDefault();}}
            >
                <span className='pt-4 mx-auto font-semibold'>Drag and drop your file or browse</span>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="mx-auto block text-sm text-gray-100
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-500 hover:file:text-white
                            hover:file:cursor-pointer"
                            accept='.csv'
                            ref={inputRef}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition duration-300"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}