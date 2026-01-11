export const formatResponse = (data: any) => {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };
};
