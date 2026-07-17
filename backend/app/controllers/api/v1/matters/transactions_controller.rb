module Api
  module V1
    module Matters
      class TransactionsController < ActionController::API
        def index
          matter = Matter.find(params[:matter_id])
          transactions = matter.transactions.order(realized_at: :desc)
          render json: transactions
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Processo não encontrado" }, status: :not_found
        end
      end
    end
  end
end
