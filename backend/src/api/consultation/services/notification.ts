import type { Core } from '@strapi/strapi';

/**
 * Utility sanitasi string untuk mencegah HTML injection pada template email
 */
function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '-';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format email HTML dengan identitas visual editorial Dharma Banten
 * (Deep Navy #0B0C0E, Regal Gold #C59B27, Card Surface #FFFFFF)
 */
function buildHtmlTemplate(data: any): string {
  const name = escapeHtml(data.name);
  const company = escapeHtml(data.company);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);
  const service = escapeHtml(data.service || 'Konsultasi Umum');
  const packageName = escapeHtml(data.packageName || '-');
  const packagePrice = escapeHtml(data.packagePrice || '-');
  const bookingDate = escapeHtml(data.bookingDate || '-');
  const bookingTime = escapeHtml(data.bookingTime || '-');
  const description = escapeHtml(data.description || '-');
  const status = escapeHtml(data.status || 'Baru');
  const createdAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Reservasi Konsultasi Baru</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px; background-color: #F8FAFC;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(11, 12, 14, 0.06);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B0C0E 0%, #1E293B 100%); padding: 32px 28px; text-align: left; border-bottom: 3px solid #C59B27;">
              <div style="font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #C59B27; text-transform: uppercase; margin-bottom: 8px;">
                Dharma Banten Consultant
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                Reservasi Konsultasi Baru
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;">
                Diterima pada: ${createdAt} WIB
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Halo Tim Konsultan Dharma Banten, terdapat pengajuan jadwal konsultasi baru melalui situs web. Berikut detail calon klien:
              </p>

              <!-- Client Info Table -->
              <table width="100%" cellpadding="10" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse; background-color: #F8FAFC; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0;">
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td width="35%" style="font-size: 13px; font-weight: 600; color: #64748B;">Nama Klien / PIC</td>
                  <td width="65%" style="font-size: 14px; font-weight: 700; color: #0F172A;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Perusahaan / Instansi</td>
                  <td style="font-size: 14px; font-weight: 600; color: #0F172A;">${company}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Email Klien</td>
                  <td style="font-size: 14px; color: #0F172A;"><a href="mailto:${email}" style="color: #C59B27; text-decoration: none; font-weight: 600;">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">No. WhatsApp / Telp</td>
                  <td style="font-size: 14px; color: #0F172A;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #0F172A; text-decoration: none; font-weight: 600;">${phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Layanan Dipilih</td>
                  <td style="font-size: 14px; font-weight: 600; color: #0F172A;">${service}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Paket & Harga</td>
                  <td style="font-size: 14px; color: #0F172A;">${packageName} ${packagePrice !== '-' ? `(${packagePrice})` : ''}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Rencana Jadwal</td>
                  <td style="font-size: 14px; font-weight: 700; color: #0B0C0E;">${bookingDate} — Pukul ${bookingTime} WIB</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748B;">Status Intake</td>
                  <td style="font-size: 13px; font-weight: 700; color: #15803D;">● ${status}</td>
                </tr>
              </table>

              <!-- Problem Description Box -->
              <div style="margin-bottom: 24px; padding: 16px; background-color: #F1F5F9; border-left: 4px solid #C59B27; border-radius: 0 6px 6px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                  Deskripsi Kebutuhan / Kasus:
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #1E293B; white-space: pre-line;">
                  ${description}
                </div>
              </div>

              <!-- Action Prompt -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <a href="mailto:${email}?subject=Konfirmasi Jadwal Konsultasi Dharma Banten" style="display: inline-block; background-color: #0B0C0E; color: #C59B27; border: 1px solid #C59B27; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none;">
                      Balas Langsung Klien
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 20px 28px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
              Email otomatis ini dikirim oleh sistem portal resmi <strong>Dharma Banten Consultant</strong>.<br>
              Anda juga dapat mengelola status jadwal ini langsung melalui <a href="https://dharmabantenconsultant.com/admin" style="color: #64748B; text-decoration: underline;">Strapi Admin Panel</a>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Format pesan Plain Text sebagai fallback
 */
function buildPlainText(data: any): string {
  return `
[RESERVASI KONSULTASI BARU - DHARMA BANTEN CONSULTANT]

Nama Klien    : ${data.name || '-'}
Perusahaan    : ${data.company || '-'}
Email         : ${data.email || '-'}
No. HP/WA     : ${data.phone || '-'}
Layanan       : ${data.service || '-'}
Paket         : ${data.packageName || '-'} (${data.packagePrice || '-'})
Jadwal Diajukan: ${data.bookingDate || '-'} - Pukul ${data.bookingTime || '-'} WIB
Status        : ${data.status || 'Baru'}

Deskripsi Kebutuhan:
${data.description || '-'}

---
Pesan ini dikirim secara otomatis oleh backend portal Dharma Banten Consultant ke info@dharmabantenconsultant.com.
  `.trim();
}

/**
 * Menembakkan notifikasi email secara aman (resilient / non-blocking)
 */
export async function sendConsultationNotification(
  strapi: Core.Strapi,
  consultationData: any
): Promise<void> {
  const recipientEmail =
    process.env.NOTIFICATION_RECIPIENT_EMAIL || 'info@dharmabantenconsultant.com';
  const senderEmail =
    process.env.NOTIFICATION_SENDER_EMAIL ||
    `"Dharma Banten System" <${recipientEmail}>`;
  const replyTo =
    consultationData.email ||
    process.env.NOTIFICATION_REPLY_TO_EMAIL ||
    recipientEmail;

  const subject = `[Reservasi Baru] Konsultasi: ${consultationData.name || 'Klien'} - ${consultationData.company || 'Perusahaan'}`;
  const html = buildHtmlTemplate(consultationData);
  const text = buildPlainText(consultationData);

  try {
    const emailPlugin = strapi.plugin('email');
    if (!emailPlugin || !emailPlugin.service('email')) {
      strapi.log.warn(
        '[Consultation Email] Plugin email belum terkonfigurasi atau belum aktif. Notifikasi dilewati.'
      );
      return;
    }

    strapi.log.info(
      `[Consultation Email] Mengirim email notifikasi reservasi untuk "${consultationData.name}" ke ${recipientEmail}...`
    );

    await emailPlugin.service('email').send({
      to: recipientEmail,
      from: senderEmail,
      replyTo: replyTo,
      subject: subject,
      text: text,
      html: html,
    });

    strapi.log.info(
      `[Consultation Email] Sukses terkirim ke ${recipientEmail} untuk reservasi ID: ${consultationData.documentId || consultationData.id || 'N/A'}`
    );
  } catch (error: any) {
    // Sesuai prinsip IS NOT #1: Kegagalan SMTP DILARANG menggagalkan reservasi di database
    strapi.log.error(
      `[Consultation Email] Gagal mengirim notifikasi email ke ${recipientEmail}: ${error?.message || error}`
    );
  }
}
