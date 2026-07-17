module Ai
  class MovementTranslator
    MODEL = "gpt-4o-mini".freeze
    PROMPT_VERSION = "datajud-movement-plain-pt-br-v1".freeze
    SYSTEM_PROMPT = "Você é um assistente jurídico que traduz andamentos processuais para português simples e amigável, sem perder informações importantes. Retorne apenas o texto traduzido.".freeze

    def translate(movement)
      cached = movement.process_movement_translations.find_by(prompt_version: PROMPT_VERSION, model: MODEL)
      if cached
        movement.update!(simplified_text: cached.plain_text, translated: true) unless movement.translated?
        return cached.plain_text
      end

      return unless api_key_configured?

      plain_text = request_translation(movement)
      return if plain_text.blank?

      movement.process_movement_translations.create!(
        plain_text: plain_text,
        prompt_version: PROMPT_VERSION,
        model: MODEL
      )
      movement.update!(simplified_text: plain_text, translated: true)
      plain_text
    rescue StandardError => error
      Rails.logger.error("[OpenAI] movement_id=#{movement.id} translation_failed=#{error.class}: #{error.message}")
      nil
    end

    private

    def api_key_configured?
      ENV["OPENAI_API_KEY"].present?
    end

    def client
      @client ||= OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
    end

    def request_translation(movement)
      response = client.chat(
        parameters: {
          model: MODEL,
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: user_prompt(movement) }
          ]
        }
      )

      response.dig("choices", 0, "message", "content").to_s.strip
    end

    def user_prompt(movement)
      <<~PROMPT
        Andamento: #{movement.nome}

        Complementos:
        #{formatted_complements(movement)}
      PROMPT
    end

    def formatted_complements(movement)
      Array(movement.complementos_json).map do |complement|
        item = complement.with_indifferent_access
        [item[:nome], item[:descricao], item[:valor]].compact_blank.join(" - ")
      end.compact_blank.join("\n").presence || "Sem complementos tabelados."
    end
  end
end
