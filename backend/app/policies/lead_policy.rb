class LeadPolicy < ApplicationPolicy
  def index?
    user.is_a?(User) && (user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:lawyer) || user.has_role?(:paralegal))
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
    user.is_a?(User) && (user.has_role?(:super_admin) || user.has_role?(:firm_admin))
  end

  def contact?
    index?
  end

  class Scope < Scope
    def resolve
      if user.is_a?(User) && (user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:lawyer) || user.has_role?(:paralegal))
        scope.all
      else
        scope.none
      end
    end
  end
end
