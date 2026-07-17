class ApplicationController < ActionController::Base
  include Pundit::Authorization

  def access_denied(exception)
    redirect_to admin_root_path, alert: "Você não tem permissão para realizar esta ação."
  end
end
