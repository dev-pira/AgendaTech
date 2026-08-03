# Usuário da plataforma. Papéis (organizador/membro) são por comunidade,
# ver ComunidadeMembro — não existe flag global de papel no usuário.
# Espelha core/models.py (Django) / app/Models/User.php (Laravel).
class User < ApplicationRecord
  include UuidPrimaryKey

  has_secure_password

  has_one :token, dependent: :destroy
  has_many :comunidades_criadas, class_name: "Comunidade", foreign_key: :criado_por_id, inverse_of: :criado_por,
                                  dependent: :restrict_with_error
  has_many :eventos_organizados, class_name: "Evento", foreign_key: :organizador_id, inverse_of: :organizador,
                                  dependent: :restrict_with_error
  has_many :comunidade_membros, foreign_key: :usuario_id, inverse_of: :usuario, dependent: :destroy
  has_many :comunidades, through: :comunidade_membros

  validates :username, presence: true, uniqueness: true, length: { maximum: 150 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, allow_nil: true

  def nome_exibicao
    nome_completo = "#{first_name} #{last_name}".strip
    nome_completo.presence || username
  end
end
