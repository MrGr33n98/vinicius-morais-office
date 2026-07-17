class Message < ApplicationRecord
  belongs_to :firm
  belongs_to :user

  validates :chat_room_id, presence: true
  validates :content, presence: true
end
