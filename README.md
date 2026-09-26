# WhatsApp AI Agent

A full-stack WhatsApp AI agent built with Next.js. It receives messages via the Meta WhatsApp Business API, generates AI replies using OpenRouter, and provides a real-time dashboard to view and manage all conversations. It also has `Human` & `AI` reply mode

## Architecture

```
User sends WhatsApp message
  -> Meta forwards to POST /api/webhook
  -> Message stored in Supabase
  -> Sent to AI model (OpenRouter)
  -> AI reply sent back via Meta Graph API
  -> Reply stored in Supabase
  -> Dashboard updates in real-time
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL + Realtime)
- **AI:** OpenRouter API (OpenAI-compatible)
- **Styling:** Tailwind CSS

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | Permanent token from Meta Business > System Users |
| `WHATSAPP_PHONE_NUMBER_ID` | From Meta App > WhatsApp > API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Any string you choose for webhook verification |
| `OPENROUTER_API_KEY` | API key from openrouter.ai |
| `AI_MODEL` | Model ID (e.g. `anthropic/claude-sonnet-4-20250514`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

### 3. Set up the database

Create these tables in your Supabase project (via SQL Editor or MCP):

```sql
create table conversations (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  name text,
  mode text not null default 'agent' check (mode in ('agent', 'human')),
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  whatsapp_msg_id text unique,
  created_at timestamp with time zone default now()
);

create index idx_messages_conversation on messages(conversation_id);
create index idx_conversations_updated on conversations(updated_at desc);

-- Enable real-time
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
```

### 4. Run the dev server

```bash
npm run dev
```

### 5. Expose your local server

Use ngrok (or deploy to Vercel) to get a public URL:

```bash
ngrok http 3000
```

### 6. Configure the Meta webhook

1. Go to [Meta App Dashboard](https://developers.facebook.com) > your app > WhatsApp > Configuration
2. Set webhook URL to `https://your-url.com/api/webhook`
3. Set verify token to match your `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to the **messages** field

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/webhook` | Meta webhook verification |
| POST | `/api/webhook` | Receive incoming WhatsApp messages |
| GET | `/api/conversations` | List all conversations |
| PATCH | `/api/conversations/[id]` | Update conversation mode (agent/human) |
| GET | `/api/conversations/[id]/messages` | Get messages for a conversation |
| POST | `/api/conversations/[id]/send` | Send a manual message from the dashboard |

## Dashboard Features

- **Sidebar:** All conversations sorted by latest message, with mode badges (AI/Human)
- **Chat panel:** WhatsApp-style message bubbles with timestamps
- **Mode toggle:** Switch between Agent (AI auto-reply) and Human (manual reply) per conversation
- **Manual send:** Type and send messages from the dashboard in either mode
- **Real-time:** New messages appear instantly via Supabase Realtime

## Deployment

Deploy to Vercel:

```bash
vercel
```

Then update your Meta webhook URL to point to your Vercel deployment.

---

## Step-by-Step Setup Guide

Follow these steps in order to go from zero to a working WhatsApp AI agent.

### Step 1: Create a Meta Business App

1. Go to https://developers.facebook.com and log in
2. Click **My Apps** > **Create App**
3. Select **Business** as the app type
4. Give it a name (e.g. "WhatsApp AI Agent") and click **Create**
5. On the app dashboard, find **WhatsApp** and click **Set Up**
6. You'll be assigned a test phone number and a temporary access token

### Step 2: Get a Permanent Access Token

The temporary token expires in 24 hours. To get a permanent one:

1. Go to https://business.facebook.com/settings/system-users
2. Click **Add** to create a new System User (Admin role)
3. Click **Add Assets** > select your app > toggle **Full Control**
4. Click **Generate Token** > select your app > check `whatsapp_business_messaging` and `whatsapp_business_management`
5. Copy the token — this is your `WHATSAPP_ACCESS_TOKEN`

### Step 3: Get Your Phone Number ID

1. Go to https://developers.facebook.com > your app > WhatsApp > **API Setup**
2. Under "From", you'll see your test phone number and its **Phone Number ID**
3. Copy it — this is your `WHATSAPP_PHONE_NUMBER_ID`

### Step 4: Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Once created, go to **Project Settings** > **API**
3. Copy these values:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** -> `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor** and run the SQL from the "Set up the database" section above

### Step 5: Get an OpenRouter API Key

1. Go to https://openrouter.ai and create an account
2. Go to https://openrouter.ai/keys and create a new API key
3. Copy it — this is your `OPENROUTER_API_KEY`
4. Choose a model ID for `AI_MODEL` (e.g. `anthropic/claude-sonnet-4-20250514`, `openai/gpt-4o`, `minimax/minimax-m2.5`)

### Step 6: Configure the Project

1. Clone this repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd whatsapp_claude_code
   npm install
   ```

2. Create your `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in all the values you collected in Steps 2-5

### Step 7: Start the App

```bash
npm run dev
```

The app will start on http://localhost:3000. Open it in your browser — you should see the dashboard with an empty conversation list.

### Step 8: Expose Your Local Server

Meta needs a public HTTPS URL to send webhooks to. Use ngrok:

```bash
# Install ngrok if you haven't: https://ngrok.com/download
ngrok http 3000
```

Copy the `https://` forwarding URL (e.g. `https://abc123.ngrok-free.app`).

### Step 9: Configure the Webhook in Meta

1. Go to https://developers.facebook.com > your app > WhatsApp > **Configuration**
2. Under "Webhook", click **Edit**
3. Set the **Callback URL** to: `https://your-ngrok-url.ngrok-free.app/api/webhook`
4. Set the **Verify Token** to the same value as your `WHATSAPP_VERIFY_TOKEN` in `.env.local`
5. Click **Verify and Save**
6. Under "Webhook Fields", click **Manage** and subscribe to **messages**

### Step 10: Add Your Phone Number to Recipients

If using the Meta test phone number:

1. Go to WhatsApp > API Setup
2. Under "To", add your personal WhatsApp phone number
3. You'll receive a verification code on WhatsApp — enter it to confirm

### Step 11: Send a Test Message

1. Open WhatsApp on your phone
2. Send a message to the Meta test phone number (shown in API Setup)
3. You should receive an AI-generated reply within a few seconds
4. Open the dashboard at http://localhost:3000 — the conversation should appear in the sidebar

### Step 12: Deploy to Production (Optional)

1. Push your code to GitHub
2. Import the project on https://vercel.com
3. Add all your environment variables in Vercel's project settings
4. Deploy — Vercel will give you a production URL
5. Go back to Meta > WhatsApp > Configuration and update the webhook URL to your Vercel URL
6. Remove the ngrok dependency — you're live!

### Troubleshooting

| Problem | Solution |
|---|---|
| Webhook verification fails | Double-check `WHATSAPP_VERIFY_TOKEN` matches in both `.env.local` and Meta dashboard |
| Messages received but no AI reply | Check your `OPENROUTER_API_KEY` and `AI_MODEL` are valid |
| Dashboard shows no conversations | Make sure you're opening the correct port (check terminal output) |
| Duplicate replies | Meta retries if your webhook doesn't respond within 5 seconds — check server logs for slow AI responses |
| "Message failed to send" | Verify your `WHATSAPP_ACCESS_TOKEN` hasn't expired and `WHATSAPP_PHONE_NUMBER_ID` is correct |
