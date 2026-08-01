import json

from django.test import TestCase

from core.models import Token

from .helpers import make_user


class ObterTokenTest(TestCase):
    def setUp(self):
        self.user = make_user(username='joao', password='StrongPass123!')
        self.url = '/api/auth/token'

    def test_credenciais_validas_retorna_200_com_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'username': 'joao', 'password': 'StrongPass123!'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json())

    def test_token_retornado_e_persistido(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'username': 'joao', 'password': 'StrongPass123!'}),
            content_type='application/json',
        )
        token = Token.objects.get(user=self.user)
        self.assertEqual(response.json()['token'], token.key)

    def test_senha_invalida_retorna_401(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'username': 'joao', 'password': 'senha-errada'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 401)
