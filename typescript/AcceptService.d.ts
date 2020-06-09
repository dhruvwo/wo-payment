import { PaymentOptions, Configs } from "./types";

declare class AcceptService {
    /**
    * setting config in app init
    * 
    * ```
    * acceptService.setConfig({ 
    *   apiKey: 'API_KEY', # get your API key from your profile in AccepttPayment account (String)  
    *   iFrameId: IFRAME_ID, # get your iFrameId from Iframe segment in your AccepttPayment account (Number)  
    *   status: 'test', # Set your environment ('test'/'live') (String) 
    *   integration: { 
    *       test: { 
    *       card: '12345', 
    *       kiosk: '12345', 
    *       wallet: '12345', 
    *       cash: '12345'
    *       }, 
    *       live: { 
    *       card: '12345', 
    *       kiosk: '12345', 
    *       wallet: '12345', 
    *       cash: '12345'
    *       }
    *   }
    * });
    * ```
    **/
    setConfig(configOptions: Configs): void;

    /** Set options for order request */
    setOptions(props: PaymentOptions): void;

    /** Post request to Accept's authentication API to obtain authentication token */
    getToken(): Promise<boolean>;

    /** register an order on Accept if not exist the returned order id will use to perform transection */
    getOrder(): Promise<boolean>;

    /**
     * Use generatePaymentToken obtain a payment_key token.
     * This key will be used to authenticate payment request.
     * It will be also used for verifying your transaction request meta data.
    */
    generatePaymentToken(): Promise<boolean>;

    /** CreateURL will generate iFrame url to open it in webview to make payment. */
    createURL(): Promise<string>;

    /** Create reference for payment according to its type */
    createReference(): Promise<any>;

    /** Get generated bill recerence number for transaction / redirect url for iFrame */
    getReference(props: PaymentOptions): Promise<any>;
}
declare const acceptService: AcceptService;
export default acceptService;