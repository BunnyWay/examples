Rails.application.routes.draw do
  root "home#show"

  namespace :api do
    resources :uploads, only: :create
    resources :videos, only: :show
  end

  # Returns 200 if the app boots, for load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check
end
