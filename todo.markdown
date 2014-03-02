TODOs
=====

- On joining a room, load all messages from that room
- On joining a room, only load a few messages from the past
  (20 messages or so)
- Provide controls to load more messages from the past
  (from today, this week, this month, this year, from beginning)

- Mockups for UI
- Angular frontend instead of jQuery
- Bootstrapify
- Arrow up: Edit last message
- Click on own message -> edit it again
- Edited messages get an 'was edited' marker
- Display only timestamp for messages from today
  (otherwise timestamp and date)
- Display some <hr> and h2 for each new day.
- Show active users for current room and for all rooms in right side bar
- Remember Nickname with cookie
- login?
- Persist user settings
  - open rooms/conversations
  - sound muted/enabled
- Chaning a room does not make you leave a room, it stays in the left side bar.
- Remove persistent chat messages after 3 months or so (configurable)
- Emojis
- Paste pictures
- Recognize URLs in chat messages and render as links
- private conversations/rooms:
  - instead of public rooms, where everybody can join, you can not see
    the private conv
  - you can not join the conv, but get invited/added to it
  - you stay in the conv as long as you want
  - all conversations and rooms you are currently in are shown in the left side bar

- Desktop Notifications (Chrome, Firefox, Safari):
  - https://developer.mozilla.org/en-US/docs/Web/API/notification
  - http://alxgbsn.co.uk/2013/02/20/notify-js-a-handy-wrapper-for-the-web-notifications-api/
  - opt-out/opt-in, but def. configurable
  - otherwise, change title of tab like "(x) Chat".
  - Maybe even make the blink when new messages come in. (http://stackoverflow.com/questions/37122/make-browser-window-blink-in-task-bar / http://forums.mozillazine.org/viewtopic.php?f=25&t=404146). Config options: Don't blink/Blink a few times when unread messages are there/Blink forever until window get's focus again.

