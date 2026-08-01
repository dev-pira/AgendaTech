"""Checagens de papel usadas tanto pela API (core/api.py) quanto pelas
views server-rendered (core/views.py) — mantidas em um único lugar para
não divergir entre as duas superfícies."""
from core.models import ComunidadeMembro, Papel


def is_organizador(user, comunidade) -> bool:
    return ComunidadeMembro.objects.filter(
        comunidade=comunidade, usuario=user, papel=Papel.ORGANIZADOR
    ).exists()


def is_membro_ou_organizador(user, comunidade) -> bool:
    return ComunidadeMembro.objects.filter(comunidade=comunidade, usuario=user).exists()
