module Api
  module V1
    class BannersController < ActionController::API
      def index
        banners = Banner.published
          .currently_visible
          .for_placement(params[:placement])
          .ordered_for_display

        render json: banners.as_json(
          only: [:id, :title, :message, :cta_label, :cta_url, :placement, :priority]
        )
      end
    end
  end
end
