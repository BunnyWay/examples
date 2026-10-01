class Api::VideosController < ApplicationController
  def show
    render json: BunnyStream.video(params[:id])
  end
end
