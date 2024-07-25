'use client'
import { useState, useEffect } from 'react';
import DatasetDetail from '../../../features/DataSet/DataSetDetail';
import { getDataset } from '../../../lib/db';

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
        <div className="container mx-auto px-4 py-8">
            <DatasetDetail dataset={dataset} />
        </div>
    );
}