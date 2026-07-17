module Api
  module V1
    class AuthController < BaseController
      before_action :authenticate_portal_user!, only: :me

      def login
        user = User.includes(account_memberships: { account: :client }).find_by(email: params[:email].to_s.downcase)

        unless user&.valid_password?(params[:password].to_s)
          render json: { error: "E-mail ou senha inválidos." }, status: :unauthorized
          return
        end

        membership = user.account_memberships.first
        unless membership&.account&.client
          render json: { error: "Este usuário ainda não possui acesso ao Portal do Cliente." }, status: :forbidden
          return
        end

        render json: {
          token: portal_token_for(user),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: membership.role,
            client_id: membership.account.client_id
          }
        }
      end

      def me
        membership = current_user.account_memberships.includes(account: :client).first

        render json: {
          user: {
            id: current_user.id,
            name: current_user.name,
            email: current_user.email,
            role: membership&.role,
            client_id: membership&.account&.client_id
          }
        }
      end
    end
  end
end
