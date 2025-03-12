declare module '@getbrevo/brevo' {
    export class TransactionalEmailsApi {
      apiClient: {
        authentications: {
          "api-key": { apiKey: string };
        };
      };
      sendTransacEmail: (emailContent: any) => Promise<any>;
    }
  }