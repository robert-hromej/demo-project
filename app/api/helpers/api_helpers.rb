# frozen_string_literal: true

module Api
  module Helpers
    module ApiHelpers
      def current_user
        return @current_user if defined?(@current_user)

        token = headers["Authorization"]&.split&.last
        return nil unless token

        payload = JwtService.decode(token: token)
        return nil unless payload

        @current_user = User.find_by(id: payload["user_id"])
      end

      def authenticate!
        error!({ error: { code: :unauthorized, message: "Unauthorized" } }, 401) unless current_user
      end

      def handle_result(result)
        if result.success?
          result.value!
        else
          error = result.failure
          status_code = case error[:code]
                        when :validation_error then 422
                        when :not_found then 404
                        when :unauthorized then 401
                        else 400
                        end
          error!({ error: error }, status_code)
        end
      end

      def paginate(collection:, page: 1, per_page: 20)
        page = [page.to_i, 1].max
        per_page = [[per_page.to_i, 1].max, 100].min

        total = collection.count
        records = collection.offset((page - 1) * per_page).limit(per_page)

        {
          data: records,
          meta: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: (total.to_f / per_page).ceil,
          },
        }
      end
    end
  end
end
