class MatterInternalNotePolicy < ApplicationPolicy
  def index?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || user.has_role?(:lawyer)
  end

  def show?
    index?
  end

  def create?
    index?
  end

  def update?
    index? && user.id == record.user_id
  end

  def destroy?
    user.has_role?(:super_admin) || user.has_role?(:firm_admin) || (index? && user.id == record.user_id)
  end
end
