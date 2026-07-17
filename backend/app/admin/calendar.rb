ActiveAdmin.register_page "Calendar" do
  menu priority: 3, label: "Calendário"

  content title: "Agenda e Reuniões" do
    meetings = Meeting.where(starts_at: Time.current.beginning_of_month..Time.current.end_of_month)
    tasks = Task.where(due_date: Time.current.beginning_of_month..Time.current.end_of_month)

    div style: "padding: 20px;" do
      h3 "Compromissos do Mês Atual"

      panel "Reuniões Agendadas" do
        table_for meetings do
          column :title
          column :starts_at
          column :ends_at
          column :client
          column :meeting_url do |m|
            link_to "Link Videochamada", m.meeting_url, target: "_blank" if m.meeting_url.present?
          end
        end
      end

      panel "Prazos Operacionais (Tasks)" do
        table_for tasks do
          column :title
          column :due_date
          column :assignee
          column :status
        end
      end
    end
  end
end
