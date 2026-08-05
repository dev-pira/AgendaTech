"""Views server-rendered (HTML puro, sem API) do Agenda Tech.

Reaproveita os mesmos models e regras de negócio da API (core/api.py) —
as duas superfícies compartilham core/permissions.py e a validação já
embutida nos models (Comunidade.clean/Evento.clean).
"""
from datetime import date

from django.contrib import messages
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import CadastroForm, ComunidadeForm, EventoForm
from core.models import Comunidade, ComunidadeMembro, Evento, Papel
from core.permissions import is_membro_ou_organizador, is_organizador


def home(request):
    return redirect('comunidade_list')


def cadastro(request):
    if request.user.is_authenticated:
        return redirect('comunidade_list')
    if request.method == 'POST':
        form = CadastroForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            messages.success(request, 'Cadastro realizado com sucesso. Bem-vindo(a)!')
            return redirect('comunidade_list')
    else:
        form = CadastroForm()
    return render(request, 'cadastro.html', {'form': form})


# ── Comunidades ──────────────────────────────────────────────────────────────

def comunidade_list(request):
    qs = Comunidade.objects.all()
    busca = request.GET.get('busca', '').strip()
    cidade = request.GET.get('cidade', '').strip()
    if busca:
        qs = qs.filter(nome__icontains=busca)
    if cidade:
        qs = qs.filter(cidade__iexact=cidade)

    paginator = Paginator(qs, 12)
    page_obj = paginator.get_page(request.GET.get('pagina'))
    cidades = (
        Comunidade.objects.order_by('cidade').values_list('cidade', flat=True).distinct()
    )
    return render(request, 'comunidade_list.html', {
        'page_obj': page_obj,
        'busca': busca,
        'cidade_selecionada': cidade,
        'cidades': cidades,
    })


def comunidade_detail(request, pk):
    comunidade = get_object_or_404(Comunidade, pk=pk)
    membros = comunidade.membros_vinculo.select_related('usuario').order_by('adicionado_em')
    proximos_eventos = comunidade.eventos.filter(data__gte=date.today())
    pode_gerenciar = request.user.is_authenticated and is_organizador(request.user, comunidade)
    return render(request, 'comunidade_detail.html', {
        'comunidade': comunidade,
        'membros': membros,
        'proximos_eventos': proximos_eventos,
        'pode_gerenciar': pode_gerenciar,
    })


@login_required
def comunidade_create(request):
    if request.method == 'POST':
        form = ComunidadeForm(request.POST)
        if form.is_valid():
            comunidade = form.save(commit=False)
            comunidade.criado_por = request.user
            comunidade.save()
            # RN-COM-08 / RN-ORG-04: criador é automaticamente organizador
            ComunidadeMembro.objects.create(
                comunidade=comunidade, usuario=request.user,
                papel=Papel.ORGANIZADOR, adicionado_por=request.user,
            )
            messages.success(request, 'Comunidade criada com sucesso.')
            return redirect('comunidade_detail', pk=comunidade.pk)
    else:
        form = ComunidadeForm()
    return render(request, 'comunidade_form.html', {'form': form, 'modo': 'criar'})


@login_required
def comunidade_update(request, pk):
    comunidade = get_object_or_404(Comunidade, pk=pk)
    if not is_organizador(request.user, comunidade):
        messages.error(request, 'Apenas organizadores podem editar esta comunidade.')
        return redirect('comunidade_detail', pk=pk)

    if request.method == 'POST':
        form = ComunidadeForm(request.POST, instance=comunidade)
        if form.is_valid():
            form.save()
            messages.success(request, 'Comunidade atualizada com sucesso.')
            return redirect('comunidade_detail', pk=comunidade.pk)
    else:
        form = ComunidadeForm(instance=comunidade)
    return render(request, 'comunidade_form.html', {
        'form': form, 'modo': 'editar', 'comunidade': comunidade,
    })


@login_required
def comunidade_delete(request, pk):
    comunidade = get_object_or_404(Comunidade, pk=pk)
    if not is_organizador(request.user, comunidade):
        messages.error(request, 'Apenas organizadores podem excluir esta comunidade.')
        return redirect('comunidade_detail', pk=pk)
    # RN-COM-09
    if comunidade.eventos.filter(data__gte=date.today()).exists():
        messages.error(
            request, 'Não é possível excluir uma comunidade com eventos futuros agendados.'
        )
        return redirect('comunidade_detail', pk=pk)

    if request.method == 'POST':
        comunidade.delete()
        messages.success(request, 'Comunidade excluída com sucesso.')
        return redirect('comunidade_list')
    return render(request, 'comunidade_confirm_delete.html', {'comunidade': comunidade})


