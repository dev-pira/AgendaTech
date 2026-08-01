import pytest

from core.tests.helpers import make_comunidade, make_user


@pytest.fixture
def user(db):
    return make_user()


@pytest.fixture
def organizador(db):
    return make_user()


@pytest.fixture
def comunidade(db, organizador):
    return make_comunidade(organizador)
