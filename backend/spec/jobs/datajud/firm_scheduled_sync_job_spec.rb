require "rails_helper"

RSpec.describe Datajud::FirmScheduledSyncJob, type: :job do
  include ActiveJob::TestHelper

  let!(:firm) { create(:firm) }
  let!(:client) { create(:client, firm: firm) }
  let!(:active_with_cnj) { create(:matter, firm: firm, client: client, status: "Active", court_number: "1234567-89.2026.8.11.0001") }
  let!(:archived_with_cnj) { create(:matter, firm: firm, client: client, status: "Archived", court_number: "7654321-00.2026.8.11.0001") }
  let!(:other_firm_matter) { create(:matter, status: "Active", court_number: "2222222-11.2026.8.11.0001") }

  around do |example|
    original_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
    clear_performed_jobs
    example.run
    clear_enqueued_jobs
    clear_performed_jobs
    ActiveJob::Base.queue_adapter = original_adapter
  end

  it "enqueues sync only for active matters of the selected firm" do
    expect do
      described_class.perform_now(firm.id)
    end.to have_enqueued_job(Datajud::MatterSyncJob).with(active_with_cnj.id).exactly(:once)

    enqueued_arguments = enqueued_jobs.map { |job| job[:args] }
    expect(enqueued_arguments).not_to include([archived_with_cnj.id])
    expect(enqueued_arguments).not_to include([other_firm_matter.id])
  end
end
