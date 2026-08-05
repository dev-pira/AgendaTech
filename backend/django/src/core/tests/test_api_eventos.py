import json
from datetime import date, timedelta

from django.test import TestCase

from core.models import Evento, TipoEvento

from .helpers import add_membro, auth_header, make_comunidade, make_evento, make_user


class ListarEventosTest(TestCase):
    def test_retorna_200_com_envelope_de_paginacao(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        make_evento(comunidade, organizador)

        response = self.client.get('/api/eventos')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['dados']), 1)
        self.assertEqual(data['paginacao']['total_itens'], 1)

    def test_filtra_por_comunidade(self):
        organizador = make_user()
        comunidade_a = make_comunidade(organizador, nome='Comunidade A')
        comunidade_b = make_comunidade(organizador, nome='Comunidade B')
        make_evento(comunidade_a, organizador, titulo='Evento da comunidade A')
        make_evento(comunidade_b, organizador, titulo='Evento da comunidade B')

        response = self.client.get(f'/api/eventos?comunidade_id={comunidade_a.id}')

        data = response.json()
        self.assertEqual(len(data['dados']), 1)
        self.assertEqual(data['dados'][0]['titulo'], 'Evento da comunidade A')

    def test_resposta_inclui_comunidade_e_organizador_aninhados(self):
        organizador = make_user(username='maria', first_name='Maria', last_name='Santos')
        comunidade = make_comunidade(organizador, nome='DevLimeira')
        make_evento(comunidade, organizador)

        response = self.client.get('/api/eventos')

        item = response.json()['dados'][0]
        self.assertEqual(item['comunidade']['nome'], 'DevLimeira')
        self.assertEqual(item['organizador']['nome'], 'Maria Santos')


class ObterEventoTest(TestCase):
    def test_retorna_200(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        evento = make_evento(comunidade, organizador, titulo='Meetup React Avançado')

        response = self.client.get(f'/api/eventos/{evento.id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['titulo'], 'Meetup React Avançado')

    def test_id_inexistente_retorna_404(self):
        response = self.client.get('/api/eventos/00000000-0000-0000-0000-000000000000')
        self.assertEqual(response.status_code, 404)


class CriarEventoTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.url = '/api/eventos'
        self.payload = {
            'titulo': 'Workshop Node.js',
            'descricao': 'Hands-on de criação de APIs REST com Express.',
            'data': str(date.today() + timedelta(days=15)),
            'hora_inicio': '14:00:00',
            'hora_fim': '18:00:00',
            'local': 'Espaço Maker - Av. Principal, 500',
            'tipo': 'presencial',
            'comunidade_id': str(self.comunidade.id),
        }

    def _post(self, payload=None, headers=None):
        return self.client.post(
            self.url,
            data=json.dumps(payload if payload is not None else self.payload),
            content_type='application/json',
            **(headers or {}),
        )

    def test_sem_autenticacao_retorna_401(self):
        response = self._post()
        self.assertEqual(response.status_code, 401)

    def test_membro_cria_com_sucesso(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        response = self._post(headers=auth_header(membro))
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Evento.objects.filter(titulo='Workshop Node.js').exists())

    def test_nao_membro_recebe_403(self):
        estranho = make_user()
        response = self._post(headers=auth_header(estranho))
        self.assertEqual(response.status_code, 403)

    def test_data_passada_retorna_400(self):
        payload = dict(self.payload, data=str(date.today() - timedelta(days=1)))
        response = self._post(payload, headers=auth_header(self.organizador))
        self.assertEqual(response.status_code, 400)

    def test_evento_duplicado_retorna_409(self):
        self._post(headers=auth_header(self.organizador))
        response = self._post(headers=auth_header(self.organizador))
        self.assertEqual(response.status_code, 409)

    def test_tipo_online_sem_url_retorna_400(self):
        payload = dict(self.payload, tipo='online', titulo='Live Online')
        response = self._post(payload, headers=auth_header(self.organizador))
        self.assertEqual(response.status_code, 400)


class AtualizarEventoTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.evento = make_evento(self.comunidade, self.organizador, titulo='Tech Talk')
        self.url = f'/api/eventos/{self.evento.id}'

    def _put(self, payload, headers):
        return self.client.put(
            self.url, data=json.dumps(payload), content_type='application/json', **headers
        )

    def test_organizador_atualiza_com_sucesso(self):
        response = self._put(
            {'titulo': 'Tech Talk - Edição Especial'}, auth_header(self.organizador)
        )
        self.assertEqual(response.status_code, 200)
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.titulo, 'Tech Talk - Edição Especial')

    def test_membro_sem_ser_organizador_recebe_403(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        response = self._put({'titulo': 'Outro título'}, auth_header(membro))
        self.assertEqual(response.status_code, 403)

    def test_evento_passado_nao_pode_ser_editado(self):
        evento_passado = make_evento(
            self.comunidade, self.organizador, data=date.today() - timedelta(days=1)
        )
        response = self.client.put(
            f'/api/eventos/{evento_passado.id}',
            data=json.dumps({'titulo': 'Tentativa de edição'}),
            content_type='application/json',
            **auth_header(self.organizador),
        )
        self.assertEqual(response.status_code, 400)


class ExcluirEventoTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.evento = make_evento(self.comunidade, self.organizador, titulo='Coding Dojo')
        self.url = f'/api/eventos/{self.evento.id}'

    def test_organizador_exclui_com_sucesso(self):
        response = self.client.delete(self.url, **auth_header(self.organizador))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Evento.objects.filter(pk=self.evento.pk).exists())

    def test_evento_passado_nao_pode_ser_excluido(self):
        evento_passado = make_evento(
            self.comunidade, self.organizador, data=date.today() - timedelta(days=1)
        )
        response = self.client.delete(
            f'/api/eventos/{evento_passado.id}', **auth_header(self.organizador)
        )
        self.assertEqual(response.status_code, 400)

    def test_nao_organizador_recebe_403(self):
        outro = make_user()
        response = self.client.delete(self.url, **auth_header(outro))
        self.assertEqual(response.status_code, 403)
