class MatterEventPolicy < ApplicationPolicy
  def index?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:lawyer) || user.has_role?(:paralegal)
  end

  def show?
    index?
  end

  def create?
    index?
  end

  def update?
    index?
  end

  def destroy?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin)
  end
end
