function chat (React, ReactDOM, getCookie, ReconnectingWebSocket) {

    require('../../styles/_sass/main.sass');
    require('../../styles/vendor/normalize.css');
    require('../../styles/vendor/skeleton.css');

    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + "/chat" + window.location.pathname);

    var RoomName = React.createClass({
        render: function () {
            return (
                <h1>{this.props.data.label}</h1>
            );
        }
    });

    var Message = React.createClass({
        render: function () {
            return (
                <div className="message">
                    <span
                        className="messageDatetime">{this.props.datetime}</span>
                    <h5 className="messageAuthor">
                        {this.props.author}
                    </h5>
                    <span className="messageText">{this.props.text}</span>
                </div>
            );

        }
    });

    var MessageList = React.createClass({
        render: function () {
            var messageNodes = this.props.data.map(function (message, i) {
                return (
                    <Message author={message.author} key={i}
                             text={message.text} datetime={message.datetime}>
                    </Message>
                );
            });
            return (
                <div className="messageList">
                    {messageNodes}
                </div>
            );
        }
    });

    var MessageForm = React.createClass({
        getInitialState: function () {
            return {text: ''};
        },
        handleTextChange: function (e) {
            this.setState({text: e.target.value});
        },
        handleSubmit: function (e) {
            e.preventDefault();
            var text = this.state.text.trim();
            if (!text) {
                return;
            }
            this.setState({text: ''});
            this.props.onMessageSubmit({
                author: this.props.author,
                text: text,
                datetime: new Date().toTimeString().split(' ')[0]
            });
        },
        render: function () {
            return (
                <form className="messageForm" onSubmit={this.handleSubmit}>
                    <label className="authorName"
                           value={this.props.author}></label>
                    <input type="text"
                           className="messageField"
                           placeholder="Введите ваше сообщение..."
                           value={this.state.text}
                           onChange={this.handleTextChange}
                    />
                    <input type="submit"
                           className="messageButton"
                           value="Отправить"/>
                </form>
            );
        }

    });

    var AuthorForm = React.createClass({
        handleSubmit: function (e) {
            e.preventDefault();
            var author = this.state.authorName.trim();
            if (!author) {
                return;
            }
            this.props.onAuthorSubmit(author);
        },
        handleTextChange: function (e) {
            this.setState({authorName: e.target.value});
        },
        render: function () {
            if (!this.props.author) {
                return (
                    <form className="authorNameForm"
                          onSubmit={this.handleSubmit}>
                        <input className="authorNameFormField"
                               type="text"
                               placeholder="Введите ваше имя..."
                               onChange={this.handleTextChange}>
                        </input>
                    </form>
                );
            } else {
                return null;
            }
        }
    });

    var ChatPage = React.createClass({
        getInitialState: function () {
            return {
                room: {},
                messages: [],
                author: getCookie('author')
            };
        },
        componentDidMount: function () {
            this.serverRequest = $.get('http://127.0.0.1:8000/api/v1/room' + window.location.pathname,
                function (result) {
                    this.setState({
                        room: {'label': result.room.label},
                        messages: [result.messages],
                    });
                }.bind(this));
            var that = this;
            chatsock.onmessage = function (message) {
                var sockdata = JSON.parse(message.data);
                that.handleReceivedMessage(sockdata);
            };
        },
        componentWillUnmount: function () {
            this.serverRequest.abort();
        },
        handleReceivedMessage: function (sockdata) {
            if (this.state.author !== sockdata.author) {
                var msgsTmp = this.state.messages;
                msgsTmp.push({
                    author: sockdata.author,
                    text: sockdata.text,
                    datetime: sockdata.datetime
                });
                console.log(msgsTmp);
                this.setState({messages: msgsTmp});
            }
        },
        handleMessageSubmit: function (message) {
            var msgsTmp = this.state.messages;
            msgsTmp.push({
                author: message.author,
                text: message.text,
                datetime: message.datetime
            });
            chatsock.send(JSON.stringify(message));
            this.setState({messages: msgsTmp});
        },
        handleAuthorSubmit: function (author) {
            var expiresDate = new Date(new Date().getTime() + 60 * 60 * 24 * 365 * 1000);
            document.cookie = 'author=' + author + '; expires=' + expiresDate;
            this.setState({author: author});
        },
        render: function () {
            return (
                <div className="content">
                    <RoomName data={this.state.room}/>
                    <MessageList data={this.state.messages}/>
                    <MessageForm author={this.state.author}
                                 onMessageSubmit={this.handleMessageSubmit}/>
                    <AuthorForm author={this.state.author}
                                onAuthorSubmit={this.handleAuthorSubmit}/>
                </div>
            );
        }
    });


    ReactDOM.render(
        <ChatPage />,
        document.getElementById('chat')
    );
}

module.exports = chat;