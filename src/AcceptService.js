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
                    api_key: config.apiKey + '123'
                },
            });
            token = response.data.token;
            return true;
        } catch (e) {
            console.warn('error in getting token', e);
            throw e;
        }
    }

    async getOrder() {
        try {
            const orders = await axios({
                method: 'get',
                url: `${baseUrl}/ecommerce/orders`,
                headers: { 'content-type': 'application/json' },
                params: {
                    token,
                    merchant_order_id: options.uniqueId
                }
            });
            if (orders.data.results.length) {
                return { orderId: orders.data.results[0].id };
            }
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/ecommerce/orders`,
                headers: { 'content-type': 'application/json' },
                params: {
                    token,
                },
                data: {
                    'delivery_needed': 'false',
                    'merchant_id': options.marchantId,
                    'merchant_order_id': options.uniqueId,
                    'amount_cents': options.price * 100,
                    'currency': options.currency,
                    'items': [],
                },
            });
            return { orderId: response.data.id };
        } catch (e) {
            console.warn('error in getting order', e)
            throw e;
        }
    }

    async generatePaymentToken(orderId) {
        try {
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payment_keys`,
                headers: { 'content-type': 'application/json' },
                params: {
                    token,
                },
                data: {
                    'auth_token': token,
                    'amount_cents': options.price * 100,
                    'currency': options.currency,
                    'integration_id': config.integration[config.status][options.type],
                    'kiosk_integration_id': config.integration[config.status][options.type],
                    'card_integration_id': config.integration[config.status][options.type],
                    'wallet_integration_id': config.integration[config.status][options.type],
                    'order_id': orderId,
                    'billing_data': {
                        'first_name': options.firstName,
                        'last_name': options.lastName,
                        'phone_number': options.code + options.mobile,
                        'email': options.email,
                        'country': options.country,
                        'apartment': options.address.apartment || 'NA',
                        'floor': options.address.floor || 'NA',
                        'street': options.address.street || 'NA',
                        'building': options.address.building || 'NA',
                        'shipping_method': options.address.shipping_method || 'NA',
                        'postal_code': options.address.postal_code || 'NA',
                        'city': options.address.city || 'NA',
                        'state': options.address.state || 'NA'
                    }
                },
            });
            if (response.error) {
                console.warn('error in generating payment keys error', response.error);
                throw response.error;
            }
            paymentToken = response.data.token;
        } catch (e) {
            console.warn('error in generating payment keys error', e)
            throw e;
        }
    }

    async createURL(paymentToken) {
        return `${baseUrl}/acceptance/iframes/${config.iFrameId}?payment_token=${paymentToken}`;
    }

    // create reference for cash payment
    // async createReference(paymentToken) {
    //     try {
    //         const response = await axios({
    //             method: 'post',
    //             url: `${baseUrl}/acceptance/payments`,
    //             headers: { 'content-type': 'application/json' },
    //             params: {
    //                 payment_token: paymentToken,
    //             },
    //             data: {
    //                 'source': {
    //                     'identifier': 'AGGREGATOR',
    //                     'subtype': 'AGGREGATOR'
    //                 },
    //                 'payment_token': paymentToken
    //             }
    //         });
    //         return response.data.data ? response.data.data.bill_reference : null;
    //     } catch (e) {
    //         console.warn('createReference error', e)
    // throw e;
    //     }
    // }

    // set options to generate iFrame url.
    setOptions(props) {
        options = {
            type: props.type || 'card',
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
        if (props.address) {
            options.address = props.address
        } else {
            options.address = {};
        }
    }

    async getIframeUrl(props) {
        try {
            this.setOptions(props);
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
                const url = await this.createURL(paymentToken);
                return url;
                // if (options.type === 'cash') {
                //     return await this.createReference(paymentToken);
                // } else {
                //     const url = await this.createURL(paymentToken);
                //     return url;
                // }
            }
        } catch (e) {
            throw e;
        }
    };
}
const acceptService = new AcceptService();
export default acceptService;