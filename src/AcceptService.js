import React from 'react';
import axios from 'axios';

// the base url of accept payment
const baseUrl = 'https://accept.paymobsolutions.com/api';

let token = '';
let paymentToken = '';

let config = {
    apiKey: '',
    iFrameId: '',
    status: '',
    integration: {}
}

let options;

class AcceptService {
    setConfig(configOptions) {
        config = configOptions;
    }

    async getToken() {
        try {
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/auth/tokens`,
                headers: { 'content-type': 'application/json' },
                data: {
                    api_key: config.apiKey
                },
            });
            console.log('response', response);
            token = response.data.token;
            return true;
        } catch (e) {
            console.log('getToken error', e)
        }
    }

    async getOrder() {
        try {
            const orders = await axios({
                method: 'get',
                url: `${baseUrl}/ecommerce/orders?token=${token}&merchant_order_id=${options.uniqueId}`,
                headers: { 'content-type': 'application/json' },
            });
            console.log('orders', orders);
            if (orders.data.results.length) {
                return { orderId: orders.data.results[0].id };
            }
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/ecommerce/orders?token=${token}`,
                headers: { 'content-type': 'application/json' },
                data: {
                    'delivery_needed': 'false',
                    'merchant_id': options.marchantId,
                    'merchant_order_id': options.uniqueId,
                    'amount_cents': options.price * 100,
                    'currency': options.currency,
                    'items': [],
                },
            });
            console.log('getOrder response===', response);
            return { orderId: response.data.id };
        } catch (e) {
            console.log('getOrder error', e)
        }
    }

    async generatePaymentToken(orderId) {
        try {
            console.log('generatePaymentToken... caled ', token, orderId);
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payment_keys?token=${token}`,
                headers: { 'content-type': 'application/json' },
                data: {
                    'amount_cents': options.price * 100,
                    'currency': options.currency,
                    'integration_id': options.type === 'cash' ? config.integration[config.status]['kiosk'] : config.integration[config.status]['card'],
                    'kiosk_integration_id': options.type === 'cash' ? config.integration[config.status]['kiosk'] : config.integration[config.status]['card'],
                    'card_integration_id': options.type === 'cash' ? config.integration[config.status]['kiosk'] : config.integration[config.status]['card'],
                    'order_id': orderId,
                    'billing_data': {
                        'first_name': options.firstName,
                        'last_name': options.lastName,
                        'phone_number': options.code + options.mobile,
                        'email': options.email,
                        'apartment': 'NA',
                        'floor': 'NA',
                        'street': 'NA',
                        'building': 'NA',
                        'shipping_method': 'NA',
                        'postal_code': 'NA',
                        'city': 'NA',
                        'country': options.country,
                        'state': 'NA'
                    }
                },
            });
            console.log('generatePaymentToken... response --> ', response);
            if (response.error) console.log('error generating payment', response.error);
            console.log('body', response.data)
            paymentToken = response.data.token;
        } catch (e) {
            console.log('generatePaymentToken error', e)
        }
    }

    async createURL(paymentToken) {
        return `${baseUrl}/acceptance/iframes/${config.iFrameId}?payment_token=${paymentToken}`  //27874
    }

    async createReference(paymentToken) {
        console.log('createReference req', paymentToken);
        try {
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payments/payment_token=${paymentToken}`,
                headers: { 'content-type': 'application/json' },
                data: {
                    'source': {
                        'identifier': 'AGGREGATOR',
                        'subtype': 'AGGREGATOR'
                    },
                    'payment_token': paymentToken
                }
            });
            console.log('createReference response', response);
            return response.data.data ? response.data.data.bill_reference : null;
        } catch (e) {
            console.log('createReference error', e)
        }
    }
    // set options to generate iFrame url.
    setOptions(props) {
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

    async getIframeUrl(props) {
        this.setOptions(props);
        console.log('optionsoptionsoptionsoptions', options);
        if (!options || !options.uniqueId || !options.price) {
            return {
                status: 400,
                message: 'bad request'
            };
        }
        await this.getToken();
        const { orderId } = await this.getOrder();
        if (isNaN(orderId)) return { message: 'orderId from accept is not a number' };
        await this.generatePaymentToken(orderId);

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