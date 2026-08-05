# Regras de negócio replicadas de core/models.py (Django) / app/Models/
# Evento.php (Laravel). Assim como em Comunidade, a validação de "forma"
# (tamanhos, formatos, campos cruzados) fica aqui no model. As regras que
# dependem de "quando" a ação acontece (RN-EVT-04 data futura só na
# criação, RN-EVT-07 permissão, RN-EVT-10 bloqueio de evento passado) ficam
# nos controllers — ver app/controllers/eventos_controller.rb e
# app/controllers/api/eventos_controller.rb — porque só se aplicam a
# algumas ações, não a todo `save` (ex.: um evento passado usado como
# fixture de teste não pode falhar validação só por estar no passado).
class Evento < ApplicationRecord
  include UuidPrimaryKey

  PRESENCIAL = "presencial"
  ONLINE = "online"
  HIBRIDO = "hibrido"
  TIPOS = [PRESENCIAL, ONLINE, HIBRIDO].freeze

  belongs_to :comunidade, inverse_of: :eventos
  belongs_to :organizador, class_name: "User"

  before_validation { self.url_online = url_online.presence || "" }

  validates :titulo, presence: true, length: { minimum: 5, maximum: 200 }
  validates :titulo, uniqueness: {
    scope: %i[comunidade_id data], case_sensitive: false,
    message: "Já existe um evento com este título nesta data para esta comunidade."
  }
  validates :descricao, presence: true, length: { minimum: 20 }
  validates :data, presence: true
  validates :hora_inicio, presence: true
  validates :local, presence: true
  validates :tipo, presence: true, inclusion: { in: TIPOS }
  validate :url_online_obrigatorio_para_online_ou_hibrido
  validate :hora_fim_apos_hora_inicio

  private

  def url_online_obrigatorio_para_online_ou_hibrido
    return unless %w[online hibrido].include?(tipo)

    errors.add(:url_online, "é obrigatório quando tipo é 'online' ou 'hibrido'.") if url_online.blank?
  end

  def hora_fim_apos_hora_inicio
    return if hora_fim.blank? || hora_inicio.blank?

    errors.add(:hora_fim, "deve ser posterior a hora_inicio.") if hora_fim <= hora_inicio
  end
end
