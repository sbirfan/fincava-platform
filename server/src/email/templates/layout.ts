// Plain, professional layout shared by every transactional email. Kept
// intentionally simple — no marketing styling, this is B2B operational mail.
export function renderEmailLayout(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 36px 8px;border-bottom:1px solid #e5e0d5;">
                <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7a5e;font-family:Arial,sans-serif;font-weight:600;">FINCAVA</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#2b2b28;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 36px;border-top:1px solid #e5e0d5;font-family:Arial,sans-serif;font-size:12px;color:#8a8578;">
                FINCAVA — Green Coffee Buyer Relationship Platform
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
