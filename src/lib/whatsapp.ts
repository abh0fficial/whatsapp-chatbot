export async function sendWhatsAppMessage(to: string, body: string) {
  const res = await fetch(
    `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    // Surface the real Meta API error (bad token, unverified number, etc.)
    // instead of silently swallowing it.
    console.error("WhatsApp send error:", JSON.stringify(data));
    throw new Error(
      `WhatsApp API error (${res.status}): ${data?.error?.message || JSON.stringify(data)}`
    );
  }

  return data;
}
