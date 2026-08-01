"""API REST do Agenda Tech, construída com django-ninja.

Documentação interativa gerada automaticamente pelo Ninja em /api/docs
(Swagger UI) e o schema OpenAPI cru em /api/openapi.json.

Autenticação: Bearer token simples (ver model Token). Para obter um
token, use POST /api/auth/token com username/password de um usuário
já criado (via createsuperuser ou Django admin). Esse endpoint de
login não está no escopo funcional original — foi adicionado aqui
como a peça de infraestrutura necessária para exercitar o fluxo
"Authorization: Bearer <token>" documentado em docs/escopo-funcional.md.
"""
import uuid
from datetime import date, datetime, time
from typing import Literal

from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.paginator import EmptyPage, Paginator
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.responses import Status
from ninja.security import HttpBearer

from core.models import Comunidade, ComunidadeMembro, Evento, Papel, Token
from core.permissions import is_membro_ou_organizador, is_organizador

api = NinjaAPI(
    title='Agenda Tech API',
    version='1.0.0',
    description=(
        'API REST para gerenciamento de comunidades e eventos de tecnologia. '
        'Contrato conforme docs/escopo-funcional.md.'
    ),
)


# ── Autenticação ─────────────────────────────────────────────────────────────

class AuthBearer(HttpBearer):
    def authenticate(self, request, token: str):
        try:
            return Token.objects.select_related('user').get(key=token).user
        except Token.DoesNotExist:
            return None


auth_bearer = AuthBearer()


class TokenIn(Schema):
    username: str
    password: str


class TokenOut(Schema):
    token: str


@api.post('/auth/token', response=TokenOut, tags=['auth'], summary='Obtém um token Bearer')
def obter_token(request, payload: TokenIn):
    user = authenticate(request, username=payload.username, password=payload.password)
    if user is None:
        raise HttpError(401, 'Credenciais inválidas.')
    token, _ = Token.objects.get_or_create(user=user)
    return {'token': token.key}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _format_validation_error(exc: DjangoValidationError) -> str:
    if hasattr(exc, 'message_dict'):
        partes = [f"{campo}: {'; '.join(msgs)}" for campo, msgs in exc.message_dict.items()]
        return ' | '.join(partes)
    return '; '.join(exc.messages)


def _paginar(queryset, pagina: int, limite: int):
    if pagina < 1:
        raise HttpError(400, "O parâmetro 'pagina' deve ser um número inteiro positivo.")
    if not (1 <= limite <= 100):
        raise HttpError(400, "O parâmetro 'limite' deve estar entre 1 e 100.")
    paginator = Paginator(queryset, limite)
    try:
        itens = list(paginator.page(pagina).object_list) if paginator.count else []
    except EmptyPage:
        itens = []
    return itens, {
        'pagina_atual': pagina,
        'total_paginas': paginator.num_pages,
        'total_itens': paginator.count,
        'limite': limite,
    }


# ── Schemas: Comunidade ──────────────────────────────────────────────────────

class UsuarioResumoOut(Schema):
    id: uuid.UUID
    nome: str

    @staticmethod
    def resolve_nome(obj):
        return obj.nome_exibicao()


class PaginacaoOut(Schema):
    pagina_atual: int
    total_paginas: int
    total_itens: int
    limite: int


class ComunidadeOut(Schema):
    id: uuid.UUID
    nome: str
    descricao: str
    cidade: str
    contato: str
    logo_url: str
    criado_em: datetime
    total_membros: int

    @staticmethod
    def resolve_total_membros(obj):
        return obj.membros.count()


class MembroOut(Schema):
    usuario_id: uuid.UUID
    nome: str
    papel: str


class ComunidadeDetailOut(ComunidadeOut):
    atualizado_em: datetime
    criado_por: UsuarioResumoOut
    membros: list[MembroOut]

    @staticmethod
    def resolve_membros(obj):
        return [
            {'usuario_id': cm.usuario_id, 'nome': cm.usuario.nome_exibicao(), 'papel': cm.papel}
            for cm in obj.membros_vinculo.select_related('usuario').all()
        ]


class ComunidadeListOut(Schema):
    dados: list[ComunidadeOut]
    paginacao: PaginacaoOut


class ComunidadeCreateIn(Schema):
    nome: str
    descricao: str
    cidade: str
    contato: str
    logo_url: str | None = None


class ComunidadeUpdateIn(Schema):
    nome: str | None = None
    descricao: str | None = None
    cidade: str | None = None
    contato: str | None = None
    logo_url: str | None = None


# ── Schemas: Evento ──────────────────────────────────────────────────────────

class ComunidadeResumoOut(Schema):
    id: uuid.UUID
    nome: str


class ComunidadeResumoComCidadeOut(ComunidadeResumoOut):
    cidade: str


