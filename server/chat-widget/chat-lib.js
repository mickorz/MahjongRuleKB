var Fc = { exports: {} }, sr = {};
var sp;
function Jy() {
  if (sp) return sr;
  sp = 1;
  var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), a = /* @__PURE__ */ Symbol.for("react.fragment");
  function i(u, o, f) {
    var m = null;
    if (f !== void 0 && (m = "" + f), o.key !== void 0 && (m = "" + o.key), "key" in o) {
      f = {};
      for (var p in o)
        p !== "key" && (f[p] = o[p]);
    } else f = o;
    return o = f.ref, {
      $$typeof: t,
      type: u,
      key: m,
      ref: o !== void 0 ? o : null,
      props: f
    };
  }
  return sr.Fragment = a, sr.jsx = i, sr.jsxs = i, sr;
}
var op;
function Wy() {
  return op || (op = 1, Fc.exports = Jy()), Fc.exports;
}
var h = Wy(), $c = { exports: {} }, ae = {};
var cp;
function e3() {
  if (cp) return ae;
  cp = 1;
  var t = /* @__PURE__ */ Symbol.for("react.transitional.element"), a = /* @__PURE__ */ Symbol.for("react.portal"), i = /* @__PURE__ */ Symbol.for("react.fragment"), u = /* @__PURE__ */ Symbol.for("react.strict_mode"), o = /* @__PURE__ */ Symbol.for("react.profiler"), f = /* @__PURE__ */ Symbol.for("react.consumer"), m = /* @__PURE__ */ Symbol.for("react.context"), p = /* @__PURE__ */ Symbol.for("react.forward_ref"), y = /* @__PURE__ */ Symbol.for("react.suspense"), g = /* @__PURE__ */ Symbol.for("react.memo"), b = /* @__PURE__ */ Symbol.for("react.lazy"), C = /* @__PURE__ */ Symbol.for("react.activity"), O = Symbol.iterator;
  function U(x) {
    return x === null || typeof x != "object" ? null : (x = O && x[O] || x["@@iterator"], typeof x == "function" ? x : null);
  }
  var q = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, $ = Object.assign, ne = {};
  function P(x, z, F) {
    this.props = x, this.context = z, this.refs = ne, this.updater = F || q;
  }
  P.prototype.isReactComponent = {}, P.prototype.setState = function(x, z) {
    if (typeof x != "object" && typeof x != "function" && x != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, x, z, "setState");
  }, P.prototype.forceUpdate = function(x) {
    this.updater.enqueueForceUpdate(this, x, "forceUpdate");
  };
  function ie() {
  }
  ie.prototype = P.prototype;
  function oe(x, z, F) {
    this.props = x, this.context = z, this.refs = ne, this.updater = F || q;
  }
  var H = oe.prototype = new ie();
  H.constructor = oe, $(H, P.prototype), H.isPureReactComponent = !0;
  var le = Array.isArray;
  function Le() {
  }
  var J = { H: null, A: null, T: null, S: null }, Ge = Object.prototype.hasOwnProperty;
  function Je(x, z, F) {
    var B = F.ref;
    return {
      $$typeof: t,
      type: x,
      key: z,
      ref: B !== void 0 ? B : null,
      props: F
    };
  }
  function He(x, z) {
    return Je(x.type, z, x.props);
  }
  function ft(x) {
    return typeof x == "object" && x !== null && x.$$typeof === t;
  }
  function pt(x) {
    var z = { "=": "=0", ":": "=2" };
    return "$" + x.replace(/[=:]/g, function(F) {
      return z[F];
    });
  }
  var ze = /\/+/g;
  function Qe(x, z) {
    return typeof x == "object" && x !== null && x.key != null ? pt("" + x.key) : z.toString(36);
  }
  function Ct(x) {
    switch (x.status) {
      case "fulfilled":
        return x.value;
      case "rejected":
        throw x.reason;
      default:
        switch (typeof x.status == "string" ? x.then(Le, Le) : (x.status = "pending", x.then(
          function(z) {
            x.status === "pending" && (x.status = "fulfilled", x.value = z);
          },
          function(z) {
            x.status === "pending" && (x.status = "rejected", x.reason = z);
          }
        )), x.status) {
          case "fulfilled":
            return x.value;
          case "rejected":
            throw x.reason;
        }
    }
    throw x;
  }
  function w(x, z, F, B, Z) {
    var se = typeof x;
    (se === "undefined" || se === "boolean") && (x = null);
    var Oe = !1;
    if (x === null) Oe = !0;
    else
      switch (se) {
        case "bigint":
        case "string":
        case "number":
          Oe = !0;
          break;
        case "object":
          switch (x.$$typeof) {
            case t:
            case a:
              Oe = !0;
              break;
            case b:
              return Oe = x._init, w(
                Oe(x._payload),
                z,
                F,
                B,
                Z
              );
          }
      }
    if (Oe)
      return Z = Z(x), Oe = B === "" ? "." + Qe(x, 0) : B, le(Z) ? (F = "", Oe != null && (F = Oe.replace(ze, "$&/") + "/"), w(Z, z, F, "", function(pi) {
        return pi;
      })) : Z != null && (ft(Z) && (Z = He(
        Z,
        F + (Z.key == null || x && x.key === Z.key ? "" : ("" + Z.key).replace(
          ze,
          "$&/"
        ) + "/") + Oe
      )), z.push(Z)), 1;
    Oe = 0;
    var Lt = B === "" ? "." : B + ":";
    if (le(x))
      for (var at = 0; at < x.length; at++)
        B = x[at], se = Lt + Qe(B, at), Oe += w(
          B,
          z,
          F,
          se,
          Z
        );
    else if (at = U(x), typeof at == "function")
      for (x = at.call(x), at = 0; !(B = x.next()).done; )
        B = B.value, se = Lt + Qe(B, at++), Oe += w(
          B,
          z,
          F,
          se,
          Z
        );
    else if (se === "object") {
      if (typeof x.then == "function")
        return w(
          Ct(x),
          z,
          F,
          B,
          Z
        );
      throw z = String(x), Error(
        "Objects are not valid as a React child (found: " + (z === "[object Object]" ? "object with keys {" + Object.keys(x).join(", ") + "}" : z) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return Oe;
  }
  function G(x, z, F) {
    if (x == null) return x;
    var B = [], Z = 0;
    return w(x, B, "", "", function(se) {
      return z.call(F, se, Z++);
    }), B;
  }
  function X(x) {
    if (x._status === -1) {
      var z = x._result;
      z = z(), z.then(
        function(F) {
          (x._status === 0 || x._status === -1) && (x._status = 1, x._result = F);
        },
        function(F) {
          (x._status === 0 || x._status === -1) && (x._status = 2, x._result = F);
        }
      ), x._status === -1 && (x._status = 0, x._result = z);
    }
    if (x._status === 1) return x._result.default;
    throw x._result;
  }
  var ge = typeof reportError == "function" ? reportError : function(x) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var z = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof x == "object" && x !== null && typeof x.message == "string" ? String(x.message) : String(x),
        error: x
      });
      if (!window.dispatchEvent(z)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", x);
      return;
    }
    console.error(x);
  }, xe = {
    map: G,
    forEach: function(x, z, F) {
      G(
        x,
        function() {
          z.apply(this, arguments);
        },
        F
      );
    },
    count: function(x) {
      var z = 0;
      return G(x, function() {
        z++;
      }), z;
    },
    toArray: function(x) {
      return G(x, function(z) {
        return z;
      }) || [];
    },
    only: function(x) {
      if (!ft(x))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return x;
    }
  };
  return ae.Activity = C, ae.Children = xe, ae.Component = P, ae.Fragment = i, ae.Profiler = o, ae.PureComponent = oe, ae.StrictMode = u, ae.Suspense = y, ae.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = J, ae.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(x) {
      return J.H.useMemoCache(x);
    }
  }, ae.cache = function(x) {
    return function() {
      return x.apply(null, arguments);
    };
  }, ae.cacheSignal = function() {
    return null;
  }, ae.cloneElement = function(x, z, F) {
    if (x == null)
      throw Error(
        "The argument must be a React element, but you passed " + x + "."
      );
    var B = $({}, x.props), Z = x.key;
    if (z != null)
      for (se in z.key !== void 0 && (Z = "" + z.key), z)
        !Ge.call(z, se) || se === "key" || se === "__self" || se === "__source" || se === "ref" && z.ref === void 0 || (B[se] = z[se]);
    var se = arguments.length - 2;
    if (se === 1) B.children = F;
    else if (1 < se) {
      for (var Oe = Array(se), Lt = 0; Lt < se; Lt++)
        Oe[Lt] = arguments[Lt + 2];
      B.children = Oe;
    }
    return Je(x.type, Z, B);
  }, ae.createContext = function(x) {
    return x = {
      $$typeof: m,
      _currentValue: x,
      _currentValue2: x,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, x.Provider = x, x.Consumer = {
      $$typeof: f,
      _context: x
    }, x;
  }, ae.createElement = function(x, z, F) {
    var B, Z = {}, se = null;
    if (z != null)
      for (B in z.key !== void 0 && (se = "" + z.key), z)
        Ge.call(z, B) && B !== "key" && B !== "__self" && B !== "__source" && (Z[B] = z[B]);
    var Oe = arguments.length - 2;
    if (Oe === 1) Z.children = F;
    else if (1 < Oe) {
      for (var Lt = Array(Oe), at = 0; at < Oe; at++)
        Lt[at] = arguments[at + 2];
      Z.children = Lt;
    }
    if (x && x.defaultProps)
      for (B in Oe = x.defaultProps, Oe)
        Z[B] === void 0 && (Z[B] = Oe[B]);
    return Je(x, se, Z);
  }, ae.createRef = function() {
    return { current: null };
  }, ae.forwardRef = function(x) {
    return { $$typeof: p, render: x };
  }, ae.isValidElement = ft, ae.lazy = function(x) {
    return {
      $$typeof: b,
      _payload: { _status: -1, _result: x },
      _init: X
    };
  }, ae.memo = function(x, z) {
    return {
      $$typeof: g,
      type: x,
      compare: z === void 0 ? null : z
    };
  }, ae.startTransition = function(x) {
    var z = J.T, F = {};
    J.T = F;
    try {
      var B = x(), Z = J.S;
      Z !== null && Z(F, B), typeof B == "object" && B !== null && typeof B.then == "function" && B.then(Le, ge);
    } catch (se) {
      ge(se);
    } finally {
      z !== null && F.types !== null && (z.types = F.types), J.T = z;
    }
  }, ae.unstable_useCacheRefresh = function() {
    return J.H.useCacheRefresh();
  }, ae.use = function(x) {
    return J.H.use(x);
  }, ae.useActionState = function(x, z, F) {
    return J.H.useActionState(x, z, F);
  }, ae.useCallback = function(x, z) {
    return J.H.useCallback(x, z);
  }, ae.useContext = function(x) {
    return J.H.useContext(x);
  }, ae.useDebugValue = function() {
  }, ae.useDeferredValue = function(x, z) {
    return J.H.useDeferredValue(x, z);
  }, ae.useEffect = function(x, z) {
    return J.H.useEffect(x, z);
  }, ae.useEffectEvent = function(x) {
    return J.H.useEffectEvent(x);
  }, ae.useId = function() {
    return J.H.useId();
  }, ae.useImperativeHandle = function(x, z, F) {
    return J.H.useImperativeHandle(x, z, F);
  }, ae.useInsertionEffect = function(x, z) {
    return J.H.useInsertionEffect(x, z);
  }, ae.useLayoutEffect = function(x, z) {
    return J.H.useLayoutEffect(x, z);
  }, ae.useMemo = function(x, z) {
    return J.H.useMemo(x, z);
  }, ae.useOptimistic = function(x, z) {
    return J.H.useOptimistic(x, z);
  }, ae.useReducer = function(x, z, F) {
    return J.H.useReducer(x, z, F);
  }, ae.useRef = function(x) {
    return J.H.useRef(x);
  }, ae.useState = function(x) {
    return J.H.useState(x);
  }, ae.useSyncExternalStore = function(x, z, F) {
    return J.H.useSyncExternalStore(
      x,
      z,
      F
    );
  }, ae.useTransition = function() {
    return J.H.useTransition();
  }, ae.version = "19.2.8", ae;
}
var fp;
function Af() {
  return fp || (fp = 1, $c.exports = e3()), $c.exports;
}
var R = Af(), Vc = { exports: {} }, or = {}, Kc = { exports: {} }, Yc = {};
var dp;
function t3() {
  return dp || (dp = 1, (function(t) {
    function a(w, G) {
      var X = w.length;
      w.push(G);
      e: for (; 0 < X; ) {
        var ge = X - 1 >>> 1, xe = w[ge];
        if (0 < o(xe, G))
          w[ge] = G, w[X] = xe, X = ge;
        else break e;
      }
    }
    function i(w) {
      return w.length === 0 ? null : w[0];
    }
    function u(w) {
      if (w.length === 0) return null;
      var G = w[0], X = w.pop();
      if (X !== G) {
        w[0] = X;
        e: for (var ge = 0, xe = w.length, x = xe >>> 1; ge < x; ) {
          var z = 2 * (ge + 1) - 1, F = w[z], B = z + 1, Z = w[B];
          if (0 > o(F, X))
            B < xe && 0 > o(Z, F) ? (w[ge] = Z, w[B] = X, ge = B) : (w[ge] = F, w[z] = X, ge = z);
          else if (B < xe && 0 > o(Z, X))
            w[ge] = Z, w[B] = X, ge = B;
          else break e;
        }
      }
      return G;
    }
    function o(w, G) {
      var X = w.sortIndex - G.sortIndex;
      return X !== 0 ? X : w.id - G.id;
    }
    if (t.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var f = performance;
      t.unstable_now = function() {
        return f.now();
      };
    } else {
      var m = Date, p = m.now();
      t.unstable_now = function() {
        return m.now() - p;
      };
    }
    var y = [], g = [], b = 1, C = null, O = 3, U = !1, q = !1, $ = !1, ne = !1, P = typeof setTimeout == "function" ? setTimeout : null, ie = typeof clearTimeout == "function" ? clearTimeout : null, oe = typeof setImmediate < "u" ? setImmediate : null;
    function H(w) {
      for (var G = i(g); G !== null; ) {
        if (G.callback === null) u(g);
        else if (G.startTime <= w)
          u(g), G.sortIndex = G.expirationTime, a(y, G);
        else break;
        G = i(g);
      }
    }
    function le(w) {
      if ($ = !1, H(w), !q)
        if (i(y) !== null)
          q = !0, Le || (Le = !0, pt());
        else {
          var G = i(g);
          G !== null && Ct(le, G.startTime - w);
        }
    }
    var Le = !1, J = -1, Ge = 5, Je = -1;
    function He() {
      return ne ? !0 : !(t.unstable_now() - Je < Ge);
    }
    function ft() {
      if (ne = !1, Le) {
        var w = t.unstable_now();
        Je = w;
        var G = !0;
        try {
          e: {
            q = !1, $ && ($ = !1, ie(J), J = -1), U = !0;
            var X = O;
            try {
              t: {
                for (H(w), C = i(y); C !== null && !(C.expirationTime > w && He()); ) {
                  var ge = C.callback;
                  if (typeof ge == "function") {
                    C.callback = null, O = C.priorityLevel;
                    var xe = ge(
                      C.expirationTime <= w
                    );
                    if (w = t.unstable_now(), typeof xe == "function") {
                      C.callback = xe, H(w), G = !0;
                      break t;
                    }
                    C === i(y) && u(y), H(w);
                  } else u(y);
                  C = i(y);
                }
                if (C !== null) G = !0;
                else {
                  var x = i(g);
                  x !== null && Ct(
                    le,
                    x.startTime - w
                  ), G = !1;
                }
              }
              break e;
            } finally {
              C = null, O = X, U = !1;
            }
            G = void 0;
          }
        } finally {
          G ? pt() : Le = !1;
        }
      }
    }
    var pt;
    if (typeof oe == "function")
      pt = function() {
        oe(ft);
      };
    else if (typeof MessageChannel < "u") {
      var ze = new MessageChannel(), Qe = ze.port2;
      ze.port1.onmessage = ft, pt = function() {
        Qe.postMessage(null);
      };
    } else
      pt = function() {
        P(ft, 0);
      };
    function Ct(w, G) {
      J = P(function() {
        w(t.unstable_now());
      }, G);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(w) {
      w.callback = null;
    }, t.unstable_forceFrameRate = function(w) {
      0 > w || 125 < w ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : Ge = 0 < w ? Math.floor(1e3 / w) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return O;
    }, t.unstable_next = function(w) {
      switch (O) {
        case 1:
        case 2:
        case 3:
          var G = 3;
          break;
        default:
          G = O;
      }
      var X = O;
      O = G;
      try {
        return w();
      } finally {
        O = X;
      }
    }, t.unstable_requestPaint = function() {
      ne = !0;
    }, t.unstable_runWithPriority = function(w, G) {
      switch (w) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          w = 3;
      }
      var X = O;
      O = w;
      try {
        return G();
      } finally {
        O = X;
      }
    }, t.unstable_scheduleCallback = function(w, G, X) {
      var ge = t.unstable_now();
      switch (typeof X == "object" && X !== null ? (X = X.delay, X = typeof X == "number" && 0 < X ? ge + X : ge) : X = ge, w) {
        case 1:
          var xe = -1;
          break;
        case 2:
          xe = 250;
          break;
        case 5:
          xe = 1073741823;
          break;
        case 4:
          xe = 1e4;
          break;
        default:
          xe = 5e3;
      }
      return xe = X + xe, w = {
        id: b++,
        callback: G,
        priorityLevel: w,
        startTime: X,
        expirationTime: xe,
        sortIndex: -1
      }, X > ge ? (w.sortIndex = X, a(g, w), i(y) === null && w === i(g) && ($ ? (ie(J), J = -1) : $ = !0, Ct(le, X - ge))) : (w.sortIndex = xe, a(y, w), q || U || (q = !0, Le || (Le = !0, pt()))), w;
    }, t.unstable_shouldYield = He, t.unstable_wrapCallback = function(w) {
      var G = O;
      return function() {
        var X = O;
        O = G;
        try {
          return w.apply(this, arguments);
        } finally {
          O = X;
        }
      };
    };
  })(Yc)), Yc;
}
var mp;
function n3() {
  return mp || (mp = 1, Kc.exports = t3()), Kc.exports;
}
var Xc = { exports: {} }, Nt = {};
var hp;
function a3() {
  if (hp) return Nt;
  hp = 1;
  var t = Af();
  function a(y) {
    var g = "https://react.dev/errors/" + y;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var b = 2; b < arguments.length; b++)
        g += "&args[]=" + encodeURIComponent(arguments[b]);
    }
    return "Minified React error #" + y + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function i() {
  }
  var u = {
    d: {
      f: i,
      r: function() {
        throw Error(a(522));
      },
      D: i,
      C: i,
      L: i,
      m: i,
      X: i,
      S: i,
      M: i
    },
    p: 0,
    findDOMNode: null
  }, o = /* @__PURE__ */ Symbol.for("react.portal");
  function f(y, g, b) {
    var C = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: o,
      key: C == null ? null : "" + C,
      children: y,
      containerInfo: g,
      implementation: b
    };
  }
  var m = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(y, g) {
    if (y === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return Nt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u, Nt.createPortal = function(y, g) {
    var b = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(a(299));
    return f(y, g, null, b);
  }, Nt.flushSync = function(y) {
    var g = m.T, b = u.p;
    try {
      if (m.T = null, u.p = 2, y) return y();
    } finally {
      m.T = g, u.p = b, u.d.f();
    }
  }, Nt.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, u.d.C(y, g));
  }, Nt.prefetchDNS = function(y) {
    typeof y == "string" && u.d.D(y);
  }, Nt.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var b = g.as, C = p(b, g.crossOrigin), O = typeof g.integrity == "string" ? g.integrity : void 0, U = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      b === "style" ? u.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: C,
          integrity: O,
          fetchPriority: U
        }
      ) : b === "script" && u.d.X(y, {
        crossOrigin: C,
        integrity: O,
        fetchPriority: U,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, Nt.preinitModule = function(y, g) {
    if (typeof y == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var b = p(
            g.as,
            g.crossOrigin
          );
          u.d.M(y, {
            crossOrigin: b,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
            nonce: typeof g.nonce == "string" ? g.nonce : void 0
          });
        }
      } else g == null && u.d.M(y);
  }, Nt.preload = function(y, g) {
    if (typeof y == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var b = g.as, C = p(b, g.crossOrigin);
      u.d.L(y, b, {
        crossOrigin: C,
        integrity: typeof g.integrity == "string" ? g.integrity : void 0,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0,
        type: typeof g.type == "string" ? g.type : void 0,
        fetchPriority: typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
        referrerPolicy: typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
        imageSrcSet: typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
        imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
        media: typeof g.media == "string" ? g.media : void 0
      });
    }
  }, Nt.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var b = p(g.as, g.crossOrigin);
        u.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: b,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else u.d.m(y);
  }, Nt.requestFormReset = function(y) {
    u.d.r(y);
  }, Nt.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, Nt.useFormState = function(y, g, b) {
    return m.H.useFormState(y, g, b);
  }, Nt.useFormStatus = function() {
    return m.H.useHostTransitionStatus();
  }, Nt.version = "19.2.8", Nt;
}
var pp;
function l3() {
  if (pp) return Xc.exports;
  pp = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (a) {
        console.error(a);
      }
  }
  return t(), Xc.exports = a3(), Xc.exports;
}
var gp;
function i3() {
  if (gp) return or;
  gp = 1;
  var t = n3(), a = Af(), i = l3();
  function u(e) {
    var n = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      n += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var l = 2; l < arguments.length; l++)
        n += "&args[]=" + encodeURIComponent(arguments[l]);
    }
    return "Minified React error #" + e + "; visit " + n + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function o(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function f(e) {
    var n = e, l = e;
    if (e.alternate) for (; n.return; ) n = n.return;
    else {
      e = n;
      do
        n = e, (n.flags & 4098) !== 0 && (l = n.return), e = n.return;
      while (e);
    }
    return n.tag === 3 ? l : null;
  }
  function m(e) {
    if (e.tag === 13) {
      var n = e.memoizedState;
      if (n === null && (e = e.alternate, e !== null && (n = e.memoizedState)), n !== null) return n.dehydrated;
    }
    return null;
  }
  function p(e) {
    if (e.tag === 31) {
      var n = e.memoizedState;
      if (n === null && (e = e.alternate, e !== null && (n = e.memoizedState)), n !== null) return n.dehydrated;
    }
    return null;
  }
  function y(e) {
    if (f(e) !== e)
      throw Error(u(188));
  }
  function g(e) {
    var n = e.alternate;
    if (!n) {
      if (n = f(e), n === null) throw Error(u(188));
      return n !== e ? null : e;
    }
    for (var l = e, r = n; ; ) {
      var s = l.return;
      if (s === null) break;
      var c = s.alternate;
      if (c === null) {
        if (r = s.return, r !== null) {
          l = r;
          continue;
        }
        break;
      }
      if (s.child === c.child) {
        for (c = s.child; c; ) {
          if (c === l) return y(s), e;
          if (c === r) return y(s), n;
          c = c.sibling;
        }
        throw Error(u(188));
      }
      if (l.return !== r.return) l = s, r = c;
      else {
        for (var d = !1, v = s.child; v; ) {
          if (v === l) {
            d = !0, l = s, r = c;
            break;
          }
          if (v === r) {
            d = !0, r = s, l = c;
            break;
          }
          v = v.sibling;
        }
        if (!d) {
          for (v = c.child; v; ) {
            if (v === l) {
              d = !0, l = c, r = s;
              break;
            }
            if (v === r) {
              d = !0, r = c, l = s;
              break;
            }
            v = v.sibling;
          }
          if (!d) throw Error(u(189));
        }
      }
      if (l.alternate !== r) throw Error(u(190));
    }
    if (l.tag !== 3) throw Error(u(188));
    return l.stateNode.current === l ? e : n;
  }
  function b(e) {
    var n = e.tag;
    if (n === 5 || n === 26 || n === 27 || n === 6) return e;
    for (e = e.child; e !== null; ) {
      if (n = b(e), n !== null) return n;
      e = e.sibling;
    }
    return null;
  }
  var C = Object.assign, O = /* @__PURE__ */ Symbol.for("react.element"), U = /* @__PURE__ */ Symbol.for("react.transitional.element"), q = /* @__PURE__ */ Symbol.for("react.portal"), $ = /* @__PURE__ */ Symbol.for("react.fragment"), ne = /* @__PURE__ */ Symbol.for("react.strict_mode"), P = /* @__PURE__ */ Symbol.for("react.profiler"), ie = /* @__PURE__ */ Symbol.for("react.consumer"), oe = /* @__PURE__ */ Symbol.for("react.context"), H = /* @__PURE__ */ Symbol.for("react.forward_ref"), le = /* @__PURE__ */ Symbol.for("react.suspense"), Le = /* @__PURE__ */ Symbol.for("react.suspense_list"), J = /* @__PURE__ */ Symbol.for("react.memo"), Ge = /* @__PURE__ */ Symbol.for("react.lazy"), Je = /* @__PURE__ */ Symbol.for("react.activity"), He = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), ft = Symbol.iterator;
  function pt(e) {
    return e === null || typeof e != "object" ? null : (e = ft && e[ft] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var ze = /* @__PURE__ */ Symbol.for("react.client.reference");
  function Qe(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === ze ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case $:
        return "Fragment";
      case P:
        return "Profiler";
      case ne:
        return "StrictMode";
      case le:
        return "Suspense";
      case Le:
        return "SuspenseList";
      case Je:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case q:
          return "Portal";
        case oe:
          return e.displayName || "Context";
        case ie:
          return (e._context.displayName || "Context") + ".Consumer";
        case H:
          var n = e.render;
          return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case J:
          return n = e.displayName || null, n !== null ? n : Qe(e.type) || "Memo";
        case Ge:
          n = e._payload, e = e._init;
          try {
            return Qe(e(n));
          } catch {
          }
      }
    return null;
  }
  var Ct = Array.isArray, w = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, G = i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, X = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ge = [], xe = -1;
  function x(e) {
    return { current: e };
  }
  function z(e) {
    0 > xe || (e.current = ge[xe], ge[xe] = null, xe--);
  }
  function F(e, n) {
    xe++, ge[xe] = e.current, e.current = n;
  }
  var B = x(null), Z = x(null), se = x(null), Oe = x(null);
  function Lt(e, n) {
    switch (F(se, n), F(Z, e), F(B, null), n.nodeType) {
      case 9:
      case 11:
        e = (e = n.documentElement) && (e = e.namespaceURI) ? Rh(e) : 0;
        break;
      default:
        if (e = n.tagName, n = n.namespaceURI)
          n = Rh(n), e = wh(n, e);
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    z(B), F(B, e);
  }
  function at() {
    z(B), z(Z), z(se);
  }
  function pi(e) {
    e.memoizedState !== null && F(Oe, e);
    var n = B.current, l = wh(n, e.type);
    n !== l && (F(Z, e), F(B, l));
  }
  function _r(e) {
    Z.current === e && (z(B), z(Z)), Oe.current === e && (z(Oe), lr._currentValue = X);
  }
  var Es, ud;
  function Fa(e) {
    if (Es === void 0)
      try {
        throw Error();
      } catch (l) {
        var n = l.stack.trim().match(/\n( *(at )?)/);
        Es = n && n[1] || "", ud = -1 < l.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < l.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Es + e + ud;
  }
  var As = !1;
  function js(e, n) {
    if (!e || As) return "";
    As = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var r = {
        DetermineComponentFrameRoot: function() {
          try {
            if (n) {
              var k = function() {
                throw Error();
              };
              if (Object.defineProperty(k.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(k, []);
                } catch (L) {
                  var N = L;
                }
                Reflect.construct(e, [], k);
              } else {
                try {
                  k.call();
                } catch (L) {
                  N = L;
                }
                e.call(k.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (L) {
                N = L;
              }
              (k = e()) && typeof k.catch == "function" && k.catch(function() {
              });
            }
          } catch (L) {
            if (L && N && typeof L.stack == "string")
              return [L.stack, N.stack];
          }
          return [null, null];
        }
      };
      r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var s = Object.getOwnPropertyDescriptor(
        r.DetermineComponentFrameRoot,
        "name"
      );
      s && s.configurable && Object.defineProperty(
        r.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var c = r.DetermineComponentFrameRoot(), d = c[0], v = c[1];
      if (d && v) {
        var S = d.split(`
`), M = v.split(`
`);
        for (s = r = 0; r < S.length && !S[r].includes("DetermineComponentFrameRoot"); )
          r++;
        for (; s < M.length && !M[s].includes(
          "DetermineComponentFrameRoot"
        ); )
          s++;
        if (r === S.length || s === M.length)
          for (r = S.length - 1, s = M.length - 1; 1 <= r && 0 <= s && S[r] !== M[s]; )
            s--;
        for (; 1 <= r && 0 <= s; r--, s--)
          if (S[r] !== M[s]) {
            if (r !== 1 || s !== 1)
              do
                if (r--, s--, 0 > s || S[r] !== M[s]) {
                  var D = `
` + S[r].replace(" at new ", " at ");
                  return e.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", e.displayName)), D;
                }
              while (1 <= r && 0 <= s);
            break;
          }
      }
    } finally {
      As = !1, Error.prepareStackTrace = l;
    }
    return (l = e ? e.displayName || e.name : "") ? Fa(l) : "";
  }
  function O2(e, n) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Fa(e.type);
      case 16:
        return Fa("Lazy");
      case 13:
        return e.child !== n && n !== null ? Fa("Suspense Fallback") : Fa("Suspense");
      case 19:
        return Fa("SuspenseList");
      case 0:
      case 15:
        return js(e.type, !1);
      case 11:
        return js(e.type.render, !1);
      case 1:
        return js(e.type, !0);
      case 31:
        return Fa("Activity");
      default:
        return "";
    }
  }
  function sd(e) {
    try {
      var n = "", l = null;
      do
        n += O2(e, l), l = e, e = e.return;
      while (e);
      return n;
    } catch (r) {
      return `
Error generating stack: ` + r.message + `
` + r.stack;
    }
  }
  var Ms = Object.prototype.hasOwnProperty, Ns = t.unstable_scheduleCallback, Os = t.unstable_cancelCallback, L2 = t.unstable_shouldYield, R2 = t.unstable_requestPaint, Ft = t.unstable_now, w2 = t.unstable_getCurrentPriorityLevel, od = t.unstable_ImmediatePriority, cd = t.unstable_UserBlockingPriority, kr = t.unstable_NormalPriority, D2 = t.unstable_LowPriority, fd = t.unstable_IdlePriority, z2 = t.log, _2 = t.unstable_setDisableYieldValue, gi = null, $t = null;
  function oa(e) {
    if (typeof z2 == "function" && _2(e), $t && typeof $t.setStrictMode == "function")
      try {
        $t.setStrictMode(gi, e);
      } catch {
      }
  }
  var Vt = Math.clz32 ? Math.clz32 : H2, k2 = Math.log, U2 = Math.LN2;
  function H2(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (k2(e) / U2 | 0) | 0;
  }
  var Ur = 256, Hr = 262144, Br = 4194304;
  function $a(e) {
    var n = e & 42;
    if (n !== 0) return n;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function Ir(e, n, l) {
    var r = e.pendingLanes;
    if (r === 0) return 0;
    var s = 0, c = e.suspendedLanes, d = e.pingedLanes;
    e = e.warmLanes;
    var v = r & 134217727;
    return v !== 0 ? (r = v & ~c, r !== 0 ? s = $a(r) : (d &= v, d !== 0 ? s = $a(d) : l || (l = v & ~e, l !== 0 && (s = $a(l))))) : (v = r & ~c, v !== 0 ? s = $a(v) : d !== 0 ? s = $a(d) : l || (l = r & ~e, l !== 0 && (s = $a(l)))), s === 0 ? 0 : n !== 0 && n !== s && (n & c) === 0 && (c = s & -s, l = n & -n, c >= l || c === 32 && (l & 4194048) !== 0) ? n : s;
  }
  function vi(e, n) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & n) === 0;
  }
  function B2(e, n) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return n + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function dd() {
    var e = Br;
    return Br <<= 1, (Br & 62914560) === 0 && (Br = 4194304), e;
  }
  function Ls(e) {
    for (var n = [], l = 0; 31 > l; l++) n.push(e);
    return n;
  }
  function yi(e, n) {
    e.pendingLanes |= n, n !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function I2(e, n, l, r, s, c) {
    var d = e.pendingLanes;
    e.pendingLanes = l, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= l, e.entangledLanes &= l, e.errorRecoveryDisabledLanes &= l, e.shellSuspendCounter = 0;
    var v = e.entanglements, S = e.expirationTimes, M = e.hiddenUpdates;
    for (l = d & ~l; 0 < l; ) {
      var D = 31 - Vt(l), k = 1 << D;
      v[D] = 0, S[D] = -1;
      var N = M[D];
      if (N !== null)
        for (M[D] = null, D = 0; D < N.length; D++) {
          var L = N[D];
          L !== null && (L.lane &= -536870913);
        }
      l &= ~k;
    }
    r !== 0 && md(e, r, 0), c !== 0 && s === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(d & ~n));
  }
  function md(e, n, l) {
    e.pendingLanes |= n, e.suspendedLanes &= ~n;
    var r = 31 - Vt(n);
    e.entangledLanes |= n, e.entanglements[r] = e.entanglements[r] | 1073741824 | l & 261930;
  }
  function hd(e, n) {
    var l = e.entangledLanes |= n;
    for (e = e.entanglements; l; ) {
      var r = 31 - Vt(l), s = 1 << r;
      s & n | e[r] & n && (e[r] |= n), l &= ~s;
    }
  }
  function pd(e, n) {
    var l = n & -n;
    return l = (l & 42) !== 0 ? 1 : Rs(l), (l & (e.suspendedLanes | n)) !== 0 ? 0 : l;
  }
  function Rs(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function ws(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function gd() {
    var e = G.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : tp(e.type));
  }
  function vd(e, n) {
    var l = G.p;
    try {
      return G.p = e, n();
    } finally {
      G.p = l;
    }
  }
  var ca = Math.random().toString(36).slice(2), St = "__reactFiber$" + ca, wt = "__reactProps$" + ca, bl = "__reactContainer$" + ca, Ds = "__reactEvents$" + ca, q2 = "__reactListeners$" + ca, G2 = "__reactHandles$" + ca, yd = "__reactResources$" + ca, bi = "__reactMarker$" + ca;
  function zs(e) {
    delete e[St], delete e[wt], delete e[Ds], delete e[q2], delete e[G2];
  }
  function Cl(e) {
    var n = e[St];
    if (n) return n;
    for (var l = e.parentNode; l; ) {
      if (n = l[bl] || l[St]) {
        if (l = n.alternate, n.child !== null || l !== null && l.child !== null)
          for (e = Bh(e); e !== null; ) {
            if (l = e[St]) return l;
            e = Bh(e);
          }
        return n;
      }
      e = l, l = e.parentNode;
    }
    return null;
  }
  function Sl(e) {
    if (e = e[St] || e[bl]) {
      var n = e.tag;
      if (n === 5 || n === 6 || n === 13 || n === 31 || n === 26 || n === 27 || n === 3)
        return e;
    }
    return null;
  }
  function Ci(e) {
    var n = e.tag;
    if (n === 5 || n === 26 || n === 27 || n === 6) return e.stateNode;
    throw Error(u(33));
  }
  function xl(e) {
    var n = e[yd];
    return n || (n = e[yd] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), n;
  }
  function gt(e) {
    e[bi] = !0;
  }
  var bd = /* @__PURE__ */ new Set(), Cd = {};
  function Va(e, n) {
    Tl(e, n), Tl(e + "Capture", n);
  }
  function Tl(e, n) {
    for (Cd[e] = n, e = 0; e < n.length; e++)
      bd.add(n[e]);
  }
  var F2 = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Sd = {}, xd = {};
  function $2(e) {
    return Ms.call(xd, e) ? !0 : Ms.call(Sd, e) ? !1 : F2.test(e) ? xd[e] = !0 : (Sd[e] = !0, !1);
  }
  function qr(e, n, l) {
    if ($2(n))
      if (l === null) e.removeAttribute(n);
      else {
        switch (typeof l) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(n);
            return;
          case "boolean":
            var r = n.toLowerCase().slice(0, 5);
            if (r !== "data-" && r !== "aria-") {
              e.removeAttribute(n);
              return;
            }
        }
        e.setAttribute(n, "" + l);
      }
  }
  function Gr(e, n, l) {
    if (l === null) e.removeAttribute(n);
    else {
      switch (typeof l) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(n);
          return;
      }
      e.setAttribute(n, "" + l);
    }
  }
  function _n(e, n, l, r) {
    if (r === null) e.removeAttribute(l);
    else {
      switch (typeof r) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(l);
          return;
      }
      e.setAttributeNS(n, l, "" + r);
    }
  }
  function en(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Td(e) {
    var n = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (n === "checkbox" || n === "radio");
  }
  function V2(e, n, l) {
    var r = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      n
    );
    if (!e.hasOwnProperty(n) && typeof r < "u" && typeof r.get == "function" && typeof r.set == "function") {
      var s = r.get, c = r.set;
      return Object.defineProperty(e, n, {
        configurable: !0,
        get: function() {
          return s.call(this);
        },
        set: function(d) {
          l = "" + d, c.call(this, d);
        }
      }), Object.defineProperty(e, n, {
        enumerable: r.enumerable
      }), {
        getValue: function() {
          return l;
        },
        setValue: function(d) {
          l = "" + d;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[n];
        }
      };
    }
  }
  function _s(e) {
    if (!e._valueTracker) {
      var n = Td(e) ? "checked" : "value";
      e._valueTracker = V2(
        e,
        n,
        "" + e[n]
      );
    }
  }
  function Ed(e) {
    if (!e) return !1;
    var n = e._valueTracker;
    if (!n) return !0;
    var l = n.getValue(), r = "";
    return e && (r = Td(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== l ? (n.setValue(e), !0) : !1;
  }
  function Fr(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var K2 = /[\n"\\]/g;
  function tn(e) {
    return e.replace(
      K2,
      function(n) {
        return "\\" + n.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function ks(e, n, l, r, s, c, d, v) {
    e.name = "", d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" ? e.type = d : e.removeAttribute("type"), n != null ? d === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + en(n)) : e.value !== "" + en(n) && (e.value = "" + en(n)) : d !== "submit" && d !== "reset" || e.removeAttribute("value"), n != null ? Us(e, d, en(n)) : l != null ? Us(e, d, en(l)) : r != null && e.removeAttribute("value"), s == null && c != null && (e.defaultChecked = !!c), s != null && (e.checked = s && typeof s != "function" && typeof s != "symbol"), v != null && typeof v != "function" && typeof v != "symbol" && typeof v != "boolean" ? e.name = "" + en(v) : e.removeAttribute("name");
  }
  function Ad(e, n, l, r, s, c, d, v) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), n != null || l != null) {
      if (!(c !== "submit" && c !== "reset" || n != null)) {
        _s(e);
        return;
      }
      l = l != null ? "" + en(l) : "", n = n != null ? "" + en(n) : l, v || n === e.value || (e.value = n), e.defaultValue = n;
    }
    r = r ?? s, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = v ? e.checked : !!r, e.defaultChecked = !!r, d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" && (e.name = d), _s(e);
  }
  function Us(e, n, l) {
    n === "number" && Fr(e.ownerDocument) === e || e.defaultValue === "" + l || (e.defaultValue = "" + l);
  }
  function El(e, n, l, r) {
    if (e = e.options, n) {
      n = {};
      for (var s = 0; s < l.length; s++)
        n["$" + l[s]] = !0;
      for (l = 0; l < e.length; l++)
        s = n.hasOwnProperty("$" + e[l].value), e[l].selected !== s && (e[l].selected = s), s && r && (e[l].defaultSelected = !0);
    } else {
      for (l = "" + en(l), n = null, s = 0; s < e.length; s++) {
        if (e[s].value === l) {
          e[s].selected = !0, r && (e[s].defaultSelected = !0);
          return;
        }
        n !== null || e[s].disabled || (n = e[s]);
      }
      n !== null && (n.selected = !0);
    }
  }
  function jd(e, n, l) {
    if (n != null && (n = "" + en(n), n !== e.value && (e.value = n), l == null)) {
      e.defaultValue !== n && (e.defaultValue = n);
      return;
    }
    e.defaultValue = l != null ? "" + en(l) : "";
  }
  function Md(e, n, l, r) {
    if (n == null) {
      if (r != null) {
        if (l != null) throw Error(u(92));
        if (Ct(r)) {
          if (1 < r.length) throw Error(u(93));
          r = r[0];
        }
        l = r;
      }
      l == null && (l = ""), n = l;
    }
    l = en(n), e.defaultValue = l, r = e.textContent, r === l && r !== "" && r !== null && (e.value = r), _s(e);
  }
  function Al(e, n) {
    if (n) {
      var l = e.firstChild;
      if (l && l === e.lastChild && l.nodeType === 3) {
        l.nodeValue = n;
        return;
      }
    }
    e.textContent = n;
  }
  var Y2 = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Nd(e, n, l) {
    var r = n.indexOf("--") === 0;
    l == null || typeof l == "boolean" || l === "" ? r ? e.setProperty(n, "") : n === "float" ? e.cssFloat = "" : e[n] = "" : r ? e.setProperty(n, l) : typeof l != "number" || l === 0 || Y2.has(n) ? n === "float" ? e.cssFloat = l : e[n] = ("" + l).trim() : e[n] = l + "px";
  }
  function Od(e, n, l) {
    if (n != null && typeof n != "object")
      throw Error(u(62));
    if (e = e.style, l != null) {
      for (var r in l)
        !l.hasOwnProperty(r) || n != null && n.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
      for (var s in n)
        r = n[s], n.hasOwnProperty(s) && l[s] !== r && Nd(e, s, r);
    } else
      for (var c in n)
        n.hasOwnProperty(c) && Nd(e, c, n[c]);
  }
  function Hs(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var X2 = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), Z2 = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function $r(e) {
    return Z2.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function kn() {
  }
  var Bs = null;
  function Is(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var jl = null, Ml = null;
  function Ld(e) {
    var n = Sl(e);
    if (n && (e = n.stateNode)) {
      var l = e[wt] || null;
      e: switch (e = n.stateNode, n.type) {
        case "input":
          if (ks(
            e,
            l.value,
            l.defaultValue,
            l.defaultValue,
            l.checked,
            l.defaultChecked,
            l.type,
            l.name
          ), n = l.name, l.type === "radio" && n != null) {
            for (l = e; l.parentNode; ) l = l.parentNode;
            for (l = l.querySelectorAll(
              'input[name="' + tn(
                "" + n
              ) + '"][type="radio"]'
            ), n = 0; n < l.length; n++) {
              var r = l[n];
              if (r !== e && r.form === e.form) {
                var s = r[wt] || null;
                if (!s) throw Error(u(90));
                ks(
                  r,
                  s.value,
                  s.defaultValue,
                  s.defaultValue,
                  s.checked,
                  s.defaultChecked,
                  s.type,
                  s.name
                );
              }
            }
            for (n = 0; n < l.length; n++)
              r = l[n], r.form === e.form && Ed(r);
          }
          break e;
        case "textarea":
          jd(e, l.value, l.defaultValue);
          break e;
        case "select":
          n = l.value, n != null && El(e, !!l.multiple, n, !1);
      }
    }
  }
  var qs = !1;
  function Rd(e, n, l) {
    if (qs) return e(n, l);
    qs = !0;
    try {
      var r = e(n);
      return r;
    } finally {
      if (qs = !1, (jl !== null || Ml !== null) && (Ru(), jl && (n = jl, e = Ml, Ml = jl = null, Ld(n), e)))
        for (n = 0; n < e.length; n++) Ld(e[n]);
    }
  }
  function Si(e, n) {
    var l = e.stateNode;
    if (l === null) return null;
    var r = l[wt] || null;
    if (r === null) return null;
    l = r[n];
    e: switch (n) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (l && typeof l != "function")
      throw Error(
        u(231, n, typeof l)
      );
    return l;
  }
  var Un = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Gs = !1;
  if (Un)
    try {
      var xi = {};
      Object.defineProperty(xi, "passive", {
        get: function() {
          Gs = !0;
        }
      }), window.addEventListener("test", xi, xi), window.removeEventListener("test", xi, xi);
    } catch {
      Gs = !1;
    }
  var fa = null, Fs = null, Vr = null;
  function wd() {
    if (Vr) return Vr;
    var e, n = Fs, l = n.length, r, s = "value" in fa ? fa.value : fa.textContent, c = s.length;
    for (e = 0; e < l && n[e] === s[e]; e++) ;
    var d = l - e;
    for (r = 1; r <= d && n[l - r] === s[c - r]; r++) ;
    return Vr = s.slice(e, 1 < r ? 1 - r : void 0);
  }
  function Kr(e) {
    var n = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && n === 13 && (e = 13)) : e = n, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Yr() {
    return !0;
  }
  function Dd() {
    return !1;
  }
  function Dt(e) {
    function n(l, r, s, c, d) {
      this._reactName = l, this._targetInst = s, this.type = r, this.nativeEvent = c, this.target = d, this.currentTarget = null;
      for (var v in e)
        e.hasOwnProperty(v) && (l = e[v], this[v] = l ? l(c) : c[v]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? Yr : Dd, this.isPropagationStopped = Dd, this;
    }
    return C(n.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var l = this.nativeEvent;
        l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = Yr);
      },
      stopPropagation: function() {
        var l = this.nativeEvent;
        l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = Yr);
      },
      persist: function() {
      },
      isPersistent: Yr
    }), n;
  }
  var Ka = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Xr = Dt(Ka), Ti = C({}, Ka, { view: 0, detail: 0 }), Q2 = Dt(Ti), $s, Vs, Ei, Zr = C({}, Ti, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Ys,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Ei && (Ei && e.type === "mousemove" ? ($s = e.screenX - Ei.screenX, Vs = e.screenY - Ei.screenY) : Vs = $s = 0, Ei = e), $s);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : Vs;
    }
  }), zd = Dt(Zr), P2 = C({}, Zr, { dataTransfer: 0 }), J2 = Dt(P2), W2 = C({}, Ti, { relatedTarget: 0 }), Ks = Dt(W2), ev = C({}, Ka, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), tv = Dt(ev), nv = C({}, Ka, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), av = Dt(nv), lv = C({}, Ka, { data: 0 }), _d = Dt(lv), iv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, rv = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, uv = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function sv(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = uv[e]) ? !!n[e] : !1;
  }
  function Ys() {
    return sv;
  }
  var ov = C({}, Ti, {
    key: function(e) {
      if (e.key) {
        var n = iv[e.key] || e.key;
        if (n !== "Unidentified") return n;
      }
      return e.type === "keypress" ? (e = Kr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? rv[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Ys,
    charCode: function(e) {
      return e.type === "keypress" ? Kr(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Kr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), cv = Dt(ov), fv = C({}, Zr, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), kd = Dt(fv), dv = C({}, Ti, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Ys
  }), mv = Dt(dv), hv = C({}, Ka, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), pv = Dt(hv), gv = C({}, Zr, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), vv = Dt(gv), yv = C({}, Ka, {
    newState: 0,
    oldState: 0
  }), bv = Dt(yv), Cv = [9, 13, 27, 32], Xs = Un && "CompositionEvent" in window, Ai = null;
  Un && "documentMode" in document && (Ai = document.documentMode);
  var Sv = Un && "TextEvent" in window && !Ai, Ud = Un && (!Xs || Ai && 8 < Ai && 11 >= Ai), Hd = " ", Bd = !1;
  function Id(e, n) {
    switch (e) {
      case "keyup":
        return Cv.indexOf(n.keyCode) !== -1;
      case "keydown":
        return n.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function qd(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Nl = !1;
  function xv(e, n) {
    switch (e) {
      case "compositionend":
        return qd(n);
      case "keypress":
        return n.which !== 32 ? null : (Bd = !0, Hd);
      case "textInput":
        return e = n.data, e === Hd && Bd ? null : e;
      default:
        return null;
    }
  }
  function Tv(e, n) {
    if (Nl)
      return e === "compositionend" || !Xs && Id(e, n) ? (e = wd(), Vr = Fs = fa = null, Nl = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(n.ctrlKey || n.altKey || n.metaKey) || n.ctrlKey && n.altKey) {
          if (n.char && 1 < n.char.length)
            return n.char;
          if (n.which) return String.fromCharCode(n.which);
        }
        return null;
      case "compositionend":
        return Ud && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var Ev = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function Gd(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!Ev[e.type] : n === "textarea";
  }
  function Fd(e, n, l, r) {
    jl ? Ml ? Ml.push(r) : Ml = [r] : jl = r, n = Hu(n, "onChange"), 0 < n.length && (l = new Xr(
      "onChange",
      "change",
      null,
      l,
      r
    ), e.push({ event: l, listeners: n }));
  }
  var ji = null, Mi = null;
  function Av(e) {
    Ah(e, 0);
  }
  function Qr(e) {
    var n = Ci(e);
    if (Ed(n)) return e;
  }
  function $d(e, n) {
    if (e === "change") return n;
  }
  var Vd = !1;
  if (Un) {
    var Zs;
    if (Un) {
      var Qs = "oninput" in document;
      if (!Qs) {
        var Kd = document.createElement("div");
        Kd.setAttribute("oninput", "return;"), Qs = typeof Kd.oninput == "function";
      }
      Zs = Qs;
    } else Zs = !1;
    Vd = Zs && (!document.documentMode || 9 < document.documentMode);
  }
  function Yd() {
    ji && (ji.detachEvent("onpropertychange", Xd), Mi = ji = null);
  }
  function Xd(e) {
    if (e.propertyName === "value" && Qr(Mi)) {
      var n = [];
      Fd(
        n,
        Mi,
        e,
        Is(e)
      ), Rd(Av, n);
    }
  }
  function jv(e, n, l) {
    e === "focusin" ? (Yd(), ji = n, Mi = l, ji.attachEvent("onpropertychange", Xd)) : e === "focusout" && Yd();
  }
  function Mv(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Qr(Mi);
  }
  function Nv(e, n) {
    if (e === "click") return Qr(n);
  }
  function Ov(e, n) {
    if (e === "input" || e === "change")
      return Qr(n);
  }
  function Lv(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var Kt = typeof Object.is == "function" ? Object.is : Lv;
  function Ni(e, n) {
    if (Kt(e, n)) return !0;
    if (typeof e != "object" || e === null || typeof n != "object" || n === null)
      return !1;
    var l = Object.keys(e), r = Object.keys(n);
    if (l.length !== r.length) return !1;
    for (r = 0; r < l.length; r++) {
      var s = l[r];
      if (!Ms.call(n, s) || !Kt(e[s], n[s]))
        return !1;
    }
    return !0;
  }
  function Zd(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Qd(e, n) {
    var l = Zd(e);
    e = 0;
    for (var r; l; ) {
      if (l.nodeType === 3) {
        if (r = e + l.textContent.length, e <= n && r >= n)
          return { node: l, offset: n - e };
        e = r;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = Zd(l);
    }
  }
  function Pd(e, n) {
    return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? Pd(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1;
  }
  function Jd(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var n = Fr(e.document); n instanceof e.HTMLIFrameElement; ) {
      try {
        var l = typeof n.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) e = n.contentWindow;
      else break;
      n = Fr(e.document);
    }
    return n;
  }
  function Ps(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true");
  }
  var Rv = Un && "documentMode" in document && 11 >= document.documentMode, Ol = null, Js = null, Oi = null, Ws = !1;
  function Wd(e, n, l) {
    var r = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    Ws || Ol == null || Ol !== Fr(r) || (r = Ol, "selectionStart" in r && Ps(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
      anchorNode: r.anchorNode,
      anchorOffset: r.anchorOffset,
      focusNode: r.focusNode,
      focusOffset: r.focusOffset
    }), Oi && Ni(Oi, r) || (Oi = r, r = Hu(Js, "onSelect"), 0 < r.length && (n = new Xr(
      "onSelect",
      "select",
      null,
      n,
      l
    ), e.push({ event: n, listeners: r }), n.target = Ol)));
  }
  function Ya(e, n) {
    var l = {};
    return l[e.toLowerCase()] = n.toLowerCase(), l["Webkit" + e] = "webkit" + n, l["Moz" + e] = "moz" + n, l;
  }
  var Ll = {
    animationend: Ya("Animation", "AnimationEnd"),
    animationiteration: Ya("Animation", "AnimationIteration"),
    animationstart: Ya("Animation", "AnimationStart"),
    transitionrun: Ya("Transition", "TransitionRun"),
    transitionstart: Ya("Transition", "TransitionStart"),
    transitioncancel: Ya("Transition", "TransitionCancel"),
    transitionend: Ya("Transition", "TransitionEnd")
  }, eo = {}, e1 = {};
  Un && (e1 = document.createElement("div").style, "AnimationEvent" in window || (delete Ll.animationend.animation, delete Ll.animationiteration.animation, delete Ll.animationstart.animation), "TransitionEvent" in window || delete Ll.transitionend.transition);
  function Xa(e) {
    if (eo[e]) return eo[e];
    if (!Ll[e]) return e;
    var n = Ll[e], l;
    for (l in n)
      if (n.hasOwnProperty(l) && l in e1)
        return eo[e] = n[l];
    return e;
  }
  var t1 = Xa("animationend"), n1 = Xa("animationiteration"), a1 = Xa("animationstart"), wv = Xa("transitionrun"), Dv = Xa("transitionstart"), zv = Xa("transitioncancel"), l1 = Xa("transitionend"), i1 = /* @__PURE__ */ new Map(), to = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  to.push("scrollEnd");
  function gn(e, n) {
    i1.set(e, n), Va(n, [e]);
  }
  var Pr = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var n = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(n)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, nn = [], Rl = 0, no = 0;
  function Jr() {
    for (var e = Rl, n = no = Rl = 0; n < e; ) {
      var l = nn[n];
      nn[n++] = null;
      var r = nn[n];
      nn[n++] = null;
      var s = nn[n];
      nn[n++] = null;
      var c = nn[n];
      if (nn[n++] = null, r !== null && s !== null) {
        var d = r.pending;
        d === null ? s.next = s : (s.next = d.next, d.next = s), r.pending = s;
      }
      c !== 0 && r1(l, s, c);
    }
  }
  function Wr(e, n, l, r) {
    nn[Rl++] = e, nn[Rl++] = n, nn[Rl++] = l, nn[Rl++] = r, no |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
  }
  function ao(e, n, l, r) {
    return Wr(e, n, l, r), eu(e);
  }
  function Za(e, n) {
    return Wr(e, null, null, n), eu(e);
  }
  function r1(e, n, l) {
    e.lanes |= l;
    var r = e.alternate;
    r !== null && (r.lanes |= l);
    for (var s = !1, c = e.return; c !== null; )
      c.childLanes |= l, r = c.alternate, r !== null && (r.childLanes |= l), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (s = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, s && n !== null && (s = 31 - Vt(l), e = c.hiddenUpdates, r = e[s], r === null ? e[s] = [n] : r.push(n), n.lane = l | 536870912), c) : null;
  }
  function eu(e) {
    if (50 < Pi)
      throw Pi = 0, mc = null, Error(u(185));
    for (var n = e.return; n !== null; )
      e = n, n = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var wl = {};
  function _v(e, n, l, r) {
    this.tag = e, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Yt(e, n, l, r) {
    return new _v(e, n, l, r);
  }
  function lo(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Hn(e, n) {
    var l = e.alternate;
    return l === null ? (l = Yt(
      e.tag,
      n,
      e.key,
      e.mode
    ), l.elementType = e.elementType, l.type = e.type, l.stateNode = e.stateNode, l.alternate = e, e.alternate = l) : (l.pendingProps = n, l.type = e.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = e.flags & 65011712, l.childLanes = e.childLanes, l.lanes = e.lanes, l.child = e.child, l.memoizedProps = e.memoizedProps, l.memoizedState = e.memoizedState, l.updateQueue = e.updateQueue, n = e.dependencies, l.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, l.sibling = e.sibling, l.index = e.index, l.ref = e.ref, l.refCleanup = e.refCleanup, l;
  }
  function u1(e, n) {
    e.flags &= 65011714;
    var l = e.alternate;
    return l === null ? (e.childLanes = 0, e.lanes = n, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = l.childLanes, e.lanes = l.lanes, e.child = l.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = l.memoizedProps, e.memoizedState = l.memoizedState, e.updateQueue = l.updateQueue, e.type = l.type, n = l.dependencies, e.dependencies = n === null ? null : {
      lanes: n.lanes,
      firstContext: n.firstContext
    }), e;
  }
  function tu(e, n, l, r, s, c) {
    var d = 0;
    if (r = e, typeof e == "function") lo(e) && (d = 1);
    else if (typeof e == "string")
      d = Iy(
        e,
        l,
        B.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case Je:
          return e = Yt(31, l, n, s), e.elementType = Je, e.lanes = c, e;
        case $:
          return Qa(l.children, s, c, n);
        case ne:
          d = 8, s |= 24;
          break;
        case P:
          return e = Yt(12, l, n, s | 2), e.elementType = P, e.lanes = c, e;
        case le:
          return e = Yt(13, l, n, s), e.elementType = le, e.lanes = c, e;
        case Le:
          return e = Yt(19, l, n, s), e.elementType = Le, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case oe:
                d = 10;
                break e;
              case ie:
                d = 9;
                break e;
              case H:
                d = 11;
                break e;
              case J:
                d = 14;
                break e;
              case Ge:
                d = 16, r = null;
                break e;
            }
          d = 29, l = Error(
            u(130, e === null ? "null" : typeof e, "")
          ), r = null;
      }
    return n = Yt(d, l, n, s), n.elementType = e, n.type = r, n.lanes = c, n;
  }
  function Qa(e, n, l, r) {
    return e = Yt(7, e, r, n), e.lanes = l, e;
  }
  function io(e, n, l) {
    return e = Yt(6, e, null, n), e.lanes = l, e;
  }
  function s1(e) {
    var n = Yt(18, null, null, 0);
    return n.stateNode = e, n;
  }
  function ro(e, n, l) {
    return n = Yt(
      4,
      e.children !== null ? e.children : [],
      e.key,
      n
    ), n.lanes = l, n.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, n;
  }
  var o1 = /* @__PURE__ */ new WeakMap();
  function an(e, n) {
    if (typeof e == "object" && e !== null) {
      var l = o1.get(e);
      return l !== void 0 ? l : (n = {
        value: e,
        source: n,
        stack: sd(n)
      }, o1.set(e, n), n);
    }
    return {
      value: e,
      source: n,
      stack: sd(n)
    };
  }
  var Dl = [], zl = 0, nu = null, Li = 0, ln = [], rn = 0, da = null, En = 1, An = "";
  function Bn(e, n) {
    Dl[zl++] = Li, Dl[zl++] = nu, nu = e, Li = n;
  }
  function c1(e, n, l) {
    ln[rn++] = En, ln[rn++] = An, ln[rn++] = da, da = e;
    var r = En;
    e = An;
    var s = 32 - Vt(r) - 1;
    r &= ~(1 << s), l += 1;
    var c = 32 - Vt(n) + s;
    if (30 < c) {
      var d = s - s % 5;
      c = (r & (1 << d) - 1).toString(32), r >>= d, s -= d, En = 1 << 32 - Vt(n) + s | l << s | r, An = c + e;
    } else
      En = 1 << c | l << s | r, An = e;
  }
  function uo(e) {
    e.return !== null && (Bn(e, 1), c1(e, 1, 0));
  }
  function so(e) {
    for (; e === nu; )
      nu = Dl[--zl], Dl[zl] = null, Li = Dl[--zl], Dl[zl] = null;
    for (; e === da; )
      da = ln[--rn], ln[rn] = null, An = ln[--rn], ln[rn] = null, En = ln[--rn], ln[rn] = null;
  }
  function f1(e, n) {
    ln[rn++] = En, ln[rn++] = An, ln[rn++] = da, En = n.id, An = n.overflow, da = e;
  }
  var xt = null, Fe = null, ve = !1, ma = null, un = !1, oo = Error(u(519));
  function ha(e) {
    var n = Error(
      u(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Ri(an(n, e)), oo;
  }
  function d1(e) {
    var n = e.stateNode, l = e.type, r = e.memoizedProps;
    switch (n[St] = e, n[wt] = r, l) {
      case "dialog":
        fe("cancel", n), fe("close", n);
        break;
      case "iframe":
      case "object":
      case "embed":
        fe("load", n);
        break;
      case "video":
      case "audio":
        for (l = 0; l < Wi.length; l++)
          fe(Wi[l], n);
        break;
      case "source":
        fe("error", n);
        break;
      case "img":
      case "image":
      case "link":
        fe("error", n), fe("load", n);
        break;
      case "details":
        fe("toggle", n);
        break;
      case "input":
        fe("invalid", n), Ad(
          n,
          r.value,
          r.defaultValue,
          r.checked,
          r.defaultChecked,
          r.type,
          r.name,
          !0
        );
        break;
      case "select":
        fe("invalid", n);
        break;
      case "textarea":
        fe("invalid", n), Md(n, r.value, r.defaultValue, r.children);
    }
    l = r.children, typeof l != "string" && typeof l != "number" && typeof l != "bigint" || n.textContent === "" + l || r.suppressHydrationWarning === !0 || Oh(n.textContent, l) ? (r.popover != null && (fe("beforetoggle", n), fe("toggle", n)), r.onScroll != null && fe("scroll", n), r.onScrollEnd != null && fe("scrollend", n), r.onClick != null && (n.onclick = kn), n = !0) : n = !1, n || ha(e, !0);
  }
  function m1(e) {
    for (xt = e.return; xt; )
      switch (xt.tag) {
        case 5:
        case 31:
        case 13:
          un = !1;
          return;
        case 27:
        case 3:
          un = !0;
          return;
        default:
          xt = xt.return;
      }
  }
  function _l(e) {
    if (e !== xt) return !1;
    if (!ve) return m1(e), ve = !0, !1;
    var n = e.tag, l;
    if ((l = n !== 3 && n !== 27) && ((l = n === 5) && (l = e.type, l = !(l !== "form" && l !== "button") || Nc(e.type, e.memoizedProps)), l = !l), l && Fe && ha(e), m1(e), n === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Fe = Hh(e);
    } else if (n === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Fe = Hh(e);
    } else
      n === 27 ? (n = Fe, Na(e.type) ? (e = Dc, Dc = null, Fe = e) : Fe = n) : Fe = xt ? on(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Pa() {
    Fe = xt = null, ve = !1;
  }
  function co() {
    var e = ma;
    return e !== null && (Ut === null ? Ut = e : Ut.push.apply(
      Ut,
      e
    ), ma = null), e;
  }
  function Ri(e) {
    ma === null ? ma = [e] : ma.push(e);
  }
  var fo = x(null), Ja = null, In = null;
  function pa(e, n, l) {
    F(fo, n._currentValue), n._currentValue = l;
  }
  function qn(e) {
    e._currentValue = fo.current, z(fo);
  }
  function mo(e, n, l) {
    for (; e !== null; ) {
      var r = e.alternate;
      if ((e.childLanes & n) !== n ? (e.childLanes |= n, r !== null && (r.childLanes |= n)) : r !== null && (r.childLanes & n) !== n && (r.childLanes |= n), e === l) break;
      e = e.return;
    }
  }
  function ho(e, n, l, r) {
    var s = e.child;
    for (s !== null && (s.return = e); s !== null; ) {
      var c = s.dependencies;
      if (c !== null) {
        var d = s.child;
        c = c.firstContext;
        e: for (; c !== null; ) {
          var v = c;
          c = s;
          for (var S = 0; S < n.length; S++)
            if (v.context === n[S]) {
              c.lanes |= l, v = c.alternate, v !== null && (v.lanes |= l), mo(
                c.return,
                l,
                e
              ), r || (d = null);
              break e;
            }
          c = v.next;
        }
      } else if (s.tag === 18) {
        if (d = s.return, d === null) throw Error(u(341));
        d.lanes |= l, c = d.alternate, c !== null && (c.lanes |= l), mo(d, l, e), d = null;
      } else d = s.child;
      if (d !== null) d.return = s;
      else
        for (d = s; d !== null; ) {
          if (d === e) {
            d = null;
            break;
          }
          if (s = d.sibling, s !== null) {
            s.return = d.return, d = s;
            break;
          }
          d = d.return;
        }
      s = d;
    }
  }
  function kl(e, n, l, r) {
    e = null;
    for (var s = n, c = !1; s !== null; ) {
      if (!c) {
        if ((s.flags & 524288) !== 0) c = !0;
        else if ((s.flags & 262144) !== 0) break;
      }
      if (s.tag === 10) {
        var d = s.alternate;
        if (d === null) throw Error(u(387));
        if (d = d.memoizedProps, d !== null) {
          var v = s.type;
          Kt(s.pendingProps.value, d.value) || (e !== null ? e.push(v) : e = [v]);
        }
      } else if (s === Oe.current) {
        if (d = s.alternate, d === null) throw Error(u(387));
        d.memoizedState.memoizedState !== s.memoizedState.memoizedState && (e !== null ? e.push(lr) : e = [lr]);
      }
      s = s.return;
    }
    e !== null && ho(
      n,
      e,
      l,
      r
    ), n.flags |= 262144;
  }
  function au(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Kt(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function Wa(e) {
    Ja = e, In = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function Tt(e) {
    return h1(Ja, e);
  }
  function lu(e, n) {
    return Ja === null && Wa(e), h1(e, n);
  }
  function h1(e, n) {
    var l = n._currentValue;
    if (n = { context: n, memoizedValue: l, next: null }, In === null) {
      if (e === null) throw Error(u(308));
      In = n, e.dependencies = { lanes: 0, firstContext: n }, e.flags |= 524288;
    } else In = In.next = n;
    return l;
  }
  var kv = typeof AbortController < "u" ? AbortController : function() {
    var e = [], n = this.signal = {
      aborted: !1,
      addEventListener: function(l, r) {
        e.push(r);
      }
    };
    this.abort = function() {
      n.aborted = !0, e.forEach(function(l) {
        return l();
      });
    };
  }, Uv = t.unstable_scheduleCallback, Hv = t.unstable_NormalPriority, rt = {
    $$typeof: oe,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function po() {
    return {
      controller: new kv(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function wi(e) {
    e.refCount--, e.refCount === 0 && Uv(Hv, function() {
      e.controller.abort();
    });
  }
  var Di = null, go = 0, Ul = 0, Hl = null;
  function Bv(e, n) {
    if (Di === null) {
      var l = Di = [];
      go = 0, Ul = bc(), Hl = {
        status: "pending",
        value: void 0,
        then: function(r) {
          l.push(r);
        }
      };
    }
    return go++, n.then(p1, p1), n;
  }
  function p1() {
    if (--go === 0 && Di !== null) {
      Hl !== null && (Hl.status = "fulfilled");
      var e = Di;
      Di = null, Ul = 0, Hl = null;
      for (var n = 0; n < e.length; n++) (0, e[n])();
    }
  }
  function Iv(e, n) {
    var l = [], r = {
      status: "pending",
      value: null,
      reason: null,
      then: function(s) {
        l.push(s);
      }
    };
    return e.then(
      function() {
        r.status = "fulfilled", r.value = n;
        for (var s = 0; s < l.length; s++) (0, l[s])(n);
      },
      function(s) {
        for (r.status = "rejected", r.reason = s, s = 0; s < l.length; s++)
          (0, l[s])(void 0);
      }
    ), r;
  }
  var g1 = w.S;
  w.S = function(e, n) {
    Wm = Ft(), typeof n == "object" && n !== null && typeof n.then == "function" && Bv(e, n), g1 !== null && g1(e, n);
  };
  var el = x(null);
  function vo() {
    var e = el.current;
    return e !== null ? e : Be.pooledCache;
  }
  function iu(e, n) {
    n === null ? F(el, el.current) : F(el, n.pool);
  }
  function v1() {
    var e = vo();
    return e === null ? null : { parent: rt._currentValue, pool: e };
  }
  var Bl = Error(u(460)), yo = Error(u(474)), ru = Error(u(542)), uu = { then: function() {
  } };
  function y1(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function b1(e, n, l) {
    switch (l = e[l], l === void 0 ? e.push(n) : l !== n && (n.then(kn, kn), n = l), n.status) {
      case "fulfilled":
        return n.value;
      case "rejected":
        throw e = n.reason, S1(e), e;
      default:
        if (typeof n.status == "string") n.then(kn, kn);
        else {
          if (e = Be, e !== null && 100 < e.shellSuspendCounter)
            throw Error(u(482));
          e = n, e.status = "pending", e.then(
            function(r) {
              if (n.status === "pending") {
                var s = n;
                s.status = "fulfilled", s.value = r;
              }
            },
            function(r) {
              if (n.status === "pending") {
                var s = n;
                s.status = "rejected", s.reason = r;
              }
            }
          );
        }
        switch (n.status) {
          case "fulfilled":
            return n.value;
          case "rejected":
            throw e = n.reason, S1(e), e;
        }
        throw nl = n, Bl;
    }
  }
  function tl(e) {
    try {
      var n = e._init;
      return n(e._payload);
    } catch (l) {
      throw l !== null && typeof l == "object" && typeof l.then == "function" ? (nl = l, Bl) : l;
    }
  }
  var nl = null;
  function C1() {
    if (nl === null) throw Error(u(459));
    var e = nl;
    return nl = null, e;
  }
  function S1(e) {
    if (e === Bl || e === ru)
      throw Error(u(483));
  }
  var Il = null, zi = 0;
  function su(e) {
    var n = zi;
    return zi += 1, Il === null && (Il = []), b1(Il, e, n);
  }
  function _i(e, n) {
    n = n.props.ref, e.ref = n !== void 0 ? n : null;
  }
  function ou(e, n) {
    throw n.$$typeof === O ? Error(u(525)) : (e = Object.prototype.toString.call(n), Error(
      u(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e
      )
    ));
  }
  function x1(e) {
    function n(A, T) {
      if (e) {
        var j = A.deletions;
        j === null ? (A.deletions = [T], A.flags |= 16) : j.push(T);
      }
    }
    function l(A, T) {
      if (!e) return null;
      for (; T !== null; )
        n(A, T), T = T.sibling;
      return null;
    }
    function r(A) {
      for (var T = /* @__PURE__ */ new Map(); A !== null; )
        A.key !== null ? T.set(A.key, A) : T.set(A.index, A), A = A.sibling;
      return T;
    }
    function s(A, T) {
      return A = Hn(A, T), A.index = 0, A.sibling = null, A;
    }
    function c(A, T, j) {
      return A.index = j, e ? (j = A.alternate, j !== null ? (j = j.index, j < T ? (A.flags |= 67108866, T) : j) : (A.flags |= 67108866, T)) : (A.flags |= 1048576, T);
    }
    function d(A) {
      return e && A.alternate === null && (A.flags |= 67108866), A;
    }
    function v(A, T, j, _) {
      return T === null || T.tag !== 6 ? (T = io(j, A.mode, _), T.return = A, T) : (T = s(T, j), T.return = A, T);
    }
    function S(A, T, j, _) {
      var Q = j.type;
      return Q === $ ? D(
        A,
        T,
        j.props.children,
        _,
        j.key
      ) : T !== null && (T.elementType === Q || typeof Q == "object" && Q !== null && Q.$$typeof === Ge && tl(Q) === T.type) ? (T = s(T, j.props), _i(T, j), T.return = A, T) : (T = tu(
        j.type,
        j.key,
        j.props,
        null,
        A.mode,
        _
      ), _i(T, j), T.return = A, T);
    }
    function M(A, T, j, _) {
      return T === null || T.tag !== 4 || T.stateNode.containerInfo !== j.containerInfo || T.stateNode.implementation !== j.implementation ? (T = ro(j, A.mode, _), T.return = A, T) : (T = s(T, j.children || []), T.return = A, T);
    }
    function D(A, T, j, _, Q) {
      return T === null || T.tag !== 7 ? (T = Qa(
        j,
        A.mode,
        _,
        Q
      ), T.return = A, T) : (T = s(T, j), T.return = A, T);
    }
    function k(A, T, j) {
      if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint")
        return T = io(
          "" + T,
          A.mode,
          j
        ), T.return = A, T;
      if (typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case U:
            return j = tu(
              T.type,
              T.key,
              T.props,
              null,
              A.mode,
              j
            ), _i(j, T), j.return = A, j;
          case q:
            return T = ro(
              T,
              A.mode,
              j
            ), T.return = A, T;
          case Ge:
            return T = tl(T), k(A, T, j);
        }
        if (Ct(T) || pt(T))
          return T = Qa(
            T,
            A.mode,
            j,
            null
          ), T.return = A, T;
        if (typeof T.then == "function")
          return k(A, su(T), j);
        if (T.$$typeof === oe)
          return k(
            A,
            lu(A, T),
            j
          );
        ou(A, T);
      }
      return null;
    }
    function N(A, T, j, _) {
      var Q = T !== null ? T.key : null;
      if (typeof j == "string" && j !== "" || typeof j == "number" || typeof j == "bigint")
        return Q !== null ? null : v(A, T, "" + j, _);
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case U:
            return j.key === Q ? S(A, T, j, _) : null;
          case q:
            return j.key === Q ? M(A, T, j, _) : null;
          case Ge:
            return j = tl(j), N(A, T, j, _);
        }
        if (Ct(j) || pt(j))
          return Q !== null ? null : D(A, T, j, _, null);
        if (typeof j.then == "function")
          return N(
            A,
            T,
            su(j),
            _
          );
        if (j.$$typeof === oe)
          return N(
            A,
            T,
            lu(A, j),
            _
          );
        ou(A, j);
      }
      return null;
    }
    function L(A, T, j, _, Q) {
      if (typeof _ == "string" && _ !== "" || typeof _ == "number" || typeof _ == "bigint")
        return A = A.get(j) || null, v(T, A, "" + _, Q);
      if (typeof _ == "object" && _ !== null) {
        switch (_.$$typeof) {
          case U:
            return A = A.get(
              _.key === null ? j : _.key
            ) || null, S(T, A, _, Q);
          case q:
            return A = A.get(
              _.key === null ? j : _.key
            ) || null, M(T, A, _, Q);
          case Ge:
            return _ = tl(_), L(
              A,
              T,
              j,
              _,
              Q
            );
        }
        if (Ct(_) || pt(_))
          return A = A.get(j) || null, D(T, A, _, Q, null);
        if (typeof _.then == "function")
          return L(
            A,
            T,
            j,
            su(_),
            Q
          );
        if (_.$$typeof === oe)
          return L(
            A,
            T,
            j,
            lu(T, _),
            Q
          );
        ou(T, _);
      }
      return null;
    }
    function V(A, T, j, _) {
      for (var Q = null, Te = null, K = T, ue = T = 0, he = null; K !== null && ue < j.length; ue++) {
        K.index > ue ? (he = K, K = null) : he = K.sibling;
        var Ee = N(
          A,
          K,
          j[ue],
          _
        );
        if (Ee === null) {
          K === null && (K = he);
          break;
        }
        e && K && Ee.alternate === null && n(A, K), T = c(Ee, T, ue), Te === null ? Q = Ee : Te.sibling = Ee, Te = Ee, K = he;
      }
      if (ue === j.length)
        return l(A, K), ve && Bn(A, ue), Q;
      if (K === null) {
        for (; ue < j.length; ue++)
          K = k(A, j[ue], _), K !== null && (T = c(
            K,
            T,
            ue
          ), Te === null ? Q = K : Te.sibling = K, Te = K);
        return ve && Bn(A, ue), Q;
      }
      for (K = r(K); ue < j.length; ue++)
        he = L(
          K,
          A,
          ue,
          j[ue],
          _
        ), he !== null && (e && he.alternate !== null && K.delete(
          he.key === null ? ue : he.key
        ), T = c(
          he,
          T,
          ue
        ), Te === null ? Q = he : Te.sibling = he, Te = he);
      return e && K.forEach(function(Da) {
        return n(A, Da);
      }), ve && Bn(A, ue), Q;
    }
    function W(A, T, j, _) {
      if (j == null) throw Error(u(151));
      for (var Q = null, Te = null, K = T, ue = T = 0, he = null, Ee = j.next(); K !== null && !Ee.done; ue++, Ee = j.next()) {
        K.index > ue ? (he = K, K = null) : he = K.sibling;
        var Da = N(A, K, Ee.value, _);
        if (Da === null) {
          K === null && (K = he);
          break;
        }
        e && K && Da.alternate === null && n(A, K), T = c(Da, T, ue), Te === null ? Q = Da : Te.sibling = Da, Te = Da, K = he;
      }
      if (Ee.done)
        return l(A, K), ve && Bn(A, ue), Q;
      if (K === null) {
        for (; !Ee.done; ue++, Ee = j.next())
          Ee = k(A, Ee.value, _), Ee !== null && (T = c(Ee, T, ue), Te === null ? Q = Ee : Te.sibling = Ee, Te = Ee);
        return ve && Bn(A, ue), Q;
      }
      for (K = r(K); !Ee.done; ue++, Ee = j.next())
        Ee = L(K, A, ue, Ee.value, _), Ee !== null && (e && Ee.alternate !== null && K.delete(Ee.key === null ? ue : Ee.key), T = c(Ee, T, ue), Te === null ? Q = Ee : Te.sibling = Ee, Te = Ee);
      return e && K.forEach(function(Py) {
        return n(A, Py);
      }), ve && Bn(A, ue), Q;
    }
    function Ue(A, T, j, _) {
      if (typeof j == "object" && j !== null && j.type === $ && j.key === null && (j = j.props.children), typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case U:
            e: {
              for (var Q = j.key; T !== null; ) {
                if (T.key === Q) {
                  if (Q = j.type, Q === $) {
                    if (T.tag === 7) {
                      l(
                        A,
                        T.sibling
                      ), _ = s(
                        T,
                        j.props.children
                      ), _.return = A, A = _;
                      break e;
                    }
                  } else if (T.elementType === Q || typeof Q == "object" && Q !== null && Q.$$typeof === Ge && tl(Q) === T.type) {
                    l(
                      A,
                      T.sibling
                    ), _ = s(T, j.props), _i(_, j), _.return = A, A = _;
                    break e;
                  }
                  l(A, T);
                  break;
                } else n(A, T);
                T = T.sibling;
              }
              j.type === $ ? (_ = Qa(
                j.props.children,
                A.mode,
                _,
                j.key
              ), _.return = A, A = _) : (_ = tu(
                j.type,
                j.key,
                j.props,
                null,
                A.mode,
                _
              ), _i(_, j), _.return = A, A = _);
            }
            return d(A);
          case q:
            e: {
              for (Q = j.key; T !== null; ) {
                if (T.key === Q)
                  if (T.tag === 4 && T.stateNode.containerInfo === j.containerInfo && T.stateNode.implementation === j.implementation) {
                    l(
                      A,
                      T.sibling
                    ), _ = s(T, j.children || []), _.return = A, A = _;
                    break e;
                  } else {
                    l(A, T);
                    break;
                  }
                else n(A, T);
                T = T.sibling;
              }
              _ = ro(j, A.mode, _), _.return = A, A = _;
            }
            return d(A);
          case Ge:
            return j = tl(j), Ue(
              A,
              T,
              j,
              _
            );
        }
        if (Ct(j))
          return V(
            A,
            T,
            j,
            _
          );
        if (pt(j)) {
          if (Q = pt(j), typeof Q != "function") throw Error(u(150));
          return j = Q.call(j), W(
            A,
            T,
            j,
            _
          );
        }
        if (typeof j.then == "function")
          return Ue(
            A,
            T,
            su(j),
            _
          );
        if (j.$$typeof === oe)
          return Ue(
            A,
            T,
            lu(A, j),
            _
          );
        ou(A, j);
      }
      return typeof j == "string" && j !== "" || typeof j == "number" || typeof j == "bigint" ? (j = "" + j, T !== null && T.tag === 6 ? (l(A, T.sibling), _ = s(T, j), _.return = A, A = _) : (l(A, T), _ = io(j, A.mode, _), _.return = A, A = _), d(A)) : l(A, T);
    }
    return function(A, T, j, _) {
      try {
        zi = 0;
        var Q = Ue(
          A,
          T,
          j,
          _
        );
        return Il = null, Q;
      } catch (K) {
        if (K === Bl || K === ru) throw K;
        var Te = Yt(29, K, null, A.mode);
        return Te.lanes = _, Te.return = A, Te;
      }
    };
  }
  var al = x1(!0), T1 = x1(!1), ga = !1;
  function bo(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Co(e, n) {
    e = e.updateQueue, n.updateQueue === e && (n.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function va(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function ya(e, n, l) {
    var r = e.updateQueue;
    if (r === null) return null;
    if (r = r.shared, (Ne & 2) !== 0) {
      var s = r.pending;
      return s === null ? n.next = n : (n.next = s.next, s.next = n), r.pending = n, n = eu(e), r1(e, null, l), n;
    }
    return Wr(e, r, n, l), eu(e);
  }
  function ki(e, n, l) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (l & 4194048) !== 0)) {
      var r = n.lanes;
      r &= e.pendingLanes, l |= r, n.lanes = l, hd(e, l);
    }
  }
  function So(e, n) {
    var l = e.updateQueue, r = e.alternate;
    if (r !== null && (r = r.updateQueue, l === r)) {
      var s = null, c = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var d = {
            lane: l.lane,
            tag: l.tag,
            payload: l.payload,
            callback: null,
            next: null
          };
          c === null ? s = c = d : c = c.next = d, l = l.next;
        } while (l !== null);
        c === null ? s = c = n : c = c.next = n;
      } else s = c = n;
      l = {
        baseState: r.baseState,
        firstBaseUpdate: s,
        lastBaseUpdate: c,
        shared: r.shared,
        callbacks: r.callbacks
      }, e.updateQueue = l;
      return;
    }
    e = l.lastBaseUpdate, e === null ? l.firstBaseUpdate = n : e.next = n, l.lastBaseUpdate = n;
  }
  var xo = !1;
  function Ui() {
    if (xo) {
      var e = Hl;
      if (e !== null) throw e;
    }
  }
  function Hi(e, n, l, r) {
    xo = !1;
    var s = e.updateQueue;
    ga = !1;
    var c = s.firstBaseUpdate, d = s.lastBaseUpdate, v = s.shared.pending;
    if (v !== null) {
      s.shared.pending = null;
      var S = v, M = S.next;
      S.next = null, d === null ? c = M : d.next = M, d = S;
      var D = e.alternate;
      D !== null && (D = D.updateQueue, v = D.lastBaseUpdate, v !== d && (v === null ? D.firstBaseUpdate = M : v.next = M, D.lastBaseUpdate = S));
    }
    if (c !== null) {
      var k = s.baseState;
      d = 0, D = M = S = null, v = c;
      do {
        var N = v.lane & -536870913, L = N !== v.lane;
        if (L ? (me & N) === N : (r & N) === N) {
          N !== 0 && N === Ul && (xo = !0), D !== null && (D = D.next = {
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: null,
            next: null
          });
          e: {
            var V = e, W = v;
            N = n;
            var Ue = l;
            switch (W.tag) {
              case 1:
                if (V = W.payload, typeof V == "function") {
                  k = V.call(Ue, k, N);
                  break e;
                }
                k = V;
                break e;
              case 3:
                V.flags = V.flags & -65537 | 128;
              case 0:
                if (V = W.payload, N = typeof V == "function" ? V.call(Ue, k, N) : V, N == null) break e;
                k = C({}, k, N);
                break e;
              case 2:
                ga = !0;
            }
          }
          N = v.callback, N !== null && (e.flags |= 64, L && (e.flags |= 8192), L = s.callbacks, L === null ? s.callbacks = [N] : L.push(N));
        } else
          L = {
            lane: N,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          }, D === null ? (M = D = L, S = k) : D = D.next = L, d |= N;
        if (v = v.next, v === null) {
          if (v = s.shared.pending, v === null)
            break;
          L = v, v = L.next, L.next = null, s.lastBaseUpdate = L, s.shared.pending = null;
        }
      } while (!0);
      D === null && (S = k), s.baseState = S, s.firstBaseUpdate = M, s.lastBaseUpdate = D, c === null && (s.shared.lanes = 0), Ta |= d, e.lanes = d, e.memoizedState = k;
    }
  }
  function E1(e, n) {
    if (typeof e != "function")
      throw Error(u(191, e));
    e.call(n);
  }
  function A1(e, n) {
    var l = e.callbacks;
    if (l !== null)
      for (e.callbacks = null, e = 0; e < l.length; e++)
        E1(l[e], n);
  }
  var ql = x(null), cu = x(0);
  function j1(e, n) {
    e = Qn, F(cu, e), F(ql, n), Qn = e | n.baseLanes;
  }
  function To() {
    F(cu, Qn), F(ql, ql.current);
  }
  function Eo() {
    Qn = cu.current, z(ql), z(cu);
  }
  var Xt = x(null), sn = null;
  function ba(e) {
    var n = e.alternate;
    F(lt, lt.current & 1), F(Xt, e), sn === null && (n === null || ql.current !== null || n.memoizedState !== null) && (sn = e);
  }
  function Ao(e) {
    F(lt, lt.current), F(Xt, e), sn === null && (sn = e);
  }
  function M1(e) {
    e.tag === 22 ? (F(lt, lt.current), F(Xt, e), sn === null && (sn = e)) : Ca();
  }
  function Ca() {
    F(lt, lt.current), F(Xt, Xt.current);
  }
  function Zt(e) {
    z(Xt), sn === e && (sn = null), z(lt);
  }
  var lt = x(0);
  function fu(e) {
    for (var n = e; n !== null; ) {
      if (n.tag === 13) {
        var l = n.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || Rc(l) || wc(l)))
          return n;
      } else if (n.tag === 19 && (n.memoizedProps.revealOrder === "forwards" || n.memoizedProps.revealOrder === "backwards" || n.memoizedProps.revealOrder === "unstable_legacy-backwards" || n.memoizedProps.revealOrder === "together")) {
        if ((n.flags & 128) !== 0) return n;
      } else if (n.child !== null) {
        n.child.return = n, n = n.child;
        continue;
      }
      if (n === e) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return null;
        n = n.return;
      }
      n.sibling.return = n.return, n = n.sibling;
    }
    return null;
  }
  var Gn = 0, re = null, _e = null, ut = null, du = !1, Gl = !1, ll = !1, mu = 0, Bi = 0, Fl = null, qv = 0;
  function We() {
    throw Error(u(321));
  }
  function jo(e, n) {
    if (n === null) return !1;
    for (var l = 0; l < n.length && l < e.length; l++)
      if (!Kt(e[l], n[l])) return !1;
    return !0;
  }
  function Mo(e, n, l, r, s, c) {
    return Gn = c, re = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, w.H = e === null || e.memoizedState === null ? cm : Go, ll = !1, c = l(r, s), ll = !1, Gl && (c = O1(
      n,
      l,
      r,
      s
    )), N1(e), c;
  }
  function N1(e) {
    w.H = Gi;
    var n = _e !== null && _e.next !== null;
    if (Gn = 0, ut = _e = re = null, du = !1, Bi = 0, Fl = null, n) throw Error(u(300));
    e === null || st || (e = e.dependencies, e !== null && au(e) && (st = !0));
  }
  function O1(e, n, l, r) {
    re = e;
    var s = 0;
    do {
      if (Gl && (Fl = null), Bi = 0, Gl = !1, 25 <= s) throw Error(u(301));
      if (s += 1, ut = _e = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      w.H = fm, c = n(l, r);
    } while (Gl);
    return c;
  }
  function Gv() {
    var e = w.H, n = e.useState()[0];
    return n = typeof n.then == "function" ? Ii(n) : n, e = e.useState()[0], (_e !== null ? _e.memoizedState : null) !== e && (re.flags |= 1024), n;
  }
  function No() {
    var e = mu !== 0;
    return mu = 0, e;
  }
  function Oo(e, n, l) {
    n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~l;
  }
  function Lo(e) {
    if (du) {
      for (e = e.memoizedState; e !== null; ) {
        var n = e.queue;
        n !== null && (n.pending = null), e = e.next;
      }
      du = !1;
    }
    Gn = 0, ut = _e = re = null, Gl = !1, Bi = mu = 0, Fl = null;
  }
  function Rt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return ut === null ? re.memoizedState = ut = e : ut = ut.next = e, ut;
  }
  function it() {
    if (_e === null) {
      var e = re.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = _e.next;
    var n = ut === null ? re.memoizedState : ut.next;
    if (n !== null)
      ut = n, _e = e;
    else {
      if (e === null)
        throw re.alternate === null ? Error(u(467)) : Error(u(310));
      _e = e, e = {
        memoizedState: _e.memoizedState,
        baseState: _e.baseState,
        baseQueue: _e.baseQueue,
        queue: _e.queue,
        next: null
      }, ut === null ? re.memoizedState = ut = e : ut = ut.next = e;
    }
    return ut;
  }
  function hu() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function Ii(e) {
    var n = Bi;
    return Bi += 1, Fl === null && (Fl = []), e = b1(Fl, e, n), n = re, (ut === null ? n.memoizedState : ut.next) === null && (n = n.alternate, w.H = n === null || n.memoizedState === null ? cm : Go), e;
  }
  function pu(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return Ii(e);
      if (e.$$typeof === oe) return Tt(e);
    }
    throw Error(u(438, String(e)));
  }
  function Ro(e) {
    var n = null, l = re.updateQueue;
    if (l !== null && (n = l.memoCache), n == null) {
      var r = re.alternate;
      r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (n = {
        data: r.data.map(function(s) {
          return s.slice();
        }),
        index: 0
      })));
    }
    if (n == null && (n = { data: [], index: 0 }), l === null && (l = hu(), re.updateQueue = l), l.memoCache = n, l = n.data[n.index], l === void 0)
      for (l = n.data[n.index] = Array(e), r = 0; r < e; r++)
        l[r] = He;
    return n.index++, l;
  }
  function Fn(e, n) {
    return typeof n == "function" ? n(e) : n;
  }
  function gu(e) {
    var n = it();
    return wo(n, _e, e);
  }
  function wo(e, n, l) {
    var r = e.queue;
    if (r === null) throw Error(u(311));
    r.lastRenderedReducer = l;
    var s = e.baseQueue, c = r.pending;
    if (c !== null) {
      if (s !== null) {
        var d = s.next;
        s.next = c.next, c.next = d;
      }
      n.baseQueue = s = c, r.pending = null;
    }
    if (c = e.baseState, s === null) e.memoizedState = c;
    else {
      n = s.next;
      var v = d = null, S = null, M = n, D = !1;
      do {
        var k = M.lane & -536870913;
        if (k !== M.lane ? (me & k) === k : (Gn & k) === k) {
          var N = M.revertLane;
          if (N === 0)
            S !== null && (S = S.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: M.action,
              hasEagerState: M.hasEagerState,
              eagerState: M.eagerState,
              next: null
            }), k === Ul && (D = !0);
          else if ((Gn & N) === N) {
            M = M.next, N === Ul && (D = !0);
            continue;
          } else
            k = {
              lane: 0,
              revertLane: M.revertLane,
              gesture: null,
              action: M.action,
              hasEagerState: M.hasEagerState,
              eagerState: M.eagerState,
              next: null
            }, S === null ? (v = S = k, d = c) : S = S.next = k, re.lanes |= N, Ta |= N;
          k = M.action, ll && l(c, k), c = M.hasEagerState ? M.eagerState : l(c, k);
        } else
          N = {
            lane: k,
            revertLane: M.revertLane,
            gesture: M.gesture,
            action: M.action,
            hasEagerState: M.hasEagerState,
            eagerState: M.eagerState,
            next: null
          }, S === null ? (v = S = N, d = c) : S = S.next = N, re.lanes |= k, Ta |= k;
        M = M.next;
      } while (M !== null && M !== n);
      if (S === null ? d = c : S.next = v, !Kt(c, e.memoizedState) && (st = !0, D && (l = Hl, l !== null)))
        throw l;
      e.memoizedState = c, e.baseState = d, e.baseQueue = S, r.lastRenderedState = c;
    }
    return s === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
  }
  function Do(e) {
    var n = it(), l = n.queue;
    if (l === null) throw Error(u(311));
    l.lastRenderedReducer = e;
    var r = l.dispatch, s = l.pending, c = n.memoizedState;
    if (s !== null) {
      l.pending = null;
      var d = s = s.next;
      do
        c = e(c, d.action), d = d.next;
      while (d !== s);
      Kt(c, n.memoizedState) || (st = !0), n.memoizedState = c, n.baseQueue === null && (n.baseState = c), l.lastRenderedState = c;
    }
    return [c, r];
  }
  function L1(e, n, l) {
    var r = re, s = it(), c = ve;
    if (c) {
      if (l === void 0) throw Error(u(407));
      l = l();
    } else l = n();
    var d = !Kt(
      (_e || s).memoizedState,
      l
    );
    if (d && (s.memoizedState = l, st = !0), s = s.queue, ko(D1.bind(null, r, s, e), [
      e
    ]), s.getSnapshot !== n || d || ut !== null && ut.memoizedState.tag & 1) {
      if (r.flags |= 2048, $l(
        9,
        { destroy: void 0 },
        w1.bind(
          null,
          r,
          s,
          l,
          n
        ),
        null
      ), Be === null) throw Error(u(349));
      c || (Gn & 127) !== 0 || R1(r, n, l);
    }
    return l;
  }
  function R1(e, n, l) {
    e.flags |= 16384, e = { getSnapshot: n, value: l }, n = re.updateQueue, n === null ? (n = hu(), re.updateQueue = n, n.stores = [e]) : (l = n.stores, l === null ? n.stores = [e] : l.push(e));
  }
  function w1(e, n, l, r) {
    n.value = l, n.getSnapshot = r, z1(n) && _1(e);
  }
  function D1(e, n, l) {
    return l(function() {
      z1(n) && _1(e);
    });
  }
  function z1(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var l = n();
      return !Kt(e, l);
    } catch {
      return !0;
    }
  }
  function _1(e) {
    var n = Za(e, 2);
    n !== null && Ht(n, e, 2);
  }
  function zo(e) {
    var n = Rt();
    if (typeof e == "function") {
      var l = e;
      if (e = l(), ll) {
        oa(!0);
        try {
          l();
        } finally {
          oa(!1);
        }
      }
    }
    return n.memoizedState = n.baseState = e, n.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Fn,
      lastRenderedState: e
    }, n;
  }
  function k1(e, n, l, r) {
    return e.baseState = l, wo(
      e,
      _e,
      typeof r == "function" ? r : Fn
    );
  }
  function Fv(e, n, l, r, s) {
    if (bu(e)) throw Error(u(485));
    if (e = n.action, e !== null) {
      var c = {
        payload: s,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(d) {
          c.listeners.push(d);
        }
      };
      w.T !== null ? l(!0) : c.isTransition = !1, r(c), l = n.pending, l === null ? (c.next = n.pending = c, U1(n, c)) : (c.next = l.next, n.pending = l.next = c);
    }
  }
  function U1(e, n) {
    var l = n.action, r = n.payload, s = e.state;
    if (n.isTransition) {
      var c = w.T, d = {};
      w.T = d;
      try {
        var v = l(s, r), S = w.S;
        S !== null && S(d, v), H1(e, n, v);
      } catch (M) {
        _o(e, n, M);
      } finally {
        c !== null && d.types !== null && (c.types = d.types), w.T = c;
      }
    } else
      try {
        c = l(s, r), H1(e, n, c);
      } catch (M) {
        _o(e, n, M);
      }
  }
  function H1(e, n, l) {
    l !== null && typeof l == "object" && typeof l.then == "function" ? l.then(
      function(r) {
        B1(e, n, r);
      },
      function(r) {
        return _o(e, n, r);
      }
    ) : B1(e, n, l);
  }
  function B1(e, n, l) {
    n.status = "fulfilled", n.value = l, I1(n), e.state = l, n = e.pending, n !== null && (l = n.next, l === n ? e.pending = null : (l = l.next, n.next = l, U1(e, l)));
  }
  function _o(e, n, l) {
    var r = e.pending;
    if (e.pending = null, r !== null) {
      r = r.next;
      do
        n.status = "rejected", n.reason = l, I1(n), n = n.next;
      while (n !== r);
    }
    e.action = null;
  }
  function I1(e) {
    e = e.listeners;
    for (var n = 0; n < e.length; n++) (0, e[n])();
  }
  function q1(e, n) {
    return n;
  }
  function G1(e, n) {
    if (ve) {
      var l = Be.formState;
      if (l !== null) {
        e: {
          var r = re;
          if (ve) {
            if (Fe) {
              t: {
                for (var s = Fe, c = un; s.nodeType !== 8; ) {
                  if (!c) {
                    s = null;
                    break t;
                  }
                  if (s = on(
                    s.nextSibling
                  ), s === null) {
                    s = null;
                    break t;
                  }
                }
                c = s.data, s = c === "F!" || c === "F" ? s : null;
              }
              if (s) {
                Fe = on(
                  s.nextSibling
                ), r = s.data === "F!";
                break e;
              }
            }
            ha(r);
          }
          r = !1;
        }
        r && (n = l[0]);
      }
    }
    return l = Rt(), l.memoizedState = l.baseState = n, r = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: q1,
      lastRenderedState: n
    }, l.queue = r, l = um.bind(
      null,
      re,
      r
    ), r.dispatch = l, r = zo(!1), c = qo.bind(
      null,
      re,
      !1,
      r.queue
    ), r = Rt(), s = {
      state: n,
      dispatch: null,
      action: e,
      pending: null
    }, r.queue = s, l = Fv.bind(
      null,
      re,
      s,
      c,
      l
    ), s.dispatch = l, r.memoizedState = e, [n, l, !1];
  }
  function F1(e) {
    var n = it();
    return $1(n, _e, e);
  }
  function $1(e, n, l) {
    if (n = wo(
      e,
      n,
      q1
    )[0], e = gu(Fn)[0], typeof n == "object" && n !== null && typeof n.then == "function")
      try {
        var r = Ii(n);
      } catch (d) {
        throw d === Bl ? ru : d;
      }
    else r = n;
    n = it();
    var s = n.queue, c = s.dispatch;
    return l !== n.memoizedState && (re.flags |= 2048, $l(
      9,
      { destroy: void 0 },
      $v.bind(null, s, l),
      null
    )), [r, c, e];
  }
  function $v(e, n) {
    e.action = n;
  }
  function V1(e) {
    var n = it(), l = _e;
    if (l !== null)
      return $1(n, l, e);
    it(), n = n.memoizedState, l = it();
    var r = l.queue.dispatch;
    return l.memoizedState = e, [n, r, !1];
  }
  function $l(e, n, l, r) {
    return e = { tag: e, create: l, deps: r, inst: n, next: null }, n = re.updateQueue, n === null && (n = hu(), re.updateQueue = n), l = n.lastEffect, l === null ? n.lastEffect = e.next = e : (r = l.next, l.next = e, e.next = r, n.lastEffect = e), e;
  }
  function K1() {
    return it().memoizedState;
  }
  function vu(e, n, l, r) {
    var s = Rt();
    re.flags |= e, s.memoizedState = $l(
      1 | n,
      { destroy: void 0 },
      l,
      r === void 0 ? null : r
    );
  }
  function yu(e, n, l, r) {
    var s = it();
    r = r === void 0 ? null : r;
    var c = s.memoizedState.inst;
    _e !== null && r !== null && jo(r, _e.memoizedState.deps) ? s.memoizedState = $l(n, c, l, r) : (re.flags |= e, s.memoizedState = $l(
      1 | n,
      c,
      l,
      r
    ));
  }
  function Y1(e, n) {
    vu(8390656, 8, e, n);
  }
  function ko(e, n) {
    yu(2048, 8, e, n);
  }
  function Vv(e) {
    re.flags |= 4;
    var n = re.updateQueue;
    if (n === null)
      n = hu(), re.updateQueue = n, n.events = [e];
    else {
      var l = n.events;
      l === null ? n.events = [e] : l.push(e);
    }
  }
  function X1(e) {
    var n = it().memoizedState;
    return Vv({ ref: n, nextImpl: e }), function() {
      if ((Ne & 2) !== 0) throw Error(u(440));
      return n.impl.apply(void 0, arguments);
    };
  }
  function Z1(e, n) {
    return yu(4, 2, e, n);
  }
  function Q1(e, n) {
    return yu(4, 4, e, n);
  }
  function P1(e, n) {
    if (typeof n == "function") {
      e = e();
      var l = n(e);
      return function() {
        typeof l == "function" ? l() : n(null);
      };
    }
    if (n != null)
      return e = e(), n.current = e, function() {
        n.current = null;
      };
  }
  function J1(e, n, l) {
    l = l != null ? l.concat([e]) : null, yu(4, 4, P1.bind(null, n, e), l);
  }
  function Uo() {
  }
  function W1(e, n) {
    var l = it();
    n = n === void 0 ? null : n;
    var r = l.memoizedState;
    return n !== null && jo(n, r[1]) ? r[0] : (l.memoizedState = [e, n], e);
  }
  function em(e, n) {
    var l = it();
    n = n === void 0 ? null : n;
    var r = l.memoizedState;
    if (n !== null && jo(n, r[1]))
      return r[0];
    if (r = e(), ll) {
      oa(!0);
      try {
        e();
      } finally {
        oa(!1);
      }
    }
    return l.memoizedState = [r, n], r;
  }
  function Ho(e, n, l) {
    return l === void 0 || (Gn & 1073741824) !== 0 && (me & 261930) === 0 ? e.memoizedState = n : (e.memoizedState = l, e = th(), re.lanes |= e, Ta |= e, l);
  }
  function tm(e, n, l, r) {
    return Kt(l, n) ? l : ql.current !== null ? (e = Ho(e, l, r), Kt(e, n) || (st = !0), e) : (Gn & 42) === 0 || (Gn & 1073741824) !== 0 && (me & 261930) === 0 ? (st = !0, e.memoizedState = l) : (e = th(), re.lanes |= e, Ta |= e, n);
  }
  function nm(e, n, l, r, s) {
    var c = G.p;
    G.p = c !== 0 && 8 > c ? c : 8;
    var d = w.T, v = {};
    w.T = v, qo(e, !1, n, l);
    try {
      var S = s(), M = w.S;
      if (M !== null && M(v, S), S !== null && typeof S == "object" && typeof S.then == "function") {
        var D = Iv(
          S,
          r
        );
        qi(
          e,
          n,
          D,
          Jt(e)
        );
      } else
        qi(
          e,
          n,
          r,
          Jt(e)
        );
    } catch (k) {
      qi(
        e,
        n,
        { then: function() {
        }, status: "rejected", reason: k },
        Jt()
      );
    } finally {
      G.p = c, d !== null && v.types !== null && (d.types = v.types), w.T = d;
    }
  }
  function Kv() {
  }
  function Bo(e, n, l, r) {
    if (e.tag !== 5) throw Error(u(476));
    var s = am(e).queue;
    nm(
      e,
      s,
      n,
      X,
      l === null ? Kv : function() {
        return lm(e), l(r);
      }
    );
  }
  function am(e) {
    var n = e.memoizedState;
    if (n !== null) return n;
    n = {
      memoizedState: X,
      baseState: X,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Fn,
        lastRenderedState: X
      },
      next: null
    };
    var l = {};
    return n.next = {
      memoizedState: l,
      baseState: l,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Fn,
        lastRenderedState: l
      },
      next: null
    }, e.memoizedState = n, e = e.alternate, e !== null && (e.memoizedState = n), n;
  }
  function lm(e) {
    var n = am(e);
    n.next === null && (n = e.alternate.memoizedState), qi(
      e,
      n.next.queue,
      {},
      Jt()
    );
  }
  function Io() {
    return Tt(lr);
  }
  function im() {
    return it().memoizedState;
  }
  function rm() {
    return it().memoizedState;
  }
  function Yv(e) {
    for (var n = e.return; n !== null; ) {
      switch (n.tag) {
        case 24:
        case 3:
          var l = Jt();
          e = va(l);
          var r = ya(n, e, l);
          r !== null && (Ht(r, n, l), ki(r, n, l)), n = { cache: po() }, e.payload = n;
          return;
      }
      n = n.return;
    }
  }
  function Xv(e, n, l) {
    var r = Jt();
    l = {
      lane: r,
      revertLane: 0,
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, bu(e) ? sm(n, l) : (l = ao(e, n, l, r), l !== null && (Ht(l, e, r), om(l, n, r)));
  }
  function um(e, n, l) {
    var r = Jt();
    qi(e, n, l, r);
  }
  function qi(e, n, l, r) {
    var s = {
      lane: r,
      revertLane: 0,
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (bu(e)) sm(n, s);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = n.lastRenderedReducer, c !== null))
        try {
          var d = n.lastRenderedState, v = c(d, l);
          if (s.hasEagerState = !0, s.eagerState = v, Kt(v, d))
            return Wr(e, n, s, 0), Be === null && Jr(), !1;
        } catch {
        }
      if (l = ao(e, n, s, r), l !== null)
        return Ht(l, e, r), om(l, n, r), !0;
    }
    return !1;
  }
  function qo(e, n, l, r) {
    if (r = {
      lane: 2,
      revertLane: bc(),
      gesture: null,
      action: r,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, bu(e)) {
      if (n) throw Error(u(479));
    } else
      n = ao(
        e,
        l,
        r,
        2
      ), n !== null && Ht(n, e, 2);
  }
  function bu(e) {
    var n = e.alternate;
    return e === re || n !== null && n === re;
  }
  function sm(e, n) {
    Gl = du = !0;
    var l = e.pending;
    l === null ? n.next = n : (n.next = l.next, l.next = n), e.pending = n;
  }
  function om(e, n, l) {
    if ((l & 4194048) !== 0) {
      var r = n.lanes;
      r &= e.pendingLanes, l |= r, n.lanes = l, hd(e, l);
    }
  }
  var Gi = {
    readContext: Tt,
    use: pu,
    useCallback: We,
    useContext: We,
    useEffect: We,
    useImperativeHandle: We,
    useLayoutEffect: We,
    useInsertionEffect: We,
    useMemo: We,
    useReducer: We,
    useRef: We,
    useState: We,
    useDebugValue: We,
    useDeferredValue: We,
    useTransition: We,
    useSyncExternalStore: We,
    useId: We,
    useHostTransitionStatus: We,
    useFormState: We,
    useActionState: We,
    useOptimistic: We,
    useMemoCache: We,
    useCacheRefresh: We
  };
  Gi.useEffectEvent = We;
  var cm = {
    readContext: Tt,
    use: pu,
    useCallback: function(e, n) {
      return Rt().memoizedState = [
        e,
        n === void 0 ? null : n
      ], e;
    },
    useContext: Tt,
    useEffect: Y1,
    useImperativeHandle: function(e, n, l) {
      l = l != null ? l.concat([e]) : null, vu(
        4194308,
        4,
        P1.bind(null, n, e),
        l
      );
    },
    useLayoutEffect: function(e, n) {
      return vu(4194308, 4, e, n);
    },
    useInsertionEffect: function(e, n) {
      vu(4, 2, e, n);
    },
    useMemo: function(e, n) {
      var l = Rt();
      n = n === void 0 ? null : n;
      var r = e();
      if (ll) {
        oa(!0);
        try {
          e();
        } finally {
          oa(!1);
        }
      }
      return l.memoizedState = [r, n], r;
    },
    useReducer: function(e, n, l) {
      var r = Rt();
      if (l !== void 0) {
        var s = l(n);
        if (ll) {
          oa(!0);
          try {
            l(n);
          } finally {
            oa(!1);
          }
        }
      } else s = n;
      return r.memoizedState = r.baseState = s, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: s
      }, r.queue = e, e = e.dispatch = Xv.bind(
        null,
        re,
        e
      ), [r.memoizedState, e];
    },
    useRef: function(e) {
      var n = Rt();
      return e = { current: e }, n.memoizedState = e;
    },
    useState: function(e) {
      e = zo(e);
      var n = e.queue, l = um.bind(null, re, n);
      return n.dispatch = l, [e.memoizedState, l];
    },
    useDebugValue: Uo,
    useDeferredValue: function(e, n) {
      var l = Rt();
      return Ho(l, e, n);
    },
    useTransition: function() {
      var e = zo(!1);
      return e = nm.bind(
        null,
        re,
        e.queue,
        !0,
        !1
      ), Rt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, n, l) {
      var r = re, s = Rt();
      if (ve) {
        if (l === void 0)
          throw Error(u(407));
        l = l();
      } else {
        if (l = n(), Be === null)
          throw Error(u(349));
        (me & 127) !== 0 || R1(r, n, l);
      }
      s.memoizedState = l;
      var c = { value: l, getSnapshot: n };
      return s.queue = c, Y1(D1.bind(null, r, c, e), [
        e
      ]), r.flags |= 2048, $l(
        9,
        { destroy: void 0 },
        w1.bind(
          null,
          r,
          c,
          l,
          n
        ),
        null
      ), l;
    },
    useId: function() {
      var e = Rt(), n = Be.identifierPrefix;
      if (ve) {
        var l = An, r = En;
        l = (r & ~(1 << 32 - Vt(r) - 1)).toString(32) + l, n = "_" + n + "R_" + l, l = mu++, 0 < l && (n += "H" + l.toString(32)), n += "_";
      } else
        l = qv++, n = "_" + n + "r_" + l.toString(32) + "_";
      return e.memoizedState = n;
    },
    useHostTransitionStatus: Io,
    useFormState: G1,
    useActionState: G1,
    useOptimistic: function(e) {
      var n = Rt();
      n.memoizedState = n.baseState = e;
      var l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return n.queue = l, n = qo.bind(
        null,
        re,
        !0,
        l
      ), l.dispatch = n, [e, n];
    },
    useMemoCache: Ro,
    useCacheRefresh: function() {
      return Rt().memoizedState = Yv.bind(
        null,
        re
      );
    },
    useEffectEvent: function(e) {
      var n = Rt(), l = { impl: e };
      return n.memoizedState = l, function() {
        if ((Ne & 2) !== 0)
          throw Error(u(440));
        return l.impl.apply(void 0, arguments);
      };
    }
  }, Go = {
    readContext: Tt,
    use: pu,
    useCallback: W1,
    useContext: Tt,
    useEffect: ko,
    useImperativeHandle: J1,
    useInsertionEffect: Z1,
    useLayoutEffect: Q1,
    useMemo: em,
    useReducer: gu,
    useRef: K1,
    useState: function() {
      return gu(Fn);
    },
    useDebugValue: Uo,
    useDeferredValue: function(e, n) {
      var l = it();
      return tm(
        l,
        _e.memoizedState,
        e,
        n
      );
    },
    useTransition: function() {
      var e = gu(Fn)[0], n = it().memoizedState;
      return [
        typeof e == "boolean" ? e : Ii(e),
        n
      ];
    },
    useSyncExternalStore: L1,
    useId: im,
    useHostTransitionStatus: Io,
    useFormState: F1,
    useActionState: F1,
    useOptimistic: function(e, n) {
      var l = it();
      return k1(l, _e, e, n);
    },
    useMemoCache: Ro,
    useCacheRefresh: rm
  };
  Go.useEffectEvent = X1;
  var fm = {
    readContext: Tt,
    use: pu,
    useCallback: W1,
    useContext: Tt,
    useEffect: ko,
    useImperativeHandle: J1,
    useInsertionEffect: Z1,
    useLayoutEffect: Q1,
    useMemo: em,
    useReducer: Do,
    useRef: K1,
    useState: function() {
      return Do(Fn);
    },
    useDebugValue: Uo,
    useDeferredValue: function(e, n) {
      var l = it();
      return _e === null ? Ho(l, e, n) : tm(
        l,
        _e.memoizedState,
        e,
        n
      );
    },
    useTransition: function() {
      var e = Do(Fn)[0], n = it().memoizedState;
      return [
        typeof e == "boolean" ? e : Ii(e),
        n
      ];
    },
    useSyncExternalStore: L1,
    useId: im,
    useHostTransitionStatus: Io,
    useFormState: V1,
    useActionState: V1,
    useOptimistic: function(e, n) {
      var l = it();
      return _e !== null ? k1(l, _e, e, n) : (l.baseState = e, [e, l.queue.dispatch]);
    },
    useMemoCache: Ro,
    useCacheRefresh: rm
  };
  fm.useEffectEvent = X1;
  function Fo(e, n, l, r) {
    n = e.memoizedState, l = l(r, n), l = l == null ? n : C({}, n, l), e.memoizedState = l, e.lanes === 0 && (e.updateQueue.baseState = l);
  }
  var $o = {
    enqueueSetState: function(e, n, l) {
      e = e._reactInternals;
      var r = Jt(), s = va(r);
      s.payload = n, l != null && (s.callback = l), n = ya(e, s, r), n !== null && (Ht(n, e, r), ki(n, e, r));
    },
    enqueueReplaceState: function(e, n, l) {
      e = e._reactInternals;
      var r = Jt(), s = va(r);
      s.tag = 1, s.payload = n, l != null && (s.callback = l), n = ya(e, s, r), n !== null && (Ht(n, e, r), ki(n, e, r));
    },
    enqueueForceUpdate: function(e, n) {
      e = e._reactInternals;
      var l = Jt(), r = va(l);
      r.tag = 2, n != null && (r.callback = n), n = ya(e, r, l), n !== null && (Ht(n, e, l), ki(n, e, l));
    }
  };
  function dm(e, n, l, r, s, c, d) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, c, d) : n.prototype && n.prototype.isPureReactComponent ? !Ni(l, r) || !Ni(s, c) : !0;
  }
  function mm(e, n, l, r) {
    e = n.state, typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(l, r), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(l, r), n.state !== e && $o.enqueueReplaceState(n, n.state, null);
  }
  function il(e, n) {
    var l = n;
    if ("ref" in n) {
      l = {};
      for (var r in n)
        r !== "ref" && (l[r] = n[r]);
    }
    if (e = e.defaultProps) {
      l === n && (l = C({}, l));
      for (var s in e)
        l[s] === void 0 && (l[s] = e[s]);
    }
    return l;
  }
  function hm(e) {
    Pr(e);
  }
  function pm(e) {
    console.error(e);
  }
  function gm(e) {
    Pr(e);
  }
  function Cu(e, n) {
    try {
      var l = e.onUncaughtError;
      l(n.value, { componentStack: n.stack });
    } catch (r) {
      setTimeout(function() {
        throw r;
      });
    }
  }
  function vm(e, n, l) {
    try {
      var r = e.onCaughtError;
      r(l.value, {
        componentStack: l.stack,
        errorBoundary: n.tag === 1 ? n.stateNode : null
      });
    } catch (s) {
      setTimeout(function() {
        throw s;
      });
    }
  }
  function Vo(e, n, l) {
    return l = va(l), l.tag = 3, l.payload = { element: null }, l.callback = function() {
      Cu(e, n);
    }, l;
  }
  function ym(e) {
    return e = va(e), e.tag = 3, e;
  }
  function bm(e, n, l, r) {
    var s = l.type.getDerivedStateFromError;
    if (typeof s == "function") {
      var c = r.value;
      e.payload = function() {
        return s(c);
      }, e.callback = function() {
        vm(n, l, r);
      };
    }
    var d = l.stateNode;
    d !== null && typeof d.componentDidCatch == "function" && (e.callback = function() {
      vm(n, l, r), typeof s != "function" && (Ea === null ? Ea = /* @__PURE__ */ new Set([this]) : Ea.add(this));
      var v = r.stack;
      this.componentDidCatch(r.value, {
        componentStack: v !== null ? v : ""
      });
    });
  }
  function Zv(e, n, l, r, s) {
    if (l.flags |= 32768, r !== null && typeof r == "object" && typeof r.then == "function") {
      if (n = l.alternate, n !== null && kl(
        n,
        l,
        s,
        !0
      ), l = Xt.current, l !== null) {
        switch (l.tag) {
          case 31:
          case 13:
            return sn === null ? wu() : l.alternate === null && et === 0 && (et = 3), l.flags &= -257, l.flags |= 65536, l.lanes = s, r === uu ? l.flags |= 16384 : (n = l.updateQueue, n === null ? l.updateQueue = /* @__PURE__ */ new Set([r]) : n.add(r), gc(e, r, s)), !1;
          case 22:
            return l.flags |= 65536, r === uu ? l.flags |= 16384 : (n = l.updateQueue, n === null ? (n = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([r])
            }, l.updateQueue = n) : (l = n.retryQueue, l === null ? n.retryQueue = /* @__PURE__ */ new Set([r]) : l.add(r)), gc(e, r, s)), !1;
        }
        throw Error(u(435, l.tag));
      }
      return gc(e, r, s), wu(), !1;
    }
    if (ve)
      return n = Xt.current, n !== null ? ((n.flags & 65536) === 0 && (n.flags |= 256), n.flags |= 65536, n.lanes = s, r !== oo && (e = Error(u(422), { cause: r }), Ri(an(e, l)))) : (r !== oo && (n = Error(u(423), {
        cause: r
      }), Ri(
        an(n, l)
      )), e = e.current.alternate, e.flags |= 65536, s &= -s, e.lanes |= s, r = an(r, l), s = Vo(
        e.stateNode,
        r,
        s
      ), So(e, s), et !== 4 && (et = 2)), !1;
    var c = Error(u(520), { cause: r });
    if (c = an(c, l), Qi === null ? Qi = [c] : Qi.push(c), et !== 4 && (et = 2), n === null) return !0;
    r = an(r, l), l = n;
    do {
      switch (l.tag) {
        case 3:
          return l.flags |= 65536, e = s & -s, l.lanes |= e, e = Vo(l.stateNode, r, e), So(l, e), !1;
        case 1:
          if (n = l.type, c = l.stateNode, (l.flags & 128) === 0 && (typeof n.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (Ea === null || !Ea.has(c))))
            return l.flags |= 65536, s &= -s, l.lanes |= s, s = ym(s), bm(
              s,
              e,
              l,
              r
            ), So(l, s), !1;
      }
      l = l.return;
    } while (l !== null);
    return !1;
  }
  var Ko = Error(u(461)), st = !1;
  function Et(e, n, l, r) {
    n.child = e === null ? T1(n, null, l, r) : al(
      n,
      e.child,
      l,
      r
    );
  }
  function Cm(e, n, l, r, s) {
    l = l.render;
    var c = n.ref;
    if ("ref" in r) {
      var d = {};
      for (var v in r)
        v !== "ref" && (d[v] = r[v]);
    } else d = r;
    return Wa(n), r = Mo(
      e,
      n,
      l,
      d,
      c,
      s
    ), v = No(), e !== null && !st ? (Oo(e, n, s), $n(e, n, s)) : (ve && v && uo(n), n.flags |= 1, Et(e, n, r, s), n.child);
  }
  function Sm(e, n, l, r, s) {
    if (e === null) {
      var c = l.type;
      return typeof c == "function" && !lo(c) && c.defaultProps === void 0 && l.compare === null ? (n.tag = 15, n.type = c, xm(
        e,
        n,
        c,
        r,
        s
      )) : (e = tu(
        l.type,
        null,
        r,
        n,
        n.mode,
        s
      ), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (c = e.child, !ec(e, s)) {
      var d = c.memoizedProps;
      if (l = l.compare, l = l !== null ? l : Ni, l(d, r) && e.ref === n.ref)
        return $n(e, n, s);
    }
    return n.flags |= 1, e = Hn(c, r), e.ref = n.ref, e.return = n, n.child = e;
  }
  function xm(e, n, l, r, s) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (Ni(c, r) && e.ref === n.ref)
        if (st = !1, n.pendingProps = r = c, ec(e, s))
          (e.flags & 131072) !== 0 && (st = !0);
        else
          return n.lanes = e.lanes, $n(e, n, s);
    }
    return Yo(
      e,
      n,
      l,
      r,
      s
    );
  }
  function Tm(e, n, l, r) {
    var s = r.children, c = e !== null ? e.memoizedState : null;
    if (e === null && n.stateNode === null && (n.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), r.mode === "hidden") {
      if ((n.flags & 128) !== 0) {
        if (c = c !== null ? c.baseLanes | l : l, e !== null) {
          for (r = n.child = e.child, s = 0; r !== null; )
            s = s | r.lanes | r.childLanes, r = r.sibling;
          r = s & ~c;
        } else r = 0, n.child = null;
        return Em(
          e,
          n,
          c,
          l,
          r
        );
      }
      if ((l & 536870912) !== 0)
        n.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && iu(
          n,
          c !== null ? c.cachePool : null
        ), c !== null ? j1(n, c) : To(), M1(n);
      else
        return r = n.lanes = 536870912, Em(
          e,
          n,
          c !== null ? c.baseLanes | l : l,
          l,
          r
        );
    } else
      c !== null ? (iu(n, c.cachePool), j1(n, c), Ca(), n.memoizedState = null) : (e !== null && iu(n, null), To(), Ca());
    return Et(e, n, s, l), n.child;
  }
  function Fi(e, n) {
    return e !== null && e.tag === 22 || n.stateNode !== null || (n.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), n.sibling;
  }
  function Em(e, n, l, r, s) {
    var c = vo();
    return c = c === null ? null : { parent: rt._currentValue, pool: c }, n.memoizedState = {
      baseLanes: l,
      cachePool: c
    }, e !== null && iu(n, null), To(), M1(n), e !== null && kl(e, n, r, !0), n.childLanes = s, null;
  }
  function Su(e, n) {
    return n = Tu(
      { mode: n.mode, children: n.children },
      e.mode
    ), n.ref = e.ref, e.child = n, n.return = e, n;
  }
  function Am(e, n, l) {
    return al(n, e.child, null, l), e = Su(n, n.pendingProps), e.flags |= 2, Zt(n), n.memoizedState = null, e;
  }
  function Qv(e, n, l) {
    var r = n.pendingProps, s = (n.flags & 128) !== 0;
    if (n.flags &= -129, e === null) {
      if (ve) {
        if (r.mode === "hidden")
          return e = Su(n, r), n.lanes = 536870912, Fi(null, e);
        if (Ao(n), (e = Fe) ? (e = Uh(
          e,
          un
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (n.memoizedState = {
          dehydrated: e,
          treeContext: da !== null ? { id: En, overflow: An } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, l = s1(e), l.return = n, n.child = l, xt = n, Fe = null)) : e = null, e === null) throw ha(n);
        return n.lanes = 536870912, null;
      }
      return Su(n, r);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var d = c.dehydrated;
      if (Ao(n), s)
        if (n.flags & 256)
          n.flags &= -257, n = Am(
            e,
            n,
            l
          );
        else if (n.memoizedState !== null)
          n.child = e.child, n.flags |= 128, n = null;
        else throw Error(u(558));
      else if (st || kl(e, n, l, !1), s = (l & e.childLanes) !== 0, st || s) {
        if (r = Be, r !== null && (d = pd(r, l), d !== 0 && d !== c.retryLane))
          throw c.retryLane = d, Za(e, d), Ht(r, e, d), Ko;
        wu(), n = Am(
          e,
          n,
          l
        );
      } else
        e = c.treeContext, Fe = on(d.nextSibling), xt = n, ve = !0, ma = null, un = !1, e !== null && f1(n, e), n = Su(n, r), n.flags |= 4096;
      return n;
    }
    return e = Hn(e.child, {
      mode: r.mode,
      children: r.children
    }), e.ref = n.ref, n.child = e, e.return = n, e;
  }
  function xu(e, n) {
    var l = n.ref;
    if (l === null)
      e !== null && e.ref !== null && (n.flags |= 4194816);
    else {
      if (typeof l != "function" && typeof l != "object")
        throw Error(u(284));
      (e === null || e.ref !== l) && (n.flags |= 4194816);
    }
  }
  function Yo(e, n, l, r, s) {
    return Wa(n), l = Mo(
      e,
      n,
      l,
      r,
      void 0,
      s
    ), r = No(), e !== null && !st ? (Oo(e, n, s), $n(e, n, s)) : (ve && r && uo(n), n.flags |= 1, Et(e, n, l, s), n.child);
  }
  function jm(e, n, l, r, s, c) {
    return Wa(n), n.updateQueue = null, l = O1(
      n,
      r,
      l,
      s
    ), N1(e), r = No(), e !== null && !st ? (Oo(e, n, c), $n(e, n, c)) : (ve && r && uo(n), n.flags |= 1, Et(e, n, l, c), n.child);
  }
  function Mm(e, n, l, r, s) {
    if (Wa(n), n.stateNode === null) {
      var c = wl, d = l.contextType;
      typeof d == "object" && d !== null && (c = Tt(d)), c = new l(r, c), n.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = $o, n.stateNode = c, c._reactInternals = n, c = n.stateNode, c.props = r, c.state = n.memoizedState, c.refs = {}, bo(n), d = l.contextType, c.context = typeof d == "object" && d !== null ? Tt(d) : wl, c.state = n.memoizedState, d = l.getDerivedStateFromProps, typeof d == "function" && (Fo(
        n,
        l,
        d,
        r
      ), c.state = n.memoizedState), typeof l.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (d = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), d !== c.state && $o.enqueueReplaceState(c, c.state, null), Hi(n, r, c, s), Ui(), c.state = n.memoizedState), typeof c.componentDidMount == "function" && (n.flags |= 4194308), r = !0;
    } else if (e === null) {
      c = n.stateNode;
      var v = n.memoizedProps, S = il(l, v);
      c.props = S;
      var M = c.context, D = l.contextType;
      d = wl, typeof D == "object" && D !== null && (d = Tt(D));
      var k = l.getDerivedStateFromProps;
      D = typeof k == "function" || typeof c.getSnapshotBeforeUpdate == "function", v = n.pendingProps !== v, D || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (v || M !== d) && mm(
        n,
        c,
        r,
        d
      ), ga = !1;
      var N = n.memoizedState;
      c.state = N, Hi(n, r, c, s), Ui(), M = n.memoizedState, v || N !== M || ga ? (typeof k == "function" && (Fo(
        n,
        l,
        k,
        r
      ), M = n.memoizedState), (S = ga || dm(
        n,
        l,
        S,
        r,
        N,
        M,
        d
      )) ? (D || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = r, n.memoizedState = M), c.props = r, c.state = M, c.context = d, r = S) : (typeof c.componentDidMount == "function" && (n.flags |= 4194308), r = !1);
    } else {
      c = n.stateNode, Co(e, n), d = n.memoizedProps, D = il(l, d), c.props = D, k = n.pendingProps, N = c.context, M = l.contextType, S = wl, typeof M == "object" && M !== null && (S = Tt(M)), v = l.getDerivedStateFromProps, (M = typeof v == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (d !== k || N !== S) && mm(
        n,
        c,
        r,
        S
      ), ga = !1, N = n.memoizedState, c.state = N, Hi(n, r, c, s), Ui();
      var L = n.memoizedState;
      d !== k || N !== L || ga || e !== null && e.dependencies !== null && au(e.dependencies) ? (typeof v == "function" && (Fo(
        n,
        l,
        v,
        r
      ), L = n.memoizedState), (D = ga || dm(
        n,
        l,
        D,
        r,
        N,
        L,
        S
      ) || e !== null && e.dependencies !== null && au(e.dependencies)) ? (M || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(r, L, S), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        r,
        L,
        S
      )), typeof c.componentDidUpdate == "function" && (n.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || d === e.memoizedProps && N === e.memoizedState || (n.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && N === e.memoizedState || (n.flags |= 1024), n.memoizedProps = r, n.memoizedState = L), c.props = r, c.state = L, c.context = S, r = D) : (typeof c.componentDidUpdate != "function" || d === e.memoizedProps && N === e.memoizedState || (n.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || d === e.memoizedProps && N === e.memoizedState || (n.flags |= 1024), r = !1);
    }
    return c = r, xu(e, n), r = (n.flags & 128) !== 0, c || r ? (c = n.stateNode, l = r && typeof l.getDerivedStateFromError != "function" ? null : c.render(), n.flags |= 1, e !== null && r ? (n.child = al(
      n,
      e.child,
      null,
      s
    ), n.child = al(
      n,
      null,
      l,
      s
    )) : Et(e, n, l, s), n.memoizedState = c.state, e = n.child) : e = $n(
      e,
      n,
      s
    ), e;
  }
  function Nm(e, n, l, r) {
    return Pa(), n.flags |= 256, Et(e, n, l, r), n.child;
  }
  var Xo = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Zo(e) {
    return { baseLanes: e, cachePool: v1() };
  }
  function Qo(e, n, l) {
    return e = e !== null ? e.childLanes & ~l : 0, n && (e |= Pt), e;
  }
  function Om(e, n, l) {
    var r = n.pendingProps, s = !1, c = (n.flags & 128) !== 0, d;
    if ((d = c) || (d = e !== null && e.memoizedState === null ? !1 : (lt.current & 2) !== 0), d && (s = !0, n.flags &= -129), d = (n.flags & 32) !== 0, n.flags &= -33, e === null) {
      if (ve) {
        if (s ? ba(n) : Ca(), (e = Fe) ? (e = Uh(
          e,
          un
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (n.memoizedState = {
          dehydrated: e,
          treeContext: da !== null ? { id: En, overflow: An } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, l = s1(e), l.return = n, n.child = l, xt = n, Fe = null)) : e = null, e === null) throw ha(n);
        return wc(e) ? n.lanes = 32 : n.lanes = 536870912, null;
      }
      var v = r.children;
      return r = r.fallback, s ? (Ca(), s = n.mode, v = Tu(
        { mode: "hidden", children: v },
        s
      ), r = Qa(
        r,
        s,
        l,
        null
      ), v.return = n, r.return = n, v.sibling = r, n.child = v, r = n.child, r.memoizedState = Zo(l), r.childLanes = Qo(
        e,
        d,
        l
      ), n.memoizedState = Xo, Fi(null, r)) : (ba(n), Po(n, v));
    }
    var S = e.memoizedState;
    if (S !== null && (v = S.dehydrated, v !== null)) {
      if (c)
        n.flags & 256 ? (ba(n), n.flags &= -257, n = Jo(
          e,
          n,
          l
        )) : n.memoizedState !== null ? (Ca(), n.child = e.child, n.flags |= 128, n = null) : (Ca(), v = r.fallback, s = n.mode, r = Tu(
          { mode: "visible", children: r.children },
          s
        ), v = Qa(
          v,
          s,
          l,
          null
        ), v.flags |= 2, r.return = n, v.return = n, r.sibling = v, n.child = r, al(
          n,
          e.child,
          null,
          l
        ), r = n.child, r.memoizedState = Zo(l), r.childLanes = Qo(
          e,
          d,
          l
        ), n.memoizedState = Xo, n = Fi(null, r));
      else if (ba(n), wc(v)) {
        if (d = v.nextSibling && v.nextSibling.dataset, d) var M = d.dgst;
        d = M, r = Error(u(419)), r.stack = "", r.digest = d, Ri({ value: r, source: null, stack: null }), n = Jo(
          e,
          n,
          l
        );
      } else if (st || kl(e, n, l, !1), d = (l & e.childLanes) !== 0, st || d) {
        if (d = Be, d !== null && (r = pd(d, l), r !== 0 && r !== S.retryLane))
          throw S.retryLane = r, Za(e, r), Ht(d, e, r), Ko;
        Rc(v) || wu(), n = Jo(
          e,
          n,
          l
        );
      } else
        Rc(v) ? (n.flags |= 192, n.child = e.child, n = null) : (e = S.treeContext, Fe = on(
          v.nextSibling
        ), xt = n, ve = !0, ma = null, un = !1, e !== null && f1(n, e), n = Po(
          n,
          r.children
        ), n.flags |= 4096);
      return n;
    }
    return s ? (Ca(), v = r.fallback, s = n.mode, S = e.child, M = S.sibling, r = Hn(S, {
      mode: "hidden",
      children: r.children
    }), r.subtreeFlags = S.subtreeFlags & 65011712, M !== null ? v = Hn(
      M,
      v
    ) : (v = Qa(
      v,
      s,
      l,
      null
    ), v.flags |= 2), v.return = n, r.return = n, r.sibling = v, n.child = r, Fi(null, r), r = n.child, v = e.child.memoizedState, v === null ? v = Zo(l) : (s = v.cachePool, s !== null ? (S = rt._currentValue, s = s.parent !== S ? { parent: S, pool: S } : s) : s = v1(), v = {
      baseLanes: v.baseLanes | l,
      cachePool: s
    }), r.memoizedState = v, r.childLanes = Qo(
      e,
      d,
      l
    ), n.memoizedState = Xo, Fi(e.child, r)) : (ba(n), l = e.child, e = l.sibling, l = Hn(l, {
      mode: "visible",
      children: r.children
    }), l.return = n, l.sibling = null, e !== null && (d = n.deletions, d === null ? (n.deletions = [e], n.flags |= 16) : d.push(e)), n.child = l, n.memoizedState = null, l);
  }
  function Po(e, n) {
    return n = Tu(
      { mode: "visible", children: n },
      e.mode
    ), n.return = e, e.child = n;
  }
  function Tu(e, n) {
    return e = Yt(22, e, null, n), e.lanes = 0, e;
  }
  function Jo(e, n, l) {
    return al(n, e.child, null, l), e = Po(
      n,
      n.pendingProps.children
    ), e.flags |= 2, n.memoizedState = null, e;
  }
  function Lm(e, n, l) {
    e.lanes |= n;
    var r = e.alternate;
    r !== null && (r.lanes |= n), mo(e.return, n, l);
  }
  function Wo(e, n, l, r, s, c) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = {
      isBackwards: n,
      rendering: null,
      renderingStartTime: 0,
      last: r,
      tail: l,
      tailMode: s,
      treeForkCount: c
    } : (d.isBackwards = n, d.rendering = null, d.renderingStartTime = 0, d.last = r, d.tail = l, d.tailMode = s, d.treeForkCount = c);
  }
  function Rm(e, n, l) {
    var r = n.pendingProps, s = r.revealOrder, c = r.tail;
    r = r.children;
    var d = lt.current, v = (d & 2) !== 0;
    if (v ? (d = d & 1 | 2, n.flags |= 128) : d &= 1, F(lt, d), Et(e, n, r, l), r = ve ? Li : 0, !v && e !== null && (e.flags & 128) !== 0)
      e: for (e = n.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Lm(e, l, n);
        else if (e.tag === 19)
          Lm(e, l, n);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === n) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === n)
            break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    switch (s) {
      case "forwards":
        for (l = n.child, s = null; l !== null; )
          e = l.alternate, e !== null && fu(e) === null && (s = l), l = l.sibling;
        l = s, l === null ? (s = n.child, n.child = null) : (s = l.sibling, l.sibling = null), Wo(
          n,
          !1,
          s,
          l,
          c,
          r
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (l = null, s = n.child, n.child = null; s !== null; ) {
          if (e = s.alternate, e !== null && fu(e) === null) {
            n.child = s;
            break;
          }
          e = s.sibling, s.sibling = l, l = s, s = e;
        }
        Wo(
          n,
          !0,
          l,
          null,
          c,
          r
        );
        break;
      case "together":
        Wo(
          n,
          !1,
          null,
          null,
          void 0,
          r
        );
        break;
      default:
        n.memoizedState = null;
    }
    return n.child;
  }
  function $n(e, n, l) {
    if (e !== null && (n.dependencies = e.dependencies), Ta |= n.lanes, (l & n.childLanes) === 0)
      if (e !== null) {
        if (kl(
          e,
          n,
          l,
          !1
        ), (l & n.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && n.child !== e.child)
      throw Error(u(153));
    if (n.child !== null) {
      for (e = n.child, l = Hn(e, e.pendingProps), n.child = l, l.return = n; e.sibling !== null; )
        e = e.sibling, l = l.sibling = Hn(e, e.pendingProps), l.return = n;
      l.sibling = null;
    }
    return n.child;
  }
  function ec(e, n) {
    return (e.lanes & n) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && au(e)));
  }
  function Pv(e, n, l) {
    switch (n.tag) {
      case 3:
        Lt(n, n.stateNode.containerInfo), pa(n, rt, e.memoizedState.cache), Pa();
        break;
      case 27:
      case 5:
        pi(n);
        break;
      case 4:
        Lt(n, n.stateNode.containerInfo);
        break;
      case 10:
        pa(
          n,
          n.type,
          n.memoizedProps.value
        );
        break;
      case 31:
        if (n.memoizedState !== null)
          return n.flags |= 128, Ao(n), null;
        break;
      case 13:
        var r = n.memoizedState;
        if (r !== null)
          return r.dehydrated !== null ? (ba(n), n.flags |= 128, null) : (l & n.child.childLanes) !== 0 ? Om(e, n, l) : (ba(n), e = $n(
            e,
            n,
            l
          ), e !== null ? e.sibling : null);
        ba(n);
        break;
      case 19:
        var s = (e.flags & 128) !== 0;
        if (r = (l & n.childLanes) !== 0, r || (kl(
          e,
          n,
          l,
          !1
        ), r = (l & n.childLanes) !== 0), s) {
          if (r)
            return Rm(
              e,
              n,
              l
            );
          n.flags |= 128;
        }
        if (s = n.memoizedState, s !== null && (s.rendering = null, s.tail = null, s.lastEffect = null), F(lt, lt.current), r) break;
        return null;
      case 22:
        return n.lanes = 0, Tm(
          e,
          n,
          l,
          n.pendingProps
        );
      case 24:
        pa(n, rt, e.memoizedState.cache);
    }
    return $n(e, n, l);
  }
  function wm(e, n, l) {
    if (e !== null)
      if (e.memoizedProps !== n.pendingProps)
        st = !0;
      else {
        if (!ec(e, l) && (n.flags & 128) === 0)
          return st = !1, Pv(
            e,
            n,
            l
          );
        st = (e.flags & 131072) !== 0;
      }
    else
      st = !1, ve && (n.flags & 1048576) !== 0 && c1(n, Li, n.index);
    switch (n.lanes = 0, n.tag) {
      case 16:
        e: {
          var r = n.pendingProps;
          if (e = tl(n.elementType), n.type = e, typeof e == "function")
            lo(e) ? (r = il(e, r), n.tag = 1, n = Mm(
              null,
              n,
              e,
              r,
              l
            )) : (n.tag = 0, n = Yo(
              null,
              n,
              e,
              r,
              l
            ));
          else {
            if (e != null) {
              var s = e.$$typeof;
              if (s === H) {
                n.tag = 11, n = Cm(
                  null,
                  n,
                  e,
                  r,
                  l
                );
                break e;
              } else if (s === J) {
                n.tag = 14, n = Sm(
                  null,
                  n,
                  e,
                  r,
                  l
                );
                break e;
              }
            }
            throw n = Qe(e) || e, Error(u(306, n, ""));
          }
        }
        return n;
      case 0:
        return Yo(
          e,
          n,
          n.type,
          n.pendingProps,
          l
        );
      case 1:
        return r = n.type, s = il(
          r,
          n.pendingProps
        ), Mm(
          e,
          n,
          r,
          s,
          l
        );
      case 3:
        e: {
          if (Lt(
            n,
            n.stateNode.containerInfo
          ), e === null) throw Error(u(387));
          r = n.pendingProps;
          var c = n.memoizedState;
          s = c.element, Co(e, n), Hi(n, r, null, l);
          var d = n.memoizedState;
          if (r = d.cache, pa(n, rt, r), r !== c.cache && ho(
            n,
            [rt],
            l,
            !0
          ), Ui(), r = d.element, c.isDehydrated)
            if (c = {
              element: r,
              isDehydrated: !1,
              cache: d.cache
            }, n.updateQueue.baseState = c, n.memoizedState = c, n.flags & 256) {
              n = Nm(
                e,
                n,
                r,
                l
              );
              break e;
            } else if (r !== s) {
              s = an(
                Error(u(424)),
                n
              ), Ri(s), n = Nm(
                e,
                n,
                r,
                l
              );
              break e;
            } else
              for (e = n.stateNode.containerInfo, e.nodeType === 9 ? e = e.body : e = e.nodeName === "HTML" ? e.ownerDocument.body : e, Fe = on(e.firstChild), xt = n, ve = !0, ma = null, un = !0, l = T1(
                n,
                null,
                r,
                l
              ), n.child = l; l; )
                l.flags = l.flags & -3 | 4096, l = l.sibling;
          else {
            if (Pa(), r === s) {
              n = $n(
                e,
                n,
                l
              );
              break e;
            }
            Et(e, n, r, l);
          }
          n = n.child;
        }
        return n;
      case 26:
        return xu(e, n), e === null ? (l = Fh(
          n.type,
          null,
          n.pendingProps,
          null
        )) ? n.memoizedState = l : ve || (l = n.type, e = n.pendingProps, r = Bu(
          se.current
        ).createElement(l), r[St] = n, r[wt] = e, At(r, l, e), gt(r), n.stateNode = r) : n.memoizedState = Fh(
          n.type,
          e.memoizedProps,
          n.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return pi(n), e === null && ve && (r = n.stateNode = Ih(
          n.type,
          n.pendingProps,
          se.current
        ), xt = n, un = !0, s = Fe, Na(n.type) ? (Dc = s, Fe = on(r.firstChild)) : Fe = s), Et(
          e,
          n,
          n.pendingProps.children,
          l
        ), xu(e, n), e === null && (n.flags |= 4194304), n.child;
      case 5:
        return e === null && ve && ((s = r = Fe) && (r = My(
          r,
          n.type,
          n.pendingProps,
          un
        ), r !== null ? (n.stateNode = r, xt = n, Fe = on(r.firstChild), un = !1, s = !0) : s = !1), s || ha(n)), pi(n), s = n.type, c = n.pendingProps, d = e !== null ? e.memoizedProps : null, r = c.children, Nc(s, c) ? r = null : d !== null && Nc(s, d) && (n.flags |= 32), n.memoizedState !== null && (s = Mo(
          e,
          n,
          Gv,
          null,
          null,
          l
        ), lr._currentValue = s), xu(e, n), Et(e, n, r, l), n.child;
      case 6:
        return e === null && ve && ((e = l = Fe) && (l = Ny(
          l,
          n.pendingProps,
          un
        ), l !== null ? (n.stateNode = l, xt = n, Fe = null, e = !0) : e = !1), e || ha(n)), null;
      case 13:
        return Om(e, n, l);
      case 4:
        return Lt(
          n,
          n.stateNode.containerInfo
        ), r = n.pendingProps, e === null ? n.child = al(
          n,
          null,
          r,
          l
        ) : Et(e, n, r, l), n.child;
      case 11:
        return Cm(
          e,
          n,
          n.type,
          n.pendingProps,
          l
        );
      case 7:
        return Et(
          e,
          n,
          n.pendingProps,
          l
        ), n.child;
      case 8:
        return Et(
          e,
          n,
          n.pendingProps.children,
          l
        ), n.child;
      case 12:
        return Et(
          e,
          n,
          n.pendingProps.children,
          l
        ), n.child;
      case 10:
        return r = n.pendingProps, pa(n, n.type, r.value), Et(e, n, r.children, l), n.child;
      case 9:
        return s = n.type._context, r = n.pendingProps.children, Wa(n), s = Tt(s), r = r(s), n.flags |= 1, Et(e, n, r, l), n.child;
      case 14:
        return Sm(
          e,
          n,
          n.type,
          n.pendingProps,
          l
        );
      case 15:
        return xm(
          e,
          n,
          n.type,
          n.pendingProps,
          l
        );
      case 19:
        return Rm(e, n, l);
      case 31:
        return Qv(e, n, l);
      case 22:
        return Tm(
          e,
          n,
          l,
          n.pendingProps
        );
      case 24:
        return Wa(n), r = Tt(rt), e === null ? (s = vo(), s === null && (s = Be, c = po(), s.pooledCache = c, c.refCount++, c !== null && (s.pooledCacheLanes |= l), s = c), n.memoizedState = { parent: r, cache: s }, bo(n), pa(n, rt, s)) : ((e.lanes & l) !== 0 && (Co(e, n), Hi(n, null, null, l), Ui()), s = e.memoizedState, c = n.memoizedState, s.parent !== r ? (s = { parent: r, cache: r }, n.memoizedState = s, n.lanes === 0 && (n.memoizedState = n.updateQueue.baseState = s), pa(n, rt, r)) : (r = c.cache, pa(n, rt, r), r !== s.cache && ho(
          n,
          [rt],
          l,
          !0
        ))), Et(
          e,
          n,
          n.pendingProps.children,
          l
        ), n.child;
      case 29:
        throw n.pendingProps;
    }
    throw Error(u(156, n.tag));
  }
  function Vn(e) {
    e.flags |= 4;
  }
  function tc(e, n, l, r, s) {
    if ((n = (e.mode & 32) !== 0) && (n = !1), n) {
      if (e.flags |= 16777216, (s & 335544128) === s)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (ih()) e.flags |= 8192;
        else
          throw nl = uu, yo;
    } else e.flags &= -16777217;
  }
  function Dm(e, n) {
    if (n.type !== "stylesheet" || (n.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !Xh(n))
      if (ih()) e.flags |= 8192;
      else
        throw nl = uu, yo;
  }
  function Eu(e, n) {
    n !== null && (e.flags |= 4), e.flags & 16384 && (n = e.tag !== 22 ? dd() : 536870912, e.lanes |= n, Xl |= n);
  }
  function $i(e, n) {
    if (!ve)
      switch (e.tailMode) {
        case "hidden":
          n = e.tail;
          for (var l = null; n !== null; )
            n.alternate !== null && (l = n), n = n.sibling;
          l === null ? e.tail = null : l.sibling = null;
          break;
        case "collapsed":
          l = e.tail;
          for (var r = null; l !== null; )
            l.alternate !== null && (r = l), l = l.sibling;
          r === null ? n || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
      }
  }
  function $e(e) {
    var n = e.alternate !== null && e.alternate.child === e.child, l = 0, r = 0;
    if (n)
      for (var s = e.child; s !== null; )
        l |= s.lanes | s.childLanes, r |= s.subtreeFlags & 65011712, r |= s.flags & 65011712, s.return = e, s = s.sibling;
    else
      for (s = e.child; s !== null; )
        l |= s.lanes | s.childLanes, r |= s.subtreeFlags, r |= s.flags, s.return = e, s = s.sibling;
    return e.subtreeFlags |= r, e.childLanes = l, n;
  }
  function Jv(e, n, l) {
    var r = n.pendingProps;
    switch (so(n), n.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return $e(n), null;
      case 1:
        return $e(n), null;
      case 3:
        return l = n.stateNode, r = null, e !== null && (r = e.memoizedState.cache), n.memoizedState.cache !== r && (n.flags |= 2048), qn(rt), at(), l.pendingContext && (l.context = l.pendingContext, l.pendingContext = null), (e === null || e.child === null) && (_l(n) ? Vn(n) : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, co())), $e(n), null;
      case 26:
        var s = n.type, c = n.memoizedState;
        return e === null ? (Vn(n), c !== null ? ($e(n), Dm(n, c)) : ($e(n), tc(
          n,
          s,
          null,
          r,
          l
        ))) : c ? c !== e.memoizedState ? (Vn(n), $e(n), Dm(n, c)) : ($e(n), n.flags &= -16777217) : (e = e.memoizedProps, e !== r && Vn(n), $e(n), tc(
          n,
          s,
          e,
          r,
          l
        )), null;
      case 27:
        if (_r(n), l = se.current, s = n.type, e !== null && n.stateNode != null)
          e.memoizedProps !== r && Vn(n);
        else {
          if (!r) {
            if (n.stateNode === null)
              throw Error(u(166));
            return $e(n), null;
          }
          e = B.current, _l(n) ? d1(n) : (e = Ih(s, r, l), n.stateNode = e, Vn(n));
        }
        return $e(n), null;
      case 5:
        if (_r(n), s = n.type, e !== null && n.stateNode != null)
          e.memoizedProps !== r && Vn(n);
        else {
          if (!r) {
            if (n.stateNode === null)
              throw Error(u(166));
            return $e(n), null;
          }
          if (c = B.current, _l(n))
            d1(n);
          else {
            var d = Bu(
              se.current
            );
            switch (c) {
              case 1:
                c = d.createElementNS(
                  "http://www.w3.org/2000/svg",
                  s
                );
                break;
              case 2:
                c = d.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  s
                );
                break;
              default:
                switch (s) {
                  case "svg":
                    c = d.createElementNS(
                      "http://www.w3.org/2000/svg",
                      s
                    );
                    break;
                  case "math":
                    c = d.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      s
                    );
                    break;
                  case "script":
                    c = d.createElement("div"), c.innerHTML = "<script><\/script>", c = c.removeChild(
                      c.firstChild
                    );
                    break;
                  case "select":
                    c = typeof r.is == "string" ? d.createElement("select", {
                      is: r.is
                    }) : d.createElement("select"), r.multiple ? c.multiple = !0 : r.size && (c.size = r.size);
                    break;
                  default:
                    c = typeof r.is == "string" ? d.createElement(s, { is: r.is }) : d.createElement(s);
                }
            }
            c[St] = n, c[wt] = r;
            e: for (d = n.child; d !== null; ) {
              if (d.tag === 5 || d.tag === 6)
                c.appendChild(d.stateNode);
              else if (d.tag !== 4 && d.tag !== 27 && d.child !== null) {
                d.child.return = d, d = d.child;
                continue;
              }
              if (d === n) break e;
              for (; d.sibling === null; ) {
                if (d.return === null || d.return === n)
                  break e;
                d = d.return;
              }
              d.sibling.return = d.return, d = d.sibling;
            }
            n.stateNode = c;
            e: switch (At(c, s, r), s) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
            r && Vn(n);
          }
        }
        return $e(n), tc(
          n,
          n.type,
          e === null ? null : e.memoizedProps,
          n.pendingProps,
          l
        ), null;
      case 6:
        if (e && n.stateNode != null)
          e.memoizedProps !== r && Vn(n);
        else {
          if (typeof r != "string" && n.stateNode === null)
            throw Error(u(166));
          if (e = se.current, _l(n)) {
            if (e = n.stateNode, l = n.memoizedProps, r = null, s = xt, s !== null)
              switch (s.tag) {
                case 27:
                case 5:
                  r = s.memoizedProps;
              }
            e[St] = n, e = !!(e.nodeValue === l || r !== null && r.suppressHydrationWarning === !0 || Oh(e.nodeValue, l)), e || ha(n, !0);
          } else
            e = Bu(e).createTextNode(
              r
            ), e[St] = n, n.stateNode = e;
        }
        return $e(n), null;
      case 31:
        if (l = n.memoizedState, e === null || e.memoizedState !== null) {
          if (r = _l(n), l !== null) {
            if (e === null) {
              if (!r) throw Error(u(318));
              if (e = n.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(557));
              e[St] = n;
            } else
              Pa(), (n.flags & 128) === 0 && (n.memoizedState = null), n.flags |= 4;
            $e(n), e = !1;
          } else
            l = co(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = l), e = !0;
          if (!e)
            return n.flags & 256 ? (Zt(n), n) : (Zt(n), null);
          if ((n.flags & 128) !== 0)
            throw Error(u(558));
        }
        return $e(n), null;
      case 13:
        if (r = n.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (s = _l(n), r !== null && r.dehydrated !== null) {
            if (e === null) {
              if (!s) throw Error(u(318));
              if (s = n.memoizedState, s = s !== null ? s.dehydrated : null, !s) throw Error(u(317));
              s[St] = n;
            } else
              Pa(), (n.flags & 128) === 0 && (n.memoizedState = null), n.flags |= 4;
            $e(n), s = !1;
          } else
            s = co(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s), s = !0;
          if (!s)
            return n.flags & 256 ? (Zt(n), n) : (Zt(n), null);
        }
        return Zt(n), (n.flags & 128) !== 0 ? (n.lanes = l, n) : (l = r !== null, e = e !== null && e.memoizedState !== null, l && (r = n.child, s = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (s = r.alternate.memoizedState.cachePool.pool), c = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (c = r.memoizedState.cachePool.pool), c !== s && (r.flags |= 2048)), l !== e && l && (n.child.flags |= 8192), Eu(n, n.updateQueue), $e(n), null);
      case 4:
        return at(), e === null && Tc(n.stateNode.containerInfo), $e(n), null;
      case 10:
        return qn(n.type), $e(n), null;
      case 19:
        if (z(lt), r = n.memoizedState, r === null) return $e(n), null;
        if (s = (n.flags & 128) !== 0, c = r.rendering, c === null)
          if (s) $i(r, !1);
          else {
            if (et !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = n.child; e !== null; ) {
                if (c = fu(e), c !== null) {
                  for (n.flags |= 128, $i(r, !1), e = c.updateQueue, n.updateQueue = e, Eu(n, e), n.subtreeFlags = 0, e = l, l = n.child; l !== null; )
                    u1(l, e), l = l.sibling;
                  return F(
                    lt,
                    lt.current & 1 | 2
                  ), ve && Bn(n, r.treeForkCount), n.child;
                }
                e = e.sibling;
              }
            r.tail !== null && Ft() > Ou && (n.flags |= 128, s = !0, $i(r, !1), n.lanes = 4194304);
          }
        else {
          if (!s)
            if (e = fu(c), e !== null) {
              if (n.flags |= 128, s = !0, e = e.updateQueue, n.updateQueue = e, Eu(n, e), $i(r, !0), r.tail === null && r.tailMode === "hidden" && !c.alternate && !ve)
                return $e(n), null;
            } else
              2 * Ft() - r.renderingStartTime > Ou && l !== 536870912 && (n.flags |= 128, s = !0, $i(r, !1), n.lanes = 4194304);
          r.isBackwards ? (c.sibling = n.child, n.child = c) : (e = r.last, e !== null ? e.sibling = c : n.child = c, r.last = c);
        }
        return r.tail !== null ? (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ft(), e.sibling = null, l = lt.current, F(
          lt,
          s ? l & 1 | 2 : l & 1
        ), ve && Bn(n, r.treeForkCount), e) : ($e(n), null);
      case 22:
      case 23:
        return Zt(n), Eo(), r = n.memoizedState !== null, e !== null ? e.memoizedState !== null !== r && (n.flags |= 8192) : r && (n.flags |= 8192), r ? (l & 536870912) !== 0 && (n.flags & 128) === 0 && ($e(n), n.subtreeFlags & 6 && (n.flags |= 8192)) : $e(n), l = n.updateQueue, l !== null && Eu(n, l.retryQueue), l = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (l = e.memoizedState.cachePool.pool), r = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (r = n.memoizedState.cachePool.pool), r !== l && (n.flags |= 2048), e !== null && z(el), null;
      case 24:
        return l = null, e !== null && (l = e.memoizedState.cache), n.memoizedState.cache !== l && (n.flags |= 2048), qn(rt), $e(n), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(u(156, n.tag));
  }
  function Wv(e, n) {
    switch (so(n), n.tag) {
      case 1:
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return qn(rt), at(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 26:
      case 27:
      case 5:
        return _r(n), null;
      case 31:
        if (n.memoizedState !== null) {
          if (Zt(n), n.alternate === null)
            throw Error(u(340));
          Pa();
        }
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 13:
        if (Zt(n), e = n.memoizedState, e !== null && e.dehydrated !== null) {
          if (n.alternate === null)
            throw Error(u(340));
          Pa();
        }
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 19:
        return z(lt), null;
      case 4:
        return at(), null;
      case 10:
        return qn(n.type), null;
      case 22:
      case 23:
        return Zt(n), Eo(), e !== null && z(el), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 24:
        return qn(rt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function zm(e, n) {
    switch (so(n), n.tag) {
      case 3:
        qn(rt), at();
        break;
      case 26:
      case 27:
      case 5:
        _r(n);
        break;
      case 4:
        at();
        break;
      case 31:
        n.memoizedState !== null && Zt(n);
        break;
      case 13:
        Zt(n);
        break;
      case 19:
        z(lt);
        break;
      case 10:
        qn(n.type);
        break;
      case 22:
      case 23:
        Zt(n), Eo(), e !== null && z(el);
        break;
      case 24:
        qn(rt);
    }
  }
  function Vi(e, n) {
    try {
      var l = n.updateQueue, r = l !== null ? l.lastEffect : null;
      if (r !== null) {
        var s = r.next;
        l = s;
        do {
          if ((l.tag & e) === e) {
            r = void 0;
            var c = l.create, d = l.inst;
            r = c(), d.destroy = r;
          }
          l = l.next;
        } while (l !== s);
      }
    } catch (v) {
      we(n, n.return, v);
    }
  }
  function Sa(e, n, l) {
    try {
      var r = n.updateQueue, s = r !== null ? r.lastEffect : null;
      if (s !== null) {
        var c = s.next;
        r = c;
        do {
          if ((r.tag & e) === e) {
            var d = r.inst, v = d.destroy;
            if (v !== void 0) {
              d.destroy = void 0, s = n;
              var S = l, M = v;
              try {
                M();
              } catch (D) {
                we(
                  s,
                  S,
                  D
                );
              }
            }
          }
          r = r.next;
        } while (r !== c);
      }
    } catch (D) {
      we(n, n.return, D);
    }
  }
  function _m(e) {
    var n = e.updateQueue;
    if (n !== null) {
      var l = e.stateNode;
      try {
        A1(n, l);
      } catch (r) {
        we(e, e.return, r);
      }
    }
  }
  function km(e, n, l) {
    l.props = il(
      e.type,
      e.memoizedProps
    ), l.state = e.memoizedState;
    try {
      l.componentWillUnmount();
    } catch (r) {
      we(e, n, r);
    }
  }
  function Ki(e, n) {
    try {
      var l = e.ref;
      if (l !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var r = e.stateNode;
            break;
          case 30:
            r = e.stateNode;
            break;
          default:
            r = e.stateNode;
        }
        typeof l == "function" ? e.refCleanup = l(r) : l.current = r;
      }
    } catch (s) {
      we(e, n, s);
    }
  }
  function jn(e, n) {
    var l = e.ref, r = e.refCleanup;
    if (l !== null)
      if (typeof r == "function")
        try {
          r();
        } catch (s) {
          we(e, n, s);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof l == "function")
        try {
          l(null);
        } catch (s) {
          we(e, n, s);
        }
      else l.current = null;
  }
  function Um(e) {
    var n = e.type, l = e.memoizedProps, r = e.stateNode;
    try {
      e: switch (n) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          l.autoFocus && r.focus();
          break e;
        case "img":
          l.src ? r.src = l.src : l.srcSet && (r.srcset = l.srcSet);
      }
    } catch (s) {
      we(e, e.return, s);
    }
  }
  function nc(e, n, l) {
    try {
      var r = e.stateNode;
      Sy(r, e.type, l, n), r[wt] = n;
    } catch (s) {
      we(e, e.return, s);
    }
  }
  function Hm(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Na(e.type) || e.tag === 4;
  }
  function ac(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Hm(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && Na(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function lc(e, n, l) {
    var r = e.tag;
    if (r === 5 || r === 6)
      e = e.stateNode, n ? (l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l).insertBefore(e, n) : (n = l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l, n.appendChild(e), l = l._reactRootContainer, l != null || n.onclick !== null || (n.onclick = kn));
    else if (r !== 4 && (r === 27 && Na(e.type) && (l = e.stateNode, n = null), e = e.child, e !== null))
      for (lc(e, n, l), e = e.sibling; e !== null; )
        lc(e, n, l), e = e.sibling;
  }
  function Au(e, n, l) {
    var r = e.tag;
    if (r === 5 || r === 6)
      e = e.stateNode, n ? l.insertBefore(e, n) : l.appendChild(e);
    else if (r !== 4 && (r === 27 && Na(e.type) && (l = e.stateNode), e = e.child, e !== null))
      for (Au(e, n, l), e = e.sibling; e !== null; )
        Au(e, n, l), e = e.sibling;
  }
  function Bm(e) {
    var n = e.stateNode, l = e.memoizedProps;
    try {
      for (var r = e.type, s = n.attributes; s.length; )
        n.removeAttributeNode(s[0]);
      At(n, r, l), n[St] = e, n[wt] = l;
    } catch (c) {
      we(e, e.return, c);
    }
  }
  var Kn = !1, ot = !1, ic = !1, Im = typeof WeakSet == "function" ? WeakSet : Set, vt = null;
  function ey(e, n) {
    if (e = e.containerInfo, jc = Ku, e = Jd(e), Ps(e)) {
      if ("selectionStart" in e)
        var l = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          l = (l = e.ownerDocument) && l.defaultView || window;
          var r = l.getSelection && l.getSelection();
          if (r && r.rangeCount !== 0) {
            l = r.anchorNode;
            var s = r.anchorOffset, c = r.focusNode;
            r = r.focusOffset;
            try {
              l.nodeType, c.nodeType;
            } catch {
              l = null;
              break e;
            }
            var d = 0, v = -1, S = -1, M = 0, D = 0, k = e, N = null;
            t: for (; ; ) {
              for (var L; k !== l || s !== 0 && k.nodeType !== 3 || (v = d + s), k !== c || r !== 0 && k.nodeType !== 3 || (S = d + r), k.nodeType === 3 && (d += k.nodeValue.length), (L = k.firstChild) !== null; )
                N = k, k = L;
              for (; ; ) {
                if (k === e) break t;
                if (N === l && ++M === s && (v = d), N === c && ++D === r && (S = d), (L = k.nextSibling) !== null) break;
                k = N, N = k.parentNode;
              }
              k = L;
            }
            l = v === -1 || S === -1 ? null : { start: v, end: S };
          } else l = null;
        }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (Mc = { focusedElem: e, selectionRange: l }, Ku = !1, vt = n; vt !== null; )
      if (n = vt, e = n.child, (n.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = n, vt = e;
      else
        for (; vt !== null; ) {
          switch (n = vt, c = n.alternate, e = n.flags, n.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = n.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (l = 0; l < e.length; l++)
                  s = e[l], s.ref.impl = s.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && c !== null) {
                e = void 0, l = n, s = c.memoizedProps, c = c.memoizedState, r = l.stateNode;
                try {
                  var V = il(
                    l.type,
                    s
                  );
                  e = r.getSnapshotBeforeUpdate(
                    V,
                    c
                  ), r.__reactInternalSnapshotBeforeUpdate = e;
                } catch (W) {
                  we(
                    l,
                    l.return,
                    W
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = n.stateNode.containerInfo, l = e.nodeType, l === 9)
                  Lc(e);
                else if (l === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Lc(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(u(163));
          }
          if (e = n.sibling, e !== null) {
            e.return = n.return, vt = e;
            break;
          }
          vt = n.return;
        }
  }
  function qm(e, n, l) {
    var r = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        Xn(e, l), r & 4 && Vi(5, l);
        break;
      case 1:
        if (Xn(e, l), r & 4)
          if (e = l.stateNode, n === null)
            try {
              e.componentDidMount();
            } catch (d) {
              we(l, l.return, d);
            }
          else {
            var s = il(
              l.type,
              n.memoizedProps
            );
            n = n.memoizedState;
            try {
              e.componentDidUpdate(
                s,
                n,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (d) {
              we(
                l,
                l.return,
                d
              );
            }
          }
        r & 64 && _m(l), r & 512 && Ki(l, l.return);
        break;
      case 3:
        if (Xn(e, l), r & 64 && (e = l.updateQueue, e !== null)) {
          if (n = null, l.child !== null)
            switch (l.child.tag) {
              case 27:
              case 5:
                n = l.child.stateNode;
                break;
              case 1:
                n = l.child.stateNode;
            }
          try {
            A1(e, n);
          } catch (d) {
            we(l, l.return, d);
          }
        }
        break;
      case 27:
        n === null && r & 4 && Bm(l);
      case 26:
      case 5:
        Xn(e, l), n === null && r & 4 && Um(l), r & 512 && Ki(l, l.return);
        break;
      case 12:
        Xn(e, l);
        break;
      case 31:
        Xn(e, l), r & 4 && $m(e, l);
        break;
      case 13:
        Xn(e, l), r & 4 && Vm(e, l), r & 64 && (e = l.memoizedState, e !== null && (e = e.dehydrated, e !== null && (l = oy.bind(
          null,
          l
        ), Oy(e, l))));
        break;
      case 22:
        if (r = l.memoizedState !== null || Kn, !r) {
          n = n !== null && n.memoizedState !== null || ot, s = Kn;
          var c = ot;
          Kn = r, (ot = n) && !c ? Zn(
            e,
            l,
            (l.subtreeFlags & 8772) !== 0
          ) : Xn(e, l), Kn = s, ot = c;
        }
        break;
      case 30:
        break;
      default:
        Xn(e, l);
    }
  }
  function Gm(e) {
    var n = e.alternate;
    n !== null && (e.alternate = null, Gm(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && zs(n)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Ze = null, zt = !1;
  function Yn(e, n, l) {
    for (l = l.child; l !== null; )
      Fm(e, n, l), l = l.sibling;
  }
  function Fm(e, n, l) {
    if ($t && typeof $t.onCommitFiberUnmount == "function")
      try {
        $t.onCommitFiberUnmount(gi, l);
      } catch {
      }
    switch (l.tag) {
      case 26:
        ot || jn(l, n), Yn(
          e,
          n,
          l
        ), l.memoizedState ? l.memoizedState.count-- : l.stateNode && (l = l.stateNode, l.parentNode.removeChild(l));
        break;
      case 27:
        ot || jn(l, n);
        var r = Ze, s = zt;
        Na(l.type) && (Ze = l.stateNode, zt = !1), Yn(
          e,
          n,
          l
        ), tr(l.stateNode), Ze = r, zt = s;
        break;
      case 5:
        ot || jn(l, n);
      case 6:
        if (r = Ze, s = zt, Ze = null, Yn(
          e,
          n,
          l
        ), Ze = r, zt = s, Ze !== null)
          if (zt)
            try {
              (Ze.nodeType === 9 ? Ze.body : Ze.nodeName === "HTML" ? Ze.ownerDocument.body : Ze).removeChild(l.stateNode);
            } catch (c) {
              we(
                l,
                n,
                c
              );
            }
          else
            try {
              Ze.removeChild(l.stateNode);
            } catch (c) {
              we(
                l,
                n,
                c
              );
            }
        break;
      case 18:
        Ze !== null && (zt ? (e = Ze, _h(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          l.stateNode
        ), ni(e)) : _h(Ze, l.stateNode));
        break;
      case 4:
        r = Ze, s = zt, Ze = l.stateNode.containerInfo, zt = !0, Yn(
          e,
          n,
          l
        ), Ze = r, zt = s;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Sa(2, l, n), ot || Sa(4, l, n), Yn(
          e,
          n,
          l
        );
        break;
      case 1:
        ot || (jn(l, n), r = l.stateNode, typeof r.componentWillUnmount == "function" && km(
          l,
          n,
          r
        )), Yn(
          e,
          n,
          l
        );
        break;
      case 21:
        Yn(
          e,
          n,
          l
        );
        break;
      case 22:
        ot = (r = ot) || l.memoizedState !== null, Yn(
          e,
          n,
          l
        ), ot = r;
        break;
      default:
        Yn(
          e,
          n,
          l
        );
    }
  }
  function $m(e, n) {
    if (n.memoizedState === null && (e = n.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        ni(e);
      } catch (l) {
        we(n, n.return, l);
      }
    }
  }
  function Vm(e, n) {
    if (n.memoizedState === null && (e = n.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        ni(e);
      } catch (l) {
        we(n, n.return, l);
      }
  }
  function ty(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var n = e.stateNode;
        return n === null && (n = e.stateNode = new Im()), n;
      case 22:
        return e = e.stateNode, n = e._retryCache, n === null && (n = e._retryCache = new Im()), n;
      default:
        throw Error(u(435, e.tag));
    }
  }
  function ju(e, n) {
    var l = ty(e);
    n.forEach(function(r) {
      if (!l.has(r)) {
        l.add(r);
        var s = cy.bind(null, e, r);
        r.then(s, s);
      }
    });
  }
  function _t(e, n) {
    var l = n.deletions;
    if (l !== null)
      for (var r = 0; r < l.length; r++) {
        var s = l[r], c = e, d = n, v = d;
        e: for (; v !== null; ) {
          switch (v.tag) {
            case 27:
              if (Na(v.type)) {
                Ze = v.stateNode, zt = !1;
                break e;
              }
              break;
            case 5:
              Ze = v.stateNode, zt = !1;
              break e;
            case 3:
            case 4:
              Ze = v.stateNode.containerInfo, zt = !0;
              break e;
          }
          v = v.return;
        }
        if (Ze === null) throw Error(u(160));
        Fm(c, d, s), Ze = null, zt = !1, c = s.alternate, c !== null && (c.return = null), s.return = null;
      }
    if (n.subtreeFlags & 13886)
      for (n = n.child; n !== null; )
        Km(n, e), n = n.sibling;
  }
  var vn = null;
  function Km(e, n) {
    var l = e.alternate, r = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        _t(n, e), kt(e), r & 4 && (Sa(3, e, e.return), Vi(3, e), Sa(5, e, e.return));
        break;
      case 1:
        _t(n, e), kt(e), r & 512 && (ot || l === null || jn(l, l.return)), r & 64 && Kn && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (l = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = l === null ? r : l.concat(r))));
        break;
      case 26:
        var s = vn;
        if (_t(n, e), kt(e), r & 512 && (ot || l === null || jn(l, l.return)), r & 4) {
          var c = l !== null ? l.memoizedState : null;
          if (r = e.memoizedState, l === null)
            if (r === null)
              if (e.stateNode === null) {
                e: {
                  r = e.type, l = e.memoizedProps, s = s.ownerDocument || s;
                  t: switch (r) {
                    case "title":
                      c = s.getElementsByTagName("title")[0], (!c || c[bi] || c[St] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = s.createElement(r), s.head.insertBefore(
                        c,
                        s.querySelector("head > title")
                      )), At(c, r, l), c[St] = e, gt(c), r = c;
                      break e;
                    case "link":
                      var d = Kh(
                        "link",
                        "href",
                        s
                      ).get(r + (l.href || ""));
                      if (d) {
                        for (var v = 0; v < d.length; v++)
                          if (c = d[v], c.getAttribute("href") === (l.href == null || l.href === "" ? null : l.href) && c.getAttribute("rel") === (l.rel == null ? null : l.rel) && c.getAttribute("title") === (l.title == null ? null : l.title) && c.getAttribute("crossorigin") === (l.crossOrigin == null ? null : l.crossOrigin)) {
                            d.splice(v, 1);
                            break t;
                          }
                      }
                      c = s.createElement(r), At(c, r, l), s.head.appendChild(c);
                      break;
                    case "meta":
                      if (d = Kh(
                        "meta",
                        "content",
                        s
                      ).get(r + (l.content || ""))) {
                        for (v = 0; v < d.length; v++)
                          if (c = d[v], c.getAttribute("content") === (l.content == null ? null : "" + l.content) && c.getAttribute("name") === (l.name == null ? null : l.name) && c.getAttribute("property") === (l.property == null ? null : l.property) && c.getAttribute("http-equiv") === (l.httpEquiv == null ? null : l.httpEquiv) && c.getAttribute("charset") === (l.charSet == null ? null : l.charSet)) {
                            d.splice(v, 1);
                            break t;
                          }
                      }
                      c = s.createElement(r), At(c, r, l), s.head.appendChild(c);
                      break;
                    default:
                      throw Error(u(468, r));
                  }
                  c[St] = e, gt(c), r = c;
                }
                e.stateNode = r;
              } else
                Yh(
                  s,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = Vh(
                s,
                r,
                e.memoizedProps
              );
          else
            c !== r ? (c === null ? l.stateNode !== null && (l = l.stateNode, l.parentNode.removeChild(l)) : c.count--, r === null ? Yh(
              s,
              e.type,
              e.stateNode
            ) : Vh(
              s,
              r,
              e.memoizedProps
            )) : r === null && e.stateNode !== null && nc(
              e,
              e.memoizedProps,
              l.memoizedProps
            );
        }
        break;
      case 27:
        _t(n, e), kt(e), r & 512 && (ot || l === null || jn(l, l.return)), l !== null && r & 4 && nc(
          e,
          e.memoizedProps,
          l.memoizedProps
        );
        break;
      case 5:
        if (_t(n, e), kt(e), r & 512 && (ot || l === null || jn(l, l.return)), e.flags & 32) {
          s = e.stateNode;
          try {
            Al(s, "");
          } catch (V) {
            we(e, e.return, V);
          }
        }
        r & 4 && e.stateNode != null && (s = e.memoizedProps, nc(
          e,
          s,
          l !== null ? l.memoizedProps : s
        )), r & 1024 && (ic = !0);
        break;
      case 6:
        if (_t(n, e), kt(e), r & 4) {
          if (e.stateNode === null)
            throw Error(u(162));
          r = e.memoizedProps, l = e.stateNode;
          try {
            l.nodeValue = r;
          } catch (V) {
            we(e, e.return, V);
          }
        }
        break;
      case 3:
        if (Gu = null, s = vn, vn = Iu(n.containerInfo), _t(n, e), vn = s, kt(e), r & 4 && l !== null && l.memoizedState.isDehydrated)
          try {
            ni(n.containerInfo);
          } catch (V) {
            we(e, e.return, V);
          }
        ic && (ic = !1, Ym(e));
        break;
      case 4:
        r = vn, vn = Iu(
          e.stateNode.containerInfo
        ), _t(n, e), kt(e), vn = r;
        break;
      case 12:
        _t(n, e), kt(e);
        break;
      case 31:
        _t(n, e), kt(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ju(e, r)));
        break;
      case 13:
        _t(n, e), kt(e), e.child.flags & 8192 && e.memoizedState !== null != (l !== null && l.memoizedState !== null) && (Nu = Ft()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ju(e, r)));
        break;
      case 22:
        s = e.memoizedState !== null;
        var S = l !== null && l.memoizedState !== null, M = Kn, D = ot;
        if (Kn = M || s, ot = D || S, _t(n, e), ot = D, Kn = M, kt(e), r & 8192)
          e: for (n = e.stateNode, n._visibility = s ? n._visibility & -2 : n._visibility | 1, s && (l === null || S || Kn || ot || rl(e)), l = null, n = e; ; ) {
            if (n.tag === 5 || n.tag === 26) {
              if (l === null) {
                S = l = n;
                try {
                  if (c = S.stateNode, s)
                    d = c.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none";
                  else {
                    v = S.stateNode;
                    var k = S.memoizedProps.style, N = k != null && k.hasOwnProperty("display") ? k.display : null;
                    v.style.display = N == null || typeof N == "boolean" ? "" : ("" + N).trim();
                  }
                } catch (V) {
                  we(S, S.return, V);
                }
              }
            } else if (n.tag === 6) {
              if (l === null) {
                S = n;
                try {
                  S.stateNode.nodeValue = s ? "" : S.memoizedProps;
                } catch (V) {
                  we(S, S.return, V);
                }
              }
            } else if (n.tag === 18) {
              if (l === null) {
                S = n;
                try {
                  var L = S.stateNode;
                  s ? kh(L, !0) : kh(S.stateNode, !1);
                } catch (V) {
                  we(S, S.return, V);
                }
              }
            } else if ((n.tag !== 22 && n.tag !== 23 || n.memoizedState === null || n === e) && n.child !== null) {
              n.child.return = n, n = n.child;
              continue;
            }
            if (n === e) break e;
            for (; n.sibling === null; ) {
              if (n.return === null || n.return === e) break e;
              l === n && (l = null), n = n.return;
            }
            l === n && (l = null), n.sibling.return = n.return, n = n.sibling;
          }
        r & 4 && (r = e.updateQueue, r !== null && (l = r.retryQueue, l !== null && (r.retryQueue = null, ju(e, l))));
        break;
      case 19:
        _t(n, e), kt(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ju(e, r)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        _t(n, e), kt(e);
    }
  }
  function kt(e) {
    var n = e.flags;
    if (n & 2) {
      try {
        for (var l, r = e.return; r !== null; ) {
          if (Hm(r)) {
            l = r;
            break;
          }
          r = r.return;
        }
        if (l == null) throw Error(u(160));
        switch (l.tag) {
          case 27:
            var s = l.stateNode, c = ac(e);
            Au(e, c, s);
            break;
          case 5:
            var d = l.stateNode;
            l.flags & 32 && (Al(d, ""), l.flags &= -33);
            var v = ac(e);
            Au(e, v, d);
            break;
          case 3:
          case 4:
            var S = l.stateNode.containerInfo, M = ac(e);
            lc(
              e,
              M,
              S
            );
            break;
          default:
            throw Error(u(161));
        }
      } catch (D) {
        we(e, e.return, D);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function Ym(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var n = e;
        Ym(n), n.tag === 5 && n.flags & 1024 && n.stateNode.reset(), e = e.sibling;
      }
  }
  function Xn(e, n) {
    if (n.subtreeFlags & 8772)
      for (n = n.child; n !== null; )
        qm(e, n.alternate, n), n = n.sibling;
  }
  function rl(e) {
    for (e = e.child; e !== null; ) {
      var n = e;
      switch (n.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Sa(4, n, n.return), rl(n);
          break;
        case 1:
          jn(n, n.return);
          var l = n.stateNode;
          typeof l.componentWillUnmount == "function" && km(
            n,
            n.return,
            l
          ), rl(n);
          break;
        case 27:
          tr(n.stateNode);
        case 26:
        case 5:
          jn(n, n.return), rl(n);
          break;
        case 22:
          n.memoizedState === null && rl(n);
          break;
        case 30:
          rl(n);
          break;
        default:
          rl(n);
      }
      e = e.sibling;
    }
  }
  function Zn(e, n, l) {
    for (l = l && (n.subtreeFlags & 8772) !== 0, n = n.child; n !== null; ) {
      var r = n.alternate, s = e, c = n, d = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          Zn(
            s,
            c,
            l
          ), Vi(4, c);
          break;
        case 1:
          if (Zn(
            s,
            c,
            l
          ), r = c, s = r.stateNode, typeof s.componentDidMount == "function")
            try {
              s.componentDidMount();
            } catch (M) {
              we(r, r.return, M);
            }
          if (r = c, s = r.updateQueue, s !== null) {
            var v = r.stateNode;
            try {
              var S = s.shared.hiddenCallbacks;
              if (S !== null)
                for (s.shared.hiddenCallbacks = null, s = 0; s < S.length; s++)
                  E1(S[s], v);
            } catch (M) {
              we(r, r.return, M);
            }
          }
          l && d & 64 && _m(c), Ki(c, c.return);
          break;
        case 27:
          Bm(c);
        case 26:
        case 5:
          Zn(
            s,
            c,
            l
          ), l && r === null && d & 4 && Um(c), Ki(c, c.return);
          break;
        case 12:
          Zn(
            s,
            c,
            l
          );
          break;
        case 31:
          Zn(
            s,
            c,
            l
          ), l && d & 4 && $m(s, c);
          break;
        case 13:
          Zn(
            s,
            c,
            l
          ), l && d & 4 && Vm(s, c);
          break;
        case 22:
          c.memoizedState === null && Zn(
            s,
            c,
            l
          ), Ki(c, c.return);
          break;
        case 30:
          break;
        default:
          Zn(
            s,
            c,
            l
          );
      }
      n = n.sibling;
    }
  }
  function rc(e, n) {
    var l = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (l = e.memoizedState.cachePool.pool), e = null, n.memoizedState !== null && n.memoizedState.cachePool !== null && (e = n.memoizedState.cachePool.pool), e !== l && (e != null && e.refCount++, l != null && wi(l));
  }
  function uc(e, n) {
    e = null, n.alternate !== null && (e = n.alternate.memoizedState.cache), n = n.memoizedState.cache, n !== e && (n.refCount++, e != null && wi(e));
  }
  function yn(e, n, l, r) {
    if (n.subtreeFlags & 10256)
      for (n = n.child; n !== null; )
        Xm(
          e,
          n,
          l,
          r
        ), n = n.sibling;
  }
  function Xm(e, n, l, r) {
    var s = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        yn(
          e,
          n,
          l,
          r
        ), s & 2048 && Vi(9, n);
        break;
      case 1:
        yn(
          e,
          n,
          l,
          r
        );
        break;
      case 3:
        yn(
          e,
          n,
          l,
          r
        ), s & 2048 && (e = null, n.alternate !== null && (e = n.alternate.memoizedState.cache), n = n.memoizedState.cache, n !== e && (n.refCount++, e != null && wi(e)));
        break;
      case 12:
        if (s & 2048) {
          yn(
            e,
            n,
            l,
            r
          ), e = n.stateNode;
          try {
            var c = n.memoizedProps, d = c.id, v = c.onPostCommit;
            typeof v == "function" && v(
              d,
              n.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (S) {
            we(n, n.return, S);
          }
        } else
          yn(
            e,
            n,
            l,
            r
          );
        break;
      case 31:
        yn(
          e,
          n,
          l,
          r
        );
        break;
      case 13:
        yn(
          e,
          n,
          l,
          r
        );
        break;
      case 23:
        break;
      case 22:
        c = n.stateNode, d = n.alternate, n.memoizedState !== null ? c._visibility & 2 ? yn(
          e,
          n,
          l,
          r
        ) : Yi(e, n) : c._visibility & 2 ? yn(
          e,
          n,
          l,
          r
        ) : (c._visibility |= 2, Vl(
          e,
          n,
          l,
          r,
          (n.subtreeFlags & 10256) !== 0 || !1
        )), s & 2048 && rc(d, n);
        break;
      case 24:
        yn(
          e,
          n,
          l,
          r
        ), s & 2048 && uc(n.alternate, n);
        break;
      default:
        yn(
          e,
          n,
          l,
          r
        );
    }
  }
  function Vl(e, n, l, r, s) {
    for (s = s && ((n.subtreeFlags & 10256) !== 0 || !1), n = n.child; n !== null; ) {
      var c = e, d = n, v = l, S = r, M = d.flags;
      switch (d.tag) {
        case 0:
        case 11:
        case 15:
          Vl(
            c,
            d,
            v,
            S,
            s
          ), Vi(8, d);
          break;
        case 23:
          break;
        case 22:
          var D = d.stateNode;
          d.memoizedState !== null ? D._visibility & 2 ? Vl(
            c,
            d,
            v,
            S,
            s
          ) : Yi(
            c,
            d
          ) : (D._visibility |= 2, Vl(
            c,
            d,
            v,
            S,
            s
          )), s && M & 2048 && rc(
            d.alternate,
            d
          );
          break;
        case 24:
          Vl(
            c,
            d,
            v,
            S,
            s
          ), s && M & 2048 && uc(d.alternate, d);
          break;
        default:
          Vl(
            c,
            d,
            v,
            S,
            s
          );
      }
      n = n.sibling;
    }
  }
  function Yi(e, n) {
    if (n.subtreeFlags & 10256)
      for (n = n.child; n !== null; ) {
        var l = e, r = n, s = r.flags;
        switch (r.tag) {
          case 22:
            Yi(l, r), s & 2048 && rc(
              r.alternate,
              r
            );
            break;
          case 24:
            Yi(l, r), s & 2048 && uc(r.alternate, r);
            break;
          default:
            Yi(l, r);
        }
        n = n.sibling;
      }
  }
  var Xi = 8192;
  function Kl(e, n, l) {
    if (e.subtreeFlags & Xi)
      for (e = e.child; e !== null; )
        Zm(
          e,
          n,
          l
        ), e = e.sibling;
  }
  function Zm(e, n, l) {
    switch (e.tag) {
      case 26:
        Kl(
          e,
          n,
          l
        ), e.flags & Xi && e.memoizedState !== null && qy(
          l,
          vn,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        Kl(
          e,
          n,
          l
        );
        break;
      case 3:
      case 4:
        var r = vn;
        vn = Iu(e.stateNode.containerInfo), Kl(
          e,
          n,
          l
        ), vn = r;
        break;
      case 22:
        e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Xi, Xi = 16777216, Kl(
          e,
          n,
          l
        ), Xi = r) : Kl(
          e,
          n,
          l
        ));
        break;
      default:
        Kl(
          e,
          n,
          l
        );
    }
  }
  function Qm(e) {
    var n = e.alternate;
    if (n !== null && (e = n.child, e !== null)) {
      n.child = null;
      do
        n = e.sibling, e.sibling = null, e = n;
      while (e !== null);
    }
  }
  function Zi(e) {
    var n = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (n !== null)
        for (var l = 0; l < n.length; l++) {
          var r = n[l];
          vt = r, Jm(
            r,
            e
          );
        }
      Qm(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        Pm(e), e = e.sibling;
  }
  function Pm(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        Zi(e), e.flags & 2048 && Sa(9, e, e.return);
        break;
      case 3:
        Zi(e);
        break;
      case 12:
        Zi(e);
        break;
      case 22:
        var n = e.stateNode;
        e.memoizedState !== null && n._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (n._visibility &= -3, Mu(e)) : Zi(e);
        break;
      default:
        Zi(e);
    }
  }
  function Mu(e) {
    var n = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (n !== null)
        for (var l = 0; l < n.length; l++) {
          var r = n[l];
          vt = r, Jm(
            r,
            e
          );
        }
      Qm(e);
    }
    for (e = e.child; e !== null; ) {
      switch (n = e, n.tag) {
        case 0:
        case 11:
        case 15:
          Sa(8, n, n.return), Mu(n);
          break;
        case 22:
          l = n.stateNode, l._visibility & 2 && (l._visibility &= -3, Mu(n));
          break;
        default:
          Mu(n);
      }
      e = e.sibling;
    }
  }
  function Jm(e, n) {
    for (; vt !== null; ) {
      var l = vt;
      switch (l.tag) {
        case 0:
        case 11:
        case 15:
          Sa(8, l, n);
          break;
        case 23:
        case 22:
          if (l.memoizedState !== null && l.memoizedState.cachePool !== null) {
            var r = l.memoizedState.cachePool.pool;
            r != null && r.refCount++;
          }
          break;
        case 24:
          wi(l.memoizedState.cache);
      }
      if (r = l.child, r !== null) r.return = l, vt = r;
      else
        e: for (l = e; vt !== null; ) {
          r = vt;
          var s = r.sibling, c = r.return;
          if (Gm(r), r === l) {
            vt = null;
            break e;
          }
          if (s !== null) {
            s.return = c, vt = s;
            break e;
          }
          vt = c;
        }
    }
  }
  var ny = {
    getCacheForType: function(e) {
      var n = Tt(rt), l = n.data.get(e);
      return l === void 0 && (l = e(), n.data.set(e, l)), l;
    },
    cacheSignal: function() {
      return Tt(rt).controller.signal;
    }
  }, ay = typeof WeakMap == "function" ? WeakMap : Map, Ne = 0, Be = null, ce = null, me = 0, Re = 0, Qt = null, xa = !1, Yl = !1, sc = !1, Qn = 0, et = 0, Ta = 0, ul = 0, oc = 0, Pt = 0, Xl = 0, Qi = null, Ut = null, cc = !1, Nu = 0, Wm = 0, Ou = 1 / 0, Lu = null, Ea = null, dt = 0, Aa = null, Zl = null, Pn = 0, fc = 0, dc = null, eh = null, Pi = 0, mc = null;
  function Jt() {
    return (Ne & 2) !== 0 && me !== 0 ? me & -me : w.T !== null ? bc() : gd();
  }
  function th() {
    if (Pt === 0)
      if ((me & 536870912) === 0 || ve) {
        var e = Hr;
        Hr <<= 1, (Hr & 3932160) === 0 && (Hr = 262144), Pt = e;
      } else Pt = 536870912;
    return e = Xt.current, e !== null && (e.flags |= 32), Pt;
  }
  function Ht(e, n, l) {
    (e === Be && (Re === 2 || Re === 9) || e.cancelPendingCommit !== null) && (Ql(e, 0), ja(
      e,
      me,
      Pt,
      !1
    )), yi(e, l), ((Ne & 2) === 0 || e !== Be) && (e === Be && ((Ne & 2) === 0 && (ul |= l), et === 4 && ja(
      e,
      me,
      Pt,
      !1
    )), Mn(e));
  }
  function nh(e, n, l) {
    if ((Ne & 6) !== 0) throw Error(u(327));
    var r = !l && (n & 127) === 0 && (n & e.expiredLanes) === 0 || vi(e, n), s = r ? ry(e, n) : pc(e, n, !0), c = r;
    do {
      if (s === 0) {
        Yl && !r && ja(e, n, 0, !1);
        break;
      } else {
        if (l = e.current.alternate, c && !ly(l)) {
          s = pc(e, n, !1), c = !1;
          continue;
        }
        if (s === 2) {
          if (c = n, e.errorRecoveryDisabledLanes & c)
            var d = 0;
          else
            d = e.pendingLanes & -536870913, d = d !== 0 ? d : d & 536870912 ? 536870912 : 0;
          if (d !== 0) {
            n = d;
            e: {
              var v = e;
              s = Qi;
              var S = v.current.memoizedState.isDehydrated;
              if (S && (Ql(v, d).flags |= 256), d = pc(
                v,
                d,
                !1
              ), d !== 2) {
                if (sc && !S) {
                  v.errorRecoveryDisabledLanes |= c, ul |= c, s = 4;
                  break e;
                }
                c = Ut, Ut = s, c !== null && (Ut === null ? Ut = c : Ut.push.apply(
                  Ut,
                  c
                ));
              }
              s = d;
            }
            if (c = !1, s !== 2) continue;
          }
        }
        if (s === 1) {
          Ql(e, 0), ja(e, n, 0, !0);
          break;
        }
        e: {
          switch (r = e, c = s, c) {
            case 0:
            case 1:
              throw Error(u(345));
            case 4:
              if ((n & 4194048) !== n) break;
            case 6:
              ja(
                r,
                n,
                Pt,
                !xa
              );
              break e;
            case 2:
              Ut = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(u(329));
          }
          if ((n & 62914560) === n && (s = Nu + 300 - Ft(), 10 < s)) {
            if (ja(
              r,
              n,
              Pt,
              !xa
            ), Ir(r, 0, !0) !== 0) break e;
            Pn = n, r.timeoutHandle = Dh(
              ah.bind(
                null,
                r,
                l,
                Ut,
                Lu,
                cc,
                n,
                Pt,
                ul,
                Xl,
                xa,
                c,
                "Throttled",
                -0,
                0
              ),
              s
            );
            break e;
          }
          ah(
            r,
            l,
            Ut,
            Lu,
            cc,
            n,
            Pt,
            ul,
            Xl,
            xa,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Mn(e);
  }
  function ah(e, n, l, r, s, c, d, v, S, M, D, k, N, L) {
    if (e.timeoutHandle = -1, k = n.subtreeFlags, k & 8192 || (k & 16785408) === 16785408) {
      k = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: kn
      }, Zm(
        n,
        c,
        k
      );
      var V = (c & 62914560) === c ? Nu - Ft() : (c & 4194048) === c ? Wm - Ft() : 0;
      if (V = Gy(
        k,
        V
      ), V !== null) {
        Pn = c, e.cancelPendingCommit = V(
          fh.bind(
            null,
            e,
            n,
            c,
            l,
            r,
            s,
            d,
            v,
            S,
            D,
            k,
            null,
            N,
            L
          )
        ), ja(e, c, d, !M);
        return;
      }
    }
    fh(
      e,
      n,
      c,
      l,
      r,
      s,
      d,
      v,
      S
    );
  }
  function ly(e) {
    for (var n = e; ; ) {
      var l = n.tag;
      if ((l === 0 || l === 11 || l === 15) && n.flags & 16384 && (l = n.updateQueue, l !== null && (l = l.stores, l !== null)))
        for (var r = 0; r < l.length; r++) {
          var s = l[r], c = s.getSnapshot;
          s = s.value;
          try {
            if (!Kt(c(), s)) return !1;
          } catch {
            return !1;
          }
        }
      if (l = n.child, n.subtreeFlags & 16384 && l !== null)
        l.return = n, n = l;
      else {
        if (n === e) break;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === e) return !0;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
    }
    return !0;
  }
  function ja(e, n, l, r) {
    n &= ~oc, n &= ~ul, e.suspendedLanes |= n, e.pingedLanes &= ~n, r && (e.warmLanes |= n), r = e.expirationTimes;
    for (var s = n; 0 < s; ) {
      var c = 31 - Vt(s), d = 1 << c;
      r[c] = -1, s &= ~d;
    }
    l !== 0 && md(e, l, n);
  }
  function Ru() {
    return (Ne & 6) === 0 ? (Ji(0), !1) : !0;
  }
  function hc() {
    if (ce !== null) {
      if (Re === 0)
        var e = ce.return;
      else
        e = ce, In = Ja = null, Lo(e), Il = null, zi = 0, e = ce;
      for (; e !== null; )
        zm(e.alternate, e), e = e.return;
      ce = null;
    }
  }
  function Ql(e, n) {
    var l = e.timeoutHandle;
    l !== -1 && (e.timeoutHandle = -1, Ey(l)), l = e.cancelPendingCommit, l !== null && (e.cancelPendingCommit = null, l()), Pn = 0, hc(), Be = e, ce = l = Hn(e.current, null), me = n, Re = 0, Qt = null, xa = !1, Yl = vi(e, n), sc = !1, Xl = Pt = oc = ul = Ta = et = 0, Ut = Qi = null, cc = !1, (n & 8) !== 0 && (n |= n & 32);
    var r = e.entangledLanes;
    if (r !== 0)
      for (e = e.entanglements, r &= n; 0 < r; ) {
        var s = 31 - Vt(r), c = 1 << s;
        n |= e[s], r &= ~c;
      }
    return Qn = n, Jr(), l;
  }
  function lh(e, n) {
    re = null, w.H = Gi, n === Bl || n === ru ? (n = C1(), Re = 3) : n === yo ? (n = C1(), Re = 4) : Re = n === Ko ? 8 : n !== null && typeof n == "object" && typeof n.then == "function" ? 6 : 1, Qt = n, ce === null && (et = 1, Cu(
      e,
      an(n, e.current)
    ));
  }
  function ih() {
    var e = Xt.current;
    return e === null ? !0 : (me & 4194048) === me ? sn === null : (me & 62914560) === me || (me & 536870912) !== 0 ? e === sn : !1;
  }
  function rh() {
    var e = w.H;
    return w.H = Gi, e === null ? Gi : e;
  }
  function uh() {
    var e = w.A;
    return w.A = ny, e;
  }
  function wu() {
    et = 4, xa || (me & 4194048) !== me && Xt.current !== null || (Yl = !0), (Ta & 134217727) === 0 && (ul & 134217727) === 0 || Be === null || ja(
      Be,
      me,
      Pt,
      !1
    );
  }
  function pc(e, n, l) {
    var r = Ne;
    Ne |= 2;
    var s = rh(), c = uh();
    (Be !== e || me !== n) && (Lu = null, Ql(e, n)), n = !1;
    var d = et;
    e: do
      try {
        if (Re !== 0 && ce !== null) {
          var v = ce, S = Qt;
          switch (Re) {
            case 8:
              hc(), d = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Xt.current === null && (n = !0);
              var M = Re;
              if (Re = 0, Qt = null, Pl(e, v, S, M), l && Yl) {
                d = 0;
                break e;
              }
              break;
            default:
              M = Re, Re = 0, Qt = null, Pl(e, v, S, M);
          }
        }
        iy(), d = et;
        break;
      } catch (D) {
        lh(e, D);
      }
    while (!0);
    return n && e.shellSuspendCounter++, In = Ja = null, Ne = r, w.H = s, w.A = c, ce === null && (Be = null, me = 0, Jr()), d;
  }
  function iy() {
    for (; ce !== null; ) sh(ce);
  }
  function ry(e, n) {
    var l = Ne;
    Ne |= 2;
    var r = rh(), s = uh();
    Be !== e || me !== n ? (Lu = null, Ou = Ft() + 500, Ql(e, n)) : Yl = vi(
      e,
      n
    );
    e: do
      try {
        if (Re !== 0 && ce !== null) {
          n = ce;
          var c = Qt;
          t: switch (Re) {
            case 1:
              Re = 0, Qt = null, Pl(e, n, c, 1);
              break;
            case 2:
            case 9:
              if (y1(c)) {
                Re = 0, Qt = null, oh(n);
                break;
              }
              n = function() {
                Re !== 2 && Re !== 9 || Be !== e || (Re = 7), Mn(e);
              }, c.then(n, n);
              break e;
            case 3:
              Re = 7;
              break e;
            case 4:
              Re = 5;
              break e;
            case 7:
              y1(c) ? (Re = 0, Qt = null, oh(n)) : (Re = 0, Qt = null, Pl(e, n, c, 7));
              break;
            case 5:
              var d = null;
              switch (ce.tag) {
                case 26:
                  d = ce.memoizedState;
                case 5:
                case 27:
                  var v = ce;
                  if (d ? Xh(d) : v.stateNode.complete) {
                    Re = 0, Qt = null;
                    var S = v.sibling;
                    if (S !== null) ce = S;
                    else {
                      var M = v.return;
                      M !== null ? (ce = M, Du(M)) : ce = null;
                    }
                    break t;
                  }
              }
              Re = 0, Qt = null, Pl(e, n, c, 5);
              break;
            case 6:
              Re = 0, Qt = null, Pl(e, n, c, 6);
              break;
            case 8:
              hc(), et = 6;
              break e;
            default:
              throw Error(u(462));
          }
        }
        uy();
        break;
      } catch (D) {
        lh(e, D);
      }
    while (!0);
    return In = Ja = null, w.H = r, w.A = s, Ne = l, ce !== null ? 0 : (Be = null, me = 0, Jr(), et);
  }
  function uy() {
    for (; ce !== null && !L2(); )
      sh(ce);
  }
  function sh(e) {
    var n = wm(e.alternate, e, Qn);
    e.memoizedProps = e.pendingProps, n === null ? Du(e) : ce = n;
  }
  function oh(e) {
    var n = e, l = n.alternate;
    switch (n.tag) {
      case 15:
      case 0:
        n = jm(
          l,
          n,
          n.pendingProps,
          n.type,
          void 0,
          me
        );
        break;
      case 11:
        n = jm(
          l,
          n,
          n.pendingProps,
          n.type.render,
          n.ref,
          me
        );
        break;
      case 5:
        Lo(n);
      default:
        zm(l, n), n = ce = u1(n, Qn), n = wm(l, n, Qn);
    }
    e.memoizedProps = e.pendingProps, n === null ? Du(e) : ce = n;
  }
  function Pl(e, n, l, r) {
    In = Ja = null, Lo(n), Il = null, zi = 0;
    var s = n.return;
    try {
      if (Zv(
        e,
        s,
        n,
        l,
        me
      )) {
        et = 1, Cu(
          e,
          an(l, e.current)
        ), ce = null;
        return;
      }
    } catch (c) {
      if (s !== null) throw ce = s, c;
      et = 1, Cu(
        e,
        an(l, e.current)
      ), ce = null;
      return;
    }
    n.flags & 32768 ? (ve || r === 1 ? e = !0 : Yl || (me & 536870912) !== 0 ? e = !1 : (xa = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Xt.current, r !== null && r.tag === 13 && (r.flags |= 16384))), ch(n, e)) : Du(n);
  }
  function Du(e) {
    var n = e;
    do {
      if ((n.flags & 32768) !== 0) {
        ch(
          n,
          xa
        );
        return;
      }
      e = n.return;
      var l = Jv(
        n.alternate,
        n,
        Qn
      );
      if (l !== null) {
        ce = l;
        return;
      }
      if (n = n.sibling, n !== null) {
        ce = n;
        return;
      }
      ce = n = e;
    } while (n !== null);
    et === 0 && (et = 5);
  }
  function ch(e, n) {
    do {
      var l = Wv(e.alternate, e);
      if (l !== null) {
        l.flags &= 32767, ce = l;
        return;
      }
      if (l = e.return, l !== null && (l.flags |= 32768, l.subtreeFlags = 0, l.deletions = null), !n && (e = e.sibling, e !== null)) {
        ce = e;
        return;
      }
      ce = e = l;
    } while (e !== null);
    et = 6, ce = null;
  }
  function fh(e, n, l, r, s, c, d, v, S) {
    e.cancelPendingCommit = null;
    do
      zu();
    while (dt !== 0);
    if ((Ne & 6) !== 0) throw Error(u(327));
    if (n !== null) {
      if (n === e.current) throw Error(u(177));
      if (c = n.lanes | n.childLanes, c |= no, I2(
        e,
        l,
        c,
        d,
        v,
        S
      ), e === Be && (ce = Be = null, me = 0), Zl = n, Aa = e, Pn = l, fc = c, dc = s, eh = r, (n.subtreeFlags & 10256) !== 0 || (n.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, fy(kr, function() {
        return gh(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), r = (n.flags & 13878) !== 0, (n.subtreeFlags & 13878) !== 0 || r) {
        r = w.T, w.T = null, s = G.p, G.p = 2, d = Ne, Ne |= 4;
        try {
          ey(e, n, l);
        } finally {
          Ne = d, G.p = s, w.T = r;
        }
      }
      dt = 1, dh(), mh(), hh();
    }
  }
  function dh() {
    if (dt === 1) {
      dt = 0;
      var e = Aa, n = Zl, l = (n.flags & 13878) !== 0;
      if ((n.subtreeFlags & 13878) !== 0 || l) {
        l = w.T, w.T = null;
        var r = G.p;
        G.p = 2;
        var s = Ne;
        Ne |= 4;
        try {
          Km(n, e);
          var c = Mc, d = Jd(e.containerInfo), v = c.focusedElem, S = c.selectionRange;
          if (d !== v && v && v.ownerDocument && Pd(
            v.ownerDocument.documentElement,
            v
          )) {
            if (S !== null && Ps(v)) {
              var M = S.start, D = S.end;
              if (D === void 0 && (D = M), "selectionStart" in v)
                v.selectionStart = M, v.selectionEnd = Math.min(
                  D,
                  v.value.length
                );
              else {
                var k = v.ownerDocument || document, N = k && k.defaultView || window;
                if (N.getSelection) {
                  var L = N.getSelection(), V = v.textContent.length, W = Math.min(S.start, V), Ue = S.end === void 0 ? W : Math.min(S.end, V);
                  !L.extend && W > Ue && (d = Ue, Ue = W, W = d);
                  var A = Qd(
                    v,
                    W
                  ), T = Qd(
                    v,
                    Ue
                  );
                  if (A && T && (L.rangeCount !== 1 || L.anchorNode !== A.node || L.anchorOffset !== A.offset || L.focusNode !== T.node || L.focusOffset !== T.offset)) {
                    var j = k.createRange();
                    j.setStart(A.node, A.offset), L.removeAllRanges(), W > Ue ? (L.addRange(j), L.extend(T.node, T.offset)) : (j.setEnd(T.node, T.offset), L.addRange(j));
                  }
                }
              }
            }
            for (k = [], L = v; L = L.parentNode; )
              L.nodeType === 1 && k.push({
                element: L,
                left: L.scrollLeft,
                top: L.scrollTop
              });
            for (typeof v.focus == "function" && v.focus(), v = 0; v < k.length; v++) {
              var _ = k[v];
              _.element.scrollLeft = _.left, _.element.scrollTop = _.top;
            }
          }
          Ku = !!jc, Mc = jc = null;
        } finally {
          Ne = s, G.p = r, w.T = l;
        }
      }
      e.current = n, dt = 2;
    }
  }
  function mh() {
    if (dt === 2) {
      dt = 0;
      var e = Aa, n = Zl, l = (n.flags & 8772) !== 0;
      if ((n.subtreeFlags & 8772) !== 0 || l) {
        l = w.T, w.T = null;
        var r = G.p;
        G.p = 2;
        var s = Ne;
        Ne |= 4;
        try {
          qm(e, n.alternate, n);
        } finally {
          Ne = s, G.p = r, w.T = l;
        }
      }
      dt = 3;
    }
  }
  function hh() {
    if (dt === 4 || dt === 3) {
      dt = 0, R2();
      var e = Aa, n = Zl, l = Pn, r = eh;
      (n.subtreeFlags & 10256) !== 0 || (n.flags & 10256) !== 0 ? dt = 5 : (dt = 0, Zl = Aa = null, ph(e, e.pendingLanes));
      var s = e.pendingLanes;
      if (s === 0 && (Ea = null), ws(l), n = n.stateNode, $t && typeof $t.onCommitFiberRoot == "function")
        try {
          $t.onCommitFiberRoot(
            gi,
            n,
            void 0,
            (n.current.flags & 128) === 128
          );
        } catch {
        }
      if (r !== null) {
        n = w.T, s = G.p, G.p = 2, w.T = null;
        try {
          for (var c = e.onRecoverableError, d = 0; d < r.length; d++) {
            var v = r[d];
            c(v.value, {
              componentStack: v.stack
            });
          }
        } finally {
          w.T = n, G.p = s;
        }
      }
      (Pn & 3) !== 0 && zu(), Mn(e), s = e.pendingLanes, (l & 261930) !== 0 && (s & 42) !== 0 ? e === mc ? Pi++ : (Pi = 0, mc = e) : Pi = 0, Ji(0);
    }
  }
  function ph(e, n) {
    (e.pooledCacheLanes &= n) === 0 && (n = e.pooledCache, n != null && (e.pooledCache = null, wi(n)));
  }
  function zu() {
    return dh(), mh(), hh(), gh();
  }
  function gh() {
    if (dt !== 5) return !1;
    var e = Aa, n = fc;
    fc = 0;
    var l = ws(Pn), r = w.T, s = G.p;
    try {
      G.p = 32 > l ? 32 : l, w.T = null, l = dc, dc = null;
      var c = Aa, d = Pn;
      if (dt = 0, Zl = Aa = null, Pn = 0, (Ne & 6) !== 0) throw Error(u(331));
      var v = Ne;
      if (Ne |= 4, Pm(c.current), Xm(
        c,
        c.current,
        d,
        l
      ), Ne = v, Ji(0, !1), $t && typeof $t.onPostCommitFiberRoot == "function")
        try {
          $t.onPostCommitFiberRoot(gi, c);
        } catch {
        }
      return !0;
    } finally {
      G.p = s, w.T = r, ph(e, n);
    }
  }
  function vh(e, n, l) {
    n = an(l, n), n = Vo(e.stateNode, n, 2), e = ya(e, n, 2), e !== null && (yi(e, 2), Mn(e));
  }
  function we(e, n, l) {
    if (e.tag === 3)
      vh(e, e, l);
    else
      for (; n !== null; ) {
        if (n.tag === 3) {
          vh(
            n,
            e,
            l
          );
          break;
        } else if (n.tag === 1) {
          var r = n.stateNode;
          if (typeof n.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (Ea === null || !Ea.has(r))) {
            e = an(l, e), l = ym(2), r = ya(n, l, 2), r !== null && (bm(
              l,
              r,
              n,
              e
            ), yi(r, 2), Mn(r));
            break;
          }
        }
        n = n.return;
      }
  }
  function gc(e, n, l) {
    var r = e.pingCache;
    if (r === null) {
      r = e.pingCache = new ay();
      var s = /* @__PURE__ */ new Set();
      r.set(n, s);
    } else
      s = r.get(n), s === void 0 && (s = /* @__PURE__ */ new Set(), r.set(n, s));
    s.has(l) || (sc = !0, s.add(l), e = sy.bind(null, e, n, l), n.then(e, e));
  }
  function sy(e, n, l) {
    var r = e.pingCache;
    r !== null && r.delete(n), e.pingedLanes |= e.suspendedLanes & l, e.warmLanes &= ~l, Be === e && (me & l) === l && (et === 4 || et === 3 && (me & 62914560) === me && 300 > Ft() - Nu ? (Ne & 2) === 0 && Ql(e, 0) : oc |= l, Xl === me && (Xl = 0)), Mn(e);
  }
  function yh(e, n) {
    n === 0 && (n = dd()), e = Za(e, n), e !== null && (yi(e, n), Mn(e));
  }
  function oy(e) {
    var n = e.memoizedState, l = 0;
    n !== null && (l = n.retryLane), yh(e, l);
  }
  function cy(e, n) {
    var l = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var r = e.stateNode, s = e.memoizedState;
        s !== null && (l = s.retryLane);
        break;
      case 19:
        r = e.stateNode;
        break;
      case 22:
        r = e.stateNode._retryCache;
        break;
      default:
        throw Error(u(314));
    }
    r !== null && r.delete(n), yh(e, l);
  }
  function fy(e, n) {
    return Ns(e, n);
  }
  var _u = null, Jl = null, vc = !1, ku = !1, yc = !1, Ma = 0;
  function Mn(e) {
    e !== Jl && e.next === null && (Jl === null ? _u = Jl = e : Jl = Jl.next = e), ku = !0, vc || (vc = !0, my());
  }
  function Ji(e, n) {
    if (!yc && ku) {
      yc = !0;
      do
        for (var l = !1, r = _u; r !== null; ) {
          if (e !== 0) {
            var s = r.pendingLanes;
            if (s === 0) var c = 0;
            else {
              var d = r.suspendedLanes, v = r.pingedLanes;
              c = (1 << 31 - Vt(42 | e) + 1) - 1, c &= s & ~(d & ~v), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (l = !0, xh(r, c));
          } else
            c = me, c = Ir(
              r,
              r === Be ? c : 0,
              r.cancelPendingCommit !== null || r.timeoutHandle !== -1
            ), (c & 3) === 0 || vi(r, c) || (l = !0, xh(r, c));
          r = r.next;
        }
      while (l);
      yc = !1;
    }
  }
  function dy() {
    bh();
  }
  function bh() {
    ku = vc = !1;
    var e = 0;
    Ma !== 0 && Ty() && (e = Ma);
    for (var n = Ft(), l = null, r = _u; r !== null; ) {
      var s = r.next, c = Ch(r, n);
      c === 0 ? (r.next = null, l === null ? _u = s : l.next = s, s === null && (Jl = l)) : (l = r, (e !== 0 || (c & 3) !== 0) && (ku = !0)), r = s;
    }
    dt !== 0 && dt !== 5 || Ji(e), Ma !== 0 && (Ma = 0);
  }
  function Ch(e, n) {
    for (var l = e.suspendedLanes, r = e.pingedLanes, s = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var d = 31 - Vt(c), v = 1 << d, S = s[d];
      S === -1 ? ((v & l) === 0 || (v & r) !== 0) && (s[d] = B2(v, n)) : S <= n && (e.expiredLanes |= v), c &= ~v;
    }
    if (n = Be, l = me, l = Ir(
      e,
      e === n ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), r = e.callbackNode, l === 0 || e === n && (Re === 2 || Re === 9) || e.cancelPendingCommit !== null)
      return r !== null && r !== null && Os(r), e.callbackNode = null, e.callbackPriority = 0;
    if ((l & 3) === 0 || vi(e, l)) {
      if (n = l & -l, n === e.callbackPriority) return n;
      switch (r !== null && Os(r), ws(l)) {
        case 2:
        case 8:
          l = cd;
          break;
        case 32:
          l = kr;
          break;
        case 268435456:
          l = fd;
          break;
        default:
          l = kr;
      }
      return r = Sh.bind(null, e), l = Ns(l, r), e.callbackPriority = n, e.callbackNode = l, n;
    }
    return r !== null && r !== null && Os(r), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Sh(e, n) {
    if (dt !== 0 && dt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var l = e.callbackNode;
    if (zu() && e.callbackNode !== l)
      return null;
    var r = me;
    return r = Ir(
      e,
      e === Be ? r : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), r === 0 ? null : (nh(e, r, n), Ch(e, Ft()), e.callbackNode != null && e.callbackNode === l ? Sh.bind(null, e) : null);
  }
  function xh(e, n) {
    if (zu()) return null;
    nh(e, n, !0);
  }
  function my() {
    Ay(function() {
      (Ne & 6) !== 0 ? Ns(
        od,
        dy
      ) : bh();
    });
  }
  function bc() {
    if (Ma === 0) {
      var e = Ul;
      e === 0 && (e = Ur, Ur <<= 1, (Ur & 261888) === 0 && (Ur = 256)), Ma = e;
    }
    return Ma;
  }
  function Th(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : $r("" + e);
  }
  function Eh(e, n) {
    var l = n.ownerDocument.createElement("input");
    return l.name = n.name, l.value = n.value, e.id && l.setAttribute("form", e.id), n.parentNode.insertBefore(l, n), e = new FormData(e), l.parentNode.removeChild(l), e;
  }
  function hy(e, n, l, r, s) {
    if (n === "submit" && l && l.stateNode === s) {
      var c = Th(
        (s[wt] || null).action
      ), d = r.submitter;
      d && (n = (n = d[wt] || null) ? Th(n.formAction) : d.getAttribute("formAction"), n !== null && (c = n, d = null));
      var v = new Xr(
        "action",
        "action",
        null,
        r,
        s
      );
      e.push({
        event: v,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (r.defaultPrevented) {
                if (Ma !== 0) {
                  var S = d ? Eh(s, d) : new FormData(s);
                  Bo(
                    l,
                    {
                      pending: !0,
                      data: S,
                      method: s.method,
                      action: c
                    },
                    null,
                    S
                  );
                }
              } else
                typeof c == "function" && (v.preventDefault(), S = d ? Eh(s, d) : new FormData(s), Bo(
                  l,
                  {
                    pending: !0,
                    data: S,
                    method: s.method,
                    action: c
                  },
                  c,
                  S
                ));
            },
            currentTarget: s
          }
        ]
      });
    }
  }
  for (var Cc = 0; Cc < to.length; Cc++) {
    var Sc = to[Cc], py = Sc.toLowerCase(), gy = Sc[0].toUpperCase() + Sc.slice(1);
    gn(
      py,
      "on" + gy
    );
  }
  gn(t1, "onAnimationEnd"), gn(n1, "onAnimationIteration"), gn(a1, "onAnimationStart"), gn("dblclick", "onDoubleClick"), gn("focusin", "onFocus"), gn("focusout", "onBlur"), gn(wv, "onTransitionRun"), gn(Dv, "onTransitionStart"), gn(zv, "onTransitionCancel"), gn(l1, "onTransitionEnd"), Tl("onMouseEnter", ["mouseout", "mouseover"]), Tl("onMouseLeave", ["mouseout", "mouseover"]), Tl("onPointerEnter", ["pointerout", "pointerover"]), Tl("onPointerLeave", ["pointerout", "pointerover"]), Va(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Va(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Va("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Va(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Va(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Va(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Wi = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), vy = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Wi)
  );
  function Ah(e, n) {
    n = (n & 4) !== 0;
    for (var l = 0; l < e.length; l++) {
      var r = e[l], s = r.event;
      r = r.listeners;
      e: {
        var c = void 0;
        if (n)
          for (var d = r.length - 1; 0 <= d; d--) {
            var v = r[d], S = v.instance, M = v.currentTarget;
            if (v = v.listener, S !== c && s.isPropagationStopped())
              break e;
            c = v, s.currentTarget = M;
            try {
              c(s);
            } catch (D) {
              Pr(D);
            }
            s.currentTarget = null, c = S;
          }
        else
          for (d = 0; d < r.length; d++) {
            if (v = r[d], S = v.instance, M = v.currentTarget, v = v.listener, S !== c && s.isPropagationStopped())
              break e;
            c = v, s.currentTarget = M;
            try {
              c(s);
            } catch (D) {
              Pr(D);
            }
            s.currentTarget = null, c = S;
          }
      }
    }
  }
  function fe(e, n) {
    var l = n[Ds];
    l === void 0 && (l = n[Ds] = /* @__PURE__ */ new Set());
    var r = e + "__bubble";
    l.has(r) || (jh(n, e, 2, !1), l.add(r));
  }
  function xc(e, n, l) {
    var r = 0;
    n && (r |= 4), jh(
      l,
      e,
      r,
      n
    );
  }
  var Uu = "_reactListening" + Math.random().toString(36).slice(2);
  function Tc(e) {
    if (!e[Uu]) {
      e[Uu] = !0, bd.forEach(function(l) {
        l !== "selectionchange" && (vy.has(l) || xc(l, !1, e), xc(l, !0, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[Uu] || (n[Uu] = !0, xc("selectionchange", !1, n));
    }
  }
  function jh(e, n, l, r) {
    switch (tp(n)) {
      case 2:
        var s = Vy;
        break;
      case 8:
        s = Ky;
        break;
      default:
        s = Hc;
    }
    l = s.bind(
      null,
      n,
      l,
      e
    ), s = void 0, !Gs || n !== "touchstart" && n !== "touchmove" && n !== "wheel" || (s = !0), r ? s !== void 0 ? e.addEventListener(n, l, {
      capture: !0,
      passive: s
    }) : e.addEventListener(n, l, !0) : s !== void 0 ? e.addEventListener(n, l, {
      passive: s
    }) : e.addEventListener(n, l, !1);
  }
  function Ec(e, n, l, r, s) {
    var c = r;
    if ((n & 1) === 0 && (n & 2) === 0 && r !== null)
      e: for (; ; ) {
        if (r === null) return;
        var d = r.tag;
        if (d === 3 || d === 4) {
          var v = r.stateNode.containerInfo;
          if (v === s) break;
          if (d === 4)
            for (d = r.return; d !== null; ) {
              var S = d.tag;
              if ((S === 3 || S === 4) && d.stateNode.containerInfo === s)
                return;
              d = d.return;
            }
          for (; v !== null; ) {
            if (d = Cl(v), d === null) return;
            if (S = d.tag, S === 5 || S === 6 || S === 26 || S === 27) {
              r = c = d;
              continue e;
            }
            v = v.parentNode;
          }
        }
        r = r.return;
      }
    Rd(function() {
      var M = c, D = Is(l), k = [];
      e: {
        var N = i1.get(e);
        if (N !== void 0) {
          var L = Xr, V = e;
          switch (e) {
            case "keypress":
              if (Kr(l) === 0) break e;
            case "keydown":
            case "keyup":
              L = cv;
              break;
            case "focusin":
              V = "focus", L = Ks;
              break;
            case "focusout":
              V = "blur", L = Ks;
              break;
            case "beforeblur":
            case "afterblur":
              L = Ks;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              L = zd;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              L = J2;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              L = mv;
              break;
            case t1:
            case n1:
            case a1:
              L = tv;
              break;
            case l1:
              L = pv;
              break;
            case "scroll":
            case "scrollend":
              L = Q2;
              break;
            case "wheel":
              L = vv;
              break;
            case "copy":
            case "cut":
            case "paste":
              L = av;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              L = kd;
              break;
            case "toggle":
            case "beforetoggle":
              L = bv;
          }
          var W = (n & 4) !== 0, Ue = !W && (e === "scroll" || e === "scrollend"), A = W ? N !== null ? N + "Capture" : null : N;
          W = [];
          for (var T = M, j; T !== null; ) {
            var _ = T;
            if (j = _.stateNode, _ = _.tag, _ !== 5 && _ !== 26 && _ !== 27 || j === null || A === null || (_ = Si(T, A), _ != null && W.push(
              er(T, _, j)
            )), Ue) break;
            T = T.return;
          }
          0 < W.length && (N = new L(
            N,
            V,
            null,
            l,
            D
          ), k.push({ event: N, listeners: W }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (N = e === "mouseover" || e === "pointerover", L = e === "mouseout" || e === "pointerout", N && l !== Bs && (V = l.relatedTarget || l.fromElement) && (Cl(V) || V[bl]))
            break e;
          if ((L || N) && (N = D.window === D ? D : (N = D.ownerDocument) ? N.defaultView || N.parentWindow : window, L ? (V = l.relatedTarget || l.toElement, L = M, V = V ? Cl(V) : null, V !== null && (Ue = f(V), W = V.tag, V !== Ue || W !== 5 && W !== 27 && W !== 6) && (V = null)) : (L = null, V = M), L !== V)) {
            if (W = zd, _ = "onMouseLeave", A = "onMouseEnter", T = "mouse", (e === "pointerout" || e === "pointerover") && (W = kd, _ = "onPointerLeave", A = "onPointerEnter", T = "pointer"), Ue = L == null ? N : Ci(L), j = V == null ? N : Ci(V), N = new W(
              _,
              T + "leave",
              L,
              l,
              D
            ), N.target = Ue, N.relatedTarget = j, _ = null, Cl(D) === M && (W = new W(
              A,
              T + "enter",
              V,
              l,
              D
            ), W.target = j, W.relatedTarget = Ue, _ = W), Ue = _, L && V)
              t: {
                for (W = yy, A = L, T = V, j = 0, _ = A; _; _ = W(_))
                  j++;
                _ = 0;
                for (var Q = T; Q; Q = W(Q))
                  _++;
                for (; 0 < j - _; )
                  A = W(A), j--;
                for (; 0 < _ - j; )
                  T = W(T), _--;
                for (; j--; ) {
                  if (A === T || T !== null && A === T.alternate) {
                    W = A;
                    break t;
                  }
                  A = W(A), T = W(T);
                }
                W = null;
              }
            else W = null;
            L !== null && Mh(
              k,
              N,
              L,
              W,
              !1
            ), V !== null && Ue !== null && Mh(
              k,
              Ue,
              V,
              W,
              !0
            );
          }
        }
        e: {
          if (N = M ? Ci(M) : window, L = N.nodeName && N.nodeName.toLowerCase(), L === "select" || L === "input" && N.type === "file")
            var Te = $d;
          else if (Gd(N))
            if (Vd)
              Te = Ov;
            else {
              Te = Mv;
              var K = jv;
            }
          else
            L = N.nodeName, !L || L.toLowerCase() !== "input" || N.type !== "checkbox" && N.type !== "radio" ? M && Hs(M.elementType) && (Te = $d) : Te = Nv;
          if (Te && (Te = Te(e, M))) {
            Fd(
              k,
              Te,
              l,
              D
            );
            break e;
          }
          K && K(e, N, M), e === "focusout" && M && N.type === "number" && M.memoizedProps.value != null && Us(N, "number", N.value);
        }
        switch (K = M ? Ci(M) : window, e) {
          case "focusin":
            (Gd(K) || K.contentEditable === "true") && (Ol = K, Js = M, Oi = null);
            break;
          case "focusout":
            Oi = Js = Ol = null;
            break;
          case "mousedown":
            Ws = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ws = !1, Wd(k, l, D);
            break;
          case "selectionchange":
            if (Rv) break;
          case "keydown":
          case "keyup":
            Wd(k, l, D);
        }
        var ue;
        if (Xs)
          e: {
            switch (e) {
              case "compositionstart":
                var he = "onCompositionStart";
                break e;
              case "compositionend":
                he = "onCompositionEnd";
                break e;
              case "compositionupdate":
                he = "onCompositionUpdate";
                break e;
            }
            he = void 0;
          }
        else
          Nl ? Id(e, l) && (he = "onCompositionEnd") : e === "keydown" && l.keyCode === 229 && (he = "onCompositionStart");
        he && (Ud && l.locale !== "ko" && (Nl || he !== "onCompositionStart" ? he === "onCompositionEnd" && Nl && (ue = wd()) : (fa = D, Fs = "value" in fa ? fa.value : fa.textContent, Nl = !0)), K = Hu(M, he), 0 < K.length && (he = new _d(
          he,
          e,
          null,
          l,
          D
        ), k.push({ event: he, listeners: K }), ue ? he.data = ue : (ue = qd(l), ue !== null && (he.data = ue)))), (ue = Sv ? xv(e, l) : Tv(e, l)) && (he = Hu(M, "onBeforeInput"), 0 < he.length && (K = new _d(
          "onBeforeInput",
          "beforeinput",
          null,
          l,
          D
        ), k.push({
          event: K,
          listeners: he
        }), K.data = ue)), hy(
          k,
          e,
          M,
          l,
          D
        );
      }
      Ah(k, n);
    });
  }
  function er(e, n, l) {
    return {
      instance: e,
      listener: n,
      currentTarget: l
    };
  }
  function Hu(e, n) {
    for (var l = n + "Capture", r = []; e !== null; ) {
      var s = e, c = s.stateNode;
      if (s = s.tag, s !== 5 && s !== 26 && s !== 27 || c === null || (s = Si(e, l), s != null && r.unshift(
        er(e, s, c)
      ), s = Si(e, n), s != null && r.push(
        er(e, s, c)
      )), e.tag === 3) return r;
      e = e.return;
    }
    return [];
  }
  function yy(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Mh(e, n, l, r, s) {
    for (var c = n._reactName, d = []; l !== null && l !== r; ) {
      var v = l, S = v.alternate, M = v.stateNode;
      if (v = v.tag, S !== null && S === r) break;
      v !== 5 && v !== 26 && v !== 27 || M === null || (S = M, s ? (M = Si(l, c), M != null && d.unshift(
        er(l, M, S)
      )) : s || (M = Si(l, c), M != null && d.push(
        er(l, M, S)
      ))), l = l.return;
    }
    d.length !== 0 && e.push({ event: n, listeners: d });
  }
  var by = /\r\n?/g, Cy = /\u0000|\uFFFD/g;
  function Nh(e) {
    return (typeof e == "string" ? e : "" + e).replace(by, `
`).replace(Cy, "");
  }
  function Oh(e, n) {
    return n = Nh(n), Nh(e) === n;
  }
  function ke(e, n, l, r, s, c) {
    switch (l) {
      case "children":
        typeof r == "string" ? n === "body" || n === "textarea" && r === "" || Al(e, r) : (typeof r == "number" || typeof r == "bigint") && n !== "body" && Al(e, "" + r);
        break;
      case "className":
        Gr(e, "class", r);
        break;
      case "tabIndex":
        Gr(e, "tabindex", r);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Gr(e, l, r);
        break;
      case "style":
        Od(e, r, c);
        break;
      case "data":
        if (n !== "object") {
          Gr(e, "data", r);
          break;
        }
      case "src":
      case "href":
        if (r === "" && (n !== "a" || l !== "href")) {
          e.removeAttribute(l);
          break;
        }
        if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
          e.removeAttribute(l);
          break;
        }
        r = $r("" + r), e.setAttribute(l, r);
        break;
      case "action":
      case "formAction":
        if (typeof r == "function") {
          e.setAttribute(
            l,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof c == "function" && (l === "formAction" ? (n !== "input" && ke(e, n, "name", s.name, s, null), ke(
            e,
            n,
            "formEncType",
            s.formEncType,
            s,
            null
          ), ke(
            e,
            n,
            "formMethod",
            s.formMethod,
            s,
            null
          ), ke(
            e,
            n,
            "formTarget",
            s.formTarget,
            s,
            null
          )) : (ke(e, n, "encType", s.encType, s, null), ke(e, n, "method", s.method, s, null), ke(e, n, "target", s.target, s, null)));
        if (r == null || typeof r == "symbol" || typeof r == "boolean") {
          e.removeAttribute(l);
          break;
        }
        r = $r("" + r), e.setAttribute(l, r);
        break;
      case "onClick":
        r != null && (e.onclick = kn);
        break;
      case "onScroll":
        r != null && fe("scroll", e);
        break;
      case "onScrollEnd":
        r != null && fe("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (r != null) {
          if (typeof r != "object" || !("__html" in r))
            throw Error(u(61));
          if (l = r.__html, l != null) {
            if (s.children != null) throw Error(u(60));
            e.innerHTML = l;
          }
        }
        break;
      case "multiple":
        e.multiple = r && typeof r != "function" && typeof r != "symbol";
        break;
      case "muted":
        e.muted = r && typeof r != "function" && typeof r != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        l = $r("" + r), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          l
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(l, "" + r) : e.removeAttribute(l);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(l, "") : e.removeAttribute(l);
        break;
      case "capture":
      case "download":
        r === !0 ? e.setAttribute(l, "") : r !== !1 && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(l, r) : e.removeAttribute(l);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(l, r) : e.removeAttribute(l);
        break;
      case "rowSpan":
      case "start":
        r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(l) : e.setAttribute(l, r);
        break;
      case "popover":
        fe("beforetoggle", e), fe("toggle", e), qr(e, "popover", r);
        break;
      case "xlinkActuate":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          r
        );
        break;
      case "xlinkArcrole":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          r
        );
        break;
      case "xlinkRole":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          r
        );
        break;
      case "xlinkShow":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          r
        );
        break;
      case "xlinkTitle":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          r
        );
        break;
      case "xlinkType":
        _n(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          r
        );
        break;
      case "xmlBase":
        _n(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          r
        );
        break;
      case "xmlLang":
        _n(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          r
        );
        break;
      case "xmlSpace":
        _n(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          r
        );
        break;
      case "is":
        qr(e, "is", r);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < l.length) || l[0] !== "o" && l[0] !== "O" || l[1] !== "n" && l[1] !== "N") && (l = X2.get(l) || l, qr(e, l, r));
    }
  }
  function Ac(e, n, l, r, s, c) {
    switch (l) {
      case "style":
        Od(e, r, c);
        break;
      case "dangerouslySetInnerHTML":
        if (r != null) {
          if (typeof r != "object" || !("__html" in r))
            throw Error(u(61));
          if (l = r.__html, l != null) {
            if (s.children != null) throw Error(u(60));
            e.innerHTML = l;
          }
        }
        break;
      case "children":
        typeof r == "string" ? Al(e, r) : (typeof r == "number" || typeof r == "bigint") && Al(e, "" + r);
        break;
      case "onScroll":
        r != null && fe("scroll", e);
        break;
      case "onScrollEnd":
        r != null && fe("scrollend", e);
        break;
      case "onClick":
        r != null && (e.onclick = kn);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Cd.hasOwnProperty(l))
          e: {
            if (l[0] === "o" && l[1] === "n" && (s = l.endsWith("Capture"), n = l.slice(2, s ? l.length - 7 : void 0), c = e[wt] || null, c = c != null ? c[l] : null, typeof c == "function" && e.removeEventListener(n, c, s), typeof r == "function")) {
              typeof c != "function" && c !== null && (l in e ? e[l] = null : e.hasAttribute(l) && e.removeAttribute(l)), e.addEventListener(n, r, s);
              break e;
            }
            l in e ? e[l] = r : r === !0 ? e.setAttribute(l, "") : qr(e, l, r);
          }
    }
  }
  function At(e, n, l) {
    switch (n) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        fe("error", e), fe("load", e);
        var r = !1, s = !1, c;
        for (c in l)
          if (l.hasOwnProperty(c)) {
            var d = l[c];
            if (d != null)
              switch (c) {
                case "src":
                  r = !0;
                  break;
                case "srcSet":
                  s = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(u(137, n));
                default:
                  ke(e, n, c, d, l, null);
              }
          }
        s && ke(e, n, "srcSet", l.srcSet, l, null), r && ke(e, n, "src", l.src, l, null);
        return;
      case "input":
        fe("invalid", e);
        var v = c = d = s = null, S = null, M = null;
        for (r in l)
          if (l.hasOwnProperty(r)) {
            var D = l[r];
            if (D != null)
              switch (r) {
                case "name":
                  s = D;
                  break;
                case "type":
                  d = D;
                  break;
                case "checked":
                  S = D;
                  break;
                case "defaultChecked":
                  M = D;
                  break;
                case "value":
                  c = D;
                  break;
                case "defaultValue":
                  v = D;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (D != null)
                    throw Error(u(137, n));
                  break;
                default:
                  ke(e, n, r, D, l, null);
              }
          }
        Ad(
          e,
          c,
          v,
          S,
          M,
          d,
          s,
          !1
        );
        return;
      case "select":
        fe("invalid", e), r = d = c = null;
        for (s in l)
          if (l.hasOwnProperty(s) && (v = l[s], v != null))
            switch (s) {
              case "value":
                c = v;
                break;
              case "defaultValue":
                d = v;
                break;
              case "multiple":
                r = v;
              default:
                ke(e, n, s, v, l, null);
            }
        n = c, l = d, e.multiple = !!r, n != null ? El(e, !!r, n, !1) : l != null && El(e, !!r, l, !0);
        return;
      case "textarea":
        fe("invalid", e), c = s = r = null;
        for (d in l)
          if (l.hasOwnProperty(d) && (v = l[d], v != null))
            switch (d) {
              case "value":
                r = v;
                break;
              case "defaultValue":
                s = v;
                break;
              case "children":
                c = v;
                break;
              case "dangerouslySetInnerHTML":
                if (v != null) throw Error(u(91));
                break;
              default:
                ke(e, n, d, v, l, null);
            }
        Md(e, r, s, c);
        return;
      case "option":
        for (S in l)
          l.hasOwnProperty(S) && (r = l[S], r != null) && (S === "selected" ? e.selected = r && typeof r != "function" && typeof r != "symbol" : ke(e, n, S, r, l, null));
        return;
      case "dialog":
        fe("beforetoggle", e), fe("toggle", e), fe("cancel", e), fe("close", e);
        break;
      case "iframe":
      case "object":
        fe("load", e);
        break;
      case "video":
      case "audio":
        for (r = 0; r < Wi.length; r++)
          fe(Wi[r], e);
        break;
      case "image":
        fe("error", e), fe("load", e);
        break;
      case "details":
        fe("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        fe("error", e), fe("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (M in l)
          if (l.hasOwnProperty(M) && (r = l[M], r != null))
            switch (M) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(u(137, n));
              default:
                ke(e, n, M, r, l, null);
            }
        return;
      default:
        if (Hs(n)) {
          for (D in l)
            l.hasOwnProperty(D) && (r = l[D], r !== void 0 && Ac(
              e,
              n,
              D,
              r,
              l,
              void 0
            ));
          return;
        }
    }
    for (v in l)
      l.hasOwnProperty(v) && (r = l[v], r != null && ke(e, n, v, r, l, null));
  }
  function Sy(e, n, l, r) {
    switch (n) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var s = null, c = null, d = null, v = null, S = null, M = null, D = null;
        for (L in l) {
          var k = l[L];
          if (l.hasOwnProperty(L) && k != null)
            switch (L) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                S = k;
              default:
                r.hasOwnProperty(L) || ke(e, n, L, null, r, k);
            }
        }
        for (var N in r) {
          var L = r[N];
          if (k = l[N], r.hasOwnProperty(N) && (L != null || k != null))
            switch (N) {
              case "type":
                c = L;
                break;
              case "name":
                s = L;
                break;
              case "checked":
                M = L;
                break;
              case "defaultChecked":
                D = L;
                break;
              case "value":
                d = L;
                break;
              case "defaultValue":
                v = L;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (L != null)
                  throw Error(u(137, n));
                break;
              default:
                L !== k && ke(
                  e,
                  n,
                  N,
                  L,
                  r,
                  k
                );
            }
        }
        ks(
          e,
          d,
          v,
          S,
          M,
          D,
          c,
          s
        );
        return;
      case "select":
        L = d = v = N = null;
        for (c in l)
          if (S = l[c], l.hasOwnProperty(c) && S != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                L = S;
              default:
                r.hasOwnProperty(c) || ke(
                  e,
                  n,
                  c,
                  null,
                  r,
                  S
                );
            }
        for (s in r)
          if (c = r[s], S = l[s], r.hasOwnProperty(s) && (c != null || S != null))
            switch (s) {
              case "value":
                N = c;
                break;
              case "defaultValue":
                v = c;
                break;
              case "multiple":
                d = c;
              default:
                c !== S && ke(
                  e,
                  n,
                  s,
                  c,
                  r,
                  S
                );
            }
        n = v, l = d, r = L, N != null ? El(e, !!l, N, !1) : !!r != !!l && (n != null ? El(e, !!l, n, !0) : El(e, !!l, l ? [] : "", !1));
        return;
      case "textarea":
        L = N = null;
        for (v in l)
          if (s = l[v], l.hasOwnProperty(v) && s != null && !r.hasOwnProperty(v))
            switch (v) {
              case "value":
                break;
              case "children":
                break;
              default:
                ke(e, n, v, null, r, s);
            }
        for (d in r)
          if (s = r[d], c = l[d], r.hasOwnProperty(d) && (s != null || c != null))
            switch (d) {
              case "value":
                N = s;
                break;
              case "defaultValue":
                L = s;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (s != null) throw Error(u(91));
                break;
              default:
                s !== c && ke(e, n, d, s, r, c);
            }
        jd(e, N, L);
        return;
      case "option":
        for (var V in l)
          N = l[V], l.hasOwnProperty(V) && N != null && !r.hasOwnProperty(V) && (V === "selected" ? e.selected = !1 : ke(
            e,
            n,
            V,
            null,
            r,
            N
          ));
        for (S in r)
          N = r[S], L = l[S], r.hasOwnProperty(S) && N !== L && (N != null || L != null) && (S === "selected" ? e.selected = N && typeof N != "function" && typeof N != "symbol" : ke(
            e,
            n,
            S,
            N,
            r,
            L
          ));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var W in l)
          N = l[W], l.hasOwnProperty(W) && N != null && !r.hasOwnProperty(W) && ke(e, n, W, null, r, N);
        for (M in r)
          if (N = r[M], L = l[M], r.hasOwnProperty(M) && N !== L && (N != null || L != null))
            switch (M) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (N != null)
                  throw Error(u(137, n));
                break;
              default:
                ke(
                  e,
                  n,
                  M,
                  N,
                  r,
                  L
                );
            }
        return;
      default:
        if (Hs(n)) {
          for (var Ue in l)
            N = l[Ue], l.hasOwnProperty(Ue) && N !== void 0 && !r.hasOwnProperty(Ue) && Ac(
              e,
              n,
              Ue,
              void 0,
              r,
              N
            );
          for (D in r)
            N = r[D], L = l[D], !r.hasOwnProperty(D) || N === L || N === void 0 && L === void 0 || Ac(
              e,
              n,
              D,
              N,
              r,
              L
            );
          return;
        }
    }
    for (var A in l)
      N = l[A], l.hasOwnProperty(A) && N != null && !r.hasOwnProperty(A) && ke(e, n, A, null, r, N);
    for (k in r)
      N = r[k], L = l[k], !r.hasOwnProperty(k) || N === L || N == null && L == null || ke(e, n, k, N, r, L);
  }
  function Lh(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function xy() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, n = 0, l = performance.getEntriesByType("resource"), r = 0; r < l.length; r++) {
        var s = l[r], c = s.transferSize, d = s.initiatorType, v = s.duration;
        if (c && v && Lh(d)) {
          for (d = 0, v = s.responseEnd, r += 1; r < l.length; r++) {
            var S = l[r], M = S.startTime;
            if (M > v) break;
            var D = S.transferSize, k = S.initiatorType;
            D && Lh(k) && (S = S.responseEnd, d += D * (S < v ? 1 : (v - M) / (S - M)));
          }
          if (--r, n += 8 * (c + d) / (s.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return n / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var jc = null, Mc = null;
  function Bu(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Rh(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function wh(e, n) {
    if (e === 0)
      switch (n) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && n === "foreignObject" ? 0 : e;
  }
  function Nc(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.children == "bigint" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var Oc = null;
  function Ty() {
    var e = window.event;
    return e && e.type === "popstate" ? e === Oc ? !1 : (Oc = e, !0) : (Oc = null, !1);
  }
  var Dh = typeof setTimeout == "function" ? setTimeout : void 0, Ey = typeof clearTimeout == "function" ? clearTimeout : void 0, zh = typeof Promise == "function" ? Promise : void 0, Ay = typeof queueMicrotask == "function" ? queueMicrotask : typeof zh < "u" ? function(e) {
    return zh.resolve(null).then(e).catch(jy);
  } : Dh;
  function jy(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Na(e) {
    return e === "head";
  }
  function _h(e, n) {
    var l = n, r = 0;
    do {
      var s = l.nextSibling;
      if (e.removeChild(l), s && s.nodeType === 8)
        if (l = s.data, l === "/$" || l === "/&") {
          if (r === 0) {
            e.removeChild(s), ni(n);
            return;
          }
          r--;
        } else if (l === "$" || l === "$?" || l === "$~" || l === "$!" || l === "&")
          r++;
        else if (l === "html")
          tr(e.ownerDocument.documentElement);
        else if (l === "head") {
          l = e.ownerDocument.head, tr(l);
          for (var c = l.firstChild; c; ) {
            var d = c.nextSibling, v = c.nodeName;
            c[bi] || v === "SCRIPT" || v === "STYLE" || v === "LINK" && c.rel.toLowerCase() === "stylesheet" || l.removeChild(c), c = d;
          }
        } else
          l === "body" && tr(e.ownerDocument.body);
      l = s;
    } while (l);
    ni(n);
  }
  function kh(e, n) {
    var l = e;
    e = 0;
    do {
      var r = l.nextSibling;
      if (l.nodeType === 1 ? n ? (l._stashedDisplay = l.style.display, l.style.display = "none") : (l.style.display = l._stashedDisplay || "", l.getAttribute("style") === "" && l.removeAttribute("style")) : l.nodeType === 3 && (n ? (l._stashedText = l.nodeValue, l.nodeValue = "") : l.nodeValue = l._stashedText || ""), r && r.nodeType === 8)
        if (l = r.data, l === "/$") {
          if (e === 0) break;
          e--;
        } else
          l !== "$" && l !== "$?" && l !== "$~" && l !== "$!" || e++;
      l = r;
    } while (l);
  }
  function Lc(e) {
    var n = e.firstChild;
    for (n && n.nodeType === 10 && (n = n.nextSibling); n; ) {
      var l = n;
      switch (n = n.nextSibling, l.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Lc(l), zs(l);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (l.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(l);
    }
  }
  function My(e, n, l, r) {
    for (; e.nodeType === 1; ) {
      var s = l;
      if (e.nodeName.toLowerCase() !== n.toLowerCase()) {
        if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (r) {
        if (!e[bi])
          switch (n) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (c = e.getAttribute("rel"), c === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (c !== s.rel || e.getAttribute("href") !== (s.href == null || s.href === "" ? null : s.href) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin) || e.getAttribute("title") !== (s.title == null ? null : s.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (c = e.getAttribute("src"), (c !== (s.src == null ? null : s.src) || e.getAttribute("type") !== (s.type == null ? null : s.type) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin)) && c && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (n === "input" && e.type === "hidden") {
        var c = s.name == null ? null : "" + s.name;
        if (s.type === "hidden" && e.getAttribute("name") === c)
          return e;
      } else return e;
      if (e = on(e.nextSibling), e === null) break;
    }
    return null;
  }
  function Ny(e, n, l) {
    if (n === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !l || (e = on(e.nextSibling), e === null)) return null;
    return e;
  }
  function Uh(e, n) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = on(e.nextSibling), e === null)) return null;
    return e;
  }
  function Rc(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function wc(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function Oy(e, n) {
    var l = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = n;
    else if (e.data !== "$?" || l.readyState !== "loading")
      n();
    else {
      var r = function() {
        n(), l.removeEventListener("DOMContentLoaded", r);
      };
      l.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
    }
  }
  function on(e) {
    for (; e != null; e = e.nextSibling) {
      var n = e.nodeType;
      if (n === 1 || n === 3) break;
      if (n === 8) {
        if (n = e.data, n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&" || n === "F!" || n === "F")
          break;
        if (n === "/$" || n === "/&") return null;
      }
    }
    return e;
  }
  var Dc = null;
  function Hh(e) {
    e = e.nextSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var l = e.data;
        if (l === "/$" || l === "/&") {
          if (n === 0)
            return on(e.nextSibling);
          n--;
        } else
          l !== "$" && l !== "$!" && l !== "$?" && l !== "$~" && l !== "&" || n++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function Bh(e) {
    e = e.previousSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var l = e.data;
        if (l === "$" || l === "$!" || l === "$?" || l === "$~" || l === "&") {
          if (n === 0) return e;
          n--;
        } else l !== "/$" && l !== "/&" || n++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function Ih(e, n, l) {
    switch (n = Bu(l), e) {
      case "html":
        if (e = n.documentElement, !e) throw Error(u(452));
        return e;
      case "head":
        if (e = n.head, !e) throw Error(u(453));
        return e;
      case "body":
        if (e = n.body, !e) throw Error(u(454));
        return e;
      default:
        throw Error(u(451));
    }
  }
  function tr(e) {
    for (var n = e.attributes; n.length; )
      e.removeAttributeNode(n[0]);
    zs(e);
  }
  var cn = /* @__PURE__ */ new Map(), qh = /* @__PURE__ */ new Set();
  function Iu(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Jn = G.d;
  G.d = {
    f: Ly,
    r: Ry,
    D: wy,
    C: Dy,
    L: zy,
    m: _y,
    X: Uy,
    S: ky,
    M: Hy
  };
  function Ly() {
    var e = Jn.f(), n = Ru();
    return e || n;
  }
  function Ry(e) {
    var n = Sl(e);
    n !== null && n.tag === 5 && n.type === "form" ? lm(n) : Jn.r(e);
  }
  var Wl = typeof document > "u" ? null : document;
  function Gh(e, n, l) {
    var r = Wl;
    if (r && typeof n == "string" && n) {
      var s = tn(n);
      s = 'link[rel="' + e + '"][href="' + s + '"]', typeof l == "string" && (s += '[crossorigin="' + l + '"]'), qh.has(s) || (qh.add(s), e = { rel: e, crossOrigin: l, href: n }, r.querySelector(s) === null && (n = r.createElement("link"), At(n, "link", e), gt(n), r.head.appendChild(n)));
    }
  }
  function wy(e) {
    Jn.D(e), Gh("dns-prefetch", e, null);
  }
  function Dy(e, n) {
    Jn.C(e, n), Gh("preconnect", e, n);
  }
  function zy(e, n, l) {
    Jn.L(e, n, l);
    var r = Wl;
    if (r && e && n) {
      var s = 'link[rel="preload"][as="' + tn(n) + '"]';
      n === "image" && l && l.imageSrcSet ? (s += '[imagesrcset="' + tn(
        l.imageSrcSet
      ) + '"]', typeof l.imageSizes == "string" && (s += '[imagesizes="' + tn(
        l.imageSizes
      ) + '"]')) : s += '[href="' + tn(e) + '"]';
      var c = s;
      switch (n) {
        case "style":
          c = ei(e);
          break;
        case "script":
          c = ti(e);
      }
      cn.has(c) || (e = C(
        {
          rel: "preload",
          href: n === "image" && l && l.imageSrcSet ? void 0 : e,
          as: n
        },
        l
      ), cn.set(c, e), r.querySelector(s) !== null || n === "style" && r.querySelector(nr(c)) || n === "script" && r.querySelector(ar(c)) || (n = r.createElement("link"), At(n, "link", e), gt(n), r.head.appendChild(n)));
    }
  }
  function _y(e, n) {
    Jn.m(e, n);
    var l = Wl;
    if (l && e) {
      var r = n && typeof n.as == "string" ? n.as : "script", s = 'link[rel="modulepreload"][as="' + tn(r) + '"][href="' + tn(e) + '"]', c = s;
      switch (r) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = ti(e);
      }
      if (!cn.has(c) && (e = C({ rel: "modulepreload", href: e }, n), cn.set(c, e), l.querySelector(s) === null)) {
        switch (r) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (l.querySelector(ar(c)))
              return;
        }
        r = l.createElement("link"), At(r, "link", e), gt(r), l.head.appendChild(r);
      }
    }
  }
  function ky(e, n, l) {
    Jn.S(e, n, l);
    var r = Wl;
    if (r && e) {
      var s = xl(r).hoistableStyles, c = ei(e);
      n = n || "default";
      var d = s.get(c);
      if (!d) {
        var v = { loading: 0, preload: null };
        if (d = r.querySelector(
          nr(c)
        ))
          v.loading = 5;
        else {
          e = C(
            { rel: "stylesheet", href: e, "data-precedence": n },
            l
          ), (l = cn.get(c)) && zc(e, l);
          var S = d = r.createElement("link");
          gt(S), At(S, "link", e), S._p = new Promise(function(M, D) {
            S.onload = M, S.onerror = D;
          }), S.addEventListener("load", function() {
            v.loading |= 1;
          }), S.addEventListener("error", function() {
            v.loading |= 2;
          }), v.loading |= 4, qu(d, n, r);
        }
        d = {
          type: "stylesheet",
          instance: d,
          count: 1,
          state: v
        }, s.set(c, d);
      }
    }
  }
  function Uy(e, n) {
    Jn.X(e, n);
    var l = Wl;
    if (l && e) {
      var r = xl(l).hoistableScripts, s = ti(e), c = r.get(s);
      c || (c = l.querySelector(ar(s)), c || (e = C({ src: e, async: !0 }, n), (n = cn.get(s)) && _c(e, n), c = l.createElement("script"), gt(c), At(c, "link", e), l.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, r.set(s, c));
    }
  }
  function Hy(e, n) {
    Jn.M(e, n);
    var l = Wl;
    if (l && e) {
      var r = xl(l).hoistableScripts, s = ti(e), c = r.get(s);
      c || (c = l.querySelector(ar(s)), c || (e = C({ src: e, async: !0, type: "module" }, n), (n = cn.get(s)) && _c(e, n), c = l.createElement("script"), gt(c), At(c, "link", e), l.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, r.set(s, c));
    }
  }
  function Fh(e, n, l, r) {
    var s = (s = se.current) ? Iu(s) : null;
    if (!s) throw Error(u(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof l.precedence == "string" && typeof l.href == "string" ? (n = ei(l.href), l = xl(
          s
        ).hoistableStyles, r = l.get(n), r || (r = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, l.set(n, r)), r) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (l.rel === "stylesheet" && typeof l.href == "string" && typeof l.precedence == "string") {
          e = ei(l.href);
          var c = xl(
            s
          ).hoistableStyles, d = c.get(e);
          if (d || (s = s.ownerDocument || s, d = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, d), (c = s.querySelector(
            nr(e)
          )) && !c._p && (d.instance = c, d.state.loading = 5), cn.has(e) || (l = {
            rel: "preload",
            as: "style",
            href: l.href,
            crossOrigin: l.crossOrigin,
            integrity: l.integrity,
            media: l.media,
            hrefLang: l.hrefLang,
            referrerPolicy: l.referrerPolicy
          }, cn.set(e, l), c || By(
            s,
            e,
            l,
            d.state
          ))), n && r === null)
            throw Error(u(528, ""));
          return d;
        }
        if (n && r !== null)
          throw Error(u(529, ""));
        return null;
      case "script":
        return n = l.async, l = l.src, typeof l == "string" && n && typeof n != "function" && typeof n != "symbol" ? (n = ti(l), l = xl(
          s
        ).hoistableScripts, r = l.get(n), r || (r = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, l.set(n, r)), r) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(u(444, e));
    }
  }
  function ei(e) {
    return 'href="' + tn(e) + '"';
  }
  function nr(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function $h(e) {
    return C({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function By(e, n, l, r) {
    e.querySelector('link[rel="preload"][as="style"][' + n + "]") ? r.loading = 1 : (n = e.createElement("link"), r.preload = n, n.addEventListener("load", function() {
      return r.loading |= 1;
    }), n.addEventListener("error", function() {
      return r.loading |= 2;
    }), At(n, "link", l), gt(n), e.head.appendChild(n));
  }
  function ti(e) {
    return '[src="' + tn(e) + '"]';
  }
  function ar(e) {
    return "script[async]" + e;
  }
  function Vh(e, n, l) {
    if (n.count++, n.instance === null)
      switch (n.type) {
        case "style":
          var r = e.querySelector(
            'style[data-href~="' + tn(l.href) + '"]'
          );
          if (r)
            return n.instance = r, gt(r), r;
          var s = C({}, l, {
            "data-href": l.href,
            "data-precedence": l.precedence,
            href: null,
            precedence: null
          });
          return r = (e.ownerDocument || e).createElement(
            "style"
          ), gt(r), At(r, "style", s), qu(r, l.precedence, e), n.instance = r;
        case "stylesheet":
          s = ei(l.href);
          var c = e.querySelector(
            nr(s)
          );
          if (c)
            return n.state.loading |= 4, n.instance = c, gt(c), c;
          r = $h(l), (s = cn.get(s)) && zc(r, s), c = (e.ownerDocument || e).createElement("link"), gt(c);
          var d = c;
          return d._p = new Promise(function(v, S) {
            d.onload = v, d.onerror = S;
          }), At(c, "link", r), n.state.loading |= 4, qu(c, l.precedence, e), n.instance = c;
        case "script":
          return c = ti(l.src), (s = e.querySelector(
            ar(c)
          )) ? (n.instance = s, gt(s), s) : (r = l, (s = cn.get(c)) && (r = C({}, l), _c(r, s)), e = e.ownerDocument || e, s = e.createElement("script"), gt(s), At(s, "link", r), e.head.appendChild(s), n.instance = s);
        case "void":
          return null;
        default:
          throw Error(u(443, n.type));
      }
    else
      n.type === "stylesheet" && (n.state.loading & 4) === 0 && (r = n.instance, n.state.loading |= 4, qu(r, l.precedence, e));
    return n.instance;
  }
  function qu(e, n, l) {
    for (var r = l.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), s = r.length ? r[r.length - 1] : null, c = s, d = 0; d < r.length; d++) {
      var v = r[d];
      if (v.dataset.precedence === n) c = v;
      else if (c !== s) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (n = l.nodeType === 9 ? l.head : l, n.insertBefore(e, n.firstChild));
  }
  function zc(e, n) {
    e.crossOrigin == null && (e.crossOrigin = n.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = n.referrerPolicy), e.title == null && (e.title = n.title);
  }
  function _c(e, n) {
    e.crossOrigin == null && (e.crossOrigin = n.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = n.referrerPolicy), e.integrity == null && (e.integrity = n.integrity);
  }
  var Gu = null;
  function Kh(e, n, l) {
    if (Gu === null) {
      var r = /* @__PURE__ */ new Map(), s = Gu = /* @__PURE__ */ new Map();
      s.set(l, r);
    } else
      s = Gu, r = s.get(l), r || (r = /* @__PURE__ */ new Map(), s.set(l, r));
    if (r.has(e)) return r;
    for (r.set(e, null), l = l.getElementsByTagName(e), s = 0; s < l.length; s++) {
      var c = l[s];
      if (!(c[bi] || c[St] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var d = c.getAttribute(n) || "";
        d = e + d;
        var v = r.get(d);
        v ? v.push(c) : r.set(d, [c]);
      }
    }
    return r;
  }
  function Yh(e, n, l) {
    e = e.ownerDocument || e, e.head.insertBefore(
      l,
      n === "title" ? e.querySelector("head > title") : null
    );
  }
  function Iy(e, n, l) {
    if (l === 1 || n.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof n.precedence != "string" || typeof n.href != "string" || n.href === "")
          break;
        return !0;
      case "link":
        if (typeof n.rel != "string" || typeof n.href != "string" || n.href === "" || n.onLoad || n.onError)
          break;
        return n.rel === "stylesheet" ? (e = n.disabled, typeof n.precedence == "string" && e == null) : !0;
      case "script":
        if (n.async && typeof n.async != "function" && typeof n.async != "symbol" && !n.onLoad && !n.onError && n.src && typeof n.src == "string")
          return !0;
    }
    return !1;
  }
  function Xh(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function qy(e, n, l, r) {
    if (l.type === "stylesheet" && (typeof r.media != "string" || matchMedia(r.media).matches !== !1) && (l.state.loading & 4) === 0) {
      if (l.instance === null) {
        var s = ei(r.href), c = n.querySelector(
          nr(s)
        );
        if (c) {
          n = c._p, n !== null && typeof n == "object" && typeof n.then == "function" && (e.count++, e = Fu.bind(e), n.then(e, e)), l.state.loading |= 4, l.instance = c, gt(c);
          return;
        }
        c = n.ownerDocument || n, r = $h(r), (s = cn.get(s)) && zc(r, s), c = c.createElement("link"), gt(c);
        var d = c;
        d._p = new Promise(function(v, S) {
          d.onload = v, d.onerror = S;
        }), At(c, "link", r), l.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(l, n), (n = l.state.preload) && (l.state.loading & 3) === 0 && (e.count++, l = Fu.bind(e), n.addEventListener("load", l), n.addEventListener("error", l));
    }
  }
  var kc = 0;
  function Gy(e, n) {
    return e.stylesheets && e.count === 0 && Vu(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(l) {
      var r = setTimeout(function() {
        if (e.stylesheets && Vu(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + n);
      0 < e.imgBytes && kc === 0 && (kc = 62500 * xy());
      var s = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Vu(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > kc ? 50 : 800) + n
      );
      return e.unsuspend = l, function() {
        e.unsuspend = null, clearTimeout(r), clearTimeout(s);
      };
    } : null;
  }
  function Fu() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Vu(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var $u = null;
  function Vu(e, n) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, $u = /* @__PURE__ */ new Map(), n.forEach(Fy, e), $u = null, Fu.call(e));
  }
  function Fy(e, n) {
    if (!(n.state.loading & 4)) {
      var l = $u.get(e);
      if (l) var r = l.get(null);
      else {
        l = /* @__PURE__ */ new Map(), $u.set(e, l);
        for (var s = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < s.length; c++) {
          var d = s[c];
          (d.nodeName === "LINK" || d.getAttribute("media") !== "not all") && (l.set(d.dataset.precedence, d), r = d);
        }
        r && l.set(null, r);
      }
      s = n.instance, d = s.getAttribute("data-precedence"), c = l.get(d) || r, c === r && l.set(null, s), l.set(d, s), this.count++, r = Fu.bind(this), s.addEventListener("load", r), s.addEventListener("error", r), c ? c.parentNode.insertBefore(s, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(s, e.firstChild)), n.state.loading |= 4;
    }
  }
  var lr = {
    $$typeof: oe,
    Provider: null,
    Consumer: null,
    _currentValue: X,
    _currentValue2: X,
    _threadCount: 0
  };
  function $y(e, n, l, r, s, c, d, v, S) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ls(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ls(0), this.hiddenUpdates = Ls(null), this.identifierPrefix = r, this.onUncaughtError = s, this.onCaughtError = c, this.onRecoverableError = d, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = S, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Zh(e, n, l, r, s, c, d, v, S, M, D, k) {
    return e = new $y(
      e,
      n,
      l,
      d,
      S,
      M,
      D,
      k,
      v
    ), n = 1, c === !0 && (n |= 24), c = Yt(3, null, null, n), e.current = c, c.stateNode = e, n = po(), n.refCount++, e.pooledCache = n, n.refCount++, c.memoizedState = {
      element: r,
      isDehydrated: l,
      cache: n
    }, bo(c), e;
  }
  function Qh(e) {
    return e ? (e = wl, e) : wl;
  }
  function Ph(e, n, l, r, s, c) {
    s = Qh(s), r.context === null ? r.context = s : r.pendingContext = s, r = va(n), r.payload = { element: l }, c = c === void 0 ? null : c, c !== null && (r.callback = c), l = ya(e, r, n), l !== null && (Ht(l, e, n), ki(l, e, n));
  }
  function Jh(e, n) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var l = e.retryLane;
      e.retryLane = l !== 0 && l < n ? l : n;
    }
  }
  function Uc(e, n) {
    Jh(e, n), (e = e.alternate) && Jh(e, n);
  }
  function Wh(e) {
    if (e.tag === 13 || e.tag === 31) {
      var n = Za(e, 67108864);
      n !== null && Ht(n, e, 67108864), Uc(e, 67108864);
    }
  }
  function ep(e) {
    if (e.tag === 13 || e.tag === 31) {
      var n = Jt();
      n = Rs(n);
      var l = Za(e, n);
      l !== null && Ht(l, e, n), Uc(e, n);
    }
  }
  var Ku = !0;
  function Vy(e, n, l, r) {
    var s = w.T;
    w.T = null;
    var c = G.p;
    try {
      G.p = 2, Hc(e, n, l, r);
    } finally {
      G.p = c, w.T = s;
    }
  }
  function Ky(e, n, l, r) {
    var s = w.T;
    w.T = null;
    var c = G.p;
    try {
      G.p = 8, Hc(e, n, l, r);
    } finally {
      G.p = c, w.T = s;
    }
  }
  function Hc(e, n, l, r) {
    if (Ku) {
      var s = Bc(r);
      if (s === null)
        Ec(
          e,
          n,
          r,
          Yu,
          l
        ), np(e, r);
      else if (Xy(
        s,
        e,
        n,
        l,
        r
      ))
        r.stopPropagation();
      else if (np(e, r), n & 4 && -1 < Yy.indexOf(e)) {
        for (; s !== null; ) {
          var c = Sl(s);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var d = $a(c.pendingLanes);
                  if (d !== 0) {
                    var v = c;
                    for (v.pendingLanes |= 2, v.entangledLanes |= 2; d; ) {
                      var S = 1 << 31 - Vt(d);
                      v.entanglements[1] |= S, d &= ~S;
                    }
                    Mn(c), (Ne & 6) === 0 && (Ou = Ft() + 500, Ji(0));
                  }
                }
                break;
              case 31:
              case 13:
                v = Za(c, 2), v !== null && Ht(v, c, 2), Ru(), Uc(c, 2);
            }
          if (c = Bc(r), c === null && Ec(
            e,
            n,
            r,
            Yu,
            l
          ), c === s) break;
          s = c;
        }
        s !== null && r.stopPropagation();
      } else
        Ec(
          e,
          n,
          r,
          null,
          l
        );
    }
  }
  function Bc(e) {
    return e = Is(e), Ic(e);
  }
  var Yu = null;
  function Ic(e) {
    if (Yu = null, e = Cl(e), e !== null) {
      var n = f(e);
      if (n === null) e = null;
      else {
        var l = n.tag;
        if (l === 13) {
          if (e = m(n), e !== null) return e;
          e = null;
        } else if (l === 31) {
          if (e = p(n), e !== null) return e;
          e = null;
        } else if (l === 3) {
          if (n.stateNode.current.memoizedState.isDehydrated)
            return n.tag === 3 ? n.stateNode.containerInfo : null;
          e = null;
        } else n !== e && (e = null);
      }
    }
    return Yu = e, null;
  }
  function tp(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (w2()) {
          case od:
            return 2;
          case cd:
            return 8;
          case kr:
          case D2:
            return 32;
          case fd:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var qc = !1, Oa = null, La = null, Ra = null, ir = /* @__PURE__ */ new Map(), rr = /* @__PURE__ */ new Map(), wa = [], Yy = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function np(e, n) {
    switch (e) {
      case "focusin":
      case "focusout":
        Oa = null;
        break;
      case "dragenter":
      case "dragleave":
        La = null;
        break;
      case "mouseover":
      case "mouseout":
        Ra = null;
        break;
      case "pointerover":
      case "pointerout":
        ir.delete(n.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        rr.delete(n.pointerId);
    }
  }
  function ur(e, n, l, r, s, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: n,
      domEventName: l,
      eventSystemFlags: r,
      nativeEvent: c,
      targetContainers: [s]
    }, n !== null && (n = Sl(n), n !== null && Wh(n)), e) : (e.eventSystemFlags |= r, n = e.targetContainers, s !== null && n.indexOf(s) === -1 && n.push(s), e);
  }
  function Xy(e, n, l, r, s) {
    switch (n) {
      case "focusin":
        return Oa = ur(
          Oa,
          e,
          n,
          l,
          r,
          s
        ), !0;
      case "dragenter":
        return La = ur(
          La,
          e,
          n,
          l,
          r,
          s
        ), !0;
      case "mouseover":
        return Ra = ur(
          Ra,
          e,
          n,
          l,
          r,
          s
        ), !0;
      case "pointerover":
        var c = s.pointerId;
        return ir.set(
          c,
          ur(
            ir.get(c) || null,
            e,
            n,
            l,
            r,
            s
          )
        ), !0;
      case "gotpointercapture":
        return c = s.pointerId, rr.set(
          c,
          ur(
            rr.get(c) || null,
            e,
            n,
            l,
            r,
            s
          )
        ), !0;
    }
    return !1;
  }
  function ap(e) {
    var n = Cl(e.target);
    if (n !== null) {
      var l = f(n);
      if (l !== null) {
        if (n = l.tag, n === 13) {
          if (n = m(l), n !== null) {
            e.blockedOn = n, vd(e.priority, function() {
              ep(l);
            });
            return;
          }
        } else if (n === 31) {
          if (n = p(l), n !== null) {
            e.blockedOn = n, vd(e.priority, function() {
              ep(l);
            });
            return;
          }
        } else if (n === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Xu(e) {
    if (e.blockedOn !== null) return !1;
    for (var n = e.targetContainers; 0 < n.length; ) {
      var l = Bc(e.nativeEvent);
      if (l === null) {
        l = e.nativeEvent;
        var r = new l.constructor(
          l.type,
          l
        );
        Bs = r, l.target.dispatchEvent(r), Bs = null;
      } else
        return n = Sl(l), n !== null && Wh(n), e.blockedOn = l, !1;
      n.shift();
    }
    return !0;
  }
  function lp(e, n, l) {
    Xu(e) && l.delete(n);
  }
  function Zy() {
    qc = !1, Oa !== null && Xu(Oa) && (Oa = null), La !== null && Xu(La) && (La = null), Ra !== null && Xu(Ra) && (Ra = null), ir.forEach(lp), rr.forEach(lp);
  }
  function Zu(e, n) {
    e.blockedOn === n && (e.blockedOn = null, qc || (qc = !0, t.unstable_scheduleCallback(
      t.unstable_NormalPriority,
      Zy
    )));
  }
  var Qu = null;
  function ip(e) {
    Qu !== e && (Qu = e, t.unstable_scheduleCallback(
      t.unstable_NormalPriority,
      function() {
        Qu === e && (Qu = null);
        for (var n = 0; n < e.length; n += 3) {
          var l = e[n], r = e[n + 1], s = e[n + 2];
          if (typeof r != "function") {
            if (Ic(r || l) === null)
              continue;
            break;
          }
          var c = Sl(l);
          c !== null && (e.splice(n, 3), n -= 3, Bo(
            c,
            {
              pending: !0,
              data: s,
              method: l.method,
              action: r
            },
            r,
            s
          ));
        }
      }
    ));
  }
  function ni(e) {
    function n(S) {
      return Zu(S, e);
    }
    Oa !== null && Zu(Oa, e), La !== null && Zu(La, e), Ra !== null && Zu(Ra, e), ir.forEach(n), rr.forEach(n);
    for (var l = 0; l < wa.length; l++) {
      var r = wa[l];
      r.blockedOn === e && (r.blockedOn = null);
    }
    for (; 0 < wa.length && (l = wa[0], l.blockedOn === null); )
      ap(l), l.blockedOn === null && wa.shift();
    if (l = (e.ownerDocument || e).$$reactFormReplay, l != null)
      for (r = 0; r < l.length; r += 3) {
        var s = l[r], c = l[r + 1], d = s[wt] || null;
        if (typeof c == "function")
          d || ip(l);
        else if (d) {
          var v = null;
          if (c && c.hasAttribute("formAction")) {
            if (s = c, d = c[wt] || null)
              v = d.formAction;
            else if (Ic(s) !== null) continue;
          } else v = d.action;
          typeof v == "function" ? l[r + 1] = v : (l.splice(r, 3), r -= 3), ip(l);
        }
      }
  }
  function rp() {
    function e(c) {
      c.canIntercept && c.info === "react-transition" && c.intercept({
        handler: function() {
          return new Promise(function(d) {
            return s = d;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function n() {
      s !== null && (s(), s = null), r || setTimeout(l, 20);
    }
    function l() {
      if (!r && !navigation.transition) {
        var c = navigation.currentEntry;
        c && c.url != null && navigation.navigate(c.url, {
          state: c.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var r = !1, s = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", n), navigation.addEventListener("navigateerror", n), setTimeout(l, 100), function() {
        r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", n), navigation.removeEventListener("navigateerror", n), s !== null && (s(), s = null);
      };
    }
  }
  function Gc(e) {
    this._internalRoot = e;
  }
  Pu.prototype.render = Gc.prototype.render = function(e) {
    var n = this._internalRoot;
    if (n === null) throw Error(u(409));
    var l = n.current, r = Jt();
    Ph(l, r, e, n, null, null);
  }, Pu.prototype.unmount = Gc.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var n = e.containerInfo;
      Ph(e.current, 2, null, e, null, null), Ru(), n[bl] = null;
    }
  };
  function Pu(e) {
    this._internalRoot = e;
  }
  Pu.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var n = gd();
      e = { blockedOn: null, target: e, priority: n };
      for (var l = 0; l < wa.length && n !== 0 && n < wa[l].priority; l++) ;
      wa.splice(l, 0, e), l === 0 && ap(e);
    }
  };
  var up = a.version;
  if (up !== "19.2.8")
    throw Error(
      u(
        527,
        up,
        "19.2.8"
      )
    );
  G.findDOMNode = function(e) {
    var n = e._reactInternals;
    if (n === void 0)
      throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
    return e = g(n), e = e !== null ? b(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Qy = {
    bundleType: 0,
    version: "19.2.8",
    rendererPackageName: "react-dom",
    currentDispatcherRef: w,
    reconcilerVersion: "19.2.8"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ju = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ju.isDisabled && Ju.supportsFiber)
      try {
        gi = Ju.inject(
          Qy
        ), $t = Ju;
      } catch {
      }
  }
  return or.createRoot = function(e, n) {
    if (!o(e)) throw Error(u(299));
    var l = !1, r = "", s = hm, c = pm, d = gm;
    return n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (r = n.identifierPrefix), n.onUncaughtError !== void 0 && (s = n.onUncaughtError), n.onCaughtError !== void 0 && (c = n.onCaughtError), n.onRecoverableError !== void 0 && (d = n.onRecoverableError)), n = Zh(
      e,
      1,
      !1,
      null,
      null,
      l,
      r,
      null,
      s,
      c,
      d,
      rp
    ), e[bl] = n.current, Tc(e), new Gc(n);
  }, or.hydrateRoot = function(e, n, l) {
    if (!o(e)) throw Error(u(299));
    var r = !1, s = "", c = hm, d = pm, v = gm, S = null;
    return l != null && (l.unstable_strictMode === !0 && (r = !0), l.identifierPrefix !== void 0 && (s = l.identifierPrefix), l.onUncaughtError !== void 0 && (c = l.onUncaughtError), l.onCaughtError !== void 0 && (d = l.onCaughtError), l.onRecoverableError !== void 0 && (v = l.onRecoverableError), l.formState !== void 0 && (S = l.formState)), n = Zh(
      e,
      1,
      !0,
      n,
      l ?? null,
      r,
      s,
      S,
      c,
      d,
      v,
      rp
    ), n.context = Qh(null), l = n.current, r = Jt(), r = Rs(r), s = va(r), s.callback = null, ya(l, s, r), l = r, n.current.lanes = l, yi(n, l), Mn(n), e[bl] = n.current, Tc(e), new Pu(n);
  }, or.version = "19.2.8", or;
}
var vp;
function r3() {
  if (vp) return Vc.exports;
  vp = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (a) {
        console.error(a);
      }
  }
  return t(), Vc.exports = i3(), Vc.exports;
}
var v0 = r3();
const te = (t) => typeof t == "string", cr = () => {
  let t, a;
  const i = new Promise((u, o) => {
    t = u, a = o;
  });
  return i.resolve = t, i.reject = a, i;
}, Zc = (t) => t == null ? "" : String(t), u3 = (t, a, i) => {
  t.forEach((u) => {
    a[u] && (i[u] = a[u]);
  });
}, s3 = /###/g, yp = (t) => t && t.includes("###") ? t.replace(s3, ".") : t, bp = (t) => !t || te(t), pr = (t, a, i) => {
  const u = te(a) ? a.split(".") : a;
  let o = 0;
  for (; o < u.length - 1; ) {
    if (bp(t)) return {};
    const f = yp(u[o]);
    !t[f] && i && (t[f] = new i()), Object.prototype.hasOwnProperty.call(t, f) ? t = t[f] : t = {}, ++o;
  }
  return bp(t) ? {} : {
    obj: t,
    k: yp(u[o])
  };
}, Cp = (t, a, i) => {
  const {
    obj: u,
    k: o
  } = pr(t, a, Object);
  if (u !== void 0 || a.length === 1) {
    u[o] = i;
    return;
  }
  let f = a[a.length - 1], m = a.slice(0, a.length - 1), p = pr(t, m, Object);
  for (; p.obj === void 0 && m.length; )
    f = `${m[m.length - 1]}.${f}`, m = m.slice(0, m.length - 1), p = pr(t, m, Object), p?.obj && typeof p.obj[`${p.k}.${f}`] < "u" && (p.obj = void 0);
  p.obj[`${p.k}.${f}`] = i;
}, o3 = (t, a, i, u) => {
  const {
    obj: o,
    k: f
  } = pr(t, a, Object);
  o[f] = o[f] || [], o[f].push(i);
}, ls = (t, a) => {
  const {
    obj: i,
    k: u
  } = pr(t, a);
  if (i && Object.prototype.hasOwnProperty.call(i, u))
    return i[u];
}, c3 = (t, a, i) => {
  const u = ls(t, i);
  return u !== void 0 ? u : ls(a, i);
}, y0 = (t, a, i) => {
  for (const u in a)
    u !== "__proto__" && u !== "constructor" && (Object.prototype.hasOwnProperty.call(t, u) ? te(t[u]) || t[u] instanceof String || te(a[u]) || a[u] instanceof String ? i && (t[u] = a[u]) : y0(t[u], a[u], i) : t[u] = a[u]);
  return t;
}, Wn = (t) => t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), f3 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;"
}, d3 = (t) => te(t) ? t.replace(/[&<>"'\/]/g, (a) => f3[a]) : t;
class m3 {
  constructor(a) {
    this.capacity = a, this.regExpMap = /* @__PURE__ */ new Map(), this.regExpQueue = [];
  }
  getRegExp(a) {
    const i = this.regExpMap.get(a);
    if (i !== void 0)
      return i;
    const u = new RegExp(a);
    return this.regExpQueue.length === this.capacity && this.regExpMap.delete(this.regExpQueue.shift()), this.regExpMap.set(a, u), this.regExpQueue.push(a), u;
  }
}
const h3 = [" ", ",", "?", "!", ";"], p3 = new m3(20), g3 = (t, a, i) => {
  a = a || "", i = i || "";
  const u = h3.filter((m) => !a.includes(m) && !i.includes(m));
  if (u.length === 0) return !0;
  const o = p3.getRegExp(`(${u.map((m) => m === "?" ? "\\?" : m).join("|")})`);
  let f = !o.test(t);
  if (!f) {
    const m = t.indexOf(i);
    m > 0 && !o.test(t.substring(0, m)) && (f = !0);
  }
  return f;
}, lf = (t, a, i = ".") => {
  if (!t) return;
  if (t[a])
    return Object.prototype.hasOwnProperty.call(t, a) ? t[a] : void 0;
  const u = a.split(i);
  let o = t;
  for (let f = 0; f < u.length; ) {
    if (!o || typeof o != "object")
      return;
    let m, p = "";
    for (let y = f; y < u.length; ++y)
      if (y !== f && (p += i), p += u[y], m = o[p], m !== void 0) {
        if (["string", "number", "boolean"].includes(typeof m) && y < u.length - 1)
          continue;
        f += y - f + 1;
        break;
      }
    o = m;
  }
  return o;
}, Cr = (t) => t?.replace(/_/g, "-"), v3 = {
  type: "logger",
  log(t) {
    this.output("log", t);
  },
  warn(t) {
    this.output("warn", t);
  },
  error(t) {
    this.output("error", t);
  },
  output(t, a) {
    console?.[t]?.apply?.(console, a);
  }
};
class is {
  constructor(a, i = {}) {
    this.init(a, i);
  }
  init(a, i = {}) {
    this.prefix = i.prefix || "i18next:", this.logger = a || v3, this.options = i, this.debug = i.debug;
  }
  log(...a) {
    return this.forward(a, "log", "", !0);
  }
  warn(...a) {
    return this.forward(a, "warn", "", !0);
  }
  error(...a) {
    return this.forward(a, "error", "");
  }
  deprecate(...a) {
    return this.forward(a, "warn", "WARNING DEPRECATED: ", !0);
  }
  forward(a, i, u, o) {
    return o && !this.debug ? null : (a = a.map((f) => te(f) ? f.replace(/[\r\n\x00-\x1F\x7F]/g, " ") : f), te(a[0]) && (a[0] = `${u}${this.prefix} ${a[0]}`), this.logger[i](a));
  }
  create(a) {
    return new is(this.logger, {
      prefix: `${this.prefix}:${a}:`,
      ...this.options
    });
  }
  clone(a) {
    return a = a || this.options, a.prefix = a.prefix || this.prefix, new is(this.logger, a);
  }
}
var Nn = new is();
class os {
  constructor() {
    this.observers = {};
  }
  on(a, i) {
    return a.split(" ").forEach((u) => {
      this.observers[u] || (this.observers[u] = /* @__PURE__ */ new Map());
      const o = this.observers[u].get(i) || 0;
      this.observers[u].set(i, o + 1);
    }), this;
  }
  off(a, i) {
    if (this.observers[a]) {
      if (!i) {
        delete this.observers[a];
        return;
      }
      this.observers[a].delete(i);
    }
  }
  once(a, i) {
    const u = (...o) => {
      i(...o), this.off(a, u);
    };
    return this.on(a, u), this;
  }
  emit(a, ...i) {
    this.observers[a] && Array.from(this.observers[a].entries()).forEach(([o, f]) => {
      for (let m = 0; m < f; m++)
        o(...i);
    }), this.observers["*"] && Array.from(this.observers["*"].entries()).forEach(([o, f]) => {
      for (let m = 0; m < f; m++)
        o(a, ...i);
    });
  }
}
class Sp extends os {
  constructor(a, i = {
    ns: ["translation"],
    defaultNS: "translation"
  }) {
    super(), this.data = a || {}, this.options = i, this.options.keySeparator === void 0 && (this.options.keySeparator = "."), this.options.ignoreJSONStructure === void 0 && (this.options.ignoreJSONStructure = !0);
  }
  addNamespaces(a) {
    this.options.ns.includes(a) || this.options.ns.push(a);
  }
  removeNamespaces(a) {
    const i = this.options.ns.indexOf(a);
    i > -1 && this.options.ns.splice(i, 1);
  }
  getResource(a, i, u, o = {}) {
    const f = o.keySeparator !== void 0 ? o.keySeparator : this.options.keySeparator, m = o.ignoreJSONStructure !== void 0 ? o.ignoreJSONStructure : this.options.ignoreJSONStructure;
    let p;
    a.includes(".") ? p = a.split(".") : (p = [a, i], u && (Array.isArray(u) ? p.push(...u) : te(u) && f ? p.push(...u.split(f)) : p.push(u)));
    const y = ls(this.data, p);
    return !y && !i && !u && a.includes(".") && (a = p[0], i = p[1], u = p.slice(2).join(".")), y || !m || !te(u) ? y : lf(this.data?.[a]?.[i], u, f);
  }
  addResource(a, i, u, o, f = {
    silent: !1
  }) {
    const m = f.keySeparator !== void 0 ? f.keySeparator : this.options.keySeparator;
    let p = [a, i];
    u && (p = p.concat(m ? u.split(m) : u)), a.includes(".") && (p = a.split("."), o = i, i = p[1]), this.addNamespaces(i), Cp(this.data, p, o), f.silent || this.emit("added", a, i, u, o);
  }
  addResources(a, i, u, o = {
    silent: !1
  }) {
    for (const f in u)
      (te(u[f]) || Array.isArray(u[f])) && this.addResource(a, i, f, u[f], {
        silent: !0
      });
    o.silent || this.emit("added", a, i, u);
  }
  addResourceBundle(a, i, u, o, f, m = {
    silent: !1,
    skipCopy: !1
  }) {
    let p = [a, i];
    a.includes(".") && (p = a.split("."), o = u, u = i, i = p[1]), this.addNamespaces(i);
    let y = ls(this.data, p) || {};
    m.skipCopy || (u = JSON.parse(JSON.stringify(u))), o ? y0(y, u, f) : y = {
      ...y,
      ...u
    }, Cp(this.data, p, y), m.silent || this.emit("added", a, i, u);
  }
  removeResourceBundle(a, i) {
    this.hasResourceBundle(a, i) && delete this.data[a][i], this.removeNamespaces(i), this.emit("removed", a, i);
  }
  hasResourceBundle(a, i) {
    return this.getResource(a, i) !== void 0;
  }
  getResourceBundle(a, i) {
    return i || (i = this.options.defaultNS), this.getResource(a, i);
  }
  getDataByLanguage(a) {
    return this.data[a];
  }
  hasLanguageSomeTranslations(a) {
    const i = this.getDataByLanguage(a);
    return !!(i && Object.keys(i) || []).find((o) => i[o] && Object.keys(i[o]).length > 0);
  }
  toJSON() {
    return this.data;
  }
}
var b0 = {
  processors: {},
  addPostProcessor(t) {
    this.processors[t.name] = t;
  },
  handle(t, a, i, u, o) {
    return t.forEach((f) => {
      a = this.processors[f]?.process(a, i, u, o) ?? a;
    }), a;
  }
};
const C0 = /* @__PURE__ */ Symbol("i18next/PATH_KEY");
function y3() {
  const t = [], a = /* @__PURE__ */ Object.create(null);
  let i;
  return a.get = (u, o) => (i?.revoke?.(), o === C0 ? t : (t.push(o), i = Proxy.revocable(u, a), i.proxy)), Proxy.revocable(/* @__PURE__ */ Object.create(null), a).proxy;
}
function li(t, a) {
  const {
    [C0]: i
  } = t(y3()), u = a?.keySeparator ?? ".", o = a?.nsSeparator ?? ":", f = a?.enableSelector === "strict";
  if (i.length > 1 && o) {
    const m = a?.ns, p = f ? Array.isArray(m) ? m : m ? [m] : null : Array.isArray(m) ? m : null;
    if (p && (f ? p : p.length > 1 ? p.slice(1) : []).includes(i[0]))
      return `${i[0]}${o}${i.slice(1).join(u)}`;
  }
  return i.join(u);
}
const Qc = (t) => !te(t) && typeof t != "boolean" && typeof t != "number";
class rs extends os {
  constructor(a, i = {}) {
    super(), u3(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], a, this), this.options = i, this.options.keySeparator === void 0 && (this.options.keySeparator = "."), this.logger = Nn.create("translator"), this.checkedLoadedFor = {};
  }
  changeLanguage(a) {
    a && (this.language = a);
  }
  exists(a, i = {
    interpolation: {}
  }) {
    const u = {
      ...i
    };
    if (a == null) return !1;
    const o = this.resolve(a, u);
    if (o?.res === void 0) return !1;
    const f = Qc(o.res);
    return !(u.returnObjects === !1 && f);
  }
  extractFromKey(a, i) {
    let u = i.nsSeparator !== void 0 ? i.nsSeparator : this.options.nsSeparator;
    u === void 0 && (u = ":");
    const o = i.keySeparator !== void 0 ? i.keySeparator : this.options.keySeparator;
    let f = i.ns || this.options.defaultNS || [];
    const m = u && a.includes(u), p = !this.options.userDefinedKeySeparator && !i.keySeparator && !this.options.userDefinedNsSeparator && !i.nsSeparator && !g3(a, u, o);
    if (m && !p) {
      const y = a.match(this.interpolator.nestingRegexp);
      if (y && y.length > 0)
        return {
          key: a,
          namespaces: te(f) ? [f] : f
        };
      const g = a.split(u);
      (u !== o || u === o && this.options.ns.includes(g[0])) && (f = g.shift()), a = g.join(o);
    }
    return {
      key: a,
      namespaces: te(f) ? [f] : f
    };
  }
  translate(a, i, u) {
    let o = typeof i == "object" ? {
      ...i
    } : i;
    if (typeof o != "object" && this.options.overloadTranslationOptionHandler && (o = this.options.overloadTranslationOptionHandler(arguments)), typeof o == "object" && (o = {
      ...o
    }), o || (o = {}), a == null) return "";
    typeof a == "function" && (a = li(a, {
      ...this.options,
      ...o
    })), Array.isArray(a) || (a = [String(a)]), a = a.map((ze) => typeof ze == "function" ? li(ze, {
      ...this.options,
      ...o
    }) : String(ze));
    const f = o.returnDetails !== void 0 ? o.returnDetails : this.options.returnDetails, m = o.keySeparator !== void 0 ? o.keySeparator : this.options.keySeparator, {
      key: p,
      namespaces: y
    } = this.extractFromKey(a[a.length - 1], o), g = y[y.length - 1];
    let b = o.nsSeparator !== void 0 ? o.nsSeparator : this.options.nsSeparator;
    b === void 0 && (b = ":");
    const C = o.lng || this.language, O = o.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (C?.toLowerCase() === "cimode")
      return O ? f ? {
        res: `${g}${b}${p}`,
        usedKey: p,
        exactUsedKey: p,
        usedLng: C,
        usedNS: g,
        usedParams: this.getUsedParamsDetails(o)
      } : `${g}${b}${p}` : f ? {
        res: p,
        usedKey: p,
        exactUsedKey: p,
        usedLng: C,
        usedNS: g,
        usedParams: this.getUsedParamsDetails(o)
      } : p;
    const U = this.resolve(a, o);
    let q = U?.res;
    const $ = U?.usedKey || p, ne = U?.exactUsedKey || p, P = ["[object Number]", "[object Function]", "[object RegExp]"], ie = o.joinArrays !== void 0 ? o.joinArrays : this.options.joinArrays, oe = !this.i18nFormat || this.i18nFormat.handleAsObject, H = o.count !== void 0 && !te(o.count), le = rs.hasDefaultValue(o), Le = H ? this.pluralResolver.getSuffix(C, o.count, o) : "", J = o.ordinal && H ? this.pluralResolver.getSuffix(C, o.count, {
      ordinal: !1
    }) : "", Ge = H && !o.ordinal && o.count === 0, Je = Ge && o[`defaultValue${this.options.pluralSeparator}zero`] || o[`defaultValue${Le}`] || o[`defaultValue${J}`] || o.defaultValue;
    let He = q;
    oe && !q && le && (He = Je);
    const ft = Qc(He), pt = Object.prototype.toString.apply(He);
    if (oe && He && ft && !P.includes(pt) && !(te(ie) && Array.isArray(He))) {
      if (!o.returnObjects && !this.options.returnObjects) {
        this.options.returnedObjectHandler || this.logger.warn("accessing an object - but returnObjects options is not enabled!");
        const ze = this.options.returnedObjectHandler ? this.options.returnedObjectHandler($, He, {
          ...o,
          ns: y
        }) : `key '${p} (${this.language})' returned an object instead of string.`;
        return f ? (U.res = ze, U.usedParams = this.getUsedParamsDetails(o), U) : ze;
      }
      if (m) {
        const ze = Array.isArray(He), Qe = ze ? [] : {}, Ct = ze ? ne : $;
        for (const w in He)
          if (Object.prototype.hasOwnProperty.call(He, w)) {
            const G = `${Ct}${m}${w}`;
            le && !q ? Qe[w] = this.translate(G, {
              ...o,
              defaultValue: Qc(Je) ? Je[w] : void 0,
              joinArrays: !1,
              ns: y
            }) : Qe[w] = this.translate(G, {
              ...o,
              joinArrays: !1,
              ns: y
            }), Qe[w] === G && (Qe[w] = He[w]);
          }
        q = Qe;
      }
    } else if (oe && te(ie) && Array.isArray(q))
      q = q.join(ie), q && (q = this.extendTranslation(q, a, o, u));
    else {
      let ze = !1, Qe = !1;
      !this.isValidLookup(q) && le && (ze = !0, q = Je), this.isValidLookup(q) || (Qe = !0, q = p);
      const w = (o.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey) && Qe ? void 0 : q, G = le && Je !== q && this.options.updateMissing;
      if (Qe || ze || G) {
        if (this.logger.log(G ? "updateKey" : "missingKey", C, g, H && !G ? `${p}${this.pluralResolver.getSuffix(C, o.count, o)}` : p, G ? Je : q), m) {
          const x = this.resolve(p, {
            ...o,
            keySeparator: !1
          });
          x && x.res && this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
        }
        let X = [];
        const ge = this.languageUtils.getFallbackCodes(this.options.fallbackLng, o.lng || this.language);
        if (this.options.saveMissingTo === "fallback" && ge && ge[0])
          for (let x = 0; x < ge.length; x++)
            X.push(ge[x]);
        else this.options.saveMissingTo === "all" ? X = this.languageUtils.toResolveHierarchy(o.lng || this.language) : X.push(o.lng || this.language);
        const xe = (x, z, F) => {
          const B = le && F !== q ? F : w;
          this.options.missingKeyHandler ? this.options.missingKeyHandler(x, g, z, B, G, o) : this.backendConnector?.saveMissing && this.backendConnector.saveMissing(x, g, z, B, G, o), this.emit("missingKey", x, g, z, q);
        };
        this.options.saveMissing && (this.options.saveMissingPlurals && H ? X.forEach((x) => {
          const z = this.pluralResolver.getSuffixes(x, o);
          Ge && o[`defaultValue${this.options.pluralSeparator}zero`] && !z.includes(`${this.options.pluralSeparator}zero`) && z.push(`${this.options.pluralSeparator}zero`), z.forEach((F) => {
            xe([x], p + F, o[`defaultValue${F}`] || Je);
          });
        }) : xe(X, p, Je));
      }
      q = this.extendTranslation(q, a, o, U, u), Qe && q === p && this.options.appendNamespaceToMissingKey && (q = `${g}${b}${p}`), (Qe || ze) && this.options.parseMissingKeyHandler && (q = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${g}${b}${p}` : p, ze ? q : void 0, o));
    }
    return f ? (U.res = q, U.usedParams = this.getUsedParamsDetails(o), U) : q;
  }
  extendTranslation(a, i, u, o, f) {
    if (this.i18nFormat?.parse)
      a = this.i18nFormat.parse(a, {
        ...this.options.interpolation.defaultVariables,
        ...u
      }, u.lng || this.language || o.usedLng, o.usedNS, o.usedKey, {
        resolved: o
      });
    else if (!u.skipInterpolation) {
      u.interpolation && this.interpolator.init({
        ...u,
        interpolation: {
          ...this.options.interpolation,
          ...u.interpolation
        }
      });
      const y = te(a) && (u?.interpolation?.skipOnVariables !== void 0 ? u.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
      let g;
      if (y) {
        const C = a.match(this.interpolator.nestingRegexp);
        g = C && C.length;
      }
      let b = u.replace && !te(u.replace) ? u.replace : u;
      if (this.options.interpolation.defaultVariables && (b = {
        ...this.options.interpolation.defaultVariables,
        ...b
      }), a = this.interpolator.interpolate(a, b, u.lng || this.language || o.usedLng, u), y) {
        const C = a.match(this.interpolator.nestingRegexp), O = C && C.length;
        g < O && (u.nest = !1);
      }
      !u.lng && o && o.res && (u.lng = this.language || o.usedLng), u.nest !== !1 && (a = this.interpolator.nest(a, (...C) => f?.[0] === C[0] && !u.context ? (this.logger.warn(`It seems you are nesting recursively key: ${C[0]} in key: ${i[0]}`), null) : this.translate(...C, i), u)), u.interpolation && this.interpolator.reset();
    }
    const m = u.postProcess || this.options.postProcess, p = te(m) ? [m] : m;
    return a != null && p?.length && u.applyPostProcessor !== !1 && (a = b0.handle(p, a, i, this.options && this.options.postProcessPassResolved ? {
      i18nResolved: {
        ...o,
        usedParams: this.getUsedParamsDetails(u)
      },
      ...u
    } : u, this)), a;
  }
  resolve(a, i = {}) {
    let u, o, f, m, p;
    return te(a) && (a = [a]), Array.isArray(a) && (a = a.map((y) => typeof y == "function" ? li(y, {
      ...this.options,
      ...i
    }) : y)), a.forEach((y) => {
      if (this.isValidLookup(u)) return;
      const g = this.extractFromKey(y, i), b = g.key;
      o = b;
      let C = g.namespaces;
      this.options.fallbackNS && (C = C.concat(this.options.fallbackNS));
      const O = i.count !== void 0 && !te(i.count), U = O && !i.ordinal && i.count === 0, q = i.context !== void 0 && (te(i.context) || typeof i.context == "number") && i.context !== "", $ = i.lngs ? i.lngs : this.languageUtils.toResolveHierarchy(i.lng || this.language, i.fallbackLng);
      C.forEach((ne) => {
        this.isValidLookup(u) || (p = ne, !this.checkedLoadedFor[`${$[0]}-${ne}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(p) && (this.checkedLoadedFor[`${$[0]}-${ne}`] = !0, this.logger.warn(`key "${o}" for languages "${$.join(", ")}" won't get resolved as namespace "${p}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")), $.forEach((P) => {
          if (this.isValidLookup(u)) return;
          m = P;
          const ie = [b];
          if (this.i18nFormat?.addLookupKeys)
            this.i18nFormat.addLookupKeys(ie, b, P, ne, i);
          else {
            let H;
            O && (H = this.pluralResolver.getSuffix(P, i.count, i));
            const le = `${this.options.pluralSeparator}zero`, Le = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
            if (O && (i.ordinal && H.startsWith(Le) && ie.push(b + H.replace(Le, this.options.pluralSeparator)), ie.push(b + H), U && ie.push(b + le)), q) {
              const J = `${b}${this.options.contextSeparator || "_"}${i.context}`;
              ie.push(J), O && (i.ordinal && H.startsWith(Le) && ie.push(J + H.replace(Le, this.options.pluralSeparator)), ie.push(J + H), U && ie.push(J + le));
            }
          }
          let oe;
          for (; oe = ie.pop(); )
            this.isValidLookup(u) || (f = oe, u = this.getResource(P, ne, oe, i));
        }));
      });
    }), {
      res: u,
      usedKey: o,
      exactUsedKey: f,
      usedLng: m,
      usedNS: p
    };
  }
  isValidLookup(a) {
    return a !== void 0 && !(!this.options.returnNull && a === null) && !(!this.options.returnEmptyString && a === "");
  }
  getResource(a, i, u, o = {}) {
    return this.i18nFormat?.getResource ? this.i18nFormat.getResource(a, i, u, o) : this.resourceStore.getResource(a, i, u, o);
  }
  getUsedParamsDetails(a = {}) {
    const i = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"], u = a.replace && !te(a.replace);
    let o = u ? a.replace : a;
    if (u && typeof a.count < "u" && (o = {
      ...o,
      count: a.count
    }), this.options.interpolation.defaultVariables && (o = {
      ...this.options.interpolation.defaultVariables,
      ...o
    }), !u) {
      o = {
        ...o
      };
      for (const f of i)
        delete o[f];
    }
    return o;
  }
  static hasDefaultValue(a) {
    const i = "defaultValue";
    for (const u in a)
      if (Object.prototype.hasOwnProperty.call(a, u) && u.startsWith(i) && a[u] !== void 0)
        return !0;
    return !1;
  }
}
class xp {
  constructor(a) {
    this.options = a, this.supportedLngs = this.options.supportedLngs || !1, this.logger = Nn.create("languageUtils"), this.resolveHierarchyCache = {};
  }
  clearCache() {
    this.resolveHierarchyCache = {};
  }
  getScriptPartFromCode(a) {
    if (a = Cr(a), !a || !a.includes("-")) return null;
    const i = a.split("-");
    return i.length === 2 || (i.pop(), i[i.length - 1].toLowerCase() === "x") ? null : this.formatLanguageCode(i.join("-"));
  }
  getLanguagePartFromCode(a) {
    if (a = Cr(a), !a || !a.includes("-")) return a;
    const i = a.split("-");
    return this.formatLanguageCode(i[0]);
  }
  formatLanguageCode(a) {
    if (te(a) && a.includes("-")) {
      let i;
      try {
        i = Intl.getCanonicalLocales(a)[0];
      } catch {
      }
      return i && this.options.lowerCaseLng && (i = i.toLowerCase()), i || (this.options.lowerCaseLng ? a.toLowerCase() : a);
    }
    return this.options.cleanCode || this.options.lowerCaseLng ? a.toLowerCase() : a;
  }
  isSupportedCode(a) {
    return (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) && (a = this.getLanguagePartFromCode(a)), !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.includes(a);
  }
  getBestMatchFromCodes(a) {
    if (!a) return null;
    let i;
    return a.forEach((u) => {
      if (i) return;
      const o = this.formatLanguageCode(u);
      (!this.options.supportedLngs || this.isSupportedCode(o)) && (i = o);
    }), !i && this.options.supportedLngs && a.forEach((u) => {
      if (i) return;
      const o = this.getScriptPartFromCode(u);
      if (this.isSupportedCode(o)) return i = o;
      const f = this.getLanguagePartFromCode(u);
      if (this.isSupportedCode(f)) return i = f;
      i = this.options.supportedLngs.find((m) => m === f ? !0 : !m.includes("-") && !f.includes("-") ? !1 : !!(m.includes("-") && !f.includes("-") && m.slice(0, m.indexOf("-")) === f || m.startsWith(f) && f.length > 1));
    }), i || (i = this.getFallbackCodes(this.options.fallbackLng)[0]), i;
  }
  getFallbackCodes(a, i) {
    if (!a) return [];
    if (typeof a == "function" && (a = a(i)), te(a) && (a = [a]), Array.isArray(a)) return a;
    if (!i) return a.default || [];
    let u = a[i];
    return u || (u = a[this.getScriptPartFromCode(i)]), u || (u = a[this.formatLanguageCode(i)]), u || (u = a[this.getLanguagePartFromCode(i)]), u || (u = a.default), u || [];
  }
  toResolveHierarchy(a, i) {
    const u = this.options.fallbackLng, o = Array.isArray(u) ? u.join("|") : u;
    o !== this._cachedFallbackLng && (this.resolveHierarchyCache = {}, this._cachedFallbackLng = o);
    const f = i === void 0 || i === !1 || te(i), m = i === void 0 && typeof this.options.fallbackLng == "function", p = te(a) && f && !m;
    let y = null;
    if (p) {
      let O;
      i === void 0 ? O = "undefined" : i === !1 ? O = "boolean:false" : O = `string:${i}`, y = `${a.length}:${a}|${O}`;
    }
    if (y !== null) {
      const O = this.resolveHierarchyCache[y];
      if (O !== void 0) return O.slice();
    }
    const g = this.getFallbackCodes((i === !1 ? [] : i) || this.options.fallbackLng || [], a), b = [], C = (O) => {
      O && (this.isSupportedCode(O) ? b.push(O) : this.logger.warn(`rejecting language code not found in supportedLngs: ${O}`));
    };
    return te(a) && (a.includes("-") || a.includes("_")) ? (this.options.load !== "languageOnly" && C(this.formatLanguageCode(a)), this.options.load !== "languageOnly" && this.options.load !== "currentOnly" && C(this.getScriptPartFromCode(a)), this.options.load !== "currentOnly" && C(this.getLanguagePartFromCode(a))) : te(a) && C(this.formatLanguageCode(a)), g.forEach((O) => {
      b.includes(O) || C(this.formatLanguageCode(O));
    }), y !== null ? (this.resolveHierarchyCache[y] = b, b.slice()) : b;
  }
}
const Tp = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
}, Ep = {
  select: (t) => t === 1 ? "one" : "other",
  resolvedOptions: () => ({
    pluralCategories: ["one", "other"]
  })
};
class b3 {
  constructor(a, i = {}) {
    this.languageUtils = a, this.options = i, this.logger = Nn.create("pluralResolver"), this.pluralRulesCache = {};
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(a, i = {}) {
    const u = Cr(a === "dev" ? "en" : a), o = i.ordinal ? "ordinal" : "cardinal", f = JSON.stringify({
      cleanedCode: u,
      type: o
    });
    if (f in this.pluralRulesCache)
      return this.pluralRulesCache[f];
    let m;
    try {
      m = new Intl.PluralRules(u, {
        type: o
      });
    } catch {
      if (typeof Intl > "u")
        return this.logger.error("No Intl support, please use an Intl polyfill!"), Ep;
      if (!a.match(/-|_/)) return Ep;
      const y = this.languageUtils.getLanguagePartFromCode(a);
      m = this.getRule(y, i);
    }
    return this.pluralRulesCache[f] = m, m;
  }
  needsPlural(a, i = {}) {
    let u = this.getRule(a, i);
    return u || (u = this.getRule("dev", i)), u?.resolvedOptions().pluralCategories.length > 1;
  }
  getPluralFormsOfKey(a, i, u = {}) {
    return this.getSuffixes(a, u).map((o) => `${i}${o}`);
  }
  getSuffixes(a, i = {}) {
    let u = this.getRule(a, i);
    return u || (u = this.getRule("dev", i)), u ? u.resolvedOptions().pluralCategories.sort((o, f) => Tp[o] - Tp[f]).map((o) => `${this.options.prepend}${i.ordinal ? `ordinal${this.options.prepend}` : ""}${o}`) : [];
  }
  getSuffix(a, i, u = {}) {
    const o = this.getRule(a, u);
    return o ? `${this.options.prepend}${u.ordinal ? `ordinal${this.options.prepend}` : ""}${o.select(i)}` : (this.logger.warn(`no plural rule found for: ${a}`), this.getSuffix("dev", i, u));
  }
}
const Ap = (t, a, i, u = ".", o = !0) => {
  let f = c3(t, a, i);
  return !f && o && te(i) && (f = lf(t, i, u), f === void 0 && (f = lf(a, i, u))), f;
}, jp = (t) => t.replace(/\$/g, "$$$$");
class Mp {
  constructor(a = {}) {
    this.logger = Nn.create("interpolator"), this.options = a, this.format = a?.interpolation?.format || ((i) => i), this.init(a);
  }
  init(a = {}) {
    a.interpolation || (a.interpolation = {
      escapeValue: !0
    });
    const {
      escape: i,
      escapeValue: u,
      useRawValueToEscape: o,
      prefix: f,
      prefixEscaped: m,
      suffix: p,
      suffixEscaped: y,
      formatSeparator: g,
      unescapeSuffix: b,
      unescapePrefix: C,
      nestingPrefix: O,
      nestingPrefixEscaped: U,
      nestingSuffix: q,
      nestingSuffixEscaped: $,
      nestingOptionsSeparator: ne,
      maxReplaces: P,
      alwaysFormat: ie
    } = a.interpolation;
    this.escape = i !== void 0 ? i : d3, this.escapeValue = u !== void 0 ? u : !0, this.useRawValueToEscape = o !== void 0 ? o : !1, this.prefix = f ? Wn(f) : m || "{{", this.suffix = p ? Wn(p) : y || "}}", this.formatSeparator = g || ",", this.unescapePrefix = b ? "" : C ? Wn(C) : "-", this.unescapeSuffix = this.unescapePrefix ? "" : b ? Wn(b) : "", this.nestingPrefix = O ? Wn(O) : U || Wn("$t("), this.nestingSuffix = q ? Wn(q) : $ || Wn(")"), this.nestingOptionsSeparator = ne || ",", this.maxReplaces = P || 1e3, this.alwaysFormat = ie !== void 0 ? ie : !1, this.resetRegExp();
  }
  reset() {
    this.options && this.init(this.options);
  }
  resetRegExp() {
    const a = (i, u) => i?.source === u ? (i.lastIndex = 0, i) : new RegExp(u, "g");
    this.regexp = a(this.regexp, `${this.prefix}(.+?)${this.suffix}`), this.regexpUnescape = a(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`), this.nestingRegexp = a(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`);
  }
  interpolate(a, i, u, o) {
    let f, m, p;
    const y = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {}, g = (U) => {
      if (!U.includes(this.formatSeparator)) {
        const P = Ap(i, y, U, this.options.keySeparator, this.options.ignoreJSONStructure);
        return this.alwaysFormat ? this.format(P, void 0, u, {
          ...o,
          ...i,
          interpolationkey: U
        }) : P;
      }
      const q = U.split(this.formatSeparator), $ = q.shift().trim(), ne = q.join(this.formatSeparator).trim();
      return this.format(Ap(i, y, $, this.options.keySeparator, this.options.ignoreJSONStructure), ne, u, {
        ...o,
        ...i,
        interpolationkey: $
      });
    };
    this.resetRegExp(), !this.escapeValue && typeof a == "string" && /\$t\([^)]*\{[^}]*\{\{/.test(a) && this.logger.warn("nesting options string contains interpolated variables with escapeValue: false — if any of those values are attacker-controlled they can inject additional nesting options (e.g. redirect lng/ns). Sanitise untrusted input before passing it to t(), or keep escapeValue: true.");
    const b = o?.missingInterpolationHandler || this.options.missingInterpolationHandler, C = o?.interpolation?.skipOnVariables !== void 0 ? o.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
    return [{
      regex: this.regexpUnescape,
      safeValue: (U) => U
    }, {
      regex: this.regexp,
      safeValue: (U) => this.escapeValue ? this.escape(U) : U
    }].forEach((U) => {
      for (p = 0; f = U.regex.exec(a); ) {
        const q = f[1].trim();
        if (m = g(q), m === void 0)
          if (typeof b == "function") {
            const ne = b(a, f, o);
            m = te(ne) ? ne : "";
          } else if (o && Object.prototype.hasOwnProperty.call(o, q))
            m = "";
          else if (C) {
            m = f[0];
            continue;
          } else
            this.logger.warn(`missed to pass in variable ${q} for interpolating ${a}`), m = "";
        else !te(m) && !this.useRawValueToEscape && (m = Zc(m));
        const $ = U.safeValue(m);
        if (a = a.replace(f[0], jp($)), C ? (U.regex.lastIndex += $.length, U.regex.lastIndex -= f[0].length) : U.regex.lastIndex = 0, p++, p >= this.maxReplaces)
          break;
      }
    }), a;
  }
  nest(a, i, u = {}) {
    let o, f, m;
    const p = (y, g) => {
      const b = this.nestingOptionsSeparator;
      if (!y.includes(b)) return y;
      const C = y.split(new RegExp(`${Wn(b)}[ ]*{`));
      let O = `{${C[1]}`;
      y = C[0], O = this.interpolate(O, m);
      const U = O.match(/'/g), q = O.match(/"/g);
      ((U?.length ?? 0) % 2 === 0 && !q || (q?.length ?? 0) % 2 !== 0) && (O = O.replace(/'/g, '"'));
      try {
        m = JSON.parse(O), g && (m = {
          ...g,
          ...m
        });
      } catch ($) {
        return this.logger.warn(`failed parsing options string in nesting for key ${y}`, $), `${y}${b}${O}`;
      }
      return m.defaultValue && m.defaultValue.includes(this.prefix) && delete m.defaultValue, y;
    };
    for (; o = this.nestingRegexp.exec(a); ) {
      let y = [];
      m = {
        ...u
      }, m = m.replace && !te(m.replace) ? m.replace : m, m.applyPostProcessor = !1, delete m.defaultValue;
      const g = /{.*}/s.test(o[1]) ? o[1].lastIndexOf("}") + 1 : o[1].indexOf(this.formatSeparator);
      if (g !== -1 && (y = o[1].slice(g).split(this.formatSeparator).map((b) => b.trim()).filter(Boolean), o[1] = o[1].slice(0, g)), f = i(p.call(this, o[1].trim(), m), m), f && o[0] === a && !te(f)) return f;
      te(f) || (f = Zc(f)), f || (this.logger.warn(`missed to resolve ${o[1]} for nesting ${a}`), f = ""), y.length && (f = y.reduce((b, C) => this.format(b, C, u.lng, {
        ...u,
        interpolationkey: o[1].trim()
      }), f.trim())), a = a.replace(o[0], jp(Zc(f))), this.regexp.lastIndex = 0;
    }
    return a;
  }
}
const C3 = (t) => {
  let a = t.toLowerCase().trim();
  const i = {};
  if (t.includes("(")) {
    const u = t.split("(");
    a = u[0].toLowerCase().trim();
    const o = u[1].slice(0, -1);
    a === "currency" && !o.includes(":") ? i.currency || (i.currency = o.trim()) : a === "relativetime" && !o.includes(":") ? i.range || (i.range = o.trim()) : o.split(";").forEach((m) => {
      if (m) {
        const [p, ...y] = m.split(":"), g = y.join(":").trim().replace(/^'+|'+$/g, ""), b = p.trim();
        i[b] || (i[b] = g), g === "false" && (i[b] = !1), g === "true" && (i[b] = !0), isNaN(g) || (i[b] = parseInt(g, 10));
      }
    });
  }
  return {
    formatName: a,
    formatOptions: i
  };
}, Np = (t) => {
  const a = {};
  return (i, u, o) => {
    let f = o;
    o && o.interpolationkey && o.formatParams && o.formatParams[o.interpolationkey] && o[o.interpolationkey] && (f = {
      ...f,
      [o.interpolationkey]: void 0
    });
    const m = u + JSON.stringify(f);
    let p = a[m];
    return p || (p = t(Cr(u), o), a[m] = p), p(i);
  };
}, S3 = (t) => (a, i, u) => t(Cr(i), u)(a);
class x3 {
  constructor(a = {}) {
    this.logger = Nn.create("formatter"), this.options = a, this.init(a);
  }
  init(a, i = {
    interpolation: {}
  }) {
    this.formatSeparator = i.interpolation.formatSeparator || ",";
    const u = i.cacheInBuiltFormats ? Np : S3;
    this.formats = {
      number: u((o, f) => {
        const m = new Intl.NumberFormat(o, {
          ...f
        });
        return (p) => m.format(p);
      }),
      currency: u((o, f) => {
        const m = new Intl.NumberFormat(o, {
          ...f,
          style: "currency"
        });
        return (p) => m.format(p);
      }),
      datetime: u((o, f) => {
        const m = new Intl.DateTimeFormat(o, {
          ...f
        });
        return (p) => m.format(p);
      }),
      relativetime: u((o, f) => {
        const m = new Intl.RelativeTimeFormat(o, {
          ...f
        });
        return (p) => m.format(p, f.range || "day");
      }),
      list: u((o, f) => {
        const m = new Intl.ListFormat(o, {
          ...f
        });
        return (p) => m.format(p);
      })
    };
  }
  add(a, i) {
    this.formats[a.toLowerCase().trim()] = i;
  }
  addCached(a, i) {
    this.formats[a.toLowerCase().trim()] = Np(i);
  }
  format(a, i, u, o = {}) {
    if (!i || a == null) return a;
    const f = i.split(this.formatSeparator), m = [];
    for (let y = 0; y < f.length; y++) {
      let g = f[y];
      for (; g.indexOf("(") > -1 && !g.includes(")") && y + 1 < f.length; )
        g = `${g}${this.formatSeparator}${f[++y]}`;
      m.push(g);
    }
    return m.reduce((y, g) => {
      const {
        formatName: b,
        formatOptions: C
      } = C3(g);
      if (this.formats[b]) {
        let O = y;
        try {
          const U = o?.formatParams?.[o.interpolationkey] || {}, q = U.locale || U.lng || o.locale || o.lng || u;
          O = this.formats[b](y, q, {
            ...C,
            ...o,
            ...U
          });
        } catch (U) {
          this.logger.warn(U);
        }
        return O;
      } else
        this.logger.warn(`there was no format function for ${b}`);
      return y;
    }, a);
  }
}
const T3 = (t, a) => {
  t.pending[a] !== void 0 && (delete t.pending[a], t.pendingCount--);
};
class E3 extends os {
  constructor(a, i, u, o = {}) {
    super(), this.backend = a, this.store = i, this.services = u, this.languageUtils = u.languageUtils, this.options = o, this.logger = Nn.create("backendConnector"), this.waitingReads = [], this.maxParallelReads = o.maxParallelReads || 10, this.readingCalls = 0, this.maxRetries = o.maxRetries >= 0 ? o.maxRetries : 5, this.retryTimeout = o.retryTimeout >= 1 ? o.retryTimeout : 350, this.state = {}, this.queue = [], this.backend?.init?.(u, o.backend, o);
  }
  queueLoad(a, i, u, o) {
    const f = {}, m = {}, p = {}, y = {};
    return a.forEach((g) => {
      let b = !0;
      i.forEach((C) => {
        const O = `${g}|${C}`;
        !u.reload && this.store.hasResourceBundle(g, C) ? this.state[O] = 2 : this.state[O] < 0 || (this.state[O] === 1 ? m[O] === void 0 && (m[O] = !0) : (this.state[O] = 1, b = !1, m[O] === void 0 && (m[O] = !0), f[O] === void 0 && (f[O] = !0), y[C] === void 0 && (y[C] = !0)));
      }), b || (p[g] = !0);
    }), (Object.keys(f).length || Object.keys(m).length) && this.queue.push({
      pending: m,
      pendingCount: Object.keys(m).length,
      loaded: {},
      errors: [],
      callback: o
    }), {
      toLoad: Object.keys(f),
      pending: Object.keys(m),
      toLoadLanguages: Object.keys(p),
      toLoadNamespaces: Object.keys(y)
    };
  }
  loaded(a, i, u) {
    const o = a.split("|"), f = o[0], m = o[1];
    i && this.emit("failedLoading", f, m, i), !i && u && this.store.addResourceBundle(f, m, u, void 0, void 0, {
      skipCopy: !0
    }), this.state[a] = i ? -1 : 2, i && u && (this.state[a] = 0);
    const p = {};
    this.queue.forEach((y) => {
      o3(y.loaded, [f], m), T3(y, a), i && y.errors.push(i), y.pendingCount === 0 && !y.done && (Object.keys(y.loaded).forEach((g) => {
        p[g] || (p[g] = {});
        const b = y.loaded[g];
        b.length && b.forEach((C) => {
          p[g][C] === void 0 && (p[g][C] = !0);
        });
      }), y.done = !0, y.errors.length ? y.callback(y.errors) : y.callback());
    }), this.emit("loaded", p), this.queue = this.queue.filter((y) => !y.done);
  }
  read(a, i, u, o = 0, f = this.retryTimeout, m) {
    if (!a.length) return m(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng: a,
        ns: i,
        fcName: u,
        tried: o,
        wait: f,
        callback: m
      });
      return;
    }
    this.readingCalls++;
    const p = (g, b) => {
      if (this.readingCalls--, this.waitingReads.length > 0) {
        const C = this.waitingReads.shift();
        this.read(C.lng, C.ns, C.fcName, C.tried, C.wait, C.callback);
      }
      if (g && b && o < this.maxRetries) {
        setTimeout(() => {
          this.read(a, i, u, o + 1, f * 2, m);
        }, f);
        return;
      }
      m(g, b);
    }, y = this.backend[u].bind(this.backend);
    if (y.length === 2) {
      try {
        const g = y(a, i);
        g && typeof g.then == "function" ? g.then((b) => p(null, b)).catch(p) : p(null, g);
      } catch (g) {
        p(g);
      }
      return;
    }
    return y(a, i, p);
  }
  prepareLoading(a, i, u = {}, o) {
    if (!this.backend)
      return this.logger.warn("No backend was added via i18next.use. Will not load resources."), o && o();
    te(a) && (a = this.languageUtils.toResolveHierarchy(a)), te(i) && (i = [i]);
    const f = this.queueLoad(a, i, u, o);
    if (!f.toLoad.length)
      return f.pending.length || o(), null;
    f.toLoad.forEach((m) => {
      this.loadOne(m);
    });
  }
  load(a, i, u) {
    this.prepareLoading(a, i, {}, u);
  }
  reload(a, i, u) {
    this.prepareLoading(a, i, {
      reload: !0
    }, u);
  }
  loadOne(a, i = "") {
    const u = a.split("|"), o = u[0], f = u[1];
    this.read(o, f, "read", void 0, void 0, (m, p) => {
      m && this.logger.warn(`${i}loading namespace ${f} for language ${o} failed`, m), !m && p && this.logger.log(`${i}loaded namespace ${f} for language ${o}`, p), this.loaded(a, m, p);
    });
  }
  saveMissing(a, i, u, o, f, m = {}, p = () => {
  }) {
    if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(i)) {
      this.logger.warn(`did not save key "${u}" as the namespace "${i}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
      return;
    }
    if (!(u == null || u === "")) {
      if (this.backend?.create) {
        const y = {
          ...m,
          isUpdate: f
        }, g = this.backend.create.bind(this.backend);
        if (g.length < 6)
          try {
            let b;
            g.length === 5 ? b = g(a, i, u, o, y) : b = g(a, i, u, o), b && typeof b.then == "function" ? b.then((C) => p(null, C)).catch(p) : p(null, b);
          } catch (b) {
            p(b);
          }
        else
          g(a, i, u, o, p, y);
      }
      !a || !a[0] || this.store.addResource(a[0], i, u, o);
    }
  }
}
const Pc = () => ({
  debug: !1,
  initAsync: !0,
  ns: ["translation"],
  defaultNS: ["translation"],
  fallbackLng: ["dev"],
  fallbackNS: !1,
  supportedLngs: !1,
  nonExplicitSupportedLngs: !1,
  load: "all",
  preload: !1,
  keySeparator: ".",
  nsSeparator: ":",
  pluralSeparator: "_",
  contextSeparator: "_",
  enableSelector: !1,
  partialBundledLanguages: !1,
  saveMissing: !1,
  updateMissing: !1,
  saveMissingTo: "fallback",
  saveMissingPlurals: !0,
  missingKeyHandler: !1,
  missingInterpolationHandler: !1,
  postProcess: !1,
  postProcessPassResolved: !1,
  returnNull: !1,
  returnEmptyString: !0,
  returnObjects: !1,
  joinArrays: !1,
  returnedObjectHandler: !1,
  parseMissingKeyHandler: !1,
  appendNamespaceToMissingKey: !1,
  appendNamespaceToCIMode: !1,
  overloadTranslationOptionHandler: (t) => {
    let a = {};
    if (typeof t[1] == "object" && (a = t[1]), te(t[1]) && (a.defaultValue = t[1]), te(t[2]) && (a.tDescription = t[2]), typeof t[2] == "object" || typeof t[3] == "object") {
      const i = t[3] || t[2];
      Object.keys(i).forEach((u) => {
        a[u] = i[u];
      });
    }
    return a;
  },
  interpolation: {
    escapeValue: !0,
    prefix: "{{",
    suffix: "}}",
    formatSeparator: ",",
    unescapePrefix: "-",
    nestingPrefix: "$t(",
    nestingSuffix: ")",
    nestingOptionsSeparator: ",",
    maxReplaces: 1e3,
    skipOnVariables: !0
  },
  cacheInBuiltFormats: !0
}), Op = (t) => (te(t.ns) && (t.ns = [t.ns]), te(t.fallbackLng) && (t.fallbackLng = [t.fallbackLng]), te(t.fallbackNS) && (t.fallbackNS = [t.fallbackNS]), t.supportedLngs && !t.supportedLngs.includes("cimode") && (t.supportedLngs = t.supportedLngs.concat(["cimode"])), t), Wu = () => {
}, A3 = (t) => {
  Object.getOwnPropertyNames(Object.getPrototypeOf(t)).forEach((i) => {
    typeof t[i] == "function" && (t[i] = t[i].bind(t));
  });
};
class gr extends os {
  constructor(a = {}, i) {
    if (super(), this.options = Op(a), this.services = {}, this.logger = Nn, this.modules = {
      external: []
    }, A3(this), i && !this.isInitialized && !a.isClone) {
      if (!this.options.initAsync)
        return this.init(a, i), this;
      setTimeout(() => {
        this.init(a, i);
      }, 0);
    }
  }
  init(a = {}, i) {
    this.isInitializing = !0, typeof a == "function" && (i = a, a = {}), a.defaultNS == null && a.ns && (te(a.ns) ? a.defaultNS = a.ns : a.ns.includes("translation") || (a.defaultNS = a.ns[0]));
    const u = Pc();
    this.options = {
      ...u,
      ...this.options,
      ...Op(a)
    }, this.options.interpolation = {
      ...u.interpolation,
      ...this.options.interpolation
    }, a.keySeparator !== void 0 && (this.options.userDefinedKeySeparator = a.keySeparator), a.nsSeparator !== void 0 && (this.options.userDefinedNsSeparator = a.nsSeparator), typeof this.options.overloadTranslationOptionHandler != "function" && (this.options.overloadTranslationOptionHandler = u.overloadTranslationOptionHandler);
    const o = (g) => g ? typeof g == "function" ? new g() : g : null;
    if (!this.options.isClone) {
      this.modules.logger ? Nn.init(o(this.modules.logger), this.options) : Nn.init(null, this.options);
      let g;
      this.modules.formatter ? g = this.modules.formatter : g = x3;
      const b = new xp(this.options);
      this.store = new Sp(this.options.resources, this.options);
      const C = this.services;
      C.logger = Nn, C.resourceStore = this.store, C.languageUtils = b, C.pluralResolver = new b3(b, {
        prepend: this.options.pluralSeparator
      }), g && (C.formatter = o(g), C.formatter.init && C.formatter.init(C, this.options), this.options.interpolation.format = C.formatter.format.bind(C.formatter)), C.interpolator = new Mp(this.options), C.utils = {
        hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
      }, C.backendConnector = new E3(o(this.modules.backend), C.resourceStore, C, this.options), C.backendConnector.on("*", (O, ...U) => {
        this.emit(O, ...U);
      }), this.modules.languageDetector && (C.languageDetector = o(this.modules.languageDetector), C.languageDetector.init && C.languageDetector.init(C, this.options.detection, this.options)), this.modules.i18nFormat && (C.i18nFormat = o(this.modules.i18nFormat), C.i18nFormat.init && C.i18nFormat.init(this)), this.translator = new rs(this.services, this.options), this.translator.on("*", (O, ...U) => {
        this.emit(O, ...U);
      }), this.modules.external.forEach((O) => {
        O.init && O.init(this);
      });
    }
    if (this.format = this.options.interpolation.format, i || (i = Wu), this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
      const g = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
      g.length > 0 && g[0] !== "dev" && (this.options.lng = g[0]);
    }
    !this.services.languageDetector && !this.options.lng && this.logger.warn("init: no languageDetector is used and no lng is defined"), ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"].forEach((g) => {
      this[g] = (...b) => this.store[g](...b);
    }), ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"].forEach((g) => {
      this[g] = (...b) => (this.store[g](...b), this);
    });
    const p = cr(), y = () => {
      const g = (b, C) => {
        this.isInitializing = !1, this.isInitialized && !this.initializedStoreOnce && this.logger.warn("init: i18next is already initialized. You should call init just once!"), this.isInitialized = !0, this.options.isClone || this.logger.log("initialized", this.options), this.emit("initialized", this.options), p.resolve(C), i(b, C);
      };
      if ((this.languages || this.isLanguageChangingTo) && !this.isInitialized) return g(null, this.t.bind(this));
      this.changeLanguage(this.options.lng, g);
    };
    return this.options.resources || !this.options.initAsync ? y() : setTimeout(y, 0), p;
  }
  loadResources(a, i = Wu) {
    let u = i;
    const o = te(a) ? a : this.language;
    if (typeof a == "function" && (u = a), !this.options.resources || this.options.partialBundledLanguages) {
      if (o?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return u();
      const f = [], m = (p) => {
        if (!p || p === "cimode") return;
        this.services.languageUtils.toResolveHierarchy(p).forEach((g) => {
          g !== "cimode" && (f.includes(g) || f.push(g));
        });
      };
      o ? m(o) : this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach((y) => m(y)), this.options.preload?.forEach?.((p) => m(p)), this.services.backendConnector.load(f, this.options.ns, (p) => {
        !p && !this.resolvedLanguage && this.language && this.setResolvedLanguage(this.language), u(p);
      });
    } else
      u(null);
  }
  reloadResources(a, i, u) {
    const o = cr();
    return typeof a == "function" && (u = a, a = void 0), typeof i == "function" && (u = i, i = void 0), a || (a = this.languages), i || (i = this.options.ns), u || (u = Wu), this.services.backendConnector.reload(a, i, (f) => {
      o.resolve(), u(f);
    }), o;
  }
  use(a) {
    if (!a) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
    if (!a.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
    return a.type === "backend" && (this.modules.backend = a), (a.type === "logger" || a.log && a.warn && a.error) && (this.modules.logger = a), a.type === "languageDetector" && (this.modules.languageDetector = a), a.type === "i18nFormat" && (this.modules.i18nFormat = a), a.type === "postProcessor" && b0.addPostProcessor(a), a.type === "formatter" && (this.modules.formatter = a), a.type === "3rdParty" && this.modules.external.push(a), this;
  }
  setResolvedLanguage(a) {
    if (!(!a || !this.languages) && !["cimode", "dev"].includes(a)) {
      for (let i = 0; i < this.languages.length; i++) {
        const u = this.languages[i];
        if (!["cimode", "dev"].includes(u) && this.store.hasLanguageSomeTranslations(u)) {
          this.resolvedLanguage = u;
          break;
        }
      }
      !this.resolvedLanguage && !this.languages.includes(a) && this.store.hasLanguageSomeTranslations(a) && (this.resolvedLanguage = a, this.languages.unshift(a));
    }
  }
  changeLanguage(a, i) {
    this.isLanguageChangingTo = a;
    const u = cr();
    this.emit("languageChanging", a);
    const o = (p) => {
      this.language = p, this.languages = this.services.languageUtils.toResolveHierarchy(p), this.resolvedLanguage = void 0, this.setResolvedLanguage(p);
    }, f = (p, y) => {
      y ? this.isLanguageChangingTo === a && (o(y), this.translator.changeLanguage(y), this.isLanguageChangingTo = void 0, this.emit("languageChanged", y), this.logger.log("languageChanged", y)) : this.isLanguageChangingTo = void 0, u.resolve((...g) => this.t(...g)), i && i(p, (...g) => this.t(...g));
    }, m = (p) => {
      !a && !p && this.services.languageDetector && (p = []);
      const y = te(p) ? p : p && p[0], g = this.store.hasLanguageSomeTranslations(y) ? y : this.services.languageUtils.getBestMatchFromCodes(te(p) ? [p] : p);
      g && (this.language || o(g), this.translator.language || this.translator.changeLanguage(g), this.services.languageDetector?.cacheUserLanguage?.(g)), this.loadResources(g, (b) => {
        f(b, g);
      });
    };
    return !a && this.services.languageDetector && !this.services.languageDetector.async ? m(this.services.languageDetector.detect()) : !a && this.services.languageDetector && this.services.languageDetector.async ? this.services.languageDetector.detect.length === 0 ? this.services.languageDetector.detect().then(m) : this.services.languageDetector.detect(m) : m(a), u;
  }
  getFixedT(a, i, u, o) {
    const f = o?.scopeNs, m = (p, y, ...g) => {
      let b;
      typeof y != "object" ? b = this.options.overloadTranslationOptionHandler([p, y].concat(g)) : b = {
        ...y
      }, b.lng = b.lng || m.lng, b.lngs = b.lngs || m.lngs;
      const C = b.ns !== void 0 && b.ns !== null;
      b.ns = b.ns || m.ns, b.keyPrefix !== "" && (b.keyPrefix = b.keyPrefix || u || m.keyPrefix);
      const O = {
        ...this.options,
        ...b
      };
      Array.isArray(f) && !C && (O.ns = f), typeof b.keyPrefix == "function" && (b.keyPrefix = li(b.keyPrefix, O));
      const U = this.options.keySeparator || ".";
      let q;
      return b.keyPrefix && Array.isArray(p) ? q = p.map(($) => (typeof $ == "function" && ($ = li($, O)), `${b.keyPrefix}${U}${$}`)) : (typeof p == "function" && (p = li(p, O)), q = b.keyPrefix ? `${b.keyPrefix}${U}${p}` : p), this.t(q, b);
    };
    return te(a) ? m.lng = a : m.lngs = a, m.ns = i, m.keyPrefix = u, m;
  }
  t(...a) {
    return this.translator?.translate(...a);
  }
  exists(...a) {
    return this.translator?.exists(...a);
  }
  setDefaultNamespace(a) {
    this.options.defaultNS = a;
  }
  hasLoadedNamespace(a, i = {}) {
    if (!this.isInitialized)
      return this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages), !1;
    if (!this.languages || !this.languages.length)
      return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages), !1;
    const u = i.lng || this.resolvedLanguage || this.languages[0], o = this.options ? this.options.fallbackLng : !1, f = this.languages[this.languages.length - 1];
    if (u.toLowerCase() === "cimode") return !0;
    const m = (p, y) => {
      const g = this.services.backendConnector.state[`${p}|${y}`];
      return g === -1 || g === 0 || g === 2;
    };
    if (i.precheck) {
      const p = i.precheck(this, m);
      if (p !== void 0) return p;
    }
    return !!(this.hasResourceBundle(u, a) || !this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages || m(u, a) && (!o || m(f, a)));
  }
  loadNamespaces(a, i) {
    const u = cr();
    return this.options.ns ? (te(a) && (a = [a]), a.forEach((o) => {
      this.options.ns.includes(o) || this.options.ns.push(o);
    }), this.loadResources((o) => {
      u.resolve(), i && i(o);
    }), u) : (i && i(), Promise.resolve());
  }
  loadLanguages(a, i) {
    const u = cr();
    te(a) && (a = [a]);
    const o = this.options.preload || [], f = a.filter((m) => !o.includes(m) && this.services.languageUtils.isSupportedCode(m));
    return f.length ? (this.options.preload = o.concat(f), this.loadResources((m) => {
      u.resolve(), i && i(m);
    }), u) : (i && i(), Promise.resolve());
  }
  dir(a) {
    if (a || (a = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language)), !a) return "rtl";
    try {
      const o = new Intl.Locale(a);
      if (o && o.getTextInfo) {
        const f = o.getTextInfo();
        if (f && f.direction) return f.direction;
      }
    } catch {
    }
    const i = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"], u = this.services?.languageUtils || new xp(Pc());
    return a.toLowerCase().indexOf("-latn") > 1 ? "ltr" : i.includes(u.getLanguagePartFromCode(a)) || a.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
  }
  static createInstance(a = {}, i) {
    const u = new gr(a, i);
    return u.createInstance = gr.createInstance, u;
  }
  cloneInstance(a = {}, i = Wu) {
    const u = a.forkResourceStore;
    u && delete a.forkResourceStore;
    const o = {
      ...this.options,
      ...a,
      isClone: !0
    }, f = new gr(o);
    if ((a.debug !== void 0 || a.prefix !== void 0) && (f.logger = f.logger.clone(a)), ["store", "services", "language"].forEach((p) => {
      f[p] = this[p];
    }), f.services = {
      ...this.services
    }, f.services.utils = {
      hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
    }, u) {
      const p = Object.keys(this.store.data).reduce((y, g) => (y[g] = {
        ...this.store.data[g]
      }, y[g] = Object.keys(y[g]).reduce((b, C) => (b[C] = {
        ...y[g][C]
      }, b), y[g]), y), {});
      f.store = new Sp(p, o), f.services.resourceStore = f.store;
    }
    if (a.interpolation) {
      const y = {
        ...Pc().interpolation,
        ...this.options.interpolation,
        ...a.interpolation
      }, g = {
        ...o,
        interpolation: y
      };
      f.services.interpolator = new Mp(g);
    }
    return f.translator = new rs(f.services, o), f.translator.on("*", (p, ...y) => {
      f.emit(p, ...y);
    }), f.init(o, i), f.translator.options = o, f.translator.backendConnector.services.utils = {
      hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
    }, f;
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage
    };
  }
}
const mt = gr.createInstance();
mt.createInstance;
mt.dir;
mt.init;
mt.loadResources;
mt.reloadResources;
mt.use;
mt.changeLanguage;
mt.getFixedT;
mt.t;
mt.exists;
mt.setDefaultNamespace;
mt.hasLoadedNamespace;
mt.loadNamespaces;
mt.loadLanguages;
const Lp = "solar";
function j3(t) {
  return t["aria-label"] !== void 0 || t.title !== void 0;
}
const Ke = R.forwardRef(({ alt: t, color: a, size: i, strokeWidth: u, secondaryColor: o, secondaryOpacity: f, iconName: m, isolated: p, children: y, ...g }, b) => {
  let C = m ? `${Lp} solar-${m}` : Lp, O = g.className, U = O ? `${C} ${O}` : C, q = !!t || j3(g), $ = { ...g.style ?? {} };
  if (p && ($["--solar-secondary-color"] = "initial", $["--solar-secondary-opacity"] = "initial"), a !== void 0 && ($.color = a), i !== void 0) {
    let H = typeof i == "number" ? `${i}px` : i;
    $.width = H, $.height = H;
  }
  u !== void 0 && ($.strokeWidth = String(u)), o && ($["--solar-secondary-color"] = o), f != null && ($["--solar-secondary-opacity"] = String(f));
  let ne = i === void 0 ? p ? "24px" : "1em" : void 0, P = i === void 0 ? p ? "24px" : "1em" : void 0;
  i === void 0 && !p && ("fontSize" in $ || ($.fontSize = "var(--solar-size, 24px)"));
  let ie = a === void 0 ? p ? "currentColor" : "var(--solar-color, currentColor)" : void 0, oe = u === void 0 ? p ? "1.5" : "var(--solar-stroke-width, 1.5)" : void 0;
  return h.jsxs("svg", { ref: b, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", ...g, className: U, style: Object.keys($).length > 0 ? $ : void 0, width: ne, height: P, color: ie, strokeWidth: oe, ...!q && { "aria-hidden": "true" }, children: [!!t && h.jsx("title", { children: t }), y] });
}), M3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "add-linear", children: [h.jsx("path", { d: "M4 12L20 12", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M12.0204 4L12.0205 20.0003", stroke: "currentColor", strokeLinecap: "round" })] })), ta = R.forwardRef((t, a) => h.jsx(Ke, { ref: a, ...t, iconName: "alt-arrow-right-linear", children: h.jsx("path", { d: "M9 5L15 12L9 19", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }) })), N3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "box-linear", children: [h.jsx("path", { d: "M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5", stroke: "currentColor", strokeLinecap: "round" })] })), S0 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "close-linear", children: [h.jsx("path", { d: "M19.0068 5L5.00684 19", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M19 19L5 5", stroke: "currentColor", strokeLinecap: "round" })] })), jf = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "copy-linear", children: [h.jsx("path", { d: "M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z", stroke: "currentColor" }), h.jsx("path", { d: "M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5", stroke: "currentColor" })] })), O3 = R.forwardRef((t, a) => h.jsx(Ke, { ref: a, ...t, iconName: "cursor-linear", children: h.jsx("path", { d: "M16.5744 19.1999L12.6361 15.2616L11.4334 16.4643C10.2022 17.6955 9.58656 18.3111 8.92489 18.1658C8.26322 18.0204 7.96225 17.2035 7.3603 15.5696L5.3527 10.1205C4.15187 6.86106 3.55146 5.23136 4.39141 4.39141C5.23136 3.55146 6.86106 4.15187 10.1205 5.35271L15.5696 7.3603C17.2035 7.96225 18.0204 8.26322 18.1658 8.92489C18.3111 9.58656 17.6955 10.2022 16.4643 11.4334L15.2616 12.6361L19.1999 16.5744C19.6077 16.9821 19.8116 17.186 19.9058 17.4135C20.0314 17.7168 20.0314 18.0575 19.9058 18.3608C19.8116 18.5882 19.6077 18.7921 19.1999 19.1999C18.7921 19.6077 18.5882 19.8116 18.3608 19.9058C18.0575 20.0314 17.7168 20.0314 17.4135 19.9058C17.186 19.8116 16.9821 19.6077 16.5744 19.1999Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }) })), L3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "diskette-linear", children: [h.jsx("path", { d: "M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 11.6585 22 11.4878 21.9848 11.3142C21.9142 10.5049 21.586 9.71257 21.0637 9.09034C20.9516 8.95687 20.828 8.83317 20.5806 8.58578L15.4142 3.41944C15.1668 3.17206 15.0431 3.04835 14.9097 2.93631C14.2874 2.414 13.4951 2.08581 12.6858 2.01515C12.5122 2 12.3415 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355Z", stroke: "currentColor" }), h.jsx("path", { d: "M17 22V21C17 19.1144 17 18.1716 16.4142 17.5858C15.8284 17 14.8856 17 13 17H11C9.11438 17 8.17157 17 7.58579 17.5858C7 18.1716 7 19.1144 7 21V22", stroke: "currentColor" }), h.jsx("path", { d: "M7 8H13", stroke: "currentColor", strokeLinecap: "round" })] })), za = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "file-text-linear", children: [h.jsx("path", { d: "M6 14.5H14", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M6 18H11.5", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M10.0296 2C6.23851 2 4.34296 2 3.17139 3.17157C1.99981 4.34315 2 6.22876 2 10V14C2 17.7712 2 19.6569 3.17157 20.8284", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M3.17139 20.8281C4.34296 21.9997 6.22858 21.9997 9.99981 21.9997L14 22C17.7712 22 19.6569 21.9997 20.8284 20.8281C22 19.6566 22 17.7712 22 14V13.5625", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M19.3516 7.61621C20.6558 8.78998 21.3078 9.3774 21.6538 10.1543C21.9998 10.9312 21.9998 11.8085 21.9998 13.5631", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M10.0298 2C11.5548 2 12.3173 2.00011 13.0093 2.26562C13.7012 2.53114 14.2651 3.03857 15.3929 4.05365L19.3516 7.61621", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M13 2.5V5C13 7.35702 13 8.53553 13.7322 9.26777C14.4645 10 15.643 10 18 10H21.5", stroke: "currentColor", strokeLinecap: "round" })] })), rf = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "gallery-linear", children: [h.jsx("path", { d: "M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z", stroke: "currentColor" }), h.jsx("circle", { cx: "16", cy: "8", r: "2", stroke: "currentColor" }), h.jsx("path", { d: "M2 12.5001L3.75159 10.9675C4.66286 10.1702 6.03628 10.2159 6.89249 11.0721L11.1822 15.3618C11.8694 16.0491 12.9512 16.1428 13.7464 15.5839L14.0446 15.3744C15.1888 14.5702 16.7369 14.6634 17.7765 15.599L21 18.5001", stroke: "currentColor", strokeLinecap: "round" })] })), Mf = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "gamepad-linear", children: [h.jsx("path", { d: "M10.165 4.77922L10.6669 5.13443C11.0567 5.41029 11.5225 5.55844 12 5.55844C12.4776 5.55844 12.9434 5.41029 13.3332 5.13441L13.8351 4.77922C14.5514 4.27225 15.4074 4 16.2849 4H16.8974C17.3016 4 17.7099 4.02549 18.0908 4.16059C20.4735 5.00566 22.1125 8.09503 21.994 15.1026C21.9701 16.5145 21.6397 18.075 20.3658 18.6842C19.9688 18.8741 19.5033 19 18.9733 19C18.3373 19 17.8322 18.8187 17.4424 18.5632C16.5285 17.9642 15.8588 16.9639 14.8888 16.4609C14.3048 16.1581 13.6566 16 12.9989 16H11.0011C10.3434 16 9.69519 16.1581 9.11125 16.4609C8.14122 16.9639 7.47153 17.9642 6.55763 18.5632C6.1678 18.8187 5.66273 19 5.02671 19C4.49667 19 4.03121 18.8741 3.63423 18.6842C2.3603 18.075 2.02992 16.5145 2.00604 15.1026C1.88749 8.09504 3.52645 5.00566 5.90915 4.16059C6.29009 4.02549 6.69838 4 7.10257 4H7.71504C8.59264 4 9.44862 4.27225 10.165 4.77922Z", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M7.5 9V12M6 10.5L9 10.5", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M15.25 10.25H15.2501", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M16.75 11.75H16.7501", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M18.25 10.25H18.2501", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M16.75 8.75H16.7501", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" })] })), R3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "layers-linear", children: [h.jsx("path", { d: "M4.97883 9.68508C2.99294 8.89073 2 8.49355 2 8C2 7.50645 2.99294 7.10927 4.97883 6.31492L7.7873 5.19153C9.77318 4.39718 10.7661 4 12 4C13.2339 4 14.2268 4.39718 16.2127 5.19153L19.0212 6.31492C21.0071 7.10927 22 7.50645 22 8C22 8.49355 21.0071 8.89073 19.0212 9.68508L16.2127 10.8085C14.2268 11.6028 13.2339 12 12 12C10.7661 12 9.77318 11.6028 7.7873 10.8085L4.97883 9.68508Z", stroke: "currentColor" }), h.jsx("path", { d: "M5.76613 10L4.97883 10.3149C2.99294 11.1093 2 11.5065 2 12C2 12.4935 2.99294 12.8907 4.97883 13.6851L7.7873 14.8085C9.77318 15.6028 10.7661 16 12 16C13.2339 16 14.2268 15.6028 16.2127 14.8085L19.0212 13.6851C21.0071 12.8907 22 12.4935 22 12C22 11.5065 21.0071 11.1093 19.0212 10.3149L18.2339 10", stroke: "currentColor" }), h.jsx("path", { d: "M5.76613 14L4.97883 14.3149C2.99294 15.1093 2 15.5065 2 16C2 16.4935 2.99294 16.8907 4.97883 17.6851L7.7873 18.8085C9.77318 19.6028 10.7661 20 12 20C13.2339 20 14.2268 19.6028 16.2127 18.8085L19.0212 17.6851C21.0071 16.8907 22 16.4935 22 16C22 15.5065 21.0071 15.1093 19.0212 14.3149L18.2339 14", stroke: "currentColor" })] })), w3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "lightbulb-linear", children: [h.jsx("path", { d: "M14.5 19.5H9.5M14.5 19.5C14.5 18.7865 14.5 18.4297 14.5381 18.193C14.6609 17.4296 14.6824 17.3815 15.1692 16.7807C15.3201 16.5945 15.8805 16.0927 17.0012 15.0892C18.5349 13.7159 19.5 11.7206 19.5 9.5C19.5 5.35786 16.1421 2 12 2C7.85786 2 4.5 5.35786 4.5 9.5C4.5 11.7206 5.4651 13.7159 6.99876 15.0892C8.11945 16.0927 8.67987 16.5945 8.83082 16.7807C9.31762 17.3815 9.3391 17.4296 9.46192 18.193C9.5 18.4297 9.5 18.7865 9.5 19.5M14.5 19.5C14.5 20.4346 14.5 20.9019 14.299 21.25C14.1674 21.478 13.978 21.6674 13.75 21.799C13.4019 22 12.9346 22 12 22C11.0654 22 10.5981 22 10.25 21.799C10.022 21.6674 9.83261 21.478 9.70096 21.25C9.5 20.9019 9.5 20.4346 9.5 19.5", stroke: "currentColor" }), h.jsx("path", { d: "M12 17V15", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M13.7324 14C13.3866 14.5978 12.7403 15 12 15C11.2597 15 10.6134 14.5978 10.2676 14", stroke: "currentColor", strokeLinecap: "round" })] })), Nf = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "magic-wand-linear", children: [h.jsx("path", { d: "M12.6187 3.77783C14.7918 2.39036 15.8784 1.69663 16.7137 2.12656C17.5491 2.5565 17.58 3.82537 17.6418 6.36312L17.6578 7.01967C17.6753 7.74082 17.6841 8.10139 17.8327 8.4128C17.9813 8.7242 18.2529 8.95119 18.7961 9.40516L19.2906 9.81846C21.202 11.416 22.1577 12.2148 21.9787 13.1603C21.7997 14.1059 20.6046 14.572 18.2142 15.5043L17.5958 15.7454C16.9165 16.0104 16.5769 16.1428 16.3222 16.3918C16.0675 16.6409 15.9266 16.9783 15.6448 17.6531L15.3882 18.2675C14.3964 20.6423 13.9005 21.8297 12.9545 21.9842C12.0085 22.1386 11.2389 21.1578 9.69982 19.1963L9.30163 18.6888C8.86425 18.1314 8.64557 17.8526 8.33956 17.6952C8.03356 17.5377 7.67488 17.5192 6.95753 17.4823L6.30443 17.4487C3.78002 17.3189 2.51782 17.254 2.11218 16.4039C1.70653 15.5538 2.42609 14.4815 3.86521 12.3369L4.23753 11.7821C4.64648 11.1727 4.85096 10.868 4.91653 10.5216C4.9821 10.1752 4.90135 9.82639 4.73983 9.12875L4.59279 8.4936C4.02442 6.03855 3.74024 4.81103 4.43551 4.1312C5.13079 3.45136 6.34506 3.76944 8.77361 4.4056L9.40191 4.57019C10.092 4.75097 10.4371 4.84135 10.7836 4.78478C11.1301 4.7282 11.4389 4.53106 12.0565 4.13679L12.6187 3.77783Z", stroke: "currentColor" }), h.jsx("path", { d: "M19 19L21 21", stroke: "currentColor", strokeLinecap: "round" })] })), dl = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "magnifier-linear", children: [h.jsx("circle", { cx: "11.5", cy: "11.5", r: "9.5", stroke: "currentColor" }), h.jsx("path", { d: "M18.5 18.5L22 22", stroke: "currentColor", strokeLinecap: "round" })] })), D3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "pen-2-linear", children: [h.jsx("path", { d: "M4 22H20", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M4.25745 16.2417L4.04356 16.8833C3.94194 17.1882 4.02128 17.5243 4.2485 17.7515C4.47573 17.9787 4.81182 18.0581 5.11667 17.9564L5.75834 17.7426L8.38334 16.8675C9.00282 16.6611 9.31256 16.5578 9.60398 16.4189C9.94775 16.2551 10.2727 16.0543 10.5729 15.8201C10.8275 15.6215 11.0584 15.3907 11.5201 14.9289L18.3371 8.11195M5.75834 17.7426L4.25745 16.2417", stroke: "currentColor" })] })), z3 = R.forwardRef((t, a) => h.jsx(Ke, { ref: a, ...t, iconName: "pen-linear", children: h.jsx("path", { d: "M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M19.9213 9.63993L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L14.3601 4.07866M4.19792 21.6782L2.32181 19.8021", stroke: "currentColor" }) })), cs = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "pen-new-square-linear", children: [h.jsx("path", { d: "M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M16.652 3.45506L17.3009 2.80624C18.3759 1.73125 20.1188 1.73125 21.1938 2.80624C22.2687 3.88124 22.2687 5.62415 21.1938 6.69914L20.5449 7.34795M16.652 3.45506C16.652 3.45506 16.7331 4.83379 17.9497 6.05032C19.1662 7.26685 20.5449 7.34795 20.5449 7.34795M16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9M8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795M10.1 15.5876L8.41242 13.9", stroke: "currentColor" })] })), Of = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "plug-circle-linear", children: [h.jsx("path", { d: "M12 15.1082V20.1498C12 21.2635 11.0955 22.1875 10.0128 21.9673C5.44193 21.0381 2 16.9659 2 12.0832C2 6.51441 6.47715 2 12 2C17.5228 2 22 6.51441 22 12.0832C22 16.0743 19.7003 19.5239 16.3641 21.1581", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M9 11.8C9 11.3582 9.35817 11 9.8 11H14.2C14.6418 11 15 11.3582 15 11.8V12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12V11.8Z", stroke: "currentColor", strokeLinejoin: "round" }), h.jsx("path", { d: "M13.5 11V9", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M10.5 11V9", stroke: "currentColor", strokeLinecap: "round" })] })), fs = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "programming-linear", children: [h.jsx("path", { d: "M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z", stroke: "currentColor" }), h.jsx("path", { d: "M17 15H14.5H12", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M7 10L7.2344 10.1953C8.51608 11.2634 9.15693 11.7974 9.15693 12.5C9.15693 13.2026 8.51608 13.7366 7.2344 14.8047L7 15", stroke: "currentColor", strokeLinecap: "round" })] })), _3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "refresh-linear", children: [h.jsx("path", { d: "M3.67981 13L3.67981 11.3333C3.67981 6.73096 7.4402 3 12.0789 3C15.1178 3 17.7799 4.60136 19.2545 7M2 11.3333L3.67981 13L5.35962 11.3333", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M20.3139 11V12.6667C20.3139 17.269 16.5391 21 11.8827 21C8.83213 21 6.15995 19.3986 4.67969 17M22.0001 12.6667L20.3139 11L18.6277 12.6667", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" })] })), Lf = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "settings-linear", children: [h.jsx("circle", { cx: "12", cy: "12", r: "3", stroke: "currentColor" }), h.jsx("path", { d: "M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z", stroke: "currentColor" })] })), k3 = R.forwardRef((t, a) => h.jsx(Ke, { ref: a, ...t, iconName: "undo-left-linear", children: h.jsx("path", { d: "M4 7H15C16.8692 7 17.8039 7 18.5 7.40193C18.9561 7.66523 19.3348 8.04394 19.5981 8.49999C20 9.19615 20 10.1308 20 12C20 13.8692 20 14.8038 19.5981 15.5C19.3348 15.9561 18.9561 16.3348 18.5 16.5981C17.8039 17 16.8692 17 15 17H8.00001M7 10L4 7L7 4", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }) })), U3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "video-frame-linear", children: [h.jsx("path", { d: "M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z", stroke: "currentColor" }), h.jsx("path", { d: "M17 2.5L17 21.5", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M7 2.5L7 21.5", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M2.5 7L7 7M21.5 7L17 7", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M2.5 17L7 17M21.5 17L17 17", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M2 12H22", stroke: "currentColor", strokeLinecap: "round" })] })), H3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "wi-fi-linear", children: [h.jsx("path", { d: "M8.66699 15.8931C10.5079 13.9061 13.4927 13.9061 15.3337 15.8931", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M5.33301 12.2948C9.01491 8.32068 14.9844 8.32068 18.6663 12.2948", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M2 8.69718C7.52285 2.73603 16.4772 2.73603 22 8.69718", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M12.0176 19.4641H12.0177", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" })] })), B3 = R.forwardRef((t, a) => h.jsxs(Ke, { ref: a, ...t, iconName: "wi-fi-off-linear", children: [h.jsx("path", { d: "M22 2L2 22", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M12.959 14.5085C13.8293 14.7027 14.6585 15.1642 15.3339 15.8931", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M5.33301 12.295C7.78006 9.65377 11.2376 8.76794 14.3625 9.63754", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M16.7622 10.7053C17.4423 11.1355 18.0831 11.6654 18.6665 12.2951", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M2 8.69694C6.38843 3.96024 12.9434 2.98729 18.2219 5.77811", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M20.3218 7.14575C20.9088 7.60795 21.4703 8.12503 22.0002 8.69699", stroke: "currentColor", strokeLinecap: "round" }), h.jsx("path", { d: "M12.0176 19.4644H12.0177", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" }), h.jsx("path", { d: "M22 2C20.7406 3.25937 19.4813 4.51874 18.2219 5.77811C16.9354 7.06458 15.6489 8.35106 14.3625 9.63753C10.2416 13.7584 6.12082 17.8792 2 22", stroke: "currentColor", strokeLinecap: "round" })] })), ui = R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("path", { d: "M5 12.5L9.2 16.5L19 7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }));
}), x0 = R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5" }));
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "1.5" }), R.createElement("circle", { cx: "12", cy: "12", r: "3", fill: "currentColor" }));
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", ...i }, R.createElement("rect", { x: "3.5", y: "3.5", width: "17", height: "17", rx: "1.5", fill: "currentColor" }));
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("path", { d: "M12 18V6M7.5 10.5L12 6L16.5 10.5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }));
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement(
    "svg",
    { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i },
    [6, 12, 18].map((o) => R.createElement("circle", { key: o, cx: o, cy: 12, r: 1.8, fill: "currentColor" }))
  );
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement(
    "svg",
    { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i },
    [7, 12, 17].map((o) => R.createElement("circle", { key: o, cx: 12, cy: o, r: 1.35, fill: "currentColor" }))
  );
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("path", { d: "M18 11V7.5a1.5 1.5 0 0 0-3 0V10m0-2.5V6a1.5 1.5 0 0 0-3 0v4m0-3V5.5a1.5 1.5 0 0 0-3 0V11m0-3.5a1.5 1.5 0 0 0-3 0V13l-1.2-1.2a1.7 1.7 0 0 0-2.4 2.4l4 4A6 6 0 0 0 10.6 20H13a5 5 0 0 0 5-5v-4Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }));
});
R.forwardRef(function({ size: a = 24, ...i }, u) {
  return R.createElement("svg", { ref: u, width: a, height: a, viewBox: "0 0 24 24", fill: "none", ...i }, R.createElement("path", { d: "M12 3v18M3 12h18M9.5 5.5 12 3l2.5 2.5M9.5 18.5 12 21l2.5-2.5M5.5 9.5 3 12l2.5 2.5M18.5 9.5 21 12l-2.5 2.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }));
});
const I3 = {}, q3 = {
  codexImages: {
    description: "本地 Codex CLI · 图片生成",
    managedOptions: "图片模型和输出尺寸由 Codex 管理。请在提示词中描述所需构图，支持多张参考图。",
    enable: "启用 Codex CLI 图片生成",
    ready: "Codex 图片生成已连接",
    unavailable: "Codex 图片生成需要处理",
    checkAgain: "重新检测"
  },
  fairyguiDesign: {
    openComponent: "在设计页查看",
    noComponents: "此包内没有组件",
    backToWorkspace: "返回工作区",
    title: "FairyGUI 设计",
    components: "组件",
    loadingTree: "正在从编辑器加载组件树…",
    selectPrompt: "在左侧选择一个组件查看渲染效果与源码",
    loadingComponent: "正在渲染组件…",
    xmlSource: "组件 XML 源码",
    bridgeOffline: "编辑器桥未连接：请打开 FairyGUI 编辑器并确认工程已加载。"
  },
  common: {
    openName: "打开 {{name}}",
    tryAgain: "重试",
    copied: "已复制",
    copyDetails: "复制详情",
    technicalDetails: "技术详情",
    signIn: "登录",
    signOut: "退出登录",
    all: "全部",
    cancel: "取消",
    save: "保存",
    saving: "正在保存…",
    continue: "继续",
    back: "返回",
    loading: "加载中…",
    enabled: "已启用",
    disabled: "已停用",
    deleting: "正在删除…",
    retry: "重试",
    edit: "编辑",
    done: "完成",
    delete: "删除",
    add: "添加",
    advanced: "高级",
    close: "关闭",
    saveChanges: "保存更改",
    saved: "已保存",
    showAll: "查看全部",
    settings: "设置",
    viewAll: "查看全部",
    fullscreen: "全屏",
    clear: "清除",
    chooseFile: "选择文件",
    noFileSelected: "未选择文件",
    create: "创建",
    name: "名称",
    rename: "重命名",
    duplicate: "创建副本",
    refresh: "刷新",
    reload: "重新加载",
    errorDetails: "错误详情",
    details: "详情",
    skip: "跳过",
    copy: "复制",
    send: "发送",
    disable: "停用",
    enable: "启用",
    somethingWrong: "出了点问题",
    insert: "插入",
    discard: "放弃",
    editName: "编辑 {{name}}",
    removeName: "移除 {{name}}",
    deleteName: "删除 {{name}}"
  },
  onboarding: {
    arrival: "欢迎，玩家！",
    reopen: "查看入门引导",
    customProvider: "自定义服务商",
    providerUnavailable: "此服务商已不可用。",
    editProvider: "编辑你的服务商。",
    addProvider: "添加你的服务商。",
    connectProvider: "连接 {{name}}。",
    keyLocal: "你的密钥保存在本机。",
    chooseProvider: "连接你的 AI。",
    loadingProviders: "正在加载服务商…",
    defaultModel: "默认模型",
    welcome: "欢迎使用 Game Workbench",
    tagline: "你的专属游戏工作室",
    next: "下一步",
    startCreating: "开始创作",
    skipAndStart: "跳过并开始",
    localCredentialsFound: "检测到本机已有密钥：{{names}}",
    localCredentialsImport: "一键导入",
    gettingStarted: "入门引导",
    step: "第 {{number}} 步，共 2 步：{{title}}",
    welcomeStep: "欢迎",
    providerStep: "连接 AI",
    noMediaProviders: "此分类暂无服务商，之后可在设置中添加。",
    providers: "LLM 服务商",
    searchProviders: "搜索服务商…",
    addCustomProvider: "添加自定义服务商",
    configure: "配置",
    noProviders: "没有匹配的服务商。",
    preparing: "正在准备 Game Workbench",
    gettingReady: "正在准备…",
    animation: "一个小小的游戏世界逐渐成形，随后变为 Game Workbench 标志。"
  },
  settings: {
    nav: {
      providers: "服务商与模型",
      agents: "智能体",
      account: "账户",
      appearance: "外观",
      webSearch: "联网搜索",
      network: "网络",
      mcpServer: "MCP 服务",
      about: "关于",
      label: "设置分区",
      heading: "设置"
    },
    backToApp: "返回应用",
    billing: {
      title: "账单",
      description: "在网页上管理 Game Workbench Cloud 的套餐、用量和付款信息。",
      open: "打开账单页面"
    },
    appearance: {
      theme: "主题",
      system: "跟随系统",
      light: "浅色",
      dark: "深色",
      workspace: "工作区",
      chatPosition: "聊天位置",
      chatPositionLabel: "聊天面板位置",
      left: "左侧",
      right: "右侧",
      language: "语言",
      languageLabel: "界面语言"
    },
    account: {
      signedInAs: "当前登录"
    },
    about: {
      upToDate: "已是最新版本",
      checking: "正在检查更新…",
      available: "有可用更新：{{version}}",
      downloading: "正在下载更新（{{percent}}%）",
      ready: "可以重启更新：{{version}}",
      installing: "正在准备安全重启…",
      dataSafe: "你的项目和对话没有被删除。",
      download: "下载更新",
      restart: "重启以更新",
      networkSettings: "网络设置",
      check: "检查更新",
      projectLinks: "项目链接",
      website: "官网",
      reportIssue: "反馈问题",
      changelog: "更新日志",
      releaseVersion: "发布说明版本",
      notesUnavailable: "此版本暂无发布说明。",
      viewRelease: "在 GitHub 查看此版本"
    }
  },
  capability: {
    language: "语言",
    image: "图像",
    video: "视频",
    "3d": "3D",
    audio: "音频"
  },
  providers: {
    title: "服务商与模型",
    search: "搜索服务商",
    filterLabel: "按能力筛选服务商",
    add: "添加服务商",
    loadingProviders: "正在加载服务商",
    noMatch: "没有符合筛选条件的服务商。",
    group: {
      providers: "服务商",
      free: "免费云端",
      connected: "已连接的服务商",
      popular: "热门服务商",
      china: "国内常用",
      local: "本地服务商",
      more: "更多服务商"
    },
    manageHyper3d: "管理 Hyper3D",
    rowAction: "{{action}} {{name}}",
    recommended: "推荐",
    labels: "服务商标签：{{labels}}",
    custom: "自定义",
    enableProvider: "启用 {{name}}",
    hyper3d: {
      description: "免费账户额度和你的 API 密钥",
      yourKey: "你的 API 密钥",
      keyRequired: "需要 API 密钥",
      freeAccount: "免费账户",
      keyHint: "API 密钥模型使用你的 Hyper3D 余额，免费账户模型仍然可用。"
    },
    account: "账户",
    quota: {
      title: "每日额度",
      refresh: "刷新额度",
      signIn: "登录即可获得每日免费额度。",
      checking: "正在查询你的每日额度…",
      exhausted: "今日额度已用完，重置后会恢复。"
    },
    apiKey: "API 密钥",
    newApiKey: "新的 API 密钥",
    replaceKeyPlaceholder: "粘贴新的密钥以替换当前密钥",
    keyPlaceholder: "粘贴你的 {{name}} API 密钥",
    imageModels: "图像模型",
    videoModels: "视频模型",
    audioModels: "音频模型",
    noImageModels: "没有可用的图像模型。",
    noVideoModels: "没有可用的视频模型。",
    noAudioModels: "没有可用的音频模型。",
    loadingModels: "正在加载模型",
    audioDescription: "豆包语音合成，用于生成角色配音",
    seedAudioDescription: "使用 Seed Audio 1.0 生成游戏音效和无歌词背景音乐",
    seedAudioHint: "Seed Audio 使用独立连接，不会替换或修改现有的豆包语音配置。",
    defaultVoiceId: "默认音色",
    voiceSelectCustom: "自定义 Speaker ID...",
    voiceIdInputLabel: "Speaker ID",
    defaultVoiceIdPlaceholder: "例如 zh_female_vv_uranus_bigtts",
    defaultVoiceIdHint: "选择预置音色，或粘贴声音复刻得到的 Speaker ID。语音请求未指定音色时使用。",
    chineseVoices: "中文音色",
    englishVoices: "英文音色",
    previewTitle: "试听",
    previewTextLabel: "试听文本",
    previewAction: "生成试听",
    previewSampleText: "欢迎来到雾港。今晚的月亮，似乎比往常更近。",
    previewHint: "用当前所选音色生成一段短音频并播放，会消耗火山引擎额度。",
    breadcrumb: "服务商导航",
    remove: {
      title: "移除服务商",
      hint: "删除 {{name}} 已保存的连接和模型设置。",
      action: "移除…"
    },
    connection: {
      title: "连接",
      signedInWith: "已通过 {{name}} 登录",
      signedIn: "已通过浏览器登录",
      reconnect: "重新连接"
    },
    delete: {
      button: "删除服务商",
      confirmation: "确认删除服务商",
      hyper3d: "要移除已保存的 Hyper3D API 密钥及其模型设置吗？",
      custom: "要删除这个服务商及其密钥和模型设置吗？",
      builtIn: "要删除这个服务商已保存的连接和设置吗？",
      subscriptionKept: "你的订阅不受影响。",
      removeKey: "移除 API 密钥"
    },
    notRequired: "不需要",
    baseUrl: "Base URL",
    api: "API",
    edit: "编辑 {{label}}",
    loadingConfiguration: "正在加载配置",
    connect: {
      providerApiKey: "{{name}} API 密钥",
      signInWith: "使用 {{name}} 登录",
      enterApiKey: "输入 {{name}} API 密钥",
      title: "连接",
      description: "选择 Game Workbench 连接这个服务商的方式。",
      oauthHint: "在浏览器中用你的账户登录",
      oauthHintOpenAI: "使用你的 ChatGPT 订阅 · 仅支持语言模型，生成图片需要 API key",
      oauthHintAnthropic: "使用你的 Claude 付费订阅 · 需在 Claude 中开启用量额度（usage credits），Anthropic 可能从中扣费",
      apiKeyHint: "粘贴服务商控制台里的密钥"
    },
    notice: {
      oauth: "浏览器登录已连接。",
      apiKey: "API 密钥已更新。",
      baseUrl: "Base URL 已保存。"
    },
    signIn: "登录方式",
    browserSignIn: "浏览器登录",
    useBrowserSignIn: "改用浏览器登录",
    useApiKey: "改用 API 密钥",
    apiKeyConfigured: "已配置 API 密钥",
    editApiKey: "编辑 API 密钥",
    baseUrlSettings: "Base URL 设置",
    unavailable: "不可用",
    editBaseUrl: "编辑 Base URL",
    authInterrupted: "与认证流程的连接已中断。",
    saveKey: "保存密钥",
    waitingSignIn: "正在等待登录",
    preparing: "正在准备配置",
    finishInBrowser: "请在浏览器中完成登录，然后回到这里。",
    openBrowserAgain: "重新打开浏览器",
    openBrowser: "打开浏览器",
    redirectHint: "浏览器没有跳回这里？请粘贴它最后停留的地址。",
    availableForRequests: "可用于新请求",
    disabledKept: "已停用 · 凭据和模型会保留",
    baseUrlHint: "兼容 OpenAI 的 API 地址或中转地址。网络代理（Clash）请在 设置 → 网络 中配置。",
    description: {
      hyper3d: "每日免费额度或你的 API 密钥",
      local: "本地端点",
      custom: "自定义端点",
      oauthOrKey: "浏览器登录或 API 密钥"
    },
    status: {
      connected: "已连接",
      connectedWith: "已连接 · {{method}}",
      checking: "正在检查…",
      failed: "连接失败",
      notConfigured: "未配置"
    },
    action: {
      manage: "管理",
      connect: "连接"
    },
    auth: {
      starting: "正在开始认证…",
      deviceCode: "请在浏览器中输入验证码。",
      complete: "请在浏览器中完成认证。"
    },
    ohMyGameAccount: "Game Workbench 账户",
    apiBalance: "API 余额 · {{model}}"
  },
  openAIImages: {
    fixedSizes: "GPT Image 1 / 1.5 · 固定尺寸",
    flexibleSizes: "GPT Image 2 / 2.5 · 灵活尺寸",
    fetched: "已拉取 {{count}} 个图像模型。启用需要的模型后保存。",
    saved: "图像连接已保存。",
    removed: "图像连接已移除。",
    invalidModelId: "请输入不含空格的模型 ID",
    duplicateModelId: "已存在相同 ID 的模型",
    fetchModels: "拉取模型",
    editModels: "编辑图像模型",
    connectModels: "连接图像模型",
    loading: "正在加载图像设置",
    imageConnection: "图像连接",
    separate: "独立的 API 密钥和 Base URL",
    useChat: "共用聊天 API 连接",
    chatKeyRequired: "共用聊天 API 连接（需要 API 密钥）",
    imageKey: "图像 API 密钥",
    configured: "已配置",
    keepKey: "留空以保留已保存的图像密钥",
    keyPlaceholder: "粘贴此端点的 API 密钥",
    imageUrl: "图像 Base URL",
    chatEndpoint: "使用聊天的 API 密钥和端点：{{baseUrl}}",
    billingHint: "图片使用 API 计费，支持兼容 GPT Image 的中转服务。",
    connection: "连接方式",
    separateKey: "独立 API 密钥",
    chatConnection: "聊天 API 连接",
    editConnection: "编辑图像连接",
    editKey: "编辑图像 API 密钥",
    editUrl: "编辑图像 Base URL",
    connectHint: "连接 API 密钥以使用 OpenAI 或兼容 GPT Image 的中转服务。",
    search: "搜索图像模型",
    modelPlaceholder: "gpt-image-2 或中转服务的模型别名",
    configuredModels: "已配置的图像模型",
    noMatch: "没有符合搜索条件的图像模型。",
    empty: "拉取模型或手动添加模型 ID。",
    noneEnabled: "没有已启用的图像模型。",
    removeConnection: "移除图像连接",
    removeConfirmation: "要移除已保存的图像密钥和模型吗？图片生成将被停用。",
    remove: "移除",
    template: "能力模板",
    templateFor: "{{modelId}} 的能力模板",
    chatTitle: "聊天连接",
    chatHint: "聊天模型可以与图片生成独立连接。"
  },
  models: {
    shownCount: "已显示 {{shown}} / 共 {{total}} 个",
    filter: {
      shown: "已显示",
      custom: "自定义",
      label: "筛选模型"
    },
    title: "模型",
    default: "默认",
    hiddenCount: "已隐藏的模型（{{count}}）",
    reloadTitle: "重新加载内置的官方预设和账户模型目录",
    reloadLabel: "重新加载模型目录",
    add: "添加模型",
    doneEditing: "完成编辑模型",
    editModels: "编辑模型",
    catalogInfo: "模型目录说明",
    officialVersions: "官方模型版本",
    search: "搜索模型",
    hideAll: "全部隐藏",
    providerModels: "服务商模型",
    shownProviderModels: "已显示的服务商模型",
    creditsPerGeneration: "每次生成 {{credits}} 积分",
    upToReferences_one: "最多 {{count}} 张参考图",
    upToReferences_other: "最多 {{count}} 张参考图",
    faceRange: "{{min}}–{{max}} 面",
    unassigned: "未分配",
    source: {
      official: "官方",
      cloud: "云端"
    },
    cancelDeletion: "取消删除",
    empty: {
      none: "没有可用的模型。",
      noneShown: "没有显示的模型。",
      noMatch: "没有符合筛选条件的模型。"
    },
    modelId: "模型 ID",
    displayName: "显示名称",
    contextWindow: "上下文窗口",
    maxOutputTokens: "最大输出 token 数",
    reasoning: "推理",
    imageInput: "图像输入"
  },
  reasoning: {
    default: "默认",
    off: "关闭",
    minimal: "极低",
    low: "低",
    medium: "中",
    high: "高",
    xhigh: "极高",
    max: "最高"
  },
  customProvider: {
    duplicateModel: "列表中已有相同 ID 的模型。",
    edit: "编辑服务商",
    connect: "连接 {{name}}",
    namePlaceholder: "我的服务商",
    baseUrlHint: "填写 API 端点；如果服务需要，请包含 /v1。",
    defaultProtocol: "默认语言模型协议",
    authentication: "认证方式",
    noApiKey: "无需 API 密钥",
    keepKeyPlaceholder: "留空则保留当前密钥",
    keyPlaceholder: "粘贴你的 API 密钥",
    modelSettings: "模型设置",
    enabledCount: "已启用 {{count}} 个",
    fetching: "正在获取…",
    loadPresets: "加载预设",
    fetch: "获取",
    fetchedFirst: "已获取前 {{count}} 个模型，其他模型 ID 可以手动添加。",
    loadedPresets: "已加载 {{count}} 个官方预设。",
    fetchedModels: "已获取 {{count}} 个模型。",
    enableMatching: "启用匹配的已配置模型",
    enableAll: "启用全部已配置模型",
    availableModels: "可用模型",
    enableModel: "启用 {{name}}",
    editModel: "编辑模型 {{id}}",
    noSearchMatch: "没有符合搜索条件的模型。",
    noModels: "还没有添加模型。",
    addManually: "手动添加模型",
    modelIdPlaceholder: "服务商提供的模型 ID",
    modelDisplayName: "模型显示名称",
    sameAsId: "与模型 ID 相同",
    languageSettings: "语言模型设置",
    languageProtocol: "语言模型协议",
    languageBaseUrl: "语言模型 Base URL 覆盖",
    useProviderBaseUrl: "使用服务商的 Base URL",
    reasoningSettings: "推理设置",
    reasoningLevels: "推理级别",
    automatic: "自动",
    levelsHint: "启用支持的级别，并设置发送给服务商的参数。",
    levelParameter: "{{level}}参数",
    fromProvider: " — 由服务商提供",
    fromCatalog: " — 来自模型目录",
    defaultLevels: " — 默认级别，可按需自定义",
    errors: {
      modelId: "请输入不含空格的模型 ID（最多 200 个字符）。",
      chooseUse: "启用 {{name}} 前请先选择用途。",
      tokenLimits: "请检查 {{name}} 的 token 限制，输出 token 不能超过上下文窗口。",
      enableLevel: "请为 {{name}} 至少启用一个推理级别。",
      levelParameter: "请为 {{name}} 每个已启用的推理级别填写参数。"
    }
  },
  modelUsage: {
    referenceMode: {
      frame: "首尾帧",
      reference: "参考图"
    },
    useReferenceDefault_one: "使用模型默认值（{{count}} 张参考图）",
    useReferenceDefault_other: "使用模型默认值（{{count}} 张参考图）",
    useFor: "将此模型用于",
    unassigned: "未分配 — 启用前请先选择用途。",
    imageProtocol: "图像协议",
    imageSettings: "图像设置",
    imageResolutions: "图像分辨率",
    imageAspectRatios: "图像宽高比",
    maxReferenceImages: "最多参考图数",
    maxOutputs: "最多输出数",
    videoProtocol: "视频协议",
    videoSettings: "视频设置",
    videoResolutions: "视频分辨率",
    videoAspectRatios: "视频宽高比",
    durations: "时长（秒）",
    maxVideoReferences: "视频最多参考图数",
    videoReferenceModes: "视频参考模式",
    model3dProtocol: "3D 协议",
    defaultPolycount: "默认面数",
    polycountPresets: "面数预设",
    generationDefaults: "生成默认值",
    texture: "贴图",
    capabilities: "模型能力",
    officialFixed: "官方能力不可修改。如需配置其他模型，请添加自定义版本。",
    matchDocs: "请按服务商文档设置这些限制。本地设置不会改变上游模型的能力。",
    template: "生成模板",
    singleImage: "单图生成 3D",
    multiImage: "多图生成 3D",
    topology: "拓扑模式",
    standard: "标准",
    smartTopology: "智能拓扑",
    tripoViews: "视图顺序为 前 / 左 / 后 / 右。只有一张图时使用单视图生成。",
    rodinViews: "Rodin 最多接受五张参考图，不要求固定的视图顺序。",
    max3dReferences: "3D 最多参考图数",
    minPolycount: "最低面数",
    maxPolycount: "最高面数",
    textureSupport: "支持贴图",
    pbrSupport: "支持 PBR",
    operations: "兼容的 3D 操作",
    baseUrlOverride: "Base URL 覆盖",
    baseUrlBlank: "留空则使用该服务商的连接。",
    commas: "多个值用逗号分隔。"
  },
  webSearch: {
    loading: "正在加载联网搜索设置…",
    title: "联网搜索",
    toggle: "联网搜索",
    provider: "服务商",
    providerDescription: "选择执行联网搜索的服务。",
    providerLabel: "联网搜索服务商",
    auto: "自动",
    autoDescription: "自动选择 Exa 或 Parallel",
    exaDescription: "始终使用 Exa",
    parallelDescription: "始终使用 Parallel",
    customMcp: "自定义 MCP",
    customDescription: "使用兼容的 MCP 服务器",
    fallback: "使用备用服务商",
    fallbackDescription: "自动搜索失败时，改用另一个公共服务商重试。",
    apiKeys: "API 密钥",
    apiKeysDescription: "为你使用的公共服务商添加凭据。",
    exaKey: "Exa API 密钥",
    parallelKey: "Parallel API 密钥",
    customDescriptionLong: "连接一个兼容的服务器用于联网搜索。",
    name: "名称",
    endpoint: "端点",
    toolName: "工具名称",
    bearerToken: "Bearer 令牌",
    saved: "联网搜索设置已保存。",
    replacePlaceholder: "已保存 - 输入新值以替换",
    optional: "可选",
    removeKey: "移除已保存的密钥"
  },
  network: {
    source: {
      manual: "手动代理",
      environment: "环境变量",
      system: "系统代理",
      direct: "直接连接"
    },
    loading: "正在加载网络设置…",
    title: "网络",
    proxy: "代理",
    modeLabel: "网络代理模式",
    automatic: "自动",
    manual: "手动",
    direct: "直连",
    hints: {
      direct: "不使用应用代理。系统 VPN 和 TUN 路由仍然生效。",
      manual: "应用请求使用 HTTP 或 HTTPS 代理。",
      auto: "优先使用环境代理，其次使用系统代理，否则直接连接。"
    },
    proxyUrl: "代理地址",
    clashHint: "Clash 的 HTTP / Mixed 端口。",
    bypass: "不走代理的地址",
    bypassHint: "用逗号分隔。本地地址始终不走代理。",
    detecting: "正在检测…",
    detect: "检测系统代理",
    status: "网络状态",
    unsaved: "有未保存的更改。",
    savedPrefix: "已保存。",
    restartToApply: "重启后生效。",
    restartAppToApply: "重启 Game Workbench 后生效。",
    restartServiceToApply: "重启本地服务后生效。",
    restarting: "正在重启…",
    restartNow: "立即重启",
    saved: "已保存。",
    reachable: "api.openai.com 可访问 · {{ms}} 毫秒",
    testing: "正在测试…",
    test: "测试连接",
    testHint: "使用当前表单检测 api.openai.com，不保存设置"
  },
  projects: {
    recent: "最近的项目",
    none: "还没有项目",
    loading: "正在加载项目",
    title: "项目",
    allTypes: "全部类型",
    search: "搜索项目",
    sort: "项目排序",
    recentlyUpdated: "最近更新",
    new: "新建项目",
    newHint: "从一个创意开始",
    noMatch: "没有符合搜索条件的项目",
    rename: "重命名项目",
    confirmRemove: "要从 Game Workbench 移除“{{name}}”吗？“{{path}}”中的文件会保留在磁盘上。",
    confirmDelete: "要删除“{{name}}”吗？此操作无法撤销。",
    import: "导入项目",
    importTooLarge: "请选择不超过 10 GB 的项目归档"
  },
  home: {
    title: "今天想做点什么？",
    placeholder: "描述你想做的游戏…",
    startBlank: "从空白开始",
    explore: "探索"
  },
  projectType: {
    general: "通用游戏",
    "web-game": "网页游戏",
    "interactive-story": "互动故事",
    "asset-canvas": "素材画布",
    "godot-game": "Godot",
    fairygui: "FairyGUI",
    "requirement-check": "需求检查"
  },
  navigation: {
    backTo: "返回{{page}}"
  },
  sidebar: {
    update: "更新",
    restart: "重启",
    issue: "问题",
    mainNavigation: "主导航",
    home: "首页",
    projects: "项目",
    library: "素材库",
    community: "社区",
    plugins: "插件",
    studios: "工作室",
    openAccountMenu: "打开账户菜单",
    applicationMenu: "应用菜单",
    loadingAccount: "正在加载账户",
    resize: "调整侧边栏宽度"
  },
  studio: {
    examples: "示例",
    general: {
      title: "你想创作什么？",
      placeholder: "描述你的游戏创意，或你想做的东西…",
      new: "新建游戏项目"
    },
    web: {
      title: "今天做个什么游戏？",
      placeholder: "描述你想做的网页游戏…",
      new: "新建游戏"
    },
    story: {
      title: "今天讲个什么故事？",
      placeholder: "描述你想做的互动故事…",
      new: "新建故事"
    },
    godot: {
      title: "要用 Godot 做什么？",
      placeholder: "描述你想做的 Godot 游戏…",
      new: "新建 Godot 项目"
    },
    fairygui: {
      title: "要做哪个界面的 UI？",
      placeholder: "描述你想制作或修改的 FairyGUI 界面…",
      new: "新建 FairyGUI 项目",
      bridgeConnected: "编辑器桥：已连接",
      bridgeOffline: "编辑器桥：未连接（启动编辑器或检查插件）"
    },
    "requirement-check": {
      title: "要检查哪份需求？",
      placeholder: "描述你要检查的需求文档或验收点…",
      new: "新建需求检查项目"
    }
  },
  examples: {
    loadingName: "正在加载 {{name}}",
    play: "试玩",
    playName: "试玩 {{name}}",
    example: "示例",
    exampleType: "示例 · {{type}}",
    remixTitle: "把这个示例复制成一个可以修改的新项目",
    remix: "改编"
  },
  creator: {
    create: "创建项目",
    planPlaceholder: "描述要规划的内容",
    folderInUse: "这个文件夹已经是“{{name}}”的工作区。",
    openProject: "打开项目",
    workspaceValue: "工作区：{{path}}",
    workspaceNew: "工作区：在 Game Workbench 存储中新建文件夹",
    workspaceNewTitle: "在 Game Workbench 的项目存储中新建一个文件夹",
    newFolder: "新文件夹",
    workspace: "工作区",
    chooseAnother: "选择其他文件夹…",
    chooseFolder: "选择文件夹…",
    projectType: "项目类型"
  },
  createDialog: {
    restartForFolders: "请重启 Game Workbench 桌面应用以启用文件夹选择。",
    newType: "新建{{type}}",
    newProject: "新建项目",
    opening: "正在打开…",
    chooseAnother: "选择其他…",
    type: "类型"
  },
  signIn: {
    unavailable: "登录暂时不可用。",
    title: "加入社区",
    close: "关闭登录",
    description: "有没有账户都可以创作游戏。",
    completeInBrowser: "请在浏览器中完成 {{provider}} 登录。",
    with: "使用 {{provider}} 登录",
    continueWith: "使用 {{provider}} 继续"
  },
  auth: {
    expired: "登录已过期，请重新登录。",
    creator: "Game Workbench 创作者"
  },
  quota: {
    unit: {
      requests: "次请求",
      tokens: "token",
      images: "张图像",
      models: "个模型",
      credits: "积分"
    },
    unavailable: "不可用",
    checking: "正在查询账户额度…",
    signIn: "登录即可获得每日免费额度",
    temporarilyUnavailable: "暂时不可用",
    quotaUnavailable: "额度不可用",
    leftToday: "今日剩余 {{amount}} {{unit}}",
    dailyCredits: "每日积分",
    dailyQuota: "每日额度",
    remaining: "{{label}}剩余",
    resets: "{{time}} 重置",
    held: " · 预留 {{amount}} {{unit}}",
    perGeneration: "每次生成 {{credits}} 积分",
    notEnough: "每日积分不足以使用这个模型，请选择更低价的档位。",
    allowanceRemaining: "每日剩余额度"
  },
  modelSelector: {
    loading: "正在加载模型…",
    error: "无法加载模型",
    none: "没有语言模型",
    backToModels: "返回模型列表",
    textModel: "文本模型：{{name}}",
    textModelTitle: "文本模型：{{provider}} · {{name}}",
    reasoning: "推理：{{level}}",
    model: "模型",
    manage: "管理服务商",
    noMatch: "没有匹配的模型"
  },
  mediaDefaults: {
    loading: "正在加载模型…",
    unavailable: "模型不可用",
    modelUnavailable: "{{id}} · 不可用",
    noModel: "没有可用的模型",
    useGlobal: "使用全局设置 · {{label}}",
    automatic: "自动 · {{label}}",
    projectModel: "项目{{usage}}模型",
    globalModel: "全局默认{{usage}}模型",
    globalDefaults: "全局生成默认设置",
    title: "默认模型",
    saving: "正在保存"
  },
  responsesTransport: {
    label: "Responses 连接设置",
    title: "Responses 连接方式",
    preferWebSocket: "优先使用 WebSocket",
    hint: "自动模式下，官方 OpenAI 优先使用 WebSocket，中转服务使用 HTTP / SSE。连接暂时失败时，会在五分钟内改用 HTTP / SSE。开启自动重试后，中断的回复会以“重新连接”的方式重试。",
    shortHint: "自动选择 WebSocket 或 HTTP / SSE，连接失败时自动回退。"
  },
  model3dForm: {
    edit: "编辑 3D 模型",
    add: "添加 3D 模型",
    idPlaceholder: "服务商提供的准确模型版本",
    startFrom: "基于",
    templateHint: "复制一个兼容的模板，再按新版本核对各项限制。",
    restore: "恢复默认"
  },
  balance: {
    title: "API 余额",
    refreshLabel: "刷新 API 余额",
    refresh: "刷新余额",
    available: "可用积分",
    credits: "{{amount}} 积分",
    frozen: "冻结 {{amount}} 积分",
    error: "无法获取余额，请刷新重试。"
  },
  projectCard: {
    stopping: "正在停止",
    working: "工作中",
    open: "打开 {{name}}",
    agentStatus: "Agent {{status}}",
    actions: "{{name}} 的项目操作",
    openFolder: "在文件夹中打开",
    remove: "从 Game Workbench 移除",
    editedJustNow: "刚刚编辑",
    editedMinutes: "{{count}} 分钟前编辑",
    editedHours: "{{count}} 小时前编辑",
    editedDays: "{{count}} 天前编辑",
    editedOn: "{{date}} 编辑",
    export: "导出项目",
    exporting: "正在导出…"
  },
  conversations: {
    history: "对话记录",
    label: "对话",
    search: "搜索对话",
    titleLabel: "对话标题",
    saveTitle: "保存标题",
    cancelRename: "取消重命名",
    running: "运行中",
    empty: "空",
    messages_one: "{{count}} 条消息",
    messages_other: "{{count}} 条消息",
    rename: "重命名对话",
    renameName: "重命名 {{title}}",
    noMatch: "没有匹配的对话"
  },
  sendToProject: {
    failed: "无法添加到 {{project}}：{{error}}",
    title: "将“{{name}}”添加到项目",
    hint: "文件会复制到项目的素材文件夹。",
    added: "已添加到 {{project}}：{{path}}",
    noMatch: "没有匹配的项目",
    none: "还没有游戏项目"
  },
  assetCanvasHome: {
    new: "新建素材画布",
    newHint: "从空白工作流开始",
    quickStart: "快速开始",
    recent: "最近的画布",
    none: "还没有素材画布",
    loading: "正在加载素材画布"
  },
  workspace: {
    navigation: "工作区导航",
    showAgent: "显示 Agent",
    resizeAgent: "调整 Agent 面板宽度",
    agent: "Agent",
    godotPublishing: "暂不支持发布 Godot 项目",
    publishing: "正在发布",
    publish: "发布",
    tab: {
      preview: "预览",
      design: "设计",
      code: "代码",
      assets: "素材"
    },
    label: "代码工作区",
    reloadPreview: "重新加载预览",
    restartPreview: "重启预览",
    returnToGame: "返回游戏",
    play: "试玩",
    openingGame: "正在打开游戏…",
    playInWindow: "在新窗口中试玩",
    hideWorkspace: "隐藏工作区",
    showChat: "显示聊天",
    hidePlaytest: "隐藏 Agent 试玩窗口",
    showPlaytest: "Agent 试玩时显示窗口",
    previewPages: "预览页面",
    findPage: "查找页面或输入路径",
    viewportLabel: "预览视口",
    viewport: {
      tablet: "平板 · 768px",
      mobile: "手机 · 375px"
    },
    previewTitle: "{{name}} 预览",
    project: "项目",
    gameInWindow: "游戏正在独立窗口中运行",
    closeWindowHint: "关闭游戏窗口即可返回预览。",
    pausedAfterRecovery: "服务恢复后，预览已暂停。",
    stoppedManual: "预览已停止，准备好后再启动。",
    stoppedIdle: "预览因闲置已停止。",
    autoDisabled: "自动预览已关闭。",
    retryPreview: "重试预览",
    viewLogs: "查看日志",
    askAgent: "让 Agent 修复",
    compileFailed: "预览编译失败",
    runtimeError: "预览运行出错",
    loadFailed: "预览无法加载",
    source: {
      playtest: "AI 试玩",
      player: "试玩窗口"
    },
    copyError: "复制错误",
    openSource: "打开源文件",
    confirmDelete: "要删除“{{path}}”吗？代码中的引用需要相应更新。此操作无法撤销。",
    confirmDeleteFolder: "要删除“{{path}}”及其全部内容吗？代码中的引用需要相应更新。此操作无法撤销。",
    loadingCode: "正在加载代码",
    filterFiles: "筛选文件…",
    filterFilesLabel: "筛选工作区文件",
    files: "工作区文件",
    gitViews: "代码浏览视图",
    gitFiles: "文件",
    gitChanges: "更改",
    gitRefresh: "刷新 Git 更改",
    gitLoading: "正在加载更改…",
    gitClean: "没有未提交的更改",
    gitNoMatch: "没有匹配的更改",
    gitUntracked: "未跟踪文件",
    gitBase: "自上次提交以来",
    gitFirstCommit: "首次提交之前",
    gitFailed: "无法读取 Git 更改",
    gitUnsupported: "链接和子模块暂不支持差异预览。",
    gitTooLarge: "文件过大，无法预览差异。",
    gitNoTextChanges: "仅行尾或文件元数据发生变化。",
    resizeExplorer: "调整文件列表宽度",
    loadingFile: "正在加载文件",
    binaryUnavailable: "无法预览二进制文件",
    selectFile: "从工作区文件树中选择一个文件",
    renameEntry: "重命名 {{name}}",
    newFile: "新建文件",
    newFolder: "新建文件夹",
    openDefault: "用默认应用打开",
    openDefaultLabel: "用默认应用打开文件",
    chooseOpen: "选择打开方式",
    chooseOpenLabel: "选择文件的打开方式",
    folderActions: "文件夹操作",
    fileActions: "文件操作",
    copyPath: "复制相对路径",
    saveToLibrary: "保存到素材库",
    fileManager: "文件管理器",
    fileExplorer: "文件资源管理器",
    openIn: "在 {{app}} 中打开",
    defaultApp: "默认应用",
    showInFolder: "在所在文件夹中显示",
    showIn: "在 {{app}} 中显示",
    openFolderIn: "在 {{app}} 中打开文件夹",
    textEdit: "文本编辑",
    notepad: "记事本",
    loadingPreview: "正在加载预览",
    collapse: "折叠 {{name}}",
    expand: "展开 {{name}}",
    loadingAssets: "正在加载素材",
    noMedia: "没有媒体素材",
    processStopped: "预览进程已停止。",
    phase: {
      checking: "正在检查环境",
      installing: "正在安装依赖",
      launching: "正在启动预览服务器",
      connecting: "正在等待预览服务器"
    },
    logs: "预览日志",
    closeLogs: "关闭预览日志",
    notStarted: "尚未启动",
    noOutput: "还没有输出。",
    previewSource: "预览",
    emptyTitle: "预览会显示在这里",
    emptyDescription: "在 Agent 面板中描述你的游戏，就能生成可试玩的版本。",
    allowPopups: "请允许弹出窗口，以便在新窗口中试玩游戏。",
    windowClosed: "游戏窗口已关闭。",
    views: "工作区视图"
  },
  projectSettings: {
    title: "项目设置",
    argumentsInvalid: "参数必须是字符串组成的 JSON 数组。",
    project: "项目",
    previewAccess: "预览访问",
    webPreview: "网页预览",
    automaticPreview: "自动预览",
    startup: "启动配置",
    startupDirectory: "启动目录",
    previewModeField: "预览模式",
    mode: {
      auto: "自动",
      script: "package 脚本",
      static: "静态文件",
      command: "自定义命令"
    },
    startupCommand: "启动命令",
    portHint: "用 {port} 和 {host} 表示本地服务器地址。",
    startupScript: "启动脚本",
    packageManager: "包管理器",
    serverPort: "服务器端口",
    portArguments: "端口和参数",
    automatic: "自动",
    scriptArguments: "脚本参数",
    argumentsPlaceholder: '自动，或 ["--port", "{port}"]',
    argumentsHint: "JSON 数组；[] 表示不传额外参数。",
    playtestDefaults: "试玩默认设置",
    defaultRoute: "默认路由",
    deviceField: "设备",
    device: {
      fit: "适应窗口",
      tablet: "平板",
      mobile: "手机"
    },
    cleanup: "后台清理",
    stopAfter: "闲置多久后停止预览",
    minutes_one: "{{count}} 分钟",
    minutes_other: "{{count}} 分钟",
    keepRunning: "保持运行",
    previewActions: "预览操作",
    restartPreview: "重启预览服务",
    startPreview: "启动预览",
    cancelStartup: "取消启动",
    stopPreview: "停止预览",
    previewLogs: "预览日志",
    reinstall: "重新安装依赖并重启",
    openInBrowser: "在浏览器中打开预览"
  },
  storySettings: {
    variablesHelp: "游戏在各个场景之间记住的内容。可以让 AI 添加或修改这些值。",
    screenSize: "屏幕尺寸",
    reviewScenes: "修改屏幕尺寸后，请逐个检查场景。",
    variables: "变量",
    aboutVariables: "关于变量",
    starts: "初始值 {{value}}",
    noVariables: "还没有变量。",
    export: "导出",
    saveBeforeExport: "导出前请先保存屏幕尺寸的修改。",
    exporting: "正在导出…",
    exportGame: "导出游戏",
    exportProject: "导出项目",
    projectFileSuffix: "项目",
    canvasFormat: "画布格式"
  },
  library: {
    usedByProject: "{{name}} 正被这个项目使用。",
    usedByProjects: "{{name}} 正被 {{count}} 个项目使用。",
    confirmDelete: "要从素材库删除“{{name}}”吗？此操作无法撤销。",
    title: "素材库",
    loading: "正在加载素材",
    noMatch: "没有符合筛选条件的素材",
    none: "还没有媒体素材",
    deleteEverywhereTitle: "要在所有地方删除这个素材吗？",
    deleteWarning: "删除后，它会从这些项目中移除，仍在使用它的代码需要换用新的素材。此操作无法撤销。",
    deletingEllipsis: "正在删除…",
    deleteEverywhere: "全部删除",
    rename: "重命名素材"
  },
  libraryFilters: {
    source: "来源",
    saved: "素材库",
    generated: "生成的",
    uploaded: "上传的",
    fromProjects: "来自项目",
    allSources: "全部来源",
    project: "项目",
    allProjects: "全部项目",
    noProject: "无项目",
    includeReferences: "包含参考图",
    projectFiles: "项目文件",
    builtIn: "内置",
    use: "用途",
    allUses: "全部用途",
    assets: "素材",
    references: "参考图",
    filter: "筛选素材",
    filters: "筛选",
    close: "关闭筛选",
    reset: "重置筛选"
  },
  community: {
    myProfile: "我的主页",
    creator: "创作者",
    search: "搜索",
    searchPlaceholder: "游戏或创作者",
    sortBy: "排序方式",
    latestListed: "最新发布",
    mostViewed: "最多浏览",
    mostLiked: "最多点赞",
    firstListed: "首次发布时间",
    anyTime: "不限时间",
    pastWeek: "最近一周",
    pastMonth: "最近一个月",
    resetFilters: "重置筛选",
    noMatches: "没有符合筛选条件的游戏",
    loadingProfile: "正在加载主页",
    manageSignIn: "登录后管理你的游戏",
    viewProfile: "查看 {{name}} 的主页",
    views_one: "{{count, number}} 次浏览",
    views_other: "{{count, number}} 次浏览",
    viewCountUnavailable: "浏览量暂不可用",
    likeGame: "点赞 {{title}}",
    unlikeGame: "取消点赞 {{title}}",
    likes_one: "{{count, number}} 次点赞",
    likes_other: "{{count, number}} 次点赞",
    likesUnavailable: "点赞数据暂不可用",
    publishedGames_one: "{{count, number}} 个已发布游戏",
    publishedGames_other: "{{count, number}} 个已发布游戏",
    editGame: "编辑游戏",
    moreActions: "更多游戏操作",
    gameActions: "游戏操作",
    unpublish: "取消发布",
    unpublishTitle: "取消发布「{{title}}」？",
    unpublishDescription: "分享链接将失效，浏览和点赞记录也将被移除。本地项目文件会保留，你可以重新发布。",
    cancelUnpublish: "保留发布",
    confirmUnpublish: "确认取消发布",
    saveFailed: "保存未完成。",
    openProject: "打开项目",
    updateFromProject: "如需更新游戏文件或封面，请从原项目发布。",
    viewOnProfile: "在我的主页查看",
    byAuthor: "作者：{{author}}",
    title: "社区",
    loading: "正在加载游戏",
    none: "还没有已发布的游戏",
    play: "试玩 {{title}}",
    game: "游戏",
    games: "游戏",
    loadingGame: "正在加载游戏",
    share: "分享游戏",
    moreGames: "更多游戏",
    copyFailed: "无法自动复制，请选中链接后手动复制。",
    shareUnavailable: "无法使用系统分享，请复制游戏链接。",
    closeShare: "关闭分享窗口",
    link: "游戏链接",
    copyLink: "复制链接",
    moreSharing: "更多分享方式"
  },
  projectShell: {
    folderMissing: "所选的工作区文件夹已不可用。",
    runtimeUnreachable: "无法连接本地运行时。",
    newConversation: "新对话",
    showWorkspace: "显示工作区",
    hideAgent: "隐藏 Agent",
    promptPaused: "服务重启期间，你的第一条消息已暂停发送。",
    reviewMessage: "查看消息",
    attachmentsRetained: "已保留 {{count}} 个附件",
    sendOriginal: "发送原消息",
    reconnecting: "连接已断开，正在重新连接…",
    loading: "正在加载项目",
    unavailable: "工作区不可用"
  },
  errorBoundary: {
    failed: "{{label}}无法显示",
    hint: "你可以重试这个视图。",
    retry: "重试视图",
    back: "返回项目列表",
    label: {
      application: "应用",
      preview: "预览",
      conversation: "对话",
      workspace: "工作区"
    }
  },
  runtimeNotice: {
    reconnecting: "正在重新连接后台服务…",
    stopped: "后台服务已停止",
    kept: "当前视图和未发送的消息都会保留。",
    restartHint: "你可以重启服务，然后在当前视图继续。",
    restart: "重启服务"
  },
  closeGuard: {
    saving: "关闭前正在保存…",
    failed: "无法关闭，工作区仍处于打开状态。"
  },
  notice: {
    retryFailed: "重试失败，请查看详情。",
    retrying: "正在重试…",
    dismissLabel: "关闭提示",
    dismiss: "关闭"
  },
  queue: {
    prioritize: "优先执行",
    prioritizeTitle: "在当前轮结束后优先执行",
    label: "排队中的消息",
    editTitle: "编辑排队中的消息",
    editAttachments: "带附件的消息需要移除后重新发送",
    steerTitle: "引导当前运行",
    steer: "引导",
    remove: "移除排队中的消息"
  },
  planMode: {
    active: "规划模式已开启",
    exit: "退出规划模式",
    plan: "规划",
    commands: "输入框命令",
    mode: "规划模式",
    turnOff: "关闭规划模式",
    turnOn: "开启规划模式",
    compact: "压缩",
    compactHint: "压缩这段对话的上下文",
    full: "（已用 {{percent}}%）"
  },
  planStatus: {
    step: "第 {{current}} / {{total}} 步 · {{step}}",
    completed: "已完成 {{completed}} / {{total}} 步"
  },
  planApproval: {
    label: "确认计划",
    title: "要执行这个计划吗？",
    cancel: "取消计划",
    approve: "是，执行这个计划",
    refine: "否，告诉 Game Workbench 要怎么改",
    refinePlaceholder: "告诉 Game Workbench 要怎么改"
  },
  agents: {
    title: "智能体",
    builtIn: "内置",
    ohmygameNoModels: "还没有可用模型，请先在「服务商与模型」中连接服务商。",
    manageModels: "管理模型",
    default: "默认",
    rescan: "重新检测",
    open: "前往智能体"
  },
  externalAgents: {
    title: "MCP 服务",
    clients: "连接 Agent",
    loading: "正在检查其他 Agent…",
    enable: "允许其他 Agent 使用 Game Workbench",
    description: "Claude Code、Codex 等 Agent 可以生成媒体、使用画布并试玩你的游戏。",
    desktopOnly: "请在 Game Workbench 桌面版中连接 Agent。",
    connected: "已连接",
    notConnected: "未连接",
    connect: "连接",
    disconnect: "断开",
    otherClients: "DeepSeek Harness 和其他 MCP 客户端",
    otherClientsHint: "添加一个名为 {{name}} 的 stdio MCP 服务器，运行以下命令：",
    environment: "环境变量：{{value}}"
  },
  agentUsage: {
    title: "额度",
    window: "额度",
    weekly: "每周",
    daily: "每日",
    days: "{{count}} 天",
    hours: "{{count}} 小时",
    minutes: "{{count}} 分钟",
    used: "已用 {{percent}}%",
    resets: "{{time}} 重置",
    wasReset: "上次报告后已重置",
    empty: "和 {{name}} 对话后显示。"
  },
  codingAgents: {
    title: "本机编程 CLI",
    checking: "正在检查编程智能体…",
    manage: "管理 {{name}}",
    setUp: "设置 {{name}}",
    enable: "提供 {{name}} 的模型",
    notInstalled: "未检测到",
    notFound: "这台电脑上未检测到 CLI",
    invalidExecutable: "指定的可执行文件不可用",
    checkFailed: "{{version}} · CLI 检查失败",
    installed: "已安装 · {{version}}",
    installedSignedOut: "已安装 · {{version}} · 未登录",
    needsUpdate: "{{version}} · CLI 不兼容",
    versionUnknown: "版本未知",
    status: "状态",
    testedVersion: "已验证版本",
    testedVersionValue: "v{{version}}（仅供参考）",
    recheck: "重新检查",
    account: "账号",
    signedIn: "已登录",
    signedOut: "未登录",
    accountUnknown: "未知",
    openCodeAccounts: "使用 OpenCode 中已登录的服务商",
    switchAccount: "重新登录",
    billing: "计费",
    billingSubscription: "你的订阅",
    billingApiKey: "API Key 用量",
    billingProvider: "由模型服务商计费",
    billingUnknown: "未知",
    sandbox: "命令沙箱",
    loginOpened: "登录页面已在浏览器中打开。完成后请重新检查。",
    openAgain: "再次打开",
    loginCommand: "请在终端中登录：",
    copyCommand: "复制命令",
    copied: "已复制",
    installGuide: "安装指南",
    diagnostics: "问题",
    configuration: "配置",
    permissions: "权限",
    permissionStandard: "标准",
    permissionFull: "完全访问",
    permissionFullHint: "{{name}} 不经沙箱、不经询问地运行命令并读写任何文件，和 Game Workbench 自带的智能体一样。规划仍然只读。",
    cliConfigHint: "{{name}} 使用你已有的 CLI 配置，包括设置、Hooks、MCP 服务器、Skills 和指令。Game Workbench 会添加自身工具和项目指令，此处选择的权限仍然生效。",
    sandboxOs: "操作系统级",
    sandboxNone: "无，仅靠审批",
    sandboxOff: "已关闭（完全访问）",
    executable: "可执行文件",
    executablePlaceholder: "自动查找",
    executableHint: "留空并保存可自动查找 CLI，也可以指定可执行文件的绝对路径。",
    binarySource: {
      manual: "手动指定的可执行文件",
      path: "通过 PATH 找到",
      "login-shell": "通过登录 shell 找到",
      "common-directory": "在安装目录中找到",
      "codex-app": "Codex 桌面版内置",
      "chatgpt-app": "ChatGPT 桌面版内置"
    },
    diagnostic: {
      notInstalled: "Game Workbench 未找到 {{name}} CLI。如果已经安装，请指定可执行文件路径或重新检查。",
      invalidExecutable: "指定的可执行文件不存在或无法执行。请修正路径，或清空并保存以恢复自动检测。",
      runtimeIncompatible: "{{name}} 不支持所需的 CLI 能力，请更新后重新检查。",
      openCodeSavedPermissions: "OpenCode 已保存此项目的权限授权，可能绕过 Game Workbench 的审批。请在 OpenCode 中移除这些授权，然后重新检查。",
      capabilityMissing: "{{name}} 缺少所需的能力：{{capability}}。请更新后重新检查。",
      signedOut: "{{name}} 尚未登录。",
      modelsUnavailable: "{{name}} 没有返回模型列表。",
      probeFailed: "检查时 {{name}} 没有响应。"
    }
  },
  approval: {
    label: "授权请求",
    theAgent: "智能体",
    commandTitle: "{{agent}} 想要运行一条命令",
    fileTitle: "{{agent}} 想要访问项目以外的文件",
    toolTitle: "{{agent}} 想要使用 {{tool}}",
    otherTitle: "{{agent}} 请求授权",
    waiting_one: "还有 {{count}} 个等待中",
    waiting_other: "还有 {{count}} 个等待中",
    allow: "允许",
    allowSession: "在本对话中允许",
    allowSessionCommands: "在本对话中允许 {{commands}}",
    allowSessionFolders: "在本对话中允许读取 {{folders}}",
    deny: "拒绝",
    readAccess: "读取：",
    writeAccess: "写入：",
    networkAccess: "允许本轮访问网络",
    allowed: "已允许：{{subject}}",
    allowedSession: "已在本对话中允许：{{subject}}",
    denied: "已拒绝：{{subject}}",
    notAnswered: "未答复：{{subject}}"
  },
  questionnaire: {
    label: "规划问题",
    previous: "上一个问题",
    position: "{{current}} / {{total}}",
    next: "下一个问题",
    skipAll: "跳过问题",
    other: "输入其他答案",
    submit: "提交答案",
    tabsLabel: "问题列表",
    quotedAnswer: "“{{answer}}”",
    skippedQuestion: "未作答",
    why: "理由：",
    preview: "预览 — {{label}}",
    addNote: "添加备注",
    editNote: "编辑备注",
    noteLabel: "{{option}} 的备注",
    notePlaceholder: "为该选项添加备注",
    notes: "备注：{{notes}}"
  },
  agentError: {
    runtime_probe_failed: {
      title: "本地 CLI 检查失败",
      message: "无法检查或启动本地编程智能体。请查看下方 CLI 详情，并在设置中重新检查。"
    },
    runtime_incompatible: {
      title: "本地 CLI 不兼容",
      message: "本地编程智能体无法启用所需的能力。请查看下方 CLI 详情，更新 CLI 或在设置中检查其配置。"
    },
    model_not_configured: {
      title: "需要设置模型",
      message: "所选模型尚未配置。请选择一个可用的模型，或在设置中连接它的服务商，然后重试。"
    },
    authentication_failed: {
      title: "认证失败",
      message: "服务商拒绝了你的凭据。请在设置中检查 API 密钥或重新登录。"
    },
    access_denied: {
      title: "访问被拒绝",
      message: "服务商拒绝了这个请求。请检查你的账户是否有权使用这个模型，并查看下方服务商的返回信息。"
    },
    quota_exceeded: {
      title: "服务商额度已用完",
      message: "请检查你在服务商处的余额或用量限制，或换一个模型。"
    },
    rate_limited: {
      title: "触发服务商速率限制",
      message: "服务商收到的请求过多。请稍等片刻再试。"
    },
    invalid_request: {
      title: "模型请求被拒绝",
      message: "服务商拒绝了这个请求或其参数。请检查模型配置，并查看下方服务商的返回信息。"
    },
    model_unavailable: {
      title: "模型端点不可用",
      message: "服务商找不到请求的端点或模型。请在设置中检查 Base URL 和模型 ID。"
    },
    provider_unavailable: {
      title: "服务商服务不可用",
      message: "服务商或网关返回了服务器错误。请稍后再试，或换一个服务商。"
    },
    dns_error: {
      title: "DNS 解析失败",
      message: "无法解析主机名。请检查 DNS、网络连接以及设置中的代理地址。"
    },
    connection_refused: {
      title: "连接被拒绝",
      message: "目标拒绝了连接。请检查端点；如果使用了代理，请确认它正在配置的端口上运行。"
    },
    connection_reset: {
      title: "连接中断",
      message: "连接意外关闭。请检查网络或代理，然后重试。"
    },
    timeout: {
      title: "模型请求超时",
      message: "请求超过了超时时间。请检查网络和代理，或在服务商可用时重试。"
    },
    tls_error: {
      title: "安全连接失败",
      message: "证书校验或 TLS 连接失败。请检查证书和代理设置。"
    },
    stream_error: {
      title: "回复中断",
      message: "服务商的回复意外结束。已收到的内容显示在上方；重试即可继续。"
    },
    network_error: {
      title: "连接错误",
      message: "模型连接失败，没有具体原因。请检查网络或代理设置，然后重试。"
    },
    unknown: {
      title: "模型请求失败",
      message: "模型请求失败，且无法确定原因。请查看下方服务商的返回信息。"
    },
    row: {
      error: "错误",
      notConfigured: "所选模型尚未配置。",
      providerResponse: "服务商返回",
      localCli: "本地 CLI 详情",
      provider: "服务商",
      model: "模型",
      endpoint: "端点",
      transport: "传输方式",
      providerStatus: "服务商状态码",
      httpStatus: "HTTP 状态码",
      errorCode: "错误码",
      requestId: "请求 ID",
      retryAttempts: "重试次数",
      network: "网络配置",
      cause: "原因"
    },
    network: {
      direct: "直接连接",
      manual: "手动代理",
      system: "系统代理",
      environment: "环境变量代理"
    }
  },
  composer: {
    noDesign: "这个项目还没有游戏设计文档",
    gameDesign: "游戏设计",
    queue: "排队发送",
    send: "发送",
    contexts: "下一条消息的上下文",
    removeContext: "从消息中移除 {{label}}",
    selectedText: "选中的文本",
    removeSelectedText: "移除选中的文本",
    referencedDesign: "引用的游戏设计",
    removeDesign: "移除游戏设计引用",
    droppedFolder: "无法读取拖入的文件夹：{{error}}",
    placeholder: {
      review: "请查看上方的计划",
      executing: "正在执行计划",
      followUp: "继续补充",
      change: "说说想改什么"
    },
    drop: "拖放文件以添加",
    prompt: "提示词",
    removeSkill: "移除 Skill",
    removeSkillName: "移除 Skill：{{name}}",
    removePlugin: "移除插件",
    removePluginName: "移除插件：{{name}}",
    stop: "停止 Agent",
    selectedTextActions: "选中文本操作"
  },
  contextMenu: {
    section: {
      Add: "添加",
      Commands: "命令",
      Plugins: "插件",
      Skills: "Skills"
    },
    attachFiles: "添加文件",
    attachFilesHint: "为这条消息添加文件",
    design: "引用游戏设计",
    designHint: "使用已保存的设计文档",
    publish: "发布游戏",
    publishHint: "发布你的游戏并获取分享链接",
    trigger: "添加上下文或文件",
    label: "添加上下文",
    noMatch: "没有匹配的项目"
  },
  attachments: {
    tooLarge: "单个附件不能超过 500 MB",
    tooMany: "一次最多添加 1,000 个文件",
    batchTooLarge: "附件总大小不能超过 1 GB",
    images: "已添加的图片",
    files: "已添加的文件",
    remove: "移除 {{name}}",
    attachImages: "添加图片",
    imageName: "图片 {{number}}",
    imageTypes: "请使用 PNG、JPEG、WebP 或 GIF 图片",
    readFailed: "无法读取 {{name}}"
  },
  videoPrompt: {
    label: "视频提示词",
    placeholder: "描述视频内容。输入 @ 引用图片。",
    references: "参考图",
    noMatch: "没有匹配的图片",
    addImage: "请先添加或连接一张图片",
    imageTypes: "参考图请使用 PNG、JPEG 或 WebP",
    imageSize: "参考图不能超过 30 MB",
    duration: "无法读取 {{name}} 的时长"
  },
  timeline: {
    waitingToSteer: "等待引导",
    copyResponse: "复制回复",
    attachedImage: "附加图片 {{number}}",
    editMessage: "编辑消息",
    copyMessage: "复制消息",
    editorContext: "编辑器上下文",
    workingFor: "已工作 {{duration}}",
    thinking: "思考中",
    thinkingChars: "{{chars}} 字符",
    todo: {
      label: "任务清单",
      inProgress: "进行中",
      pending: "待办",
      done: "已完成",
      addLabel: "添加任务",
      addPlaceholder: "新任务步骤",
      yours: "我加的"
    },
    stoppedThinking: "思考时已停止",
    stoppedBefore: "开始工作前已停止",
    stoppedAfter: "你在 {{duration}} 后停止了",
    workedFor: "工作了 {{duration}}",
    duration: {
      minutes: "{{minutes}} 分 {{seconds}} 秒",
      seconds: "{{seconds}} 秒"
    },
    compactedFrom: "压缩前 {{before}} token",
    compactedFromTo: "从 {{before}} token 压缩到约 {{after}} token",
    compaction: {
      completed: "上下文已压缩",
      cancelled: "上下文压缩已停止",
      failed: "上下文压缩失败",
      running: "正在压缩上下文"
    },
    switchedTo: "已切换到 {{model}}",
    viewedImage: "查看了一张图片",
    viewedImages: "查看了 {{count}} 张图片",
    viewedImageName: "查看的图片 {{number}}",
    stopped: "已停止",
    interrupted: "已中断",
    reconnecting: "正在重新连接 {{attempt}}/{{max}}",
    copyFailed: "无法复制，请选中上方的详情手动复制。",
    diagnosticsCopied: "诊断信息已复制",
    copyDiagnostics: "复制诊断信息",
    detail: {
      query: "查询",
      provider: "服务商",
      fallback: "{{provider}} 不可用，已改用备用服务商。",
      customProvider: "自定义服务商",
      results: "结果",
      resultsTruncated: "结果已截断",
      webSearchFailed: "联网搜索失败，没有输出。",
      shell: "Shell",
      command: "命令",
      outputTruncated: "输出已截断",
      commandFailed: "命令执行失败，没有输出。",
      result: "结果",
      diff: "更改",
      diffTruncated: "仅展示部分更改，增删统计包含完整结果。",
      resultTruncated: "结果已截断",
      operationFailed: "操作失败，没有输出。",
      file: "文件",
      unknownFile: "未知文件",
      fileChangeFailed: "文件修改失败，没有输出。",
      input: "输入",
      output: "输出",
      toolFailed: "工具调用失败，没有输出。",
      toolImage: "工具结果图片",
      toolImageNumber: "工具结果图片 {{number}}",
      search: "搜索",
      queryIn: "{{path}} 中的 {{query}}",
      path: "路径"
    },
    generated3d: "生成的 3D 模型",
    generatedImage: "生成的图片",
    preparing: {
      bash: "正在准备命令",
      read: "正在准备读取",
      write: "正在准备文件",
      edit: "正在准备编辑",
      web_search: "正在准备联网搜索",
      mcp: "正在准备 MCP",
      game_use: "正在准备试玩",
      tool: "正在准备",
      other: "正在准备 {{tool}}"
    },
    group: {
      edit: "编辑文件",
      read: "读取文件",
      search: "搜索文件",
      list: "列出文件",
      web: "联网搜索"
    },
    running: "正在运行 {{command}}",
    ran: "运行了 {{command}}",
    generatingImage: "正在生成图片",
    used: "使用了 {{tool}}",
    target: {
      editing: {
        with: "正在编辑 {{target}}",
        without: "正在编辑文件"
      },
      writing: {
        with: "正在写入 {{target}}",
        without: "正在写入文件"
      },
      reading: {
        with: "正在读取 {{target}}",
        without: "正在读取文件"
      },
      listing: {
        with: "正在列出 {{target}}",
        without: "正在列出文件"
      },
      edited: {
        with: "编辑了 {{target}}",
        without: "编辑了文件"
      },
      read: {
        with: "读取了 {{target}}",
        without: "读取了文件"
      },
      listed: {
        with: "列出了 {{target}}",
        without: "列出了文件"
      }
    },
    search: {
      searchingFor: {
        queryIn: "正在 {{target}} 中搜索 {{query}}",
        query: "正在搜索 {{query}}",
        filesIn: "正在 {{target}} 中搜索文件",
        files: "正在搜索文件"
      },
      finding: {
        queryIn: "正在 {{target}} 中查找 {{query}}",
        query: "正在查找 {{query}}",
        filesIn: "正在 {{target}} 中查找文件",
        files: "正在查找文件"
      },
      searchingWeb: {
        queryIn: "正在联网搜索 {{query}}（{{target}}）",
        query: "正在联网搜索 {{query}}",
        filesIn: "正在联网搜索 {{target}} 中的文件",
        files: "正在联网搜索文件"
      },
      searchedFor: {
        queryIn: "在 {{target}} 中搜索了 {{query}}",
        query: "搜索了 {{query}}",
        filesIn: "在 {{target}} 中搜索了文件",
        files: "搜索了文件"
      },
      searchedWeb: {
        queryIn: "联网搜索了 {{query}}（{{target}}）",
        query: "联网搜索了 {{query}}",
        filesIn: "联网搜索了 {{target}} 中的文件",
        files: "联网搜索了文件"
      }
    },
    playtest: {
      open: {
        done: "打开了游戏预览",
        running: "正在打开游戏预览"
      },
      inspect: {
        done: "检查了游戏状态",
        running: "正在检查游戏状态"
      },
      action: {
        done: "执行了一个试玩操作",
        running: "正在执行一个试玩操作"
      },
      actions: {
        done: "执行了试玩操作",
        running: "正在执行试玩操作"
      },
      capture: {
        done: "截取了游戏画面",
        running: "正在截取游戏画面"
      },
      close: {
        done: "关闭了游戏预览",
        running: "正在关闭游戏预览"
      },
      other: {
        done: "进行了游戏试玩",
        running: "正在进行游戏试玩"
      }
    },
    summary: {
      separator: "，",
      actionFailed: "一个操作失败",
      actionsFailed: "多个操作失败",
      usedTools: "使用了工具",
      editedFile: "编辑了一个文件",
      editedFiles: "编辑了多个文件",
      readFile: "读取了一个文件",
      readFiles: "读取了多个文件",
      ranCommand: "运行了一个命令",
      ranCommands: "运行了多个命令",
      searchedWeb: "联网搜索了一次",
      searchedWebMultiple: "联网搜索了多次",
      playtested: "试玩了游戏",
      /* spike patch */
      usedToolA: "使用了{{name}}",
      /* spike patch */
      usedToolAn: "使用了{{name}}",
      /* spike patch */
      usedToolsNamed: "多次使用{{name}}"
    }
  },
  checkpoints: {
    lineCounts: "新增 {{added}} 行，删除 {{removed}} 行",
    kind: { added: "新增", modified: "修改", removed: "删除" },
    state: { changed: "之后又改过", undone: "已恢复原样" },
    filesChanged_one: "更改了 {{count}} 个文件",
    filesChanged_other: "更改了 {{count}} 个文件",
    undo: "撤销",
    reapply: "重新应用",
    reapplyRest: "重新应用其余部分",
    reapplyConflicts: "这些文件在撤销后又被修改过：",
    reapplied_one: "已重新应用 {{count}} 个文件。",
    reapplied_other: "已重新应用 {{count}} 个文件。",
    noLineCounts: "暂无行数统计",
    undoRest: "撤销其余部分",
    partlyUndone: "已部分撤销",
    loadingChanges: "正在加载更改…",
    noChanges: "没有可显示的文件更改。",
    loadingFile: "正在加载文件…",
    undoChanges: "撤销更改",
    andMore: "以及另外 {{count}} 个",
    renewed: "期间又有文件被更改，因此没有覆盖任何文件。",
    blockedIntro: "这些文件无法恢复，因为它们的位置上有其他文件：",
    conflictsIntro: "这些文件在本回合之后又被更改过：",
    blockedHint: "继续处理其余文件，保留这些文件及其后续编辑。",
    conflictsHint: "保留它们，只恢复其他文件；或者覆盖它们，之后所做的更改会丢失。",
    keep: "保留",
    overwrite: "覆盖",
    binary: "二进制文件",
    emptyFile: "空文件",
    samePart: "显示的部分没有差异。文件比显示的内容更长。",
    sameLines: "各行内容相同，只有换行符或文件权限发生了变化。",
    truncated: "只显示了这个文件的开头部分。",
    diffTruncated: "仅显示部分差异。",
    nonePutBack: "没有文件被恢复。",
    putBack_one: "已恢复 {{count}} 个文件。",
    putBack_other: "已恢复 {{count}} 个文件。",
    kept_one: "{{count}} 个文件保持原样。",
    kept_other: "{{count}} 个文件保持原样。",
    restoreToMessage: "恢复到这条消息之前",
    restoreConfirm: `要把项目恢复到这条消息之前吗？

此后的所有文件更改（包括你自己做的）以及这条消息和之后的对话都会被移除。`,
    unfinished: {
      interrupted: "恢复文件的过程被中断，项目文件可能只更改了一部分。",
      alreadyBack: "文件已经是中断之前的状态。",
      ok: "确定",
      willPutBack_one: "{{count}} 个文件会恢复到中断之前的状态，此后对该文件的更改会丢失。",
      willPutBack_other: "{{count}} 个文件会恢复到中断之前的状态，此后对这些文件的更改会丢失。",
      kind: { added: "恢复", modified: "改回", removed: "移除" },
      putBack_one: "恢复 {{count}} 个文件",
      putBack_other: "恢复 {{count}} 个文件",
      notNow: "暂不处理",
      putFilesBack: "恢复文件"
    }
  },
  api: {
    runtimeUnreachable: "无法连接本地运行时",
    requestFailed: "请求失败（{{status}}）",
    serviceUnavailable: "后台服务不可用",
    serviceUnavailableLong: "后台服务不可用，请等待恢复或重启服务。"
  },
  publish: {
    applyCoverButton: "应用封面",
    processingCover: "正在处理封面…",
    savingCover: "正在保存封面…",
    publishing: "正在发布…",
    update: "发布更新",
    publish: "发布",
    coverApplied: "封面已应用。",
    applyCover: "发布前，请先应用或取消所选的封面。",
    failed: "发布未完成，请重试。",
    gamePublished: "游戏已发布",
    publishedGame: "已发布的游戏",
    publishGame: "发布游戏",
    cover: "封面",
    notApplied: "未应用",
    automaticTitle: "用项目预览自动更新封面",
    automatic: "自动",
    automaticLabel: "自动封面",
    coverPreview: "游戏封面预览",
    loadingCover: "正在加载封面…",
    noCover: "未选择封面",
    autoCaptured: "会自动截取预览画面",
    replaceCover: "更换封面",
    cancelSelection: "取消选择",
    localCover: "这是本地项目的封面。发布更新后才会改变社区中的封面。",
    description: "简介",
    descriptionPlaceholder: "介绍一下这款游戏好玩在哪里",
    gameCover: "游戏封面",
    success: "发布成功",
    lastPublished: "最近发布",
    linkCopied: "链接已复制",
    copyLink: "复制游戏链接",
    openGame: "打开游戏",
    copyFailed: "无法复制链接。",
    viewInCommunity: "在社区中查看",
    localDebug: "本地调试发布。这个链接只能在本机使用，本地运行时停止或重启后失效。",
    unknownTime: "发布时间未知",
    coverProcessFailed: "无法处理这张封面图片"
  },
  pluginPortability: {
    export: "导出插件",
    exporting: "正在导出…",
    import: "导入插件包",
    importMenuHint: "从 ZIP 文件恢复插件",
    importHint: "从 ZIP 备份恢复插件。",
    chooseArchive: "ZIP 插件包",
    tooLarge: "请选择不超过 50 MB 的 ZIP 文件",
    restore: "导入插件",
    review: "重新检查插件包",
    inspecting: "正在读取插件包…",
    confirmReplace: "要用此插件包替换“{{name}}”吗？插件文件和备份中的非敏感配置、启用设置将被替换，同名密钥字段的凭据会保留。",
    replacesExisting: "将替换已安装的 Personal 插件。",
    installsPersonal: "将安装为 Personal 插件。",
    restoresSettings: "会恢复非敏感配置和启用设置。",
    archiveSource: "导入的插件包",
    dependencies: "运行依赖",
    localTools: "本机工具与脚本",
    dependenciesHint: "检查本机工具和脚本路径。外部服务请使用 MCP 连接测试。",
    check: "检查依赖",
    checking: "正在检查…",
    noDependencies: "未声明额外的本机命令依赖。",
    status: { ok: "就绪", warning: "需要检查", error: "不可用" },
    checks: {
      command: "命令：{{target}}",
      platform: "支持的系统：{{target}}",
      path: "脚本：{{target}}",
      cwd: "工作目录：{{target}}",
      configuration: "{{target}} 需要先完成配置，才能检查本机依赖。",
      "unpinned-package": "{{target}} 没有固定依赖版本，以后下载时内容可能变化。",
      "absolute-path": "{{target}} 使用了本机或工作区路径，迁移插件前请检查。"
    }
  },
  plugins: {
    beta: "Beta",
    public: "公开",
    personal: "个人",
    collections: "插件来源",
    viewAll: "查看全部（{{count}}）",
    categories: {
      creation: "游戏创作",
      engines: "引擎与平台",
      assets: "美术与素材",
      other: "其他插件"
    },
    editWithAi: "使用 AI 编辑",
    askAboutPlugin: "向 AI 了解此插件",
    createdWithAi: "使用 AI 创建",
    skillCount_one: "{{count}} 个 Skill",
    skillCount_other: "{{count}} 个 Skill",
    newProject: "新建{{type}}项目",
    plugin: "插件",
    title: "插件",
    search: "搜索插件…",
    searchLabel: "搜索插件",
    installing: "正在安装…",
    add: "添加插件",
    createWithAi: "用 AI 创建",
    createWithAiHint: "让 Agent 帮你做一个插件",
    addMcp: "添加 MCP 服务…",
    addMcpHint: "通过插件连接工具",
    fromFolder: "从文件夹安装…",
    fromFolderHint: "选择本地插件目录",
    fromGit: "从 Git 安装…",
    fromGitHint: "克隆一个公开的 HTTPS 仓库",
    loading: "正在加载插件",
    choose: "选择插件",
    installFromGit: "从 Git 安装",
    selectFrom: "从 {{marketplace}} 中选择一个插件。",
    enterUrl: "输入公开的 HTTPS 仓库地址或插件市场地址。",
    repositoryUrl: "仓库或插件市场地址",
    install: "安装",
    noMatch: "此分类中没有插件。",
    showLess: "收起",
    needsConfiguration: "需要配置",
    installToTry: "安装这个插件后才能试用示例。",
    enableToTry: "启用这个插件后才能试用示例。",
    noMatchingProjects: "没有匹配的项目",
    noTypedProjects: "还没有{{type}}项目",
    noCompatibleProjects: "还没有兼容的项目",
    loadingPlugin: "正在加载插件",
    included: "内置",
    tryNow: "立即试用",
    tryName: "试用 {{name}}",
    chooseProject: "选择项目",
    promptAdded: "提示词会添加到一个新对话中。",
    startingConversation: "正在开始对话",
    about: "简介",
    tryIt: "试一试",
    configureWithAi: "用 AI 配置",
    skills: "Skills",
    showInFinder: "在 Finder 中显示",
    showNameInFinder: "在 Finder 中显示 {{name}}",
    disableName: "停用 {{name}}",
    enableName: "启用 {{name}}",
    loadingSkill: "正在加载 Skill",
    includedWithXcFlow: "Game Workbench 内置",
    claudeMarketplace: "Claude 插件市场 · {{marketplace}}",
    localFolder: "本地文件夹",
    gitRepository: "Git 仓库",
    management: "管理",
    status: "状态",
    notInstalled: "未安装",
    version: "版本",
    source: "来源",
    repository: "仓库",
    openFolder: "打开文件夹"
  },
  pluginControls: {
    needsConfiguration: "需要配置：{{fields}}",
    uninstall: "卸载插件",
    confirmUninstall: "要卸载“{{name}}”吗？",
    uninstallShort: "卸载",
    configuration: "配置",
    chooseOption: "请选择",
    configuredReplace: "已配置 — 输入新值以替换",
    absolutePath: "绝对路径",
    willClear: "将被清除",
    clearSaved: "清除已保存的值",
    saveConfiguration: "保存配置",
    loadingConfiguration: "正在加载配置…",
    savedDraft: "已为这个草稿保存。安装时会沿用这些凭据。",
    savedActive: "已保存。进行中的对话会在当前回合结束后应用更改。",
    mcpServices: "MCP 服务",
    connectedTools: "已连接 · {{count}} 个工具",
    authorizationRequired: "需要授权",
    readyToConnect: "可以连接",
    test: "测试",
    editConfiguration: "编辑配置",
    authorize: "授权",
    mcpConfiguration: "MCP 服务配置",
    credentialsReferenced: "已保存的凭据会通过配置字段引用。",
    openAuthorization: "打开授权页面",
    pasteCallback: "授权后，粘贴回调地址或授权码",
    completeAuthorization: "完成授权",
    providerNotInstalled: "提供方未安装",
    providedByAnother: "由其他插件提供",
    providerDisabled: "提供方已停用",
    manageProvider: "管理提供方",
    repairWithAi: "用 AI 设置或修复",
    changesApply: "更改会在当前对话回合结束后生效。",
    addMcpPlugin: "添加 MCP 插件",
    pluginName: "插件名称",
    connectionType: "连接方式",
    localCommand: "本地命令",
    pasteConfig: "粘贴 MCP 配置",
    mcpUrl: "MCP 地址",
    command: "命令",
    arguments: "参数（JSON 数组）",
    mcpConfig: "MCP 配置",
    configFields: "配置字段",
    optionalFields: "可选的字段定义（JSON）",
    keysStored: "环境变量或请求头中的 API 密钥会与插件包分开存储。",
    adding: "正在添加…"
  },
  pluginIcons: {
    package: "插件",
    gamepad: "游戏",
    globe: "网页",
    box: "3D",
    image: "图片",
    palette: "设计",
    brush: "绘画",
    music: "音乐",
    video: "视频",
    film: "动画",
    code: "代码",
    terminal: "终端",
    plug: "连接",
    server: "服务器",
    wand: "魔法",
    sparkles: "AI",
    document: "文档",
    folder: "文件",
    layers: "图层",
    lightbulb: "创意",
    search: "搜索",
    wrench: "工具",
    clipboard: "评审",
    flag: "目标"
  },
  pluginIconPicker: {
    title: "插件图标",
    change: "更改插件图标",
    source: "图标来源",
    preview: "图标预览",
    preset: "预设图标",
    upload: "上传图片",
    path: "插件包图片",
    search: "搜索图标",
    searchPlaceholder: "按名称或用途搜索",
    noMatches: "没有匹配的图标",
    presetId: "预设 ID",
    presetHelp: "从列表选择预设图标，或输入它的 ID。",
    imageFile: "图片文件",
    imageInput: "插件图标图片",
    fileHelp: "支持 PNG、WebP 或静态 SVG，最大 1 MB，尺寸不超过 2048 × 2048。SVG 需有 viewBox，使用图形表现属性，不含脚本、样式或外部资源。",
    imagePath: "图片路径",
    pathInput: "插件图标路径",
    pathHelp: "选择此插件包内的 PNG、WebP 或静态 SVG 文件。",
    useDefault: "恢复默认",
    save: "保存图标",
    readFailed: "无法读取图片",
    chooseIcon: "请选择插件图标",
    invalidFile: "请选择不超过 1 MB 的 PNG、WebP 或 SVG 图片"
  },
  pluginBuilder: {
    mode: { create: "创建", configure: "配置", edit: "编辑" },
    newConversation: "新建对话",
    deleteConversation: "删除对话",
    confirmDeleteConversation: "要删除此对话吗？草稿文件、已安装插件及其配置会保留。",
    configurePlaceholder: "询问此插件的用法，或描述配置问题…",
    editPlaceholder: "描述你想对这个插件进行的修改…",
    loadFailed: "无法加载插件构建工作区。{{error}}",
    workspaces: "插件工作区",
    continue: "AI 工作区",
    workspaceActions: "{{title}} 的操作",
    tab: {
      overview: "概览",
      files: "文件",
      setup: "设置",
      checks: "检查"
    },
    noDraft: "没有草稿",
    noConfiguration: "没有配置",
    noChecks: "没有检查项",
    testConnections: "测试连接",
    backToPlugins: "返回插件",
    assistant: "插件助手",
    newPlugin: "新插件",
    opening: "正在打开工作区…",
    interrupted: "本次运行已中断。对话和文件都已保存，发送消息即可继续。",
    placeholder: "描述你的插件要做什么…",
    send: "发送插件需求",
    stop: "停止助手",
    preview: "插件预览",
    views: "插件视图",
    refresh: "刷新插件预览",
    open: "打开插件",
    deleteDraft: "删除插件草稿",
    deleteWorkspace: "删除工作区",
    confirmDelete: "要删除“{{title}}”吗？草稿文件和对话会被永久删除，已安装插件及其配置会保留。",
    update: "更新插件",
    install: "安装插件",
    installed: "已安装",
    noFile: "未选择插件文件",
    noFiles: "没有文件",
    readDocument: "阅读文档",
    viewSource: "查看源码",
    packageStructure: "包结构",
    needsChanges: "需要修改",
    passed: "通过",
    connectedTools_one: "已连接 · {{count}} 个工具",
    connectedTools_other: "已连接 · {{count}} 个工具",
    outdated: "已过期",
    notTested: "未测试",
    testServer: "测试 {{name}} 连接",
    status: {
      idle: "就绪",
      working: "正在处理…",
      ready: "草稿可以检查了",
      installed: "已安装",
      interrupted: "运行已中断",
      error: "需要处理"
    }
  },
  canvas: {
    restoreWorkspace: "请恢复工作区文件，然后重新加载。",
    selectedCount: "（已选 {{count}} 个）",
    reviewConflicts: "查看画布冲突",
    reviewChanges: "查看更改",
    retrySaving: "重试保存画布工作区",
    saveFailedRetry: "保存失败 · 重试",
    retrySync: "重试画布同步",
    retrySyncTitle: "重试同步工作区更改",
    syncPausedRetry: "同步已暂停 · 重试",
    status: {
      saving: "正在保存",
      error: "保存失败",
      loadError: "无法加载",
      draft: "草稿已保存在本地",
      loading: "加载中"
    },
    board: "画板",
    newBoard: "新建画板",
    boardOptions: "画板选项：{{name}}",
    assetCanvasWorkspace: "素材画布工作区",
    designWorkspace: "设计工作区",
    tab: {
      canvas: "画布"
    },
    workspaceMode: "工作区模式",
    actionFailed: "无法完成这个操作。",
    reconnectFailed: "无法重新连接，画布仍处于打开状态。",
    retrySyncAction: "重试同步",
    loadFailed: "无法加载工作区。",
    reloadWorkspace: "重新加载工作区",
    documentsSaveFailed: "无法保存文档，草稿已保留。",
    retrySave: "重试保存",
    documentConflict: "文档“{{title}}”在其他地方被修改了。请选择一个版本以继续保存。",
    useDisk: "使用磁盘上的版本",
    keepMine: "保留我的版本",
    tablesSaveFailed: "无法保存表格，草稿已保留。",
    boardConflict: "画板在其他地方被修改了。草稿已保留，请选择一个版本以继续保存。",
    loadBeforeResolve: "请先加载画布，再处理它的更改。",
    moveUp: "上移",
    moveDown: "下移",
    deleteBoard: "删除画板",
    expandedTable: "展开的表格",
    backToCanvas: "返回画布",
    renameBoard: "重命名画板",
    confirmDeleteBoard: "要删除“{{name}}”吗？文档和素材库中的素材会保留。",
    insertImage: "插入图片",
    addText: "向文档添加文本",
    documentNotFound: "找不到文档",
    document: "文档",
    selectDocument: "选择文档",
    boardEditedElsewhere: "画板在其他地方被修改了。保存前请先选择一个版本。",
    reloadBeforeSaving: "保存前请重新加载画布。你的修改会保留在本次会话中。",
    timeout: "本地画布服务响应超时，请重试。"
  },
  canvasDocs: {
    restoreFirst: "请先恢复文档文件，再采用此草稿。你仍然可以编辑或复制草稿。",
    editedElsewhere: "同一份文档在其他地方被修改了。保存前请先选择一个版本。",
    removed: "文档已从工作区索引中移除",
    saveBlocked: "无法保存文档“{{title}}”。关闭前请先恢复它的工作区文件。",
    keepsChanging: "文档一直在变化，请再次尝试保存。",
    untitled: "未命名文档",
    resolveFirst: "采用这份草稿前，请先解决文档冲突。",
    changedDuringGeneration: "生成期间文档发生了变化。替换前请先查看 AI 的结果。",
    generationInterrupted: "文档生成被中断。你的指令和候选草稿已保留，请重试。",
    savingInterrupted: "保存被中断。再次采用候选草稿前，请先检查文档。"
  },
  canvasDoc: {
    unavailableDraftKept: "文档不可用：{{source}}。未保存的草稿已保留。",
    unavailableRestore: "文档不可用：{{source}}。请恢复文件后重新加载。",
    missing: "文档缺失",
    title: "文档标题",
    markdown: "文档 Markdown",
    view: "文档视图",
    editMarkdown: "编辑 Markdown",
    preview: "预览文档",
    insertImage: "从素材库插入图片",
    expand: "展开文档",
    imageUnavailable: "图片不可用：{{file}}",
    image: "图片",
    checkAgain: "重新检查",
    instruction: "文档生成指令",
    instructionPlaceholder: "描述要写的内容或要做的修改",
    retryGeneration: "重试生成文档",
    generate: "生成文档",
    candidate: "AI 候选草稿",
    incomplete: "草稿不完整 — 替换文档前请先检查。",
    candidateReview: "候选草稿 — 替换文档前请先检查。",
    candidateView: "候选草稿视图",
    editCandidate: "编辑候选草稿",
    previewCandidate: "预览候选草稿",
    candidateMarkdown: "候选草稿 Markdown",
    copyCandidate: "复制候选草稿",
    copied: "草稿已复制。",
    copyFailed: "无法复制，请选中草稿文本手动复制。",
    discardCandidate: "放弃候选草稿",
    replace: "用草稿替换文档",
    useDraft: "使用草稿",
    expandedTitle: "展开文档的标题",
    split: "分栏视图",
    download: "下载 Markdown",
    options: "文档选项",
    expandedMarkdown: "展开文档的 Markdown",
    main: "主设计文档",
    setMain: "设为主设计文档"
  },
  canvasTable: {
    notFound: "找不到表格。",
    resolveFirst: "使用 AI 修改前，请先解决表格冲突。",
    restoreFirst: "使用 AI 修改前，请先恢复表格文件。草稿已保留。",
    reviewDraft: "替换表格前请先检查 AI 草稿；当前的编辑已保留。",
    removed: "表格已从工作区索引中移除，草稿已保留在本地。",
    invalid: "表格数据无效。",
    untitled: "未命名表格",
    cellConflict: "同一个单元格在其他地方被修改了。请选择一个版本以继续保存。",
    interrupted: "AI 编辑表格被中断。你的指令和候选草稿已保留，请重试。"
  },
  tableNode: {
    candidateReview: "候选草稿——请检查后再替换表格。",
    pasteHint: "可从电子表格粘贴单元格。导入 CSV 会替换表格，可通过撤销恢复。",
    table: "表格",
    unavailable: "表格不可用。恢复它的文件后即可重新加载。",
    view: "表格视图",
    edit: "编辑表格",
    expand: "展开表格",
    title: "表格标题",
    preview: "预览表格",
    previewLabel: "表格预览",
    rows: "行",
    noRows: "还没有行。编辑表格，或在下方描述要生成的内容。",
    instruction: "表格生成指令",
    instructionPlaceholder: "描述要创建或修改的表格",
    retryGeneration: "重试生成表格",
    generate: "生成表格",
    draft: "AI 表格草稿",
    copyDraft: "复制表格草稿",
    copyDraftFailed: "无法复制草稿。",
    discardDraft: "放弃表格草稿",
    replace: "用草稿替换表格",
    conflict: "表格“{{title}}”在其他地方被修改了。草稿已保留，请选择一个版本以继续保存。",
    editor: "表格编辑器",
    addRow: "添加行",
    row: "行",
    addColumn: "添加列",
    columnName: "列 {{number}}",
    column: "列",
    undo: "撤销表格编辑",
    redo: "重做表格编辑",
    copyTsv: "以 TSV 格式复制表格",
    copied: "表格已复制。",
    copyFailed: "无法复制表格。",
    exportCsv: "导出 CSV",
    importCsvTitle: "导入 CSV（替换表格）",
    importCsv: "导入 CSV",
    tooLarge: "表格太大了。",
    columnTitle: "列 {{number}} 标题",
    columnType: "列 {{number}} 类型",
    type: {
      text: "文本",
      number: "数字",
      boolean: "布尔值"
    },
    deleteColumnNumber: "删除列 {{number}}",
    deleteColumn: "删除列",
    resizeColumn: "调整列 {{number}} 宽度",
    deleteRowNumber: "删除行 {{number}}",
    deleteRow: "删除行",
    cell: "第 {{row}} 行，{{column}}",
    columnLower: "列 {{number}}"
  },
  assetCanvas: {
    textureQualities: {
      fast: "快速",
      standard: "标准",
      detailed: "精细",
      extreme: "极致"
    },
    rigTypes: {
      biped: "双足",
      quadruped: "四足",
      hexapod: "六足",
      octopod: "八足",
      serpentine: "蛇形",
      aquatic: "水生"
    },
    moveCount_one: "{{count}} 个动作",
    moveCount_other: "{{count}} 个动作",
    animationSelection: "已选 {{count}}/{{max}} 个 · 绑定骨骼和动画会消耗服务商额度",
    group: {
      assets: "素材",
      documents: "文档"
    },
    node: {
      text: "文本",
      textHint: "编写可复用的提示词",
      image: "图像",
      imageHint: "在画布上生成图像",
      video: "视频",
      videoHint: "在画布上生成视频",
      speech: "语音",
      speechHint: "在画布上合成配音旁白",
      soundEffect: "音效",
      soundEffectHint: "在画布上生成音效",
      music: "音乐",
      musicHint: "在画布上生成音乐",
      model3d: "3D 模型",
      model3dHint: "在画布上生成 3D 模型",
      animate3d: "3D 动画",
      animate3dHint: "为 3D 角色绑定骨骼并添加动作",
      document: "文档",
      markdown: "Markdown 文档",
      existingDocument: "已有文档",
      existingDocumentHint: "添加文档引用",
      table: "表格",
      tableHint: "可编辑的游戏数据",
      existingTable: "已有表格",
      existingTableHint: "添加共享表格引用",
      sharedTable: "共享表格"
    },
    saveFailedDetail: "无法保存画布：{{error}}",
    file: "文件",
    folder: "文件夹",
    showInFolder: "在文件夹中显示",
    folderImportTitle_one: "导入这个文件夹？",
    folderImportTitle_other: "导入这些文件夹？",
    folderImportOneFile: "{{name}} 包含 1 个文件（{{size}}）。",
    folderImportFiles: "{{name}} 包含 {{count}} 个文件（{{size}}）。",
    folderImportMany: "{{folders}} 个文件夹共包含 {{count}} 个文件（{{size}}）。",
    folderImportHint: "作为文件夹导入会保留目录结构，复制到 assets/files/，并在画布上添加一个文件夹节点。分别导入文件会为每个文件添加一个节点。",
    importFilesSeparately: "分别导入文件",
    importFolder_one: "导入文件夹",
    importFolder_other: "导入文件夹",
    folderFileLimit: "一次导入的文件夹最多包含 5,000 个文件。",
    folderSizeLimit: "一次导入的文件夹最多 2 GB。",
    uploadSize: "上传的文件不能超过 200 MB。",
    importRunning: "已有文件正在导入。",
    importLimit: "一次最多导入 1,000 个文件。",
    nodeLimit: "一个画布最多包含 2,000 个节点。",
    textTooLarge: "文本文档不能超过 1 MB。",
    documentCreateFailed: "无法创建文档。",
    tableCreateFailed: "无法创建表格。",
    canvasFull: "导入过程中画布已满。请从素材库添加已上传的素材。",
    pasteProject: "文档和表格引用只能粘贴到同一项目的画板中。",
    instructionRequired: "生成前请先添加指令。",
    noMoreReferences: "这个节点无法再添加参考图。",
    readImageFailed: "无法读取连接的图片。",
    referenceSize: "每张参考图不能超过 10 MB。",
    videoCoverFailed: "无法读取视频封面",
    downloadFailed: "无法下载：{{error}}",
    sendFailed: "无法发送素材：{{error}}",
    addUpTo_one: "最多还能添加 {{count}} 张图片。",
    addUpTo_other: "最多还能添加 {{count}} 张图片。",
    modeAccepts: "这个模式还能添加 {{count}} 张参考图。",
    missingNode: "节点缺失",
    missingAsset: "素材缺失",
    addReferences: "添加参考图",
    sourceModel: "源模型",
    connectGlb: "连接一个源 GLB 模型",
    model: "模型",
    connect3d: "连接一个 3D 模型",
    expandedText: "展开的文本",
    dropFiles: "拖放文件",
    importing: "正在导入文件",
    loading: "正在加载画布…",
    loadFailed: "无法加载画布。{{error}}",
    reload: "重新加载画布",
    saveFailed: "无法保存画布，草稿已保留。",
    transferFailed: "部分项目无法导入或粘贴。",
    nodeDetails: "节点详情",
    automaticName: "自动命名",
    textOutput: "文本输出",
    textPlaceholder: "生成或手写的文本",
    imageModel: "图像模型",
    unavailableModel: "模型不可用",
    selectModel: "选择模型",
    noImageModel: "没有图像模型",
    imageAspect: "图像宽高比",
    imageResolution: "图像分辨率",
    imageNumber: "图片 {{number}}",
    modeLimit: "这个模式最多支持 {{limit}} 张图片。请移除多余的图片或切换参考模式。",
    firstFrame: "首帧",
    lastFrame: "尾帧",
    videoModel: "视频模型",
    noVideoModel: "没有视频模型",
    audioModel: "音频模型",
    noAudioModel: "没有语音模型",
    noCompatibleAudioModel: "没有兼容的音频模型",
    speechSpeed: "语速",
    audioDuration: "时长",
    automatic: "自动",
    instrumental: "纯音乐",
    loop: "循环",
    soundEffectPrompt: "音效提示词",
    soundEffectPromptPlaceholder: "描述你想生成的音效",
    musicPrompt: "音乐提示词",
    musicPromptPlaceholder: "描述你想生成的音乐",
    negativePrompt: "负面提示词",
    negativePromptPlaceholder: "描述需要排除的声音",
    lyrics: "歌词",
    lyricsPlaceholder: "输入要生成歌曲的歌词",
    voice: {
      label: "音色",
      default: "服务商默认音色",
      custom: "自定义 Speaker ID",
      chinese: "中文音色",
      english: "英文音色"
    },
    speed: {
      normal: "正常",
      slower: "稍慢",
      muchSlower: "很慢",
      faster: "稍快",
      muchFaster: "很快"
    },
    referenceMode: "视频参考模式",
    imageReferences: "图片参考",
    firstLast: "首帧 / 尾帧",
    videoAspect: "视频宽高比",
    videoResolution: "视频分辨率",
    videoDuration: "视频时长",
    seconds: "{{count}} 秒",
    hint: {
      text3d: "在下方描述一个 3D 模型，然后生成",
      retexture: "连接一个源模型，并描述或引用新的贴图",
      remesh: "连接一个源模型并选择面数",
      animate: "连接一个 3D 模型，选择动作，然后生成动画",
      humanoid: "连接一个人形 3D 模型，选择动作，然后生成动画"
    },
    operation: "3D 操作",
    op: {
      animate: "动画",
      image: "图生 3D",
      text: "文生 3D",
      retexture: "重新贴图",
      remesh: "重新拓扑"
    },
    processingConnection: "处理连接",
    model3d: "3D 模型",
    selectConnection: "选择连接",
    no3dModel: "没有 3D 模型",
    polycount: "面数",
    texture: "贴图",
    pose: "角色姿势",
    defaultPose: "默认姿势",
    atPose: "A / T 姿势",
    tPose: "T 姿势",
    aPose: "A 姿势",
    textureVersion: "贴图版本",
    textureQuality: "贴图质量",
    hyper3dRetexture: "需要一张参考图和一个源 GLB。",
    apiKeyCredits: "API 密钥 · 每次生成 {{credits}} 积分",
    libraryImage: "素材库图片",
    assetUnavailable: "素材不可用",
    audio: "音频",
    loadingAsset: "正在加载素材…",
    library: "素材库",
    project: "项目",
    animationProvider: "动画服务商",
    selectAnimationProvider: "选择动画服务商",
    rigVersion: "骨骼版本",
    humanoid: "人形 v1",
    creature: "生物 v2.5",
    rigType: "骨骼类型",
    inPlace: "原地",
    characterHeight: "角色身高",
    meters: "{{value}} 米",
    chooseMoves: "选择动作",
    closePicker: "关闭动作选择",
    searchMoves: "搜索动作",
    noPreviews: "{{provider}} 提供的预设动作没有可视预览。",
    thisProvider: "这个服务商",
    moveCategories: "动作分类",
    setupProvider: "请在{{link}}中设置动画服务商，然后浏览动作。",
    loadingMoves: "正在加载动作…",
    movesFailed: "无法加载动作。",
    noMovesMatch: "没有符合搜索条件的动作",
    selectedMoves: "已选动作（按片段顺序）",
    noMovesSelected: "未选择动作",
    removeMove: "移除动作",
    moveId: "动作 {{id}}",
    media: {
      image: {
        label: "图像",
        none: "还没有图像",
        generate: "生成图像",
        again: "重新生成图像",
        describe: "在下方描述图像，然后生成",
        generating: "正在生成图像…",
        prompt: "图像提示词",
        placeholder: "描述你想生成的图像"
      },
      video: {
        label: "视频",
        none: "还没有视频",
        generate: "生成视频",
        again: "重新生成视频",
        describe: "在下方描述视频，然后生成",
        generating: "正在生成视频…",
        prompt: "视频提示词",
        placeholder: "描述你想生成的视频"
      },
      audio: {
        label: "音频",
        none: "还没有音频",
        generate: "生成音频",
        again: "重新生成音频",
        describe: "在下方输入提示词，然后生成",
        generating: "正在生成音频…",
        prompt: "语音文案",
        placeholder: "输入要合成的文字"
      },
      model: {
        label: "3D 模型",
        none: "还没有 3D 模型",
        generate: "生成 3D 模型",
        again: "重新生成 3D 模型",
        describe: "在下方添加参考图，然后生成",
        generating: "正在生成 3D 模型…",
        prompt: "3D 模型提示词",
        placeholder: "描述你想生成的 3D 模型"
      },
      animation: {
        label: "3D 动画",
        none: "还没有动画",
        generate: "生成动画",
        again: "重新生成动画"
      }
    },
    addSlot: "添加{{slot}}",
    references: "参考",
    emptyText: "连接的文本节点是空的",
    disconnectText: "断开文本",
    animated3d: "3D 动画模型",
    rigging: "正在绑定骨骼并生成动画…",
    takesMinutes: "可能需要几分钟",
    takesMoment: "可能需要一点时间",
    checking: "正在检查…",
    pause: "暂停{{label}}",
    play: "播放{{label}}",
    unmute: "取消静音{{label}}",
    mute: "静音{{label}}",
    polys: "{{value}} 面",
    cancelGeneration: "取消生成",
    addNode: "添加节点",
    uploading: "正在上传…",
    upload: "上传",
    uploadHint: "从这台设备添加文件",
    fromLibrary: "从素材库",
    fromLibraryHint: "使用已有素材",
    addFromLibrary: "从素材库添加",
    addToProject: "添加到项目",
    addNameToProject: "将 {{name}} 添加到项目",
    download: "下载",
    downloadName: "下载 {{name}}",
    canvasActions: "画布操作",
    nodeActions: "节点操作",
    addToDocument: "添加到文档",
    undo: "撤销",
    redo: "重做",
    paste: "粘贴",
    addToProjectEllipsis: "添加到项目…",
    copyNode: "复制节点",
    viewNumber: "视图 {{number}}",
    missingImage: "图片缺失",
    connectedImage: "已连接的图片",
    missingImageNode: "图片节点缺失",
    missingModel: "模型缺失",
    connected3d: "已连接的 3D 模型",
    missingModelNode: "模型节点缺失",
    referenceNumber: "参考图 {{number}}",
    ref: {
      image: {
        connected: "已连接的图片",
        missing: "图片节点缺失",
        label: "图片 {{number}}"
      },
      video: {
        connected: "已连接的视频",
        missing: "视频节点缺失",
        label: "视频 {{number}}"
      },
      audio: {
        connected: "已连接的音频",
        missing: "音频节点缺失",
        label: "音频 {{number}}"
      }
    },
    view: {
      Front: "正面",
      Left: "左侧",
      Back: "背面",
      Right: "右侧"
    },
    viewAction: "查看",
    needsProvider: "{{label}} 需要一个提供它的服务商。"
  },
  sceneWorkbench: {
    trim: {
      action: "剪辑视频",
      title: "剪辑背景视频",
      hint: "选择这个场景要播放的片段，原始视频保持完整。时间以原视频为准。",
      start: "开始",
      end: "结束",
      startTime: "开始时间（秒或 mm:ss.xxx）",
      endTime: "结束时间（秒或 mm:ss.xxx）",
      length: "已选片段：{{seconds}} 秒",
      preview: "预览选中片段",
      pause: "暂停",
      reset: "恢复完整视频",
      apply: "应用剪辑",
      saving: "正在保存…",
      invalid: "请输入视频时长内的有效范围，片段至少为 0.1 秒。",
      unavailable: "无法播放这个视频，请尝试受支持的 MP4 或 WebM 文件。",
      changed: "背景视频或剪辑范围已发生变化，请重新打开剪辑窗口后再试。"
    },
    pickedCount: "已选 {{count}} 个",
    askFailed: "无法询问 AI：{{summary}}",
    textFailed: "无法修改文本：{{error}}",
    changing: "将“{{before}}”改为“{{after}}”",
    moveFailed: "无法移动：{{error}}",
    moving: "移动 <{{tag}}>{{excerpt}}",
    addFailed: "无法添加 {{name}}：{{error}}",
    noBackground: "这个场景没有可移除的背景",
    removeBackgroundFailed: "无法移除背景：{{error}}",
    replayTitle: "从头重新播放这个场景",
    replay: "重新播放",
    playtestFromHere: "从这个场景开始试玩",
    playFromHere: "从这里开始试玩",
    livePreview: "{{title}} 实时预览",
    fixing: "正在修复错误",
    loadingPreview: "正在加载预览…",
    tool: {
      play: "试玩",
      playTitle: "试玩预览",
      select: "选择",
      selectTitle: "选择要和 AI 讨论的内容。按住 Shift 点击可多选。",
      text: "文本",
      textTitle: "点击文本即可修改",
      move: "移动",
      moveTitle: "拖动内容即可移动",
      draw: "画笔",
      drawTitle: "在预览上画出来，告诉 AI 你的意思"
    },
    hint: {
      select: "点击选择 · Shift 点击多选 · Esc 返回试玩",
      text: "点击文本修改 · Enter 保留 · Esc 返回试玩",
      move: "拖动以移动 · Esc 返回试玩",
      draw: "画好后，在聊天中说明你的想法 · Esc 返回试玩"
    },
    tools: "预览工具",
    undoStrokeTitle: "撤销上一笔",
    undoStroke: "撤销笔画",
    clearDrawingTitle: "清除画面",
    clearDrawing: "清除画面",
    drawing: "绘制中",
    notMedia: "{{name}} 不是图片或视频",
    uploadFailed: "无法上传：{{error}}",
    chooseBackground: "选择背景",
    addToChat: "添加到聊天",
    libraryFailed: "无法打开素材库：{{error}}",
    addMedia: "添加图片或视频",
    media: "媒体",
    showBehind: "显示在这个场景的背后",
    noBackdrop: "这个场景没有可设置的背景，请改为添加到聊天",
    asBackground: "设为背景",
    takeOff: "移除这个场景的背景",
    removeBackground: "移除背景",
    happened: "预览中发生的事",
    moreErrors: "（另有 {{count}} 个）",
    fixTitle: "让 AI 修复",
    fix: "修复",
    open: "打开",
    nowhereBack: "没有可返回的地方",
    opensNothing: "还没有连接到任何内容",
    wouldBack: "将返回到 {{title}}",
    wouldRestart: "将从 {{title}} 重新开始",
    wouldContinue: "将在 {{title}} 继续",
    wouldOpen: "将打开 {{title}}",
    noScenes: "这个项目还没有场景。",
    timeline: {
      label: "背景视频",
      backgroundVideo: "背景视频",
      play: "播放视频",
      pause: "暂停视频",
      position: "视频位置",
      mark: "标记",
      markTitle: "把这一刻放进对话，说说这里应该发生什么"
    }
  },
  videoTrim: {
    unavailable: "无法播放此视频，请尝试支持的 MP4 或 WebM 文件。",
    play: "播放",
    pause: "暂停",
    position: "视频位置",
    start: "保留部分的起点",
    end: "保留部分的终点",
    hint: "拖动两端的把手，保留视频的一部分",
    kept: "保留 {{start}}–{{end}} · {{length}} 秒",
    reset: "还原",
    save: "保存为新视频",
    saveTitle: "把保留的部分保存为一个新视频，原视频不变",
    saving: "正在保存剪辑后的视频",
    savingPercent: "正在剪辑… {{percent}}%",
    failed: "无法剪辑视频：{{error}}",
    fileName: "{{name}}（剪辑）",
    saved: "已保存 {{name}}"
  },
  assets: {
    origin: {
      generated: "生成的",
      uploaded: "上传的",
      workspace: "项目文件",
      builtin: "内置",
      unknown: "来源未知"
    },
    filter: {
      all: "全部素材",
      image: "图片",
      video: "视频",
      audio: "音频",
      model: "3D 模型"
    },
    mediaTypes: "媒体类型",
    search: "搜索素材",
    actions: "{{name}} 的素材操作",
    video: "视频",
    loading: "正在加载素材",
    type: "类型",
    size: "大小",
    source: "来源",
    use: "用途",
    reference: "参考图",
    projects: "项目",
    project: "项目",
    path: "路径",
    openProject: "打开项目",
    showInCode: "在代码中显示",
    mediaType: {
      image: "图片",
      video: "视频",
      audio: "音频",
      model: "3D 模型"
    },
    fileMissing: "文件缺失：{{path}}",
    fileUnavailable: "文件不可用：{{path}}",
    closePreview: "关闭素材预览",
    trimmedFrom: "剪辑自"
  },
  storyEditor: {
    upgradeOffer: "这个故事还在旧的沙箱里运行。升级后它会作为独立的网页运行，从存档到音乐，AI 都能直接修改。",
    upgradeDetail: "升级会添加 index.html 和 story/ 下的故事运行时，把用到的资源库素材复制进项目，并改写浏览器无法直接加载的导入。升级可以撤销。",
    upgrade: "升级",
    upgraded: "这个故事现在作为独立的网页运行。",
    libraryMedia: "这个故事仍在使用资源库里的素材，发布后的网页无法访问它们：{{assets}}。请把它们复制进项目，或者替换掉。",
    copyLibraryMedia: "复制进项目",
    undoUpgrade: "撤销升级",
    projectChanged: "编辑期间项目发生了变化，已加载最新版本。请重新做一次最后的修改。",
    keepsChanging: "项目一直在变化，请稍后再试。",
    saveFailed: "无法保存你的修改：{{error}}",
    stillLoading: "游戏仍在加载，准备好后再试着发布。",
    tab: {
      story: "故事"
    },
    workspace: "互动故事工作区",
    openingPlaytest: "正在打开试玩…",
    playtestWindow: "在新窗口中试玩",
    playtest: "试玩",
    loadingScenes: "正在加载场景…",
    noCompile: "项目无法编译",
    code: "互动故事代码"
  },
  storyMenu: {
    addScene: "添加场景",
    addAScene: "添加一个场景",
    sceneActions: "场景操作",
    copyScene: "复制场景",
    startScene: "起始场景",
    setStart: "设为起始场景",
    onMapTitle: "玩家会在故事地图上看到这个场景。菜单等不属于故事步骤的场景可以关闭它。",
    onMap: "显示在故事地图",
    endingTitle: "故事地图会把这个场景算作一个结局",
    ending: "结局",
    templateHint: "选一个起点，然后在聊天中描述这个场景。"
  },
  nodeWorkbench: {
    breadcrumb: "面包屑导航",
    story: "故事",
    title: "标题",
    closePicker: "关闭素材库选择器",
    searchLibrary: "搜索素材库",
    noMatch: "没有符合搜索条件的素材",
    empty: "素材库中没有素材",
    projectCount: "{{count}} 个项目",
    uploadTypes: "请上传 PNG、JPEG、WebP、MP4、MOV、WebM、MP3 或 WAV 文件。"
  },
  playtest: {
    actions: "试玩操作",
    replay: "重新开始试玩",
    popupBlocked: "请允许弹出窗口以打开试玩。",
    forgetTitle: "清除故事地图中已探索的场景和路径，保留游戏存档",
    forget: "清除已看过的场景",
    replayTitle: "从本次试玩的起始场景开始一局新游戏；常规试玩会清除已有存档",
    addedToChat: "已添加到编辑器的聊天中",
    broke: "出了问题",
    askFix: "让 AI 修复",
    loading: "正在加载试玩…"
  },
  sceneCard: {
    startTitle: "玩家从这里开始",
    start: "起始",
    endingTitle: "在故事地图上算作结局",
    staleTitle: "截图之后场景已有改动。",
    stale: "已过期",
    openEditor: "打开场景编辑器",
    noExits: "还没有出口",
    unconnected: "“{{name}}”还没有连接到任何地方。从这里拖到一个场景。",
    taken: "触发条件：{{when}}",
    goesTo: "“{{name}}”通往 {{target}}",
    title: "场景标题",
    scene: "场景",
    back: "↩ 返回"
  },
  chipSelect: {
    select: "选择",
    search: "搜索{{label}}",
    noMatches: "没有匹配项",
    nothing: "没有可选项"
  },
  editorCanvas: {
    select: "选择",
    pan: "平移画布",
    fit: "适应视图",
    zoomOut: "缩小",
    resetZoom: "重置缩放",
    zoomIn: "放大"
  },
  modelPreview: {
    contextLost: "3D 预览丢失了图形上下文",
    displayFailed: "无法显示这个 3D 模型",
    viewerFailed: "无法加载 3D 查看器",
    loadingViewer: "正在加载 3D 查看器",
    loadingProgress: "正在加载 3D 模型 {{percent}}%",
    loading: "正在加载 3D 模型",
    clip: "动画片段"
  },
  markdown: {
    openInCode: "在代码中打开 {{path}}",
    code: "代码"
  },
  canvasNode: {
    resetSize: "重置节点大小",
    expandText: "展开文本",
    references: "节点引用",
    recheckDetail: "重新检查 {{name}}：{{error}}",
    recheck: "重新检查 {{name}}",
    detailsFor: "节点详情：{{label}}"
  },
  integration: {
    createTitle: "使用 {{plugin}} 创建项目",
    connectingProject: "正在连接项目…",
    projectName: "项目名称",
    accountOptions: "账号选项",
    connectAndStart: "连接并开始",
    preparingProject: "正在创建项目…",
    plugin: "项目插件",
    noPlugin: "无",
    projectSource: "项目来源",
    newProject: "新建项目",
    existingProject: "已有项目",
    createAndConnect: "创建项目",
    promptNotSent: "初始需求尚未发送。",
    title: "插件接入",
    description: "开发前，先准备本地环境并连接账号。",
    candidate: "继续后，此项目将改用插件的原生预览和发布流程，并关闭 Web 预览和社区发布。之后可在“预览”标签页中断开。",
    disconnect: "断开插件",
    disconnectConfirm: "断开",
    disconnectNotice: "Game Workbench 将不再为此项目使用该插件，并停止正在运行的原生预览。插件的绑定文件会保留在工作目录中。Web 预览会保持关闭，可在项目设置中重新开启。",
    working: "处理中…",
    openAuthorization: "打开授权页面",
    prepare: "准备环境",
    connect: "连接账号",
    reconnect: "重新连接",
    connected: "账号已连接",
    refresh: "刷新状态",
    bound: "已连接项目：{{id}}",
    chooseProject: "请选择已有项目。尚未绑定的本地目录必须为空。",
    loadProjects: "获取项目列表",
    project: "项目",
    selectProject: "选择项目…",
    noProjects: "请先在服务端创建项目，再刷新列表。",
    bind: "连接此目录",
    continue: "继续",
    conflict: "一个工作目录只能使用一个接入插件。请为其他接入创建独立项目。",
    incompatible: "引用的插件需要不同项目类型，请选择兼容的插件。",
    preview: "本地预览",
    externalWindow: "游戏将在独立原生窗口中打开。刷新会重启游戏并重置运行状态。",
    installRuntime: "安装 Runtime",
    start: "启动预览",
    restart: "刷新预览",
    stop: "停止",
    logs: "获取日志",
    account: "本地环境与账号",
    needsSetup: "需要先准备本地环境",
    needsAuth: "需要连接账号",
    unchecked: "尚未检查",
    logsTitle: "运行日志",
    logsHint: "获取日志后，这里会显示 Runtime 的最新输出。",
    noLogs: "暂无日志输出。",
    previewStatus: { missing: "尚未安装 Runtime", stopped: "预览已停止", running: "预览运行中", error: "请先检查预览状态再重试" }
  },
  textComposer: {
    label: "文本生成指令",
    placeholder: "描述你想生成的文本",
    generate: "生成文本"
  }
}, G3 = "ohmygame:language";
function F3() {
  try {
    const t = localStorage.getItem(G3);
    return t === "en" || t === "zh-CN" ? t : "system";
  } catch {
    return "system";
  }
}
function $3(t, a) {
  if (t !== "system") return t;
  const i = a[0]?.toLowerCase() ?? "";
  return i === "zh" || i.startsWith("zh-") ? "zh-CN" : "en";
}
function V3() {
  return typeof navigator > "u" ? [] : navigator.languages ?? [navigator.language];
}
const ds = $3(
  F3(),
  V3()
);
mt.init({
  lng: ds,
  fallbackLng: "en",
  resources: { en: { translation: I3 }, "zh-CN": { translation: q3 } },
  interpolation: { escapeValue: !1 },
  initAsync: !1
});
mt.services.formatter?.add(
  "lowercase",
  (t) => String(t).toLowerCase()
);
typeof document < "u" && (document.documentElement.lang = ds);
const E = mt.t;
function K3(t) {
  const a = t.request.command ?? t.request.path ?? (t.request.paths?.length ? t.request.paths.map((i) => i.path).join(", ") : void 0) ?? (t.request.network ? E("approval.networkAccess") : void 0) ?? t.request.title ?? t.request.tool;
  return t.status === "completed" && t.decision === "allow" ? E("approval.allowed", { subject: a }) : t.status === "completed" && t.decision === "allow-session" ? E("approval.allowedSession", { subject: a }) : t.status === "completed" ? E("approval.denied", { subject: a }) : E("approval.notAnswered", { subject: a });
}
function Rf({ lines: t }) {
  return /* @__PURE__ */ h.jsxs(
    "span",
    {
      className: "change-counts",
      "aria-label": E("checkpoints.lineCounts", { ...t }),
      children: [
        /* @__PURE__ */ h.jsxs("span", { className: "change-count-added", "aria-hidden": "true", children: [
          "+",
          t.added
        ] }),
        /* @__PURE__ */ h.jsxs("span", { className: "change-count-removed", "aria-hidden": "true", children: [
          "-",
          t.removed
        ] })
      ]
    }
  );
}
const Rp = 3, wp = 2e3, Y3 = 2e7;
function X3(t, a) {
  const i = Dp(t), u = Dp(a);
  let o = 0;
  for (; o < i.length && o < u.length && i[o] === u[o]; )
    o += 1;
  let f = i.length, m = u.length;
  for (; f > o && m > o && i[f - 1] === u[m - 1]; )
    f -= 1, m -= 1;
  const p = [];
  let y = 0, g = 0;
  const b = () => {
    p.push({ kind: "same", text: i[y], before: y + 1, after: g + 1 }), y += 1, g += 1;
  }, C = () => {
    p.push({ kind: "removed", text: i[y], before: y + 1 }), y += 1;
  }, O = () => {
    p.push({ kind: "added", text: u[g], after: g + 1 }), g += 1;
  };
  for (; y < o; ) b();
  const U = Z3(
    i.slice(o, f),
    u.slice(o, m)
  );
  for (const q of U ?? [])
    q === "same" ? b() : q === "removed" ? C() : O();
  for (; y < f; ) C();
  for (; g < m; ) O();
  for (; y < i.length; ) b();
  return P3(p);
}
function Dp(t) {
  const a = t.split(/\r?\n/);
  return a.at(-1) === "" && a.pop(), a;
}
function Z3(t, a) {
  const i = t.length, u = a.length;
  if (i === 0 || u === 0 || Math.abs(i - u) > wp) return;
  const o = Math.min(i + u, wp), f = new Int32Array(2 * o + 3), m = [];
  let p = 0;
  for (let y = 0; y <= o; y += 1) {
    for (let g = -y; g <= y; g += 2) {
      const C = g === -y || g !== y && f[o + g - 1] < f[o + g + 1] ? f[o + g + 1] : f[o + g - 1] + 1;
      let O = C, U = O - g;
      for (; O < i && U < u && t[O] === a[U]; )
        O += 1, U += 1;
      if (p += 1 + O - C, p > Y3) return;
      if (f[o + g] = O, O >= i && U >= u)
        return m.push(f.slice(o - y, o + y + 1)), Q3(m, t, a);
    }
    m.push(f.slice(o - y, o + y + 1));
  }
}
function Q3(t, a, i) {
  const u = [];
  let o = a.length, f = i.length;
  for (let m = t.length - 1; m > 0; m -= 1) {
    const p = t[m - 1], y = ($) => p[$ + m - 1], g = o - f, b = g === -m || g !== m && y(g - 1) < y(g + 1), C = b ? g + 1 : g - 1, O = y(C), U = O - C, q = b ? O : O + 1;
    for (; o > q; )
      u.push("same"), o -= 1, f -= 1;
    u.push(b ? "added" : "removed"), o = O, f = U;
  }
  for (; o > 0; )
    u.push("same"), o -= 1;
  return u.reverse();
}
function P3(t) {
  const a = [];
  let i = 0;
  return t.forEach((u, o) => {
    if (u.kind === "same") return;
    const f = Math.max(o - Rp, 0), m = Math.min(o + Rp + 1, t.length), p = a.at(-1);
    p && f <= i ? p.push(...t.slice(i, m)) : a.push(t.slice(f, m)), i = m;
  }), a;
}
const J3 = { same: " ", added: "+", removed: "-" }, T0 = R.memo(function({
  hunks: a
}) {
  return /* @__PURE__ */ h.jsx("div", { className: "turn-change-diff", children: a.map((i, u) => /* @__PURE__ */ h.jsxs(R.Fragment, { children: [
    u > 0 ? /* @__PURE__ */ h.jsx("hr", { className: "turn-change-gap" }) : null,
    i.map((o, f) => /* @__PURE__ */ h.jsxs(
      "div",
      {
        className: `turn-change-line turn-change-line-${o.kind}`,
        children: [
          /* @__PURE__ */ h.jsx("span", { className: "turn-change-line-number", children: o.before }),
          /* @__PURE__ */ h.jsx("span", { className: "turn-change-line-number", children: o.after }),
          /* @__PURE__ */ h.jsx("span", { className: "turn-change-line-sign", children: J3[o.kind] }),
          /* @__PURE__ */ h.jsx("span", { className: "turn-change-line-text", children: o.text })
        ]
      },
      f
    ))
  ] }, u)) });
});
function W3({
  view: t,
  maxLines: a = 2e3,
  unchangedLabel: i
}) {
  const u = !!(t.before?.binary || t.after?.binary), o = !!(t.before?.truncated || t.after?.truncated), f = R.useMemo(
    () => u ? [] : X3(t.before?.content ?? "", t.after?.content ?? ""),
    [t, u]
  ), { hunks: m, clipped: p } = R.useMemo(() => {
    let y = 0;
    return { hunks: f.map((b) => {
      const C = b.slice(0, Math.max(0, a - y));
      return y += b.length, C;
    }).filter((b) => b.length), clipped: y > a };
  }, [f, a]);
  return u ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E("checkpoints.binary") }) : /* @__PURE__ */ h.jsxs(h.Fragment, { children: [
    m.length ? /* @__PURE__ */ h.jsx(T0, { hunks: m }) : /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: !t.before || !t.after ? E("checkpoints.emptyFile") : o ? E("checkpoints.samePart") : i ?? E("checkpoints.sameLines") }),
    (o || p) && m.length ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E(p ? "checkpoints.diffTruncated" : "checkpoints.truncated") }) : null
  ] });
}
const e4 = {
  status: "ready",
  generation: 0,
  recovered: !1
};
let t4 = e4;
function n4() {
  return t4;
}
const a4 = ["general", "web-game", "interactive-story", "asset-canvas", "godot-game", "fairygui", "requirement-check"], l4 = "[game-workbench:todo-nudge] ";
function ms(t) {
  return Array.isArray(t);
}
function wf(t) {
  return I(typeof t, "bigint");
}
function Df(t) {
  return I(typeof t, "boolean");
}
function zf(t) {
  return I(t, null);
}
function pl(t) {
  return Number.isFinite(t);
}
function i4(t) {
  return dn(t) && !ms(t);
}
function dn(t) {
  return I(typeof t, "object") && !zf(t);
}
function na(t) {
  return I(typeof t, "string");
}
function I(t, a) {
  return t === a;
}
function r4(t, a) {
  return t > a;
}
function u4(t, a) {
  return t < a;
}
function s4(t) {
  if (!dn(t))
    return !1;
  const a = globalThis.Object.getPrototypeOf(t);
  return zf(a) ? !1 : I(typeof a.constructor, "function") && !(I(a.constructor, globalThis.Object) || I(a.constructor.name, "Object"));
}
function be(t, a, i) {
  return I(t.length, 0) ? i() : a(t[0], t.slice(1));
}
function _f(t) {
  return I(t, "__proto__") || I(t, "constructor") || I(t, "prototype");
}
function nt(t, a) {
  return _f(a) ? Object.prototype.hasOwnProperty.call(t, a) : a in t;
}
function De(t) {
  return Object.getOwnPropertyNames(t);
}
function o4(t) {
  return Object.getOwnPropertySymbols(t);
}
function E0(t) {
  return Object.values(t);
}
function c4(t) {
  return globalThis.ArrayBuffer.isView(t);
}
function f4(t) {
  return t instanceof globalThis.RegExp;
}
function d4(t) {
  return t instanceof globalThis.Set;
}
function m4(t) {
  return t instanceof globalThis.Map;
}
const h4 = {
  immutableTypes: !1,
  maxErrors: 8,
  maxInstantiationCount: 128,
  useAcceleration: !0,
  exactOptionalPropertyTypes: !1,
  enumerableKind: !1,
  correctiveParse: !1,
  unionPrioritySort: !0
};
function A0() {
  return h4;
}
function Ot(t, a) {
  return { ...t, ...a };
}
function p4(t) {
  return nt(t, "~kind") || nt(t, "~unsafe");
}
function g4(t) {
  const a = {};
  for (const i of De(t)) {
    if (_f(i))
      continue;
    const u = Object.getOwnPropertyDescriptor(t, i);
    u.value = ml(u.value), I(u.enumerable, !0) ? a[i] = u.value : Object.defineProperty(a, i, u);
  }
  return a;
}
function v4(t) {
  const a = {};
  for (const i of De(t))
    _f(i) || (a[i] = ml(t[i]));
  for (const i of o4(t))
    a[i] = ml(t[i]);
  return a;
}
function y4(t) {
  return s4(t) ? t : p4(t) ? g4(t) : v4(t);
}
function b4(t) {
  return t.map((a) => ml(a));
}
function C4(t) {
  return t.slice();
}
function S4(t) {
  return new RegExp(t.source, t.flags);
}
function x4(t) {
  return new Map(ml([...t.entries()]));
}
function T4(t) {
  return new Set(ml([...t.values()]));
}
function ml(t) {
  return c4(t) ? C4(t) : f4(t) ? S4(t) : m4(t) ? x4(t) : d4(t) ? T4(t) : ms(t) ? b4(t) : dn(t) ? y4(t) : t;
}
function j0(t) {
  return ml(t);
}
function E4(t, a) {
  for (const i of Object.keys(a))
    Object.defineProperty(t, i, {
      configurable: !0,
      writable: !0,
      enumerable: !1,
      value: a[i]
    });
  return t;
}
function A4(t, a) {
  return { ...t, ...a };
}
function je(t, a, i = {}) {
  const u = A4(a, i), o = E4(u, t);
  return o;
}
function Sn(t, a) {
  const i = {};
  for (const u of De(t)) {
    if (a.includes(u))
      continue;
    const o = Object.getOwnPropertyDescriptor(t, u);
    o.value = j0(o.value), Object.defineProperty(i, u, o);
  }
  return i;
}
function de(t, a, i) {
  const u = A0(), o = j0(t);
  for (const f of Object.keys(a))
    Object.defineProperty(o, f, {
      configurable: !0,
      writable: !0,
      enumerable: u.enumerableKind,
      value: a[f]
    });
  for (const f of Object.keys(i))
    Object.defineProperty(o, f, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: i[f]
    });
  return o;
}
function Me(t, a) {
  return dn(t) && nt(t, "~kind") && I(t["~kind"], a);
}
function _a(t) {
  return dn(t);
}
function Ye(t, a, i) {
  return je({ "~kind": "Deferred" }, { type: "deferred", action: t, parameters: a, options: i }, {});
}
function ii(t) {
  return Me(t, "Deferred");
}
function j4(t) {
  return de(t, { "~readonly": !0 }, {});
}
function kf(t, a) {
  return de(j4(t), {}, a);
}
function M4(t, a, i, u) {
  const o = Y(t, a, i);
  return kf(o, u);
}
function N4(t) {
  return de(t, { "~optional": !0 }, {});
}
function Uf(t, a) {
  return de(N4(t), {}, a);
}
function O4(t, a, i, u) {
  const o = Y(t, a, i);
  return Uf(o, u);
}
function fn(t, a) {
  return je({ "~kind": "Array" }, { type: "array", items: t }, a);
}
function pn(t) {
  return Me(t, "Array");
}
function M0(t) {
  return Sn(t, ["~kind", "type", "items"]);
}
function Hf(t, a, i = {}) {
  return je({ "~kind": "Constructor" }, { type: "constructor", parameters: t, instanceType: a }, i);
}
function aa(t) {
  return Me(t, "Constructor");
}
function L4(t) {
  return Sn(t, ["~kind", "type", "parameters", "instanceType"]);
}
function Bf(t, a, i = {}) {
  return je({ "~kind": "Function" }, { type: "function", parameters: t, returnType: a }, i);
}
function la(t) {
  return Me(t, "Function");
}
function R4(t) {
  return Sn(t, ["~kind", "type", "parameters", "returnType"]);
}
function zp(t, a) {
  return je({ "~kind": "Ref" }, { $ref: t }, a);
}
function On(t) {
  return Me(t, "Ref");
}
function w4(t, a) {
  return je({ "~kind": "Generic" }, { type: "generic", parameters: t, expression: a });
}
function N0(t) {
  return Me(t, "Generic");
}
function D4(t) {
  return je({ "~kind": "Any" }, {}, t);
}
function mn(t) {
  return Me(t, "Any");
}
const z4 = "(?!)";
function It(t) {
  return je({ "~kind": "Never" }, { not: {} }, t);
}
function Sr(t) {
  return Me(t, "Never");
}
function us(t, a = {}) {
  return Uf(t, a);
}
function qe(t) {
  return us(t);
}
function Ln(t) {
  return _a(t) && nt(t, "~optional");
}
function _4(t) {
  return De(t).filter((a) => !Ln(t[a]));
}
function O0(t) {
  return De(t);
}
function L0(t) {
  return E0(t);
}
function Se(t, a = {}) {
  const i = _4(t), u = i.length > 0 ? { required: i } : {};
  return je({ "~kind": "Object" }, { type: "object", ...u, properties: t }, a);
}
function Mt(t) {
  return Me(t, "Object");
}
function k4(t) {
  return Sn(t, ["~kind", "type", "properties", "required"]);
}
function hs(t) {
  return je({ "~kind": "Unknown" }, {}, t);
}
function Cn(t) {
  return Me(t, "Unknown");
}
function ps(t, a, i) {
  const u = De(t).reduce((o, f) => ({ ...o, [f]: de(t[f], {}, { $id: f }) }), {});
  return je({ "~kind": "Cyclic" }, { $defs: u, $ref: a }, i);
}
function Ba(t) {
  return Me(t, "Cyclic");
}
function U4(t) {
  return de(t, { "~unsafe": null }, {});
}
function H4(t) {
  return i4(t) && nt(t, "~unsafe") && zf(t["~unsafe"]);
}
function hn(t) {
  return Me(t, "Infer");
}
function B4(t, a, i, u = {}) {
  return je({ "~kind": "Dependent" }, { if: t, then: a, else: i }, u);
}
function xn(t) {
  return Me(t, "Dependent");
}
function I4(t) {
  return Sn(t, ["~kind", "if", "then", "else"]);
}
function Ia(t) {
  return Me(t, "Enum");
}
function jr(t, a = {}) {
  return je({ "~kind": "Intersect" }, { allOf: t }, a);
}
function bt(t) {
  return Me(t, "Intersect");
}
function q4(t) {
  return Sn(t, ["~kind", "allOf"]);
}
function Rn() {
  throw new Error("Unreachable");
}
var _p;
(function(t) {
  t[t.Array = 0] = "Array", t[t.BigInt = 1] = "BigInt", t[t.Boolean = 2] = "Boolean", t[t.Date = 3] = "Date", t[t.Constructor = 4] = "Constructor", t[t.Function = 5] = "Function", t[t.Null = 6] = "Null", t[t.Number = 7] = "Number", t[t.Object = 8] = "Object", t[t.RegExp = 9] = "RegExp", t[t.String = 10] = "String", t[t.Symbol = 11] = "Symbol", t[t.TypeArray = 12] = "TypeArray", t[t.Undefined = 13] = "Undefined";
})(_p || (_p = {}));
BigInt("14695981039346656037");
BigInt("1099511628211"), BigInt(
  "18446744073709551616"
  /* 2 ^ 64 */
);
Array.from({ length: 256 }).map((t, a) => BigInt(a));
const R0 = new Float64Array(1);
new DataView(R0.buffer);
new Uint8Array(R0.buffer);
new TextEncoder();
function uf(t) {
  return _a(t) && nt(t, "~immutable");
}
function sf(t, a = {}) {
  return kf(t, a);
}
function of(t) {
  return _a(t) && nt(t, "~readonly");
}
const G4 = "-?(?:0|[1-9][0-9]*)n";
function F4(t) {
  return je({ "~kind": "BigInt" }, { type: "bigint" }, t);
}
function gs(t) {
  return Me(t, "BigInt");
}
function xr(t) {
  return je({ "~kind": "Boolean" }, { type: "boolean" }, t);
}
function Mr(t) {
  return Me(t, "Boolean");
}
const w0 = "-?(?:0|[1-9][0-9]*)";
function If(t) {
  return je({ "~kind": "Integer" }, { type: "integer" }, t);
}
function ci(t) {
  return Me(t, "Integer");
}
class $4 extends Error {
  constructor(a) {
    super("Invalid Literal value"), Object.defineProperty(this, "cause", {
      value: { value: a },
      writable: !1,
      configurable: !1,
      enumerable: !1
    });
  }
}
function V4(t) {
  return wf(t) ? "bigint" : Df(t) ? "boolean" : pl(t) ? "number" : na(t) ? "string" : (() => {
    throw new $4(t);
  })();
}
function ye(t, a) {
  return je({ "~kind": "Literal" }, { type: V4(t), const: t }, a);
}
function K4(t) {
  return wf(t) || Df(t) || pl(t) || na(t);
}
function Y4(t) {
  return ct(t) && pl(t.const);
}
function X4(t) {
  return ct(t) && na(t.const);
}
function ct(t) {
  return Me(t, "Literal");
}
function Z4(t) {
  return je({ "~kind": "Null" }, { type: "null" }, t);
}
function D0(t) {
  return Me(t, "Null");
}
const z0 = "-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?";
function si(t) {
  return je({ "~kind": "Number" }, { type: "number" }, t);
}
function ia(t) {
  return Me(t, "Number");
}
function Q4(t) {
  return je({ "~kind": "Symbol" }, { type: "symbol" }, t);
}
function _0(t) {
  return Me(t, "Symbol");
}
const k0 = ".*";
function Pe(t) {
  return je({ "~kind": "String" }, { type: "string" }, t);
}
function fi(t) {
  return Me(t, "String");
}
function Ie(t, a = {}) {
  return je({ "~kind": "Union" }, { anyOf: t }, a);
}
function Ae(t) {
  return Me(t, "Union");
}
function P4(t) {
  return Sn(t, ["~kind", "anyOf"]);
}
function U0(t) {
  const a = y9(t);
  return I(a.length, 2) ? a[0] : [];
}
function J4(t) {
  return !0;
}
function H0(t) {
  return be(t, (a, i) => W4(a) ? H0(i) : !1, () => !0);
}
function B0(t) {
  return I(t.length, 0) ? !1 : H0(t);
}
function W4(t) {
  return Ae(t) ? B0(t.anyOf) : ct(t) ? J4(t.const) : !1;
}
function I0(t) {
  return B0(t);
}
function q0(t) {
  return je({ "~kind": "TemplateLiteral" }, { type: "string", pattern: t }, {});
}
function G0(t, a, i = []) {
  return be(t, (u, o) => G0(o, a, [...i, `${u}${a}`]), () => i);
}
function e5(t, a) {
  return I(t.length, 0) ? [`${a}`] : G0(t, a);
}
function F0(t, a, i = []) {
  return be(a, (u, o) => F0(t, o, [...i, ...$0(t, u)]), () => i);
}
function $0(t, a) {
  return Ae(a) ? F0(t, a.anyOf) : ct(a) ? e5(t, a.const) : Rn();
}
function V0(t, a) {
  return be(a, (i, u) => V0($0(t, i), u), () => t);
}
function t5(t) {
  return t.map((a) => ye(a));
}
function n5(t) {
  const a = V0([], t), i = t5(a);
  return Ie(i);
}
function a5(t) {
  return I(t.length, 0) ? Rn() : (
    // Literal('') :
    I(t.length, 1) && ct(t[0]) ? t[0] : n5(t)
  );
}
function K0(t) {
  const a = U0(t);
  return I(a.length, 0) ? Pe() : I0(a) ? a5(a) : q0(t);
}
function l5(t) {
  const a = K0(t);
  return Tn(a) ? Pe() : a;
}
function ka(t, a) {
  const i = "object", u = { [t]: a };
  return je({ "~kind": "Record" }, { type: i, patternProperties: u });
}
function i5(t) {
  return ka(bs, t);
}
function r5(t) {
  return Se({ true: t, false: t });
}
function ra(t, a = {}) {
  const [i, u, o] = [t, t.length, !1];
  return je({ "~kind": "Tuple" }, { type: "array", additionalItems: o, items: i, minItems: u }, a);
}
function qt(t) {
  return Me(t, "Tuple");
}
function u5(t) {
  return Sn(t, ["~kind", "type", "items", "minItems", "additionalItems"]);
}
function s5(t) {
  return Sn(t, ["~readonly"]);
}
function Y0(t, a) {
  return de(s5(t), {}, a);
}
function o5(t, a, i, u) {
  const o = Y(t, a, i);
  return Y0(o, u);
}
function c5(t, a = {}) {
  return Y0(t, a);
}
function f5(t) {
  return Sn(t, ["~optional"]);
}
function X0(t, a) {
  return de(f5(t), {}, a);
}
function d5(t, a, i, u) {
  const o = Y(t, a, i);
  return X0(o, u);
}
function Z0(t, a = {}) {
  return X0(t, a);
}
function Q0(t) {
  return t.reduceRight((i, u, o) => ({ [o]: u, ...i }), {});
}
function m5(t) {
  const a = Q0(t.items);
  return Se(a);
}
function kp(t) {
  return Mt(t) || qt(t);
}
function h5(t, a) {
  return of(t) ? !!of(a) : !1;
}
function p5(t, a) {
  return Ln(t) ? !!Ln(a) : !1;
}
function g5(t, a) {
  const i = h5(t, a), u = p5(t, a), o = Gt([t, a]), f = c5(Z0(o));
  return i && u ? sf(us(f)) : i && !u ? sf(f) : !i && u ? us(f) : f;
}
function v5(t, a, i) {
  return i in t ? i in a ? g5(t[i], a[i]) : t[i] : i in a ? a[i] : It();
}
function y5(t, a) {
  return [.../* @__PURE__ */ new Set([...De(t), ...De(a)])].reduce((o, f) => ({ ...o, [f]: v5(t, a, f) }), {});
}
function Up(t) {
  return Mt(t) ? t.properties : qt(t) ? Q0(t.items) : {};
}
function b5(t, a) {
  const i = Up(t), u = Up(a), o = y5(i, u);
  return Se(o);
}
function C5(t, a) {
  const i = Dg(t, a);
  return I(i, Zf) ? t : I(i, wg) || I(i, Xf) ? a : It();
}
function S5(t, a) {
  const i = kp(t), u = kp(a);
  return i && u ? b5(t, a) : i && !u ? t : !i && u ? a : C5(t, a);
}
function x5(t, a) {
  return Sr(t) || mn(t) ? t : Cn(t) || Sr(a) || mn(a) ? a : Cn(a) ? t : S5(t, a);
}
function T5(t, a) {
  return Ae(t) || Ae(a);
}
function E5(t, a) {
  const i = hl(t), u = hl(a);
  return T5(i, u) ? Gt([i, u]) : x5(i, u);
}
function P0(t, a, i = []) {
  return be(a, (u, o) => P0(t, o, [...i, E5(u, t)]), () => I(i.length, 0) ? [t] : i);
}
function J0(t, a, i = []) {
  return be(t, (u, o) => J0(o, a, [...i, ...ss([u], a)]), () => i);
}
function ss(t, a = []) {
  return be(t, (i, u) => Ae(i) ? ss(u, J0(i.anyOf, a)) : ss(u, P0(i, a)), () => a);
}
function A5(t, a) {
  const i = Ua({}, t, a);
  return Wt(i) ? [] : [t];
}
function W0(t, a, i = []) {
  return be(t, (u, o) => W0(o, a, [...i, ...A5(u, a)]), () => i);
}
function eg(t, a) {
  const i = hl(t), u = Ae(i) ? i.anyOf : [i], o = W0(u, a);
  return zn(o);
}
function di(t, a, i) {
  const u = Gt([t, a]), o = eg(i, t);
  return zn([u, o]);
}
function ua(t, a = []) {
  return be(t, (i, u) => ua(u, [...a, ye(i)]), () => zn(a));
}
function Gt(t) {
  const a = ss(t), i = zg(a);
  return zn(i);
}
function sa(t) {
  const a = l5(t);
  return hl(a);
}
function zn(t) {
  const a = zg(t);
  return Nr(a);
}
function hl(t) {
  return xn(t) ? di(t.if, t.then, t.else) : Ia(t) ? ua(t.enum) : bt(t) ? Gt(t.allOf) : Tn(t) ? sa(t.pattern) : Ae(t) ? zn(t.anyOf) : t;
}
function Nr(t) {
  return I(t.length, 1) ? t[0] : I(t.length, 0) ? It() : Ie(t);
}
function j5(t, a) {
  const i = ua(t);
  return ys(i, a);
}
function M5(t, a) {
  return ka(qf, a);
}
function N5(t, a) {
  const i = Gt(t);
  return ys(i, a);
}
function O5(t, a) {
  return na(t) || pl(t) ? Se({ [t]: a }) : I(t, !1) ? Se({ false: a }) : I(t, !0) ? Se({ true: a }) : Se({});
}
function L5(t, a) {
  return ka(ng, a);
}
function R5(t, a) {
  return nt(t, "pattern") && (na(t.pattern) || t.pattern instanceof RegExp) ? ka(t.pattern.toString(), a) : ka(bs, a);
}
function w5(t, a) {
  const i = U0(t);
  return I0(i) ? ys(sa(t), a) : ka(t, a);
}
function D5(t) {
  return Ae(t) ? vs(t.anyOf) : [t];
}
function vs(t, a = []) {
  return be(t, (i, u) => vs(u, [...a, ...D5(i)]), () => a);
}
function z5(t) {
  return t.some((a) => fi(a) || ia(a) || ci(a));
}
function _5(t, a) {
  return I(z5(t), !0) ? ka(bs, a) : void 0;
}
function k5(t, a) {
  return t.reduce((i, u) => ct(u) && (na(u.const) || pl(u.const)) ? { ...i, [u.const]: a } : i, {});
}
function U5(t, a) {
  const i = k5(t, a);
  return Se(i);
}
function H5(t, a) {
  const i = vs(t), u = _5(i, a);
  return _a(u) ? u : U5(i, a);
}
function ys(t, a) {
  return mn(t) ? i5(a) : Mr(t) ? r5(a) : Ia(t) ? j5(t.enum, a) : ci(t) ? M5(t, a) : bt(t) ? N5(t.allOf, a) : ct(t) ? O5(t.const, a) : ia(t) ? L5(t, a) : Ae(t) ? H5(t.anyOf, a) : fi(t) ? R5(t, a) : Tn(t) ? w5(t.pattern, a) : Se({});
}
function tg(t, a, i) {
  return Xe([t]) ? de(ys(t, a), {}, i) : I5(t, a, i);
}
function B5(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return tg(f, m, o);
}
const qf = `^${w0}$`, ng = `^${z0}$`, bs = `^${k0}$`;
function I5(t, a, i = {}) {
  return Ye("Record", [t, a], i);
}
function ag(t, a, i = {}) {
  return tg(t, a, i);
}
function q5(t, a) {
  return ka(t, a);
}
function cf(t) {
  return I(t, bs) ? Pe() : I(t, qf) ? If() : I(t, ng) ? si() : K0(t);
}
function mi(t) {
  return De(t.patternProperties)[0];
}
function lg(t) {
  const a = mi(t);
  return cf(a);
}
function gl(t) {
  return t.patternProperties[mi(t)];
}
function qa(t) {
  return Me(t, "Record");
}
function G5(t) {
  return je({ "~kind": "Rest" }, { type: "rest", items: t }, {});
}
function Gf(t) {
  return Me(t, "Rest");
}
function F5(t) {
  return Me(t, "This");
}
function $5(t) {
  return je({ "~kind": "Undefined" }, { type: "undefined" }, t);
}
function ig(t) {
  return Me(t, "Undefined");
}
function Cs(t) {
  return Me(t, "Void");
}
function V5(t) {
  return F4();
}
function K5(t) {
  return Pe();
}
function Y5(t) {
  return si();
}
function X5(t) {
  return If();
}
function Z5(t) {
  return It();
}
function Q5(t) {
  return ye(t);
}
function P5(t) {
  return Ie(t[1]);
}
function J5(t) {
  return t.length === 3 ? [...t[0], ...t[2]] : t.length === 1 ? [...t[0]] : [];
}
function W5(t) {
  return [t[0], ...t[1]];
}
function e9(t) {
  return t[1];
}
function rg(t) {
  return I(t.length, 2);
}
function ug(t, a, i) {
  return rg(t) ? a(t[0], t[1]) : i();
}
function t9(t, a) {
  return I(a.indexOf(t), 0) ? [t, a.slice(t.length)] : [];
}
function n9(t, a) {
  for (let i = 0; i < t.length; i++) {
    const u = t9(t[i], a);
    if (rg(u))
      return u;
  }
  return [];
}
function ff(t, a) {
  return Array.from({ length: a - t + 1 }, (i, u) => String.fromCharCode(t + u));
}
[
  ...ff(97, 122),
  // Lowercase
  ...ff(65, 90)
  // Uppercase
];
const a9 = "0", l9 = ff(49, 57);
[...l9];
const i9 = " ", sg = `
`, og = "//", cg = "/*", r9 = "*/";
function fg(t) {
  const a = t.indexOf(r9);
  return I(a, -1) ? "" : t.slice(a + 2);
}
function dg(t) {
  const a = t.indexOf(sg);
  return I(a, -1) ? "" : t.slice(a);
}
function u9(t) {
  return t.replace(/^[ \t\r\f\v]+/, "");
}
function df(t) {
  const a = u9(t);
  return a.startsWith(cg) ? df(fg(a.slice(2))) : a.startsWith(og) ? df(dg(a.slice(2))) : a;
}
function mf(t) {
  const a = t.trimStart();
  return a.startsWith(cg) ? mf(fg(a.slice(2))) : a.startsWith(og) ? mf(dg(a.slice(2))) : a;
}
function Jc(t, a) {
  return n9([t], a);
}
function wn(t, a) {
  return I(t, "") ? ["", a] : t.startsWith(sg) ? Jc(t, df(a)) : t.startsWith(i9) ? Jc(t, a) : Jc(t, mf(a));
}
function s9(t) {
  return I(t, "") ? [] : [t.slice(0, 1), t.slice(1)];
}
function mg(t, a) {
  return be(t, (i, u) => a.startsWith(i) ? !0 : mg(u, a), () => !1);
}
function hg(t, a, i = "") {
  return ug(
    s9(a),
    (u, o) => mg(t, a) ? [i, a] : hg(t, o, `${i}${u}`),
    () => []
  );
}
function o9(t, a) {
  return ug(hg(t, a), (i, u) => I(i, "") ? [] : [i, u], () => []);
}
const pe = (t, a, i = () => []) => t.length === 2 ? a(t) : i(), c9 = (t) => pe(wn("-?(?:0|[1-9][0-9]*)n", t), ([a, i]) => [V5(), i]), f9 = (t) => pe(wn(".*", t), ([a, i]) => [K5(), i]), d9 = (t) => pe(wn("-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?", t), ([a, i]) => [Y5(), i]), m9 = (t) => pe(wn("-?(?:0|[1-9][0-9]*)", t), ([a, i]) => [X5(), i]), h9 = (t) => pe(wn("(?!)", t), ([a, i]) => [Z5(), i]), p9 = (t) => pe(o9(["-?(?:0|[1-9][0-9]*)n", ".*", "-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?", "-?(?:0|[1-9][0-9]*)", "(?!)", "(", ")", "$", "|"], t), ([a, i]) => [Q5(a), i]), g9 = (t) => pe(pe(c9(t), ([a, i]) => [a, i], () => pe(f9(t), ([a, i]) => [a, i], () => pe(d9(t), ([a, i]) => [a, i], () => pe(m9(t), ([a, i]) => [a, i], () => pe(h9(t), ([a, i]) => [a, i], () => pe(v9(t), ([a, i]) => [a, i], () => pe(p9(t), ([a, i]) => [a, i], () => []))))))), ([a, i]) => [a, i]), v9 = (t) => pe(pe(wn("(", t), ([a, i]) => pe(Ff(i), ([u, o]) => pe(wn(")", o), ([f, m]) => [[a, u, f], m]))), ([a, i]) => [P5(a), i]), pg = (t) => pe(pe(pe(hf(t), ([a, i]) => pe(wn("|", i), ([u, o]) => pe(pg(o), ([f, m]) => [[a, u, f], m]))), ([a, i]) => [a, i], () => pe(pe(hf(t), ([a, i]) => [[a], i]), ([a, i]) => [a, i], () => pe([[], t], ([a, i]) => [a, i], () => []))), ([a, i]) => [J5(a), i]), hf = (t) => pe(pe(g9(t), ([a, i]) => pe(Ff(i), ([u, o]) => [[a, u], o])), ([a, i]) => [W5(a), i]), Ff = (t) => pe(pe(pg(t), ([a, i]) => [a, i], () => pe(hf(t), ([a, i]) => [a, i], () => [])), ([a, i]) => [a, i]), y9 = (t) => pe(pe(wn("^", t), ([a, i]) => pe(Ff(i), ([u, o]) => pe(wn("$", o), ([f, m]) => [[a, u, f], m]))), ([a, i]) => [e9(a), i]);
function b9(t) {
  return t.join("|");
}
function C9(t) {
  return t.slice(1, t.length - 1);
}
function S9(t, a, i) {
  return Ga(a, `${i}${t}`);
}
function x9(t, a) {
  return Ga(t, `${a}${G4}`);
}
function T9(t, a) {
  return Ga(t, `${a}${w0}`);
}
function E9(t, a) {
  return Ga(t, `${a}${z0}`);
}
function A9(t, a) {
  return Or(Ie([ye("false"), ye("true")]), t, a);
}
function j9(t, a) {
  return Ga(t, `${a}${k0}`);
}
function M9(t, a, i) {
  return Ga(a, `${i}${C9(t)}`);
}
function N9(t, a, i) {
  const u = vg(t, {});
  return Or(u, a, i);
}
function O9(t, a, i) {
  const u = ua(t);
  return Or(u, a, i);
}
function gg(t, a, i, u = []) {
  return be(t, (o, f) => gg(f, a, i, [...u, Or(o, [], "")]), () => Ga(a, `${i}(${b9(u)})`));
}
function Or(t, a, i) {
  return Ia(t) ? O9(t.enum, a, i) : ci(t) ? T9(a, i) : ct(t) ? S9(t.const, a, i) : gs(t) ? x9(a, i) : Mr(t) ? A9(a, i) : ia(t) ? E9(a, i) : fi(t) ? j9(a, i) : Tn(t) ? M9(t.pattern, a, i) : z9(t) ? N9(t.parameters[0], a, i) : Ae(t) ? gg(t.anyOf, a, i) : z4;
}
function Ga(t, a) {
  return be(t, (i, u) => Or(i, u, a), () => a);
}
function L9(t) {
  return `^${Ga(t, "")}$`;
}
function R9(t) {
  const a = L9(t);
  return q0(a);
}
function vg(t, a) {
  return Xe(t) ? de(R9(t), {}, a) : D9(t, a);
}
function w9(t, a, i, u) {
  const o = ea(t, a, i);
  return vg(o, u);
}
function D9(t, a = {}) {
  return Ye("TemplateLiteral", [t], a);
}
function z9(t) {
  return _a(t) && nt(t, "action") && I(t.action, "TemplateLiteral");
}
function Tn(t) {
  return Me(t, "TemplateLiteral");
}
function _9(t) {
  return je({ "~kind": "ExtendsUnion" }, { inferred: t });
}
function yg(t) {
  return dn(t) && nt(t, "~kind") && nt(t, "inferred") && I(t["~kind"], "ExtendsUnion") && dn(t.inferred);
}
function ee(t) {
  return je({ "~kind": "ExtendsTrue" }, { inferred: t });
}
function bg(t) {
  return dn(t) && nt(t, "~kind") && nt(t, "inferred") && I(t["~kind"], "ExtendsTrue") && dn(t.inferred);
}
function Ce() {
  return je({ "~kind": "ExtendsFalse" }, {});
}
function Hp(t) {
  return dn(t) && nt(t, "~kind") && I(t["~kind"], "ExtendsFalse");
}
function Wt(t) {
  return yg(t) || bg(t);
}
function jt(t, a, i) {
  return Wt(t) ? a(t.inferred) : i();
}
function k9(t, a, i, u) {
  return jt(Ve(t, i, u), (o) => ee(Ot(Ot(t, o), { [a]: i })), () => Ce());
}
function U9(t, a) {
  return ee(t);
}
function H9(t, a, i, u, o) {
  return jt(Ve(t, a, i), (f) => jt(Ve(f, a, u), (m) => ee(m), () => Ce()), () => jt(Ve(t, a, o), (f) => ee(f), () => Ce()));
}
function B9(t, a, i) {
  const u = ua(i);
  return Ve(t, a, u);
}
function Cg(t, a, i) {
  return be(i, (u, o) => jt(Ve(t, a, u), (f) => Cg(f, a, o), () => Ce()), () => ee(t));
}
function I9(t, a, i) {
  const u = sa(i);
  return Ve(t, a, u);
}
function Sg(t, a, i) {
  return be(i, (u, o) => jt(Ve(t, a, u), (f) => ee(f), () => Sg(t, a, o)), () => Ce());
}
function ht(t, a, i) {
  return mn(i) ? U9(t) : xn(i) ? H9(t, a, i.if, i.then, i.else) : Ia(i) ? B9(t, a, i.enum) : hn(i) ? k9(t, i.name, a, i.extends) : bt(i) ? Cg(t, a, i.allOf) : Tn(i) ? I9(t, a, i.pattern) : Ae(i) ? Sg(t, a, i.anyOf) : Cn(i) ? ee(t) : Ce();
}
function q9(t, a, i) {
  return hn(i) ? ht(t, a, i) : mn(i) || Cn(i) ? ee(t) : _9(t);
}
function G9(t, a) {
  const i = uf(t), u = uf(a);
  return i && u || !i && u ? !0 : !(i && !u);
}
function F9(t, a, i, u) {
  return pn(u) ? G9(a, u) ? Ve(t, i, u.items) : Ce() : ht(t, a, u);
}
function $9(t, a, i) {
  return gs(i) ? ee(t) : ht(t, a, i);
}
function V9(t, a, i) {
  return Mr(i) ? ee(t) : ht(t, a, i);
}
function K9(t, a, i, u, o) {
  const f = hn(u) ? a : u, m = hn(u) ? u : a, p = Ln(a), y = Ln(u);
  return !p && y ? Ce() : jt(Ve(t, f, m), (g) => $f(g, i, o), () => Ce());
}
function Y9(t, a, i, u) {
  return be(u, (o, f) => K9(t, a, i, o, f), () => Ln(a) ? ee(t) : Ce());
}
function X9(t, a, i) {
  return be(a, (u, o) => Y9(t, u, o, i), () => ee(t));
}
function $f(t, a, i) {
  return X9(t, a, i);
}
function xg(t, a, i) {
  return Cs(i) ? ee(t) : Ve(t, a, i);
}
function Z9(t, a, i, u) {
  return mn(u) || Cn(u) ? ee(t) : aa(u) ? jt($f(t, a, u.parameters), (o) => xg(o, i, u.instanceType), () => Ce()) : Ce();
}
function Q9(t, a, i, u, o) {
  return jt(Ve(t, a, o), () => Ve(t, i, o), () => Ve(t, u, o));
}
function P9(t, a, i) {
  const u = ua(a);
  return Ve(t, u, i);
}
function J9(t, a, i, u) {
  return mn(u) || Cn(u) ? ee(t) : la(u) ? jt($f(t, a, u.parameters), (o) => xg(o, i, u.returnType), () => Ce()) : Ce();
}
function W9(t, a, i) {
  return ci(i) || ia(i) ? ee(t) : ht(t, a, i);
}
function eb(t, a, i) {
  const u = Gt(a);
  return Ve(t, u, i);
}
function Ss(t, a, i) {
  return a === i ? ee(t) : Ce();
}
function tb(t, a, i) {
  return ct(i) ? Ss(t, a, i.const) : gs(i) ? ee(t) : ht(t, ye(a), i);
}
function nb(t, a, i) {
  return ct(i) ? Ss(t, a, i.const) : Mr(i) ? ee(t) : ht(t, ye(a), i);
}
function ab(t, a, i) {
  return ct(i) ? Ss(t, a, i.const) : ia(i) ? ee(t) : ht(t, ye(a), i);
}
function lb(t, a, i) {
  return ct(i) ? Ss(t, a, i.const) : fi(i) ? ee(t) : ht(t, ye(a), i);
}
function ib(t, a, i) {
  return wf(a.const) ? tb(t, a.const, i) : Df(a.const) ? nb(t, a.const, i) : pl(a.const) ? ab(t, a.const, i) : na(a.const) ? lb(t, a.const, i) : Rn();
}
function rb(t, a, i) {
  return hn(i) ? ht(t, a, i) : ee(t);
}
function ub(t, a, i) {
  return D0(i) ? ee(t) : ht(t, a, i);
}
function sb(t, a, i) {
  return ia(i) ? ee(t) : ht(t, a, i);
}
function ob(t, a, i) {
  return Ln(a) ? Ln(i) ? ee(t) : Ce() : ee(t);
}
function cb(t, a, i) {
  return (
    // Right TInfer<TNever> is TExtendsFalse
    hn(i) && Sr(i.extends) ? Ce() : jt(Ve(t, a, i), (u) => ob(u, a, i), () => Ce())
  );
}
function fb(t, a) {
  return t.reduce((i, u) => u in a && Wt(a[u]) ? { ...i, ...a[u].inferred } : Rn(), {});
}
function db(t, a, i) {
  const u = {};
  for (const m of De(i))
    u[m] = m in a ? cb({}, a[m], i[m]) : Ln(i[m]) ? hn(i[m]) ? ee(Ot(t, { [i[m].name]: i[m].extends })) : ee(t) : Ce();
  const o = E0(u).every((m) => Wt(m)), f = o ? fb(De(u), u) : {};
  return o ? ee(f) : Ce();
}
function mb(t, a, i) {
  const u = db(t, a, i);
  return Wt(u) ? ee(Ot(t, u.inferred)) : Ce();
}
function hb(t, a, i) {
  return mb(t, a, i);
}
function pb(t, a) {
  return De(a).reduce((i, u) => ({
    ...i,
    [u]: nt(t, u) ? Ae(i[u]) ? Ie([...i[u].anyOf, a[u]]) : Ie([t[u], a[u]]) : a[u]
  }), t);
}
function Tg(t, a, i, u) {
  return be(a, (o, f) => jt(Ve({}, t[o], i), (m) => Tg(t, f, i, pb(u, m)), () => Ce()), () => ee(u));
}
function gb(t, a, i, u) {
  const o = De(a);
  return Tg(a, o, u, t);
}
function vb(t, a, i) {
  return qa(i) ? gb(t, a, mi(i), gl(i)) : Mt(i) ? hb(t, a, i.properties) : ht(t, Se(a), i);
}
function yb(t, a) {
  return I(De(a).length, 0) ? ee(t) : Ce();
}
function bb(t, a, i, u, o) {
  return Ve(t, i, o);
}
function Cb(t, a, i, u) {
  return qa(u) ? bb(t, cf(a), i, cf(mi(u)), gl(u)) : Mt(u) ? yb(t, u.properties) : mn(u) || Cn(u) ? ee(t) : Ce();
}
function Sb(t, a, i) {
  return fi(i) ? ee(t) : ht(t, a, i);
}
function xb(t, a, i) {
  return _0(i) ? ee(t) : ht(t, a, i);
}
function Tb(t, a, i) {
  const u = sa(a);
  return Ve(t, u, i);
}
function pf(t, a) {
  return je({ "~kind": "Inferrable" }, { name: t, type: a }, {});
}
function Vf(t) {
  return dn(t) && nt(t, "~kind") && nt(t, "name") && nt(t, "type") && I(t["~kind"], "Inferrable") && na(t.name) && dn(t.type);
}
function Eg(t) {
  return Gf(t) ? hn(t.items) ? pn(t.items.extends) ? pf(t.items.name, t.items.extends.items) : Cn(t.items.extends) ? pf(t.items.name, t.items.extends) : void 0 : Rn() : void 0;
}
function Ag(t) {
  return hn(t) ? pf(t.name, t.extends) : void 0;
}
function Kf(t, a, i = []) {
  return be(t, (u, o) => jt(Ve({}, u, a), () => Kf(o, a, [...i, u]), () => {
  }), () => i);
}
function Eb(t, a, i, u) {
  const o = Kf(i, u);
  return ms(o) ? ee(Ot(t, { [a]: ra(o) })) : Ce();
}
function jg(t, a, i, u) {
  const o = Kf(i, u);
  return ms(o) ? ee(Ot(t, { [a]: Ie(o) })) : Ce();
}
function Ab(t) {
  return [...t].reverse();
}
function gf(t, a) {
  return a ? Ab(t) : t;
}
function jb(t) {
  const a = t.length > 0 ? t[0] : void 0, i = _a(a) ? Eg(a) : void 0;
  return _a(i);
}
function Mb(t, a, i, u, o, f) {
  return jt(Ve(t, i, o), (m) => Mg(m, a, u, f), () => Ce());
}
function Nb(t, a, i, u, o) {
  const f = Eg(u);
  return (
    // Rest Inferrable Right Means we delegate to TInferTupleResult to Generate a Result
    Vf(f) ? Eb(t, f.name, gf(i, a), f.type) : be(i, (m, p) => Mb(t, a, m, p, u, o), () => Ce())
  );
}
function Ob(t, a, i, u) {
  return be(u, (o, f) => Nb(t, a, i, o, f), () => I(i.length, 0) ? ee(t) : Ce());
}
function Mg(t, a, i, u) {
  return Ob(t, a, i, u);
}
function Lb(t, a, i) {
  const u = zr(t, Dn([], []), i), o = jb(u);
  return Mg(t, o, gf(a, o), gf(u, o));
}
function Ng(t, a, i) {
  const u = Ag(i);
  return Vf(u) ? jg(t, u.name, a, u.type) : be(a, (o, f) => jt(Ve(t, o, i), (m) => Ng(m, f, i), () => Ce()), () => ee(t));
}
function Rb(t, a, i) {
  const u = zr(t, Dn([], []), a);
  return qt(i) ? Lb(t, u, i.items) : pn(i) ? Ng(t, u, i.items) : ht(t, ra(u), i);
}
function wb(t, a, i) {
  return Cs(i) || ig(i) ? ee(t) : ht(t, a, i);
}
function Og(t, a, i) {
  return be(i, (u, o) => jt(Ve(t, a, u), (f) => ee(f), () => Og(t, a, o)), () => Ce());
}
function vf(t, a, i) {
  return be(a, (u, o) => jt(Og(t, u, i), (f) => vf(f, o, i), () => Ce()), () => ee(t));
}
function Db(t, a, i) {
  const u = Ag(i);
  return Vf(u) ? jg(t, u.name, a, u.type) : Ae(i) ? vf(t, a, i.anyOf) : vf(t, a, [i]);
}
function zb(t, a, i) {
  return hn(i) ? ht(t, a, i) : mn(i) || Cn(i) ? ee(t) : Ce();
}
function _b(t, a, i) {
  return Cs(i) ? ee(t) : ht(t, a, i);
}
function Ve(t, a, i) {
  return mn(a) ? q9(t, a, i) : pn(a) ? F9(t, a, a.items, i) : gs(a) ? $9(t, a, i) : Mr(a) ? V9(t, a, i) : aa(a) ? Z9(t, a.parameters, a.instanceType, i) : xn(a) ? Q9(t, a.if, a.then, a.else, i) : Ia(a) ? P9(t, a.enum, i) : la(a) ? J9(t, a.parameters, a.returnType, i) : ci(a) ? W9(t, a, i) : bt(a) ? eb(t, a.allOf, i) : ct(a) ? ib(t, a, i) : Sr(a) ? rb(t, a, i) : D0(a) ? ub(t, a, i) : ia(a) ? sb(t, a, i) : Mt(a) ? vb(t, a.properties, i) : qa(a) ? Cb(t, mi(a), gl(a), i) : fi(a) ? Sb(t, a, i) : _0(a) ? xb(t, a, i) : Tn(a) ? Tb(t, a.pattern, i) : qt(a) ? Rb(t, a.items, i) : ig(a) ? wb(t, a, i) : Ae(a) ? Db(t, a.anyOf, i) : Cn(a) ? zb(t, a, i) : Cs(a) ? _b(t, a, i) : Ce();
}
function kb(t, a) {
  return Gt([...t, Se(a)]);
}
function Ub(t, a, i) {
  return Xe(t) ? de(kb(t, a), {}, i) : Bb(t, a, i);
}
function Hb(t, a, i, u, o) {
  const f = ea(t, a, i), m = ed(t, a, u);
  return Ub(f, m, o);
}
function Bb(t, a, i = {}) {
  return Ye("Interface", [t, a], i);
}
function Yf(t) {
  return _a(t) && nt(t, "action") && I(t.action, "Interface");
}
function Ib(t, a, i) {
  return t.includes(i) ? !0 : Tr([...t, i], a, a[i]);
}
function Bp(t, a, i) {
  const u = L0(i);
  return ol(t, a, u);
}
function ol(t, a, i) {
  return be(i, (u, o) => Tr(t, a, u) ? !0 : ol(t, a, o), () => !1);
}
function Tr(t, a, i) {
  return On(i) ? Ib(t, a, i.$ref) : pn(i) ? Tr(t, a, i.items) : aa(i) ? ol(t, a, [...i.parameters, i.instanceType]) : la(i) ? ol(t, a, [...i.parameters, i.returnType]) : Yf(i) ? Bp(t, a, i.parameters[1]) : bt(i) ? ol(t, a, i.allOf) : Mt(i) ? Bp(t, a, i.properties) : Ae(i) ? ol(t, a, i.anyOf) : qt(i) ? ol(t, a, i.items) : qa(i) ? Tr(t, a, gl(i)) : !1;
}
function qb(t, a, i) {
  return Tr(t, a, i);
}
function Gb(t, a) {
  return a.reduce((i, u) => qb([u], t, t[u]) ? [...i, u] : i, []);
}
function Fb(t) {
  const a = O0(t);
  return Gb(t, a);
}
function $b(t, a, i) {
  return i.includes(a) ? i : a in t ? Er(t, t[a], [...i, a]) : Rn();
}
function Ip(t, a, i) {
  const u = L0(a);
  return ai(t, u, i);
}
function ai(t, a, i) {
  return a.reduce((u, o) => Er(t, o, u), i);
}
function Er(t, a, i) {
  return On(a) ? $b(t, a.$ref, i) : pn(a) ? Er(t, a.items, i) : aa(a) ? ai(t, [...a.parameters, a.instanceType], i) : la(a) ? ai(t, [...a.parameters, a.returnType], i) : Yf(a) ? Ip(t, a.parameters[1], i) : bt(a) ? ai(t, a.allOf, i) : Mt(a) ? Ip(t, a.properties, i) : Ae(a) ? ai(t, a.anyOf, i) : qt(a) ? ai(t, a.items, i) : qa(a) ? Er(t, gl(a), i) : i;
}
function Vb(t, a, i) {
  return Er(t, i, [a]);
}
function Kb(t) {
  return D4();
}
function Yb(t) {
  return De(t).reduce((a, i) => ({ ...a, [i]: cl(t[i]) }), {});
}
function fr(t) {
  return t.reduce((a, i) => [...a, cl(i)], []);
}
function cl(t) {
  return On(t) ? Kb(t.$ref) : pn(t) ? fn(cl(t.items), M0(t)) : aa(t) ? Hf(fr(t.parameters), cl(t.instanceType)) : la(t) ? Bf(fr(t.parameters), cl(t.returnType)) : bt(t) ? jr(fr(t.allOf)) : Mt(t) ? Se(Yb(t.properties)) : qa(t) ? ag(lg(t), cl(gl(t))) : Ae(t) ? Ie(fr(t.anyOf)) : qt(t) ? ra(fr(t.items)) : t;
}
function Xb(t, a) {
  return a in t ? cl(t[a]) : hs();
}
function Zb(t) {
  return Xb(t.$defs, t.$ref);
}
function Qb(t, a, i) {
  const u = ea(t, Dn([], []), a), o = ed({}, Dn([], []), i);
  return Gt([...u, Se(o)]);
}
function Pb(t, a) {
  return De(t).filter((u) => a.includes(u)).reduce((u, o) => {
    const f = t[o], m = Yf(f) ? Qb(t, f.parameters[0], f.parameters[1]) : f;
    return { ...u, [o]: m };
  }, {});
}
function Jb(t, a, i) {
  const u = Vb(t, a, i), o = Pb(t, u);
  return ps(o, a);
}
function Lg(t, a) {
  return a in t ? On(t[a]) ? Lg(t, t[a].$ref) : t[a] : It();
}
function Lr(t, a) {
  return Lg(t, a);
}
function qp(t) {
  return Ba(t) ? Zb(t) : H4(t) ? hs() : t;
}
function Ua(t, a, i) {
  const u = qp(a), o = qp(i);
  return Ve(t, u, o);
}
const Xf = 0, Rg = 1, Zf = 2, wg = 3;
function Dg(t, a) {
  const i = [Ua({}, t, a), Ua({}, a, t)];
  return Wt(i[0]) && Wt(i[1]) ? Xf : Wt(i[0]) && Hp(i[1]) ? Zf : Hp(i[0]) && Wt(i[1]) ? wg : Rg;
}
function yf(t, a, i = [], u = a) {
  return be(a, (o, f) => {
    const m = Dg(t, o);
    return I(m, Zf) || I(m, Xf) ? u : I(m, Rg) ? yf(t, f, [...i, o], u) : yf(t, f, i, u);
  }, () => [...i, t]);
}
function Wb(t, a, i) {
  const u = hl(t);
  return mn(u) ? [u] : (
    // terminate (always the most broad)
    Cn(u) ? [u] : (
      // terminate (always the most broad)
      Sr(u) ? ns(a, i) : (
        // ignored: never is dropped
        Mt(u) ? ns(a, [...i, u]) : (
          // objects are always considered (too expensive to compare)
          ns(a, yf(u, i))
        )
      )
    )
  );
}
function ns(t, a = []) {
  return be(t, (i, u) => Wb(i, u, a), () => a);
}
function zg(t) {
  const a = ns(t);
  return vs(a);
}
function e6(t, a) {
  return de(hl(t), {}, a);
}
function t6(t, a, i, u) {
  const o = Y(t, a, i);
  return e6(o, u);
}
function hr(t, a = []) {
  return (
    // Conditional
    ii(t) && I(t.action, "Conditional") ? On(t.parameters[0]) ? hr(t.parameters[2], hr(t.parameters[3], [...a, t.parameters[0].$ref])) : hr(t.parameters[2], hr(t.parameters[3], a)) : ii(t) && I(t.action, "Mapped") && ii(t.parameters[1]) && I(t.parameters[1].action, "KeyOf") && On(t.parameters[1].parameters[0]) ? [...a, t.parameters[1].parameters[0].$ref] : a
  );
}
function n6(t, a) {
  return t.reduce((i, u) => [...i, a.includes(u.name)], []);
}
function _g(t, a, i = []) {
  return be(t, (u, o) => be(a, (f, m) => _g(o, m, [...i, [f, u]]), () => i), () => i);
}
function a6(t) {
  return Tn(t) ? sa(t.pattern) : Ia(t) ? ua(t.enum) : t;
}
function l6(t) {
  const a = a6(t);
  return Ae(a) ? [...a.anyOf] : [a];
}
function i6(t, a) {
  return t.reduce((i, u) => [...i, [...u, a]], []);
}
function Gp(t, a) {
  return a.reduce((i, u) => [...i, ...i6(t, u)], []);
}
function Fp(t) {
  return t.reduce((a, i) => I(i[0], !0) ? Gp(a, l6(i[1])) : Gp(a, [i[1]]), [[]]);
}
function r6(t, a, i) {
  const u = hr(i), o = n6(t, u), f = _g(a, o);
  return ii(i) && I(i.action, "Conditional") || ii(i) && I(i.action, "Mapped") ? Fp(f) : [a];
}
function u6() {
  return ["(not-resolvable)", It()];
}
function s6() {
  return ["(not-generic)", It()];
}
function o6(t, a, i) {
  return [t, w4(a, i)];
}
function c6(t, a, i) {
  return a in t ? kg(t, a, t[a]) : u6();
}
function kg(t, a, i, u) {
  return N0(i) ? o6(a, i.parameters, i.expression) : On(i) ? c6(t, i.$ref) : s6();
}
function f6(t, a, i) {
  return kg(t, "(anonymous)", a);
}
function d6(t, a, i) {
  if (hn(a) || Ug(a) || Wt(Ua({}, a, i)))
    return;
  const u = { parameter: t, expect: i, actual: a };
  throw new Error(`Argument for parameter ${t} does not satisfy constraint`, { cause: u });
}
function $p(t, a, i, u, o) {
  const f = Y(t, a, o);
  return d6(i, f, u), Ot(t, { [i]: f });
}
function m6(t, a, i, u, o) {
  const f = Y(t, a, i.extends), m = Y(t, a, i.equals);
  return be(o, (p, y) => bf($p(t, a, i.name, f, p), a, u, y), () => bf($p(t, a, i.name, f, m), a, u, []));
}
function bf(t, a, i, u) {
  return be(i, (o, f) => m6(t, a, o, f, u), () => t);
}
function h6(t, a, i, u) {
  return bf(t, a, i, u);
}
let Cf = 0, Qf = 0;
function p6() {
  if (!u4(Qf, A0().maxInstantiationCount))
    throw Error("Type instantiation is excessively deep and possibly infinite");
}
function g6() {
  p6(), Qf++, Cf++;
}
function v6() {
  Cf--, I(Cf, 0) && (Qf = 0);
}
function y6(t) {
  return r4(t.callstack.length, 0) ? t.callstack[t.callstack.length - 1] : "";
}
function b6(t, a) {
  return I(y6(t), a);
}
function C6(t, a, i, u, o, f) {
  g6();
  try {
    const m = h6(t, a, u, f), p = Y(m, Dn([...a.callstack, i.$ref], a.visited), o);
    return Y(m, Dn([], []), p);
  } finally {
    v6();
  }
}
function S6(t, a, i, u, o, f) {
  return f.reduce((m, p) => {
    const y = C6(t, a, i, u, o, p);
    return [...m, y];
  }, []);
}
function x6(t, a, i, u, o, f) {
  const m = r6(u, f, o), p = S6(t, a, i, u, o, m);
  return I(p.length, 1) ? p[0] : zn(p);
}
function T6(t, a, i, u) {
  const o = ea(t, a, u), f = f6(t, i), m = f[0], p = f[1];
  return N0(p) ? b6(a, m) ? Vp(zp(m), o) : x6(t, a, zp(m), p.parameters, p.expression, o) : Vp(i, o);
}
function Vp(t, a) {
  return je({ "~kind": "Call" }, { type: "call", target: t, arguments: a }, {});
}
function Ug(t) {
  return Me(t, "Call");
}
function E6(t) {
  return Sn(t, ["~immutable"]);
}
function A6(t, a) {
  return de(E6(t), {}, a);
}
function j6(t, a, i, u) {
  const o = Y(t, a, i);
  return A6(o, u);
}
function M6(t, a) {
  return t(a);
}
function N6(t, a) {
  return na(a) ? ye(M6(t, a)) : ye(a);
}
function O6(t, a) {
  const i = sa(a);
  return hi(t, i);
}
function L6(t, a) {
  const i = a.map((u) => hi(t, u));
  return Ie(i);
}
function hi(t, a) {
  return ct(a) ? N6(t, a.const) : Tn(a) ? O6(t, a.pattern) : Ae(a) ? L6(t, a.anyOf) : a;
}
function R6(t, a = {}) {
  return Ye("Capitalize", [t], a);
}
function w6(t, a = {}) {
  return Ye("Lowercase", [t], a);
}
function D6(t, a = {}) {
  return Ye("Uncapitalize", [t], a);
}
function z6(t, a = {}) {
  return Ye("Uppercase", [t], a);
}
const _6 = (t) => t[0].toUpperCase() + t.slice(1), k6 = (t) => t.toLowerCase(), U6 = (t) => t[0].toLowerCase() + t.slice(1), H6 = (t) => t.toUpperCase();
function B6(t, a) {
  return Xe([t]) ? de(hi(_6, t), {}, a) : R6(t, a);
}
function I6(t, a) {
  return Xe([t]) ? de(hi(k6, t), {}, a) : w6(t, a);
}
function q6(t, a) {
  return Xe([t]) ? de(hi(U6, t), {}, a) : D6(t, a);
}
function G6(t, a) {
  return Xe([t]) ? de(hi(H6, t), {}, a) : z6(t, a);
}
function F6(t, a, i, u) {
  const o = Y(t, a, i);
  return B6(o, u);
}
function $6(t, a, i, u) {
  const o = Y(t, a, i);
  return I6(o, u);
}
function V6(t, a, i, u) {
  const o = Y(t, a, i);
  return q6(o, u);
}
function K6(t, a, i, u) {
  const o = Y(t, a, i);
  return G6(o, u);
}
function Y6(t, a, i, u, o = {}) {
  return Ye("Conditional", [t, a, i, u], o);
}
function X6(t, a, i, u, o, f) {
  const m = Ua(t, i, u);
  return yg(m) ? Ie([Y(m.inferred, a, o), Y(t, a, f)]) : bg(m) ? Y(m.inferred, a, o) : Y(t, a, f);
}
function Z6(t, a, i, u, o, f, m) {
  return Xe([i, u]) ? de(X6(t, a, i, u, o, f), {}, m) : Y6(i, u, o, f, m);
}
function Q6(t, a, i, u, o, f, m) {
  const p = Y(t, a, i), y = Y(t, a, u);
  return Z6(t, a, p, y, o, f, m);
}
function P6(t, a = {}) {
  return Ye("ConstructorParameters", [t], a);
}
function J6(t) {
  const a = aa(t) ? t.parameters : [], i = zr({}, Dn([], []), a);
  return ra(i);
}
function W6(t, a) {
  return Xe([t]) ? de(J6(t), {}, a) : P6(t, a);
}
function e8(t, a, i, u) {
  const o = Y(t, a, i);
  return W6(o, u);
}
function t8(t, a, i = {}) {
  return Ye("Exclude", [t, a], i);
}
function Hg(t, a, i) {
  return Xe([t, a]) ? de(eg(t, a), {}, i) : t8(t, a, i);
}
function n8(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return Hg(f, m, o);
}
function a8(t, a, i = {}) {
  return Ye("Extract", [t, a], i);
}
function l8(t, a) {
  const i = Ua({}, t, a);
  return Wt(i) ? [t] : [];
}
function Bg(t, a, i = []) {
  return be(t, (u, o) => Bg(o, a, [...i, ...l8(u, a)]), () => i);
}
function i8(t, a) {
  const i = hl(t), u = Ae(i) ? i.anyOf : [i], o = Bg(u, a);
  return zn(o);
}
function r8(t, a, i) {
  return Xe([t, a]) ? de(i8(t, a), {}, i) : a8(t, a, i);
}
function u8(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return r8(f, m, o);
}
function s8(t, a, i = {}) {
  return Ye("Index", [t, a], i);
}
function o8(t, a) {
  const i = Lr(t, a);
  return vl(i);
}
function c8(t, a, i) {
  const u = di(t, a, i);
  return vl(u);
}
function f8(t, a) {
  const i = De(t).filter((b) => !nt(a, b)), u = De(a).filter((b) => !nt(t, b)), o = De(t).filter((b) => nt(a, b)), f = i.reduce((b, C) => ({ ...b, [C]: t[C] }), {}), m = u.reduce((b, C) => ({ ...b, [C]: a[C] }), {}), p = o.reduce((b, C) => ({ ...b, [C]: Gt([t[C], a[C]]) }), {}), y = Ot(f, m);
  return Ot(y, p);
}
function d8(t) {
  return t.reduce((a, i) => f8(a, vl(i)), {});
}
function m8(t) {
  const a = m5(ra(t));
  return vl(a);
}
function h8(t, a) {
  return De(t).filter((o) => o in a).reduce((o, f) => ({ ...o, [f]: zn([t[f], a[f]]) }), {});
}
function Ig(t, a) {
  return be(t, (i, u) => Ig(u, h8(a, vl(i))), () => a);
}
function p8(t) {
  return be(t, (a, i) => Ig(i, vl(a)), () => Rn());
}
function vl(t) {
  return Ba(t) ? o8(t.$defs, t.$ref) : xn(t) ? c8(t.if, t.then, t.else) : bt(t) ? d8(t.allOf) : Ae(t) ? p8(t.anyOf) : qt(t) ? m8(t.items) : Mt(t) ? t.properties : {};
}
function Pf(t) {
  const a = vl(t);
  return Se(a);
}
const g8 = new RegExp("^(?:0|[1-9][0-9]*)$");
function Jf(t) {
  const a = `${t}`;
  return g8.test(a) ? parseInt(a) : t;
}
function v8(t) {
  return ye(Jf(t));
}
function Kp(t) {
  return t.map((a) => qg(a));
}
function qg(t) {
  return bt(t) ? jr(Kp(t.allOf)) : Ae(t) ? Ie(Kp(t.anyOf)) : ct(t) ? v8(t.const) : t;
}
function y8(t, a) {
  const i = qg(a), u = Ua({}, i, si());
  return (
    // indexer
    Wt(u) ? t : ct(a) && I(a.const, "length") ? si() : It()
  );
}
function b8(t, a) {
  const i = Lr(t, a);
  return yl(i);
}
function C8(t, a, i) {
  const u = di(t, a, i);
  return yl(u);
}
function S8(t) {
  const a = ua(t);
  return yl(a);
}
function x8(t) {
  const a = Gt(t);
  return yl(a);
}
function T8(t) {
  return [`${t}`];
}
function E8(t) {
  const a = sa(t);
  return yl(a);
}
function A8(t) {
  return t.reduce((a, i) => [...a, ...yl(i)], []);
}
function yl(t) {
  return Ba(t) ? b8(t.$defs, t.$ref) : xn(t) ? C8(t.if, t.then, t.else) : Ia(t) ? S8(t.enum) : bt(t) ? x8(t.allOf) : ct(t) ? T8(t.const) : Tn(t) ? E8(t.pattern) : Ae(t) ? A8(t.anyOf) : [];
}
function Wf(t) {
  return yl(t);
}
function dr(t, a) {
  return a.map((i) => vr(t, i));
}
function vr(t, a) {
  return pn(a) ? fn(vr(t, a.items)) : aa(a) ? Hf(dr(t, a.parameters), vr(t, a.instanceType)) : la(a) ? Bf(dr(t, a.parameters), vr(t, a.returnType)) : qt(a) ? ra(dr(t, a.items)) : Ae(a) ? Ie(dr(t, a.anyOf)) : bt(a) ? jr(dr(t, a.allOf)) : F5(a) ? Se(t) : a;
}
function j8(t, a) {
  return vr(t, a);
}
function M8(t, a) {
  const i = a in t ? t[a] : It();
  return j8(t, i);
}
function Gg(t, a) {
  return a.reduce((i, u) => [...i, M8(t, u)], []);
}
function N8(t, a) {
  const i = Wf(a), u = Gg(t, i);
  return zn(u);
}
const O8 = new RegExp(qf);
function L8(t) {
  return t.filter((i) => O8.test(i));
}
function R8(t) {
  const a = O0(t), i = L8(a), u = Gg(t, i);
  return zn(u);
}
function w8(t, a) {
  return ia(a) ? R8(t) : N8(t, a);
}
function D8(t) {
  return ye(Jf(t));
}
function Yp(t) {
  return t.map((a) => Fg(a));
}
function Fg(t) {
  return bt(t) ? jr(Yp(t.allOf)) : Ae(t) ? Ie(Yp(t.anyOf)) : ct(t) ? D8(t.const) : t;
}
function z8(t, a) {
  return t.reduceRight((i, u, o) => {
    const f = Ua({}, ye(o), a);
    return Wt(f) ? [u, ...i] : i;
  }, []);
}
function _8(t, a) {
  const i = Fg(a), u = z8(t, i);
  return Nr(u);
}
function k8(t) {
  return Nr(t);
}
function U8(t, a) {
  return (
    // length (intrinsic)
    ct(a) && I(a.const, "length") ? ye(t.length) : ia(a) || ci(a) ? k8(t) : _8(t, a)
  );
}
function H8(t, a) {
  return pn(t) ? y8(t.items, a) : Mt(t) ? w8(t.properties, a) : qt(t) ? U8(t.items, a) : It();
}
function B8(t) {
  return Ba(t) || xn(t) || bt(t) || Ae(t) ? Pf(t) : t;
}
function I8(t, a, i) {
  return Xe([t, a]) ? de(H8(B8(t), a), {}, i) : s8(t, a, i);
}
function q8(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return I8(f, m, o);
}
function G8(t, a = {}) {
  return Ye("InstanceType", [t], a);
}
function F8(t) {
  return aa(t) ? t.instanceType : It();
}
function $8(t, a) {
  return Xe([t]) ? de(F8(t), {}, a) : G8(t, a);
}
function V8(t, a, i, u = {}) {
  const o = Y(t, a, i);
  return $8(o, u);
}
function K8(t, a = {}) {
  return Ye("KeyOf", [t], a);
}
function Y8() {
  return Ie([si(), Pe(), Q4()]);
}
function X8(t) {
  return si();
}
function Z8(t) {
  return t.reduce((i, u) => K4(u) ? [...i, ye(Jf(u))] : Rn(), []);
}
function Q8(t) {
  const a = De(t), i = Z8(a);
  return Nr(i);
}
function P8(t) {
  return lg(t);
}
function J8(t) {
  const a = t.map((i, u) => ye(u));
  return Nr(a);
}
function W8(t) {
  return mn(t) ? Y8() : pn(t) ? X8(t.items) : Mt(t) ? Q8(t.properties) : qa(t) ? P8(t) : qt(t) ? J8(t.items) : It();
}
function e7(t) {
  return Ba(t) || xn(t) || bt(t) || Ae(t) ? Pf(t) : t;
}
function t7(t, a) {
  return Xe([t]) ? de(W8(e7(t)), {}, a) : K8(t, a);
}
function n7(t, a, i, u) {
  const o = Y(t, a, i);
  return t7(o, u);
}
function a7(t, a, i, u, o = {}) {
  return Ye("Mapped", [t, a, i, u], o);
}
function l7(t) {
  const a = sa(t);
  return xs(a);
}
function i7(t) {
  return t.reduce((a, i) => [...a, ...xs(i)], []);
}
function r7(t) {
  const a = ua(t);
  return xs(a);
}
function u7(t) {
  return pl(t) ? [ye(`${t}`)] : [ye(t)];
}
function xs(t) {
  return Ia(t) ? r7(t.enum) : ct(t) ? u7(t.const) : Tn(t) ? l7(t.pattern) : Ae(t) ? i7(t.anyOf) : [t];
}
function s7(t) {
  return xs(t);
}
function o7(t) {
  return Tn(t) ? sa(t.pattern) : t;
}
function c7(t, a, i, u, o, f) {
  const m = Ot(t, { [i.name]: u }), p = Y(m, a, o), y = o7(p), g = Y(m, a, f);
  return Y4(y) || X4(y) ? { [y.const]: g } : {};
}
function f7(t, a, i, u, o, f) {
  return u.reduce((m, p) => [...m, c7(t, a, i, p, o, f)], []);
}
function d7(t) {
  return t.reduce((a, i) => [...a, Se(i)], []);
}
function m7(t, a, i, u, o, f) {
  const m = s7(u), p = f7(t, a, i, m, o, f), y = d7(p);
  return Gt(y);
}
function h7(t, a, i, u, o, f, m) {
  return Xe([u]) ? de(m7(t, a, i, u, o, f), {}, m) : a7(i, u, o, f, m);
}
function p7(t, a, i, u, o, f, m) {
  const p = Y(t, a, u);
  return h7(t, a, i, p, o, f, m);
}
function g7(t, a, i) {
  const u = Ot(t, a);
  return De(a).filter((f) => i.includes(f)).reduce((f, m) => ({ ...f, [m]: Jb(u, m, a[m]) }), {});
}
function v7(t, a, i) {
  const u = Ot(t, a);
  return De(a).filter((f) => !i.includes(f)).reduce((f, m) => ({ ...f, [m]: Y(u, Dn([], []), a[m]) }), {});
}
function y7(t, a, i) {
  const u = Fb(a), o = g7(t, a, u), f = v7(t, a, u), m = { ...o, ...f };
  return de(m, {}, i);
}
function b7(t, a, i, u) {
  return y7(t, i, u);
}
function C7(t, a = {}) {
  return Ye("NonNullable", [t], a);
}
function S7(t) {
  const a = Ie([Z4(), $5()]);
  return Hg(t, a, {});
}
function x7(t, a) {
  return Xe([t]) ? de(S7(t), {}, a) : C7(t, a);
}
function T7(t, a, i, u) {
  const o = Y(t, a, i);
  return x7(o, u);
}
function E7(t, a, i = {}) {
  return Ye("Omit", [t, a], i);
}
function $g(t) {
  const a = Pf(t);
  return Mt(a) ? a.properties : Rn();
}
function A7(t, a) {
  return De(t).reduce((u, o) => a.includes(o) ? u : { ...u, [o]: t[o] }, {});
}
function j7(t, a) {
  const i = $g(t), u = Wf(a), o = A7(i, u);
  return Se(o);
}
function M7(t, a, i) {
  return Xe([t, a]) ? de(j7(t, a), {}, i) : E7(t, a, i);
}
function N7(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return M7(f, m, o);
}
function O7(t, a = {}) {
  return Ye("Parameters", [t], a);
}
function L7(t) {
  const a = la(t) ? t.parameters : [], i = zr({}, Dn([], []), a);
  return ra(i);
}
function R7(t, a) {
  return Xe([t]) ? de(L7(t), {}, a) : O7(t, a);
}
function w7(t, a, i, u) {
  const o = Y(t, a, i);
  return R7(o, u);
}
function D7(t, a = {}) {
  return Ye("Partial", [t], a);
}
function z7(t, a) {
  const i = Lr(t, a), u = Rr(i);
  return ps(Ot(t, { [a]: u }), a);
}
function _7(t, a, i) {
  const u = di(t, a, i);
  return Rr(u);
}
function k7(t) {
  const a = Gt(t);
  return Rr(a);
}
function U7(t) {
  const a = t.map((i) => Rr(i));
  return Ie(a);
}
function H7(t) {
  const a = De(t).reduce((u, o) => ({ ...u, [o]: us(t[o]) }), {});
  return Se(a);
}
function Rr(t) {
  return Ba(t) ? z7(t.$defs, t.$ref) : xn(t) ? _7(t.if, t.then, t.else) : bt(t) ? k7(t.allOf) : Ae(t) ? U7(t.anyOf) : Mt(t) ? H7(t.properties) : Se({});
}
function B7(t, a) {
  return Xe([t]) ? de(Rr(t), {}, a) : D7(t, a);
}
function I7(t, a, i, u) {
  const o = Y(t, a, i);
  return B7(o, u);
}
function q7(t, a, i = {}) {
  return Ye("Pick", [t, a], i);
}
function G7(t, a) {
  return De(t).reduce((u, o) => a.includes(o) ? Ot(u, { [o]: t[o] }) : u, {});
}
function F7(t, a) {
  const i = $g(t), u = Wf(a), o = G7(i, u);
  return Se(o);
}
function $7(t, a, i) {
  return Xe([t, a]) ? de(F7(t, a), {}, i) : q7(t, a, i);
}
function V7(t, a, i, u, o) {
  const f = Y(t, a, i), m = Y(t, a, u);
  return $7(f, m, o);
}
function K7(t, a = {}) {
  return Ye("ReadonlyObject", [t], a);
}
function Y7(t) {
  return Kg(fn(t));
}
function X7(t, a) {
  const i = Lr(t, a), u = wr(i);
  return ps(Ot(t, { [a]: u }), a);
}
function Z7(t, a, i) {
  const u = di(t, a, i);
  return wr(u);
}
function Q7(t) {
  const a = Gt(t);
  return wr(a);
}
function P7(t) {
  const a = De(t).reduce((u, o) => ({ ...u, [o]: sf(t[o]) }), {});
  return Se(a);
}
function J7(t) {
  return Kg(ra(t));
}
function W7(t) {
  const a = t.map((i) => wr(i));
  return Ie(a);
}
function wr(t) {
  return pn(t) ? Y7(t.items) : Ba(t) ? X7(t.$defs, t.$ref) : xn(t) ? Z7(t.if, t.then, t.else) : bt(t) ? Q7(t.allOf) : Mt(t) ? P7(t.properties) : qt(t) ? J7(t.items) : Ae(t) ? W7(t.anyOf) : t;
}
function eC(t, a) {
  return Xe([t]) ? de(wr(t), {}, a) : K7(t);
}
function tC(t, a, i, u) {
  const o = Y(t, a, i);
  return eC(o, u);
}
function nC(t, a, i, u) {
  return a.visited.includes(u) ? i : u in t ? Y(t, Dn(a.callstack, [...a.visited, u]), t[u]) : i;
}
function aC(t, a) {
  const i = Lr(t, a), u = Dr(i);
  return ps(Ot(t, { [a]: u }), a);
}
function lC(t, a, i) {
  const u = di(t, a, i);
  return Dr(u);
}
function iC(t) {
  const a = Gt(t);
  return Dr(a);
}
function rC(t) {
  const a = t.map((i) => Dr(i));
  return Ie(a);
}
function uC(t) {
  const a = De(t).reduce((u, o) => ({ ...u, [o]: Z0(t[o]) }), {});
  return Se(a);
}
function Dr(t) {
  return Ba(t) ? aC(t.$defs, t.$ref) : xn(t) ? lC(t.if, t.then, t.else) : bt(t) ? iC(t.allOf) : Ae(t) ? rC(t.anyOf) : Mt(t) ? uC(t.properties) : Se({});
}
function sC(t, a = {}) {
  return Ye("Required", [t], a);
}
function oC(t, a) {
  return Xe([t]) ? de(Dr(t), {}, a) : sC(t, a);
}
function cC(t, a, i, u) {
  const o = Y(t, a, i);
  return oC(o, u);
}
function fC(t, a = {}) {
  return Ye("ReturnType", [t], a);
}
function dC(t) {
  return la(t) ? t.returnType : It();
}
function mC(t, a) {
  return Xe([t]) ? de(dC(t), {}, a) : fC(t, a);
}
function hC(t, a, i, u = {}) {
  const o = Y(t, a, i);
  return mC(o, u);
}
function pC(t, a) {
  return Ye("With", [t, a], {});
}
function gC(t, a) {
  return Xe([t]) ? de(t, {}, a) : pC(t, a);
}
function vC(t, a, i, u) {
  const o = Y(t, a, i);
  return gC(o, u);
}
function yC(t) {
  return Gf(t) ? qt(t.items) ? Vg(t.items.items) : hn(t.items) ? [t] : On(t.items) ? [t] : [It()] : [t];
}
function Vg(t) {
  return t.reduce((i, u) => [...i, ...yC(u)], []);
}
function Dn(t, a) {
  return { callstack: t, visited: a };
}
function Xe(t) {
  return be(t, (a, i) => On(a) ? !1 : Xe(i), () => !0);
}
function ed(t, a, i) {
  return De(i).reduce((u, o) => ({ ...u, [o]: Y(t, a, i[o]) }), {});
}
function zr(t, a, i) {
  const u = ea(t, a, i);
  return Vg(u);
}
function ea(t, a, i) {
  return i.map((u) => Y(t, a, u));
}
function bC(t, a) {
  const i = Ln(t) ? Uf(a, {}) : a, u = of(t) ? kf(i, {}) : i;
  return uf(t) ? td(u, {}) : u;
}
function CC(t, a, i, u, o) {
  return (
    // Modifiers
    I(i, "AddImmutable") ? TC(t, a, u[0], o) : I(i, "RemoveImmutable") ? j6(t, a, u[0], o) : I(i, "AddReadonly") ? M4(t, a, u[0], o) : I(i, "RemoveReadonly") ? o5(t, a, u[0], o) : I(i, "AddOptional") ? O4(t, a, u[0], o) : I(i, "RemoveOptional") ? d5(t, a, u[0], o) : (
      // Actions
      I(i, "Capitalize") ? F6(t, a, u[0], o) : I(i, "Conditional") ? Q6(t, a, u[0], u[1], u[2], u[3], o) : I(i, "ConstructorParameters") ? e8(t, a, u[0], o) : I(i, "Evaluate") ? t6(t, a, u[0], o) : I(i, "Exclude") ? n8(t, a, u[0], u[1], o) : I(i, "Extract") ? u8(t, a, u[0], u[1], o) : I(i, "Index") ? q8(t, a, u[0], u[1], o) : I(i, "InstanceType") ? V8(t, a, u[0], o) : I(i, "Interface") ? Hb(t, a, u[0], u[1], o) : I(i, "KeyOf") ? n7(t, a, u[0], o) : I(i, "Lowercase") ? $6(t, a, u[0], o) : I(i, "Mapped") ? p7(t, a, u[0], u[1], u[2], u[3], o) : I(i, "Module") ? b7(t, a, u[0], o) : I(i, "NonNullable") ? T7(t, a, u[0], o) : I(i, "Pick") ? V7(t, a, u[0], u[1], o) : I(i, "Parameters") ? w7(t, a, u[0], o) : I(i, "Partial") ? I7(t, a, u[0], o) : I(i, "Omit") ? N7(t, a, u[0], u[1], o) : I(i, "ReadonlyObject") ? tC(t, a, u[0], o) : I(i, "Record") ? B5(t, a, u[0], u[1], o) : I(i, "Required") ? cC(t, a, u[0], o) : I(i, "ReturnType") ? hC(t, a, u[0], o) : I(i, "TemplateLiteral") ? w9(t, a, u[0], o) : I(i, "Uncapitalize") ? V6(t, a, u[0], o) : I(i, "Uppercase") ? K6(t, a, u[0], o) : I(i, "With") ? vC(t, a, u[0], u[1]) : Ye(i, u, o)
    )
  );
}
function SC(t, a, i) {
  const u = On(i) ? nC(t, a, i, i.$ref) : pn(i) ? fn(Y(t, a, i.items), M0(i)) : Ug(i) ? T6(t, a, i.target, i.arguments) : aa(i) ? Hf(ea(t, a, i.parameters), Y(t, a, i.instanceType), L4(i)) : la(i) ? Bf(ea(t, a, i.parameters), Y(t, a, i.returnType), R4(i)) : xn(i) ? B4(Y(t, a, i.if), Y(t, a, i.then), Y(t, a, i.else), I4(i)) : bt(i) ? jr(ea(t, a, i.allOf), q4(i)) : Mt(i) ? Se(ed(t, a, i.properties), k4(i)) : qa(i) ? q5(mi(i), Y(t, a, gl(i))) : Gf(i) ? G5(Y(t, a, i.items)) : qt(i) ? ra(zr(t, a, i.items), u5(i)) : Ae(i) ? Ie(ea(t, a, i.anyOf), P4(i)) : i;
  return bC(i, u);
}
function Y(t, a, i) {
  return ii(i) ? CC(t, a, i.action, i.parameters, i.options) : SC(t, a, i);
}
function xC(t) {
  return de(t, { "~immutable": !0 }, {});
}
function td(t, a) {
  return de(xC(t), {}, a);
}
function TC(t, a, i, u) {
  const o = Y(t, a, i);
  return td(o, u);
}
function Kg(t, a = {}) {
  return td(t, a);
}
const EC = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], AC = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
function jC(t) {
  return t % 4 === 0 && (t % 100 !== 0 || t % 400 === 0);
}
function Yg(t) {
  const a = AC.exec(t);
  if (!a)
    return !1;
  const i = +a[1], u = +a[2], o = +a[3];
  return u >= 1 && u <= 12 && o >= 1 && o <= (u === 2 && jC(i) ? 29 : EC[u]);
}
const MC = /^(\d\d):(\d\d):(\d\d)(?:\.\d+)?(?:([Zz])|([+-])(\d\d):(\d\d))?$/;
function Xg(t, a = !0) {
  const i = MC.exec(t);
  if (!i || a && !i[4] && !i[5])
    return !1;
  const u = +i[1], o = +i[2], f = +i[3];
  if (u > 23 || o > 59 || f > 60)
    return !1;
  if (i[5]) {
    const b = +i[6], C = +i[7];
    if (b > 23 || C > 59)
      return !1;
  }
  if (f < 60)
    return !0;
  const m = i[5] === "-" ? -1 : 1, p = +(i[6] || 0), y = +(i[7] || 0);
  return ((u * 60 + o - m * (p * 60 + y)) % 1440 + 1440) % 1440 === 1439;
}
function NC(t) {
  const a = t.split(/T/i);
  return a.length === 2 && Yg(a[0]) && Xg(a[1]);
}
const OC = /^P((\d+Y(\d+M(\d+D)?)?|\d+M(\d+D)?|\d+D)(T(\d+H(\d+M(\d+S)?)?|\d+M(\d+S)?|\d+S))?|T(\d+H(\d+M(\d+S)?)?|\d+M(\d+S)?|\d+S)|\d+W)$/;
function LC(t) {
  return OC.test(t);
}
const RC = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[^"\\]|\\[\x20-\x7e])*")@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*|\[(?:IPv6:[a-f0-9:]+|(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3})\])$/i;
function wC(t) {
  return RC.test(t);
}
const DC = /^(?!-).*(?<!-)$/, zC = /^(?!..--)/, _C = /^[a-zA-Z0-9-]*$/, nd = /[^\p{ASCII}]/u, kC = /[0-9]/, UC = /[\u{0660}-\u{0669}]/u, HC = /[\u{06f0}-\u{06f9}]/u, BC = /[\u{002e}\u{002c}\u{003a}\u{002f}]/u, IC = /[\u{002d}\u{002b}]/u, Zg = /\p{Mn}/u, qC = /\p{Mc}/u, GC = /[\p{Mn}\p{Mc}\p{Me}]/u, Qg = /\p{L}/u, FC = /\p{Nd}/u, $C = /\p{Script=Greek}/u, Pg = /\p{Script=Hebrew}/u, VC = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u, KC = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Mandaic}]/u, Xp = /[\u{094d}\u{09cd}\u{0a4d}\u{0acd}\u{0b4d}\u{0bcd}\u{0c4d}\u{0ccd}\u{0d3b}\u{0d3c}\u{0d4d}\u{0dca}\u{1b44}\u{1baa}\u{1bab}\u{a9c0}\u{11046}\u{1107f}\u{110b9}\u{11133}\u{11134}\u{111c0}\u{11235}\u{1134d}\u{11442}\u{114c2}\u{115bf}\u{1163f}\u{116b6}\u{11c3f}\u{11d44}\u{11d45}]/u, YC = /[\u{0640}\u{07fa}\u{302e}\u{302f}\u{3031}\u{3032}\u{3033}\u{3034}\u{3035}\u{303b}]/u, XC = /[\u{00b7}\u{0375}\u{05f3}\u{05f4}\u{200c}\u{200d}\u{30fb}]/u, ZC = /[\u{00df}\u{03c2}\u{06fd}\u{06fe}\u{0f0b}\u{3007}]/u, QC = new RegExp([
  kC,
  HC
].map((t) => t.source).join("|"), "u"), PC = new RegExp([
  Qg,
  IC,
  BC,
  FC,
  Zg,
  qC,
  XC,
  ZC
].map((t) => t.source).join("|"), "u");
function JC(t) {
  return DC.test(t) && zC.test(t) && _C.test(t);
}
const bn = 36, yr = 1, Ar = 26, WC = 38, eS = 700, Jg = 72, Wg = 128;
function Wc() {
  throw null;
}
function e2(t) {
  return t.toLowerCase().startsWith("xn--");
}
function t2(t, a, i) {
  t = i ? Math.floor(t / eS) : t >> 1, t += Math.floor(t / a);
  let u = 0;
  for (; t > (bn - yr) * Ar >> 1; )
    t = Math.floor(t / (bn - yr)), u += bn;
  return u + Math.floor((bn - yr + 1) * t / (t + WC));
}
function n2(t) {
  const a = [];
  let i = Wg, u = 0, o = Jg;
  const f = t.lastIndexOf("-");
  if (f > 0)
    for (let p = 0; p < f; p++) {
      const y = t.charCodeAt(p);
      y >= 128 && Wc(), a.push(y);
    }
  let m = f < 0 ? 0 : f + 1;
  for (; m < t.length; ) {
    const p = u;
    let y = 1, g = bn;
    for (; ; ) {
      m >= t.length && Wc();
      const C = t.charCodeAt(m++);
      let O;
      C >= 97 && C <= 122 ? O = C - 97 : C >= 48 && C <= 57 ? O = C - 48 + 26 : Wc(), u += O * y;
      const U = g <= o ? yr : g >= o + Ar ? Ar : g - o;
      if (O < U)
        break;
      y *= bn - U, g += bn;
    }
    const b = a.length + 1;
    o = t2(u - p, b, p === 0), i += Math.floor(u / b), u %= b, a.splice(u, 0, i), u++;
  }
  return String.fromCodePoint(...a);
}
function Zp(t) {
  return t < 26 ? String.fromCharCode(t + 97) : String.fromCharCode(t - 26 + 48);
}
const tS = new RegExp(nd.source, "gu");
function nS(t) {
  const a = t.replace(tS, ""), i = a.length, u = i > 0 ? [a, "-"] : [], o = Array.from(t, (g) => g.codePointAt(0));
  let f = Wg, m = 0, p = Jg, y = i;
  for (; y < o.length; ) {
    let g = 1 / 0;
    for (const b of o)
      b >= f && b < g && (g = b);
    m += (g - f) * (y + 1), f = g;
    for (const b of o)
      if (b < f && m++, b === f) {
        let C = m;
        for (let O = bn; ; O += bn) {
          const U = O <= p ? yr : O >= p + Ar ? Ar : O - p;
          if (C < U)
            break;
          const q = U + (C - U) % (bn - U);
          u.push(Zp(q)), C = Math.floor((C - U) / (bn - U));
        }
        u.push(Zp(C)), p = t2(m, y + 1, y === i), m = 0, y++;
      }
    m++, f++;
  }
  return u.join("");
}
const aS = /^(?:R|AL|AN|EN|ES|CS|ET|ON|BN|NSM)$/, Qp = /^(?:L|EN|ES|CS|ET|ON|BN|NSM)$/, lS = /^(?:R|AL|AN)$/;
function iS(t) {
  if (e2(t))
    try {
      return Sf(n2(t.slice(4).toLowerCase()));
    } catch {
      return !1;
    }
  return Sf(t);
}
function a2(t) {
  const a = String.fromCodePoint(t);
  return QC.test(a) ? "EN" : UC.test(a) ? "AN" : (
    // Pattern.RE_EUROPEAN_SEPARATOR.test(char) ? 'ES' : // (no-spec-coverage)
    // Pattern.RE_COMMON_SEPARATOR.test(char) ? 'CS' : // (no-spec-coverage)
    Zg.test(a) ? "NSM" : Pg.test(a) ? "R" : KC.test(a) ? "AL" : Qg.test(a) ? "L" : "ON"
  );
}
function Sf(t) {
  for (const a of t)
    if (lS.test(a2(a.codePointAt(0))))
      return !0;
  return !1;
}
function l2(t) {
  let a = !1, i = Qp, u = !1, o = !1, f = !0;
  for (const m of t) {
    const p = a2(m.codePointAt(0));
    if (f) {
      if (p !== "L" && p !== "R" && p !== "AL")
        return !1;
      a = p === "R" || p === "AL", i = a ? aS : Qp, f = !1;
    }
    if (!i.test(p))
      return !1;
    p === "EN" ? u = !0 : p === "AN" && (o = !0);
  }
  return !(a && u && o);
}
function rS(t) {
  return nd.test(t) && nS(t).length + 4 > 63;
}
function uS(t) {
  return t[0] === "-" || t[t.length - 1] === "-" ? !0 : t.slice(2).join("").startsWith("--");
}
function i2(t) {
  if (rS(t) || Sf(t) && !l2(t))
    return !1;
  const a = [...t], i = a.map((f) => f.codePointAt(0)), u = i.length;
  if (uS(a) || GC.test(a[0]))
    return !1;
  let o = !1;
  for (let f = 0; f < u; f++) {
    const m = i[f], p = a[f];
    if (YC.test(p) || !PC.test(p))
      return !1;
    VC.test(p) && (o = !0);
    const y = i[f - 1], g = i[f + 1];
    switch (m) {
      case 183:
        if (y !== 108 || g !== 108)
          return !1;
        break;
      // MIDDLE DOT (Catalan)
      case 885:
        if (!g || !$C.test(a[f + 1]))
          return !1;
        break;
      // Greek KERAIA
      case 1523:
      case 1524:
        if (!y || !Pg.test(a[f - 1]))
          return !1;
        break;
      // Hebrew GERESH
      case 8204:
        if (!y || y < 128 && !Xp.test(a[f - 1]))
          return !1;
        break;
      case 8205:
        if (!y || !Xp.test(a[f - 1]))
          return !1;
        break;
    }
  }
  return !(t.includes("・") && !o);
}
function r2(t) {
  if (!e2(t))
    return !1;
  try {
    const a = t.slice(4).toLowerCase();
    if (a.lastIndexOf("-") === 0)
      return !1;
    const i = n2(a);
    return nd.test(i) ? i2(i) : !1;
  } catch {
    return !1;
  }
}
function sS(t) {
  return t.length > 0 && t.length <= 63;
}
function oS(t) {
  return sS(t) && (r2(t) || JC(t));
}
function cS(t) {
  return t.length === 0 || t.length > 253 || t.charCodeAt(t.length - 1) === 46 ? !1 : t.split(".").every((a) => oS(a));
}
function fS(t) {
  return t.length > 0 && t.length <= 63;
}
function dS(t) {
  return fS(t) && (r2(t) || i2(t));
}
function mS(t) {
  return t.replace(/[\uff01-\uff5e]/g, (a) => String.fromCharCode(a.charCodeAt(0) - 65248)).normalize("NFC").replace(/[\u00ad\u034f\u180b-\u180d\u200b\ufe00-\ufe0f\u{e0100}-\u{e01ef}]/gu, "").replace(/[\u002E\u3002\uFF0E\uFF61]/g, ".");
}
function hS(t) {
  if (t.length === 0 || t.includes(" "))
    return !1;
  const a = mS(t);
  if (a.length > 253)
    return !1;
  const i = a.split("."), u = i.some((o) => iS(o));
  return i.every((o) => dS(o) && (!u || l2(o)));
}
function pS(t) {
  return cS(t);
}
const gS = /^(?:[A-Za-z0-9!#$%&'*+\/=?^_`{|}~\u{0080}-\u{10FFFF}-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~\u{0080}-\u{10FFFF}-]+)*|"(?:[^"\\]|\\.)*")@[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,62})(?<!-)(?:\.[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,62})(?<!-))*$/iu;
function vS(t) {
  return gS.test(t.normalize("NFC"));
}
function yS(t) {
  return hS(t);
}
const bS = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
function CS(t) {
  return bS.test(t);
}
const SS = /^(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:)?[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)$/i;
function xS(t) {
  return SS.test(t);
}
const TS = /[\x00-\x20\x7F\\]|%(?![0-9a-fA-F]{2})/, ES = /^[a-zA-Z][a-zA-Z0-9+\-.]*\/\//;
function AS(t) {
  return !TS.test(t) && !ES.test(t) && URL.canParse(t, "http://example.com");
}
const jS = 2048, MS = /\[[vV][0-9a-fA-F]+\.[^\]]+\]/, NS = /[\x00-\x20<>\^`{|}\\]/, OS = /%(?![0-9a-fA-F]{2})/;
function LS(t) {
  return t.length < jS ? t.replace(MS, "[::1]") : t;
}
function RS(t) {
  return NS.test(t) || OS.test(t) ? !1 : URL.canParse(LS(t));
}
const wS = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
function DS(t) {
  return wS.test(t);
}
const zS = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
function _S(t) {
  return zS.test(t);
}
function kS(t) {
  try {
    return new RegExp(t, "u"), !0;
  } catch {
    return !1;
  }
}
const US = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
function HS(t) {
  return US.test(t);
}
const BS = /^(?:[a-z][a-z0-9+\-.]*:(?:\/\/(?:(?:[-a-z0-9._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:[\da-f]{1,4}:){6}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|::(?:[\da-f]{1,4}:){5}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:[\da-f]{1,4})?::(?:[\da-f]{1,4}:){4}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,1}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){3}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,2}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){2}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,3}[\da-f]{1,4})?::[\da-f]{1,4}:(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,4}[\da-f]{1,4})?::(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,5}[\da-f]{1,4})?::[\da-f]{1,4}|(?:(?:[\da-f]{1,4}:){0,6}[\da-f]{1,4})?::)|v[0-9a-f]+\.[-a-z0-9._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[-a-z0-9._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:\/\/(?:(?:[-a-z0-9._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:[\da-f]{1,4}:){6}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|::(?:[\da-f]{1,4}:){5}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:[\da-f]{1,4})?::(?:[\da-f]{1,4}:){4}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,1}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){3}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,2}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){2}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,3}[\da-f]{1,4})?::[\da-f]{1,4}:(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,4}[\da-f]{1,4})?::(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,5}[\da-f]{1,4})?::[\da-f]{1,4}|(?:(?:[\da-f]{1,4}:){0,6}[\da-f]{1,4})?::)|v[0-9a-f]+\.[-a-z0-9._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[-a-z0-9._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[-a-z0-9._~!$&'()*+,;=@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?)(?:\?(?:[-a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[-a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
function IS(t) {
  return BS.test(t);
}
const qS = /^(?:(?:[^\x00-\x20"<>%\\^`{|}\x7f]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?:\.(?:[a-z0-9_]|%[0-9a-f]{2})+)*(?::[1-9]\d{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?:\.(?:[a-z0-9_]|%[0-9a-f]{2})+)*(?::[1-9]\d{0,3}|\*)?)*\})*$/i;
function GS(t) {
  return qS.test(t);
}
const FS = /^[a-z][a-z0-9+\-.]*:(?:\/\/(?:(?:[-a-z0-9._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:[\da-f]{1,4}:){6}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|::(?:[\da-f]{1,4}:){5}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:[\da-f]{1,4})?::(?:[\da-f]{1,4}:){4}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,1}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){3}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,2}[\da-f]{1,4})?::(?:[\da-f]{1,4}:){2}(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,3}[\da-f]{1,4})?::[\da-f]{1,4}:(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,4}[\da-f]{1,4})?::(?:[\da-f]{1,4}:[\da-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d))|(?:(?:[\da-f]{1,4}:){0,5}[\da-f]{1,4})?::[\da-f]{1,4}|(?:(?:[\da-f]{1,4}:){0,6}[\da-f]{1,4})?::)|v[0-9a-f]+\.[-a-z0-9._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[-a-z0-9._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[-a-z0-9._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[-a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[-a-z0-9._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
function $S(t) {
  return FS.test(t);
}
function VS(t) {
  return URL.canParse(t);
}
const KS = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function YS(t) {
  return KS.test(t);
}
const tt = /* @__PURE__ */ new Map();
function XS() {
  tt.clear();
}
function ZS() {
  XS(), tt.set("date-time", NC), tt.set("date", Yg), tt.set("duration", LC), tt.set("email", wC), tt.set("hostname", pS), tt.set("idn-email", vS), tt.set("idn-hostname", yS), tt.set("ipv4", CS), tt.set("ipv6", xS), tt.set("iri-reference", AS), tt.set("iri", RS), tt.set("json-pointer-uri-fragment", DS), tt.set("json-pointer", _S), tt.set("regex", kS), tt.set("relative-json-pointer", HS), tt.set("time", Xg), tt.set("uri-reference", IS), tt.set("uri-template", GS), tt.set("uri", $S), tt.set("url", VS), tt.set("uuid", YS);
}
ZS();
BigInt(Number.MAX_SAFE_INTEGER);
BigInt(Number.MIN_SAFE_INTEGER);
const QS = Se({
  type: ye("insert"),
  path: Pe(),
  value: hs()
}), PS = Object({
  type: ye("update"),
  path: Pe(),
  value: hs()
}), JS = Se({
  type: ye("delete"),
  path: Pe()
});
Ie([QS, PS, JS]);
const WS = [
  { id: "package", label: "Package", keywords: "plugin 插件" },
  { id: "gamepad", label: "Game", keywords: "play 游戏" },
  { id: "globe", label: "Web", keywords: "internet network 网络 网页" },
  { id: "box", label: "3D", keywords: "model world 模型 世界" },
  { id: "image", label: "Image", keywords: "sprite photo 图片 精灵" },
  { id: "palette", label: "Design", keywords: "color art 设计 颜色" },
  { id: "brush", label: "Paint", keywords: "draw texture 绘画 纹理" },
  { id: "music", label: "Music", keywords: "audio sound 音乐 音效" },
  { id: "video", label: "Video", keywords: "movie 视频" },
  { id: "film", label: "Animation", keywords: "cinema 动画" },
  { id: "code", label: "Code", keywords: "program script 代码 脚本" },
  { id: "terminal", label: "Terminal", keywords: "command shell 命令" },
  { id: "plug", label: "Connection", keywords: "mcp service 连接 服务" },
  { id: "server", label: "Server", keywords: "api backend 服务器" },
  { id: "wand", label: "Magic", keywords: "generate automation 生成 自动化" },
  { id: "sparkles", label: "AI", keywords: "assistant 智能 助手" },
  { id: "document", label: "Document", keywords: "text story 文档 故事" },
  { id: "folder", label: "Files", keywords: "assets 文件 资源" },
  { id: "layers", label: "Layers", keywords: "scene level 图层 场景 关卡" },
  { id: "lightbulb", label: "Ideas", keywords: "planning 创意 规划" },
  { id: "search", label: "Search", keywords: "find research 搜索 研究" },
  { id: "wrench", label: "Tools", keywords: "repair utility 工具 修复" },
  { id: "clipboard", label: "Review", keywords: "check qa 检查 评审" },
  { id: "flag", label: "Goals", keywords: "quest task 目标 任务" }
];
function es(t) {
  return `@${t.displayName.replace(/^@/, "")}`;
}
const mr = Pe({
  pattern: "^\\./(?!\\.\\.(?:/|$))(?!.*\\/\\.\\.(?:/|$))[^\\\\]+$",
  minLength: 3
}), Pp = Pe({ pattern: "^[a-z0-9]+(?:[-_.][a-z0-9]+)*$" }), Jp = Pe({
  pattern: "^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$",
  maxLength: 256
}), ex = Ie([
  Se({
    type: ye("preset"),
    id: Ie(WS.map((t) => ye(t.id)))
  }, { additionalProperties: !1 }),
  Se({
    type: ye("asset"),
    path: Pe({ pattern: "^\\./(?!\\.\\.(?:/|$))(?!.*\\/\\.\\.(?:/|$))[^\\\\]+\\.(?:png|webp|svg)$", maxLength: 1e3 })
  }, { additionalProperties: !1 })
]), tx = Se({
  beta: qe(xr()),
  displayName: qe(Pe({ minLength: 1 })),
  shortDescription: qe(Pe({ minLength: 1 })),
  longDescription: qe(Pe({ minLength: 1 })),
  icon: qe(U4(ex)),
  defaultPrompt: qe(fn(Pe({ minLength: 1 }), { minItems: 1 })),
  projectTypes: qe(fn(Ie(a4.map((t) => ye(t))), { minItems: 1, uniqueItems: !0 }))
}, { additionalProperties: !1 }), nx = Se({
  type: Ie([ye("text"), ye("secret"), ye("path"), ye("boolean"), ye("select")]),
  label: Pe({ minLength: 1 }),
  description: qe(Pe()),
  required: qe(xr()),
  default: qe(Ie([Pe(), xr()])),
  options: qe(fn(Pe(), { minItems: 1, uniqueItems: !0 }))
}, { additionalProperties: !1 });
Se({
  enabledByDefault: qe(xr()),
  formatVersion: qe(If({ minimum: 1 })),
  minimumHostVersion: qe(Jp),
  requirements: qe(Se({
    commands: qe(fn(Pe({ pattern: "^[a-zA-Z0-9][a-zA-Z0-9._-]*$", maxLength: 100 }), { maxItems: 30, uniqueItems: !0 })),
    platforms: qe(fn(Ie([ye("darwin"), ye("win32"), ye("linux")]), { minItems: 1, uniqueItems: !0 }))
  }, { additionalProperties: !1 })),
  name: Pe({ pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }),
  version: Jp,
  description: Pe({ minLength: 1 }),
  skills: qe(Ie([mr, fn(mr, { minItems: 1, uniqueItems: !0 })])),
  connections: qe(fn(Pp, { uniqueItems: !0 })),
  mcpServers: qe(mr),
  integration: qe(Se({
    entry: mr,
    createProject: qe(xr()),
    projectFiles: qe(fn(mr, { minItems: 1, maxItems: 20, uniqueItems: !0 })),
    preview: qe(ye("external"))
  }, { additionalProperties: !1 })),
  configuration: qe(ag(Pp, nx)),
  interface: qe(tx)
}, { additionalProperties: !1 });
function ax(t) {
  const a = t.match(/^\$([a-zA-Z0-9][a-zA-Z0-9._-]*)(?:\s+([\s\S]*))?$/);
  return a ? { name: a[1], prompt: a[2] ?? "" } : void 0;
}
function lx(t, a) {
  const i = [...a].sort((u, o) => es(o).length - es(u).length).find((u) => {
    const o = es(u);
    return t === o || t.startsWith(o) && /^\s/.test(t[o.length] ?? "");
  });
  return i ? { prompt: t.slice(es(i).length).trimStart(), mention: i } : { prompt: t };
}
const ix = "ohmygame:composer-draft:v1:";
function rx(t) {
  const a = /* @__PURE__ */ new Map();
  function i(o, f, m = !1) {
    const p = o ? `${Wp(o.projectId)}${encodeURIComponent(o.conversationId)}` : void 0, y = p ? a.get(p) : void 0;
    if (y) return y.session;
    const g = ax(f?.prompt ?? ""), b = lx(g?.prompt ?? f?.prompt ?? "", f?.mentions ?? []), C = sx(t, p);
    let O = {
      prompt: b.prompt,
      mentions: f?.mentions ?? [],
      selectedSkill: g?.name,
      selectedPlugin: b.mention,
      planning: m,
      ...C,
      attachments: [],
      submitting: !1
    };
    const U = /* @__PURE__ */ new Set();
    let q = !0, $ = e0(O);
    const ne = {
      getSnapshot: () => O,
      subscribe: (P) => (U.add(P), () => {
        U.delete(P);
      }),
      update: (P) => {
        if (!q) return;
        const ie = typeof P == "function" ? P(O) : P;
        if (Object.entries(ie).every(([H, le]) => Object.is(O[H], le))) return;
        O = { ...O, ...ie };
        const oe = e0(O);
        oe !== $ && ($ = oe, t0(t, p, oe));
        for (const H of U) H();
      },
      clearSubmitted: (P) => !q || !ux(O, P) ? !1 : (ne.update({
        prompt: "",
        mentions: [],
        selectedSkill: void 0,
        selectedPlugin: void 0,
        attachments: [],
        reference: void 0,
        designReference: void 0,
        focusRequestId: void 0
      }), !0),
      insertPrompt: (P) => {
        ne.update((ie) => ({
          prompt: ie.prompt.trim() ? `${ie.prompt.trimEnd()}
${P}` : P,
          focusRequestId: crypto.randomUUID()
        }));
      }
    };
    return p && (a.set(p, {
      session: ne,
      forget: () => {
        q = !1, O = { prompt: "", mentions: [], attachments: [], planning: !1, submitting: !1 };
        for (const P of U) P();
      }
    }), !C && $ !== null && t0(t, p, $)), ne;
  }
  function u(o) {
    const f = Wp(o);
    for (const [m, p] of a)
      m.startsWith(f) && (p.forget(), a.delete(m));
    try {
      if (!t) return;
      const m = Array.from({ length: t.length }, (p, y) => t.key(y));
      for (const p of m) p?.startsWith(f) && t.removeItem(p);
    } catch {
    }
  }
  return { get: i, deleteProject: u };
}
function Wp(t) {
  return `${ix}${encodeURIComponent(t)}:`;
}
function ux(t, a) {
  return t.prompt === a.prompt && t.mentions === a.mentions && t.selectedSkill === a.selectedSkill && t.selectedPlugin === a.selectedPlugin && t.attachments === a.attachments && t.reference === a.reference && t.designReference === a.designReference;
}
function e0(t) {
  if (!t.prompt && !t.selectedSkill && !t.selectedPlugin && !t.reference && !t.designReference && !t.planning) return null;
  const { prompt: a, mentions: i, selectedSkill: u, selectedPlugin: o, reference: f, designReference: m, planning: p } = t;
  return JSON.stringify({ version: 1, prompt: a, mentions: i, selectedSkill: u, selectedPlugin: o, reference: f, designReference: m, planning: p });
}
function t0(t, a, i) {
  if (!(!t || !a))
    try {
      i === null ? t.removeItem(a) : t.setItem(a, i);
    } catch {
    }
}
function sx(t, a) {
  if (!(!t || !a))
    try {
      const i = JSON.parse(t.getItem(a) ?? "null");
      if (!sl(i) || i.version !== 1 || typeof i.prompt != "string" || !Array.isArray(i.mentions) || typeof i.planning != "boolean") return;
      const u = i.designReference, o = sl(u) ? u.context : void 0;
      return {
        prompt: i.prompt,
        mentions: i.mentions.filter(n0),
        selectedSkill: typeof i.selectedSkill == "string" ? i.selectedSkill : void 0,
        selectedPlugin: n0(i.selectedPlugin) ? i.selectedPlugin : void 0,
        planning: i.planning,
        reference: sl(i.reference) && typeof i.reference.text == "string" ? { text: i.reference.text } : void 0,
        designReference: sl(u) && Array.isArray(u.references) && u.references.every((f) => sl(f) && f.type === "workspace-file" && typeof f.path == "string") && sl(o) && o.kind === "design-document" && typeof o.label == "string" && typeof o.text == "string" ? { references: u.references, context: { kind: o.kind, label: o.label, text: o.text } } : void 0
      };
    } catch {
    }
}
function sl(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function n0(t) {
  return sl(t) && typeof t.name == "string" && typeof t.displayName == "string" && typeof t.marketplaceId == "string";
}
function ox() {
  try {
    return globalThis.localStorage;
  } catch {
    return;
  }
}
rx(ox());
const cx = "/api";
async function fx(t, a) {
  if (!/^\/projects\/[^/]+\/conversation-images\/[a-f0-9]{64}\.(png|jpg|webp|gif)$/.test(t))
    throw new Error("Invalid conversation image reference");
  const i = await fetch(hx(t), { headers: px(), signal: a });
  if (!i.ok) throw await mx(i);
  return i.blob();
}
class dx extends Error {
  constructor(a, i, u, o, f) {
    super(a), this.status = i, this.code = u, this.conflicts = o, this.blocked = f;
  }
  status;
  code;
  conflicts;
  blocked;
}
async function mx(t) {
  const a = await t.json().catch(() => ({})), i = Array.isArray(a.conflicts) && a.conflicts.every((u) => typeof u == "string") ? a.conflicts : void 0;
  return new dx(a.message ?? a.error ?? E("api.requestFailed", { status: t.status }), t.status, a.code, i, a.blocked === !0 || void 0);
}
function hx(t) {
  const a = u2();
  return a ? `${a.daemonUrl}${t}` : `${cx}${t}`;
}
function px() {
  const t = u2();
  return t ? { authorization: `Bearer ${t.token}` } : {};
}
function u2() {
  const t = window.ohMyGameDesktop;
  if (!t) return;
  const a = n4();
  return a.runtime ? { daemonUrl: a.runtime.url, token: a.runtime.token } : t.runtime;
}
function gx(t) {
  return null;
}
function vx() {
  const t = R.useRef(null), [a, i] = R.useState(!1);
  return R.useEffect(() => {
    const u = t.current;
    if (!u || typeof IntersectionObserver > "u") {
      i(!0);
      return;
    }
    const o = new IntersectionObserver(([f]) => {
      f?.isIntersecting && (i(!0), o.disconnect());
    }, { rootMargin: "160px" });
    return o.observe(u), () => o.disconnect();
  }, []), [t, a];
}
function yx(t) {
  return `data:${t.mediaType};base64,${t.data}`;
}
function ad({ image: t, alt: a }) {
  const [i, u] = vx(), [o, f] = R.useState();
  return R.useEffect(() => {
    if (!u || !t.url) return;
    const m = new AbortController();
    let p;
    return f(void 0), fx(t.url, m.signal).then((y) => {
      m.signal.aborted || (p = URL.createObjectURL(y), f(p));
    }).catch(() => {
    }), () => {
      m.abort(), p && URL.revokeObjectURL(p);
    };
  }, [t.url, u]), /* @__PURE__ */ h.jsx("img", { ref: i, src: t.url ? o : yx(t), alt: a, loading: "lazy" });
}
const bx = "ohmygame-godot", s2 = {
  [bx]: { name: "Godot", brand: "godot" }
}, a0 = {
  godot: "Godot",
  id: "ID",
  mcp: "MCP",
  uid: "UID",
  url: "URL"
};
function o2(t) {
  return `${c2(t.server)}: ${f2(t.tool)}`;
}
function ld(t) {
  return t.server ? s2[t.server]?.brand : void 0;
}
function c2(t) {
  return t ? s2[t]?.name ?? f2(t) : "MCP";
}
function f2(t) {
  const a = t.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase().split(/\s+/).filter(Boolean);
  return a.length === 0 ? "Tool" : a.map((i, u) => a0[i] ? a0[i] : u === 0 ? i[0].toUpperCase() + i.slice(1) : i).join(" ");
}
function Cx(t) {
  return t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${Math.ceil(t / 1024)} KB` : `${(t / (1024 * 1024)).toFixed(1)} MB`;
}
function l0(t, { waiting: a = !1 } = {}) {
  const i = [];
  let u = [];
  function o() {
    u.length !== 0 && (i.push({ kind: "tool-group", id: u[0].id, tools: u }), u = []);
  }
  for (const f of t) {
    if (f.type === "dynamicToolCall" || f.type === "mcpToolCall") {
      u.push(f);
      continue;
    }
    o(), f.type === "reasoning" ? i.push({ kind: "thinking", item: f }) : i.push({ kind: "item", item: f });
  }
  return o(), a && i.push({ kind: "waiting" }), i;
}
const Sx = {
  search_rules: "规则检索",
  get_rule: "规则查询",
  get_config: "配置查询",
  compare_rules: "玩法对比",
  list_unresolved: "未决项查询",
  read_evidence: "原文取证"
};
function xx(t) {
  return Sx[t] ?? t;
}
function Tx(t) {
  const a = /* @__PURE__ */ new Map();
  for (const f of t.filter((m) => m.status !== "failed")) {
    const m = Ex(f);
    a.set(m, [...a.get(m) ?? [], f]);
  }
  const i = [...a].sort(([f], [m]) => i0(f) - i0(m)).map(([f, m]) => Ax(f, m)), u = t.filter((f) => f.status === "failed").length;
  if (u > 0 && i.push(E(u === 1 ? "timeline.summary.actionFailed" : "timeline.summary.actionsFailed")), i.length === 0) return E("timeline.summary.usedTools");
  const o = i.join(E("timeline.summary.separator"));
  return o[0].toUpperCase() + o.slice(1);
}
function Ex(t) {
  if (t.type === "mcpToolCall") return `mcp:${t.server ?? ""}`;
  const a = t.tool;
  return a === "edit" || a === "write" ? "edit" : a === "read" || a === "grep" || a === "find" || a === "ls" ? "read" : a === "bash" ? "command" : a === "web_search" ? "web-search" : a === "game_use" ? "playtest" : `tool:${a}`;
}
function i0(t) {
  return t === "edit" ? 0 : t === "read" ? 1 : t === "command" ? 2 : 3;
}
function Ax(t, a) {
  if (t === "edit") return jx(a);
  if (t === "read") return a.length === 1 ? E("timeline.summary.readFile") : E("timeline.summary.readFiles");
  if (t === "command") return a.length === 1 ? E("timeline.summary.ranCommand") : E("timeline.summary.ranCommands");
  if (t === "web-search") return a.length === 1 ? E("timeline.summary.searchedWeb") : E("timeline.summary.searchedWebMultiple");
  if (t === "playtest") return E("timeline.summary.playtested");
  if (t.startsWith("mcp:")) {
    const i = Nx(c2(t.slice(4) || void 0));
    return r0(i, a.length);
  }
  return r0(xx(t.slice(5)), a.length);
}
function r0(t, a) {
  return a !== 1 ? E("timeline.summary.usedToolsNamed", { name: t }) : Mx(t) === "an" ? E("timeline.summary.usedToolAn", { name: t }) : E("timeline.summary.usedToolA", { name: t });
}
function jx(t) {
  const i = new Set(t.map(Ox).filter(Boolean)).size || t.length;
  return E(i === 1 ? "timeline.summary.editedFile" : "timeline.summary.editedFiles");
}
function Mx(t) {
  const a = t.trim().split(/\s+/, 1)[0] ?? "";
  return /^[A-Z]{2,}$/.test(a) ? /^[AEFHILMNORSX]/.test(a) ? "an" : "a" : /^[aeiou]/i.test(a) ? "an" : "a";
}
function Nx(t) {
  return t.replace(/\s+tools?$/i, "");
}
function Ox(t) {
  const a = Lx(t.arguments);
  return u0(a?.path) || u0(a?.file_path);
}
function Lx(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : void 0;
}
function u0(t) {
  return typeof t == "string" ? t : "";
}
const s0 = /* @__PURE__ */ new WeakMap();
function Rx(t) {
  const a = [];
  for (const i of t) {
    const o = i.status === "completed" && i.items.length > 0 && i.items.every((y) => y.type === "contextCompaction" && y.status === "completed") ? a.findLastIndex((y) => y.conversationId === i.conversationId && !y.steering && y.items.some((g) => g.type !== "contextCompaction" && g.type !== "modelChange")) : -1;
    if (o < 0) {
      a.push(i);
      continue;
    }
    const f = a[o], m = s0.get(f) ?? /* @__PURE__ */ new WeakMap();
    let p = m.get(i);
    p || (p = { ...f, items: [...f.items, ...i.items.map((y) => ({ ...y, turnId: f.id }))] }, m.set(i, p), s0.set(f, m)), a[o] = p;
  }
  return a;
}
function xf(t, a = Date.now(), i = !1) {
  const u = t.status === "inProgress", o = t.items.find((H) => H.type === "userMessage"), f = t.items.filter((H) => H !== o && !(H.type === "userInputRequest" && H.status === "inProgress") && !(H.type === "approvalRequest" && H.status === "inProgress") && !zx(H) && !(H.type === "retry" && H.status === "completed") && !(H.type === "userMessage" && H.text.startsWith(l4))), m = f.some(as), p = u ? [] : f.filter(as), y = u ? f : f.filter((H) => !as(H)), g = y.filter((H) => H.type !== "plan"), b = g.some((H) => H.type !== "reasoning" && ef(H)), C = wx(t.items), O = g.some((H) => H.type === "reasoning");
  if (!u) {
    const H = g.filter(ef);
    return {
      user: o,
      work: l0(H),
      artifacts: o0(y),
      messages: g.filter((le) => !ef(le)),
      finalMessages: p,
      working: !1,
      status: t.status,
      hadThinking: O,
      durationMs: C
    };
  }
  const U = g, q = !m, $ = b || Dx(U), ne = g.reduce((H, le) => le.type === "agentMessage" && le.status === "failed" ? H : !H || (le.timestamp ?? 0) >= (H.timestamp ?? 0) ? le : H, void 0), P = q && ne?.type === "retry" && ne.status === "inProgress" ? ne.id : void 0, ie = !P && !i && q && $ && _x(U, a), oe = l0(U, { waiting: ie });
  return {
    user: o,
    work: oe,
    artifacts: o0(y),
    messages: [],
    finalMessages: p,
    working: $,
    activeRetryId: P,
    status: t.status,
    hadThinking: O,
    durationMs: C
  };
}
function wx(t) {
  const a = t.findLast(as)?.timestamp ?? t.findLast((u) => u.type !== "contextCompaction")?.timestamp, i = t.filter((u) => u.type !== "contextCompaction" || a === void 0 || u.timestamp === void 0 || u.timestamp <= a).map((u) => u.timestamp).filter((u) => typeof u == "number" && Number.isFinite(u));
  return i.length >= 2 ? Math.max(...i) - Math.min(...i) : 0;
}
function o0(t) {
  const a = /* @__PURE__ */ new Set();
  return t.flatMap((i) => i.type !== "dynamicToolCall" && i.type !== "mcpToolCall" || !i.artifact || a.has(i.artifact.path) ? [] : (a.add(i.artifact.path), [i.artifact]));
}
function Dx(t) {
  return t.some((a) => a.type === "agentMessage" && !!a.text.trim());
}
function ef(t) {
  return t.type === "reasoning" || t.type === "dynamicToolCall" || t.type === "mcpToolCall" || t.type === "retry" || t.type === "imageRead" || t.type === "approvalRequest" || t.type === "contextCompaction" && (t.status === "inProgress" || t.status === "completed") || t.type === "agentMessage" && t.phase !== "final_answer";
}
function as(t) {
  return t.type === "agentMessage" && t.phase === "final_answer";
}
function zx(t) {
  return t.type === "agentMessage" && t.status === "cancelled" && !t.text.trim();
}
function _x(t, a) {
  const i = t.at(-1);
  return !i || i.type === "agentMessage" && i.status === "inProgress" && !kx(t, a) || i.type === "retry" || i.type === "contextCompaction" && i.status === "inProgress" ? !1 : !t.some((u) => (u.type === "dynamicToolCall" || u.type === "mcpToolCall") && (u.status === "preparing" || u.status === "inProgress")) && !t.some((u) => u.type === "reasoning" && u.status === "inProgress");
}
function kx(t, a) {
  const i = t.at(-1);
  return i?.type === "agentMessage" && i.status === "inProgress" && !!i.text.trim() && i.timestamp !== void 0 && a - i.timestamp >= 1e3;
}
function Ux({ root: t, onAdd: a }) {
  const [i, u] = R.useState(), o = R.useRef(null);
  return R.useEffect(() => {
    if (!t) return;
    const f = t.closest(".timeline"), m = () => u(void 0), p = () => {
      const g = window.getSelection();
      if (!g || g.isCollapsed || !g.rangeCount) return;
      const b = g.getRangeAt(0);
      if (!t.contains(b.commonAncestorContainer)) return;
      const C = c0(b.startContainer)?.closest(".assistant-message"), O = c0(b.endContainer)?.closest(".assistant-message");
      if (!C || C !== O) return;
      const U = g.toString().trim();
      if (!U || U.length > 12e3) return;
      const q = b.getBoundingClientRect();
      !q.width && !q.height || u({
        text: U,
        top: Math.max(6, q.top - 34),
        left: Math.min(Math.max(56, q.left + q.width / 2), window.innerWidth - 56)
      });
    }, y = (g) => {
      o.current?.contains(g.target) || m();
    };
    return t.addEventListener("mouseup", p), f?.addEventListener("scroll", m), window.addEventListener("resize", m), document.addEventListener("mousedown", y), () => {
      t.removeEventListener("mouseup", p), f?.removeEventListener("scroll", m), window.removeEventListener("resize", m), document.removeEventListener("mousedown", y);
    };
  }, [t]), i ? /* @__PURE__ */ h.jsx("div", { className: "selected-text-menu", ref: o, style: { top: i.top, left: i.left }, role: "toolbar", "aria-label": E("composer.selectedTextActions"), children: /* @__PURE__ */ h.jsx("button", { type: "button", onMouseDown: (f) => f.preventDefault(), onClick: () => {
    a(i.text), u(void 0);
  }, children: E("sceneWorkbench.addToChat") }) }) : null;
}
function c0(t) {
  return t.nodeType === Node.ELEMENT_NODE ? t : t.parentElement;
}
const Hx = {
  "playable-node": N3,
  "playable-element": O3,
  "playable-drawing": D3,
  "playable-asset": rf,
  "playable-moment": U3,
  "design-document": za,
  "canvas-board": R3
};
function Bx({ kind: t }) {
  return R.createElement(Hx[t], { size: 12 });
}
const Ix = new URL("data:image/svg+xml,%3csvg%20fill='%23478CBF'%20role='img'%20viewBox='0%200%2024%2024'%20xmlns='http://www.w3.org/2000/svg'%3e%3ctitle%3eGodot%20Engine%3c/title%3e%3cpath%20d='M9.5598.683c-1.096.244-2.1812.5831-3.1983%201.0951.023.8981.081%201.7582.199%202.6323-.395.253-.81.47-1.178.766-.375.288-.7581.564-1.0971.9011-.6781-.448-1.3962-.869-2.1352-1.2411C1.3532%205.6934.608%206.6186%200%207.6546c.458.7411.936%201.4352%201.4521%202.0942h.014v6.3565c.012%200%20.023%200%20.035.003l3.8963.376c.204.02.364.184.378.3891l.12%201.7201%203.3994.242.234-1.587c.03-.206.207-.358.415-.358h4.1114c.208%200%20.385.152.415.358l.234%201.587%203.3993-.242.12-1.72a.4196.4196%200%2001.378-.3891l3.8954-.376c.012%200%20.023-.003.035-.003v-.5071h.002V9.7498h.014c.516-.659.994-1.3531%201.4521-2.0942-.608-1.036-1.3541-1.9611-2.1512-2.8192-.739.372-1.4571.793-2.1352%201.2411-.339-.337-.721-.613-1.096-.901-.369-.296-.7841-.513-1.1781-.7661.117-.8741.175-1.7342.199-2.6323-1.0171-.512-2.1012-.851-3.1983-1.095-.438.736-.838%201.533-1.1871%202.3121-.414-.069-.829-.094-1.2461-.099h-.016c-.417.005-.832.03-1.2461.099-.349-.779-.749-1.576-1.1881-2.3121l.001-.001zM6.4765%209.9889c1.2971%200%202.3492%201.0511%202.3492%202.3482s-1.052%202.3482-2.3492%202.3482c-1.296%200-2.3482-1.051-2.3482-2.3482%200-1.297%201.0511-2.3482%202.3482-2.3482zm11.049%200c1.296%200%202.3482%201.0511%202.3482%202.3482s-1.0511%202.3482-2.3482%202.3482-2.3492-1.051-2.3492-2.3482c0-1.297%201.051-2.3482%202.3492-2.3482zm-10.824.9301c-.861%200-1.559.698-1.559%201.5591s.698%201.5582%201.559%201.5582c.8611%200%201.5592-.698%201.5592-1.5582%200-.86-.697-1.559-1.5591-1.559zm10.598%200c-.8611%200-1.5582.698-1.5582%201.5591s.697%201.5582%201.5581%201.5582c.8611%200%201.5592-.698%201.5592-1.5582%200-.86-.697-1.559-1.5592-1.559zm-5.2985.453c.417%200%20.757.308.757.6871v2.1622c0%20.379-.339.687-.757.687s-.756-.308-.756-.687V12.059c0-.379.339-.687.756-.687zM1.4601%2016.9464c.002.377.006.789.006.871%200%203.7014%204.6944%205.4795%2010.5269%205.5005h.014c5.8325-.02%2010.5259-1.7991%2010.5259-5.5004%200-.084.005-.495.007-.871l-3.5023.338-.121%201.729a.421.421%200%2001-.389.3901l-4.1814.296a.4203.4203%200%2001-.415-.358l-.238-1.6141h-3.3863l-.238%201.6141a.4192.4192%200%2001-.4451.357l-4.1513-.296c-.208-.015-.375-.181-.389-.389l-.12-1.7292-3.5044-.337z'/%3e%3c/svg%3e", import.meta.url).href;
function id({ size: t = 13, ...a }) {
  return /* @__PURE__ */ h.jsx("img", { className: "tool-brand-icon tool-brand-godot", src: Ix, width: t, height: t, alt: "", ...a });
}
function d2(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function br(t) {
  const a = d2(t), i = new RegExp("\\*\\*([^*]+)\\*\\*", "g"), u = "`", o = new RegExp(u + "([^" + u + "]+)" + u, "g");
  return a.replace(i, "<strong>$1</strong>").replace(o, "<code>$1</code>");
}
const f0 = (t) => /^\s*\|.*\|\s*$/.test(t), qx = (t) => {
  const a = /^(#{1,6})\s+(.*)$/.exec(t);
  return a ? { level: Math.min(a[1].length, 4), text: a[2] } : null;
}, Gx = (t) => /^```/.test(t.trim()), Fx = (t) => /^\s*[-*]\s+(.*)$/.exec(t)?.[1] ?? null;
function d0(t) {
  return t.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((a) => a.trim());
}
function $x(t) {
  const a = d0(t[0] ?? ""), i = t.slice(2).map(d0), u = a.map((f) => "<th>" + br(f) + "</th>").join(""), o = i.map((f) => "<tr>" + f.map((m) => "<td>" + br(m) + "</td>").join("") + "</tr>").join("");
  return "<table><thead><tr>" + u + "</tr></thead><tbody>" + o + "</tbody></table>";
}
function Vx(t) {
  const a = t.split(/\r?\n/), i = [];
  let u = !1, o = !1;
  const f = () => {
    u && (i.push("</ul>"), u = !1);
  };
  for (let m = 0; m < a.length; m += 1) {
    const p = a[m] ?? "";
    if (Gx(p)) {
      o ? (i.push("</code></pre>"), o = !1) : (f(), i.push("<pre><code>"), o = !0);
      continue;
    }
    if (o) {
      i.push(d2(p) + `
`);
      continue;
    }
    const y = qx(p);
    if (y) {
      f(), i.push("<h" + y.level + ">" + br(y.text) + "</h" + y.level + ">");
      continue;
    }
    if (f0(p)) {
      let b = m;
      for (; b < a.length && f0(a[b] ?? ""); ) b += 1;
      const C = a.slice(m, b);
      if (C.length >= 2) {
        f(), i.push($x(C)), m = b - 1;
        continue;
      }
    }
    const g = Fx(p);
    if (g !== null) {
      u || (i.push("<ul>"), u = !0), i.push("<li>" + br(g) + "</li>");
      continue;
    }
    f(), p.trim() !== "" && i.push("<p>" + br(p) + "</p>");
  }
  return f(), o && i.push("</code></pre>"), i.join("");
}
function m0({ text: t }) {
  const a = R.useMemo(() => Vx(t ?? ""), [t]);
  return R.createElement("div", {
    className: "markdown-content",
    dangerouslySetInnerHTML: { __html: a }
  });
}
function oi({ className: t, summary: a, children: i }) {
  const [u, o] = R.useState(!1);
  return /* @__PURE__ */ h.jsxs("details", { className: t, onToggle: (f) => o(f.currentTarget.open), children: [
    a,
    u ? i : null
  ] });
}
const Kx = /* @__PURE__ */ new Set(["model_not_configured", "authentication_failed", "access_denied", "quota_exceeded", "rate_limited", "invalid_request", "model_unavailable", "provider_unavailable", "dns_error", "connection_refused", "connection_reset", "timeout", "tls_error", "stream_error", "network_error", "runtime_incompatible", "runtime_probe_failed"]);
function m2(t) {
  const a = t.code && Kx.has(t.code) ? t.code : "unknown";
  return { title: E(`agentError.${a}.title`), message: E(`agentError.${a}.message`) };
}
function h2(t) {
  const a = t.diagnostics, i = t.code === "runtime_incompatible" || t.code === "runtime_probe_failed", u = t.code === "model_not_configured" ? [[E("agentError.row.error"), E("agentError.row.notConfigured")]] : [[E(i ? "agentError.row.localCli" : "agentError.row.providerResponse"), t.message]];
  if (!a) return u;
  if (a.provider && u.push([E("agentError.row.provider"), a.provider]), a.model && u.push([E("agentError.row.model"), a.model]), a.endpoint && u.push([E("agentError.row.endpoint"), a.endpoint]), a.transport && u.push([E("agentError.row.transport"), a.transport === "websocket" ? "WebSocket" : "HTTP / SSE"]), a.statusCode !== void 0 && u.push([a.transport === "websocket" ? E("agentError.row.providerStatus") : E("agentError.row.httpStatus"), String(a.statusCode)]), a.errorCode && u.push([E("agentError.row.errorCode"), a.errorCode]), a.requestId && u.push([E("agentError.row.requestId"), a.requestId]), a.retryAttempts !== void 0 && u.push([E("agentError.row.retryAttempts"), String(a.retryAttempts)]), a.network && !i) {
    const o = { direct: E("agentError.network.direct"), manual: E("agentError.network.manual"), system: E("agentError.network.system"), environment: E("agentError.network.environment") }[a.network.source];
    u.push([E("agentError.row.network"), `${o}${a.network.proxyUrl ? ` (${a.network.proxyUrl})` : ""}`]);
  }
  for (const o of t.code === "model_not_configured" ? [] : a.causes ?? []) {
    const f = [o.code, o.name, o.message].filter(Boolean).join(" · ");
    f && u.push([E("agentError.row.cause"), f]);
  }
  return u;
}
function Yx(t) {
  const a = m2(t);
  return [a.title, a.message, ...h2(t).map(([i, u]) => `${i}: ${u}`)].join(`
`);
}
const p2 = { open: !1, files: {}, submitting: !1 }, g2 = R.createContext(void 0);
function Xx({
  workspaceRevision: t,
  children: a
}) {
  const [i, u] = R.useState({}), o = R.useRef(t);
  R.useEffect(() => {
    o.current !== t && (o.current = t, u(
      (p) => Object.fromEntries(
        Object.entries(p).map(([y, g]) => [
          y,
          {
            ...g,
            list: void 0
          }
        ])
      )
    ));
  }, [t]);
  const f = R.useCallback((p, y) => {
    u((g) => {
      const b = g[p] ?? p2, C = y(b);
      return C === b ? g : { ...g, [p]: C };
    });
  }, []), m = R.useMemo(() => ({ views: i, update: f }), [i, f]);
  return /* @__PURE__ */ h.jsx(g2.Provider, { value: m, children: a });
}
function Zx(t) {
  const a = R.useContext(g2);
  if (!a)
    throw new Error("TurnChangesFooter must be used inside TurnChangesViews");
  const { views: i, update: u } = a;
  return [
    i[t] ?? p2,
    R.useCallback(
      (o) => u(t, o),
      [u, t]
    )
  ];
}
function Qx({
  checkpointId: t,
  changes: a,
  controls: i
}) {
  const [u, o] = Zx(t), f = R.useId(), { load: m, file: p } = i, y = i.disabled || u.submitting, g = u.list?.status === "ready" ? u.list.value : void 0, b = a.items ?? u.summary, C = R.useMemo(
    () => new Map(b?.map((H) => [H.path, H.lines])),
    [b]
  ), O = g?.map((H) => ({
    ...H,
    lines: C.get(H.path) ?? H.lines
  })) ?? b, U = O?.some((H) => H.lines) ? O.reduce(
    (H, le) => ({
      added: H.added + (le.lines?.added ?? 0),
      removed: H.removed + (le.lines?.removed ?? 0)
    }),
    { added: 0, removed: 0 }
  ) : void 0, q = u.result?.undone ?? !!a.undone, $ = u.result?.kept ?? a.kept ?? 0, ne = g?.every((H) => H.state === "applied"), P = !q || ne ? "undo" : $ || g?.some((H) => H.state === "applied") ? "undoRest" : void 0;
  R.useEffect(() => {
    o(
      (H) => H.result ? {
        ...H,
        result: {
          ...H.result,
          undone: !!a.undone,
          kept: a.kept ?? 0
        }
      } : H
    );
  }, [a.undone, a.kept, o]), R.useEffect(() => {
    !u.open && b || u.list || v2(
      m(t),
      (H) => o((le) => {
        const Le = H(le.list);
        return {
          ...le,
          list: Le,
          summary: le.summary ?? (!a.items && Le?.status === "ready" ? Le.value.map(({ state: J, ...Ge }) => Ge) : void 0)
        };
      })
    );
  }, [
    t,
    u.open,
    u.list,
    b,
    a.items,
    m,
    o
  ]);
  function ie() {
    o((H) => ({
      ...H,
      open: !H.open,
      list: !H.open && H.list?.status === "failed" ? void 0 : H.list
    }));
  }
  async function oe(H, le, Le) {
    if (!y) {
      o((J) => ({
        ...J,
        submitting: !0,
        error: void 0,
        result: void 0
      }));
      try {
        const J = await i[H](
          t,
          le,
          Le
        );
        o(
          (Ge) => Wx(Ge, J, le === "overwrite", H)
        );
      } finally {
        o((J) => ({ ...J, submitting: !1 }));
      }
    }
  }
  return /* @__PURE__ */ h.jsxs("div", { className: "turn-changes", children: [
    /* @__PURE__ */ h.jsxs(
      "button",
      {
        className: "turn-changes-summary turn-changes-toggle",
        type: "button",
        "aria-label": E("checkpoints.filesChanged", { count: a.files }),
        "aria-expanded": u.open,
        "aria-controls": f,
        onClick: ie,
        children: [
          /* @__PURE__ */ h.jsx("span", { children: E("checkpoints.filesChanged", { count: a.files }) }),
          U ? /* @__PURE__ */ h.jsx(Rf, { lines: U }) : null,
          /* @__PURE__ */ h.jsx(
            ta,
            {
              className: `turn-change-chevron${u.open ? " is-open" : ""}`,
              size: 14,
              "aria-hidden": "true"
            }
          )
        ]
      }
    ),
    u.open ? /* @__PURE__ */ h.jsxs("div", { id: f, children: [
      !O && (!u.list || u.list.status === "loading") ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E("checkpoints.loadingChanges") }) : u.list?.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-error", role: "alert", children: u.list.message }) : O?.length === 0 ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E("checkpoints.noChanges") }) : /* @__PURE__ */ h.jsx("ul", { className: "turn-changes-list", children: O?.map((H) => /* @__PURE__ */ h.jsx(
        Jx,
        {
          checkpointId: t,
          item: H,
          state: u.files[H.path],
          update: o,
          load: p
        },
        H.path
      )) }),
      /* @__PURE__ */ h.jsxs("div", { className: "turn-changes-controls", children: [
        P === "undoRest" ? /* @__PURE__ */ h.jsx("span", { className: "turn-changes-undone", children: E("checkpoints.partlyUndone") }) : null,
        P ? /* @__PURE__ */ h.jsx(
          "button",
          {
            className: "turn-changes-undo",
            type: "button",
            disabled: y,
            onClick: () => {
              oe("undo");
            },
            children: E(`checkpoints.${P}`)
          }
        ) : null,
        q ? /* @__PURE__ */ h.jsx(
          "button",
          {
            className: "turn-changes-undo",
            type: "button",
            disabled: y,
            onClick: () => {
              oe("reapply");
            },
            children: E("checkpoints.reapply")
          }
        ) : null
      ] }),
      u.result ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-result", role: "status", children: eT(u.result) }) : null,
      u.conflict ? /* @__PURE__ */ h.jsx(
        Px,
        {
          conflict: u.conflict,
          disabled: y,
          submitting: u.submitting,
          onApply: (H, le) => {
            oe(u.conflict.direction, H, le);
          },
          onCancel: () => o((H) => ({
            ...H,
            conflict: void 0,
            error: void 0
          }))
        }
      ) : null,
      u.error ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-error", role: "alert", children: u.error }) : null
    ] }) : null
  ] });
}
function Px({
  conflict: t,
  disabled: a,
  submitting: i,
  onApply: u,
  onCancel: o
}) {
  const f = /* @__PURE__ */ h.jsx("button", { type: "button", disabled: i, onClick: o, children: E("common.cancel") });
  return /* @__PURE__ */ h.jsxs(
    "div",
    {
      className: "turn-changes-panel",
      role: "group",
      "aria-label": E(
        t.direction === "reapply" ? "checkpoints.reapply" : "checkpoints.undoChanges"
      ),
      children: [
        t.renewed ? /* @__PURE__ */ h.jsx("p", { children: E("checkpoints.renewed") }) : null,
        /* @__PURE__ */ h.jsx("p", { children: t.blocked ? E("checkpoints.blockedIntro") : E(
          t.direction === "reapply" ? "checkpoints.reapplyConflicts" : "checkpoints.conflictsIntro"
        ) }),
        /* @__PURE__ */ h.jsx("ul", { className: "turn-changes-conflicts", children: t.paths.map((m) => /* @__PURE__ */ h.jsx("li", { children: m }, m)) }),
        /* @__PURE__ */ h.jsx("p", { children: t.blocked ? E("checkpoints.blockedHint") : E("checkpoints.conflictsHint") }),
        /* @__PURE__ */ h.jsxs("div", { className: "turn-changes-actions", children: [
          t.blocked ? /* @__PURE__ */ h.jsx(
            "button",
            {
              className: "primary",
              type: "button",
              disabled: a,
              onClick: () => u("keep"),
              children: E(
                t.direction === "reapply" ? "checkpoints.reapplyRest" : "checkpoints.undoRest"
              )
            }
          ) : /* @__PURE__ */ h.jsxs(h.Fragment, { children: [
            /* @__PURE__ */ h.jsx(
              "button",
              {
                className: "primary",
                type: "button",
                disabled: a,
                onClick: () => u("keep"),
                children: E("checkpoints.keep")
              }
            ),
            /* @__PURE__ */ h.jsx(
              "button",
              {
                type: "button",
                disabled: a,
                onClick: () => u("overwrite", t.paths),
                children: E("checkpoints.overwrite")
              }
            )
          ] }),
          f
        ] })
      ]
    }
  );
}
function Jx({
  checkpointId: t,
  item: a,
  state: i,
  update: u,
  load: o
}) {
  const { path: f } = a, m = !!i?.open, p = i?.content, y = a.state && a.state !== "applied" ? E(`checkpoints.state.${a.state}`) : void 0;
  return R.useEffect(() => {
    !m || p || v2(
      o(t, f),
      (g) => u(
        (b) => h0(b, f, (C) => ({
          ...C,
          content: g(C.content)
        }))
      )
    );
  }, [t, f, m, p, o, u]), /* @__PURE__ */ h.jsxs("li", { className: "turn-change", children: [
    /* @__PURE__ */ h.jsxs(
      "button",
      {
        className: "turn-change-row",
        type: "button",
        title: f,
        "aria-label": f,
        "aria-expanded": m,
        onClick: () => u(
          (g) => h0(g, f, (b) => ({
            open: !b.open,
            content: b.content?.status === "failed" ? void 0 : b.content
          }))
        ),
        children: [
          /* @__PURE__ */ h.jsxs("span", { className: "turn-change-path", children: [
            /* @__PURE__ */ h.jsx(cs, { size: 12, "aria-hidden": "true" }),
            /* @__PURE__ */ h.jsx("span", { children: f })
          ] }),
          a.lines ? /* @__PURE__ */ h.jsx(Rf, { lines: a.lines }) : /* @__PURE__ */ h.jsx(
            "span",
            {
              className: "turn-change-kind",
              title: E(`checkpoints.kind.${a.kind}`),
              "aria-label": E("checkpoints.noLineCounts"),
              children: "—"
            }
          ),
          y ? /* @__PURE__ */ h.jsx("span", { className: "turn-change-badge", children: y }) : null,
          /* @__PURE__ */ h.jsx(
            ta,
            {
              className: `turn-change-chevron${m ? " is-open" : ""}`,
              size: 12,
              "aria-hidden": "true"
            }
          )
        ]
      }
    ),
    m ? !p || p.status === "loading" ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E("checkpoints.loadingFile") }) : p.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "turn-changes-error", role: "alert", children: p.message }) : /* @__PURE__ */ h.jsx(W3, { view: p.value }) : null
  ] });
}
function v2(t, a) {
  const i = { status: "loading" }, u = (o) => a((f) => f === i ? o : f);
  a(() => i), t.then(
    (o) => u({ status: "ready", value: o }),
    (o) => u({ status: "failed", message: tT(o) })
  );
}
function h0(t, a, i) {
  return {
    ...t,
    files: {
      ...t.files,
      [a]: i(t.files[a] ?? { open: !1 })
    }
  };
}
function Wx(t, a, i, u) {
  return a.status === "failed" ? { ...t, error: a.message } : a.status === "conflicts" ? {
    ...t,
    conflict: {
      direction: u,
      paths: a.conflicts,
      blocked: a.blocked,
      renewed: i && !a.blocked
    }
  } : {
    ...t,
    conflict: void 0,
    list: void 0,
    result: {
      changed: a.changed.length,
      kept: a.kept ?? a.conflicts.length,
      left: a.conflicts.length,
      direction: u,
      undone: a.undone ?? u === "undo"
    }
  };
}
function eT({
  changed: t,
  left: a,
  direction: i
}) {
  const u = i === "reapply" ? E("checkpoints.reapplied", { count: t }) : t === 0 ? E("checkpoints.nonePutBack") : E("checkpoints.putBack", { count: t });
  return a === 0 ? u : `${u} ${E("checkpoints.kept", { count: a })}`;
}
function tT(t) {
  return t instanceof Error ? t.message : String(t);
}
function nT() {
  const t = R.useRef(null), [a, i] = R.useState(!1);
  return R.useEffect(() => {
    const u = t.current;
    if (!u || typeof IntersectionObserver > "u") {
      i(!0);
      return;
    }
    const o = new IntersectionObserver(([f]) => {
      f?.isIntersecting && (i(!0), o.disconnect());
    }, { rootMargin: "160px" });
    return o.observe(u), () => o.disconnect();
  }, []), [t, a];
}
const aT = R.createContext(void 0), y2 = R.createContext({}), b2 = R.createContext(void 0), p0 = /* @__PURE__ */ new WeakMap();
function C2(t) {
  if (t.status === "inProgress") return xf(t);
  let a = p0.get(t);
  return a || (a = xf(t), p0.set(t, a)), a;
}
const lT = R.memo(function({ turns: a, projectId: i = "", workspacePath: u, onOpenWorkspaceFile: o, onComponentClick: f, revisionDisabled: m, onRevise: p, onRestore: y, changeControls: g, workspaceRevision: b, onAddToChat: C, onAddTodo: O, waitingForInput: U = !1 }) {
  const [q, $] = R.useState(null), [ne, P] = R.useState(), [ie, oe] = R.useState(""), [H, le] = R.useState(), [Le, J] = R.useState(), [Ge, Je] = R.useState(!1), He = R.useMemo(() => Rx(a), [a]), ft = R.useMemo(() => He.map(C2), [He]), pt = R.useMemo(() => ({ workspacePath: u, onOpenWorkspaceFile: o, onComponentClick: f }), [u, o, f]), ze = He.findIndex((B) => B.status === "inProgress"), Qe = R.useMemo(() => O && ze >= 0 ? { turnId: He[ze].id, add: O } : void 0, [O, ze, He]), Ct = He.findLastIndex((B) => B.steering), w = ze >= 0 && Ct > ze, G = [...He].reverse().flatMap((B) => B.items).find((B) => B.type === "userMessage")?.id, X = ft.flatMap((B) => B.finalMessages).findLast((B) => B.status === "completed" && !!B.text.trim())?.id;
  R.useEffect(() => {
    ne && ne !== G && P(void 0);
  }, [ne, G]);
  const ge = R.useCallback(async (B) => {
    if (B.text) {
      try {
        await navigator.clipboard.writeText(B.text);
      } catch {
        return;
      }
      le(B.id), window.setTimeout(() => le((Z) => Z === B.id ? void 0 : Z), 1500);
    }
  }, []), xe = R.useCallback(async (B, Z) => {
    if (Z) {
      try {
        await navigator.clipboard.writeText(Z);
      } catch {
        return;
      }
      J(B), window.setTimeout(() => J((se) => se === B ? void 0 : se), 1500);
    }
  }, []), x = R.useCallback((B) => {
    P(B.id), oe(B.text);
  }, []), z = R.useCallback(() => P(void 0), []), F = R.useCallback(async () => {
    if (!(!p || Ge || m || !ie.trim())) {
      Je(!0);
      try {
        await p(ie) && P(void 0);
      } finally {
        Je(!1);
      }
    }
  }, [p, Ge, m, ie]);
  return /* @__PURE__ */ h.jsx(y2.Provider, { value: pt, children: /* @__PURE__ */ h.jsx(b2.Provider, { value: Qe, children: /* @__PURE__ */ h.jsxs("div", { className: "agent-timeline-selection-root", ref: $, children: [
    /* @__PURE__ */ h.jsx(Xx, { workspaceRevision: b, children: He.map((B, Z) => /* @__PURE__ */ h.jsx(
      iT,
      {
        projectId: i,
        turn: B,
        waitingForInput: B.status === "inProgress" && U,
        steeringPending: w && Z === Ct,
        changeControls: g,
        assistantControls: {
          copiedItemId: Le,
          latestItemId: X,
          onCopy: xe
        },
        userControls: {
          editing: ft[Z].user?.id === ne && ne === G,
          draft: ft[Z].user?.id === ne ? ie : "",
          copied: ft[Z].user?.id === H,
          canEdit: !!(p && ft[Z].user?.text && ft[Z].user?.id === G),
          disabled: !!(m || Ge),
          onRestore: y,
          onCopy: ge,
          onEdit: x,
          onDraftChange: oe,
          onCancel: z,
          onSubmit: F
        }
      },
      B.id
    )) }, He[0]?.conversationId),
    C ? /* @__PURE__ */ h.jsx(Ux, { root: q, onAdd: C }) : null
  ] }) }) });
}), iT = R.memo(function({ turn: a, projectId: i, waitingForInput: u, steeringPending: o = !1, userControls: f, assistantControls: m, changeControls: p }) {
  const [y, g] = R.useState(Date.now()), b = a.status === "inProgress";
  R.useEffect(() => {
    if (!b) return;
    g(Date.now());
    const U = window.setInterval(() => g(Date.now()), 1e3);
    return () => window.clearInterval(U);
  }, [b]);
  const C = R.useMemo(() => b ? xf(a, y, u) : C2(a), [a, b, y, u]), O = p && C.status !== "inProgress" && C.user?.checkpointId && C.user.changes && C.user.changes.files > 0 ? /* @__PURE__ */ h.jsx(Qx, { checkpointId: C.user.checkpointId, changes: C.user.changes, controls: p }) : null;
  return /* @__PURE__ */ h.jsxs("article", { className: "agent-turn", children: [
    /* @__PURE__ */ h.jsx(oT, { item: C.user, controls: f }),
    C.status === "inProgress" ? /* @__PURE__ */ h.jsx(dT, { display: C, now: y }) : null,
    C.status !== "inProgress" && (C.work.length > 0 || C.status === "cancelled") ? /* @__PURE__ */ h.jsx(mT, { display: C }) : null,
    C.messages.map((U) => /* @__PURE__ */ h.jsx(rd, { item: U }, U.id)),
    C.finalMessages.length > 0 ? /* @__PURE__ */ h.jsx(uT, { projectId: i, items: C.finalMessages, artifacts: C.artifacts, controls: m, changes: O }) : C.artifacts.length > 0 ? /* @__PURE__ */ h.jsx(E2, { projectId: i, artifacts: C.artifacts }) : null,
    C.finalMessages.length === 0 ? O : null,
    o ? /* @__PURE__ */ h.jsx(rT, {}) : null
  ] });
}, (t, a) => t.turn === a.turn && t.projectId === a.projectId && t.waitingForInput === a.waitingForInput && t.steeringPending === a.steeringPending && g0(t.userControls, a.userControls) && g0(t.assistantControls, a.assistantControls) && t.changeControls === a.changeControls);
function g0(t, a) {
  return Object.keys(t).every((i) => t[i] === a[i]);
}
function rT() {
  return /* @__PURE__ */ h.jsx("div", { className: "thinking-activity", role: "status", children: /* @__PURE__ */ h.jsx(Ha, { text: E("timeline.waitingToSteer") }) });
}
function uT({ projectId: t, items: a, artifacts: i, controls: u, changes: o }) {
  const f = a.filter((g) => g.status === "completed" && !!g.text.trim()), m = f.at(-1)?.id, p = f.map((g) => g.text).join(`

`), y = f.at(-1)?.timestamp;
  return /* @__PURE__ */ h.jsxs("div", { className: `assistant-response${m === u.latestItemId ? " assistant-response-latest" : ""}`, children: [
    a.map((g) => /* @__PURE__ */ h.jsx(rd, { item: g }, g.id)),
    i.length > 0 ? /* @__PURE__ */ h.jsx(E2, { projectId: t, artifacts: i }) : null,
    o,
    m ? /* @__PURE__ */ h.jsxs("div", { className: "assistant-response-footer", children: [
      /* @__PURE__ */ h.jsx("button", { type: "button", "aria-label": E("timeline.copyResponse"), title: E("common.copy"), onClick: () => u.onCopy(m, p), children: m === u.copiedItemId ? /* @__PURE__ */ h.jsx(ui, { size: 13 }) : /* @__PURE__ */ h.jsx(jf, { size: 13 }) }),
      y ? /* @__PURE__ */ h.jsx("time", { dateTime: new Date(y).toISOString(), children: sT(y) }) : null
    ] }) : null
  ] });
}
function sT(t) {
  return new Intl.DateTimeFormat(ds, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(t);
}
function oT({ item: t, controls: a }) {
  if (!t) return null;
  const i = new Set(t.images?.map((f) => f.name).filter((f) => !!f) ?? []), u = t.attachments?.filter((f) => !i.has(f.relativePath)) ?? [];
  function o(f) {
    f.key !== "Enter" || f.shiftKey || f.nativeEvent.isComposing || (f.preventDefault(), a.onSubmit());
  }
  return /* @__PURE__ */ h.jsxs("div", { className: "user-input", children: [
    t.images?.length ? /* @__PURE__ */ h.jsx("div", { className: "user-message-images", children: t.images.map((f, m) => /* @__PURE__ */ h.jsx(ad, { image: f, alt: E("timeline.attachedImage", { number: m + 1 }) }, `${f.mediaType}:${m}`)) }) : null,
    u.length ? /* @__PURE__ */ h.jsx(fT, { attachments: u }) : null,
    t.contexts?.length ? /* @__PURE__ */ h.jsx(cT, { contexts: t.contexts }) : null,
    a.editing ? /* @__PURE__ */ h.jsxs("div", { className: "user-message-editor", children: [
      /* @__PURE__ */ h.jsx(
        "textarea",
        {
          autoFocus: !0,
          value: a.draft,
          onChange: (f) => a.onDraftChange(f.target.value),
          onFocus: (f) => {
            const m = f.currentTarget.value.length;
            f.currentTarget.setSelectionRange(m, m);
          },
          onKeyDown: o,
          disabled: a.disabled,
          "aria-label": E("timeline.editMessage")
        }
      ),
      /* @__PURE__ */ h.jsxs("div", { className: "user-message-editor-actions", children: [
        /* @__PURE__ */ h.jsx("button", { type: "button", onClick: a.onCancel, disabled: a.disabled, children: E("common.cancel") }),
        /* @__PURE__ */ h.jsx("button", { className: "primary", type: "button", onClick: a.onSubmit, disabled: a.disabled || !a.draft.trim(), children: E("common.send") })
      ] })
    ] }) : t.text ? /* @__PURE__ */ h.jsxs(h.Fragment, { children: [
      /* @__PURE__ */ h.jsx("div", { className: "user-message", children: t.text }),
      /* @__PURE__ */ h.jsxs("div", { className: "user-message-actions", children: [
        /* @__PURE__ */ h.jsx("button", { type: "button", "aria-label": E("timeline.copyMessage"), title: E("common.copy"), onClick: () => a.onCopy(t), children: a.copied ? /* @__PURE__ */ h.jsx(ui, { size: 13 }) : /* @__PURE__ */ h.jsx(jf, { size: 13 }) }),
        a.canEdit ? /* @__PURE__ */ h.jsx("button", { type: "button", "aria-label": E("timeline.editMessage"), title: E("common.edit"), onClick: () => a.onEdit(t), disabled: a.disabled, children: /* @__PURE__ */ h.jsx(z3, { size: 13 }) }) : null,
        a.onRestore && t.checkpointId ? /* @__PURE__ */ h.jsx("button", { type: "button", "aria-label": E("checkpoints.restoreToMessage"), title: E("checkpoints.restoreToMessage"), onClick: () => a.onRestore(t.checkpointId), disabled: a.disabled, children: /* @__PURE__ */ h.jsx(k3, { size: 13 }) }) : null
      ] })
    ] }) : null
  ] });
}
function cT({ contexts: t }) {
  return /* @__PURE__ */ h.jsx("div", { className: "user-message-contexts", "aria-label": E("timeline.editorContext"), children: t.map((a, i) => /* @__PURE__ */ h.jsxs("div", { className: "user-message-context", title: a.label, children: [
    /* @__PURE__ */ h.jsx(Bx, { kind: a.kind }),
    /* @__PURE__ */ h.jsx("span", { children: a.label })
  ] }, `${a.kind}:${i}`)) });
}
function fT({ attachments: t }) {
  return /* @__PURE__ */ h.jsx("div", { className: "user-message-attachments", "aria-label": E("attachments.files"), children: t.map((a, i) => /* @__PURE__ */ h.jsxs("div", { className: "user-message-attachment", title: `${a.relativePath} · ${Cx(a.size)}`, children: [
    /* @__PURE__ */ h.jsx(za, { size: 13 }),
    /* @__PURE__ */ h.jsx("span", { children: a.relativePath }),
    /* @__PURE__ */ h.jsx("small", { children: a.kind })
  ] }, `${a.relativePath}:${i}`)) });
}
function Ha({ text: t, active: a = !0, className: i, title: u, role: o }) {
  const f = [i, a ? "activity-shimmer" : void 0].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ h.jsxs("span", { className: f, title: u, role: o, children: [
    t,
    a ? /* @__PURE__ */ h.jsx("span", { className: "activity-shimmer-highlight", "aria-hidden": "true", children: t }) : null
  ] });
}
function dT({ display: t, now: a }) {
  const i = t.working ? E("timeline.workingFor", { duration: vT(t, a) }) : E("timeline.thinking");
  return /* @__PURE__ */ h.jsxs("section", { className: "work-activity work-activity-active", children: [
    /* @__PURE__ */ h.jsx("div", { className: `work-summary work-summary-active${t.working ? "" : " work-summary-thinking"}`, children: /* @__PURE__ */ h.jsx(Ha, { text: i, active: !t.working }) }),
    t.work.length > 0 ? /* @__PURE__ */ h.jsx("div", { className: "active-work-items", children: /* @__PURE__ */ h.jsx(Tf, { items: t.work, images: t.user?.images, activeRetryId: t.activeRetryId }) }) : null
  ] });
}
function mT({ display: t }) {
  if (t.status === "completed" && !t.user && t.finalMessages.length === 0 && t.messages.length === 0 && t.work.length > 0 && t.work.every((i) => i.kind === "item" && i.item.type === "contextCompaction"))
    return /* @__PURE__ */ h.jsx(Tf, { items: t.work });
  const a = /* @__PURE__ */ h.jsxs("div", { className: "work-items", children: [
    /* @__PURE__ */ h.jsx(Tf, { items: t.work, images: t.user?.images, failed: t.status === "failed" }),
    t.status === "cancelled" && t.work.length === 0 ? /* @__PURE__ */ h.jsx("div", { className: "stopped-work-note", children: t.hadThinking ? E("timeline.stoppedThinking") : E("timeline.stoppedBefore") }) : null
  ] });
  return t.status === "cancelled" || t.status === "failed" ? /* @__PURE__ */ h.jsxs("section", { className: `work-activity ${t.status === "cancelled" ? "work-activity-stopped" : "work-activity-failed"}`, children: [
    /* @__PURE__ */ h.jsx("div", { className: `work-summary ${t.status === "cancelled" ? "work-summary-stopped" : "work-summary-failed"}`, children: /* @__PURE__ */ h.jsx("span", { children: t.status === "cancelled" ? E("timeline.stoppedAfter", { duration: tf(t) }) : E("timeline.workedFor", { duration: tf(t) }) }) }),
    a
  ] }) : /* @__PURE__ */ h.jsx(oi, { className: "work-activity", summary: /* @__PURE__ */ h.jsxs("summary", { className: "work-summary", children: [
    /* @__PURE__ */ h.jsx("span", { children: t.durationMs < 1e3 ? "已完成" : E("timeline.workedFor", { duration: tf(t) }) }),
    /* @__PURE__ */ h.jsx(ta, { className: "work-chevron", size: 13 })
  ] }), children: a });
}
function Tf({ items: t, images: a, failed: i = !1, activeRetryId: u }) {
  const o = t.map((f) => f.kind === "tool-group" ? /* @__PURE__ */ h.jsx(hT, { tools: f.tools }, f.id) : f.kind === "thinking" ? /* @__PURE__ */ h.jsx(x2, { item: f.item }, f.item.id) : f.kind === "waiting" ? /* @__PURE__ */ h.jsx(ST, {}, "waiting") : f.item.type === "retry" ? /* @__PURE__ */ h.jsx(Ef, { error: f.item.error, retry: f.item, active: f.item.id === u }, f.item.id) : /* @__PURE__ */ h.jsx(
    rd,
    {
      item: f.item,
      images: f.item.type === "imageRead" ? a : void 0,
      hideError: f.item.type === "agentMessage" && !!f.item.error
    },
    f.item.id
  ));
  if (i) {
    const f = t.some((p) => p.kind === "item" && p.item.type === "retry" && p.item.status === "failed"), m = t.flatMap((p) => p.kind === "item" && p.item.type === "agentMessage" && p.item.error ? [p.item] : []).at(-1);
    !f && m?.type === "agentMessage" && m.error && o.push(/* @__PURE__ */ h.jsx(Ef, { error: m.error }, "turn-connection-error"));
  }
  return o;
}
function hT({ tools: t }) {
  const a = t.findLast((m) => m.status === "preparing" || m.status === "inProgress"), i = a ? j2(a) : void 0, u = i?.icon ?? pT(t), f = (a && i ? HT(a, i.label) : void 0) ?? Tx(t);
  return /* @__PURE__ */ h.jsx(oi, { className: "tool-activity-group", summary: /* @__PURE__ */ h.jsxs("summary", { className: "tool-group-summary", children: [
    /* @__PURE__ */ h.jsx(u, { size: 13, "aria-hidden": "true" }),
    /* @__PURE__ */ h.jsx(Ha, { text: f, active: !!a, className: "tool-label", title: f }),
    /* @__PURE__ */ h.jsx(ta, { className: "tool-group-chevron", size: 13, "aria-hidden": "true" })
  ] }), children: /* @__PURE__ */ h.jsx("div", { className: "tool-group-items", children: t.map((m) => /* @__PURE__ */ h.jsx(T2, { item: m, completed: m.status === "completed" || m.status === "failed" }, m.id)) }) });
}
function pT(t) {
  if (t.some((i) => i.type === "dynamicToolCall" && i.tool === "generate_image")) return Nf;
  if (t.some((i) => i.type === "dynamicToolCall" && (i.tool === "edit" || i.tool === "write"))) return cs;
  if (t.some((i) => i.type === "dynamicToolCall" && (i.tool === "read" || i.tool === "ls"))) return za;
  if (t.some((i) => i.type === "dynamicToolCall" && (i.tool === "grep" || i.tool === "find"))) return dl;
  if (t.some((i) => i.type === "dynamicToolCall" && i.tool === "bash")) return fs;
  if (t.some((i) => i.type === "dynamicToolCall" && i.tool === "game_use")) return Mf;
  const a = t.filter((i) => i.type === "mcpToolCall");
  return a.some((i) => ld(i) === "godot") ? id : a.length > 0 ? Of : Lf;
}
function tf(t) {
  return gT(t.durationMs);
}
function gT(t) {
  if (t < 1e3) return "已完成";
  if (t < 1e3) return E("timeline.duration.seconds", { seconds: 0 });
  const a = Math.max(1, Math.round(t / 1e3));
  return S2(a);
}
function vT(t, a) {
  const i = t.work.flatMap((o) => o.kind === "item" ? [o.item.timestamp] : o.kind === "tool-group" ? o.tools.map((f) => f.timestamp) : o.kind === "thinking" ? [o.item.timestamp] : []), u = [t.user?.timestamp, ...i].filter((o) => typeof o == "number" && Number.isFinite(o)).reduce((o, f) => Math.min(o, f), a);
  return CT(Math.max(0, a - u));
}
function yT(t, a) {
  const i = new Intl.NumberFormat(ds), u = i.format(t);
  return a === void 0 ? E("timeline.compactedFrom", { before: u }) : E("timeline.compactedFromTo", { before: u, after: i.format(a) });
}
function bT(t) {
  return t.error ? t.error.message : t.status === "completed" ? E("timeline.compaction.completed") : t.status === "cancelled" ? E("timeline.compaction.cancelled") : t.status === "failed" ? E("timeline.compaction.failed") : E("timeline.compaction.running");
}
function CT(t) {
  return S2(Math.floor(t / 1e3));
}
function S2(t) {
  const a = Math.floor(t / 60);
  return a > 0 ? E("timeline.duration.minutes", { minutes: a, seconds: t % 60 }) : E("timeline.duration.seconds", { seconds: t });
}
function ST() {
  return /* @__PURE__ */ h.jsx("div", { className: "thinking-activity", role: "status", children: /* @__PURE__ */ h.jsx(Ha, { text: E("timeline.thinking") }) });
}
function xT({ item: t }) {
  const a = R.useContext(b2), [i, u] = R.useState(!1), [o, f] = R.useState(""), m = t.todos.items, p = [];
  for (const b of m) {
    const C = b.group?.trim();
    let O = p.find((U) => (U.title ?? "") === (C ?? ""));
    O || (O = C ? { title: C, items: [] } : { items: [] }, p.push(O)), O.items.push(b);
  }
  const y = m.filter((b) => b.status === "done").length, g = () => {
    const b = o.trim();
    if (!b) {
      u(!1);
      return;
    }
    f(""), u(!1), a?.add(b);
  };
  return /* @__PURE__ */ h.jsxs("div", { className: "todo-list-card", "data-testid": "todo-list-card", "aria-label": E("timeline.todo.label"), children: [
    p.map((b, C) => /* @__PURE__ */ h.jsxs("div", { className: "todo-list-group", children: [
      b.title ? /* @__PURE__ */ h.jsx("div", { className: "todo-list-group-title", children: b.title }) : null,
      /* @__PURE__ */ h.jsx(TT, { items: b.items })
    ] }, b.title ?? `ungrouped:${C}`)),
    /* @__PURE__ */ h.jsxs("div", { className: "todo-list-progress", children: [
      y,
      "/",
      m.length
    ] }),
    a?.turnId === t.turnId ? i ? /* @__PURE__ */ h.jsx(
      "input",
      {
        className: "todo-list-add-input",
        "data-testid": "todo-list-add-input",
        value: o,
        placeholder: E("timeline.todo.addPlaceholder"),
        "aria-label": E("timeline.todo.addLabel"),
        autoFocus: !0,
        onChange: (b) => f(b.target.value),
        onKeyDown: (b) => {
          b.key === "Enter" && (b.preventDefault(), g()), b.key === "Escape" && (b.preventDefault(), u(!1), f(""));
        },
        onBlur: () => u(!1)
      }
    ) : /* @__PURE__ */ h.jsxs("button", { type: "button", className: "todo-list-add", "data-testid": "todo-list-add", onClick: () => u(!0), children: [
      /* @__PURE__ */ h.jsx(M3, { size: 11, "aria-hidden": "true" }),
      " ",
      E("timeline.todo.addLabel")
    ] }) : null
  ] });
}
function TT({ items: t }) {
  const a = [
    { label: E("timeline.todo.inProgress"), entries: t.filter((i) => i.status === "in_progress") },
    { label: E("timeline.todo.pending"), entries: t.filter((i) => i.status === "pending") },
    { label: E("timeline.todo.done"), entries: t.filter((i) => i.status === "done") }
  ];
  return /* @__PURE__ */ h.jsx(h.Fragment, { children: a.flatMap((i) => i.entries.length === 0 ? [] : [
    /* @__PURE__ */ h.jsx("div", { className: "todo-list-section-label", children: i.label }, i.label),
    ...i.entries.map((u, o) => /* @__PURE__ */ h.jsxs("div", { className: "todo-list-row", "data-status": u.status, "data-testid": "todo-list-row", children: [
      u.status === "in_progress" ? /* @__PURE__ */ h.jsx(_3, { className: "spin", size: 13, "aria-hidden": "true" }) : null,
      u.status === "pending" ? /* @__PURE__ */ h.jsx(x0, { size: 13, "aria-hidden": "true" }) : null,
      u.status === "done" ? /* @__PURE__ */ h.jsx(ui, { size: 13, "aria-hidden": "true" }) : null,
      /* @__PURE__ */ h.jsx("span", { className: `todo-list-title${u.status === "done" ? " todo-list-title-done" : ""}`, children: u.title }),
      u.origin === "user" ? /* @__PURE__ */ h.jsx("span", { className: "todo-list-origin", title: E("timeline.todo.yours"), children: E("timeline.todo.yours") }) : null
    ] }, `${u.title}:${o}`))
  ]) });
}
function ET({ item: t }) {
  const a = new Map((t.answers ?? []).map((u) => [u.questionId, u])), i = t.status === "cancelled" || t.status === "failed" || (t.answers?.length ?? 0) === 0;
  return /* @__PURE__ */ h.jsxs("div", { className: "questionnaire-record", "data-testid": "questionnaire-record", "data-tone": i ? "skipped" : "answered", children: [
    t.error ? /* @__PURE__ */ h.jsx("div", { className: "questionnaire-record-error", children: t.error.message }) : null,
    t.questions.map((u) => {
      const o = a.get(u.id), f = o ? o.value.split(`
`).map((m) => m.trim()).filter(Boolean) : [];
      return /* @__PURE__ */ h.jsxs("div", { className: "questionnaire-record-question", children: [
        /* @__PURE__ */ h.jsx("div", { className: "questionnaire-record-prompt", children: u.prompt }),
        /* @__PURE__ */ h.jsxs("ul", { className: "questionnaire-record-options", children: [
          u.options.map((m) => {
            const p = f.includes(m.value);
            return /* @__PURE__ */ h.jsxs("li", { className: p ? "questionnaire-record-option-selected" : void 0, "data-selected": p || void 0, children: [
              p ? /* @__PURE__ */ h.jsx(ui, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ h.jsx(x0, { size: 14, "aria-hidden": "true" }),
              /* @__PURE__ */ h.jsx("span", { children: m.label })
            ] }, m.value);
          }),
          o?.custom ? f.filter((m) => !u.options.some((p) => p.value === m)).map((m) => /* @__PURE__ */ h.jsxs("li", { className: "questionnaire-record-option-selected", "data-selected": !0, children: [
            /* @__PURE__ */ h.jsx(ui, { size: 14, "aria-hidden": "true" }),
            /* @__PURE__ */ h.jsx("span", { children: E("questionnaire.quotedAnswer", { answer: m }) })
          ] }, m)) : null
        ] }),
        o?.notes ? /* @__PURE__ */ h.jsx("div", { className: "questionnaire-record-notes", children: E("questionnaire.notes", { notes: o.notes }) }) : null,
        o ? null : /* @__PURE__ */ h.jsx("div", { className: "questionnaire-record-skipped", children: E("questionnaire.skippedQuestion") })
      ] }, u.id);
    })
  ] });
}
const ts = /* @__PURE__ */ new Map();
function x2({ item: t }) {
  const a = t.status === "inProgress", [i, u] = R.useState(() => ts.has(t.id) ? ts.get(t.id) : a);
  R.useEffect(() => {
    !a && !ts.has(t.id) && u(!1);
  }, [a, t.id]);
  const o = AT(t.text), f = o ?? E("timeline.thinking");
  return /* @__PURE__ */ h.jsxs("details", { className: "thinking-block", open: i, onToggle: (m) => {
    const p = m.currentTarget.open;
    ts.set(t.id, p), u(p);
  }, children: [
    /* @__PURE__ */ h.jsxs("summary", { className: "thinking-block-summary", title: o, children: [
      /* @__PURE__ */ h.jsx(w3, { size: 13, "aria-hidden": "true" }),
      /* @__PURE__ */ h.jsx(Ha, { text: f, active: a, className: "thinking-block-label", title: f, role: a ? "status" : void 0 }),
      /* @__PURE__ */ h.jsx("span", { className: "thinking-block-meta", children: E("timeline.thinkingChars", { chars: t.text.length }) }),
      /* @__PURE__ */ h.jsx(ta, { className: "tool-group-chevron", size: 13, "aria-hidden": "true" })
    ] }),
    /* @__PURE__ */ h.jsx("div", { className: "thinking-block-text", children: t.text })
  ] });
}
function AT(t) {
  const a = t.split(`
`).find((i) => i.trim().length > 0)?.trim();
  if (a) {
    for (const i of ["**", "__"])
      if (a.startsWith(i) && a.endsWith(i) && a.length > i.length * 2)
        return a.slice(i.length, -i.length).trim() || void 0;
    return a;
  }
}
function rd({ item: t, images: a, hideError: i = !1 }) {
  const u = R.useContext(y2);
  if (t.type === "reasoning") return /* @__PURE__ */ h.jsx(x2, { item: t });
  if (t.type === "todoList") return /* @__PURE__ */ h.jsx(xT, { item: t });
  if (t.type === "userInputRequest") return /* @__PURE__ */ h.jsx(ET, { item: t });
  if (t.type === "modelChange")
    return /* @__PURE__ */ h.jsx("div", { className: "model-change-event", role: "status", children: /* @__PURE__ */ h.jsx("span", { children: E("timeline.switchedTo", { model: t.name ?? t.model.id }) }) });
  if (t.type === "imageRead") {
    const o = t.count === 1 ? E("timeline.viewedImage") : E("timeline.viewedImages", { count: t.count });
    return a?.length ? /* @__PURE__ */ h.jsx(oi, { className: "image-read-details", summary: /* @__PURE__ */ h.jsxs("summary", { className: "timeline-event timeline-event-expandable", children: [
      /* @__PURE__ */ h.jsx(rf, { size: 13, "aria-hidden": "true" }),
      /* @__PURE__ */ h.jsx("span", { children: o }),
      /* @__PURE__ */ h.jsx(ta, { className: "tool-detail-chevron", size: 12, "aria-hidden": "true" })
    ] }), children: /* @__PURE__ */ h.jsx("div", { className: "image-read-previews", children: a.map((f, m) => /* @__PURE__ */ h.jsx(
      ad,
      {
        image: f,
        alt: f.name ?? E("timeline.viewedImageName", { number: m + 1 })
      },
      `${f.mediaType}:${m}`
    )) }) }) : /* @__PURE__ */ h.jsxs("div", { className: "timeline-event", children: [
      /* @__PURE__ */ h.jsx(rf, { size: 13, "aria-hidden": "true" }),
      /* @__PURE__ */ h.jsx("span", { children: o })
    ] });
  }
  if (t.type === "dynamicToolCall" || t.type === "mcpToolCall") return /* @__PURE__ */ h.jsx(T2, { item: t });
  if (t.type === "approvalRequest") {
    const o = K3(t);
    return /* @__PURE__ */ h.jsxs("div", { className: `timeline-event${t.status === "completed" && t.decision !== "deny" ? "" : " timeline-event-muted"}`, title: o, children: [
      /* @__PURE__ */ h.jsx(fs, { size: 13, "aria-hidden": "true" }),
      /* @__PURE__ */ h.jsx("span", { className: "approval-outcome", children: o })
    ] });
  }
  if (t.type === "contextCompaction") {
    const o = bT(t), f = /* @__PURE__ */ h.jsx(L3, { size: 13, "aria-hidden": "true" }), m = t.status === "inProgress";
    return t.status === "completed" && t.summary ? /* @__PURE__ */ h.jsx(oi, { className: "compaction-details", summary: /* @__PURE__ */ h.jsxs("summary", { className: "timeline-event timeline-event-expandable", children: [
      f,
      /* @__PURE__ */ h.jsx(Ha, { text: o, active: m }),
      /* @__PURE__ */ h.jsx(ta, { className: "tool-detail-chevron", size: 12, "aria-hidden": "true" })
    ] }), children: /* @__PURE__ */ h.jsxs("div", { className: "compaction-content", children: [
      t.tokensBefore !== void 0 ? /* @__PURE__ */ h.jsx("p", { className: "compaction-stats", children: yT(t.tokensBefore, t.estimatedTokensAfter) }) : null,
      /* @__PURE__ */ h.jsx(m0, { text: t.summary, ...u })
    ] }) }) : /* @__PURE__ */ h.jsxs("div", { className: `timeline-event${t.status === "failed" ? " timeline-event-error" : ""}`, children: [
      f,
      /* @__PURE__ */ h.jsx(Ha, { text: o, active: m })
    ] });
  }
  if (t.type === "agentMessage") {
    if (!t.text && t.status === "completed" || !t.text.trim() && i) return null;
    const o = /* @__PURE__ */ h.jsxs("div", { className: `assistant-message assistant-${t.status}`, children: [
      t.text ? /* @__PURE__ */ h.jsx(m0, { text: t.text, ...u }) : null,
      t.status === "cancelled" && !t.text ? /* @__PURE__ */ h.jsx("span", { className: "muted-text", children: E("timeline.stopped") }) : null,
      t.status === "interrupted" && !t.text ? /* @__PURE__ */ h.jsx("span", { className: "muted-text", children: E("timeline.interrupted") }) : null
    ] });
    return !t.error || i ? o : /* @__PURE__ */ h.jsxs(h.Fragment, { children: [
      o,
      /* @__PURE__ */ h.jsx(Ef, { error: t.error })
    ] });
  }
  return null;
}
function Ef({ error: t, retry: a, active: i = !1 }) {
  const u = !a || a.status === "failed", o = i && a?.status === "inProgress", f = m2(t), m = u ? f.title : E("timeline.reconnecting", { attempt: a.attempt, max: a.maxAttempts }), p = u && !t.code ? t.message.replace(/\s+/g, " ").trim() : "", y = p ? `${m} — ${p}` : m, g = u ? ["dns_error", "connection_refused", "connection_reset", "timeout", "tls_error", "stream_error", "network_error"].includes(t.code ?? "") ? B3 : S0 : H3;
  return /* @__PURE__ */ h.jsx(oi, { className: `connection-activity-details${u ? " connection-activity-failed" : ""}`, summary: /* @__PURE__ */ h.jsxs("summary", { className: "tool-activity tool-row timeline-activity connection-activity", children: [
    /* @__PURE__ */ h.jsx(g, { size: 13, "aria-hidden": "true" }),
    /* @__PURE__ */ h.jsx(Ha, { text: y, active: o, className: "tool-label", title: y, role: u ? "alert" : o ? "status" : void 0 }),
    /* @__PURE__ */ h.jsx(ta, { className: "tool-detail-chevron", size: 12, "aria-hidden": "true" })
  ] }), children: /* @__PURE__ */ h.jsx(jT, { error: t, guidance: u ? f.message : void 0 }) });
}
function jT({ error: t, guidance: a }) {
  const [i, u] = R.useState("idle"), o = i === "copied";
  R.useEffect(() => {
    u("idle");
  }, [t]), R.useEffect(() => {
    if (!o) return;
    const p = window.setTimeout(() => u("idle"), 1500);
    return () => window.clearTimeout(p);
  }, [o]);
  const f = h2(t);
  async function m() {
    try {
      await navigator.clipboard.writeText(Yx(t)), u("copied");
    } catch {
      u("failed");
    }
  }
  return /* @__PURE__ */ h.jsxs("div", { className: "connection-activity-diagnostics", children: [
    a ? /* @__PURE__ */ h.jsx("p", { className: "connection-activity-guidance", children: a }) : null,
    /* @__PURE__ */ h.jsx("dl", { className: "connection-activity-error", children: f.map(([p, y], g) => /* @__PURE__ */ h.jsxs("div", { children: [
      /* @__PURE__ */ h.jsx("dt", { children: p }),
      /* @__PURE__ */ h.jsx("dd", { children: y })
    ] }, `${p}:${g}`)) }),
    i === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "connection-activity-guidance", role: "status", children: E("timeline.copyFailed") }) : null,
    /* @__PURE__ */ h.jsx("button", { type: "button", className: "connection-activity-copy", "aria-label": E(o ? "timeline.diagnosticsCopied" : "timeline.copyDiagnostics"), title: E(o ? "common.copied" : "timeline.copyDiagnostics"), onClick: () => {
      m();
    }, children: o ? /* @__PURE__ */ h.jsx(ui, { size: 13, "aria-hidden": "true" }) : /* @__PURE__ */ h.jsx(jf, { size: 13, "aria-hidden": "true" }) })
  ] });
}
function T2({ item: t, completed: a = !1 }) {
  const i = a ? BT(t) : j2(t), u = i.icon, o = t.status === "preparing" && t.type === "dynamicToolCall" ? A2(t.tool) : i.label, f = _T(t), m = /* @__PURE__ */ h.jsxs("div", { className: `tool-activity tool-row${f ? " tool-row-expandable" : ""} timeline-activity tool-${t.status}`, children: [
    /* @__PURE__ */ h.jsx(u, { size: 13, "aria-hidden": "true" }),
    /* @__PURE__ */ h.jsx("span", { className: "tool-label", title: o, children: o }),
    t.type === "dynamicToolCall" && ["edit", "write"].includes(t.tool) && t.status === "completed" && t.lineChanges ? /* @__PURE__ */ h.jsx(Rf, { lines: t.lineChanges }) : null,
    f ? /* @__PURE__ */ h.jsx(ta, { className: "tool-detail-chevron", size: 12, "aria-hidden": "true" }) : null,
    /* @__PURE__ */ h.jsx("span", { className: "tool-result", "aria-label": t.status, children: t.status === "failed" ? /* @__PURE__ */ h.jsx(S0, { size: 12 }) : null })
  ] });
  return f ? /* @__PURE__ */ h.jsx(oi, { className: "tool-activity-details", summary: /* @__PURE__ */ h.jsx("summary", { children: m }), children: /* @__PURE__ */ h.jsx(MT, { item: t }) }) : m;
}
function MT({ item: t }) {
  const a = Ts(t.arguments);
  return t.type === "dynamicToolCall" && t.tool === "web_search" ? /* @__PURE__ */ h.jsx(NT, { item: t, args: a }) : t.type === "dynamicToolCall" && t.tool === "bash" ? /* @__PURE__ */ h.jsx(OT, { item: t, command: yt(a?.command) }) : t.type === "dynamicToolCall" && ["read", "grep", "find", "ls"].includes(t.tool) ? /* @__PURE__ */ h.jsx(LT, { item: t, args: a }) : t.type === "dynamicToolCall" && ["edit", "write"].includes(t.tool) ? /* @__PURE__ */ h.jsx(RT, { item: t, args: a }) : /* @__PURE__ */ h.jsx(wT, { item: t });
}
function NT({ item: t, args: a }) {
  const i = yt(a?.query);
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-details", children: [
    i ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.query"), children: /* @__PURE__ */ h.jsx("code", { children: i }) }) : null,
    t.webSearch ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.provider"), children: /* @__PURE__ */ h.jsx("code", { children: t.webSearch.providerName }) }) : null,
    t.webSearch?.fallbackFrom ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.fallback", { provider: IT(t.webSearch.fallbackFrom) }) }) : null,
    t.output ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.results"), children: /* @__PURE__ */ h.jsx("pre", { children: t.output }) }) : null,
    t.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.resultsTruncated") }) : null,
    !t.output && t.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-error", children: E("timeline.detail.webSearchFailed") }) : null
  ] });
}
function OT({ item: t, command: a }) {
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-details tool-shell-details", children: [
    /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.shell"), children: /* @__PURE__ */ h.jsxs("pre", { className: "tool-shell-command", children: [
      /* @__PURE__ */ h.jsx("span", { className: "tool-shell-prompt", children: "$" }),
      " ",
      a || E("timeline.detail.command")
    ] }) }),
    t.output ? /* @__PURE__ */ h.jsx("pre", { className: "tool-shell-output", children: t.output }) : null,
    t.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.outputTruncated") }) : null,
    !t.output && t.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-error", children: E("timeline.detail.commandFailed") }) : null
  ] });
}
function LT({ item: t, args: a }) {
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-details", children: [
    zT(t.tool, a),
    t.output ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.result"), children: /* @__PURE__ */ h.jsx("pre", { children: t.output }) }) : null,
    t.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.resultTruncated") }) : null,
    !t.output && t.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-error", children: E("timeline.detail.operationFailed") }) : null
  ] });
}
function RT({ item: t, args: a }) {
  const i = t.type === "dynamicToolCall" && t.status === "completed" ? t.fileDiff : void 0;
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-details", children: [
    /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.file"), children: /* @__PURE__ */ h.jsx("code", { children: yt(a?.path) || yt(a?.file_path) || E("timeline.detail.unknownFile") }) }),
    i ? /* @__PURE__ */ h.jsxs(Bt, { label: E("timeline.detail.diff"), children: [
      i.hunks.length ? /* @__PURE__ */ h.jsx(T0, { hunks: i.hunks }) : /* @__PURE__ */ h.jsx("p", { className: "turn-changes-note", children: E("checkpoints.sameLines") }),
      i.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.diffTruncated") }) : null
    ] }) : null,
    t.output ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.result"), children: /* @__PURE__ */ h.jsx("pre", { children: t.output }) }) : null,
    t.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.resultTruncated") }) : null,
    !t.output && t.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-error", children: E("timeline.detail.fileChangeFailed") }) : null
  ] });
}
function wT({ item: t }) {
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-details", children: [
    t.images?.length ? /* @__PURE__ */ h.jsx(DT, { images: t.images }) : null,
    t.arguments !== void 0 ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.input"), children: /* @__PURE__ */ h.jsx("pre", { children: kT(t.arguments) }) }) : null,
    t.output ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.output"), children: /* @__PURE__ */ h.jsx("pre", { children: t.output }) }) : null,
    t.truncated ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-truncated", children: E("timeline.detail.outputTruncated") }) : null,
    !t.output && t.status === "failed" ? /* @__PURE__ */ h.jsx("p", { className: "tool-details-error", children: E("timeline.detail.toolFailed") }) : null
  ] });
}
function DT({ images: t }) {
  return /* @__PURE__ */ h.jsx("div", { className: "tool-result-images", children: t.map((a, i) => /* @__PURE__ */ h.jsx(
    ad,
    {
      image: a,
      alt: a.name ?? (t.length === 1 ? E("timeline.detail.toolImage") : E("timeline.detail.toolImageNumber", { number: i + 1 }))
    },
    `${a.mediaType}:${i}`
  )) });
}
function zT(t, a) {
  const i = yt(a?.path) || yt(a?.file_path), u = yt(a?.pattern) || yt(a?.query);
  return t === "read" ? i ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.file"), children: /* @__PURE__ */ h.jsx("code", { children: i }) }) : null : u && i ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.search"), children: /* @__PURE__ */ h.jsx("code", { children: E("timeline.detail.queryIn", { query: u, path: i }) }) }) : u ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.search"), children: /* @__PURE__ */ h.jsx("code", { children: u }) }) : i ? /* @__PURE__ */ h.jsx(Bt, { label: E("timeline.detail.path"), children: /* @__PURE__ */ h.jsx("code", { children: i }) }) : null;
}
function Bt({ label: t, children: a }) {
  return /* @__PURE__ */ h.jsxs("div", { className: "tool-detail-block", children: [
    /* @__PURE__ */ h.jsx("span", { className: "tool-detail-label", children: t }),
    a
  ] });
}
function _T(t) {
  return t.status === "failed" || t.truncated ? !0 : t.type === "mcpToolCall" ? t.arguments !== void 0 || !!t.output || !!t.images?.length : t.tool === "bash" ? !!(yt(Ts(t.arguments)?.command) || t.output) : ["edit", "write"].includes(t.tool) ? !!(t.output || t.fileDiff) : ["read", "grep", "find", "ls"].includes(t.tool) ? !!t.output : t.arguments !== void 0 || !!t.output || !!t.images?.length;
}
function kT(t) {
  if (typeof t == "string") return t;
  try {
    return JSON.stringify(t, null, 2) ?? String(t);
  } catch {
    return String(t);
  }
}
function E2({ projectId: t, artifacts: a }) {
  return /* @__PURE__ */ h.jsx("div", { className: "tool-artifacts", children: a.map((i) => /* @__PURE__ */ h.jsx(UT, { projectId: t, artifact: i }, i.path)) });
}
function UT({ projectId: t, artifact: a }) {
  const [i, u] = R.useState(), [o, f] = nT(), m = R.useContext(aT);
  return R.useEffect(() => {
    if (!f || !m) return;
    let p = !1, y;
    return u(void 0), m(t, a.path).then((g) => {
      p || (y = URL.createObjectURL(g), u(y));
    }).catch(() => {
    }), () => {
      p = !0, y && URL.revokeObjectURL(y);
    };
  }, [a.path, t, f, m]), /* @__PURE__ */ h.jsx("div", { ref: o, className: "tool-artifact-preview", children: i ? a.type === "model" ? /* @__PURE__ */ h.jsx(gx, { source: i, label: E("timeline.generated3d"), minHeight: 320 }) : a.type === "video" ? /* @__PURE__ */ h.jsx("video", { className: "tool-artifact-video", src: i, controls: !0, preload: "metadata" }) : /* @__PURE__ */ h.jsx("img", { className: "tool-artifact-image", src: i, alt: E("timeline.generatedImage") }) : null });
}
function A2(t) {
  switch (t) {
    case "bash":
    case "read":
    case "write":
    case "edit":
    case "web_search":
    case "mcp":
    case "game_use":
    case "tool":
      return E(`timeline.preparing.${t}`);
    default:
      return E("timeline.preparing.other", { tool: t });
  }
}
function HT(t, a) {
  if (t.type === "mcpToolCall") return a;
  switch (t.tool) {
    case "edit":
    case "write":
      return E("timeline.group.edit");
    case "read":
      return E("timeline.group.read");
    case "grep":
    case "find":
      return E("timeline.group.search");
    case "ls":
      return E("timeline.group.list");
    case "web_search":
      return E("timeline.group.web");
    default:
      return t.status === "preparing" ? A2(t.tool) : a;
  }
}
function j2(t) {
  if (t.type === "mcpToolCall")
    return { icon: ld(t) === "godot" ? id : Of, label: o2(t) };
  const a = t.tool, i = t.arguments, u = Ts(i);
  switch (a) {
    case "bash":
      return { icon: fs, label: E("timeline.running", { command: yt(u?.command) || E("timeline.detail.command") }) };
    case "edit":
      return { icon: cs, label: fl("editing", u) };
    case "write":
      return { icon: za, label: fl("writing", u) };
    case "read":
      return { icon: za, label: fl("reading", u) };
    case "grep":
      return { icon: dl, label: ri("searchingFor", u) };
    case "find":
      return { icon: dl, label: ri("finding", u) };
    case "ls":
      return { icon: za, label: fl("listing", u) };
    case "web_search":
      return { icon: dl, label: ri("searchingWeb", u) };
    case "game_use":
      return { icon: Mf, label: M2(u, !1) };
    case "generate_image":
      return { icon: Nf, label: E("timeline.generatingImage") };
    default:
      return { icon: Lf, label: a };
  }
}
function BT(t) {
  if (t.type === "mcpToolCall")
    return { icon: ld(t) === "godot" ? id : Of, label: o2(t) };
  const a = t.tool, i = t.arguments, u = Ts(i);
  switch (a) {
    case "bash":
      return { icon: fs, label: E("timeline.ran", { command: yt(u?.command) || E("timeline.detail.command") }) };
    case "edit":
    case "write":
      return { icon: cs, label: fl("edited", u) };
    case "read":
      return { icon: za, label: fl("read", u) };
    case "grep":
      return { icon: dl, label: ri("searchedFor", u) };
    case "find":
      return { icon: dl, label: ri("searchedFor", u) };
    case "ls":
      return { icon: za, label: fl("listed", u) };
    case "web_search":
      return { icon: dl, label: ri("searchedWeb", u) };
    case "game_use":
      return { icon: Mf, label: M2(u, !0) };
    case "generate_image":
      return { icon: Nf, label: E("timeline.generatedImage") };
    default:
      return { icon: Lf, label: E("timeline.used", { tool: a }) };
  }
}
function M2(t, a) {
  const i = yt(t?.operation);
  switch (i) {
    case "open":
    case "inspect":
    case "capture":
    case "close":
      return E(`timeline.playtest.${i}.${a ? "done" : "running"}`);
    case "act": {
      const u = Array.isArray(t?.actions) ? t.actions.length : 0;
      return E(`timeline.playtest.${u === 1 ? "action" : "actions"}.${a ? "done" : "running"}`);
    }
    default:
      return E(`timeline.playtest.other.${a ? "done" : "running"}`);
  }
}
function IT(t) {
  return t === "exa" ? "Exa" : t === "parallel" ? "Parallel" : E("timeline.detail.customProvider");
}
function ri(t, a) {
  const i = yt(a?.pattern) || yt(a?.query), u = yt(a?.path) || yt(a?.file_path);
  return i && u ? E(`timeline.search.${t}.queryIn`, { query: i, target: u }) : i ? E(`timeline.search.${t}.query`, { query: i }) : u ? E(`timeline.search.${t}.filesIn`, { target: u }) : E(`timeline.search.${t}.files`);
}
function fl(t, a) {
  const i = yt(a?.path) || yt(a?.file_path);
  return i ? E(`timeline.target.${t}.with`, { target: i }) : E(`timeline.target.${t}.without`);
}
function Ts(t) {
  return t && typeof t == "object" && !Array.isArray(t) ? t : void 0;
}
function yt(t) {
  return typeof t == "string" ? t : "";
}
const qT = `
:host {
  --canvas: #FEFCF8;
  --surface: #FEFCF8;
  --surface-raised: #FFFFFF;
  --surface-hover: #F8F4EB;
  --border: rgba(34,29,22,.10);
  --border-strong: rgba(34,29,22,.18);
  --scrollbar-thumb: rgba(34,29,22,.14);
  --scrollbar-thumb-hover: rgba(34,29,22,.24);
  --search-border: rgba(34,29,22,.10);
  --text: #221D16;
  --text-secondary: #5E5447;
  --text-muted: #7B7160;
  --text-faint: #938979;
  --accent: #221D16;
  --accent-ink: #FEFCF8;
  --success: #4F7A54;
  --diff-added: #4F7A54;
  --diff-removed: #A34A3C;
  --danger: #A34A3C;
  --warning: #9A6B1F;
  --radius: 8px;
  --radius-panel: 10px;
  --theme-accent: #A8842E;
  --theme-accent-hover: #8C6C22;
  --composer-accent: #A8842E;
  --composer-accent-hover: #8C6C22;
  --composer-border: rgba(34,29,22,.14);
  --composer-surface: #F8F4EB;
  --menu-border: rgba(34,29,22,.10);
  --menu-hover: rgba(34,29,22,.04);
  --menu-shadow: 0 2px 8px rgba(34,29,22,.06);
  --menu-surface: #FFFFFF;
  --control-surface: #F8F4EB;
  --control-selected: #F1E9DA;
  --content-column-width: 760px;
  color-scheme: light;
  display: block;
  height: 100%;
  min-height: 0;
  font-family: "Noto Sans SC", -apple-system, "Segoe UI", sans-serif;
}
.chat-host { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--canvas); color: var(--text); }
.chat-host * { box-sizing: border-box; }
/* 输入框：参考项目的 .composer 是 sticky 底栏，沙盒里改成常驻块 */
.composer-shell { position: static; display: block; padding: 0; background: transparent; }
.composer-shell .prompt-box { box-shadow: none; }
.composer-shell textarea { color: var(--text); }
.composer-shell textarea::placeholder { color: var(--text-faint); }
.composer-shell .send-button {
  display: grid; place-items: center; width: 30px; height: 30px; padding: 0;
  border: 0; border-radius: 50%; cursor: pointer;
  background: var(--composer-accent); color: #FEFCF8;
}
.composer-shell .send-button:hover:not(:disabled) { background: var(--composer-accent-hover); }
.composer-shell .send-button:disabled { opacity: .45; cursor: not-allowed; }
/* 规则 ID / 代码片段不要从中间折行（XS-T-JIESUAN-HUAMIAN 曾被拆成两行） */
.markdown-content code { white-space: nowrap; }
/* 用户气泡、编辑器等也写死了深色值，统一改纸色 */
.user-message { background: #F1E9DA; color: #221D16; }
.user-message-editor { background: #FFFFFF; border: .5px solid rgba(34,29,22,.10); }
.user-message-actions button { color: #938979; }
/* 参考项目把标题/代码/链接写死成深色值，纸色下要改回浅底深字 */
.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { color: var(--text); }
.markdown-content code { background: #F1E9DA; color: #7A4A16; }
.markdown-content a { color: #8C6C22; }
`, nf = /* @__PURE__ */ new WeakMap();
function N2(t, a) {
  const i = t.shadowRoot ?? t.attachShadow({ mode: "open" });
  if (a && !i.querySelector("link[data-cap]")) {
    const o = document.createElement("link");
    o.rel = "stylesheet", o.dataset.cap = "1", o.href = a, i.appendChild(o);
  }
  let u = i.querySelector("style[data-cap]");
  return u || (u = document.createElement("style"), u.dataset.cap = "1", u.textContent = qT), i.appendChild(u), i;
}
function $T(t, a) {
  const i = nf.get(t);
  if (i)
    return i.applyTurns(a.turns), i;
  const u = N2(t, a.cssUrl);
  let o = u.querySelector(".chat-host");
  o || (o = document.createElement("div"), o.className = "chat-host", u.appendChild(o));
  const f = v0.createRoot(o), m = (y) => f.render(/* @__PURE__ */ h.jsx(lT, { turns: y }));
  m(a.turns), mt.changeLanguage(a.language ?? "zh-CN").then(() => m(a.turns));
  const p = {
    applyTurns: m,
    dispose: () => {
      nf.delete(t), f.unmount();
    },
    shadowRoot: u
  };
  return nf.set(t, p), p;
}
const af = /* @__PURE__ */ new WeakMap();
function GT() {
  return R.createElement(
    "svg",
    { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" },
    R.createElement("path", { d: "M12 19V5M5 12l7-7 7 7" })
  );
}
function FT(t) {
  const { state: a, onChange: i, onSend: u } = t, o = R.useRef(null);
  R.useEffect(() => {
    const m = o.current;
    m && (m.style.height = "auto", m.style.height = Math.min(m.scrollHeight + 1, 132) + "px");
  }, [a.value]);
  const f = () => {
    a.disabled || !a.value.trim() || u();
  };
  return R.createElement(
    "form",
    {
      className: "composer composer-shell",
      onSubmit: (m) => {
        m.preventDefault(), f();
      }
    },
    R.createElement(
      "div",
      { className: "prompt-box prompt-box-project" },
      R.createElement(
        "div",
        { className: "prompt-box-input" },
        R.createElement(
          "div",
          { className: "prompt-box-editor" },
          R.createElement("textarea", {
            ref: o,
            rows: 1,
            value: a.value,
            disabled: a.disabled,
            placeholder: a.placeholder,
            "aria-label": a.placeholder,
            onChange: (m) => i(m.target.value),
            onKeyDown: (m) => {
              m.key !== "Enter" || m.shiftKey || m.nativeEvent.isComposing || (m.preventDefault(), f());
            }
          })
        )
      ),
      R.createElement(
        "div",
        { className: "prompt-box-toolbar" },
        R.createElement("div", { className: "prompt-box-leading" }),
        R.createElement(
          "div",
          { className: "prompt-box-actions" },
          R.createElement(
            "button",
            { type: "submit", className: "send-button", disabled: a.disabled || !a.value.trim(), title: "发送", "aria-label": "发送" },
            R.createElement(GT)
          )
        )
      )
    )
  );
}
function VT(t, a) {
  const i = af.get(t);
  if (i) return i;
  const u = N2(t, a.cssUrl);
  let o = u.querySelector(".composer-host");
  o || (o = document.createElement("div"), o.className = "composer-host", u.appendChild(o));
  let f = { value: "", disabled: !1, placeholder: a.placeholder ?? "问点什么，回车发送" };
  const m = v0.createRoot(o), p = () => {
    m.render(
      R.createElement(FT, {
        state: f,
        onChange: (g) => {
          f = { ...f, value: g }, p();
        },
        onSend: () => {
          const g = f.value;
          f = { ...f, value: "" }, p(), a.onSend(g);
        }
      })
    );
  };
  p(), mt.changeLanguage("zh-CN");
  const y = {
    setDisabled: (g) => {
      f.disabled !== g && (f = { ...f, disabled: g }, p());
    },
    setPlaceholder: (g) => {
      f.placeholder !== g && (f = { ...f, placeholder: g }, p());
    },
    clear: () => {
      f = { ...f, value: "" }, p();
    },
    focus: () => {
      o?.querySelector("textarea")?.focus();
    },
    dispose: () => {
      af.delete(t), m.unmount();
    },
    shadowRoot: u
  };
  return af.set(t, y), y;
}
export {
  $T as mountChat,
  VT as mountComposer
};
