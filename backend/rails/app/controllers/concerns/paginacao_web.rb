# Paginação simples (sem gem externa) para as listagens HTML — espelha o
# Paginator (12 por página) usado nas views de comunidade_list/evento_list
# do backend Django.
module PaginacaoWeb
  extend ActiveSupport::Concern

  private

  def paginar_web(scope, por_pagina: 12)
    total_itens = scope.count
    total_paginas = [(total_itens.to_f / por_pagina).ceil, 1].max

    pagina = params[:pagina].to_i
    pagina = 1 if pagina < 1
    pagina = total_paginas if pagina > total_paginas

    itens = scope.limit(por_pagina).offset((pagina - 1) * por_pagina)

    [itens, { pagina_atual: pagina, total_paginas: total_paginas, total_itens: total_itens }]
  end
end
