module Api
  module V1
    class GlossaryTermsController < ActionController::API
      def index
        terms = GlossaryTerm.order(:term)
        render json: terms
      end

      def show
        term = GlossaryTerm.find_by!(slug: params[:slug])
        render json: term
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Termo jurídico não encontrado' }, status: :not_found
      end
    end
  end
end
