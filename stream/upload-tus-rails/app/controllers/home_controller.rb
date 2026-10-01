class HomeController < ApplicationController
  def show
    @configured = BunnyStream.configured?
  end
end
