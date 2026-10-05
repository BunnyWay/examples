import json

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST

from . import bunny_stream


@require_GET
def index(request: HttpRequest) -> HttpResponse:
    # Read the environment per request, so the page reflects the current .env.
    return render(request, "uploads/index.html", {"configured": bunny_stream.is_configured()})


# Creates a video and signs a TUS upload for it. Pass the videoId of an
# unfinished upload to re-sign it, so the browser can resume.
@require_POST
def create_upload(request: HttpRequest) -> JsonResponse:
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        payload = None
    if not isinstance(payload, dict):
        return JsonResponse({"error": "Send a JSON body"}, status=400)

    title = payload.get("title")
    video_id = payload.get("videoId")
    if not isinstance(title, str) or not title.strip():
        return JsonResponse({"error": "title is required"}, status=400)

    try:
        if isinstance(video_id, str) and _can_resume(video_id):
            return JsonResponse(bunny_stream.sign_upload(video_id))

        return JsonResponse(bunny_stream.sign_upload(bunny_stream.create_video(title)))
    except bunny_stream.BunnyStreamError as error:
        return JsonResponse({"error": str(error)}, status=502)


@require_GET
def video_status(request: HttpRequest, video_id: str) -> JsonResponse:
    try:
        return JsonResponse(bunny_stream.get_video(video_id))
    except bunny_stream.BunnyStreamError as error:
        return JsonResponse({"error": str(error)}, status=502)


# Only re-sign videos that are still waiting for their file.
def _can_resume(video_id: str) -> bool:
    try:
        return bunny_stream.get_video(video_id)["status"] == bunny_stream.STATUS_CREATED
    except bunny_stream.BunnyStreamError:
        return False
