require "net/http"

# Bunny Stream API calls and upload signing. Server-side only, because it holds the API key.
module BunnyStream
  extend self

  class Error < StandardError
    attr_reader :status

    def initialize(message, status = :bad_gateway)
      super(message)
      @status = status
    end
  end

  # The status of a video that is still waiting for its file.
  CREATED = 0

  # Long enough for a slow upload to finish. Bunny checks the expiry on every TUS request.
  SIGNATURE_TTL = 24.hours

  def configured?
    ENV["BUNNY_STREAM_LIBRARY_ID"].present? && ENV["BUNNY_STREAM_API_KEY"].present?
  end

  def video(video_id)
    library_id, = config
    video = stream(Net::HTTP::Get, "/#{ERB::Util.url_encode(video_id)}")

    {
      status: video["status"],
      encodeProgress: video["encodeProgress"],
      embedUrl: "https://player.mediadelivery.net/embed/#{library_id}/#{video_id}"
    }
  end

  def create_video(title)
    stream(Net::HTTP::Post, "", { title: }).fetch("guid")
  end

  def sign_upload(video_id)
    library_id, api_key = config
    expiration_time = SIGNATURE_TTL.from_now.to_i
    signature = Digest::SHA256.hexdigest("#{library_id}#{api_key}#{expiration_time}#{video_id}")

    { videoId: video_id, libraryId: library_id, expirationTime: expiration_time, signature: }
  end

  private

  def config
    library_id, api_key = ENV.values_at("BUNNY_STREAM_LIBRARY_ID", "BUNNY_STREAM_API_KEY")
    if library_id.blank? || api_key.blank?
      raise Error, "Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in .env"
    end

    [ library_id, api_key ]
  end

  def stream(verb, path, body = nil)
    library_id, api_key = config
    uri = URI("https://video.bunnycdn.com/library/#{library_id}/videos#{path}")
    request = verb.new(uri, "AccessKey" => api_key, "Accept" => "application/json", "Content-Type" => "application/json")
    request.body = body.to_json if body

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(request) }
    unless response.is_a?(Net::HTTPSuccess)
      status = response.is_a?(Net::HTTPNotFound) ? :not_found : :bad_gateway
      raise Error.new("Bunny Stream returned #{response.code}: #{response.body}", status)
    end

    JSON.parse(response.body)
  rescue SocketError, SystemCallError, Timeout::Error, OpenSSL::SSL::SSLError => error
    raise Error, "Could not reach Bunny Stream: #{error.message}"
  end
end
