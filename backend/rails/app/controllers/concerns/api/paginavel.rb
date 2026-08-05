module Api
  # Espelha a função `_paginar` de core/api.py (Django) / PaginaResultados
  # (Laravel). Chama `render` diretamente com erro 400 quando os parâmetros
  # são inválidos — o chamador deve checar `performed?` depois.
  module Paginavel
    extend ActiveSupport::Concern

    private

    def paginar(scope, pagina:, limite:)
      pagina = pagina.to_i
      limite = limite.to_i

      if pagina < 1
        render json: { detail: "O parâmetro 'pagina' deve ser um número inteiro positivo." }, status: :bad_request
        return
      end

      if limite < 1 || limite > 100
        render json: { detail: "O parâmetro 'limite' deve estar entre 1 e 100." }, status: :bad_request
        return
      end

      total_itens = scope.count
      total_paginas = [(total_itens.to_f / limite).ceil, 1].max
      itens = scope.limit(limite).offset((pagina - 1) * limite).to_a

      [itens, { pagina_atual: pagina, total_paginas: total_paginas, total_itens: total_itens, limite: limite }]
    end
  end
end
