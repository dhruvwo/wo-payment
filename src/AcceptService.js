import React from 'react';
import axios from 'axios';

let apiKey = '';
let iFrameId: any = '';

const baseUrl = 'https://accept.paymobsolutions.com/api';
const status = 'test';
const integration = {
    test: { card: "14280", kiosk: "14280" },
    live: { card: "17525", kiosk: "17523" }
};

export interface acceptConfig {
    apiKey: string,
    iFrameId: number
}

export interface Options {
    type: string;
    currency: string;
    price: number;
    code: string;
    mobile: string;
    email: string;
    country: string;
    firstName: string;
    lastName: string;
    uniqueId: string;
    marchantId?: string;
};
let options: Options;

class AcceptService {
    public setConfig(config: acceptConfig) {
        apiKey = config.apiKey;
        iFrameId = config.iFrameId;
    }

    private async getToken(): Promise<any> {
        const response: any = await axios({
            method: 'post',
            url: `${baseUrl}/auth/tokens`,
            headers: { "content-type": "application/json" },
            data: {
                api_key: apiKey
            },
        });
        console.log('response', response);
        return response.data.token;
    }

    private async getOrder(token: any): Promise<any> {
        try {
            const orders: any = await axios({
                method: 'get',
                url: `${baseUrl}/ecommerce/orders?token=${token}&merchant_order_id=${options.uniqueId}`,
                headers: { "content-type": "application/json" },
            });
            console.log('orders', orders);
            if (orders.data.results.length) {
                return { orderId: orders.data.results[0].id };
            }
            const response: any = await axios({
                method: 'post',
                url: `${baseUrl}/ecommerce/orders?token=${token}`,
                headers: { "content-type": "application/json" },
                data: {
                    "delivery_needed": "false",
                    "merchant_id": options.marchantId,
                    "merchant_order_id": options.uniqueId,
                    "amount_cents": options.price * 100,
                    "currency": options.currency,
                    "items": [],
                },
            });
            console.log('getOrder response===', response);
            return { orderId: response.data.id };
        } catch (e) {
            console.log('getOrder error', e)
        }
    }

    private async generatePaymentToken(token: string, orderId: number): Promise<any> {
        try {
            console.log('generatePaymentToken... caled ', token, orderId);
            const response: any = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payment_keys?token=${token}`,
                headers: { "content-type": "application/json" },
                data: {
                    "amount_cents": options.price * 100,
                    "currency": options.currency,
                    "integration_id": options.type === 'cash' ? integration[status]['kiosk'] : integration[status]['card'],
                    "kiosk_integration_id": options.type === 'cash' ? integration[status]['kiosk'] : integration[status]['card'],
                    "card_integration_id": options.type === 'cash' ? integration[status]['kiosk'] : integration[status]['card'],
                    "order_id": orderId,
                    "billing_data": {
                        "first_name": options.firstName,
                        "last_name": options.lastName,
                        "phone_number": options.code + options.mobile,
                        "email": options.email,
                        "apartment": "NA",
                        "floor": "NA",
                        "street": "NA",
                        "building": "NA",
                        "shipping_method": "NA",
                        "postal_code": "NA",
                        "city": "NA",
                        "country": options.country,
                        "state": "NA"
                    }
                },
            });
            console.log('generatePaymentToken... response --> ', response);
            if (response.error) console.log('error generating payment', response.error);
            console.log('body', response.data)
            return response.data.token;
        } catch (e) {
            console.log('generatePaymentToken error', e)
        }
    }

    private async createURL(paymentToken: string): Promise<any> {
        return `${baseUrl}/acceptance/iframes/${iFrameId}?payment_token=${paymentToken}`  //27874
    }

    private async createReference(paymentToken: string): Promise<any> {
        console.log('createReference req', paymentToken);
        try {
            const response: any = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payments/payment_token=${paymentToken}`,
                headers: { "content-type": "application/json" },
                data: {
                    "source": {
                        "identifier": "AGGREGATOR",
                        "subtype": "AGGREGATOR"
                    },
                    "payment_token": paymentToken
                }
            });
            console.log('createReference response', response);
            return response.data.data ? response.data.data.bill_reference : null;
        } catch (e) {
            console.log('createReference error', e)
        }
    }
    // set options to generate iFrame url.
    public setOptions(props: Options): void {
        console.log('setOptions called');
        options = {
            type: (props.type ? 'cash' : 'card'),
            uniqueId: props.uniqueId,
            currency: props.currency,
            price: Number((props.price).toFixed(0)),
            code: props.code,
            mobile: props.mobile,
            email: props.email,
            country: props.country,
            firstName: props.firstName,
            lastName: props.lastName,
        };
        console.log('options', options);
    }

    public async getIframeUrl(props: Options): Promise<any> {
        this.setOptions(props);
        console.log('optionsoptionsoptionsoptions', options);
        if (!options || !options.uniqueId || !options.price) {
            return {
                status: 400,
                message: 'bad request'
            };
        }
        const token = await this.getToken();
        const { orderId } = await this.getOrder(token);
        if (isNaN(orderId)) return { message: 'orderId from accept is not a number' };
        const paymentToken = await this.generatePaymentToken(token, orderId);

        if (paymentToken) {
            if (options.type === 'cash') {
                return await this.createReference(paymentToken);
            } else {
                const url = await this.createURL(paymentToken);
                console.log('url', url);
                return url;
            }
        }
    };
}
const acceptService = new AcceptService();
export default acceptService;