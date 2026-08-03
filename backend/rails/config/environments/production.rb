require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false

  config.action_controller.perform_caching = true

  config.public_file_server.enabled = true

  config.assume_ssl = true
  config.force_ssl = true

  config.log_tags = [:request_id]
  config.logger = ActiveSupport::TaggedLogging.logger(STDOUT)

  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  config.active_support.report_deprecations = false

  config.cache_store = :memory_store

  config.action_mailer.perform_caching = false

  config.i18n.fallbacks = true

  config.active_record.dump_schema_after_migration = false

  # Nesta versão não usamos config/credentials — o secret_key_base vem de
  # uma variável de ambiente (ver config/database.yml e README.md).
  config.require_master_key = false
end
