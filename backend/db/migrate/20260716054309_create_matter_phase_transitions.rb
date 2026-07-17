class CreateMatterPhaseTransitions < ActiveRecord::Migration[8.0]
  def change
    create_table :matter_phase_transitions do |t|
      t.references :matter, null: false, foreign_key: true
      t.string :from_phase
      t.string :to_phase
      t.references :transitioned_by, polymorphic: true, null: false
      t.text :notes

      t.timestamps
    end
  end
end
