class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.has_role?(:super_admin)
        scope.all
      else
        scope.joins(:client).where(clients: { firm_id: user.firm_id })
      end
    end
  end

  def index?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:finance)
  end

  def show?
    user.has_role?(:super_admin) || (user.firm_id == record.client.firm_id && (user.has_role?(:firm_admin) || user.has_role?(:finance)))
  end

  def create?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:finance)
  end

  def update?
    create?
  end

  def destroy?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin)
  end
end
