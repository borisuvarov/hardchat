import random

from django.test import TestCase

from .models import Room, Message, BannedWord, ValidWord


class RoomTestCase(TestCase):
    def setUp(self):
        self.label = str(random.getrandbits(30))
        self.text = ('Проснувшиеся овцы — их было около трех тысяч -- '
                     'неохотно, от нечего делать принялись за невысокую, '
                     'наполовину утоптанную траву. Солнце еще не взошло, но '
                     'уже были видны все курганы и далекая, похожая на облако,'
                     ' Саур-Могила с остроконечной верхушкой. Если взобраться '
                     'на эту Могилу, то с нее видна равнина, такая же ровная '
                     'и безграничная, как небо, видны барские усадьбы, хутора '
                     'немцев и молокан, деревни, а дальнозоркий калмык увидит '
                     'даже город и поезда железных дорог.')
        Room.objects.create(name='Комната №{}'.format(self.label),
                            label=self.label)

    def test_add_valid_words_to_room(self):
        """Add to valid words of room all but prepositions and other
        whitelisted words"""
        room = Room.objects.get(label=self.label)
        room.add_words(self.text)
        self.assertEqual(ValidWord.objects.count(), 46)

    def test_ban_words(self):
        """Ban 5 most common valid words
        """
        room = Room.objects.get(label=self.label)
        room.add_words(self.text)
        room.ban_words()
        self.assertEqual(BannedWord.objects.count(), 5)
        self.assertEqual(ValidWord.objects.count(), 41)
