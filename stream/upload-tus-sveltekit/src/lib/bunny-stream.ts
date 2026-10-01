// Shared by the server routes and the components, so nothing secret belongs here.

// Bunny Stream video statuses this example cares about.
export const VideoStatusCode = { Created: 0, Finished: 4, Error: 5, UploadFailed: 6 } as const;

export type UploadCredentials = {
	videoId: string;
	libraryId: string;
	expirationTime: number;
	signature: string;
};

export type VideoStatus = {
	status: number;
	encodeProgress: number;
	embedUrl: string;
};

export function hasFailed(status: number): boolean {
	return status === VideoStatusCode.Error || status === VideoStatusCode.UploadFailed;
}