# ── Eventos ──────────────────────────────────────────────────────────────────

def evento_list(request):
    qs = Evento.objects.select_related('comunidade', 'organizador').all()
    comunidade_id = request.GET.get('comunidade', '').strip()
    cidade = request.GET.get('cidade', '').strip()
    tipo = request.GET.get('tipo', '').strip()
    data_inicio = request.GET.get('data_inicio', '').strip()
    data_fim = request.GET.get('data_fim', '').strip()

    if comunidade_id:
        qs = qs.filter(comunidade_id=comunidade_id)
    if cidade:
        qs = qs.filter(comunidade__cidade__iexact=cidade)
    if tipo:
        qs = qs.filter(tipo=tipo)
    if data_inicio:
        qs = qs.filter(data__gte=data_inicio)
    if data_fim:
        qs = qs.filter(data__lte=data_fim)

    paginator = Paginator(qs, 12)
    page_obj = paginator.get_page(request.GET.get('pagina'))
    return render(request, 'evento_list.html', {
        'page_obj': page_obj,
        'comunidades': Comunidade.objects.all(),
        'comunidade_selecionada': comunidade_id,
        'cidade': cidade,
        'tipo': tipo,
        'data_inicio': data_inicio,
        'data_fim': data_fim,
    })


def evento_detail(request, pk):
    evento = get_object_or_404(
        Evento.objects.select_related('comunidade', 'organizador'), pk=pk
    )
    pode_gerenciar = (
        request.user.is_authenticated
        and is_organizador(request.user, evento.comunidade)
        and evento.data >= date.today()
    )
    return render(request, 'evento_detail.html', {
        'evento': evento, 'pode_gerenciar': pode_gerenciar,
    })


@login_required
def evento_create(request):
    comunidades_usuario = Comunidade.objects.filter(membros=request.user)
    if not comunidades_usuario.exists():
        messages.error(
            request, 'Você precisa ser membro de uma comunidade para criar eventos.'
        )
        return redirect('comunidade_list')

    if request.method == 'POST':
        form = EventoForm(request.POST, user=request.user)
        if form.is_valid():
            comunidade = form.cleaned_data['comunidade']
            if not is_membro_ou_organizador(request.user, comunidade):
                messages.error(
                    request,
                    'Você precisa ser membro ou organizador desta comunidade para criar eventos.',
                )
            else:
                evento = form.save(commit=False)
                evento.organizador = request.user
                evento.save()
                messages.success(request, 'Evento criado com sucesso.')
                return redirect('evento_detail', pk=evento.pk)
    else:
        form = EventoForm(user=request.user)
    return render(request, 'evento_form.html', {'form': form, 'modo': 'criar'})


@login_required
def evento_update(request, pk):
    evento = get_object_or_404(Evento, pk=pk)
    if not is_organizador(request.user, evento.comunidade):
        messages.error(request, 'Apenas organizadores da comunidade podem editar este evento.')
        return redirect('evento_detail', pk=pk)
    # RN-EVT-10
    if evento.data < date.today():
        messages.error(request, 'Não é possível editar eventos que já ocorreram.')
        return redirect('evento_detail', pk=pk)

    if request.method == 'POST':
        form = EventoForm(request.POST, instance=evento, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Evento atualizado com sucesso.')
            return redirect('evento_detail', pk=evento.pk)
    else:
        form = EventoForm(instance=evento, user=request.user)
    return render(request, 'evento_form.html', {
        'form': form, 'modo': 'editar', 'evento': evento,
    })


@login_required
def evento_delete(request, pk):
    evento = get_object_or_404(Evento, pk=pk)
    if not is_organizador(request.user, evento.comunidade):
        messages.error(request, 'Apenas organizadores da comunidade podem excluir este evento.')
        return redirect('evento_detail', pk=pk)
    # RN-EVT-10
    if evento.data < date.today():
        messages.error(request, 'Não é possível excluir eventos que já ocorreram.')
        return redirect('evento_detail', pk=pk)

    if request.method == 'POST':
        evento.delete()
        messages.success(request, 'Evento excluído com sucesso.')
        return redirect('evento_list')
    return render(request, 'evento_confirm_delete.html', {'evento': evento})
