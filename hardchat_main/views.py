import random

from django.db import transaction
from django.shortcuts import render, redirect, Http404
from django.http import JsonResponse
from .models import Room


def about(request):
    return render(request, "hardchat_main/about.html")


def new_room(request):
    """
    Randomly create a new room, and redirect to it.
    """
    new_room = None
    author = request.GET.get('author')
    while not new_room:
        with transaction.atomic():
            label = str(random.getrandbits(30))
            name = 'Комната №' + label
            if Room.objects.filter(label=label).exists():
                continue
            new_room = Room.objects.create(label=label, name=name)
    return redirect(chat_room, label=label)


def chat_room(request, label):
    """
    Room view - show the room, with latest messages.
    The template for this view has the WebSocket business to send and stream
    messages, so see the template for where the magic happens.
    """
    # If the room with the given label doesn't exist, automatically create it
    # upon first visit (a la etherpad).
    room, created = Room.objects.get_or_create(label=label)
    return render(request, "hardchat_main/room.html")


def room_state(request, label):
    print(label)
    if label:
        room = Room.objects.get(label=label)
    else:
        raise Http404
    if room:
        messages = reversed(room.messages.order_by('-timestamp')[:50])
        messages_props = [message.as_dict() for message in messages]
        data = {'room': {'label': room.name},
                'messages': list(messages_props),
                'banned': [word.word for word in room.banned_words.all()]}
        return JsonResponse(data)
    else:
        raise Http404