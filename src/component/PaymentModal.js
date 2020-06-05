import {
    Modal, StyleSheet, Text, View,
    TouchableOpacity, ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { WebView } from "react-native-webview";

let responseUrl = '';
let timer = '';

export default function PaymentModal(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [canClose, setCanClose] = useState(false);
    const [status, setStatus] = useState(false);

    useEffect(() => {
        if (!props.iframeUrl) {
            setIsLoading(true)
        }
    }, [props.iframeUrl]);

    useEffect(() => {
        if (status && (status === 'success' || status === 'error')) {
            timer = setTimeout(() => {
                closeAlert(timer);
            }, 10000);
        }
        return () => {
        };
    }, [status]);

    const styles = StyleSheet.create({
        iframeStyle: {
            flex: 1,
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,
            overflow: 'scroll'
        },
        closeButton: {
            right: 8,
            top: 8,
            width: 45,
            height: 45,
            position: 'absolute',
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22.5,
            zIndex: 20,
            backgroundColor: "#00000077"
        },
        closeText: {
            lineHeight: 25,
            fontSize: 25,
            paddingTop: 2,
            textAlign: "center",
            color: "#FFF",
            includeFontPadding: false
        },
        container: {
            paddingTop: 60,
            height: Dimensions.get('window').height - 120,
            width: Dimensions.get('window').width,
            overflow: 'scroll',
        },
        loaderStyle: {
            zIndex: 20,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }
    });

    function getAsUriParameters() {
        let regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match
        while ((match = regex.exec(responseUrl))) {
            params[match[1]] = match[2]
        }
        return params;
    }

    function closeAlert(returnedTimer) {
        clearTimeout(returnedTimer || timer);
        if (!canClose) {
            Alert.alert(
                `Cancel Transaction`,
                `Are you sure you want to cancel the transaction?`,
                [
                    {
                        text: 'Ok',
                        onPress: () => {
                            props.onRequestClose({ status });
                        }
                    }, {
                        text: 'Close',
                        style: 'cancel',
                    },
                ],
            );
        } else {
            const params = getAsUriParameters();
            props.onRequestClose({ status, params });
        }
    }

    function handleOnNavigationStateChange(res) {
        setCanClose(res.canGoBack);
        let status = 'pending';
        if (res.url) {
            if (res.url.includes('success=true')) {
                status = 'success';
            } else if (res.url.includes('success=false')) {
                status = 'error';
            }
            responseUrl = res.url;
        }
        setStatus(status);
    }

    return (
        <Modal visible={props.isVisible} onRequestClose={() => {
            closeAlert()
        }}>
            <SafeAreaView>
                <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => closeAlert()}>
                        <Text style={styles.closeText}>x</Text>
                    </TouchableOpacity>
                    <ScrollView keyboardShouldPersistTaps={"handled"} scrollEnabled={false} contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={styles.container}>
                            {props.iframeUrl ? <WebView
                                overScrollMode={'always'}
                                style={styles.iframeStyle}
                                automaticallyAdjustContentInsets={false}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                // bounces={false}
                                source={{ uri: props.iframeUrl }}
                                onLoadStart={() => { setIsLoading(true) }}
                                onLoadEnd={() => { setIsLoading(false) }}
                                onNavigationStateChange={(res) => {
                                    handleOnNavigationStateChange(res)
                                }}
                            /> : <View />}
                            {isLoading && <ActivityIndicator style={styles.loaderStyle} size={35} />}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}