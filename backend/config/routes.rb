Rails.application.routes.draw do
  devise_for :users, ActiveAdmin::Devise.config rescue devise_for :users
  ActiveAdmin.routes(self)

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :articles, only: [:index, :show], param: :slug
      resources :banners, only: [:index]
      resources :glossary_terms, only: [:index, :show], param: :slug
      resources :opportunities, only: [:create]
      post "auth/login", to: "auth#login"
      get "auth/me", to: "auth#me"
      get "portal", to: "portal#show"
      get "portal_profile", to: "portal_profile#show"
      patch "portal_profile", to: "portal_profile#update"
      resources :portal_messages, only: [:create]
      namespace :portal do
        resources :matters, only: [] do
          member do
            get :timeline
            get :health
          end
        end
      end
      resources :matters, only: [] do
        resources :transactions, only: [:index], module: :matters
      end
    end
  end
end
