const generateRandomNumber = () => Math.floor(Math.random() * 100);

export const generateCsvData = (rows: number, cols: number) => {
    let csvContent = '';
    for (let i = 0; i < rows; i++) {
        const row = Array.from({ length: cols }, generateRandomNumber);
        csvContent += row.join(',') + '\n';
    }
    return csvContent;
};

export const downloadFile = ({ file, name }: { file: any, name: string }) => {
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