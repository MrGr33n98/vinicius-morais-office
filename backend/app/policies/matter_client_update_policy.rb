class MatterClientUpdatePolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
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
