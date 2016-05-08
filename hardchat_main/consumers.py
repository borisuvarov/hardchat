import json
from datetime import timedelta
import logging
from channels import Group
from channels.sessions import channel_session
from django.utils import timezone
from .models import Room

log = logging.getLogger(__name__)


@channel_session
def ws_connect(message):
    try:
        prefix, label = message['path'].strip('/').split('/')
        if prefix != 'chat':
            log.debug('invalid ws path=%s', message['path'])
            return
        room = Room.objects.get(label=label)
    except ValueError:
        log.debug('invalid ws path=%s', message['path'])
        return
    except Room.DoesNotExist:
        log.debug('ws room does not exist label=%s', label)
        return

    log.debug('chat connect room=%s client=%s:%s',
              room.label, message['client'][0], message['client'][1])

    Group('chat-'+label, channel_layer=message.channel_layer).add(
        message.reply_channel)

    message.channel_session['room'] = room.label


@channel_session
def ws_receive(message):
    # Look up the room from the channel session, bailing if it doesn't exist
    try:
        label = message.channel_session['room']
        room = Room.objects.get(label=label)
    except KeyError:
        log.debug('no room in channel_session')
        return
    except Room.DoesNotExist:
        log.debug('recieved message, buy room does not exist label=%s', label)
        return

    # Parse out a chat message from the content text, bailing if it doesn't
    # conform to the expected message format.
    try:
        data = json.loads(message['text'])
    except ValueError:
        log.debug("ws message isn't json text=%s", message['text'])
        return

    if set(data.keys()) != {'author', 'text'}:
        log.debug("ws message unexpected format data=%s", data)
        return

    if data:
        m = room.messages.create(author=data['author'],
                                 text=data['text'],
                                 timestamp=timezone.now() + timedelta(hours=3))
                                 # FIXME: add proper timezone activation
        Group('chat-'+label, channel_layer=message.channel_layer).send(
            {'text': json.dumps(m.as_dict())})
        # FIXME: remove message.pk usage from client and place async .send
        # FIXME: method before saving message to database

        room.add_words(data['text'])
        if not room.messages.count() % 5:
            banned = room.ban_words()
            Group('chat-' + label, channel_layer=message.channel_layer).send(
                {'text': json.dumps(banned)})

@channel_session
def ws_disconnect(message):
    try:
        label = message.channel_session['room']
        Group('chat-'+label, channel_layer=message.channel_layer).discard(
            message.reply_channel)
    except (KeyError, Room.DoesNotExist):
        pass
