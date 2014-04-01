# Socket.io Messages For Plowderye

## Non-Paginated Lists

For every list the client needs to have, there is usually
* a client event to request the initial list from the server (fetch-xxx-list),
* a server event to answer the request for the inital list (fetch-xxx-list-result),
* a server event to add another item to the client's list (add-xxx),
* a server event to update an item that the client might already have (update-xxx) and
* a server event to remove an item that the client might still have, when it has been deleted on the server (remove-xxx)

Examples for non-paginated lists are the list of public conversations, the list of conversations for a specific user, the complete list of users on a server or the list of users participating in a conversation.

Client-side, non-paginated lists (conversations, users in conversation) should be refreshed when the client comes online or at some point between the client coming online and displaying that list to the user. Otherwise the client might have an incomplete list (because it missed add-item events) or the client might show deleted items or items in a stale state (because it missed remove-item or update-item events, respectively).

For paginated lists (messages), the server event to answer the request for the initial list might not contain the complete list, but a partial list (for example, messages from last x days). In addition to the events above, for paginated lists, there is also:

* a client event to request more items, either by passing from and to as ids/timestamps or similar

For paginated list, the client should refresh

Oh, crap if we always need to load everything from the server to be sure it's up to date, why would we store it in a client side LevelDB/IndexDB at all? We'll never use this data. Maybe for reading chat logs when you are offline, but that's not worth the added complexity right now.

On the other hand, we could establish a storage format for paginated lists, that never changes anything that has already been stored. Updates get stored with the message id of the updated message but with the timestamp of the change. Deletes are stored as tombstones with the timestamp of the deletion. The client can then keep (and actually use) every item it has received once and update the state of updated/deleted items when it receives new data from this changelog. When the client comes online, it will only ask the server for the changes beginning at it's last received item. That would make sense. Do I want to build this now?

A much simpler route for now: The client has no state when it comes online and needs to fetch everything from the server: Conversations, Users, all messages. The longer the server lives and the longer the client participates in chats, the longer the initial fetch will take.


## Messages From Server To Client

### add-public-conversation

Data: conversation id, conversation name

A new public conversation has been created. The client adds the conversation to its internal list of public conversations.

### join-private-conversation

Data: conversation id, conversation name

The user has joined or has been added to a private conversation

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




## Messages From Client To Server

### send-message

Direction: client -> server
Data: client message id, client message time, conversation id, user id of sender, text

The client wants to broadcast a message to one of it's conversations.

# Socket Messages Currently in Use 

## Server -> Client:

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
message -> add-message

## Client -> Server:

set-name
enable-sound
enable-notifications
disconnect
create-conversation
join-conversation
leave-conversation
message -> send-message