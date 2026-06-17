(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/js/client.jsx
  var import_react2 = __toESM(__require("react"), 1);
  var import_client = __require("react-dom/client");

  // src/includes/components/Button.jsx
  var import_react = __toESM(__require("react"), 1);
  function Button({
    variant = "primary",
    size = "md",
    children,
    disabled = false,
    style = {},
    className = "",
    ...props
  }) {
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontWeight: "500",
      borderRadius: "4px",
      border: "1px solid transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
      outline: "none",
      opacity: disabled ? 0.6 : 1,
      textDecoration: "none"
    };
    const sizeStyles = {
      sm: {
        padding: "4px 8px",
        fontSize: "12px"
      },
      md: {
        padding: "8px 16px",
        fontSize: "14px"
      },
      lg: {
        padding: "12px 24px",
        fontSize: "16px"
      }
    };
    const variantStyles = {
      primary: {
        backgroundColor: "#0066cc",
        color: "#ffffff"
      },
      secondary: {
        backgroundColor: "#6c757d",
        color: "#ffffff"
      },
      outline: {
        backgroundColor: "transparent",
        borderColor: "#6c757d",
        color: "#6c757d"
      }
    };
    const combinedStyles = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style
    };
    return /* @__PURE__ */ import_react.default.createElement(
      "button",
      {
        style: combinedStyles,
        disabled,
        className: `btn-${variant} btn-${size} ${className}`.trim(),
        onClick: () => console.log("button clicked!"),
        ...props
      },
      children
    );
  }

  // src/js/client.jsx
  var initialData = window.__INITIAL_DATA__ || { pageUrl: "/" };
  (0, import_client.hydrateRoot)(
    document.getElementById("root"),
    import_react2.default.createElement(Button, null, `Click me! (Page: ${initialData.pageUrl})`)
  );
})();
