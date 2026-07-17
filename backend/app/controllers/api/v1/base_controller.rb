module Api
  module V1
    class BaseController < ActionController::API
      TOKEN_PURPOSE = :portal_auth

      private

      attr_reader :current_user

      def authenticate_portal_user!
        payload = verify_portal_token
        return if performed?

        @current_user = User.find_by(id: payload[:user_id])

        return if @current_user

        render json: { error: "Sessão inválida. Faça login novamente." }, status: :unauthorized
      end

      def current_client
        @current_client ||= current_user
          &.account_memberships
          &.includes(account: :client)
          &.first
          &.account
          &.client
      end

      def portal_token_for(user)
        Rails.application.message_verifier(TOKEN_PURPOSE).generate(
          { user_id: user.id, exp: 24.hours.from_now.to_i }
        )
      end

      def verify_portal_token
        header = request.headers["Authorization"].to_s
        token = header.match(/\ABearer (.+)\z/)&.[](1)

        unless token
          render json: { error: "Token de acesso não informado." }, status: :unauthorized
          return {}
        end

        payload = Rails.application.message_verifier(TOKEN_PURPOSE).verify(token).symbolize_keys
        return payload if payload[:exp].to_i >= Time.current.to_i

        render json: { error: "Sessão expirada. Faça login novamente." }, status: :unauthorized
        {}
      rescue ActiveSupport::MessageVerifier::InvalidSignature
        render json: { error: "Sessão inválida. Faça login novamente." }, status: :unauthorized
        {}
      end
    end
  end
end
