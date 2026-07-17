module Datajud
  class ProcessMapper
    def initialize(raw_json)
      @raw = raw_json.with_indifferent_access
    end

    def attributes
      {
        process_data: {
          datajud_id: raw[:id].to_s,
          raw_json: raw,
          status: "synced"
        },
        matter: {
          court_number: raw[:numeroProcesso],
          court_name: raw.dig(:orgaoJulgador, :nome),
          action_class: raw.dig(:classe, :nome)
        }.compact
      }
    end

    private

    attr_reader :raw
  end
end
