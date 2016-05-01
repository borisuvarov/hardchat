import random

from django.shortcuts import render, redirect, Http404
from django.http import JsonResponse
from .models import Room


def about(request):
    return render(request, "hardchat_main/about.html")


def new_room(request):
    label = str(random.getrandbits(30))
    name = 'Комната №' + label
    Room.objects.create(label=label, name=name)
    return redirect(chat_room, label=label)


def chat_room(request, label):
    if not Room.objects.filter(label=label).exists():
        name = 'Комната №' + label
        Room.objects.create(label=label, name=name)
    return render(request, "hardchat_main/room.html")


def room_state(request, label):
    if label:
        try:
            room = Room.objects.get(label=label)
        except Room.DoesNotExist:
            raise Http404
    else:
        raise Http404
    messages = reversed(room.messages.order_by('-timestamp')[:50])
    messages_props = [message.as_dict() for message in messages]
    data = {'room': {'label': room.name},
            'messages': list(messages_props),
            'banned': [word.word for word in room.banned_words.all()]}
    return JsonResponse(data)
