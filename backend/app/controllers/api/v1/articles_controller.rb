module Api
  module V1
    class ArticlesController < ActionController::API
      def index
        articles = Article.where(status: 'published').includes(:author).order(published_at: :desc)
        render json: articles.as_json(include: { author: { only: [:name, :bio, :oab_number] } })
      end

      def show
        article = Article.find_by!(slug: params[:slug], status: 'published')
        render json: article.as_json(include: { author: { only: [:name, :bio, :oab_number] } })
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Artigo não encontrado ou não publicado' }, status: :not_found
      end
    end
  end
end
