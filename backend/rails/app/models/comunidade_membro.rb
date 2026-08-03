# Vínculo de um usuário com uma comunidade e seu papel nela (organizador
# ou membro). Espelha core/models.py:ComunidadeMembro (Django) /
# app/Models/ComunidadeMembro.php (Laravel).
class ComunidadeMembro < ApplicationRecord
  ORGANIZADOR = "organizador"
  MEMBRO = "membro"
  PAPEIS = [ORGANIZADOR, MEMBRO].freeze

  belongs_to :comunidade, inverse_of: :comunidade_membros
  belongs_to :usuario, class_name: "User", inverse_of: :comunidade_membros
  belongs_to :adicionado_por, class_name: "User", optional: true

  before_validation { self.adicionado_em = Time.current if adicionado_em.blank? }

  validates :papel, presence: true, inclusion: { in: PAPEIS }
  validates :usuario_id, uniqueness: { scope: :comunidade_id }
end
