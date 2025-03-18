declare module '@getbrevo/brevo' {
    export class TransactionalEmailsApi {
      setApiKey(apiKey: (apiKey: any, arg1: string) => void, arg1: string) {
        throw new Error("Method not implemented.");
      }
      static apiKey(apiKey: any, arg1: string) {
        throw new Error("Method not implemented.");
      }
      apiClient: {
        authentications: {
          "api-key": { apiKey: string };
        };
      };
      sendTransacEmail: (emailContent: any) => Promise<any>;
      authentications: any;
    }
  }