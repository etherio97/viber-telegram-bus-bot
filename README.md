# Viber Telegram Messenger Chstbot for Ysngon Bus

## Messenger Webhook Payload

```ts
type Sender = {
  id: string;
}

type Recipient = {
  id: string;
}

type QuickReply {
  payload: string;
}

type Payload = {
  quick_reply: QuickReply;
}

type Message = {
  mid: string;
  text: string;
  payload?: Payload;
}

type Messaging = {
  sender: Sender;
  recipient: Recipient;
  timestamp: number;
  message: Message;
}
```
