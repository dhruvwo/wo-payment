# wo-accept
<!-- 
A package library to implement [AcceptPayment](https://accept.paymobsolutions.com/docs/) in React Native applications  -->


## NOTE 
You will need the following dependency installed in your React Native project before starting the implementation.

1. [`react-native-webview`](https://github.com/react-native-community/react-native-webview/blob/HEAD/docs/Getting-Started.md) 
2. [`axios`](https://www.npmjs.com/package/axios)

- Please follow the steps given in the document according to your platform(android/ios)

## Installation

```bash 
npm install wo-accept --save
```

## Usage

Follow the steps given below :

- Import to your js file

```python
import { acceptService, PaymentModal, AcceptPaymentButton } from 'wo-accept';
```
- Set the following configuration of your accept payment on top of your `App.js`


```python
acceptService.setConfig({
  apiKey: 'API_KEY', # get your API key from your profile in AccepttPayment account (String) 
  iFrameId: IFRAME_ID, # get your iFrameId from Iframe segment in your AccepttPayment account (Number) 
  status: 'test', # Set your environment ('test'/'live') (String)
  integration: {
    # get ids by creating ['Payment Integrations'](https://portal.weaccept.co/portal/integrations)
    test: {
      card: '12345',
      kiosk: '12345',
      wallet: '12345',
      cash: '12345'
    },
    live: {
      card: '12345',
      kiosk: '12345',
      wallet: '12345',
      cash: '12345'
    }
  }
});
```
- Make payment options
```
const paymentOptions = {

    uniqueId: 'UNIQ_ID', 
    firstName: 'FIRST_NAME',
    lastName: 'LAST_NAME',
    email: 'EMAIL',
    country: 'COUNTRY' # (i.e. 'EG' for egypt),
    price: 'AMOUNT',
    currency: 'CURRENCY_CODE' # (i.e. 'EGP' for egyptian pound),
    marchantId: 'MARCHANT_ID'
    city: 'CITY_NAME', # (i.e. cairo)
    state: 'STATE_NAME', # (i.e. cairo)
    phoneNumber: 'PHONE_NUMBER', # (i.e. +86(8)9135210487)
    price: 1000,
    currency: 'CURRENCY',# ('EGP' Or 'USD')
};

```

- Put a Button to start a payment
```
{/* default plugin button only for card payment */}
<AcceptPaymentButton
    paymentOptions={paymentOptions}
    onClose={(res) => {
        console.log('AcceptPaymentButton onClose in app component', res);
    }}
    onError={(e) => {
        console.log('AcceptPaymentButton e', e)
    }} />
{/* plugin button with options & innerComponent only */}
<AcceptPaymentButton
    buttonContainerStyle={styles.button}
    innerComponent={
        <Text style={[styles.buttonText]}>
            Plugin Button With innerComponent (card)
        </Text>
    }
    paymentOptions={paymentOptions}
    onClose={(res) => {
        console.log('AcceptPaymentButton onClose in app component', res);
    }}
    onError={(e) => {
        console.log('AcceptPaymentButton e', e)
    }} />
{/* just a simple button with 'PaymentModal' */}
<TouchableOpacity
    style={[styles.button, styles.buttonContainerStyle || {}]}
    onPress={() => {
        payClicked()
    }}>
    <Text style={[styles.buttonText, styles.buttonTextStyle || {}]}>
        User Button (card)
    </Text>
</TouchableOpacity>
<PaymentModal
    isVisible={isVisibale}
    iframeUrl={iframeUrl}
    onClose={(res) => {
        setIsVisibale(false);
        console.log('onClose res ---->>>', res);
    }}
    onError={(e) => {
        setIsVisibale(false);
        console.log('AcceptPaymentButton e', e)
    }}
/>
{/* wallet transaction */}
<TouchableOpacity
    style={[styles.button, styles.buttonContainerStyle || {}]}
    onPress={() => {
        payClicked('wallet')
    }}>
    <Text style={[styles.buttonText, styles.buttonTextStyle || {}]}>
        User Button (wallet)
    </Text>
</TouchableOpacity>
{/* cash transaction */}
<TouchableOpacity
    style={[styles.button, styles.buttonContainerStyle || {}]}
    onPress={() => {
        payClicked('cash')
    }}>
    <Text style={[styles.buttonText, styles.buttonTextStyle || {}]}>
        User Button (cash)
    </Text>
</TouchableOpacity>
{/* kiosk transaction */}
<TouchableOpacity
    style={[styles.button, styles.buttonContainerStyle || {}]}
    onPress={() => {
        payClicked('kiosk')
    }}>
    <Text style={[styles.buttonText, styles.buttonTextStyle || {}]}>
        User Button (kiosk)
    </Text>
</TouchableOpacity>
```
 - 'payClick' function:-
```
async function payClicked(type = 'card') {
    paymentOptions.uniqueId = 'UNIQUE_ID'; #Unique Id for you order
    paymentOptions.type = type;
    let reference = '';
    reference = await acceptService.getReference(paymentOptions);
    console.log('payClicked reference ---->>>', reference);
    if (reference && ['card', 'wallet'].includes(type)) {
        setIsVisibale(true);
        setIframeUrl(reference);
    }
}

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update the tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
