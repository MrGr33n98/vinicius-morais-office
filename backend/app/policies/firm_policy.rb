class FirmPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.is_a?(User) && user.has_role?(:super_admin)
        scope.all
      elsif user.is_a?(User) && user.has_role?(:firm_admin)
        scope.where(id: user.firm_id)
      else
        scope.none
      end
    end
  end

  def index?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin)
  end

  def show?
    user.has_role?(:super_admin) || (user.has_role?(:firm_admin) && user.firm_id == record.id)
  end

  def update?
    user.has_role?(:super_admin) || (user.has_role?(:firm_admin) && user.firm_id == record.id)
  end

  def create?
    user.has_role?(:super_admin)
  end

  def destroy?
    user.has_role?(:super_admin)
  end
end
