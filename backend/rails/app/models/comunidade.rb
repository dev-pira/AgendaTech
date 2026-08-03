# Regras de negócio replicadas de core/models.py (Django) / app/Models/
# Comunidade.php (Laravel). A validação fica aqui, no model, para ser
# compartilhada pelas duas superfícies (web e API) — ver
# app/controllers/comunidades_controller.rb e
# app/controllers/api/comunidades_controller.rb.
class Comunidade < ApplicationRecord
  include UuidPrimaryKey

  IMAGE_EXTENSIONS = %w[.png .jpg .jpeg .svg .webp].freeze

  belongs_to :criado_por, class_name: "User"
  has_many :comunidade_membros, inverse_of: :comunidade, dependent: :destroy
  has_many :membros, through: :comunidade_membros, source: :usuario
  has_many :eventos, dependent: :destroy

  # RN-COM-08 / RN-ORG-04: criador é automaticamente organizador.
  after_create :adicionar_criador_como_organizador

  before_validation { self.logo_url = logo_url.presence || "" }

  validates :nome, presence: true, length: { minimum: 3, maximum: 100 }
  validates :nome, uniqueness: { case_sensitive: false, message: "Já existe uma comunidade com este nome." }
  validates :descricao, presence: true, length: { minimum: 10 }
  validates :cidade, presence: true
  validate :contato_valido
  validate :logo_url_valida

  def total_membros
    membros.count
  end

  private

  def adicionar_criador_como_organizador
    comunidade_membros.create!(
      usuario: criado_por, papel: ComunidadeMembro::ORGANIZADOR, adicionado_por: criado_por
    )
  end

  def contato_valido
    return if contato.blank?
    return if contato.match?(URI::MailTo::EMAIL_REGEXP)
    return if url_valida?(contato)

    errors.add(:contato, "deve ser um e-mail válido ou uma URL válida.")
  end

  def logo_url_valida
    return if logo_url.blank?

    extensao_valida = IMAGE_EXTENSIONS.any? { |ext| logo_url.downcase.end_with?(ext) }
    return if url_valida?(logo_url) && extensao_valida

    errors.add(:logo_url, "deve terminar com uma extensão de imagem (#{IMAGE_EXTENSIONS.join(', ')}).")
  end

  def url_valida?(value)
    uri = URI.parse(value)
    uri.is_a?(URI::HTTP) && uri.host.present?
  rescue URI::InvalidURIError
    false
  end
end
