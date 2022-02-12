import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from '@web3-ui/components';
import { extendTheme } from "@chakra-ui/react"
import { None } from 'framer-motion';

const theme = extendTheme({
  fonts: {
    heading: 'HeadingFont',
    body: 'BodyFont'
  },
  components: {
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: 'rgba(0, 0, 0, 0.0)',
          shadow: 'none'
        }
      })
    }
  }
})


ReactDOM.render(
  <React.StrictMode>
    <Provider theme={theme}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('stakeborg-badges')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
