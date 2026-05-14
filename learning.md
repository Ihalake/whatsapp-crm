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
