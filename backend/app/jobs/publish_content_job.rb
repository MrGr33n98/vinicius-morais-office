require 'net/http'
require 'uri'

class PublishContentJob
  include Sidekiq::Job

  def perform(resource_type, resource_id)
    resource = resource_type.constantize.find_by(id: resource_id)
    return unless resource
    return if resource.respond_to?(:status) && resource.status != 'published'

    # Monta a URL base do site Next.js (em produção virá de variável de ambiente)
    next_site_url = ENV.fetch('NEXT_SITE_URL', 'http://localhost:4000')
    slug = resource.respond_to?(:slug) ? resource.slug : ''
    
    # Define o path de revalidação com base no tipo de recurso
    path = if resource_type == 'Article'
             "/blog/#{slug}"
           elsif resource_type == 'Service'
             "/atuacao/#{slug}"
           else
             "/#{slug}"
           end

    # 1. Dispara o Webhook de revalidação on-demand (ISR) no Next.js
    revalidate_url = URI.parse("#{next_site_url}/api/revalidate?path=#{path}&token=#{ENV['REVALIDATION_TOKEN']}")
    begin
      response = Net::HTTP.get_response(revalidate_url)
      Rails.logger.info "Revalidação ISR Next.js para #{path}: #{response.code}"
    rescue => e
      Rails.logger.error "Falha na revalidação ISR Next.js: #{e.message}"
    end

    # 2. Notifica o IndexNow API (Bing/Yandex) para indexação instantânea
    index_now_url = URI.parse("https://api.indexnow.org/IndexNow")
    payload = {
      host: ENV.fetch('SITE_HOST', 'viniciusmorais.adv.br'),
      key: ENV.fetch('INDEXNOW_KEY', 'default_key'),
      keyLocation: "https://#{ENV.fetch('SITE_HOST', 'viniciusmorais.adv.br')}/#{ENV.fetch('INDEXNOW_KEY', 'default_key')}.txt",
      urlList: ["https://#{ENV.fetch('SITE_HOST', 'viniciusmorais.adv.br')}#{path}"]
    }

    begin
      http = Net::HTTP.new(index_now_url.host, index_now_url.port)
      http.use_ssl = true
      request = Net::HTTP::Post.new(index_now_url.request_uri, { 'Content-Type' => 'application/json' })
      request.body = payload.to_json
      response = http.request(request)
      Rails.logger.info "Notificação IndexNow para #{path}: #{response.code}"
    rescue => e
      Rails.logger.error "Falha na notificação IndexNow: #{e.message}"
    end
  end
end
