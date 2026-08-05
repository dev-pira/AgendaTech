# Views server-rendered (HTML puro, sem API) de comunidades. Reaproveita o
# mesmo model Comunidade (e as mesmas regras de negócio) que a API — ver
# app/controllers/api/comunidades_controller.rb. Espelha core/views.py
# (Django) / Http/Controllers/ComunidadeController.php (Laravel).
class ComunidadesController < ApplicationController
  include PaginacaoWeb

  before_action :require_login, only: %i[new create edit update confirm_delete destroy]
  before_action :set_comunidade, only: %i[show edit update confirm_delete destroy]

  def index
    scope = Comunidade.all.order(:nome)

    @busca = params[:busca].to_s.strip
    @cidade_selecionada = params[:cidade].to_s.strip
    scope = scope.where("nome LIKE ?", "%#{@busca}%") if @busca.present?
    scope = scope.where("LOWER(cidade) = ?", @cidade_selecionada.downcase) if @cidade_selecionada.present?

    @comunidades, @paginacao = paginar_web(scope)
    @cidades = Comunidade.distinct.order(:cidade).pluck(:cidade)
  end

  def show
    @membros = @comunidade.comunidade_membros.includes(:usuario).order(:adicionado_em)
    @proximos_eventos = @comunidade.eventos.where("data >= ?", Date.current).order(:data, :hora_inicio)
    @pode_gerenciar = Permissions.organizador?(current_user, @comunidade)
  end

  def new
    @comunidade = Comunidade.new
  end

  def create
    @comunidade = Comunidade.new(comunidade_params)
    @comunidade.criado_por = current_user

    if @comunidade.save
      redirect_to @comunidade, notice: "Comunidade criada com sucesso."
    else
      render :new, status: :unprocessable_content
    end
  end

  def edit
    unless Permissions.organizador?(current_user, @comunidade)
      redirect_to @comunidade, alert: "Apenas organizadores podem editar esta comunidade."
    end
  end

  def update
    unless Permissions.organizador?(current_user, @comunidade)
      redirect_to @comunidade, alert: "Apenas organizadores podem editar esta comunidade."
      return
    end

    if @comunidade.update(comunidade_params)
      redirect_to @comunidade, notice: "Comunidade atualizada com sucesso."
    else
      render :edit, status: :unprocessable_content
    end
  end

  def confirm_delete
    redirect_to @comunidade, alert: "Apenas organizadores podem excluir esta comunidade." unless Permissions.organizador?(current_user, @comunidade)
  end

  def destroy
    unless Permissions.organizador?(current_user, @comunidade)
      redirect_to @comunidade, alert: "Apenas organizadores podem excluir esta comunidade."
      return
    end

    # RN-COM-09
    if @comunidade.eventos.where("data >= ?", Date.current).exists?
      redirect_to @comunidade, alert: "Não é possível excluir uma comunidade com eventos futuros agendados."
      return
    end

    @comunidade.destroy
    redirect_to comunidades_path, notice: "Comunidade excluída com sucesso."
  end

  private

  def set_comunidade
    @comunidade = Comunidade.find(params[:id])
  end

  def comunidade_params
    params.require(:comunidade).permit(:nome, :descricao, :cidade, :contato, :logo_url)
  end
end
