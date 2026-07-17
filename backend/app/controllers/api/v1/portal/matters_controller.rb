module Api
  module V1
    module Portal
      class MattersController < BaseController
        before_action :authenticate_portal_user!
        before_action :ensure_client!
        before_action :set_matter

        def timeline
          render json: {
            matter: {
              id: matter.id,
              title: matter.title,
              court_number: matter.court_number
            },
            health: ProcessHealth::Calculator.calculate(matter),
            movements: matter.process_movements.chronological.map do |movement|
              {
                id: movement.id,
                source_movement_id: movement.source_movement_id,
                nome: movement.nome,
                simplified_text: movement.simplified_text,
                data_hora: movement.data_hora&.iso8601,
                translated: movement.translated
              }
            end
          }
        end

        def health
          render json: ProcessHealth::Calculator.calculate(matter)
        end

        private

        attr_reader :matter

        def ensure_client!
          return if current_client

          render json: { error: "Nenhum cliente vinculado a este usuário." }, status: :forbidden
        end

        def set_matter
          @matter = current_client.matters.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Processo não encontrado." }, status: :not_found
        end
      end
    end
  end
end
