# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    configured_origins = ENV.fetch("CORS_ORIGINS", "").split(",").map(&:strip).reject(&:blank?)
    origins(*(['localhost:3000', '127.0.0.1:3000', 'localhost:4000', '127.0.0.1:4000'] + configured_origins))

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
