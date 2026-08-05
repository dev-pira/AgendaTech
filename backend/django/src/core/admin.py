from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from core.models import Comunidade, ComunidadeMembro, Evento, Token, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass


class ComunidadeMembroInline(admin.TabularInline):
    model = ComunidadeMembro
    extra = 0


@admin.register(Comunidade)
class ComunidadeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cidade', 'criado_por', 'criado_em')
    search_fields = ('nome', 'cidade')
    inlines = [ComunidadeMembroInline]


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'comunidade', 'data', 'hora_inicio', 'tipo')
    list_filter = ('tipo', 'comunidade')
    search_fields = ('titulo',)


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'criado_em')
