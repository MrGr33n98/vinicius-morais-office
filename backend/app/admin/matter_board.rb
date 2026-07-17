ActiveAdmin.register_page "Matter Board" do
  menu priority: 2, label: "Quadro de Processos"

  content title: "Quadro de Processos" do
    phases = ['peticao_inicial', 'contestacao', 'instrucao', 'sentenca', 'recurso', 'execucao']
    
    div class: "kanban-board", style: "display: flex; gap: 20px; overflow-x: auto; padding: 20px;" do
      phases.each do |phase|
        matters = Matter.where(current_phase: phase)

        div class: "kanban-column", style: "flex: 1; min-width: 250px; background: #f4f4f4; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" do
          h3 phase.titleize, style: "border-bottom: 2px solid #ccc; padding-bottom: 8px;"
          
          matters.each do |matter|
            div class: "kanban-card", style: "background: #fff; padding: 10px; margin-top: 10px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.15);" do
              h4 link_to(matter.title, admin_matter_path(matter))
              p "Código: #{matter.code}"
              p "Status: #{matter.status}"
            end
          end
        end
      end
    end
  end
end
