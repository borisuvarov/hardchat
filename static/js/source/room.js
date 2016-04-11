import React from 'react';
import ReactDOM from 'react-dom';

var getCookie = require("./getCookie"),
    chat = require("./room.jsx"),
    ReconnectingWebSocket = require("./reconnecting-websocket.min.js");

chat(React, ReactDOM, getCookie, ReconnectingWebSocket);