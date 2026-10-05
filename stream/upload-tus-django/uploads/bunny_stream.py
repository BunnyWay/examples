"""Server-only Bunny Stream API calls and signing."""

import hashlib
import json
import os
import time
from typing import Any, TypedDict
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

# Long enough for a slow upload to finish. Bunny checks the expiry on every TUS request.
SIGNATURE_TTL_SECONDS = 24 * 60 * 60

# Bunny Stream's status for a video that is still waiting for its file.
STATUS_CREATED = 0


class BunnyStreamError(Exception):
    pass


class UploadCredentials(TypedDict):
    videoId: str
    libraryId: str
    expirationTime: int
    signature: str


class VideoStatus(TypedDict):
    status: int
    encodeProgress: int
    embedUrl: str


def is_configured() -> bool:
    return bool(os.environ.get("BUNNY_STREAM_LIBRARY_ID") and os.environ.get("BUNNY_STREAM_API_KEY"))


def _config() -> tuple[str, str]:
    library_id = os.environ.get("BUNNY_STREAM_LIBRARY_ID")
    api_key = os.environ.get("BUNNY_STREAM_API_KEY")
    if not library_id or not api_key:
        raise BunnyStreamError("Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in .env")

    return library_id, api_key


def _stream(path: str, *, method: str = "GET", body: dict[str, Any] | None = None) -> dict[str, Any]:
    library_id, api_key = _config()
    request = Request(
        f"https://video.bunnycdn.com/library/{library_id}/videos{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"AccessKey": api_key, "Accept": "application/json", "Content-Type": "application/json"},
    )
    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as error:
        raise BunnyStreamError(f"Bunny Stream returned {error.code}: {error.read().decode()}") from error
    except URLError as error:
        raise BunnyStreamError(f"Could not reach Bunny Stream: {error.reason}") from error


def get_video(video_id: str) -> VideoStatus:
    library_id, _ = _config()
    video = _stream(f"/{quote(video_id, safe='')}")

    return {
        "status": video["status"],
        "encodeProgress": video["encodeProgress"],
        "embedUrl": f"https://player.mediadelivery.net/embed/{library_id}/{video_id}",
    }


def create_video(title: str) -> str:
    video = _stream("", method="POST", body={"title": title})

    return video["guid"]


def sign_upload(video_id: str) -> UploadCredentials:
    library_id, api_key = _config()
    expiration_time = int(time.time()) + SIGNATURE_TTL_SECONDS
    signature = hashlib.sha256(f"{library_id}{api_key}{expiration_time}{video_id}".encode()).hexdigest()

    return {
        "videoId": video_id,
        "libraryId": library_id,
        "expirationTime": expiration_time,
        "signature": signature,
    }
