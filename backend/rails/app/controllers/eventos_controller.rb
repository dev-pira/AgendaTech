# Views server-rendered (HTML puro, sem API) de eventos. Reaproveita o
# mesmo model Evento (e as mesmas regras de negócio) que a API — ver
# app/controllers/api/eventos_controller.rb. Espelha core/views.py
# (Django) / Http/Controllers/EventoController.php (Laravel).
class EventosController < ApplicationController
  include PaginacaoWeb

  before_action :require_login, only: %i[new create edit update confirm_delete destroy]
  before_action :set_evento, only: %i[show edit update confirm_delete destroy]

  def index
    scope = Evento.includes(:comunidade, :organizador).order(:data, :hora_inicio)

    @comunidade_selecionada = params[:comunidade].to_s.strip
    @cidade = params[:cidade].to_s.strip
    @tipo = params[:tipo].to_s.strip
    @data_inicio = params[:data_inicio].to_s.strip
    @data_fim = params[:data_fim].to_s.strip

    scope = scope.where(comunidade_id: @comunidade_selecionada) if @comunidade_selecionada.present?
    scope = scope.joins(:comunidade).where("LOWER(comunidades.cidade) = ?", @cidade.downcase) if @cidade.present?
    scope = scope.where(tipo: @tipo) if @tipo.present?
    scope = scope.where("data >= ?", @data_inicio) if @data_inicio.present?
    scope = scope.where("data <= ?", @data_fim) if @data_fim.present?

    @eventos, @paginacao = paginar_web(scope)
    @comunidades = Comunidade.order(:nome)
  end

  def show
    @pode_gerenciar = Permissions.organizador?(current_user, @evento.comunidade) && @evento.data >= Date.current
  end

  def new
    @comunidades_usuario = comunidades_do_usuario

    if @comunidades_usuario.empty?
      redirect_to comunidades_path, alert: "Você precisa ser membro de uma comunidade para criar eventos."
      return
    end

    @evento = Evento.new
  end

  def create
    @comunidades_usuario = comunidades_do_usuario
    @evento = Evento.new(evento_params)
    comunidade = Comunidade.find_by(id: evento_params[:comunidade_id])

    unless comunidade && Permissions.membro_ou_organizador?(current_user, comunidade)
      flash.now[:alert] = "Você precisa ser membro ou organizador desta comunidade para criar eventos."
      render :new, status: :unprocessable_content
      return
    end

    # RN-EVT-04
    if @evento.data.present? && @evento.data < Date.current
      @evento.errors.add(:data, "deve ser futura ou igual à data atual.")
      render :new, status: :unprocessable_content
      return
    end

    @evento.organizador = current_user

    if @evento.save
      redirect_to @evento, notice: "Evento criado com sucesso."
    else
      render :new, status: :unprocessable_content
    end
  end

  def edit
    unless Permissions.organizador?(current_user, @evento.comunidade)
      redirect_to @evento, alert: "Apenas organizadores da comunidade podem editar este evento."
      return
    end
    redirect_to @evento, alert: "Não é possível editar eventos que já ocorreram." if @evento.data < Date.current
  end

  def update
    unless Permissions.organizador?(current_user, @evento.comunidade)
      redirect_to @evento, alert: "Apenas organizadores da comunidade podem editar este evento."
      return
    end
    if @evento.data < Date.current
      redirect_to @evento, alert: "Não é possível editar eventos que já ocorreram."
      return
    end

    if @evento.update(evento_params.except(:comunidade_id))
      redirect_to @evento, notice: "Evento atualizado com sucesso."
    else
      render :edit, status: :unprocessable_content
    end
  end

  def confirm_delete
    unless Permissions.organizador?(current_user, @evento.comunidade)
      redirect_to @evento, alert: "Apenas organizadores da comunidade podem excluir este evento."
      return
    end
    redirect_to @evento, alert: "Não é possível excluir eventos que já ocorreram." if @evento.data < Date.current
  end

  def destroy
    unless Permissions.organizador?(current_user, @evento.comunidade)
      redirect_to @evento, alert: "Apenas organizadores da comunidade podem excluir este evento."
      return
    end
    if @evento.data < Date.current
      redirect_to @evento, alert: "Não é possível excluir eventos que já ocorreram."
      return
    end

    @evento.destroy
    redirect_to eventos_path, notice: "Evento excluído com sucesso."
  end

  private

  def comunidades_do_usuario
    Comunidade.joins(:comunidade_membros).where(comunidade_membros: { usuario_id: current_user.id }).distinct.order(:nome)
  end

  def set_evento
    @evento = Evento.find(params[:id])
  end

  def evento_params
    params.require(:evento).permit(
      :titulo, :descricao, :data, :hora_inicio, :hora_fim, :local, :tipo, :url_online, :comunidade_id
    )
  end
end
