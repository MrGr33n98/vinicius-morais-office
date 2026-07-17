ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.

# Workaround: pg gem 1.6.x async connection API is broken on Windows
# with Docker port-mapped PostgreSQL. Force synchronous connections.
if Gem.win_platform?
  require "pg"
  PG::Connection.async_api = false
end

require "bootsnap/setup" # Speed up boot time by caching expensive operations.
