# MySQL não tem um tipo de coluna UUID nativo (diferente do Postgres), então
# usamos uma chave primária string(36) preenchida em Ruby antes de criar o
# registro. Mesmo padrão de UUID como PK usado nas versões Django e Laravel
# deste backend.
module UuidPrimaryKey
  extend ActiveSupport::Concern

  included do
    before_create { self.id = SecureRandom.uuid if id.blank? }
  end
end
