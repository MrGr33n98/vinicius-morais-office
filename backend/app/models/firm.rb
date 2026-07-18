class Firm < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :clients, dependent: :destroy
  has_many :matters, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :meetings, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :firm_api_keys, dependent: :destroy
  has_many :process_data, class_name: "ProcessDatum", dependent: :destroy
  has_many :process_movements, dependent: :destroy
  has_many :process_parties, dependent: :destroy
  has_many :process_sync_runs, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true
end
