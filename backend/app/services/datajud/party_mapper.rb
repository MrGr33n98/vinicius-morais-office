module Datajud
  class PartyMapper
    def initialize(raw_json)
      @raw = raw_json.with_indifferent_access
    end

    def attributes
      {
        participation_type: raw[:tipoParticipacao] || raw[:participation_type],
        name_masked: raw[:nome] || raw[:name],
        document_masked: raw[:documento] || raw[:document]
      }
    end

    private

    attr_reader :raw
  end
end
