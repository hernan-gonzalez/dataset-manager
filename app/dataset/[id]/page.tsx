'use client'
import { useState, useEffect } from 'react';
import DatasetDetail from '../../../features/DataSet/components/DataSetDetail';
import { getDataset } from '../../../lib/db';
import Link from 'next/link';

export default function DatasetPage({ params }: { params: { id: string } }) {
    const [dataset, setDataset] = useState(null);

    useEffect(() => {
        if (params.id) {
            const fetchDataset = async () => {
                const data = await getDataset(params.id as string);
                console.log(data)
                setDataset(data);
            };
            fetchDataset();
        }
    }, [params.id]);

    if (!dataset) return <div>Loading...</div>;

    return (
        <div className="container min-h-screen mx-auto px-4 py-8">
            <Link href={'/'} prefetch={false} >
                <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                    Home
                </span>
            </Link>
            <DatasetDetail dataset={dataset} />
        </div>
    );
}