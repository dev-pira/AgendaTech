from datetime import date

from django import forms
from django.contrib.auth.forms import UserCreationForm

from core.models import Comunidade, Evento, TipoEvento, User


class CadastroForm(UserCreationForm):
    email = forms.EmailField(label='E-mail', required=True)
    first_name = forms.CharField(label='Nome', max_length=150, required=True)
    last_name = forms.CharField(label='Sobrenome', max_length=150, required=False)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'first_name', 'last_name')


class ComunidadeForm(forms.ModelForm):
    class Meta:
        model = Comunidade
        fields = ['nome', 'descricao', 'cidade', 'contato', 'logo_url']
        labels = {
            'nome': 'Nome',
            'descricao': 'Descrição',
            'cidade': 'Cidade',
            'contato': 'Contato (e-mail ou URL)',
            'logo_url': 'URL da logo (opcional)',
        }
        widgets = {
            'descricao': forms.Textarea(attrs={'rows': 4}),
        }

    def clean_nome(self):
        nome = self.cleaned_data['nome']
        qs = Comunidade.objects.filter(nome__iexact=nome)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise forms.ValidationError('Já existe uma comunidade com este nome.')
        return nome


class EventoForm(forms.ModelForm):
    class Meta:
        model = Evento
        fields = [
            'titulo', 'descricao', 'data', 'hora_inicio', 'hora_fim',
            'local', 'tipo', 'url_online', 'comunidade',
        ]
        labels = {
            'titulo': 'Título',
            'descricao': 'Descrição',
            'data': 'Data',
            'hora_inicio': 'Hora de início',
            'hora_fim': 'Hora de fim (opcional)',
            'local': 'Local',
            'tipo': 'Tipo',
            'url_online': 'URL online (obrigatório se online ou híbrido)',
            'comunidade': 'Comunidade',
        }
        widgets = {
            'descricao': forms.Textarea(attrs={'rows': 4}),
            'data': forms.DateInput(attrs={'type': 'date'}),
            'hora_inicio': forms.TimeInput(attrs={'type': 'time'}),
            'hora_fim': forms.TimeInput(attrs={'type': 'time'}),
            'tipo': forms.Select(choices=TipoEvento.choices),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        if user is not None:
            self.fields['comunidade'].queryset = Comunidade.objects.filter(
                membros=user
            ).distinct()

    def clean_data(self):
        data = self.cleaned_data['data']
        if data < date.today():
            raise forms.ValidationError(
                'A data do evento deve ser futura ou igual à data atual.'
            )
        return data
