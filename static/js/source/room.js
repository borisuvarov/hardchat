import React from 'react';
import ReactDOM from 'react-dom';
import Scrollbars from 'react-custom-scrollbars';
import shortid from 'shortid';

var getCookie = require("./getCookie"),
    chat = require("./room.jsx"),
    ReconnectingWebSocket = require("./reconnecting-websocket.min.js");

chat(React, ReactDOM, Scrollbars, shortid, getCookie, ReconnectingWebSocket);