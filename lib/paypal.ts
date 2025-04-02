import fetch from "node-fetch";

export class PayPalClient {
  private clientId: string;
  private clientSecret: string;
  private isProduction: boolean;

  constructor(clientId: string, clientSecret: string, isProduction: boolean = false) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.isProduction = isProduction;
  }

  private get baseUrl(): string {
    return this.isProduction
      ? "https://api.paypal.com"
      : "https://api.sandbox.paypal.com";
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  async createOrder(orderData: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    return response.json();
  }

  async capturePayment(orderId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.json();
  }
}
