module Datajud
  class FirmScheduledSyncJob < ApplicationJob
    queue_as :default

    discard_on ActiveRecord::RecordNotFound

    def perform(firm_id)
      firm = Firm.find(firm_id)
      Current.firm = firm

      matters = firm.matters.joins(:process_datum).where(status: "Active").order(:id)
      matters.each_with_index do |matter, index|
        Datajud::MatterSyncJob.set(wait: index * 2.seconds).perform_later(matter.id)
      end
    ensure
      Current.reset
    end
  end
end
