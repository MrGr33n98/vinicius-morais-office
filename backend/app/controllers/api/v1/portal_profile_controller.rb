module Api
  module V1
    class PortalProfileController < BaseController
      before_action :authenticate_portal_user!
      before_action :ensure_client!

      def show
        render json: serializer.profile_json
      end

      def update
        ActiveRecord::Base.transaction do
          current_user.update!(user_attributes)
          current_client.update!(client_attributes)
          portal_profile.update!(profile_attributes)
        end

        render json: serializer.profile_json
      rescue ActiveRecord::RecordInvalid => error
        render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def ensure_client!
        return if current_client

        render json: { error: "Nenhum cliente vinculado a este usuário." }, status: :forbidden
      end

      def serializer
        @serializer ||= ::Portal::ClientDashboardSerializer.new(current_client, current_user)
      end

      def portal_profile
        @portal_profile ||= ClientPortalProfile.find_or_create_by!(user: current_user) do |profile|
          profile.client = current_client
        end
      end

      def permitted_params
        params.require(:profile).permit(
          :user_name,
          :user_email,
          :client_name,
          :client_document_number,
          :phone,
          :secondary_phone,
          :document_number,
          :profession,
          :preferred_contact_method,
          :address_zip_code,
          :address_street,
          :address_number,
          :address_complement,
          :address_neighborhood,
          :address_city,
          :address_state,
          :email_notifications,
          :whatsapp_notifications,
          :sms_notifications,
          :marketing_consent
        )
      end

      def user_attributes
        {
          name: permitted_params[:user_name],
          email: permitted_params[:user_email]
        }.compact
      end

      def client_attributes
        {
          name: permitted_params[:client_name],
          document_number: permitted_params[:client_document_number]
        }.compact
      end

      def profile_attributes
        permitted_params.except(:user_name, :user_email, :client_name, :client_document_number)
      end
    end
  end
end
