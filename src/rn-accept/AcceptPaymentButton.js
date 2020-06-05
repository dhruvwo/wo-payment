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
            paddingVertical: 16,
        }
    });
    async function payClicked() {
        setOpenIframe(true);
        const url = await acceptService.getIframeUrl(props.paymentOptions);
        setIframeUrl(url);
    }

    return (
        <>
            <TouchableOpacity style={styles.button} onPress={() => {
                payClicked()
            }}>
                <Text style={styles.buttonText}>Pay Button</Text>
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
            />
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
});

export default AcceptPaymentButton;
