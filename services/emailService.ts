export const EmailService = {
  sendEmail: async (
    config: { enabled: boolean; apiKey: string; domain: string; fromEmail: string },
    to: string,
    subject: string,
    text: string
  ) => {
    if (!config.enabled) {
      console.log(`[Email Service] Skipped email to ${to} (Mailgun disabled)`);
      return;
    }

    if (!config.apiKey || !config.domain) {
      console.warn("[Email Service] Mailgun configuration missing (API Key or Domain)");
      return;
    }

    console.log(`[Email Service] Sending email to ${to} via Mailgun...`);

    const auth = btoa(`api:${config.apiKey}`);
    const formData = new FormData();
    formData.append('from', config.fromEmail || `noreply@${config.domain}`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);

    try {
      const response = await fetch(`https://api.mailgun.net/v3/${config.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Mailgun API Error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const result = await response.json();
      console.log(`[Email Service] Email sent successfully: ${result.id}`);
      return result;
    } catch (error) {
      console.error("[Email Service] Failed to send email", error);
      // Note: Browser-based calls to Mailgun often fail CORS without a proxy.
      // We log this for debugging purposes in this frontend-only demo.
    }
  }
};