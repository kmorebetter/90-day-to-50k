const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
const FROM_EMAIL = 'Kerry at BetterStory <kmo@betterstory.co>';
const SKILLS_PACK_URL = process.env.SKILLS_PACK_URL || 'https://betterstory.co/skills-pack.zip';

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, firstName } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Add to audience
    if (AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        firstName: firstName || '',
        audienceId: AUDIENCE_ID,
      });
    }

    // Send welcome email with skills pack
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your BetterStory Claude Skills Pack',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e0dc;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#2a5a3a;padding:32px 40px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7ab891;">BetterStory</p>
              <h1 style="margin:12px 0 0;font-size:24px;font-weight:400;color:#ffffff;line-height:1.3;">Your Claude Skills Pack is ready.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#6b6b6b;line-height:1.7;">
                ${firstName ? `Hey ${firstName}, thanks` : 'Thanks'} for grabbing the pack. Inside you'll find five skills you can drop straight into Claude Code and start using today.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-left:3px solid #2a5a3a;border-radius:0 6px 6px 0;margin:0 0 28px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2a5a3a;">What's in the pack</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1a1a1a;line-height:1.5;">→ Skill Miner — extract reusable skills from any session</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1a1a1a;line-height:1.5;">→ Pre-Meeting Brief — instant context before any call</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1a1a1a;line-height:1.5;">→ Better Communicator — sharpen any message in seconds</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1a1a1a;line-height:1.5;">→ Meeting to Action — transcript to task list in 90 seconds</p>
                    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.5;">→ Weekly Ops Summary — your week, distilled automatically</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${SKILLS_PACK_URL}" style="display:inline-block;background:#2a5a3a;color:#ffffff;padding:15px 36px;font-size:15px;font-weight:500;text-decoration:none;border-radius:5px;letter-spacing:0.01em;">Download the skills pack →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 14px;font-size:15px;color:#6b6b6b;line-height:1.7;">Each skill is a single file. Drop it into your Claude Code skills folder and it's available immediately — no configuration, no setup.</p>
              <p style="margin:0;font-size:15px;color:#6b6b6b;line-height:1.7;">If you want to talk about what else we can automate in your business, <a href="https://calendly.com/kmo-betterstory/discovery" style="color:#2a5a3a;">book a 30-minute call</a>. No pitch. Just a conversation.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e2e0dc;">
              <p style="margin:0;font-size:13px;color:#aaa;line-height:1.6;">BetterStory · Kerry Morrison · <a href="https://betterstory.co" style="color:#aaa;">betterstory.co</a></p>
              <p style="margin:8px 0 0;font-size:13px;color:#aaa;">You're receiving this because you requested the skills pack. That's it — no newsletter unless you ask for one.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
