# Socket.io Messages For Plowderye

### add-public-conversation

Direction: server -> client
Data: conversation id, conversation name

A new public conversation has been created. The client adds the conversation to its internal list of public conversations.

### join-private-conversation

Direction: server -> client
Data: conversation id, conversation name

The user has joined or has been added to a private conversation

### send-message

Direction: client -> server
Data: client message id, client message time, conversation id, user id of sender, text

The client wants to broadcast a message to one of it's conversations.

### add-message

Direction: server -> client
Data: server message id, server message time, conversation id, user id of sender, text

There is a new message in one of the conversations that the client participates in. The client adds the message to the given conversation and displays it.

### user-joined

Direction: server -> client
Data: conversation id, user id

A new user joined a conversation.

### user-went-offline

### user-comes-online


# Socket Messages Currently in Use 

Server -> Client:

users-in-current-conversation
fetch-conversations-result
init-user-result
join-result', { conversation: conversation });
conversation-added
set-name-result
user-left
user-joined
user-went-offline
name-changed (user changed nick name)

Client -> Server:

set-name
enable-sound
enable-notifications
disconnect
create-conversation
join-conversation
leave-conversation
message
