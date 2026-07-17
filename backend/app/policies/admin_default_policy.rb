# frozen_string_literal: true

# Default policy used by ActiveAdmin when Pundit cannot resolve
# a model-specific policy. Allows admin users to see menu items
# and index pages; denies everything for non-admins.
class AdminDefaultPolicy < ApplicationPolicy
  def index?
    admin_user?
  end

  def show?
    admin_user?
  end

  def read?
    admin_user?
  end

  def create?
    admin_user?
  end

  def new?
    create?
  end

  def update?
    admin_user?
  end

  def edit?
    update?
  end

  def destroy?
    super_admin?
  end

  def manage?
    admin_user?
  end

  def batch_action?
    admin_user?
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
