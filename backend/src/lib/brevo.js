async function addContactToBrevo(email, attributes) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    throw new Error("Brevo API key or list ID not configured");
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      listIds: [Number(listId)],
      updateEnabled: true,
      ...(attributes ? { attributes } : {}),
    }),
  });

  if (!res.ok && res.status !== 400) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo API error (${res.status}): ${text}`);
  }

  // 400 with "Contact already exist" is not a failure for our purposes
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    if (body.code !== "duplicate_parameter") {
      throw new Error(`Brevo API error (400): ${JSON.stringify(body)}`);
    }
  }
}

async function createAndSendCampaign({ subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;
  if (!apiKey || !listId || !senderEmail || !senderName) {
    throw new Error("Brevo campaign config missing (API key, list ID, or sender)");
  }

  const createRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      name: `${subject} — ${new Date().toISOString()}`,
      subject,
      sender: { name: senderName, email: senderEmail },
      type: "classic",
      htmlContent,
      recipients: { listIds: [Number(listId)] },
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(`Brevo campaign create error (${createRes.status}): ${text}`);
  }

  const created = await createRes.json();

  const sendRes = await fetch(
    `https://api.brevo.com/v3/emailCampaigns/${created.id}/sendNow`,
    {
      method: "POST",
      headers: { "api-key": apiKey },
    },
  );

  if (!sendRes.ok) {
    const text = await sendRes.text().catch(() => "");
    throw new Error(`Brevo campaign send error (${sendRes.status}): ${text}`);
  }
}

async function sendTransactionalEmail({ to, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;
  if (!apiKey || !senderEmail || !senderName) {
    throw new Error("Brevo transactional email config missing");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo transactional email error (${res.status}): ${text}`);
  }
}

module.exports = { addContactToBrevo, createAndSendCampaign, sendTransactionalEmail };