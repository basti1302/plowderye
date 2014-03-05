TODOs
=====
- Angular frontend instead of jQuery

- On joining a conversations, only load a few messages from the past
  (20 messages or so) (instead of loading *all* messages from that room)
- Provide controls to load more messages from the past
  (from today, this week, this month, this year, from beginning)

- Send notifications-enabled to client when reading cookie

Conversations
-------------
- Rename room to conversation everyhwere
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
- Desktop Notifications:
  - Make notifications configurable (opt-out)
  - Make em less annoying (less often, disappear after a few seconds, don't show if tab has focus, don't show when joining a room and receiving "old" messages...)

Persistent User Accounts?
-------------------------
- login
- Persist user settings (in addition to cookies)