class EventoOut(Schema):
    id: uuid.UUID
    titulo: str
    descricao: str
    data: date
    hora_inicio: time
    hora_fim: time | None
    local: str
    tipo: str
    comunidade: ComunidadeResumoOut
    organizador: UsuarioResumoOut


class EventoDetailOut(EventoOut):
    url_online: str
    comunidade: ComunidadeResumoComCidadeOut
    criado_em: datetime
    atualizado_em: datetime


class EventoListOut(Schema):
    dados: list[EventoOut]
    paginacao: PaginacaoOut


class EventoCreateIn(Schema):
    titulo: str
    descricao: str
    data: date
    hora_inicio: time
    hora_fim: time | None = None
    local: str
    tipo: Literal['presencial', 'online', 'hibrido']
    url_online: str | None = None
    comunidade_id: uuid.UUID


class EventoUpdateIn(Schema):
    titulo: str | None = None
    descricao: str | None = None
    data: date | None = None
    hora_inicio: time | None = None
    hora_fim: time | None = None
    local: str | None = None
    tipo: Literal['presencial', 'online', 'hibrido'] | None = None
    url_online: str | None = None


# ── Endpoints: Comunidades ───────────────────────────────────────────────────

@api.get('/comunidades', response=ComunidadeListOut, tags=['comunidades'])
def listar_comunidades(request, cidade: str = None, pagina: int = 1, limite: int = 20):
    qs = Comunidade.objects.all()
    if cidade:
        qs = qs.filter(cidade__iexact=cidade)
    itens, paginacao = _paginar(qs, pagina, limite)
    return {'dados': itens, 'paginacao': paginacao}


@api.get('/comunidades/{comunidade_id}', response=ComunidadeDetailOut, tags=['comunidades'])
def obter_comunidade(request, comunidade_id: uuid.UUID):
    return get_object_or_404(Comunidade, pk=comunidade_id)


@api.post('/comunidades', response={201: ComunidadeDetailOut}, auth=auth_bearer, tags=['comunidades'])
def criar_comunidade(request, payload: ComunidadeCreateIn):
    if Comunidade.objects.filter(nome__iexact=payload.nome).exists():
        raise HttpError(409, 'Já existe uma comunidade com este nome.')
    try:
        comunidade = Comunidade.objects.create(
            nome=payload.nome,
            descricao=payload.descricao,
            cidade=payload.cidade,
            contato=payload.contato,
            logo_url=payload.logo_url or '',
            criado_por=request.auth,
        )
    except DjangoValidationError as exc:
        raise HttpError(400, _format_validation_error(exc))
    except IntegrityError:
        raise HttpError(409, 'Já existe uma comunidade com este nome.')
    # RN-COM-08 / RN-ORG-04: criador é automaticamente organizador
    ComunidadeMembro.objects.create(
        comunidade=comunidade, usuario=request.auth, papel=Papel.ORGANIZADOR, adicionado_por=request.auth
    )
    return Status(201, comunidade)


@api.put('/comunidades/{comunidade_id}', response=ComunidadeDetailOut, auth=auth_bearer, tags=['comunidades'])
def atualizar_comunidade(request, comunidade_id: uuid.UUID, payload: ComunidadeUpdateIn):
    comunidade = get_object_or_404(Comunidade, pk=comunidade_id)
    if not is_organizador(request.auth, comunidade):
        raise HttpError(403, 'Apenas organizadores podem editar esta comunidade.')

    dados = payload.model_dump(exclude_unset=True)
    if 'nome' in dados and Comunidade.objects.exclude(pk=comunidade.pk).filter(
        nome__iexact=dados['nome']
    ).exists():
        raise HttpError(409, 'Já existe uma comunidade com este nome.')

    for campo, valor in dados.items():
        setattr(comunidade, campo, valor)
    try:
        comunidade.save()
    except DjangoValidationError as exc:
        raise HttpError(400, _format_validation_error(exc))
    except IntegrityError:
        raise HttpError(409, 'Já existe uma comunidade com este nome.')
    return comunidade


@api.delete('/comunidades/{comunidade_id}', response={204: None}, auth=auth_bearer, tags=['comunidades'])
def excluir_comunidade(request, comunidade_id: uuid.UUID):
    comunidade = get_object_or_404(Comunidade, pk=comunidade_id)
    if not is_organizador(request.auth, comunidade):
        raise HttpError(403, 'Apenas organizadores podem excluir esta comunidade.')
    # RN-COM-09: não excluir comunidade com eventos futuros agendados
    if comunidade.eventos.filter(data__gte=date.today()).exists():
        raise HttpError(400, 'Não é possível excluir uma comunidade com eventos futuros agendados.')
    comunidade.delete()
    return Status(204, None)


