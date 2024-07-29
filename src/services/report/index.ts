const reportService = {
    async newReport() {
        
        return [];
    },
};

type ReportServiceMethods = keyof typeof reportService;

export { reportService, ReportServiceMethods };
