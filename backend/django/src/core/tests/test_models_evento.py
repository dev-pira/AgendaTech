from datetime import date, timedelta

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from core.models import Evento, TipoEvento

from .helpers import make_comunidade, make_evento, make_user


class EventoModelTest(TestCase):
    def setUp(self):
        self.organizador = make_user()
        self.comunidade = make_comunidade(self.organizador)

    def test_created(self):
        evento = make_evento(self.comunidade, self.organizador, titulo='Meetup React')
        self.assertTrue(Evento.objects.filter(titulo='Meetup React').exists())

    def test_str(self):
        evento = make_evento(
            self.comunidade, self.organizador, titulo='Meetup React', data=date(2030, 3, 20)
        )
        self.assertEqual(str(evento), 'Meetup React (2030-03-20)')

    def test_titulo_muito_curto_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_evento(self.comunidade, self.organizador, titulo='Oi')

    def test_descricao_muito_curta_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_evento(self.comunidade, self.organizador, descricao='curta demais')

    def test_hora_fim_antes_de_hora_inicio_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_evento(
                self.comunidade, self.organizador, hora_inicio='19:00', hora_fim='18:00'
            )

    def test_hora_fim_apos_hora_inicio_e_aceito(self):
        evento = make_evento(
            self.comunidade, self.organizador, hora_inicio='19:00', hora_fim='21:00'
        )
        self.assertEqual(str(evento.hora_fim), '21:00:00')

    def test_tipo_online_sem_url_levanta_validation_error(self):
        with self.assertRaises(ValidationError):
            make_evento(self.comunidade, self.organizador, tipo=TipoEvento.ONLINE)

    def test_tipo_online_com_url_e_aceito(self):
        evento = make_evento(
            self.comunidade,
            self.organizador,
            tipo=TipoEvento.ONLINE,
            url_online='https://meet.example.com/sala',
        )
        self.assertEqual(evento.tipo, 'online')

    def test_evento_duplicado_mesma_comunidade_titulo_data_levanta_erro(self):
        data = date.today() + timedelta(days=10)
        make_evento(self.comunidade, self.organizador, titulo='Workshop Node.js', data=data)
        with self.assertRaises((ValidationError, IntegrityError)):
            with transaction.atomic():
                make_evento(
                    self.comunidade, self.organizador, titulo='Workshop Node.js', data=data
                )

    def test_ordering_por_data_e_hora(self):
        make_evento(
            self.comunidade, self.organizador, data=date.today() + timedelta(days=20),
            hora_inicio='10:00',
        )
        make_evento(
            self.comunidade, self.organizador, data=date.today() + timedelta(days=5),
            hora_inicio='10:00',
        )
        datas = list(Evento.objects.values_list('data', flat=True))
        self.assertEqual(datas, sorted(datas))
