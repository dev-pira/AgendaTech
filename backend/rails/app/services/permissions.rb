# Checagens de papel usadas tanto pela API (Controllers::Api) quanto pelas
# views server-rendered — mantidas em um único lugar para não divergir
# entre as duas superfícies. Espelha core/permissions.py (Django) /
# app/Support/Permissions.php (Laravel).
module Permissions
  def self.organizador?(user, comunidade)
    return false unless user

    ComunidadeMembro.exists?(comunidade_id: comunidade.id, usuario_id: user.id, papel: ComunidadeMembro::ORGANIZADOR)
  end

  def self.membro_ou_organizador?(user, comunidade)
    return false unless user

    ComunidadeMembro.exists?(comunidade_id: comunidade.id, usuario_id: user.id)
  end
end
