class CreateFaqItems < ActiveRecord::Migration[8.0]
  def change
    create_table :faq_items do |t|
      t.string :question
      t.text :answer
      t.references :faqable, polymorphic: true, null: false

      t.timestamps
    end
  end
end
