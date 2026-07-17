module Api
  module V1
    class PortalMessagesController < BaseController
      before_action :authenticate_portal_user!
      before_action :ensure_client!

      def create
        message = Message.new(
          firm: current_client.firm,
          user: current_user,
          chat_room_id: permitted_params[:chat_room_id].presence || default_chat_room_id,
          content: permitted_params[:content]
        )

        if message.save
          render json: ::Portal::ClientDashboardSerializer.new(current_client, current_user).message_json(message), status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def ensure_client!
        return if current_client

        render json: { error: "Nenhum cliente vinculado a este usuário." }, status: :forbidden
      end

      def permitted_params
        params.require(:message).permit(:content, :chat_room_id)
      end

      def default_chat_room_id
        "client:#{current_client.id}:general"
      end
    end
  end
end
