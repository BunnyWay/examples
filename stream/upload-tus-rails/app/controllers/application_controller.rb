class ApplicationController < ActionController::Base
  rescue_from BunnyStream::Error do |error|
    render json: { error: error.message }, status: error.status
  end
end
