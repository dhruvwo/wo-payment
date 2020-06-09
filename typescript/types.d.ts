export interface PaymentOptions {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    city: string;
    state: string;
    phoneNumber: string;
    price: number;
    currency: string;
    address: {
        street: string;
        building: string;
        apartment: string;
        floor: string;
        postal_code: string;
    }
}

export interface Configs {
    apiKey: string;
    status: 'test' | 'live';
    iFrameId: string | number;
    integration: {
        test: {
            card: string | number;
            kiosk: string | number;
            wallet: string | number;
            cash: string | number;
        };
        live: {
            card: string | number;
            kiosk: string | number;
            wallet: string | number;
            cash: string | number;
        };
    };
}

export declare type AcceptPaymentButtonProps = {
    paymentOptions?: PaymentOptions;
    disabled?: boolean;
    onPress: () => void;
    onError: (e: any) => void;
    onClose: (res: any) => void;
    innerComponent?: React.ComponentType<any>;
    buttonText?: string;
    buttonTextStyle?: StyleProp<ViewStyle>;
    buttonContainerStyle?: StyleProp<ViewStyle>;
};

export declare type PaymentModalProps = {
    isVisible: boolean;
    onError: (e: any) => void;
    onClose: (res: any) => void;
    iframeUrl: string;
};

