module ActiveAdmin
  class PagePolicy < ApplicationPolicy
    def show?
      user.is_a?(User) && !user.has_role?(:client_owner) && !user.has_role?(:client_member) && !user.has_role?(:client_readonly)
    end
  end
end
