from datetime import date, timedelta

from django.test import TestCase

from core.models import Comunidade

from .helpers import add_membro, make_comunidade, make_evento, make_user


class ComunidadeListViewTest(TestCase):
    def test_retorna_200_e_lista_comunidades(self):
        organizador = make_user()
        make_comunidade(organizador, nome='DEVPIRA')
        make_comunidade(organizador, nome='DevLimeira')

        response = self.client.get('/comunidades/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'DEVPIRA')
        self.assertContains(response, 'DevLimeira')

    def test_filtra_por_busca(self):
        organizador = make_user()
        make_comunidade(organizador, nome='DEVPIRA')
        make_comunidade(organizador, nome='DevLimeira')

        response = self.client.get('/comunidades/?busca=DEVPIRA')

        self.assertContains(response, 'DEVPIRA')
        self.assertNotContains(response, 'DevLimeira')

    def test_filtra_por_cidade(self):
        organizador = make_user()
        make_comunidade(organizador, nome='PiraTech', cidade='Piracicaba')
        make_comunidade(organizador, nome='DevLimeira', cidade='Limeira')

        response = self.client.get('/comunidades/?cidade=Limeira')

        self.assertNotContains(response, 'PiraTech')
        self.assertContains(response, 'DevLimeira')

    def test_sem_resultados_mostra_mensagem_vazia(self):
        response = self.client.get('/comunidades/')
        self.assertContains(response, 'Nenhuma comunidade encontrada')


class ComunidadeDetailViewTest(TestCase):
    def test_retorna_200_com_dados(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador, nome='DEVPIRA')

        response = self.client.get(f'/comunidades/{comunidade.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'DEVPIRA')

    def test_id_inexistente_retorna_404(self):
        response = self.client.get('/comunidades/00000000-0000-0000-0000-000000000000/')
        self.assertEqual(response.status_code, 404)

    def test_botoes_de_gestao_ocultos_para_visitante(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        response = self.client.get(f'/comunidades/{comunidade.id}/')
        self.assertNotContains(response, f'/comunidades/{comunidade.id}/editar/')

    def test_botoes_de_gestao_visiveis_para_organizador(self):
        organizador = make_user()
        comunidade = make_comunidade(organizador)
        self.client.force_login(organizador)
        response = self.client.get(f'/comunidades/{comunidade.id}/')
        self.assertContains(response, f'/comunidades/{comunidade.id}/editar/')


class ComunidadeCreateViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.url = '/comunidades/nova/'
        self.payload = {
            'nome': 'DevCity',
            'descricao': 'Comunidade local de desenvolvedores.',
            'cidade': 'São Paulo',
            'contato': 'dev@city.com',
            'logo_url': '',
        }

    def test_anonimo_e_redirecionado_para_login(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)

    def test_get_autenticado_retorna_200(self):
        self.client.force_login(self.organizador)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_post_valido_cria_e_redireciona_para_detalhe(self):
        self.client.force_login(self.organizador)
        response = self.client.post(self.url, self.payload)
        comunidade = Comunidade.objects.get(nome='DevCity')
        self.assertRedirects(response, f'/comunidades/{comunidade.id}/')

    def test_criador_vira_organizador_automaticamente(self):
        self.client.force_login(self.organizador)
        self.client.post(self.url, self.payload)
        comunidade = Comunidade.objects.get(nome='DevCity')
        vinculo = comunidade.membros_vinculo.get(usuario=self.organizador)
        self.assertEqual(vinculo.papel, 'organizador')

    def test_nome_duplicado_reexibe_formulario_com_erro(self):
        make_comunidade(self.organizador, nome='DevCity')
        self.client.force_login(self.organizador)
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Já existe uma comunidade com este nome')


class ComunidadeUpdateViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador, nome='DEVPIRA')
        self.url = f'/comunidades/{self.comunidade.id}/editar/'

    def test_organizador_atualiza_com_sucesso(self):
        self.client.force_login(self.organizador)
        response = self.client.post(self.url, {
            'nome': 'DEVPIRA - Piracicaba',
            'descricao': self.comunidade.descricao,
            'cidade': self.comunidade.cidade,
            'contato': self.comunidade.contato,
            'logo_url': '',
        })
        self.assertRedirects(response, f'/comunidades/{self.comunidade.id}/')
        self.comunidade.refresh_from_db()
        self.assertEqual(self.comunidade.nome, 'DEVPIRA - Piracicaba')

    def test_membro_sem_ser_organizador_e_redirecionado_com_erro(self):
        membro = make_user()
        add_membro(self.comunidade, membro)
        self.client.force_login(membro)
        response = self.client.get(self.url)
        self.assertRedirects(response, f'/comunidades/{self.comunidade.id}/')


class ComunidadeDeleteViewTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador, nome='DevTest')
        self.url = f'/comunidades/{self.comunidade.id}/excluir/'

    def test_get_retorna_pagina_de_confirmacao(self):
        self.client.force_login(self.organizador)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Confirmar exclusão')

    def test_post_exclui_e_redireciona(self):
        self.client.force_login(self.organizador)
        response = self.client.post(self.url)
        self.assertRedirects(response, '/comunidades/')
        self.assertFalse(Comunidade.objects.filter(pk=self.comunidade.pk).exists())

    def test_com_evento_futuro_nao_exclui(self):
        make_evento(self.comunidade, self.organizador, data=date.today() + timedelta(days=5))
        self.client.force_login(self.organizador)
        response = self.client.post(self.url)
        self.assertRedirects(response, f'/comunidades/{self.comunidade.id}/')
        self.assertTrue(Comunidade.objects.filter(pk=self.comunidade.pk).exists())

    def test_nao_organizador_e_redirecionado(self):
        outro = make_user()
        self.client.force_login(outro)
        response = self.client.post(self.url)
        self.assertRedirects(response, f'/comunidades/{self.comunidade.id}/')
        self.assertTrue(Comunidade.objects.filter(pk=self.comunidade.pk).exists())
