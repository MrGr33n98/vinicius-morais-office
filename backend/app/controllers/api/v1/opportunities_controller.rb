module Api
  module V1
    class OpportunitiesController < ActionController::API
      def create
        # Vincula à primeira firma padrão cadastrada na base
        firm = Firm.first || Firm.create!(name: "Vinicius Morais Advocacia")
        
        opportunity = Opportunity.new(opportunity_params)
        opportunity.firm = firm
        opportunity.stage = 'lead' # Estágio inicial padrão

        if opportunity.save
          render json: { success: true, message: "Lead recebido com sucesso!", data: opportunity }, status: :created
        else
          render json: { success: false, errors: opportunity.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def opportunity_params
        params.require(:opportunity).permit(:name, :email, :phone, :source, :value_estimate)
      end
    end
  end
end
