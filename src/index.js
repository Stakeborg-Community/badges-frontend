import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import bg_blur from './resources/img/bg_blur.png'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const customTheme = extendTheme({
  fonts: {
    heading: 'HeadingFont',
    body: 'BodyFont'
  },
  components: {
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: 'rgba(200, 200, 200, 0.8)',
          //shadow: 'none'
        }
      }),
      variants: {
        
      }
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
    <ChakraProvider theme={customTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('stakeborg-badges')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
