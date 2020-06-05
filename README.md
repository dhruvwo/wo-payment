# react-native-accept

A package to implement [AcceptPayment](https://accept.paymobsolutions.com/docs/) in React Native applications 


## NOTE 
You will need the following dependency installed in your React Native project before starting the implementation.

1. [`react-native-webview`](https://github.com/react-native-community/react-native-webview/blob/HEAD/docs/Getting-Started.md) 
2. [`axios`](https://www.npmjs.com/package/axios)

- Please follow the steps given in the document according to your platform(android/ios)

## Installation

```bash 
npm install react-native-accept --save
```

## Usage

Follow the steps given below :

1. Import `acceptService`and `AcceptPaymentButton` to your `App.js`

```python
import { acceptService, AcceptPaymentButton } from 'react-native-accept';
```
2. Set the following configuration of your accept payment on top of your `App.js`


```python
acceptService.setConfig({
  apiKey: 'API_KEY', # get your API key from your profile in AccepttPayment account (String) 
  iFrameId: IFRAME_ID, # get your iFrameId from Iframe segment in your AccepttPayment account (Number) 
  status: 'test', # Set your environment ('test'/'live') (String)
  integration: {
    test: {
      card: '14280',
      kiosk: '14280',
      wallet: '14280'
    },
    live: {
      card: '17525',
      kiosk: '17523',
      wallet: '17523'
    }
  }
});
```

3. Put a Button to start a payment
```
<AcceptPaymentButton
  paymentOptions={{
    uniqueId: 'UNIQ_ID', 
    firstName: 'FIRST_NAME',
    lastName: 'LAST_NAME',
    email: 'EMAIL',
    country: 'COUNTRY(EX: 'IN' for india)',
    code: 'CONTRY_CODE',
    mobile: 'MOBILE_NUMBER',
    price: 'AMOUNT',
    currency: 'CURRENCY_CODE(EX: 'INR' for indian rupee)',
    marchantId: 'MARCHANT_ID'
  }}
  paymentResponse={(res) => {
    console.log('paymentResponse', res);
    # Action on success
  }}
  onError={(e) => {
    console.log('AcceptPaymentButton e', e)
    # Action on failure
  }} 
/>
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update the tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
