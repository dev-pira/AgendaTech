import json
from datetime import date, timedelta

from django.test import TestCase

from core.models import Comunidade

from .helpers import add_membro, auth_header, make_comunidade, make_evento, make_user


class ListarComunidadesTest(TestCase):
    def test_retorna_200_com_envelope_de_paginacao(self):
        organizador = make_user()
        make_comunidade(organizador, nome='DEVPIRA')
        make_comunidade(organizador, nome='DevLimeira')

        response = self.client.get('/api/comunidades')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['dados']), 2)
        self.assertEqual(data['paginacao']['total_itens'], 2)

    def test_filtra_por_cidade(self):
        organizador = make_user()
        make_comunidade(organizador, nome='DEVPIRA', cidade='Piracicaba')
        make_comunidade(organizador, nome='DevLimeira', cidade='Limeira')

        response = self.client.get('/api/comunidades?cidade=Limeira')

        data = response.json()
        self.assertEqual(len(data['dados']), 1)
        self.assertEqual(data['dados'][0]['nome'], 'DevLimeira')

    def test_pagina_negativa_retorna_400(self):
        response = self.client.get('/api/comunidades?pagina=-1')
        self.assertEqual(response.status_code, 400)

    def test_total_membros_incluido_na_resposta(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        add_membro(comunidade, make_user())

        response = self.client.get('/api/comunidades')

        self.assertEqual(response.json()['dados'][0]['total_membros'], 2)


class ObterComunidadeTest(TestCase):
    def test_retorna_200_com_dados_completos(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador, nome='DEVPIRA')

        response = self.client.get(f'/api/comunidades/{comunidade.id}')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['nome'], 'DEVPIRA')
        self.assertEqual(len(data['membros']), 1)
        self.assertEqual(data['membros'][0]['papel'], 'organizador')

    def test_id_inexistente_retorna_404(self):
        response = self.client.get('/api/comunidades/00000000-0000-0000-0000-000000000000')
        self.assertEqual(response.status_code, 404)


class CriarComunidadeTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.url = '/api/comunidades'
        self.payload = {
            'nome': 'DevCity',
            'descricao': 'Comunidade local de desenvolvedores.',
            'cidade': 'São Paulo',
            'contato': 'dev@city.com',
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

    def test_cria_com_sucesso_e_retorna_201(self):
        response = self._post(headers=auth_header(self.organizador))
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Comunidade.objects.filter(nome='DevCity').exists())

    def test_criador_vira_organizador_automaticamente(self):
        response = self._post(headers=auth_header(self.organizador))
        data = response.json()
        membro = data['membros'][0]
        self.assertEqual(membro['papel'], 'organizador')

    def test_nome_ausente_retorna_400_ou_422(self):
        payload = dict(self.payload)
        del payload['nome']
        response = self._post(payload, headers=auth_header(self.organizador))
        self.assertIn(response.status_code, (400, 422))

    def test_nome_duplicado_retorna_409(self):
        make_comunidade(self.organizador, nome='DevCity')
        response = self._post(headers=auth_header(self.organizador))
        self.assertEqual(response.status_code, 409)


class AtualizarComunidadeTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador, nome='DEVPIRA')
        self.url = f'/api/comunidades/{self.comunidade.id}'

    def _put(self, payload, headers):
        return self.client.put(
            self.url, data=json.dumps(payload), content_type='application/json', **headers
        )

    def test_organizador_atualiza_com_sucesso(self):
        response = self._put(
            {'nome': 'DEVPIRA - Piracicaba'}, auth_header(self.organizador)
        )
        self.assertEqual(response.status_code, 200)
        self.comunidade.refresh_from_db()
        self.assertEqual(self.comunidade.nome, 'DEVPIRA - Piracicaba')

    def test_membro_sem_ser_organizador_recebe_403(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        response = self._put({'nome': 'Outro nome'}, auth_header(membro))
        self.assertEqual(response.status_code, 403)

    def test_comunidade_inexistente_retorna_404(self):
        response = self.client.put(
            '/api/comunidades/00000000-0000-0000-0000-000000000000',
            data=json.dumps({'nome': 'X'}),
            content_type='application/json',
            **auth_header(self.organizador),
        )
        self.assertEqual(response.status_code, 404)


class ExcluirComunidadeTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador, nome='DevTest')
        self.url = f'/api/comunidades/{self.comunidade.id}'

    def test_organizador_exclui_com_sucesso(self):
        response = self.client.delete(self.url, **auth_header(self.organizador))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Comunidade.objects.filter(pk=self.comunidade.pk).exists())

    def test_com_evento_futuro_retorna_400(self):
        make_evento(self.comunidade, self.organizador, data=date.today() + timedelta(days=5))
        response = self.client.delete(self.url, **auth_header(self.organizador))
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Comunidade.objects.filter(pk=self.comunidade.pk).exists())

    def test_nao_organizador_recebe_403(self):
        outro = make_user()
        response = self.client.delete(self.url, **auth_header(outro))
        self.assertEqual(response.status_code, 403)
