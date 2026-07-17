class UserPolicy < ApplicationPolicy
  def index?
    user.is_a?(User)
  end

  def show?
    user.is_a?(User)
  end

  def create?
    user.is_a?(User)
  end

  def update?
    user.is_a?(User)
  end

  def destroy?
    user.is_a?(User)
  end

  class Scope < Scope
    def resolve
      if user.is_a?(User)
        scope.all
      else
        scope.none
      end
    end
  end
end
