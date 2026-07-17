require 'rails_helper'

RSpec.describe Lead, type: :model do
  it 'allows attaching a document' do
    lead = Lead.new(name: 'Teste Lead', email: 'teste@exemplo.com')

    file = StringIO.new("Conteudo ficticio do documento")
    lead.document.attach(io: file, filename: 'contrato.txt', content_type: 'text/plain')

    expect(lead.document).to be_attached
    expect(lead.save).to be_truthy
    expect(lead.document.download).to eq("Conteudo ficticio do documento")
  end
end
