// Bunny Stream video statuses this example cares about.
export const VideoStatusCode = { Created: 0, Finished: 4, Error: 5, UploadFailed: 6 };

export function hasFailed(status) {
  return status === VideoStatusCode.Error || status === VideoStatusCode.UploadFailed;
}
