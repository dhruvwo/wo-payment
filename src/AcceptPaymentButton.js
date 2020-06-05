import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';
import acceptService from './AcceptService';
import PaymentModal from './component/PaymentModal';

const AcceptPaymentButton = (props) => {
    const [openIframe, setOpenIframe] = useState(props.openIframe);
    const [iframeUrl, setIframeUrl] = useState('');

    const styles = StyleSheet.create({
        button: {
            backgroundColor: '#010101',
            borderRadius: 25
        },
        buttonText: {
            color: '#fff',
            textAlign: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
        }
    });

    async function payClicked() {
        try {
            setOpenIframe(true);
            const url = await acceptService.getIframeUrl(props.paymentOptions);
            setIframeUrl(url);
        } catch (e) {
            onError(e);
        }
    }

    function onError(e) {
        setOpenIframe(false);
        props.onError(e);
    }

    return (
        <>
            <TouchableOpacity style={[styles.button, props.buttonContainerStyle || {}]}
                disabled={!!props.disabled}
                onPress={() => {
                    payClicked()
                }}>
                <Text style={[styles.buttonText, props.buttonTextStyle || {}]}>{props.buttonText || 'Pay Button'}</Text>
            </TouchableOpacity>
            <PaymentModal
                isVisible={openIframe}
                iframeUrl={iframeUrl}
                onRequestClose={(res) => {
                    setOpenIframe(false);
                    setIframeUrl('');
                    console.log('onRequestClose in button res', res);
                    props.paymentResponse(res);
                }}
                onError={(e) => {
                    onError(e);
                }}
            />
        </>
    );
};

export default AcceptPaymentButton;
