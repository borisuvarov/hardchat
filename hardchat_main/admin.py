from django.contrib import admin
from hardchat_main.models import Room


class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'label', 'banned_words_count')

admin.site.register(Room, RoomAdmin)