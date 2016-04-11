from django.conf.urls import url
from django.contrib import admin
from hardchat_main.views import *

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', about, name='about'),
    url(r'^new/$', new_room, name='new_room'),
    url(r'^(?P<label>\d+)/$', chat_room, name='chat_room'),
    url(r'^api/v1/room/(?P<label>\d+)/$', room_state, name='room_state'),
]
