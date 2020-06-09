import React from 'react';
import axios from 'axios';

// the base url of accept payment
const baseUrl = 'https://accept.paymobsolutions.com/api';

let token = '';
let marchantId = '';
let paymentToken = '';
let orderId = '';

let config = {
    apiKey: '',
    iFrameId: '',
    status: '',
    integration: {}
}

const sourceData = {
    cash: {
        'identifier': 'cash',
        'subtype': 'CASH'
    },
    wallet: {
        'identifier': '01274155230', //options.phoneNumber
        'subtype': 'WALLET'
    },
    kiosk: {
        'identifier': 'AGGREGATOR',
        'subtype': 'AGGREGATOR'
    }
};

let options;

class AcceptService {
    // setting config in app init
    setConfig(configOptions) {
        config = configOptions;
    }

    // set options for order request
    setOptions(props) {
        if (!props || !props.uniqueId || !props.price || !props.firstName
            || !props.lastName || !props.email || !props.phoneNumber) {
            throw {
                status: 400,
                message: 'bad request'
            };
        }
        options = {
            uniqueId: props.uniqueId,
            price: Number((props.price).toFixed(0)),
            phoneNumber: props.phoneNumber,
            email: props.email,
            firstName: props.firstName,
            lastName: props.lastName,
            currency: props.currency || 'EGP',
            type: props.type || 'card',
            country: props.country || 'EG',
            address: props.address || {},
        };
    }

    // authenticate user & get token using api key to precess other requests
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
            marchantId = response.data.profile.id;
            token = response.data.token;
            return true;
        } catch (e) {
            console.warn('error in getting token', e);
            throw e;
        }
    }

    // get order if exist & create one if not exist
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
                throw {
                    order: orders.data.results[0],
                    message: `order already exist for given unique id: ${options.uniqueId}`
                };
            }
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/ecommerce/orders`,
                headers: { 'content-type': 'application/json' },
                params: {
                    token,
                },
                data: {
                    'merchant_id': marchantId,
                    'merchant_order_id': options.uniqueId,
                    'amount_cents': options.price * 100,
                    'currency': options.currency,
                },
            });
            orderId = response.data.id;
            return true;
        } catch (e) {
            console.warn('error in getting order', e)
            throw e;
        }
    }

    // generatePaymentToken is used obtain a payment_key token.
    // This key will be used to authenticate payment request. 
    // It will be also used for verifying your transaction request meta data.
    async generatePaymentToken() {
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
                        'phone_number': options.phoneNumber,
                        'email': options.email,
                        'country': options.country,
                        'city': options.address.city || 'NA',
                        'state': options.address.state || 'NA',
                        'apartment': options.address.apartment || 'NA',
                        'floor': options.address.floor || 'NA',
                        'street': options.address.street || 'NA',
                        'building': options.address.building || 'NA',
                        'shipping_method': options.address.shipping_method || 'NA',
                        'postal_code': options.address.postal_code || 'NA',
                    }
                },
            });
            if (response.error) {
                console.warn('error in generating payment keys error', response.error);
                throw response.error;
            }
            paymentToken = response.data.token;
            return true;
        } catch (e) {
            console.warn('error in generating payment keys error', e)
            throw e;
        }
    }

    // createURL will generate iframe url to open it in webview to make payment.
    async createURL() {
        return `${baseUrl}/acceptance/iframes/${config.iFrameId}?payment_token=${paymentToken}`;
    }

    // create reference for cash payment
    async createReference() {
        try {
            const response = await axios({
                method: 'post',
                url: `${baseUrl}/acceptance/payments/pay`,
                headers: { 'content-type': 'application/json' },
                params: {
                    payment_token: paymentToken,
                },
                data: {
                    source: sourceData[options.type],
                    payment_token: paymentToken
                }
            });
            if (options.type === 'wallet') {
                return response.data ? response.data.redirect_url : '';
            } else if (options.type === 'kiosk') {
                return response.data ? response.data.data.bill_reference : '';
            }
            return response.data ? response.data.id : null;
        } catch (e) {
            console.warn('createReference error', e)
            throw e;
        }
    }

    // get generated recerence number for cash transaction / redirect url for wallet transection
    async getReference(props) {
        try {
            this.setOptions(props);
            await this.getToken();
            console.log('getToken done...')
            await this.getOrder();
            console.log('getOrder done...')
            await this.generatePaymentToken();
            console.log('generatePaymentToken done...')
            if (options.type === 'card') {
                return await this.createURL();
            }
            return await this.createReference();
        } catch (e) {
            throw e;
        }
    };

}

const acceptService = new AcceptService();
export default acceptService;