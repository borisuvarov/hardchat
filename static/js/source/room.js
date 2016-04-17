import React from 'react';
import ReactDOM from 'react-dom';
import Scrollbars from 'react-custom-scrollbars';

var getCookie = require("./getCookie"),
    chat = require("./room.jsx"),
    ReconnectingWebSocket = require("./reconnecting-websocket.min.js");

chat(React, ReactDOM, Scrollbars, getCookie, ReconnectingWebSocket);