from __future__ import unicode_literals
import re
from collections import Counter

from django.db import models
from django.utils import timezone


class Room(models.Model):
    name = models.TextField()
    label = models.SlugField(unique=True)
    PREPOSITIONS = [
        'и', 'в', 'не', 'на', 'что', 'с', 'а', 'как', 'это',
        'по', 'к', 'но', 'у', 'из', 'за', 'от', 'о', 'так',
        'для', 'же', 'все', 'или', 'бы', 'если', 'до', 'то',
        'да', 'при', 'нет', 'чтобы', 'даже', 'ни', 'раз',
        'ну', 'со', 'под', 'много', 'ли', 'чем', 'надо', 'без',
        'через', 'об', 'ведь', 'хотя', 'перед', 'между',
        'лишь', 'уж', 'над', 'однако', 'право', 'вообще',
        'про', 'оно', 'кроме', 'будто', 'среди', 'хоть',
        'наконец', 'против', 'наверное', 'ко', 'пусть',
        'словно', 'поскольку', 'впрочем', 'либо', 'главное',
        'вроде', 'пол', 'ж', 'было', 'разве', 'чтоб', 'вместо',
        'никак', 'зато', 'ибо', 'лучше', 'б', 'их', 'уже', 'эту', 'нее',
        'него', 'еще',
    ]

    def add_words(self, text):
        pattern = re.compile("(\w[\w']*\w|\w)")
        for word in pattern.findall(text):
            if word.lower().replace('ё', 'е') not in self.PREPOSITIONS:
                obj, created = ValidWord.objects.get_or_create(
                    word=word.lower(), room=self)
                if created:
                    self.valid_words.add(obj)

    def ban_words(self):
        most_common = [valid_word[0].word for valid_word in Counter(
            self.valid_words.all()).most_common(5)]
        for word in most_common:
            self.banned_words.get_or_create(word=word.lower(), room=self)
            self.valid_words.filter(word=word).delete()
        return {'banned': [word.word for word in BannedWord.objects.filter(
                                                                room=self)],
                'new_banned': most_common}

    def banned_words_count(self):
        return self.banned_words.count()
    banned_words_count.short_description = "Banned words"

    def __str__(self):
        return self.name


class ValidWord(models.Model):
    word = models.CharField(max_length=300)
    room = models.ForeignKey(Room, related_name='valid_words', null=True)

    def __str__(self):
        return self.word


class BannedWord(models.Model):
    word = models.CharField(max_length=300)
    room = models.ForeignKey(Room, related_name='banned_words', null=True)

    def __str__(self):
        return self.word


class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages')
    author = models.TextField()
    text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    def __str__(self):
        return '[{timestamp}] {author}: {text}'.format(**self.as_dict())

    @property
    def formatted_timestamp(self):
        return self.timestamp.strftime('%H:%M:%S')
    
    def as_dict(self):
        return {'author': self.author,
                'text': self.text,
                'datetime': self.formatted_timestamp,
                'messageId': self.pk}
