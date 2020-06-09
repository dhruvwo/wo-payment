import { PaymentOptions, Configs } from "./types";

declare class AcceptService {
    setConfig(configOptions: Configs): void;
    setOptions(props: PaymentOptions): void;
    getToken(): Promise<boolean>;
    getOrder(): Promise<boolean>;
    generatePaymentToken(): Promise<boolean>;
    createURL(): Promise<string>;
    createReference(): Promise<any>;
    getReference(props: PaymentOptions): Promise<any>;
}
declare const acceptService: AcceptService;
export default acceptService;