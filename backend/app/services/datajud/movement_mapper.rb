module Datajud
  class MovementMapper
    def initialize(raw_json)
      @raw = raw_json.with_indifferent_access
    end

    def attributes
      {
        source_movement_id: raw[:id].to_s,
        nome: raw[:nome] || raw[:descricao],
        data_hora: parse_datetime(raw[:dataHora]),
        complementos_json: raw[:complementosTabelados] || [],
        raw_json: raw
      }
    end

    private

    attr_reader :raw

    def parse_datetime(value)
      return if value.blank?

      Time.zone.parse(value.to_s)
    rescue ArgumentError
      nil
    end
  end
end
