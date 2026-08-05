from datetime import date, timedelta

from django.contrib.auth import get_user_model

from core.models import Comunidade, ComunidadeMembro, Evento, Papel, Token, TipoEvento

User = get_user_model()

_seq = {'n': 0}


def _next_seq():
    _seq['n'] += 1
    return _seq['n']


def make_user(**overrides):
    n = _next_seq()
    defaults = {
        'username': f'user{n}',
        'email': f'user{n}@example.com',
        'password': 'StrongPass123!',
    }
    defaults.update(overrides)
    return User.objects.create_user(**defaults)


def auth_header(user):
    token, _ = Token.objects.get_or_create(user=user)
    return {'HTTP_AUTHORIZATION': f'Bearer {token.key}'}


def make_comunidade(criador, **overrides):
    n = _next_seq()
    defaults = {
        'nome': f'Comunidade {n}',
        'descricao': 'Uma comunidade de tecnologia para testes automatizados.',
        'cidade': 'Piracicaba',
        'contato': 'contato@example.com',
        'criado_por': criador,
    }
    defaults.update(overrides)
    comunidade = Comunidade.objects.create(**defaults)
    ComunidadeMembro.objects.create(
        comunidade=comunidade, usuario=criador, papel=Papel.ORGANIZADOR, adicionado_por=criador
    )
    return comunidade


def add_membro(comunidade, usuario, papel=Papel.MEMBRO, adicionado_por=None):
    return ComunidadeMembro.objects.create(
        comunidade=comunidade, usuario=usuario, papel=papel, adicionado_por=adicionado_por
    )


def make_evento(comunidade, organizador, **overrides):
    n = _next_seq()
    defaults = {
        'titulo': f'Evento de teste {n}',
        'descricao': 'Descrição detalhada do evento de teste automatizado.',
        'data': date.today() + timedelta(days=7),
        'hora_inicio': '19:00',
        'local': 'Rua dos Devs, 100',
        'tipo': TipoEvento.PRESENCIAL,
        'comunidade': comunidade,
        'organizador': organizador,
    }
    defaults.update(overrides)
    return Evento.objects.create(**defaults)
