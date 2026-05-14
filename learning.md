# Database (WhatsApp CRM)

creating 3 tables inside server/db.js using SQLite.

    1  . leads (the users) -> Stores each person who messages your WhatsApp number.
    One WhatsApp number = one lead
    2.conversations (chat state)->Tracks the current flow/state of a chat with a lead.
    lead_id → links to a lead
    3.messages (chat history)->Stores every message sent/received.


# Index.js
defined the pipeline( ** Request → Middleware → Route → DB → Response **)

When someone sends your server data, it arrives in a raw format, not as a nice JavaScript object.

Example: WhatsApp sends this
{
  "name": "John",
  "message": "Hello"
}

But your server does NOT immediately see this as:

req.body.name // ❌ not yet available

Instead, it first arrives as raw text or buffer, like:

"{\"name\":\"John\",\"message\":\"Hello\"}" -> Your server is basically like:“I received data… but I don’t understand it yet.”
app.use(express.json()); -> “Whenever a request comes in with JSON, convert it into a JavaScript object.”

# webhook.js
This file is the core “entry door” of my WhatsApp bot. Everything Meta sends to comes through here
It has 2 jobs :
    .Verify Meta owns the webhook (one-time handshake)
    .Receive real WhatsApp messages (every time someone texts you)

This is basically a mini-route module that will be plugged into the main server index.js
hub.mode ->	“I am trying to verify webhook”
hub.verify_token	-> Secret you set in Meta
hub.challenge	-> Random string Meta wants back

# Building the bot

**state machines** -> the current state decides what the next message means
awaiting_name   ->   awaiting_email   ->   awaiting_inquiry_type
                                                    |
                                                    v
                                              confirming
                                                    |
                                                    v
                                                complete

    This is the central insight of state machine bots running on stateless HTTP servers: the database holds the state; the code is just the transitions. Every incoming webhook: load the state, decide what to do, write the new state back, send a reply. Do not try to keep anything in a global variable -- if the server restarts mid-conversation (nodemon, a crash, a deploy) you lose everything.

Signature verification. crypto.createHmac computes an HMAC-SHA256 of the raw request body using your app secret as the key. Meta did the same thing on their side and put the result in the X-Hub-Signature-256 header. If they match, the request really came from Meta
