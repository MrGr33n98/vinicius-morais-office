module Ai
  class MovementTranslationJob < ApplicationJob
    queue_as :default

    discard_on ActiveRecord::RecordNotFound

    def perform(movement_id)
      movement = ProcessMovement.find(movement_id)
      Current.firm = movement.firm

      Ai::MovementTranslator.new.translate(movement)
    ensure
      Current.reset
    end
  end
end
