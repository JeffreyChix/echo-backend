const formatFileSize = (sizeBytes: number) => {
    if (sizeBytes === 0) {
        return "0 B";
    }

    const SIZE_NAME = [
        "B",
        "KB",
        "MB",
        "GB",
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
    ];
    const i = Math.floor(Math.log(sizeBytes) / Math.log(1024));
    const p = Math.pow(1024, i);
    const s = Math.round((sizeBytes / p) * 100) / 100;

    return `${s} ${SIZE_NAME[i]}`;
};

export { formatFileSize };
