"""Validadores reutilizados pelos models e pelos schemas da API (core/api.py)."""
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.core.validators import validate_email as django_validate_email

IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.svg', '.webp')


def validate_contato(value):
    """RN-COM-04: contato deve ser um e-mail válido ou uma URL válida."""
    if not value:
        return
    try:
        django_validate_email(value)
        return
    except ValidationError:
        pass
    try:
        URLValidator()(value)
    except ValidationError:
        raise ValidationError(
            'O campo contato deve ser um e-mail válido ou uma URL válida.'
        )


def validate_logo_url(value):
    """RN-COM-05: logo_url, quando informado, deve ser uma URL de imagem válida."""
    if not value:
        return
    URLValidator()(value)
    if not value.lower().endswith(IMAGE_EXTENSIONS):
        raise ValidationError(
            'logo_url deve terminar com uma extensão de imagem '
            f'({", ".join(IMAGE_EXTENSIONS)}).'
        )
