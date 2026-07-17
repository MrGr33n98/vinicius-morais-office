class ProcessParty < ApplicationRecord
  belongs_to :matter
  belongs_to :firm
end
