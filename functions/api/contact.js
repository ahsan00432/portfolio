export async function onRequestPost(context) {
    const { request, env } = context;

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse({ error: 'Invalid request.' }, 400);
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';

    if (!name || !email || !message) {
        return jsonResponse({ error: 'Please complete all fields.' }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }

    if (!env.RESEND_API_KEY) {
        return jsonResponse({ error: 'Email delivery is not configured.' }, 503);
    }

    const recipient = env.CONTACT_EMAIL || 'a3216572@gmail.com';
    const from = env.MAIL_FROM || 'Portfolio <onboarding@resend.dev>';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from,
                to: [recipient],
                reply_to: email,
                subject: `Portfolio message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
                html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Message:</strong></p>
                    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
            })
        });

        if (!response.ok) {
            const details = await response.text();
            console.error('Resend rejected the email:', details);
            return jsonResponse({ error: 'The message could not be sent. Please try again later.' }, 502);
        }

        return jsonResponse({ message: 'Message sent.' }, 200);
    } catch (error) {
        console.error('Contact email delivery failed:', error);
        return jsonResponse({ error: 'The message could not be sent. Please try again later.' }, 502);
    }
}

function jsonResponse(payload, status) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
