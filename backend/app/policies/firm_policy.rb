class FirmPolicy < ApplicationPolicy
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
