interface PaginationOptions {
    page: number
    limit: number
}
interface PaginationResult {
    total: number
    page: number
    limit: number
}


export const getPagination = ({
    page,
    limit,
}: PaginationOptions) => {
    const skip = (page - 1) * limit

    return {
        page,
        limit,
        skip,
    }
}



export const buildPaginationMeta = ({
    total,
    page,
    limit,
}: PaginationResult) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    }
}