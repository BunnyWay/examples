class ApplicationController < ActionController::Base
  rescue_from BunnyStream::Error do |error|
    render json: { error: error.message }, status: :bad_gateway
  end
end
