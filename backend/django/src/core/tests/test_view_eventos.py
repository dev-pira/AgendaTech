from datetime import date, timedelta

from django.test import TestCase

from core.models import Evento

from .helpers import add_membro, make_comunidade, make_evento, make_user


class EventoListViewTest(TestCase):
    def test_retorna_200_e_lista_eventos(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        make_evento(comunidade, organizador, titulo='Meetup React Avançado')

        response = self.client.get('/eventos/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Meetup React Avançado')

    def test_filtra_por_comunidade(self):
        organizador = make_user()
        comunidade_a = make_comunidade(organizador, nome='Comunidade A')
        comunidade_b = make_comunidade(organizador, nome='Comunidade B')
        make_evento(comunidade_a, organizador, titulo='Evento A')
        make_evento(comunidade_b, organizador, titulo='Evento B')

        response = self.client.get(f'/eventos/?comunidade={comunidade_a.id}')

        self.assertContains(response, 'Evento A')
        self.assertNotContains(response, 'Evento B')

    def test_sem_resultados_mostra_mensagem_vazia(self):
        response = self.client.get('/eventos/')
        self.assertContains(response, 'Nenhum evento encontrado')


class EventoDetailViewTest(TestCase):
    def test_retorna_200_com_dados(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        evento = make_evento(comunidade, organizador, titulo='Workshop Node.js')

        response = self.client.get(f'/eventos/{evento.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Workshop Node.js')

    def test_id_inexistente_retorna_404(self):
        response = self.client.get('/eventos/00000000-0000-0000-0000-000000000000/')
        self.assertEqual(response.status_code, 404)

    def test_botoes_de_gestao_ocultos_para_evento_passado(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        evento_passado = make_evento(
            comunidade, organizador, data=date.today() - timedelta(days=1)
        )
        self.client.force_login(organizador)
        response = self.client.get(f'/eventos/{evento_passado.id}/')
        self.assertNotContains(response, f'/eventos/{evento_passado.id}/editar/')


class EventoCreateViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.url = '/eventos/novo/'
        self.payload = {
            'titulo': 'Workshop Node.js',
            'descricao': 'Hands-on de criação de APIs REST com Express.',
            'data': str(date.today() + timedelta(days=15)),
            'hora_inicio': '14:00',
            'hora_fim': '18:00',
            'local': 'Espaço Maker - Av. Principal, 500',
            'tipo': 'presencial',
            'url_online': '',
            'comunidade': str(self.comunidade.id),
        }

    def test_anonimo_e_redirecionado_para_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

    def test_usuario_sem_comunidade_e_redirecionado(self):
        estranho = make_user()
        self.client.force_login(estranho)
        response = self.client.get(self.url)
        self.assertRedirects(response, '/comunidades/')

    def test_membro_cria_com_sucesso(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        self.client.force_login(membro)
        response = self.client.post(self.url, self.payload)
        evento = Evento.objects.get(titulo='Workshop Node.js')
        self.assertRedirects(response, f'/eventos/{evento.id}/')

    def test_data_passada_reexibe_formulario_com_erro(self):
        self.client.force_login(self.organizador)
        payload = dict(self.payload, data=str(date.today() - timedelta(days=1)))
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'deve ser futura')


class EventoUpdateViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.evento = make_evento(self.comunidade, self.organizador, titulo='Tech Talk')
        self.url = f'/eventos/{self.evento.id}/editar/'

    def _payload(self, **overrides):
        data = {
            'titulo': 'Tech Talk - Edição Especial',
            'descricao': self.evento.descricao,
            'data': str(self.evento.data),
            'hora_inicio': str(self.evento.hora_inicio),
            'hora_fim': '',
            'local': self.evento.local,
            'tipo': self.evento.tipo,
            'url_online': '',
            'comunidade': str(self.comunidade.id),
        }
        data.update(overrides)
        return data

    def test_organizador_atualiza_com_sucesso(self):
        self.client.force_login(self.organizador)
        response = self.client.post(self.url, self._payload())
        self.assertRedirects(response, f'/eventos/{self.evento.id}/')
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.titulo, 'Tech Talk - Edição Especial')

    def test_membro_sem_ser_organizador_e_redirecionado(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        self.client.force_login(membro)
        response = self.client.get(self.url)
        self.assertRedirects(response, f'/eventos/{self.evento.id}/')

    def test_evento_passado_nao_pode_ser_editado(self):
        evento_passado = make_evento(
            self.comunidade, self.organizador, data=date.today() - timedelta(days=1)
        )
        self.client.force_login(self.organizador)
        response = self.client.get(f'/eventos/{evento_passado.id}/editar/')
        self.assertRedirects(response, f'/eventos/{evento_passado.id}/')


class EventoDeleteViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)
        self.evento = make_evento(self.comunidade, self.organizador, titulo='Coding Dojo')
        self.url = f'/eventos/{self.evento.id}/excluir/'

    def test_get_retorna_pagina_de_confirmacao(self):
        self.client.force_login(self.organizador)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Confirmar exclusão')

    def test_post_exclui_e_redireciona(self):
        self.client.force_login(self.organizador)
        response = self.client.post(self.url)
        self.assertRedirects(response, '/eventos/')
        self.assertFalse(Evento.objects.filter(pk=self.evento.pk).exists())

    def test_evento_passado_nao_pode_ser_excluido(self):
        evento_passado = make_evento(
            self.comunidade, self.organizador, data=date.today() - timedelta(days=1)
        )
        self.client.force_login(self.organizador)
        response = self.client.post(f'/eventos/{evento_passado.id}/excluir/')
        self.assertRedirects(response, f'/eventos/{evento_passado.id}/')
        self.assertTrue(Evento.objects.filter(pk=evento_passado.pk).exists())

    def test_nao_organizador_e_redirecionado(self):
        outro = make_user()
        self.client.force_login(outro)
        response = self.client.post(self.url)
        self.assertRedirects(response, f'/eventos/{self.evento.id}/')
        self.assertTrue(Evento.objects.filter(pk=self.evento.pk).exists())