@api.get('/comunidades/{comunidade_id}/eventos', response=EventoListOut, tags=['comunidades'])
def listar_eventos_da_comunidade(
    request,
    comunidade_id: uuid.UUID,
    data_inicio: date = None,
    data_fim: date = None,
    pagina: int = 1,
    limite: int = 20,
):
    comunidade = get_object_or_404(Comunidade, pk=comunidade_id)
    qs = comunidade.eventos.select_related('comunidade', 'organizador').all()
    if data_inicio:
        qs = qs.filter(data__gte=data_inicio)
    if data_fim:
        qs = qs.filter(data__lte=data_fim)
    itens, paginacao = _paginar(qs, pagina, limite)
    return {'dados': itens, 'paginacao': paginacao}


# ── Endpoints: Eventos ───────────────────────────────────────────────────────

@api.get('/eventos', response=EventoListOut, tags=['eventos'])
def listar_eventos(
    request,
    comunidade_id: uuid.UUID = None,
    cidade: str = None,
    data_inicio: date = None,
    data_fim: date = None,
    tipo: str = None,
    pagina: int = 1,
    limite: int = 20,
):
    qs = Evento.objects.select_related('comunidade', 'organizador').all()
    if comunidade_id:
        qs = qs.filter(comunidade_id=comunidade_id)
    if cidade:
        qs = qs.filter(comunidade__cidade__iexact=cidade)
    if data_inicio:
        qs = qs.filter(data__gte=data_inicio)
    if data_fim:
        qs = qs.filter(data__lte=data_fim)
    if tipo:
        qs = qs.filter(tipo=tipo)
    itens, paginacao = _paginar(qs, pagina, limite)
    return {'dados': itens, 'paginacao': paginacao}


@api.get('/eventos/{evento_id}', response=EventoDetailOut, tags=['eventos'])
def obter_evento(request, evento_id: uuid.UUID):
    return get_object_or_404(
        Evento.objects.select_related('comunidade', 'organizador'), pk=evento_id
    )


@api.post('/eventos', response={201: EventoDetailOut}, auth=auth_bearer, tags=['eventos'])
def criar_evento(request, payload: EventoCreateIn):
    comunidade = get_object_or_404(Comunidade, pk=payload.comunidade_id)
    # RN-EVT-07
    if not is_membro_ou_organizador(request.auth, comunidade):
        raise HttpError(
            403, 'Você precisa ser membro ou organizador desta comunidade para criar eventos.'
        )
    # RN-EVT-04
    if payload.data < date.today():
        raise HttpError(400, 'A data do evento deve ser futura ou igual à data atual.')
    # RN-EVT-09
    if Evento.objects.filter(
        comunidade=comunidade, titulo__iexact=payload.titulo, data=payload.data
    ).exists():
        raise HttpError(409, 'Já existe um evento com este título nesta data para esta comunidade.')

    try:
        evento = Evento.objects.create(
            titulo=payload.titulo,
            descricao=payload.descricao,
            data=payload.data,
            hora_inicio=payload.hora_inicio,
            hora_fim=payload.hora_fim,
            local=payload.local,
            tipo=payload.tipo,
            url_online=payload.url_online or '',
            comunidade=comunidade,
            organizador=request.auth,
        )
    except DjangoValidationError as exc:
        raise HttpError(400, _format_validation_error(exc))
    except IntegrityError:
        raise HttpError(409, 'Já existe um evento com este título nesta data para esta comunidade.')
    return Status(201, evento)


@api.put('/eventos/{evento_id}', response=EventoDetailOut, auth=auth_bearer, tags=['eventos'])
def atualizar_evento(request, evento_id: uuid.UUID, payload: EventoUpdateIn):
    evento = get_object_or_404(Evento, pk=evento_id)
    if not is_organizador(request.auth, evento.comunidade):
        raise HttpError(403, 'Apenas organizadores da comunidade podem editar este evento.')
    # RN-EVT-10
    if evento.data < date.today():
        raise HttpError(400, 'Não é possível editar eventos que já ocorreram.')

    dados = payload.model_dump(exclude_unset=True)
    for campo, valor in dados.items():
        setattr(evento, campo, valor)
    try:
        evento.save()
    except DjangoValidationError as exc:
        raise HttpError(400, _format_validation_error(exc))
    except IntegrityError:
        raise HttpError(409, 'Já existe um evento com este título nesta data para esta comunidade.')
    return evento


@api.delete('/eventos/{evento_id}', response={204: None}, auth=auth_bearer, tags=['eventos'])
def excluir_evento(request, evento_id: uuid.UUID):
    evento = get_object_or_404(Evento, pk=evento_id)
    if not is_organizador(request.auth, evento.comunidade):
        raise HttpError(403, 'Apenas organizadores da comunidade podem excluir este evento.')
    # RN-EVT-10
    if evento.data < date.today():
        raise HttpError(400, 'Não é possível excluir eventos que já ocorreram.')
    evento.delete()
    return Status(204, None)
