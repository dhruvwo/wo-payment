declare class AcceptService {
    setConfig(configOptions: any): void;
    setOptions(props: any): void;
    getToken(): Promise<boolean>;
    getOrder(): Promise<boolean>;
    generatePaymentToken(): Promise<boolean>;
    createURL(): Promise<string>;
    createReference(): Promise<any>;
    getReference(props: any): Promise<any>;
}
declare const acceptService: AcceptService;
export default acceptService;

export default function AcceptPaymentButton(props: any): {
    [x: number]: any;
};
export default function PaymentModal(props: any): {
    props: any;
    "": any;
};
