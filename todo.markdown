TODOs
=====

BUGS
----
- [BUG] A new public conversation is not added to the list of public conversations for other clients anymore
- [BUG] you can add yourself to a conversation you already participate in and receive all old messags again
- [BUG] you can add another user to a conversation he/she is already participating in and he/she will receive all old messags again
- [BUG] leaving a conversation displays a leaving message in other clients, but does not remove the user from the participant list in the client

- remove non-public conversations when last participant has left
- add users to conversations via drag'n'drop
- https
- register account with permanent nick name
- convert build to gulp
- versioning for assets, emit max-age headers, enable browser caching, etc.

- When coming online, fetch the message log for all conversations (asynchronously). Currently the server just sends all messages in all conversations without being asked.

- objects, especially user, is stored to often and at random times
  - dirty flag?

- wasn't able to browserify notify.js last time I tried. Try again. Or use another Notification API wrapper, maybe one that's on npm.

- make conversations linkable - read conversation id from url and open conversation

- angular routing (views for chat, sign-in, sign-up)

- remove nick name from leveldb used names file when user disconnects if that user does not have a registered account

- enable users to add other users to conversations
- closed/private conversations, see below

- On joining a conversations, only load a few messages from the past
  (20 messages or so) (instead of loading *all* messages from that room)
  there are some angular infinite scrolling modules, that might be worth checking out
- Provide controls to load more messages from the past
  (from today, this week, this month, this year, from beginning)

Conversations
-------------
- Public conversations (like IRC rooms) and private conversations (like Skype conversations)
- Changing a room does not make you leave a room, it stays in the left side bar.
- Add "Leave" icon (open door) to leave a conv
- For each user, store which conversations they is part of
- Remove persistent chat messages after 3 months or so (configurable) - otherwise leveldb just eats up more and more space
- private conversations/rooms:
  - instead of public rooms, where everybody can join, you can not see
    the private conv
  - you can not join the conv, but get invited/added to it
  - you stay in the conv as long as you want
  - all conversations and rooms you are currently in are shown in the left side bar
- show users in current conv in top right div (as now) and generel contacts or users online in separate div below that.
- Admin role (store admins per conv, creator is automatically admin. If creator leaves, everybody else is admin)
- Admin can delete conversations
- Conversations which had no new message since month and/or haven't been joined since xxx and/or are empty (no users) get deleted automatically.

Message Editing
---------------
- Arrow up: Edit last message
- Click on own message -> edit it again
- Edited messages get an 'was edited' marker

UI/UX
-----
- Show unread messages per conversation in left conversation panel - how to detect if there are unread messages?
  Maybe store the id of the message that was read last (read = browser tab has focus, conv is open, message is visible in conv log by scrolling position)
- Other notifications in addition to or replacing Desktop Notifications:
  - change title of tab like "(x) Chat".
  - Maybe even make the blink when new messages come in. (http://stackoverflow.com/questions/37122/make-browser-window-blink-in-task-bar / http://forums.mozillazine.org/viewtopic.php?f=25&t=404146). Config options: Don't blink/Blink a few times when unread messages are there/Blink forever until window get's focus again.
- Display only timestamp for messages from today
  (otherwise timestamp and date)
- Display some <hr> and h2 for each new day.
- Show active users for current room and for all rooms in right side bar
- Emojis
- Send images by drag and drop
- Recognize URLs in chat messages and render as links
- Make Desktop Notifications less annoying (less often, disappear after a few seconds, don't show if tab has focus, don't show when joining a room and receiving "old" messages...)

Persistent User Accounts?
-------------------------
- login (try lockit?)
- Persist user settings (in addition to cookies)

