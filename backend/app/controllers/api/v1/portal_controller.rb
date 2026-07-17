module Api
  module V1
    class PortalController < BaseController
      before_action :authenticate_portal_user!
      before_action :ensure_client!

      def show
        render json: ::Portal::ClientDashboardSerializer.new(current_client, current_user).as_json
      end

      private

      def ensure_client!
        return if current_client

        render json: { error: "Nenhum cliente vinculado a este usuário." }, status: :forbidden
      end
    end
  end
end
