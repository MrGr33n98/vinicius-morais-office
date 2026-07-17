class ChangeClientIdToNullableInOpportunities < ActiveRecord::Migration[8.0]
  def change
    change_column_null :opportunities, :client_id, true
  end
end
