class User < ApplicationRecord
  has_paper_trail
  # Include default devise modules. Others available are:
  # :confirmable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :trackable, :lockable

  belongs_to :firm, optional: true

  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_many :permissions, through: :roles
  has_many :account_memberships, dependent: :destroy
  has_many :accounts, through: :account_memberships
  has_many :assigned_tasks, class_name: 'Task', foreign_key: 'assignee_id', dependent: :destroy
  has_many :meetings, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_one :client_portal_profile, dependent: :destroy

  validates :name, presence: true

  def has_role?(role_name)
    roles.exists?(name: role_name.to_s)
  end

  def role?(role_name)
    has_role?(role_name)
  end


  def has_permission?(permission_name)
    permissions.exists?(name: permission_name.to_s)
  end
end
