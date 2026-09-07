import type { Core } from '@strapi/strapi';
import { sendConsultationNotification } from './api/consultation/services/notification';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Daftarkan Document Service Middleware untuk memicu notifikasi email saat ada reservasi masuk
    strapi.documents.use(async (context: any, next: () => Promise<any>) => {
      const result = await next();

      // Filter operasi: hanya saat entitas konsultasi dibuat (create)
      if (
        context.uid === 'api::consultation.consultation' &&
        context.action === 'create'
      ) {
        // Eksekusi asinkron (non-blocking) agar tidak memperlambat respon HTTP ke klien website
        const payload = result || context.params?.data;
        if (payload) {
          setImmediate(() => {
            sendConsultationNotification(strapi, payload).catch((error: any) => {
              strapi.log.error(
                `[Consultation Hook] Gagal mengirim notifikasi email: ${error?.message || error}`
              );
            });
          });
        }
      }

      return result;
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
