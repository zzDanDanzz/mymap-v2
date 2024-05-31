export interface ODataResponse<T> {
    'odata.count': number,
    value: T[]
}