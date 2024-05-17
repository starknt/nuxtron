export type Callback<E = Error | null | undefined> = (error?: E) => void
export interface HeadersObject { [key: string]: string | string[] | undefined }
export type BufferEncoding = any // TODO
