class FirmApiKeyPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.all if user.has_role?(:super_admin)
      return scope.where(firm_id: user.firm_id) if user.has_role?(:firm_admin)

      scope.none
    end
  end

  def index?
    admin_access?
  end

  def show?
    admin_access? && owns_record?
  end

  def create?
    admin_access?
  end

  def update?
    admin_access? && owns_record?
  end

  def destroy?
    user.has_role?(:super_admin) || (user.has_role?(:firm_admin) && owns_record?)
  end

  private

  def admin_access?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin)
  end

  def owns_record?
    user.has_role?(:super_admin) || user.firm_id == record.firm_id
  end
end
