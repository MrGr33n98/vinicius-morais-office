class MatterPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.has_role?(:super_admin)
        scope.all
      else
        scope.where(firm_id: user.firm_id)
      end
    end
  end

  def index?
    true
  end

  def show?
    user.has_role?(:super_admin) || user.firm_id == record.firm_id
  end

  def create?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:lawyer) || user.has_role?(:paralegal)
  end

  def update?
    create?
  end

  def destroy?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin)
  end
end
