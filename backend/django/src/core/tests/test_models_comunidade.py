from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from core.models import Comunidade

from .helpers import make_comunidade, make_user


class ComunidadeModelTest(TestCase):
    def setUp(self):
        self.organizador = make_user()

    def test_created(self):
        comunidade = make_comunidade(self.organizador, nome='DEVPIRA')
        self.assertTrue(Comunidade.objects.filter(nome='DEVPIRA').exists())

    def test_str(self):
        comunidade = make_comunidade(self.organizador, nome='DEVPIRA')
        self.assertEqual(str(comunidade), 'DEVPIRA')

    def test_criador_e_adicionado_como_organizador(self):
        comunidade = make_comunidade(self.organizador)
        vinculo = comunidade.membros_vinculo.get(usuario=self.organizador)
        self.assertEqual(vinculo.papel, 'organizador')

    def test_nome_muito_curto_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_comunidade(self.organizador, nome='ab')

    def test_descricao_muito_curta_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_comunidade(self.organizador, descricao='curta')

    def test_contato_invalido_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_comunidade(self.organizador, contato='nao-e-email-nem-url')

    def test_logo_url_sem_extensao_de_imagem_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_comunidade(self.organizador, logo_url='https://example.com/logo.pdf')

    def test_logo_url_valida_e_aceita(self):
        comunidade = make_comunidade(self.organizador, logo_url='https://example.com/logo.png')
        self.assertEqual(comunidade.logo_url, 'https://example.com/logo.png')

    def test_nome_duplicado_case_insensitive_levanta_erro(self):
        make_comunidade(self.organizador, nome='DEVPIRA')
        with self.assertRaises((ValidationError, IntegrityError)):
            with transaction.atomic():
                make_comunidade(self.organizador, nome='devpira')

    def test_ordering_por_nome(self):
        make_comunidade(self.organizador, nome='Zeta Community')
        make_comunidade(self.organizador, nome='Alpha Community')
        nomes = list(Comunidade.objects.values_list('nome', flat=True))
        self.assertEqual(nomes, sorted(nomes))
