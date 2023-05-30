import cloudinary, { UploadApiResponse, UploadApiErrorResponse, UploadApiOptions } from 'cloudinary'

export function uploads(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File is required for the upload operation.'))
      return
    }

    const options: UploadApiOptions = {
      public_id,
      overwrite,
      invalidate
    }

    cloudinary.v2.uploader.upload(
      file,
      options,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
  })
}
