unless Rails.env.production?
  Rails.application.config.active_record.encryption.primary_key ||= ENV.fetch(
    "ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY",
    "a" * 32
  )
  Rails.application.config.active_record.encryption.deterministic_key ||= ENV.fetch(
    "ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY",
    "b" * 32
  )
  Rails.application.config.active_record.encryption.key_derivation_salt ||= ENV.fetch(
    "ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT",
    "development-salt-datajud-mvp"
  )
end
