from django.contrib.auth import get_user_model
from django.test import TestCase

from .helpers import make_user

User = get_user_model()


class CadastroViewTest(TestCase):
    def setUp(self):
        self.url = '/cadastro/'
        self.payload = {
            'username': 'novousuario',
            'email': 'novo@example.com',
            'first_name': 'Nova',
            'last_name': 'Usuária',
            'password1': 'SenhaForte123!',
            'password2': 'SenhaForte123!',
        }

    def test_get_retorna_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_post_valido_cria_usuario_e_loga(self):
        response = self.client.post(self.url, self.payload)
        self.assertTrue(User.objects.filter(username='novousuario').exists())
        self.assertRedirects(response, '/comunidades/')
        response_autenticado = self.client.get('/comunidades/')
        self.assertTrue(response_autenticado.wsgi_request.user.is_authenticated)

    def test_senhas_diferentes_nao_cria_usuario(self):
        payload = dict(self.payload, password2='OutraSenha456!')
        self.client.post(self.url, payload)
        self.assertFalse(User.objects.filter(username='novousuario').exists())

    def test_usuario_ja_autenticado_e_redirecionado(self):
        user = make_user()
        self.client.force_login(user)
        response = self.client.get(self.url)
        self.assertRedirects(response, '/comunidades/')


class LoginViewTest(TestCase):
    def setUp(self):
        self.user = make_user(username='joana', password='SenhaForte123!')
        self.url = '/login/'

    def test_get_retorna_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_credenciais_validas_autentica(self):
        response = self.client.post(
            self.url, {'username': 'joana', 'password': 'SenhaForte123!'}
        )
        self.assertRedirects(response, '/comunidades/')

    def test_credenciais_invalidas_nao_autentica(self):
        response = self.client.post(self.url, {'username': 'joana', 'password': 'errada'})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.wsgi_request.user.is_authenticated)


class LogoutViewTest(TestCase):
    def test_logout_desautentica_usuario(self):
        user = make_user()
        self.client.force_login(user)
        response = self.client.post('/logout/')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/')

        response_apos_logout = self.client.get('/comunidades/nova/')
        self.assertNotEqual(response_apos_logout.status_code, 200)
