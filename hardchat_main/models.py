from __future__ import unicode_literals

from django.db import models
from django.utils import timezone


class Room(models.Model):
    name = models.TextField()
    label = models.SlugField(unique=True)

    def __unicode__(self):
        return self.label


class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages')
    author = models.TextField()
    text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    def __unicode__(self):
        return '[{timestamp}] {author}: {text}'.format(**self.as_dict())

    @property
    def formatted_timestamp(self):
        return self.timestamp.strftime('%H:%M:%S')
    
    def as_dict(self):
        return {'author': self.author,
                'text': self.text,
                'datetime': self.formatted_timestamp}
