class BannerPolicy < ApplicationPolicy
  def index?
    admin_user?
  end

  def show?
    admin_user?
  end

  def create?
    admin_user?
  end

  def update?
    admin_user?
  end

  def destroy?
    super_admin?
  end

  class Scope < Scope
    def resolve
      if user.is_a?(User) && (user.has_role?(:super_admin) || user.has_role?(:firm_admin))
        scope.all
      else
        scope.none
      end
    end
  end

  private

  def admin_user?
    user.is_a?(User) && (super_admin? || user.has_role?(:firm_admin))
  end

  def super_admin?
    user.is_a?(User) && user.has_role?(:super_admin)
  end
end
