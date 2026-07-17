module Datajud
  class Client
    BASE_URL = "https://datajud-wiki.cnj.jus.br/api/public/v1".freeze
    MAX_RETRIES = 3
    MIN_INTERVAL_SECONDS = 60.0 / 500

    @mutex = Mutex.new
    @last_request_at_by_firm = {}

    class << self
      attr_reader :mutex, :last_request_at_by_firm
    end

    def initialize(firm:)
      @firm = firm
      @api_key = firm.firm_api_keys.where(active: true).order(created_at: :desc).first
      unless @api_key
        raise ApiError.new(
          "Firm #{firm.id} does not have an active DataJud API key",
          status: :missing_api_key
        )
      end
    end

    def search_process(numero)
      get("/processes", numeroProcesso: numero, page: 0, size: 10)
    end

    def get_process(datajud_id)
      get("/processes/#{datajud_id}")
    end

    def get_movements(datajud_id, page:)
      get("/processes/#{datajud_id}/movements", page: page, size: 100)
    end

    def get_parties(datajud_id, page:)
      get("/processes/#{datajud_id}/parties", page: page, size: 100)
    end

    private

    attr_reader :firm, :api_key

    def connection
      @connection ||= Faraday.new(url: BASE_URL) do |faraday|
        faraday.headers["Authorization"] = "APIKey #{api_key.key}"
        faraday.headers["Accept"] = "application/json"
        faraday.headers["Content-Type"] = "application/json"
        faraday.options.timeout = 20
        faraday.options.open_timeout = 5
      end
    end

    def get(path, params = {})
      with_retries(path) do
        throttle!
        Rails.logger.info("[DataJud] firm_id=#{firm.id} GET #{path} params=#{params.compact}")
        response = connection.get(path, params.compact)
        parse_response!(response)
      end
    end

    def with_retries(path)
      attempts = 0

      loop do
        attempts += 1
        begin
          return yield
        rescue Faraday::Error => error
          raise error if attempts >= MAX_RETRIES

          sleep_before_retry(path, attempts, error)
        rescue ApiError => error
          raise error unless retryable_status?(error.status)
          raise error if attempts >= MAX_RETRIES

          sleep_before_retry(path, attempts, error)
        end
      end
    end

    def retryable_status?(status)
      status.to_i == 429 || status.to_i >= 500
    end

    def sleep_before_retry(path, attempts, error)
      wait = 2**(attempts - 1)
      Rails.logger.warn("[DataJud] retry=#{attempts} firm_id=#{firm.id} path=#{path} error=#{error.message}")
      sleep(wait)
    end

    def throttle!
      self.class.mutex.synchronize do
        last_request_at = self.class.last_request_at_by_firm[firm.id]
        if last_request_at
          elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - last_request_at
          sleep(MIN_INTERVAL_SECONDS - elapsed) if elapsed < MIN_INTERVAL_SECONDS
        end

        self.class.last_request_at_by_firm[firm.id] = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end
    end

    def parse_response!(response)
      body = response.body.to_s
      unless response.success?
        raise ApiError.new(
          "DataJud request failed with status #{response.status}",
          status: response.status,
          body: body
        )
      end

      body.present? ? JSON.parse(body) : {}
    rescue JSON::ParserError => error
      raise ApiError.new("DataJud returned invalid JSON: #{error.message}", status: response.status, body: body)
    end
  end
end
