variable "db_url" {
  type    = string
  default = "sqlite://data/dev.db"
}

env "local" {
  src = "file://db/schema.sql"
  url = var.db_url
  dev = "sqlite://file?mode=memory"

  migration {
    dir = "file://db/migrations"
  }
}
