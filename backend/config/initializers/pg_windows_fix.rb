# frozen_string_literal: true

# Workaround: pg gem 1.6.x async connection API is broken on Windows
# with Docker port-mapped PostgreSQL. Force synchronous connections.
# See: https://github.com/ged/ruby-pg/issues/538
if Gem.win_platform?
  require "pg"
  PG::Connection.async_api = false
end
