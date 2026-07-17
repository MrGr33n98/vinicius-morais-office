module Portal
  class ClientDashboardSerializer
    PHASE_LABELS = {
      "peticao_inicial" => "Petição Inicial",
      "contestacao" => "Contestação",
      "instrucao" => "Instrução",
      "sentenca" => "Sentença",
      "recurso" => "Recurso",
      "execucao" => "Execução"
    }.freeze

    DOC_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#94a3b8"].freeze

    def initialize(client, user)
      @client = client
      @user = user
      @matters = client.matters.includes(
        :matter_client_updates,
        :matter_events,
        :matter_phase_transitions,
        :tasks,
        :documents,
        :transactions
      ).order(created_at: :desc)
    end

    def as_json(*)
      {
        name: client.name,
        cnpj: client.document_number,
        profile: profile_json,
        default_chat_room_id: default_chat_room_id,
        stats: stats_json,
        conversations: conversations_json,
        matters: matters.map { |matter| matter_json(matter) },
        recent_prazos: recent_prazos_json,
        recent_documents: recent_documents_json
      }
    end

    def profile_json
      {
        user_name: user.name,
        user_email: user.email,
        client_name: client.name,
        client_document_number: client.document_number,
        phone: profile.phone,
        secondary_phone: profile.secondary_phone,
        document_number: profile.document_number,
        profession: profile.profession,
        preferred_contact_method: profile.preferred_contact_method,
        address_zip_code: profile.address_zip_code,
        address_street: profile.address_street,
        address_number: profile.address_number,
        address_complement: profile.address_complement,
        address_neighborhood: profile.address_neighborhood,
        address_city: profile.address_city,
        address_state: profile.address_state,
        email_notifications: profile.email_notifications,
        whatsapp_notifications: profile.whatsapp_notifications,
        sms_notifications: profile.sms_notifications,
        marketing_consent: profile.marketing_consent,
        updated_at: profile.persisted? ? profile.updated_at&.iso8601 : nil
      }
    end

    def message_json(message)
      {
        id: message.id,
        sender: message.user == user ? "Você" : message.user.name,
        text: message.content,
        time: time_label(message.created_at),
        mine: message.user == user
      }
    end

    private

    attr_reader :client, :user, :matters

    def profile
      @profile ||= ClientPortalProfile.find_or_initialize_by(user: user) do |profile|
        profile.client = client
      end
    end

    def stats_json
      {
        active_matters: matters.count { |matter| matter.status == "Active" },
        hearings_count: client.meetings.where("starts_at >= ?", Time.current).count,
        notifications_count: user.notifications.where(read_at: nil).count,
        resources_count: matters.sum { |matter| matter.tasks.where(status: ["Pending", "In Progress", "Overdue"]).count },
        open_billing: currency(total_expenses.abs)
      }
    end

    def conversations_json
      messages = Message
        .where(firm: client.firm)
        .where("chat_room_id LIKE ?", "client:#{client.id}:%")
        .includes(:user)
        .order(:created_at)
        .group_by(&:chat_room_id)

      conversations = messages.map.with_index do |(room_id, room_messages), index|
        last_message = room_messages.last

        {
          id: room_id,
          name: room_name(room_id, index),
          oab: "",
          status: "online",
          preview: last_message&.content.to_s.truncate(72),
          time: last_message ? time_label(last_message.created_at) : "",
          unread: 0,
          process: room_process(room_id)&.court_number,
          process_title: room_process(room_id)&.title,
          conv_start: date_time_label(room_messages.first.created_at),
          avatar_color: "#0f766e",
          initials: "VM",
          messages: room_messages.map { |message| message_json(message) },
          shared_files: [],
          pinned_message: nil
        }
      end

      return conversations if conversations.any?

      [{
        id: default_chat_room_id,
        name: "Equipe VM Advocacia",
        oab: "",
        status: "online",
        preview: "Canal oficial de atendimento do seu portal.",
        time: "",
        unread: 0,
        process: nil,
        process_title: nil,
        conv_start: "",
        avatar_color: "#0f766e",
        initials: "VM",
        messages: [],
        shared_files: [],
        pinned_message: nil
      }]
    end

    def matter_json(matter)
      documents = matter.documents.order(created_at: :desc)
      tasks = matter.tasks.order(due_date: :asc)
      updates = matter.matter_client_updates.order(published_at: :desc, created_at: :desc)
      events = matter.matter_events.order(happened_at: :desc, created_at: :desc)
      transactions = matter.transactions.order(realized_at: :desc, created_at: :desc)

      {
        id: matter.id,
        title: matter.title,
        code: matter.code,
        court_number: matter.court_number,
        folder: matter.folder,
        court_name: matter.court_name,
        action_class: matter.action_class,
        status: status_label(matter.status),
        main_subject: matter.action_class,
        value_of_cause: nil,
        stagnant: stagnant?(matter),
        current_phase: matter.current_phase,
        client_role: "Cliente",
        other_party_role: nil,
        other_party_name: nil,
        other_party_cnpj: nil,
        last_update_text: updates.first&.title || events.first&.description || "Sem atualizações publicadas",
        timeline_phases: timeline_phases_json(matter),
        andamentos: updates_json(updates, events),
        audiencias: hearings_json,
        audiencias_realizadas: [],
        participantes: [{ name: client.name, role: "Cliente", status: "CONFIRMADO" }],
        checklist_audiencia: [],
        financeiro: financial_json(transactions),
        recursos_stats: task_stats(tasks),
        peticoes_stats: petition_stats(updates),
        recursos: tasks_json(tasks),
        peticoes: petition_updates_json(updates),
        prazos_recursos: deadline_json(tasks),
        storage: storage_json(documents),
        document_folders: document_folders_json(documents),
        documents: documents.map { |document| document_json(document) },
        doc_resumo: document_summary_json(documents)
      }
    end

    def recent_prazos_json
      matters.flat_map do |matter|
        matter.tasks.order(due_date: :asc).limit(4).map do |task|
          {
            id: task.id,
            title: task.title,
            desc: "Proc. #{matter.court_number}",
            date: date_label(task.due_date),
            time: distance_label(task.due_date),
            type: task.status,
            color: task.status == "Overdue" ? "#ef4444" : "#f59e0b"
          }
        end
      end.sort_by { |item| item[:date].to_s }.first(6)
    end

    def recent_documents_json
      Document
        .where(matter_id: matters.select(:id))
        .order(created_at: :desc)
        .limit(6)
        .map do |document|
          {
            id: document.id,
            title: document.title,
            size: document.file.attached? ? number_to_human_size(document.file.byte_size) : "Sem arquivo",
            date: date_label(document.created_at),
            type: document.file.attached? ? document.file.filename.extension_without_delimiter : "doc"
          }
        end
    end

    def timeline_phases_json(matter)
      PHASE_LABELS.map do |phase, label|
        transitions = matter.matter_phase_transitions
        transitioned = transitions.any? { |transition| transition.to_phase == phase }
        current = matter.current_phase == phase

        {
          name: label,
          date: transitioned ? date_label(transitions.find { |transition| transition.to_phase == phase }.created_at) : (current ? "Atual" : "A definir"),
          status: current ? "active" : (transitioned ? "completed" : "future"),
          label: current ? "Atual" : nil
        }
      end
    end

    def updates_json(updates, events)
      update_items = updates.map do |update|
        {
          id: update.id,
          date: date_label(update.published_at || update.created_at),
          time: time_label(update.published_at || update.created_at),
          type: "Atualização",
          title: update.title,
          content: update.content,
          icon: "•"
        }
      end

      event_items = events.map do |event|
        {
          id: "event-#{event.id}",
          date: date_label(event.happened_at || event.created_at),
          time: time_label(event.happened_at || event.created_at),
          type: event.event_type,
          title: event.event_type,
          content: event.description,
          icon: "•"
        }
      end

      (update_items + event_items).first(12)
    end

    def hearings_json
      client.meetings.where("starts_at >= ?", Time.current).order(:starts_at).limit(6).map do |meeting|
        {
          id: meeting.id,
          type: meeting.title,
          date: date_label(meeting.starts_at),
          time: time_label(meeting.starts_at),
          room: meeting.meeting_url.presence || "A confirmar",
          status: distance_label(meeting.starts_at),
          status_color: "info",
          label: nil
        }
      end
    end

    def financial_json(transactions)
      expenses = transactions.select { |transaction| transaction.transaction_type == "expense" }
      revenues = transactions.select { |transaction| transaction.transaction_type == "revenue" }

      {
        total_investido: decimal_currency(expenses.sum(&:amount).abs),
        a_receber: decimal_currency(revenues.sum(&:amount)),
        previsao_atual: decimal_currency(revenues.sum(&:amount) - expenses.sum(&:amount).abs),
        chart_data: cumulative_chart(transactions),
        distribuicao: distribution_json(expenses),
        previsao: {
          melhor: decimal_currency(revenues.sum(&:amount)),
          provavel: decimal_currency(revenues.sum(&:amount) - expenses.sum(&:amount).abs),
          conservador: decimal_currency(revenues.sum(&:amount) * 0.7)
        },
        proximos_pagamentos: [],
        lancamentos: transactions.map { |transaction| transaction_json(transaction) },
        documentos_financeiros: []
      }
    end

    def task_stats(tasks)
      {
        interpostos: tasks.count,
        analise: tasks.count { |task| task.status.in?(["Pending", "In Progress"]) },
        julgados: tasks.count { |task| task.status == "Completed" },
        negados: tasks.count { |task| task.status == "Overdue" }
      }
    end

    def petition_stats(updates)
      {
        protocoladas: updates.count,
        analise: 0,
        deferidas: updates.count,
        indeferidas: 0
      }
    end

    def tasks_json(tasks)
      tasks.map do |task|
        {
          id: task.id,
          type: task.title,
          date: date_label(task.due_date),
          protocol: task.matter.court_number,
          by: task.assignee.name,
          status: task.status,
          ultima_manifest: task.description
        }
      end
    end

    def petition_updates_json(updates)
      updates.map do |update|
        {
          id: update.id,
          title: update.title,
          date: date_time_label(update.published_at || update.created_at),
          by: update.user.name,
          status: "Publicado",
          ultima_manifest: update.content
        }
      end
    end

    def deadline_json(tasks)
      tasks.map do |task|
        {
          title: task.title,
          deadline: date_label(task.due_date),
          days: distance_label(task.due_date),
          pct: deadline_percent(task.due_date),
          color: task.status == "Overdue" ? "danger" : "warning"
        }
      end
    end

    def storage_json(documents)
      attached_size = documents.sum { |document| document.file.attached? ? document.file.byte_size : 0 }
      percent = [(attached_size.to_f / 10.gigabytes * 100).round, 100].min

      {
        used: number_to_human_size(attached_size),
        total: "10 GB",
        percent: percent
      }
    end

    def document_folders_json(documents)
      summary = documents.group_by { |document| folder_for(document) }.map do |folder, records|
        { name: folder, count: records.count, icon: "•" }
      end

      [{ name: "Todas as Pastas", count: documents.count }] + summary
    end

    def document_json(document)
      folder = folder_for(document)

      {
        id: document.id,
        name: document.title,
        type_label: folder,
        type_icon: "•",
        format: document.file.attached? ? document.file.filename.extension_without_delimiter.upcase : "DOC",
        date: date_label(document.created_at),
        time: time_label(document.created_at),
        size: document.file.attached? ? number_to_human_size(document.file.byte_size) : "Sem arquivo",
        folder: folder
      }
    end

    def document_summary_json(documents)
      grouped = documents.group_by { |document| folder_for(document) }
      total = documents.count.nonzero? || 1

      grouped.map.with_index do |(label, records), index|
        {
          label: label,
          count: records.count,
          pct: ((records.count.to_f / total) * 100).round,
          color: DOC_COLORS[index % DOC_COLORS.size]
        }
      end
    end

    def transaction_json(transaction)
      negative = transaction.transaction_type == "expense"

      {
        date: date_label(transaction.realized_at),
        desc: transaction.description,
        category: transaction.transaction_type == "expense" ? "Despesa" : "Receita",
        type: transaction.transaction_type == "expense" ? "Despesa" : "Receita",
        value: "#{negative ? "-" : "+"}#{decimal_currency(transaction.amount.abs)}",
        neg: negative
      }
    end

    def distribution_json(expenses)
      total = expenses.sum(&:amount).abs
      return [] if total.zero?

      expenses.group_by(&:description).map.with_index do |(label, records), index|
        value = records.sum(&:amount).abs
        {
          label: label.truncate(28),
          pct: ((value / total) * 100).round,
          value: decimal_currency(value),
          color: DOC_COLORS[index % DOC_COLORS.size]
        }
      end
    end

    def cumulative_chart(transactions)
      running = 0
      values = transactions.sort_by(&:realized_at).map do |transaction|
        running += transaction.transaction_type == "expense" ? transaction.amount.abs : 0
        running.to_f
      end

      values.presence || [0]
    end

    def status_label(status)
      {
        "Active" => "Em Andamento",
        "Suspended" => "Suspenso",
        "Closed" => "Encerrado",
        "Archived" => "Arquivado"
      }[status] || status
    end

    def stagnant?(matter)
      last_update_at = matter.matter_client_updates.maximum(:created_at)
      last_update_at.blank? || last_update_at < 120.days.ago
    end

    def folder_for(document)
      document.description.presence || "Documentos"
    end

    def default_chat_room_id
      "client:#{client.id}:general"
    end

    def room_process(room_id)
      matter_id = room_id.split(":").last.to_i
      matters.detect { |matter| matter.id == matter_id }
    end

    def room_name(_room_id, index)
      index.zero? ? "Equipe VM Advocacia" : "Atendimento jurídico"
    end

    def total_expenses
      Transaction.where(matter_id: matters.select(:id), transaction_type: "expense").sum(:amount)
    end

    def date_label(value)
      return "" unless value

      I18n.l(value.to_date, format: "%d/%m/%Y")
    end

    def time_label(value)
      return "" unless value

      I18n.l(value.to_time, format: "%H:%M")
    end

    def date_time_label(value)
      return "" unless value

      "#{date_label(value)} #{time_label(value)}"
    end

    def distance_label(value)
      return "" unless value

      days = (value.to_date - Time.zone.today).to_i
      return "Hoje" if days.zero?
      return "Atrasado" if days.negative?

      "Em #{days} #{days == 1 ? "dia" : "dias"}"
    end

    def deadline_percent(value)
      return 0 unless value

      days = (value.to_date - Time.zone.today).to_i
      [[100 - (days * 5), 15].max, 100].min
    end

    def decimal_currency(value)
      format("%.2f", value.to_d).tr(".", ",")
    end

    def currency(value)
      "R$ #{decimal_currency(value)}"
    end

    def number_to_human_size(value)
      ActiveSupport::NumberHelper.number_to_human_size(value, locale: :"pt-BR")
    end
  end
end
