# Creates a video and signs a TUS upload for it. Pass the videoId of an
# unfinished upload to re-sign it, so the browser can resume.
class Api::UploadsController < ApplicationController
  def create
    title, video_id = params.values_at(:title, :videoId)
    unless title.is_a?(String) && title.present?
      return render json: { error: "title is required" }, status: :bad_request
    end

    video_id = BunnyStream.create_video(title) unless resumable?(video_id)
    render json: BunnyStream.sign_upload(video_id)
  end

  private

  # Only re-sign videos that are still waiting for their file.
  def resumable?(video_id)
    video_id.is_a?(String) && BunnyStream.video(video_id)[:status] == BunnyStream::CREATED
  rescue BunnyStream::Error
    false
  end
end
