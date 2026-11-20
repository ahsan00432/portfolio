# Cloudflare Pages Email Setup

The contact form is served by `functions/api/contact.js`. Cloudflare Pages runs this Function alongside the static site on `*.pages.dev`.

## 1. Create a Resend account

Create an account at https://resend.com and generate an API key.

For testing, `onboarding@resend.dev` can only send to the email address that owns the Resend account. Before public use, verify a sending domain in Resend and set `MAIL_FROM` to an address on that domain.

## 2. Add secrets in Cloudflare Pages

Open your Pages project, then:

**Settings > Environment variables > Add variables**

For both **Production** and **Preview**, add:

```text
RESEND_API_KEY = your-resend-api-key
CONTACT_EMAIL = a3216572@gmail.com
MAIL_FROM = Portfolio <onboarding@resend.dev>
```

Mark `RESEND_API_KEY` as a secret.

## 3. Deploy

Push the repository or run:

```powershell
npx wrangler pages deploy .
```

Create the Pages project using the repository as the build source. The build command can be left empty, because this site is plain HTML. Set the output directory to `.`.

Do not commit `RESEND_API_KEY` or add it to `index.html`.
