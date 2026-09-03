path "transit/encrypt/sea-banco-kek" {
  capabilities = ["update"]
}

path "transit/decrypt/sea-banco-kek" {
  capabilities = ["update"]
}

path "transit/rewrap/sea-banco-kek" {
  capabilities = ["update"]
}

path "transit/keys/sea-banco-kek" {
  capabilities = ["read"]
}
