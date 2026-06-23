export default function success(message: string, data: any, statusCode: number) {
    return {
        success: true,
        message,
        data,
        statusCode,
    }
}