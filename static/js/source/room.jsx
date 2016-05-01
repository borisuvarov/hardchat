function chat (React, ReactDOM, Scrollbars, shortid, getCookie, ReconnectingWebSocket) {

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
                    <h5 className={this.props.author != this.props.currentAuthor ? 'messageAuthor' : 'messageAuthor currentAuthor'}>
                        {this.props.author}
                    </h5>
                    <span className="messageText">{this.props.text}</span>
                </div>
            );

        }
    });

    var MessageList = React.createClass({
        componentDidUpdate: function(prevProps, prevState){
            this.refs.scrollbars.scrollToBottom();
        },
        render: function () {
            var currentAuthor = this.props.currentAuthor;
            var messageNodes = this.props.data.map(function (message) {
                return (
                    <Message currentAuthor={currentAuthor} author={message.author} key={message.id}
                             text={message.text} datetime={message.datetime}>
                    </Message>
                );
            });
            return (
                <Scrollbars className="scrollContainer" style={{ height: 400 }} ref="scrollbars">
                    {messageNodes}
                </Scrollbars>
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
            var wordsRe = /[\wа-яё]+/gi;
            var bannedWords = this.props.banned;
            text = text.replace(wordsRe, function(word) {
                if (bannedWords.indexOf(word.toLowerCase()) > -1) {
                    return Array(word.length + 1).join("*");
                } else {
                    return word;
                }
            });
            this.setState({text: ''});
            this.props.onMessageSubmit({
                author: this.props.author,
                text: text
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

    var BannedWords = React.createClass({
        render: function () {
            var wordsNodes = this.props.data.map(function (word) {
                return (
                    <p className="bannedWord">{word}</p>
                );
            });
            return (
                <div className="bannedWordsList">
                    <p className="bannedWordsStats">Забанено слов: {this.props.data.length}</p>
                    {wordsNodes}
                </div>
            );
        }
    });


    var ChatPage = React.createClass({
        getInitialState: function () {
            return {
                room: {},
                messages: [],
                banned: [],
                author: getCookie('author')
            };
        },
        componentDidMount: function () {
            this.serverRequest = $.get('http://127.0.0.1:8000/api/v1/room' + window.location.pathname,
                function (result) {
                    this.setState({
                        room: {'label': result.room.label},
                        messages: result.messages,
                        banned: result.banned
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
            if (sockdata.banned) {
                this.setState({banned: sockdata.banned});
            } else {
                var msgsTmp = this.state.messages;
                msgsTmp.push({
                    author: sockdata.author,
                    text: sockdata.text,
                    datetime: sockdata.datetime,
                    messageId: sockdata.id
                });
                this.setState({messages: msgsTmp});

            }
        },
        handleMessageSubmit: function (message) {
            chatsock.send(JSON.stringify(message));
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
                    <BannedWords data={this.state.banned}/>
                    <MessageList data={this.state.messages}
                                 currentAuthor={this.state.author}/>
                    <MessageForm banned={this.state.banned}
                                 author={this.state.author}
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