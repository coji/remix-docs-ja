import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, useParams, useLoaderData, useActionData, useMatches, useNavigation, Meta, Links, ScrollRestoration, Scripts, Outlet, redirect } from "react-router";
import * as React from "react";
import { createElement, useEffect } from "react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");
    const readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var nprogress = { exports: {} };
/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */
(function(module, exports) {
  (function(root2, factory) {
    {
      module.exports = factory();
    }
  })(commonjsGlobal, function() {
    var NProgress2 = {};
    NProgress2.version = "0.2.0";
    var Settings = NProgress2.settings = {
      minimum: 0.08,
      easing: "ease",
      positionUsing: "",
      speed: 200,
      trickle: true,
      trickleRate: 0.02,
      trickleSpeed: 800,
      showSpinner: true,
      barSelector: '[role="bar"]',
      spinnerSelector: '[role="spinner"]',
      parent: "body",
      template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };
    NProgress2.configure = function(options) {
      var key, value;
      for (key in options) {
        value = options[key];
        if (value !== void 0 && options.hasOwnProperty(key)) Settings[key] = value;
      }
      return this;
    };
    NProgress2.status = null;
    NProgress2.set = function(n) {
      var started = NProgress2.isStarted();
      n = clamp(n, Settings.minimum, 1);
      NProgress2.status = n === 1 ? null : n;
      var progress = NProgress2.render(!started), bar = progress.querySelector(Settings.barSelector), speed = Settings.speed, ease = Settings.easing;
      progress.offsetWidth;
      queue(function(next) {
        if (Settings.positionUsing === "") Settings.positionUsing = NProgress2.getPositioningCSS();
        css(bar, barPositionCSS(n, speed, ease));
        if (n === 1) {
          css(progress, {
            transition: "none",
            opacity: 1
          });
          progress.offsetWidth;
          setTimeout(function() {
            css(progress, {
              transition: "all " + speed + "ms linear",
              opacity: 0
            });
            setTimeout(function() {
              NProgress2.remove();
              next();
            }, speed);
          }, speed);
        } else {
          setTimeout(next, speed);
        }
      });
      return this;
    };
    NProgress2.isStarted = function() {
      return typeof NProgress2.status === "number";
    };
    NProgress2.start = function() {
      if (!NProgress2.status) NProgress2.set(0);
      var work = function() {
        setTimeout(function() {
          if (!NProgress2.status) return;
          NProgress2.trickle();
          work();
        }, Settings.trickleSpeed);
      };
      if (Settings.trickle) work();
      return this;
    };
    NProgress2.done = function(force) {
      if (!force && !NProgress2.status) return this;
      return NProgress2.inc(0.3 + 0.5 * Math.random()).set(1);
    };
    NProgress2.inc = function(amount) {
      var n = NProgress2.status;
      if (!n) {
        return NProgress2.start();
      } else {
        if (typeof amount !== "number") {
          amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
        }
        n = clamp(n + amount, 0, 0.994);
        return NProgress2.set(n);
      }
    };
    NProgress2.trickle = function() {
      return NProgress2.inc(Math.random() * Settings.trickleRate);
    };
    (function() {
      var initial = 0, current = 0;
      NProgress2.promise = function($promise) {
        if (!$promise || $promise.state() === "resolved") {
          return this;
        }
        if (current === 0) {
          NProgress2.start();
        }
        initial++;
        current++;
        $promise.always(function() {
          current--;
          if (current === 0) {
            initial = 0;
            NProgress2.done();
          } else {
            NProgress2.set((initial - current) / initial);
          }
        });
        return this;
      };
    })();
    NProgress2.render = function(fromStart) {
      if (NProgress2.isRendered()) return document.getElementById("nprogress");
      addClass(document.documentElement, "nprogress-busy");
      var progress = document.createElement("div");
      progress.id = "nprogress";
      progress.innerHTML = Settings.template;
      var bar = progress.querySelector(Settings.barSelector), perc = fromStart ? "-100" : toBarPerc(NProgress2.status || 0), parent = document.querySelector(Settings.parent), spinner;
      css(bar, {
        transition: "all 0 linear",
        transform: "translate3d(" + perc + "%,0,0)"
      });
      if (!Settings.showSpinner) {
        spinner = progress.querySelector(Settings.spinnerSelector);
        spinner && removeElement(spinner);
      }
      if (parent != document.body) {
        addClass(parent, "nprogress-custom-parent");
      }
      parent.appendChild(progress);
      return progress;
    };
    NProgress2.remove = function() {
      removeClass(document.documentElement, "nprogress-busy");
      removeClass(document.querySelector(Settings.parent), "nprogress-custom-parent");
      var progress = document.getElementById("nprogress");
      progress && removeElement(progress);
    };
    NProgress2.isRendered = function() {
      return !!document.getElementById("nprogress");
    };
    NProgress2.getPositioningCSS = function() {
      var bodyStyle = document.body.style;
      var vendorPrefix = "WebkitTransform" in bodyStyle ? "Webkit" : "MozTransform" in bodyStyle ? "Moz" : "msTransform" in bodyStyle ? "ms" : "OTransform" in bodyStyle ? "O" : "";
      if (vendorPrefix + "Perspective" in bodyStyle) {
        return "translate3d";
      } else if (vendorPrefix + "Transform" in bodyStyle) {
        return "translate";
      } else {
        return "margin";
      }
    };
    function clamp(n, min, max) {
      if (n < min) return min;
      if (n > max) return max;
      return n;
    }
    function toBarPerc(n) {
      return (-1 + n) * 100;
    }
    function barPositionCSS(n, speed, ease) {
      var barCSS;
      if (Settings.positionUsing === "translate3d") {
        barCSS = { transform: "translate3d(" + toBarPerc(n) + "%,0,0)" };
      } else if (Settings.positionUsing === "translate") {
        barCSS = { transform: "translate(" + toBarPerc(n) + "%,0)" };
      } else {
        barCSS = { "margin-left": toBarPerc(n) + "%" };
      }
      barCSS.transition = "all " + speed + "ms " + ease;
      return barCSS;
    }
    var queue = /* @__PURE__ */ function() {
      var pending = [];
      function next() {
        var fn = pending.shift();
        if (fn) {
          fn(next);
        }
      }
      return function(fn) {
        pending.push(fn);
        if (pending.length == 1) next();
      };
    }();
    var css = /* @__PURE__ */ function() {
      var cssPrefixes = ["Webkit", "O", "Moz", "ms"], cssProps = {};
      function camelCase(string) {
        return string.replace(/^-ms-/, "ms-").replace(/-([\da-z])/gi, function(match, letter) {
          return letter.toUpperCase();
        });
      }
      function getVendorProp(name) {
        var style = document.body.style;
        if (name in style) return name;
        var i = cssPrefixes.length, capName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
        while (i--) {
          vendorName = cssPrefixes[i] + capName;
          if (vendorName in style) return vendorName;
        }
        return name;
      }
      function getStyleProp(name) {
        name = camelCase(name);
        return cssProps[name] || (cssProps[name] = getVendorProp(name));
      }
      function applyCss(element, prop, value) {
        prop = getStyleProp(prop);
        element.style[prop] = value;
      }
      return function(element, properties) {
        var args = arguments, prop, value;
        if (args.length == 2) {
          for (prop in properties) {
            value = properties[prop];
            if (value !== void 0 && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
          }
        } else {
          applyCss(element, args[1], args[2]);
        }
      };
    }();
    function hasClass(element, name) {
      var list = typeof element == "string" ? element : classList(element);
      return list.indexOf(" " + name + " ") >= 0;
    }
    function addClass(element, name) {
      var oldList = classList(element), newList = oldList + name;
      if (hasClass(oldList, name)) return;
      element.className = newList.substring(1);
    }
    function removeClass(element, name) {
      var oldList = classList(element), newList;
      if (!hasClass(element, name)) return;
      newList = oldList.replace(" " + name + " ", " ");
      element.className = newList.substring(1, newList.length - 1);
    }
    function classList(element) {
      return (" " + (element.className || "") + " ").replace(/\s+/gi, " ");
    }
    function removeElement(element) {
      element && element.parentNode && element.parentNode.removeChild(element);
    }
    return NProgress2;
  });
})(nprogress);
var nprogressExports = nprogress.exports;
const NProgress = /* @__PURE__ */ getDefaultExportFromCjs(nprogressExports);
const PageLoadingProgress = () => {
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === "loading") {
      NProgress.start();
    }
    if (navigation.state === "idle") {
      NProgress.done();
    }
  }, [navigation.state]);
  return null;
};
var P = ["light", "dark"], E = "(prefers-color-scheme: dark)", Q = typeof window == "undefined", L = React.createContext(void 0), z = (e) => React.useContext(L) ? e.children : React.createElement(O, { ...e }), N = ["light", "dark"], O = ({ forcedTheme: e, disableTransitionOnChange: a = false, enableSystem: n = true, enableColorScheme: g = true, storageKey: m = "theme", themes: c = N, defaultTheme: o = n ? "system" : "light", attribute: y = "data-theme", value: h, children: k, nonce: w }) => {
  let [i, d] = React.useState(() => M(m, o)), [S, l] = React.useState(() => M(m)), u = h ? Object.values(h) : c, R = React.useCallback((s) => {
    let r = s;
    if (!r) return;
    s === "system" && n && (r = T());
    let v = h ? h[r] : r, C = a ? _() : null, x = document.documentElement;
    if (y === "class" ? (x.classList.remove(...u), v && x.classList.add(v)) : v ? x.setAttribute(y, v) : x.removeAttribute(y), g) {
      let I = P.includes(o) ? o : null, A = P.includes(r) ? r : I;
      x.style.colorScheme = A;
    }
    C == null || C();
  }, []), f = React.useCallback((s) => {
    let r = typeof s == "function" ? s(s) : s;
    d(r);
    try {
      localStorage.setItem(m, r);
    } catch (v) {
    }
  }, [e]), p = React.useCallback((s) => {
    let r = T(s);
    l(r), i === "system" && n && !e && R("system");
  }, [i, e]);
  React.useEffect(() => {
    let s = window.matchMedia(E);
    return s.addListener(p), p(s), () => s.removeListener(p);
  }, [p]), React.useEffect(() => {
    let s = (r) => {
      if (r.key !== m) return;
      let v = r.newValue || o;
      f(v);
    };
    return window.addEventListener("storage", s), () => window.removeEventListener("storage", s);
  }, [f]), React.useEffect(() => {
    R(e != null ? e : i);
  }, [e, i]);
  let $ = React.useMemo(() => ({ theme: i, setTheme: f, forcedTheme: e, resolvedTheme: i === "system" ? S : i, themes: n ? [...c, "system"] : c, systemTheme: n ? S : void 0 }), [i, f, e, S, n, c]);
  return React.createElement(L.Provider, { value: $ }, React.createElement(U, { forcedTheme: e, disableTransitionOnChange: a, enableSystem: n, enableColorScheme: g, storageKey: m, themes: c, defaultTheme: o, attribute: y, value: h, children: k, attrs: u, nonce: w }), k);
}, U = React.memo(({ forcedTheme: e, storageKey: a, attribute: n, enableSystem: g, enableColorScheme: m, defaultTheme: c, value: o, attrs: y, nonce: h }) => {
  let k = c === "system", w = n === "class" ? `var d=document.documentElement,c=d.classList;${`c.remove(${y.map((u) => `'${u}'`).join(",")})`};` : `var d=document.documentElement,n='${n}',s='setAttribute';`, i = m ? (P.includes(c) ? c : null) ? `if(e==='light'||e==='dark'||!e)d.style.colorScheme=e||'${c}'` : "if(e==='light'||e==='dark')d.style.colorScheme=e" : "", d = (l, u = false, R = true) => {
    let f = o ? o[l] : l, p = u ? l + "|| ''" : `'${f}'`, $ = "";
    return m && R && !u && P.includes(l) && ($ += `d.style.colorScheme = '${l}';`), n === "class" ? u || f ? $ += `c.add(${p})` : $ += "null" : f && ($ += `d[s](n,${p})`), $;
  }, S = e ? `!function(){${w}${d(e)}}()` : g ? `!function(){try{${w}var e=localStorage.getItem('${a}');if('system'===e||(!e&&${k})){var t='${E}',m=window.matchMedia(t);if(m.media!==t||m.matches){${d("dark")}}else{${d("light")}}}else if(e){${o ? `var x=${JSON.stringify(o)};` : ""}${d(o ? "x[e]" : "e", true)}}${k ? "" : "else{" + d(c, false, false) + "}"}${i}}catch(e){}}()` : `!function(){try{${w}var e=localStorage.getItem('${a}');if(e){${o ? `var x=${JSON.stringify(o)};` : ""}${d(o ? "x[e]" : "e", true)}}else{${d(c, false, false)};}${i}}catch(t){}}();`;
  return React.createElement("script", { nonce: h, dangerouslySetInnerHTML: { __html: S } });
}), M = (e, a) => {
  if (Q) return;
  let n;
  try {
    n = localStorage.getItem(e) || void 0;
  } catch (g) {
  }
  return n || a;
}, _ = () => {
  let e = document.createElement("style");
  return e.appendChild(document.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")), document.head.appendChild(e), () => {
    window.getComputedStyle(document.body), setTimeout(() => {
      document.head.removeChild(e);
    }, 1);
  };
}, T = (e) => (e || (e = window.matchMedia(E)), e.matches ? "dark" : "light");
function ThemeProvider({ children, ...props }) {
  return /* @__PURE__ */ jsx(z, { ...props, children });
}
const products = [
  {
    id: "remix-docs-ja",
    name: "Remix",
    title: "Remixドキュメント日本語版",
    url: "https://remix-docs-ja.techtalk.jp",
    pagefind: "/pagefind/remix-docs-ja/pagefind.js?url"
  },
  {
    id: "react-router-docs-ja",
    name: "React Router",
    title: "React Router v7 ドキュメント日本語版",
    url: "https://react-router-docs-ja.techtalk.jp",
    pagefind: "/pagefind/react-router-docs-ja/pagefind.js?url"
  }
];
const getProduct = (request) => {
  const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const subdomain = host == null ? void 0 : host.split(".")[0];
  const product = products.find((prd) => prd.id === subdomain) ?? products[0];
  return { product };
};
const buildPageMeta = ({
  title,
  pathname,
  productId
}) => {
  const product = products.find((product2) => product2.id === productId) ?? products[0];
  const ogpImage = `${pathname === "/" ? "/index" : pathname}.png`;
  return [
    {
      title: title ? `${title} - ${product.title}` : product.title
    },
    {
      property: "og:url",
      content: `${product.url}${pathname}`
    },
    {
      property: "og:title",
      content: title ? `${title} - ${product.title}` : product.title
    },
    {
      property: "og:image",
      content: pathname ? `${product.url}/ogp/${product.id}${ogpImage}` : "https://remix.run/img/og.1.jpg"
    },
    {
      property: "twitter:card",
      content: "summary_large_image"
    },
    {
      property: "twitter:title",
      content: title ? `${title} - ${product.title}` : product.title
    },
    {
      property: "twitter:image",
      content: pathname ? `${product.url}/ogp/${product.id}${ogpImage}` : "https://remix.run/img/og.1.jpg"
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      peroperty: "og:site_name",
      content: product.title
    },
    {
      property: "docsearch:language",
      content: "ja"
    },
    {
      property: "docsearch:version",
      content: "main"
    },
    {
      name: "robots",
      content: "index,follow"
    },
    {
      name: "googlebot",
      content: "index,follow"
    }
  ];
};
const globalStyles = "/assets/globals-Bj5yjqx1.css";
const meta = ({
  data
}) => {
  return buildPageMeta({
    title: data == null ? void 0 : data.product.title,
    pathname: "/",
    productId: data == null ? void 0 : data.product.id
  });
};
const loader$2 = ({
  request
}) => {
  const {
    product
  } = getProduct(request);
  return {
    product
  };
};
const links = () => [{
  rel: "stylesheet",
  href: globalStyles
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "ja",
    suppressHydrationWarning: true,
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(PageLoadingProgress, {}), /* @__PURE__ */ jsx(ThemeProvider, {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root,
  links,
  loader: loader$2,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = ({ request }) => {
  const url = new URL(request.url);
  return redirect(`https://remix.run/resources?${url.searchParams.toString()}`);
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const clientLoader = async ({ request }) => {
  const { product } = getProduct(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  if (!query) return { results: [] };
  const pagefind = await import(
    /* @vite-ignore */
    product.pagefind
  );
  await pagefind.init();
  const ret = await pagefind.search(query);
  const results = await Promise.all(ret.results.map((result) => result.data()));
  return { results };
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientLoader
}, Symbol.toStringTag, { value: "Module" }));
const loader = ({ request }) => {
  return new Response("OK");
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BXcj7BLF.js", "imports": ["/assets/jsx-runtime-BVBiHVO-.js", "/assets/chunk-X537FOHI-CxkrkuNS.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BYFUfh3L.js", "imports": ["/assets/jsx-runtime-BVBiHVO-.js", "/assets/chunk-X537FOHI-CxkrkuNS.js", "/assets/products-Csxsg9DU.js"], "css": ["/assets/root-CSXic_Zd.css"] }, "routes/resources._index": { "id": "routes/resources._index", "parentId": "root", "path": "resources", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/resources._index-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/resources.serach": { "id": "routes/resources.serach", "parentId": "root", "path": "resources/serach", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": true, "hasErrorBoundary": false, "module": "/assets/resources.serach-lgMQClSC.js", "imports": ["/assets/jsx-runtime-BVBiHVO-.js", "/assets/products-Csxsg9DU.js"], "css": [] }, "routes/healthcheck": { "id": "routes/healthcheck", "parentId": "root", "path": "healthcheck", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/healthcheck-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_root": { "id": "routes/_root", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_root-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_root._index": { "id": "routes/_root._index", "parentId": "routes/_root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_root._index-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_root.$": { "id": "routes/_root.$", "parentId": "routes/_root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_root._-l0sNRNKZ.js", "imports": [], "css": [] } }, "url": "/assets/manifest-2b1051d3.js", "version": "2b1051d3" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/resources._index": {
    id: "routes/resources._index",
    parentId: "root",
    path: "resources",
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/resources.serach": {
    id: "routes/resources.serach",
    parentId: "root",
    path: "resources/serach",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/healthcheck": {
    id: "routes/healthcheck",
    parentId: "root",
    path: "healthcheck",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_root": {
    id: "routes/_root",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_root._index": {
    id: "routes/_root._index",
    parentId: "routes/_root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_root.$": {
    id: "routes/_root.$",
    parentId: "routes/_root",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  publicPath,
  routes
};
