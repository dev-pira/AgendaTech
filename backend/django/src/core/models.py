import secrets
import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower

from core.validators import validate_contato, validate_logo_url


class User(AbstractUser):
    """Usuário da plataforma. Papéis (organizador/membro) são por comunidade,
    ver ComunidadeMembro — não existe flag global de papel no usuário."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='email')

    class Meta:
        verbose_name = 'usuário'
        verbose_name_plural = 'usuários'

    def __str__(self):
        return self.get_full_name() or self.username

    def nome_exibicao(self):
        return self.get_full_name() or self.username


class Token(models.Model):
    """Token de acesso simples (Bearer) usado pela API — ver core/api.py."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='auth_token'
    )
    key = models.CharField(max_length=64, unique=True, editable=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = secrets.token_hex(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Token({self.user})'


class Papel(models.TextChoices):
    ORGANIZADOR = 'organizador', 'Organizador'
    MEMBRO = 'membro', 'Membro'


class TipoEvento(models.TextChoices):
    PRESENCIAL = 'presencial', 'Presencial'
    ONLINE = 'online', 'Online'
    HIBRIDO = 'hibrido', 'Híbrido'


class Comunidade(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=100, verbose_name='nome')
    descricao = models.TextField(verbose_name='descrição')
    cidade = models.CharField(max_length=100, verbose_name='cidade')
    contato = models.CharField(
        max_length=255, verbose_name='contato', validators=[validate_contato]
    )
    logo_url = models.URLField(
        max_length=500, blank=True, verbose_name='logo', validators=[validate_logo_url]
    )
    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='comunidades_criadas',
        verbose_name='criado por',
    )
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='atualizado em')

    membros = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ComunidadeMembro',
        through_fields=('comunidade', 'usuario'),
        related_name='comunidades',
    )

    class Meta:
        verbose_name = 'comunidade'
        verbose_name_plural = 'comunidades'
        ordering = ['nome']
        constraints = [
            models.UniqueConstraint(Lower('nome'), name='unique_comunidade_nome_ci'),
        ]

    def __str__(self):
        return self.nome

    def clean(self):
        errors = {}
        if self.nome and not (3 <= len(self.nome) <= 100):
            errors['nome'] = 'O nome deve ter entre 3 e 100 caracteres.'
        if self.descricao and len(self.descricao) < 10:
            errors['descricao'] = 'A descrição deve ter no mínimo 10 caracteres.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class ComunidadeMembro(models.Model):
    comunidade = models.ForeignKey(
        Comunidade, on_delete=models.CASCADE, related_name='membros_vinculo'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vinculos_comunidade'
    )
    papel = models.CharField(max_length=20, choices=Papel.choices, default=Papel.MEMBRO)
    adicionado_em = models.DateTimeField(auto_now_add=True)
    adicionado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='membros_adicionados',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'membro da comunidade'
        verbose_name_plural = 'membros da comunidade'
        ordering = ['adicionado_em']
        constraints = [
            models.UniqueConstraint(
                fields=['comunidade', 'usuario'], name='unique_membro_por_comunidade'
            ),
        ]

    def __str__(self):
        return f'{self.usuario} — {self.comunidade} ({self.papel})'


class Evento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200, verbose_name='título')
    descricao = models.TextField(verbose_name='descrição')
    data = models.DateField(verbose_name='data')
    hora_inicio = models.TimeField(verbose_name='hora de início')
    hora_fim = models.TimeField(null=True, blank=True, verbose_name='hora de fim')
    local = models.CharField(max_length=300, verbose_name='local')
    tipo = models.CharField(max_length=20, choices=TipoEvento.choices, verbose_name='tipo')
    url_online = models.URLField(max_length=500, blank=True, verbose_name='URL online')
    comunidade = models.ForeignKey(
        Comunidade, on_delete=models.CASCADE, related_name='eventos', verbose_name='comunidade'
    )
    organizador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='eventos_organizados',
        verbose_name='organizador',
    )
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='atualizado em')

    class Meta:
        verbose_name = 'evento'
        verbose_name_plural = 'eventos'
        ordering = ['data', 'hora_inicio']
        constraints = [
            models.UniqueConstraint(
                fields=['comunidade', 'titulo', 'data'],
                name='unique_evento_titulo_data_por_comunidade',
            ),
            models.CheckConstraint(
                condition=Q(hora_fim__isnull=True) | Q(hora_fim__gt=F('hora_inicio')),
                name='evento_hora_fim_apos_hora_inicio',
            ),
        ]

    def __str__(self):
        return f'{self.titulo} ({self.data})'

    def clean(self):
        errors = {}
        if self.titulo and not (5 <= len(self.titulo) <= 200):
            errors['titulo'] = 'O título deve ter entre 5 e 200 caracteres.'
        if self.descricao and len(self.descricao) < 20:
            errors['descricao'] = 'A descrição deve ter no mínimo 20 caracteres.'
        if self.tipo in (TipoEvento.ONLINE, TipoEvento.HIBRIDO) and not self.url_online:
            errors['url_online'] = (
                "url_online é obrigatório quando tipo é 'online' ou 'hibrido'."
            )
        if self.hora_fim and self.hora_inicio and self.hora_fim <= self.hora_inicio:
            errors['hora_fim'] = 'hora_fim deve ser posterior a hora_inicio.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
