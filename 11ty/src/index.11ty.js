import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Button from './includes/components/Button.jsx';



export default function(data) {

  const component = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Button, null, `Click me! (Page: ${data.page.url})`)
  );

return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Built with Eleventy v${data.eleventy.version}</title>
  </head>
  <body>
    <h1>URL: ${data.page.url}</h1>
    <main id="root">${component}</main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.1.0/umd/react.development.min.js" integrity="sha512-qQrkBv6Ro5U0GKhWAbzgRwpWf16Rk5vjZwSjbusO45pfpfEbN1iA/7zpIVmSoRFg+wCVdcwLJCVTlP45jsLslg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.1.0/umd/react-dom.development.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script>
      window.__INITIAL_DATA__ = {
        pageUrl: "${data.page.url}"
      };
      window.require = function(name) {
        if (name === 'react') return window.React;
        if (name === 'react-dom' || name === 'react-dom/client') return window.ReactDOM;
        throw new Error('Module not found: ' + name);
      };
    </script>
    <script src="/js/client.js"></script>
  </body>
</html>
`;
}
