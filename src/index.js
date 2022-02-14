import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import bg_blur from './resources/img/bg_blur.png'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from '@web3-ui/components';
import { extendTheme } from "@chakra-ui/react"

const customTheme = extendTheme({
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
  },
  styles: {
    global: (props) => ({
      body: {
        backgroundImage: bg_blur,
        backgroundPosition: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }
    })
  },
})


ReactDOM.render(
  <React.StrictMode>
    <Provider theme={customTheme}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('stakeborg-badges')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
