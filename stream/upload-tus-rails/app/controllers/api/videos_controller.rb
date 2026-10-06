class Api::VideosController < ApplicationController
  def show
    # Require a signed-in user here, and check that they own this video ID. The route is public.
    render json: BunnyStream.video(params[:id])
  end
end
