module ProcessHealth
  class Calculator
    def self.calculate(matter)
      new(matter).calculate
    end

    def initialize(matter)
      @matter = matter
    end

    def calculate
      last_movement_date = matter.process_movements.maximum(:data_hora)
      days_since = last_movement_date ? (Time.zone.today - last_movement_date.to_date).to_i : nil

      {
        status: status_for(days_since),
        last_movement_date: last_movement_date&.iso8601,
        days_since: days_since
      }
    end

    private

    attr_reader :matter

    def status_for(days_since)
      return :red if days_since.nil?
      return :green if days_since < 30
      return :yellow if days_since <= 60

      :red
    end
  end
end
