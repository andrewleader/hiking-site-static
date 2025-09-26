

/* === src/lib/goog-shim.js === */
/**
 * Minimal Google Closure Library emulation for BetaCreator
 * This provides just enough functionality to run the original BetaCreator code
 */

// Global namespace
window.goog = window.goog || {};

// Debug flags
goog.DEBUG = false;
goog.STRICT_MODE_COMPATIBLE = true;

// goog.provide - register a namespace
goog.provide = function(name) {
  const parts = name.split('.');
  let current = window;
  for (let i = 0; i < parts.length; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
};

// goog.require - no-op for our purposes
goog.require = function(name) {
  // In a real implementation, this would load dependencies
  // For our wrapper, we'll load everything in the right order
};

// goog.dom utilities
goog.dom = {
  createElement: function(tagName) {
    return document.createElement(tagName);
  },
  
  TagName: {
    CANVAS: 'canvas',
    DIV: 'div',
    SPAN: 'span',
    INPUT: 'input',
    BUTTON: 'button',
    A: 'a',
    IMG: 'img',
    P: 'p',
    BR: 'br',
    TABLE: 'table',
    TR: 'tr',
    TD: 'td',
    TH: 'th',
    TBODY: 'tbody',
    THEAD: 'thead',
    UL: 'ul',
    LI: 'li',
    SELECT: 'select',
    OPTION: 'option',
    FORM: 'form',
    LABEL: 'label'
  },
  
  appendChild: function(parent, child) {
    parent.appendChild(child);
    return child;
  },
  
  replaceNode: function(newNode, oldNode) {
    if (oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }
    return newNode;
  },
  
  removeNode: function(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return node;
  },
  
  getElement: function(id) {
    return document.getElementById(id);
  },
  
  getElementsByTagName: function(tagName, opt_parent) {
    const parent = opt_parent || document;
    return parent.getElementsByTagName(tagName);
  },
  
  getElementsByClass: function(className, opt_parent) {
    const parent = opt_parent || document;
    return parent.getElementsByClassName(className);
  },
  
  getChildren: function(element) {
    if (element.children) {
      return Array.prototype.slice.call(element.children);
    } else {
      // Fallback for older browsers
      const children = [];
      let child = element.firstChild;
      while (child) {
        if (child.nodeType === 1) { // Element node
          children.push(child);
        }
        child = child.nextSibling;
      }
      return children;
    }
  },
  
  createTextNode: function(text) {
    return document.createTextNode(text);
  },
  
  insertSiblingBefore: function(newNode, refNode) {
    if (refNode.parentNode) {
      refNode.parentNode.insertBefore(newNode, refNode);
    }
    return newNode;
  },
  
  insertSiblingAfter: function(newNode, refNode) {
    if (refNode.parentNode) {
      refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    }
    return newNode;
  },
  
  createDom: function(tagName, opt_attributes, var_args) {
    var element = document.createElement(tagName);
    
    // Set attributes if provided
    if (opt_attributes) {
      if (typeof opt_attributes === 'string' || typeof opt_attributes === 'number') {
        // If it's a string/number, treat it as className
        if (opt_attributes) {
          element.className = String(opt_attributes);
        }
      } else if (opt_attributes) {
        // If it's an object, set each property as an attribute
        for (var key in opt_attributes) {
          if (opt_attributes.hasOwnProperty(key)) {
            var value = opt_attributes[key];
            if (key === 'style' && typeof value === 'object') {
              // Handle style object
              for (var styleKey in value) {
                if (value.hasOwnProperty(styleKey)) {
                  element.style[styleKey] = value[styleKey];
                }
              }
            } else if (key === 'class' || key === 'className') {
              element.className = value;
            } else {
              element.setAttribute(key, value);
            }
          }
        }
      }
    }
    
    // Add children if provided
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child) {
        if (typeof child === 'string' || typeof child === 'number') {
          element.appendChild(document.createTextNode(String(child)));
        } else if (child.nodeType) {
          element.appendChild(child);
        } else if (goog.isArrayLike(child)) {
          // Handle arrays of children
          for (var j = 0; j < child.length; j++) {
            if (child[j]) {
              if (typeof child[j] === 'string' || typeof child[j] === 'number') {
                element.appendChild(document.createTextNode(String(child[j])));
              } else if (child[j].nodeType) {
                element.appendChild(child[j]);
              }
            }
          }
        }
      }
    }
    
    return element;
  },
  
  setProperties: function(element, properties) {
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        var value = properties[key];
        if (key === 'style' && typeof value === 'object') {
          for (var styleKey in value) {
            if (value.hasOwnProperty(styleKey)) {
              element.style[styleKey] = value[styleKey];
            }
          }
        } else if (key === 'class' || key === 'className') {
          element.className = value;
        } else {
          element.setAttribute(key, value);
        }
      }
    }
  },
  
  getElementByClass: function(className, opt_parent) {
    var parent = opt_parent || document;
    return parent.getElementsByClassName(className)[0] || null;
  },
  
  findNode: function(root, predicate) {
    var stack = [root];
    while (stack.length > 0) {
      var node = stack.pop();
      if (predicate(node)) {
        return node;
      }
      if (node.childNodes) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
          stack.push(node.childNodes[i]);
        }
      }
    }
    return null;
  },
  
  contains: function(parent, descendant) {
    if (parent === descendant) {
      return false;
    }
    if (parent.contains) {
      return parent.contains(descendant);
    }
    // Fallback for older browsers
    while (descendant && descendant !== parent) {
      descendant = descendant.parentNode;
    }
    return descendant === parent;
  },
  
  getTextContent: function(node) {
    if (node.textContent !== undefined) {
      return node.textContent;
    }
    if (node.innerText !== undefined) {
      return node.innerText;
    }
    var text = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType === 3) { // Text node
        text += child.nodeValue;
      } else if (child.nodeType === 1) { // Element node
        text += goog.dom.getTextContent(child);
      }
    }
    return text;
  },
  
  setTextContent: function(element, text) {
    if (element.textContent !== undefined) {
      element.textContent = text;
    } else {
      element.innerText = text;
    }
  }
};

// goog.dom.TagName - HTML tag name constants
goog.dom.TagName = {
  A: 'a',
  ABBR: 'abbr',
  ACRONYM: 'acronym',
  ADDRESS: 'address',
  APPLET: 'applet',
  AREA: 'area',
  ARTICLE: 'article',
  ASIDE: 'aside',
  AUDIO: 'audio',
  B: 'b',
  BASE: 'base',
  BASEFONT: 'basefont',
  BDI: 'bdi',
  BDO: 'bdo',
  BIG: 'big',
  BLOCKQUOTE: 'blockquote',
  BODY: 'body',
  BR: 'br',
  BUTTON: 'button',
  CANVAS: 'canvas',
  CAPTION: 'caption',
  CENTER: 'center',
  CITE: 'cite',
  CODE: 'code',
  COL: 'col',
  COLGROUP: 'colgroup',
  COMMAND: 'command',
  DATA: 'data',
  DATALIST: 'datalist',
  DD: 'dd',
  DEL: 'del',
  DETAILS: 'details',
  DFN: 'dfn',
  DIALOG: 'dialog',
  DIR: 'dir',
  DIV: 'div',
  DL: 'dl',
  DT: 'dt',
  EM: 'em',
  EMBED: 'embed',
  FIELDSET: 'fieldset',
  FIGCAPTION: 'figcaption',
  FIGURE: 'figure',
  FONT: 'font',
  FOOTER: 'footer',
  FORM: 'form',
  FRAME: 'frame',
  FRAMESET: 'frameset',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  HEAD: 'head',
  HEADER: 'header',
  HGROUP: 'hgroup',
  HR: 'hr',
  HTML: 'html',
  I: 'i',
  IFRAME: 'iframe',
  IMG: 'img',
  INPUT: 'input',
  INS: 'ins',
  ISINDEX: 'isindex',
  KBD: 'kbd',
  KEYGEN: 'keygen',
  LABEL: 'label',
  LEGEND: 'legend',
  LI: 'li',
  LINK: 'link',
  MAP: 'map',
  MARK: 'mark',
  MATH: 'math',
  MENU: 'menu',
  META: 'meta',
  METER: 'meter',
  NAV: 'nav',
  NOFRAMES: 'noframes',
  NOSCRIPT: 'noscript',
  OBJECT: 'object',
  OL: 'ol',
  OPTGROUP: 'optgroup',
  OPTION: 'option',
  OUTPUT: 'output',
  P: 'p',
  PARAM: 'param',
  PRE: 'pre',
  PROGRESS: 'progress',
  Q: 'q',
  RP: 'rp',
  RT: 'rt',
  RUBY: 'ruby',
  S: 's',
  SAMP: 'samp',
  SCRIPT: 'script',
  SECTION: 'section',
  SELECT: 'select',
  SMALL: 'small',
  SOURCE: 'source',
  SPAN: 'span',
  STRIKE: 'strike',
  STRONG: 'strong',
  STYLE: 'style',
  SUB: 'sub',
  SUMMARY: 'summary',
  SUP: 'sup',
  SVG: 'svg',
  TABLE: 'table',
  TBODY: 'tbody',
  TD: 'td',
  TEXTAREA: 'textarea',
  TFOOT: 'tfoot',
  TH: 'th',
  THEAD: 'thead',
  TIME: 'time',
  TITLE: 'title',
  TR: 'tr',
  TRACK: 'track',
  TT: 'tt',
  U: 'u',
  UL: 'ul',
  VAR: 'var',
  VIDEO: 'video',
  WBR: 'wbr'
};

// goog.style utilities
goog.style = {
  setStyle: function(element, properties) {
    for (const prop in properties) {
      if (properties.hasOwnProperty(prop)) {
        element.style[prop] = properties[prop];
      }
    }
  },
  
  getBorderBoxSize: function(element) {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  },
  
  getSize: function(element) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }
};

// goog.events utilities
goog.events = {
  EventType: {
    CLICK: 'click',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
    MOUSEMOVE: 'mousemove',
    MOUSEOVER: 'mouseover',
    MOUSEOUT: 'mouseout',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    KEYPRESS: 'keypress',
    LOAD: 'load',
    RESIZE: 'resize',
    CHANGE: 'change',
    BLUR: 'blur',
    FOCUS: 'focus'
  },
  
  KeyCodes: {
    WIN_KEY_FF_LINUX: 0,
    MAC_ENTER: 3,
    BACKSPACE: 8,
    TAB: 9,
    NUM_CENTER: 12,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PLUS_SIGN: 43,
    PRINT_SCREEN: 44,
    INSERT: 45,
    DELETE: 46,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
    FF_SEMICOLON: 59,
    FF_EQUALS: 61,
    QUESTION_MARK: 63,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    META: 91,
    WIN_KEY_RIGHT: 92,
    CONTEXT_MENU: 93,
    NUM_ZERO: 96,
    NUM_ONE: 97,
    NUM_TWO: 98,
    NUM_THREE: 99,
    NUM_FOUR: 100,
    NUM_FIVE: 101,
    NUM_SIX: 102,
    NUM_SEVEN: 103,
    NUM_EIGHT: 104,
    NUM_NINE: 105,
    NUM_MULTIPLY: 106,
    NUM_PLUS: 107,
    NUM_MINUS: 109,
    NUM_PERIOD: 110,
    NUM_DIVISION: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUMLOCK: 144,
    SCROLL_LOCK: 145,
    SEMICOLON: 186,
    DASH: 189,
    EQUALS: 187,
    COMMA: 188,
    PERIOD: 190,
    SLASH: 191,
    APOSTROPHE: 192,
    TILDE: 192,
    SINGLE_QUOTE: 222,
    OPEN_SQUARE_BRACKET: 219,
    BACKSLASH: 220,
    CLOSE_SQUARE_BRACKET: 221,
    WIN_KEY: 224,
    MAC_FF_META: 224,
    WIN_IME: 229,
    PHANTOM: 255
  },
  
  listen: function(element, eventType, handler, capture, scope) {
    const wrappedHandler = scope ? handler.bind(scope) : handler;
    element.addEventListener(eventType, wrappedHandler, capture || false);
    
    // Return a simple key object for removal
    return {
      element: element,
      eventType: eventType,
      handler: wrappedHandler
    };
  },
  
  unlistenByKey: function(key) {
    if (key && key.element && key.eventType && key.handler) {
      key.element.removeEventListener(key.eventType, key.handler);
    }
  }
};

// goog.array utilities
goog.array = {
  forEach: function(array, fn, scope) {
    for (let i = 0; i < array.length; i++) {
      fn.call(scope, array[i], i, array);
    }
  },
  
  map: function(array, fn, scope) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      result[i] = fn.call(scope, array[i], i, array);
    }
    return result;
  },
  
  filter: function(array, fn, scope) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      if (fn.call(scope, array[i], i, array)) {
        result.push(array[i]);
      }
    }
    return result;
  },
  
  find: function(array, fn, scope) {
    for (let i = 0; i < array.length; i++) {
      if (fn.call(scope, array[i], i, array)) {
        return array[i];
      }
    }
    return null;
  },
  
  indexOf: function(array, item) {
    return array.indexOf(item);
  },
  
  remove: function(array, item) {
    const index = array.indexOf(item);
    if (index >= 0) {
      array.splice(index, 1);
      return true;
    }
    return false;
  }
};

// goog.string utilities
goog.string = {
  stripQuotes: function(str, quotes) {
    const quoteChars = quotes || '"\'';
    if (str.length >= 2) {
      const first = str.charAt(0);
      const last = str.charAt(str.length - 1);
      if (quoteChars.indexOf(first) >= 0 && first === last) {
        return str.substring(1, str.length - 1);
      }
    }
    return str;
  },
  
  quote: function(str) {
    return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
};

// goog.json utilities
goog.json = {
  serialize: function(obj) {
    return JSON.stringify(obj);
  },
  
  parse: function(str) {
    return JSON.parse(str);
  }
};

// goog.isNumber utility
goog.isNumber = function(val) {
  return typeof val === 'number' && !isNaN(val);
};

// goog.isString utility
goog.isString = function(val) {
  return typeof val === 'string';
};

// goog.isDef utility
goog.isDef = function(val) {
  return val !== undefined;
};

// goog.isNull utility
goog.isNull = function(val) {
  return val === null;
};

// goog.pubsub.PubSub - Simple publish/subscribe
goog.pubsub = {};
goog.pubsub.PubSub = function() {
  this.topics_ = {};
};

goog.pubsub.PubSub.prototype.subscribe = function(topic, fn, context) {
  if (!this.topics_[topic]) {
    this.topics_[topic] = [];
  }
  this.topics_[topic].push({
    fn: fn,
    context: context
  });
};

goog.pubsub.PubSub.prototype.publish = function(topic, ...args) {
  if (this.topics_[topic]) {
    this.topics_[topic].forEach(subscriber => {
      if (subscriber.context) {
        subscriber.fn.apply(subscriber.context, args);
      } else {
        subscriber.fn(...args);
      }
    });
  }
};

// goog.inherits - inheritance helper
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};

// goog.base - call parent constructor/method
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  
  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error('arguments.caller not defined. goog.base() cannot be used ' +
               'with strict mode code. See ' +
               'http://www.ecmascript.org/docs.php?file=clarification.txt');
  }

  if (caller.superClass_) {
    // Calling the super constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};

// goog.bind - function binding
goog.bind = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};

// goog.partial - partial function application
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};

// goog.nullFunction - empty function
goog.nullFunction = function() {};

// goog.abstractMethod - throws error for abstract methods
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};

// goog.addSingletonGetter - add getInstance method
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};

// goog.typeOf - better typeof
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }
      var className = Object.prototype.toString.call(value);
      if (className == '[object Window]') {
        return 'object';
      }
      if ((className == '[object Array]' ||
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice'))) {
        return 'array';
      }
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }
    } else {
      return 'null';
    }
  } else if (s == 'function' && typeof value.call == 'undefined') {
    return 'object';
  }
  return s;
};

// goog.isArrayLike - check if value is array-like
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};

// goog.isDateLike - check if value is date-like
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};

// goog.isFunction - check if value is function
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};

// goog.isObject - check if value is object
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
};

// goog.getUid - get unique id for object
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};

goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);
goog.uidCounter_ = 0;

// goog.removeUid - remove unique id from object
goog.removeUid = function(obj) {
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};

// goog.math namespace and utilities
goog.math = {};

// goog.math.Coordinate - 2D coordinate class
goog.math.Coordinate = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};

goog.math.Coordinate.prototype.toString = function() {
  return '(' + this.x + ', ' + this.y + ')';
};

goog.math.Coordinate.prototype.equals = function(other) {
  return other instanceof goog.math.Coordinate && 
         this.x == other.x && this.y == other.y;
};

goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};

goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y);
};

goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};

goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};

goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};

// goog.math utility functions
goog.math.angle = function(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(degrees * Math.PI / 180);
};

goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(degrees * Math.PI / 180);
};

goog.math.standardAngle = function(angle) {
  return (angle % 360 + 360) % 360;
};

goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};

goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};

// goog.math.Box - bounding box class
goog.math.Box = function(top, right, bottom, left) {
  this.top = top || 0;
  this.right = right || 0;
  this.bottom = bottom || 0;
  this.left = left || 0;
};

goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left);
};

goog.math.Box.prototype.toString = function() {
  return '(' + this.top + 't, ' + this.right + 'r, ' + 
         this.bottom + 'b, ' + this.left + 'l)';
};

goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other);
};

goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if (goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left;
  } else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left;
  }
  return this;
};

goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom);
};

goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, 
                             arguments[0].y, arguments[0].x);
  for (var i = 1; i < arguments.length; i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x);
  }
  return box;
};

goog.math.Box.contains = function(box, other) {
  if (!box || !other) {
    return false;
  }
  
  if (other instanceof goog.math.Box) {
    return other.left >= box.left && other.right <= box.right &&
           other.top >= box.top && other.bottom <= box.bottom;
  }
  
  return other.x >= box.left && other.x <= box.right &&
         other.y >= box.top && other.y <= box.bottom;
};

// goog.math.Size - size class
goog.math.Size = function(width, height) {
  this.width = width || 0;
  this.height = height || 0;
};

goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};

goog.math.Size.prototype.toString = function() {
  return '(' + this.width + ' x ' + this.height + ')';
};

goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};

goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};

goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};

goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};

goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};

goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};

goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};

goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};

goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};

goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};

goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this;
};

goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width : target.height / this.height;
  return this.scale(s);
};

// goog.exportSymbol - export to global namespace
goog.exportSymbol = function(name, obj) {
  const parts = name.split('.');
  let current = window;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = obj;
};

// goog.color utilities
goog.color = {};

goog.color.parse = function(str) {
  var result = {};
  str = String(str);

  var maybeHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(str);
  if (maybeHex) {
    var hex = maybeHex[1];
    if (hex.length == 3) {
      result.hex = '#' + hex.charAt(0) + hex.charAt(0) +
                         hex.charAt(1) + hex.charAt(1) +
                         hex.charAt(2) + hex.charAt(2);
    } else {
      result.hex = '#' + hex;
    }
    return result;
  }

  var maybeRgb = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(str);
  if (maybeRgb) {
    var r = parseInt(maybeRgb[1], 10);
    var g = parseInt(maybeRgb[2], 10);
    var b = parseInt(maybeRgb[3], 10);
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      result.hex = goog.color.rgbArrayToHex([r, g, b]);
      return result;
    }
  }
  
  throw Error(str + ' is not a valid color string');
};

goog.color.hexToRgb = function(hexColor) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);  
  var b = parseInt(hexColor.substr(5, 2), 16);
  return [r, g, b];
};

goog.color.rgbToHex = function(r, g, b) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if (r != (r & 255) || g != (g & 255) || b != (b & 255)) {
    throw Error('"(' + r + ',' + g + ',' + b + '") is not a valid RGB color');
  }
  var hexR = goog.color.prependZeroIfNecessaryHelper(r.toString(16));
  var hexG = goog.color.prependZeroIfNecessaryHelper(g.toString(16));
  var hexB = goog.color.prependZeroIfNecessaryHelper(b.toString(16));
  return '#' + hexR + hexG + hexB;
};

goog.color.rgbArrayToHex = function(rgb) {
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2]);
};

goog.color.normalizeHex = function(hexColor) {
  if (!goog.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if (hexColor.length == 4) {
    hexColor = hexColor.replace(/(.)/g, '$1$1');
  }
  return hexColor.toUpperCase();
};

goog.color.isValidHexColor_ = function(str) {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(str);
};

goog.color.prependZeroIfNecessaryHelper = function(hex) {
  return hex.length == 1 ? '0' + hex : hex;
};

goog.color.hexToRgbStyle = function(hexColor) {
  var rgb = goog.color.hexToRgb(hexColor);
  return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
};

goog.color.rgbToHsl = function(r, g, b) {
  // Normalize RGB values
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), s, l];
};

goog.color.hslToRgb = function(h, s, l) {
  // Normalize hue
  h = (h % 360 + 360) % 360;
  h /= 360;

  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

goog.color.rgbArrayToHsv = function(rgb) {
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);
};

goog.color.rgbToHsv = function(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), s, Math.round(v * 255)];
};

goog.color.hsvToRgb = function(h, s, v) {
  h = (h % 360 + 360) % 360;
  h /= 60;
  
  var c = v * s;
  var x = c * (1 - Math.abs(h % 2 - 1));
  var m = v - c;
  
  var r, g, b;
  if (h >= 0 && h < 1) {
    r = c; g = x; b = 0;
  } else if (h >= 1 && h < 2) {
    r = x; g = c; b = 0;
  } else if (h >= 2 && h < 3) {
    r = 0; g = c; b = x;
  } else if (h >= 3 && h < 4) {
    r = 0; g = x; b = c;
  } else if (h >= 4 && h < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255), 
    Math.round((b + m) * 255)
  ];
};

goog.color.highContrast = function(prime, rgba) {
  var primeBrightness = goog.color.yiqBrightness_(prime);
  var minDistance = Number.MAX_VALUE;
  var bestColor = null;
  
  for (var i = 0; i < rgba.length; i++) {
    var color = rgba[i];
    var distance = Math.abs(goog.color.yiqBrightness_(color) - primeBrightness);
    if (distance > minDistance) {
      minDistance = distance;
      bestColor = color;
    }
  }
  
  return bestColor || rgba[0];
};

goog.color.yiqBrightness_ = function(rgb) {
  return Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000);
};

// goog.color.alpha utilities
goog.color.alpha = {};

goog.color.alpha.parse = function(str) {
  var result = {};
  str = String(str);

  var maybeHex = /^#([0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/.exec(str);
  if (maybeHex) {
    var hex = maybeHex[1];
    if (hex.length == 4) {
      result.hex = '#' + hex.charAt(0) + hex.charAt(0) +
                         hex.charAt(1) + hex.charAt(1) +
                         hex.charAt(2) + hex.charAt(2) +
                         hex.charAt(3) + hex.charAt(3);
    } else {
      result.hex = '#' + hex;
    }
    return result;
  }

  // Try parsing as regular hex and add full alpha
  try {
    var regularColor = goog.color.parse(str);
    result.hex = regularColor.hex + 'ff';
    return result;
  } catch (e) {
    // Continue to other formats
  }

  var maybeRgba = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(str);
  if (maybeRgba) {
    var r = parseInt(maybeRgba[1], 10);
    var g = parseInt(maybeRgba[2], 10);
    var b = parseInt(maybeRgba[3], 10);
    var a = parseFloat(maybeRgba[4]);
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) {
      result.hex = goog.color.alpha.rgbaArrayToHex([r, g, b, a]);
      return result;
    }
  }

  throw Error(str + ' is not a valid alpha color string');
};

goog.color.alpha.hexToRgba = function(hexColor) {
  hexColor = goog.color.alpha.normalizeAlphaHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);
  var b = parseInt(hexColor.substr(5, 2), 16);
  var a = parseInt(hexColor.substr(7, 2), 16) / 255;
  return [r, g, b, a];
};

goog.color.alpha.rgbaToHex = function(r, g, b, a) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  a = Number(a);
  if (r != (r & 255) || g != (g & 255) || b != (b & 255) || a < 0 || a > 1) {
    throw Error('"(' + r + ',' + g + ',' + b + ',' + a + '") is not a valid RGBA color');
  }
  var alphaHex = Math.round(a * 255).toString(16);
  if (alphaHex.length == 1) {
    alphaHex = '0' + alphaHex;
  }
  return goog.color.rgbToHex(r, g, b) + alphaHex;
};

goog.color.alpha.rgbaArrayToHex = function(rgba) {
  return goog.color.alpha.rgbaToHex(rgba[0], rgba[1], rgba[2], rgba[3]);
};

goog.color.alpha.rgbaArrayToRgbaStyle = function(rgba) {
  return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
};

goog.color.alpha.hexToRgbaStyle = function(hexColor) {
  var rgba = goog.color.alpha.hexToRgba(hexColor);
  return goog.color.alpha.rgbaArrayToRgbaStyle(rgba);
};

goog.color.alpha.normalizeAlphaHex = function(hexColor) {
  if (!goog.color.alpha.isValidAlphaHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid alpha hex color");
  }
  if (hexColor.length == 5) {
    hexColor = hexColor.replace(/(.)/g, '$1$1');
  }
  return hexColor.toUpperCase();
};

goog.color.alpha.isValidAlphaHexColor_ = function(str) {
  return /^#([0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/.test(str);
};

// goog.math utility functions
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

// goog.array utilities
goog.array = {};

goog.array.forEach = function(arr, f, opt_obj) {
  if (Array.prototype.forEach && arr.forEach === Array.prototype.forEach) {
    arr.forEach(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        f.call(opt_obj, arr2[i], i, arr);
      }
    }
  }
};

goog.array.map = function(arr, f, opt_obj) {
  if (Array.prototype.map && arr.map === Array.prototype.map) {
    return arr.map(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const res = new Array(l);
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        res[i] = f.call(opt_obj, arr2[i], i, arr);
      }
    }
    return res;
  }
};

goog.array.filter = function(arr, f, opt_obj) {
  if (Array.prototype.filter && arr.filter === Array.prototype.filter) {
    return arr.filter(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const res = [];
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        const val = arr2[i];  // in case f mutates arr2
        if (f.call(opt_obj, val, i, arr)) {
          res.push(val);
        }
      }
    }
    return res;
  }
};

goog.array.indexOf = function(arr, obj, opt_fromIndex) {
  if (Array.prototype.indexOf && arr.indexOf === Array.prototype.indexOf) {
    return arr.indexOf(obj, opt_fromIndex);
  } else {
    const fromIndex = opt_fromIndex == null ? 0 : Math.max(0, opt_fromIndex);
    if (typeof arr === 'string') {
      return typeof obj === 'string' && obj.length == 1 ?
          arr.indexOf(obj, fromIndex) : -1;
    }
    for (let i = fromIndex; i < arr.length; i++) {
      if (i in arr && arr[i] === obj)
        return i;
    }
    return -1;
  }
};

goog.array.find = function(arr, f, opt_obj) {
  if (Array.prototype.find && arr.find === Array.prototype.find) {
    return arr.find(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        const val = arr2[i];  // in case f mutates arr2
        if (f.call(opt_obj, val, i, arr)) {
          return val;
        }
      }
    }
    return undefined;
  }
};

goog.array.findIndex = function(arr, f, opt_obj) {
  if (Array.prototype.findIndex && arr.findIndex === Array.prototype.findIndex) {
    return arr.findIndex(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        const val = arr2[i];  // in case f mutates arr2
        if (f.call(opt_obj, val, i, arr)) {
          return i;
        }
      }
    }
    return -1;
  }
};

goog.array.remove = function(arr, obj) {
  const i = goog.array.indexOf(arr, obj);
  let rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};

goog.array.removeAt = function(arr, i) {
  return Array.prototype.splice.call(arr, i, 1).length == 1;
};

goog.array.removeIf = function(arr, f, opt_obj) {
  const l = arr.length;
  const res = [];
  let count = 0;
  for (let i = 0; i < l; i++) {
    const val = arr[i];
    if (!f.call(opt_obj, val, i, arr)) {
      res[count++] = val;
    }
  }
  arr.length = count;
  for (let i = 0; i < count; i++) {
    arr[i] = res[i];
  }
  return count != l;
};

goog.array.clear = function(arr) {
  if (!Array.isArray(arr)) {
    for (let i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};

goog.array.some = function(arr, f, opt_obj) {
  if (Array.prototype.some && arr.some === Array.prototype.some) {
    return arr.some(f, opt_obj);
  } else {
    const l = arr.length;  // must be fixed during loop... see docs
    const arr2 = typeof arr === 'string' ? arr.split('') : arr;
    for (let i = 0; i < l; i++) {
      if (i in arr2) {
        const val = arr2[i];  // in case f mutates arr2
        if (f.call(opt_obj, val, i, arr)) {
          return true;
        }
      }
    }
    return false;
  }
};

// goog utility functions
goog.isArray = function(val) {
  return Array.isArray(val);
};

goog.isString = function(val) {
  return typeof val === 'string';
};

goog.isNumber = function(val) {
  return typeof val === 'number';
};

goog.isObject = function(val) {
  return val != null && typeof val === 'object';
};

goog.isFunction = function(val) {
  return typeof val === 'function';
};

goog.isDef = function(val) {
  return val !== undefined;
};

goog.isDefAndNotNull = function(val) {
  return val != null;
};

// goog.style utilities
goog.style = {};

goog.style.setStyle = function(element, style) {
  if (typeof style === 'string') {
    element.style.cssText = style;
  } else {
    for (const key in style) {
      if (style.hasOwnProperty(key)) {
        const camelKey = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        element.style[camelKey] = style[key];
      }
    }
  }
};

goog.style.getBorderBoxSize = function(element) {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
};

goog.style.getSize = function(element) {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight
  };
};

goog.style.getViewportPageOffset = function(doc) {
  doc = doc || document;
  const win = doc.defaultView || doc.parentWindow;
  
  // Use modern properties if available
  if (win && typeof win.pageXOffset !== 'undefined') {
    return new goog.math.Coordinate(win.pageXOffset, win.pageYOffset);
  }
  
  // Fallback for older browsers
  const documentElement = doc.documentElement;
  const body = doc.body;
  
  const scrollLeft = (documentElement && documentElement.scrollLeft) || 
                     (body && body.scrollLeft) || 0;
  const scrollTop = (documentElement && documentElement.scrollTop) || 
                    (body && body.scrollTop) || 0;
  
  return new goog.math.Coordinate(scrollLeft, scrollTop);
};

goog.style.getPageOffset = function(element) {
  let x = 0;
  let y = 0;
  
  // Use getBoundingClientRect if available (modern browsers)
  if (element.getBoundingClientRect) {
    const rect = element.getBoundingClientRect();
    const scrollOffset = goog.style.getViewportPageOffset(element.ownerDocument);
    return new goog.math.Coordinate(
      rect.left + scrollOffset.x,
      rect.top + scrollOffset.y
    );
  }
  
  // Fallback: traverse up the DOM tree
  let current = element;
  while (current && current.offsetParent) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent;
  }
  
  return new goog.math.Coordinate(x, y);
};

goog.style.getClientPosition = function(element) {
  if (element.getBoundingClientRect) {
    const rect = element.getBoundingClientRect();
    return new goog.math.Coordinate(rect.left, rect.top);
  }
  
  // Fallback
  const pageOffset = goog.style.getPageOffset(element);
  const scrollOffset = goog.style.getViewportPageOffset(element.ownerDocument);
  return new goog.math.Coordinate(
    pageOffset.x - scrollOffset.x,
    pageOffset.y - scrollOffset.y
  );
};

// goog.json utilities
goog.json = {};

goog.json.serialize = function(obj) {
  return JSON.stringify(obj);
};

goog.json.parse = function(str) {
  return JSON.parse(str);
};

// goog.string utilities
goog.string = {};

goog.string.quote = function(str) {
  return JSON.stringify(str);
};

goog.string.stripQuotes = function(str) {
  if ((str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') ||
      (str.charAt(0) === "'" && str.charAt(str.length - 1) === "'")) {
    return str.substr(1, str.length - 2);
  }
  return str;
};

goog.string.trimRight = function(str) {
  return str.replace(/\s+$/, '');
};

goog.string.trimLeft = function(str) {
  return str.replace(/^\s+/, '');
};

goog.string.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

goog.string.repeat = function(string, length) {
  if (length <= 0) return '';
  let result = '';
  while (length > 0) {
    if (length & 1) {
      result += string;
    }
    string += string;
    length >>= 1;
  }
  return result;
};

// goog.pubsub utilities
goog.pubsub = {};

goog.pubsub.PubSub = function() {
  this.subscriptions_ = {};
  this.topicId_ = 0;
};

goog.pubsub.PubSub.prototype.subscribe = function(topic, fn, opt_context) {
  const topicSubs = this.subscriptions_[topic] = this.subscriptions_[topic] || [];
  const id = this.topicId_++;
  
  topicSubs.push({
    id: id,
    fn: fn,
    context: opt_context
  });
  
  return id;
};

goog.pubsub.PubSub.prototype.publish = function(topic, var_args) {
  const topicSubs = this.subscriptions_[topic];
  if (!topicSubs) return false;
  
  const args = Array.prototype.slice.call(arguments, 1);
  
  for (let i = 0; i < topicSubs.length; i++) {
    const sub = topicSubs[i];
    sub.fn.apply(sub.context || null, args);
  }
  
  return true;
};

export default goog;

/* === src/lib/betacreator/util/i18n.js === */
goog.provide('bc.i18n');

/**
 * @param {string} str
 * @return {string}
 */
bc.i18n = function(str) {
    if (bc.i18n.data[str]) {
		var ret = str;
        if (bc.i18n.language != 'en')
            ret = bc.i18n.data[str][bc.i18n.language] || bc.i18n.data[str]['en'] || str;
        else
			ret = bc.i18n.data[str]['en'] || str;
		
		return ret;
    }
    else {
        return str;
    }
}

bc.i18n.language = 'en';

bc.i18n.data = {};


/* === src/lib/betacreator/util/array.js === */
goog.provide('bc.array');


/**
 * Returns the first non-null non-undefined non-NaN item in the array or null
 * @param {Array} a
 * @return {*}
 */
bc.array.coalesce = function(a) {
	var aLen = a.length;
	for(var i = 0; i < aLen; i++) {
		if (!!a[i] || a[i] === 0 || a[i] === '' || a[i] === false)
			return a[i];
	}

	return null;
}


/* === src/lib/betacreator/util/ClassSet.js === */
goog.provide('bc.ClassSet');

/**
 * @param {Element} e
 * @constructor
 */
bc.ClassSet = function(e) {
	this.el = e;
	
	this.classes = {};
	
	var classAr = this.el.className.split(' ');
	for(var i = 0, l = classAr.length; i < l; i++)
		this.classes[classAr[i]] = true;
};

/**
 * @return {string}
 * @private
 */
bc.ClassSet.prototype.getClassName = function() {
	var ret = [];
	for(var key in this.classes)
		ret.push(key);
	return ret.join(' ');
};

/**
 * @param {string} name
 */
bc.ClassSet.prototype.addClass = function(name) {
	var all = name.split(' ');
	for(var i = 0, l = all.length; i < l; i++)
		this.classes[all[i]] = true;
	this.el.className = this.getClassName();
};

/**
 * @param {string} name
 */
bc.ClassSet.prototype.removeClass = function(name) {
	var all = name.split(' ');
	for(var i = 0, l = all.length; i < l; i++)
		delete this.classes[all[i]];
	this.el.className = this.getClassName();
};


/* === src/lib/betacreator/util/color.js === */
goog.provide('bc.Color');
goog.provide('bc.color');
goog.provide('bc.color.alpha');

goog.require('goog.color');
goog.require('goog.color.alpha');


/**
 * @param {string} c The color string to parse
 * @param {?string=} defaultColor The color to fall back on if c is invalid
 * @return {Object}
 */
bc.color.parse = function(c, defaultColor) {
	defaultColor = defaultColor || '#ffffff';
	c = c || defaultColor;
	
	if (!goog.isString(c))
		throw Error(c + ' is not a valid 6-hex color string');
	
	if(c.length > 7 && c[0] == '#')
		c = c.substr(0,7);
	
	if(defaultColor.length > 7 && defaultColor[0] == '#')
		defaultColor = defaultColor.substr(0,7);
	
	try {
		return goog.color.parse(c);
	}
	catch(e) {
		return bc.color.parse(/** @type {string} */ (defaultColor), '#ffffff');
	}
};

/**
 * @param {string} c The color string to parse
 * @param {?string=} defaultColor The color to fall back on if c is invalid
 * @return {Object}
 */
bc.color.alpha.parse = function(c, defaultColor) {
	defaultColor = defaultColor || '#ffffff';
	c = c || defaultColor;
	
	if (!goog.isString(c))
		throw Error(c + ' is not a valid 8-hex color string');

	try {
		return goog.color.alpha.parse(c);
	}
	catch(e) {
		try {
			var nonAlphaColor = bc.color.parse(c, defaultColor).hex;
			return bc.color.alpha.parse(nonAlphaColor + 'ff', defaultColor + 'ff');
		}
		catch(er) {
			return bc.color.alpha.parse(/** @type {string} */ (defaultColor), '#ffffffff');
		}
	}
};

/**
 * @param {string} color A hex string representing a color
 * @param {number=} alpha The alpha for the returned white or black (defaults to 1)
 * 
 * @return {string} hex or rgba style string for drawing on a canvas
 */
bc.color.highContrastWhiteOrBlack = function(color, alpha) {
	alpha = alpha || 1;
	
	var ret = goog.color.highContrast(
		goog.color.hexToRgb(goog.color.parse(color).hex),
		[
			[0,0,0],
			[255,255,255]
		]
	);
	
	if (alpha < 1) {
		ret.push(alpha);
		return goog.color.alpha.rgbaArrayToRgbaStyle(ret);
	}
	else {
		return goog.color.rgbArrayToHex(ret);
	}
};





/**
 * @param {?bc.Color|string|Array.<number>|Object=} color
 * @param {string|Array.<number>|bc.Color|Object=} defaultColor
 * 
 * @constructor
 */
bc.Color = function(color, defaultColor) {

	/** @type {boolean} */
	this.isColor = true;

	/** 
	 * @type {number}
	 * @private
	 */
	this._r = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._g = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._b = 0;
	/** 
	 * @type {number}
	 * @private
	 */
	this._a = 0;

	if (!color && defaultColor)
		color = defaultColor;
	
	if (!color)
		return;
	
	if (goog.isString(color)) {
		if (color.toLowerCase() == 'transparent')
			color = '#0000';
		this.ahex(color);
	}
	else if (goog.isArray(color) && color.length >= 3) {
		this.rgba([
			color[0],
			color[1],
			color[2],
			goog.isNumber(color[3]) ? color[3] : 1
		]);
	}
	else if (color.isColor) {
		this.clone(/** @type {bc.Color} */(color));
	}
	else if (goog.isObject(color)) {
		if ('h' in color && 's' in color && 'v' in color) {
			this.hsv([color['h'], color['s'], color['v'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
		else if ('h' in color && 's' in color && 'l' in color) {
			this.hsl([color['h'], color['s'], color['l'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
		else if ('r' in color && 'g' in color && 'b' in color) {
			this.rgba([color['r'], color['g'], color['b'], goog.isNumber(color['a']) ? color['a'] : 1]);
		}
	}
};

/**
 * @param {bc.Color} color
 * 
 * @return {bc.Color}
 */
bc.Color.prototype.clone = function(color) {
	this._r = color._r;
	this._g = color._g;
	this._b = color._b;
	this._a = color._a;
	
	return this;
};

/**
 * @param {string=} hex
 * 
 * @return {bc.Color|string}
 */
bc.Color.prototype.hex = function(hex) {
	if  (hex === undefined)
		return goog.color.rgbArrayToHex(/** @type {Array.<number>} */ (this.rgb()));
	
	return this.ahex(hex);
};

/**
 * @param {string=} ahex
 * 
 * @return {bc.Color|string}
 */
bc.Color.prototype.ahex = function(ahex) {
	if  (ahex === undefined)
		return goog.color.alpha.rgbaArrayToHex(/** @type {Array.<number>} */ (this.rgba()));
	
	var rgba = goog.color.alpha.hexToRgba(bc.color.alpha.parse(ahex).hex);
	
	this._r = rgba[0];
	this._g = rgba[1];
	this._b = rgba[2];
	this._a = rgba[3];
	
	return this;
};

/**
 * @param {Array.<number>=} rgb
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.rgb = function(rgb) {
	if (rgb === undefined)
		return [this._r, this._g, this._b];
	
	return this.rgba(rgb);
};

/**
 * r [0-255]
 * g [0-255]
 * b [0-255]
 * a [0-1]
 * 
 * @param {Array.<number>=} rgba
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.rgba = function(rgba) {
	if (rgba === undefined)
		return [this._r, this._g, this._b, this._a];
	
	this._r = goog.math.clamp(Math.round(rgba[0]), 0, 255);
	this._g = goog.math.clamp(Math.round(rgba[1]), 0, 255);
	this._b = goog.math.clamp(Math.round(rgba[2]), 0, 255);
	this._a = goog.math.clamp(/** @type {number} */ (goog.isNumber(rgba[3]) ? rgba[3] : 1), 0, 1);
	
	return this;
};


/**
 * @param {Array.<number>=} hsl
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsl = function(hsl) {
	if (hsl === undefined)
		return goog.color.rgbToHsl(this._r, this._g, this._b);
	
	return this.hsla(hsl);
};


/**
 * h [0-360]
 * s [0-1]
 * l [0-1]
 * a [0-1]
 * 
 * @param {Array.<number>=} hsla
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsla = function(hsla) {
	if (hsla === undefined)
		return /** @type {Array}*/(this.hsl()).concat([this._a]);
	
	var h = goog.math.clamp(Math.round(360 + hsla[0])%360, 0, 360),
		s = goog.math.clamp(hsla[1], 0, 1),
		l = goog.math.clamp(hsla[2], 0, 1),
		a = goog.math.clamp(goog.isNumber(hsla[3]) ? hsla[3] : 1, 0, 1),
		rgb = goog.color.hslToRgb(h, s, l);

	this._r = rgb[0];
	this._g = rgb[1];
	this._b = rgb[2];
	this._a = a;
	
	return this;
};


/**
 * h [0-360]
 * s [0-1]
 * v [0-1]
 * 
 * @param {Array.<number>=} hsv
 * 
 * @return {bc.Color|Array.<number>}
 */
bc.Color.prototype.hsv = function(hsv) {
	if (hsv === undefined) {
		var ret = goog.color.rgbArrayToHsv(/** @type {Array.<number>} */ (this.rgb()));
		ret[0] = this.hsl()[0],
		ret[2] /= 255;
		return ret;
	}
	
	var h = goog.math.clamp(Math.round(360 + hsv[0])%360, 0, 360),
		s = goog.math.clamp(hsv[1], 0, 1),
		v = goog.math.clamp(hsv[2], 0, 1),
		a = goog.math.clamp(goog.isNumber(hsv[3]) ? hsv[3] : 1, 0, 1),
		rgb = goog.color.hsvToRgb(h, s, goog.math.clamp(Math.round(v*255), 0, 255));

	this._r = rgb[0];
	this._g = rgb[1];
	this._b = rgb[2];
	this._a = a;
	
	return this;
};

/**
 * @return {string}
 */
bc.Color.prototype.rgbStyle = function() {
	return goog.color.hexToRgbStyle(/** @type {string} */ (this.hex()));
};

/**
 * @return {string}
 */
bc.Color.prototype.rgbaStyle = function() {
	return goog.color.alpha.hexToRgbaStyle(/** @type {string} */ (this.ahex()));
};

/**
 * Serialize the color for storage in a property
 * @param {boolean=} asObject
 *
 * @return {string|Object}
 */
bc.Color.prototype.serialize = function(asObject) {
    if(!asObject)
		return /** @type {string} */ (this.ahex());
	
    else
        return {
            'r': this._r,
            'g': this._g,
            'b': this._b,
            'a': this._a
		};
};



/* === src/lib/betacreator/util/math.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.math');
goog.provide('bc.math.Box');
goog.provide('bc.math.Line');


/**
 * @param {number} x
 * @param {number} y
 * 
 * @constructor
 */
bc.math.Box = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

/**
 * Return a string with set precision (number of decimal places) and trailing zeroes removed
 * @param {number} value
 * @param {number=} precision
 * @return {string}
 */
bc.math.toFixed = function(value, precision) {
	return value.toFixed(precision || 0).replace(/^([^\.]*)$/, '$1.').replace(/\.?0*$/, '');
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number=} ex
 * @param {number=} ey
 * 
 * @return {number}
 */
bc.math.Line.lineLength = function(sx, sy, ex, ey) {
	if (arguments.length == 2)
		return Math.sqrt(sx*sx + sy*sy);
	
	var dx = ex - sx;
	var dy = ey - sy;
	return Math.sqrt(dx*dx + dy*dy);
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} accuracy
 * 
 * @return {number}
 */ 
bc.math.Line.curveLength = function(sx, sy, cx, cy, ex, ey, accuracy) {
	/** @type {number} */
	var total = 0;
	/** @type {number} */
	var tx = sx;
	/** @type {number} */
	var ty = sy;
	/** @type {number} */
	var px;
	/** @type {number} */
	var py;
	/** @type {number} */
	var t;
	/** @type {number} */
	var it;
	/** @type {number} */
	var a;
	/** @type {number} */
	var b;
	/** @type {number} */
	var c;
	
	/** @type {number} */
	var n = accuracy || 6;
	
	for (var i = 1; i <= n; i++){
		t = i/n;
		it = 1-t;
		a = it*it;
		b = 2*t*it;
		c = t*t;
		px = a*sx + b*cx + c*ex;
		py = a*sy + b*cy + c*ey;
		total += bc.math.Line.lineLength(tx, ty, px, py);
		tx = px;
		ty = py;
	}
	return total;
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number} t1
 * @param {number} t2
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSlice = function(sx, sy, cx, cy, ex, ey, t1, t2) {
	if (t1 == 0)
		return bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
	else if (t2 == 1)
		return bc.math.Line.curveSliceFrom(sx, sy, cx, cy, ex, ey, t1);
	
	var c = bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, ex, ey, t2);
	c.push(t1/t2);
	
	return bc.math.Line.curveSliceFrom.apply(null, c);
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} t
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSliceUpTo = function(sx, sy, cx, cy, ex, ey, t) {
	//if (t == undefined) t = 1;
	t = t || 1;
	if (t != 1) {
		var midx = cx + (ex-cx)*t;
		var midy = cy + (ey-cy)*t;
		cx = sx + (cx-sx)*t;
		cy = sy + (cy-sy)*t;
		ex = cx + (midx-cx)*t;
		ey = cy + (midy-cy)*t;
	}
	return [sx, sy, cx, cy, ex, ey];
};

/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} cx
 * @param {number} cy
 * @param {number} ex
 * @param {number} ey
 * @param {number=} t
 * 
 * @return {Array.<number>}
 */ 
bc.math.Line.curveSliceFrom = function(sx, sy, cx, cy, ex, ey, t) {
	//if (t == undefined) t = 1;
	t = t || 1;
	if (t != 1) {
		var midx = sx + (cx-sx)*t;
		var midy = sy + (cy-sy)*t;
		cx = cx + (ex-cx)*t;
		cy = cy + (ey-cy)*t;
		sx = midx + (cx-midx)*t;
		sy = midy + (cy-midy)*t;
	}
	return [sx, sy, cx, cy, ex, ey];
};


/**
 * @param {goog.math.Coordinate} c The point to measure from
 * @param {goog.math.Coordinate} a First endpoint of the line segment
 * @param {goog.math.Coordinate} b Second endpoint of the line segment
 * 
 * @return {number} Distance from c to the line segment
 */
bc.math.distanceFromLineSegment = function(c, a, b) {
	var r_numerator = (c.x-a.x)*(b.x-a.x) + (c.y-a.y)*(b.y-a.y),
		r_denomenator = (b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y),
		r = r_numerator / r_denomenator,
		px = a.x + r*(b.x-a.x),
		py = a.y + r*(b.y-a.y),
		s = ((a.y-c.y)*(b.x-a.x)-(a.x-c.x)*(b.y-a.y) ) / r_denomenator,
		distanceLine = Math.abs(s)*Math.sqrt(r_denomenator),
		distanceSegment;

	if ( (r >= 0) && (r <= 1) ) {
		distanceSegment = distanceLine;
	}
	else {
		var dist1 = (c.x-a.x)*(c.x-a.x) + (c.y-a.y)*(c.y-a.y),
			dist2 = (c.x-b.x)*(c.x-b.x) + (c.y-b.y)*(c.y-b.y);
		
		if (dist1 < dist2)
			distanceSegment = Math.sqrt(dist1);
		else
			distanceSegment = Math.sqrt(dist2);
	}

	return distanceSegment;
};


/* === src/lib/betacreator/util/object.js === */
goog.provide('bc.object');


/**
 * Runs a function on each item in an object until one returns false
 * @param {Object} o
 */
bc.object.map = function(o, f) {
	if(!o)
		return;
	
	for(var i in o) {
		if (f(i, o[i]) == false)
			break;
	}
}

/**
 * Creates a deep copy of an object
 * @param {*} dupeObj The object to copy
 * @param {number=} level Not passed in by the user
 * @return {Object|Array} A deep copy of o
 */
bc.object.copy = function(dupeObj, level) {
	if(dupeObj == null)
		return null;
	
	if(level == null)
		level = 0;
	if(level > 100) {
		return null;
	}
	
    var retObj = {};
    if (typeof(dupeObj) == 'object') {
        if (typeof(dupeObj.length) != 'undefined')
            retObj = [];
        for (var objInd in dupeObj) {
			var type = typeof(dupeObj[objInd]);
            if (type == 'object') {
				if(dupeObj[objInd] instanceof HTMLElement)
					retObj[objInd] = dupeObj[objInd];
				else
					retObj[objInd] = bc.object.copy(dupeObj[objInd], level+1);
            } else if (type == 'string') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'number') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'function') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'boolean') {
                ((dupeObj[objInd] == true) ? retObj[objInd] = true : retObj[objInd] = false);
            } else if (type == 'undefined') {
				retObj[objInd] = undefined;
			}
        }
    }
    return retObj;
}

/**
 * Are these two objects actually equivalent, or not?
 * @param {*} first
 * @param {*} second
 * 
 * @return {boolean}
 */
bc.object.areEqual = function(first, second) {
	if(typeof(first) == 'object' && typeof(second) == 'object') {
		if(first == null && second == null)
			return true;
		else if(goog.isArray(first) && goog.isArray(second)) {
			if(first.length != second.length)
				return false;

			for(var i = 0; i < first.length; i++) {
				if(!bc.object.areEqual(first[i], second[i]))
					return false;
			}

			return true;
		}
		else if(goog.isObject(first) && goog.isObject(second)) {
			for(var key in first) {
				//Skip items in the prototype.
				if(key in (first.__proto__ || first.constructor) || key == '__proto__')
					continue;

				if(!(key in second))
					return false;
				if(!bc.object.areEqual(first[key], second[key]))
					return false;
			}

			for(var key in second) {
				//Skip items in the prototype.
				if(key in (second.__proto__ || second.constructor) || key == '__proto__')
					continue;

				if(!(key in first))
					return false;
			}

			return true;
		}
		else
			return false;
	}
	else if(goog.isNumber(first) && goog.isNumber(second))
		return Math.abs(first-second) < 0.000000001;
	else if(first == null && second == null)
		return true;
	else
		return first === second;
}


/* === src/lib/betacreator/util/util.js === */
goog.provide('bc.uuid');


/* GENERIC UTILITY FUNCTIONS
============================================================================= */

/**
 * @param {?string=} existing
 * @return {string}
 */
bc.uuid = function(existing) {
	// add to cache if we have an existing id
	if (existing) {
		bc.uuid.cache[existing] = true;
		return existing;
	}
	
	var uuid = bc.uuid.get();
	// if the new uuid is not used, add and return it
	if (!bc.uuid.cache[uuid])
		return bc.uuid(uuid);
	// if it is already used, try again;
	else
		return bc.uuid();
}

bc.uuid.cache = {};

/**
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 * @return {string}
 */
bc.uuid.get = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}


/* === src/lib/betacreator/util/domBuilder.js === */
goog.provide('bc.domBuilder');

/**

This utility function takes Javascript data structures and turns them into
a DOM Element.  These may directly describe the tags that make up the
object, like this:

{
	tag:'span', // defaults to 'div' if you don't specify a tag
	classes:'one two three',
	attr:{rows:40,cols:20},
	children:[{these objects}]
}

Or they can just be strings--these will be created as spans, so you can put
them into the "children" array.

 * @param {Object|string} data
 * @return {Element}
*/
bc.domBuilder = function(data) {	
	if(goog.isString(data)) {
		var span = goog.dom.createDom(goog.dom.TagName.SPAN);
		goog.dom.setTextContent(span, /** @type {string} */(data));
		return span;
	}
	
	data.tag = data.tag || goog.dom.TagName.DIV;

	var ret = goog.dom.createDom(data.tag),
		key,
		allAttributes = {
			'id':		data.id,
			'class':	data.classes,
			'type':		data.type,
			'src':		data.src,
			'href':		data.href,
			'title':	data.title,
			'name':		data.name,
			'target':	data.target,
			'checked':	data.checked,
			'value':	data.value
		},
		attributes = {},
		doSetAttributes = false;

	for (key in allAttributes) {
		if (allAttributes[key] !== undefined) {
			attributes[key] = allAttributes[key];
			doSetAttributes = true;
		}
	}
	if(data.attr) {
		for(key in data.attr) {
			attributes[key] = data.attr[key];
			doSetAttributes = true;
		}
	}

	if (doSetAttributes)
		goog.dom.setProperties(ret, attributes);

	if(data.html)		ret.innerHTML = data.html;
	if(data.text)		goog.dom.setTextContent(ret, data.text);
	
	if(data.css) {
		for (key in data.css) {
			ret.style[key] = data.css[key];
		}
	}
	
	if(data.children) {
		for(var i = 0; i < data.children.length; i++) {
			if (data.children[i])
				goog.dom.appendChild(ret, bc.domBuilder(data.children[i]));
		}
	}
	
	if(data.create)
		data.create(ret);
	
	if(data.click)
		goog.events.listen(ret, goog.events.EventType.CLICK, function(e) {
			data.click(e,ret);
		});

	if(data.change)
		goog.events.listen(ret, goog.events.EventType.CHANGE, function(e) {
			data.change(e,ret);
		});

	return ret;
}


/* === src/lib/betacreator/models/property.js === */
goog.provide('bc.property');
goog.provide('bc.properties');

goog.require('bc.model.Action');

/**
 * @type {bc.controller.Canvas|null}
 */
bc.property.canvas = null;

/**
 * @param {string} property
 * @param {*} val
 */
bc.property.set = function(property, val) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	var selection = canvas.getSelectedItems();

	if (selection.length > 0) {
		goog.array.forEach(selection, function(item, i) {
			// only change properties that exist
			if (item.properties[property] === undefined)
				return;

			var changed = {
				id: item.id
			};
			changed[property] = val;
			canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
		});
	}
	else {
		canvas.model.properties[property] = val;
	}
};

/**
 * @param {Array.<Array>} batch
 */
bc.property.setBatch = function(batch) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	canvas.startUndoBatch();

	goog.array.forEach(batch, function(data) {
		bc.property.set(data[0], data[1]);
	});

	canvas.endUndoBatch();
};

/**
 * @param {string} property
 * @return {*}
 */
bc.property.get = function(property) {
	var canvas = bc.property.canvas;
	if (!canvas)
		return;

	var selection = canvas.getSelectedItems(),
		ret;

	if (selection.length > 0) {
		goog.array.some(selection, function(item, i) {
			if (item.properties[property] !== undefined) {
				ret = item.properties[property];
				return true;
			}
			return false;
		});
	}
	else {
		ret = canvas.model.properties[property];
	}

	return ret;
};

/**
 * @param {string} property
 * @return {function(?):?}
 */
bc.property.getterSetter = function(properties, property) {
	return function(val) {
		if (val !== undefined && properties[property] !== undefined)
			properties[property] = val;

		return properties[property];
	};
};

/**
 * @enum {string}
 */
bc.properties = {
	ITEM_TYPE: 'it',
	ITEM_COLOR: 'ic',
	ITEM_SCALE: 'is',
	ITEM_ALPHA: 'ia',
	ITEM_LINEWIDTH: 'lw',
	ITEM_X: 'x',
	ITEM_Y: 'y',
	ITEM_W: 'w',
	ITEM_H: 'h',
	TEXT_ALIGN: 'ta',
	LINE_CONTROLPOINTS: 'cp',
	LINE_CURVED: 'lc',
	LINE_OFFLENGTH: 'fl',
	LINE_ONLENGTH: 'nl',
	TEXT: 't',
	TEXT_BG: 'tb'
};


/* === src/lib/betacreator/models/Action.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.model.Action');
goog.provide('bc.model.ActionType');

goog.require('bc.object');

/**
 * The set of kinds of actions that can be taken on a canvas.
 * @enum {number}
 */
bc.model.ActionType = {
	CreateStamp:	1,
	CreateLine:		2,
	CreateText:		3,
	EditItem:		4,
	DeleteStamp:	5,
	DeleteLine:		6,
	DeleteText:		7
};

/**
 * Represents one action in the undo history of a canvas.
 *
 * @param {bc.model.ActionType} type Type of action taken
 * @param {Object} params Further parameters for this action
 *
 * @constructor
 */
bc.model.Action = function(type, params) {
	/**
	 * The type of action taken
	 * @type {bc.model.ActionType}
	 */
	this.type = type;
	
	/**
	 * @type {Object}
	 */
	this.params = params;
	
	/**
	 * @type {?Object}
	 */
	this.oldParams = null;
	
	/**
	 * @type {boolean}
	 */
	this.isRedo = false;
	
	/**
	 * @type {boolean}
	 */
	this.isUndo = false;
};

/**
 * Return a copy of an action
 * 
 * @return {bc.model.Action}
 */
bc.model.Action.prototype.copy = function() {
	return new bc.model.Action(this.type, bc.object.copy(this.params));
};

/**
 * Given an action, return the action that undoes that action.
 * @param {bc.model.Action} action Original action
 * @return {bc.model.Action} The reverse of that action
 */
bc.model.Action.getReverseAction = function(action) {
	var ret = action.copy();
	
	switch(action.type) {
		case bc.model.ActionType.CreateStamp:
			ret.type = bc.model.ActionType.DeleteStamp;
			break;

		case bc.model.ActionType.CreateLine:
			ret.type = bc.model.ActionType.DeleteLine;
			break;

		case bc.model.ActionType.CreateText:
			ret.type = bc.model.ActionType.DeleteText;
			break;

		case bc.model.ActionType.EditItem:
			ret.params = bc.object.copy(action.oldParams);
			break;

		case bc.model.ActionType.DeleteStamp:
			ret.type = bc.model.ActionType.CreateStamp;
			break;

		case bc.model.ActionType.DeleteLine:
			ret.type = bc.model.ActionType.CreateLine;
			break;

		case bc.model.ActionType.DeleteText:
			ret.type = bc.model.ActionType.CreateText;
			break;

		default:
			return null;
	}
	
	return ret;
};


/* === src/lib/betacreator/models/Item.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Item');
goog.provide('bc.model.ItemTypes');

/**
 * @interface
 */
bc.model.Item = function() {};

/**
 * @return {Object}
 */
bc.model.Item.prototype.serializeParams = function() {};

/**
 * @param {goog.math.Coordinate} p
 */
bc.model.Item.prototype.setOffset = function(p) {};

/**
 * @enum {number}
 */
bc.model.ItemTypes = {
	LINE: 0,
	ANCHOR: 1,
	PITON: 2,
	RAPPEL: 3,
	BELAY: 4,
	TEXT: 5
};


/* === src/lib/betacreator/models/Canvas.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Canvas');

goog.require('bc.property');
goog.require('goog.array');

/**
 * @param {bc.controller.Canvas} controller
 * @param {Image} image
 * @param {Object=} defaultProperties
 * @constructor
 */
bc.model.Canvas = function(controller, image, defaultProperties) {
	defaultProperties = defaultProperties || {};

	this.controller = controller;
	this.image = image;
	
	this.h = image.height;
	this.w = image.width;

	this.scale = 1;

	this.scales = [1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16];
	
	/** @type {Array.<bc.model.Item>} */
	this.items = [];

	/** @type {Object} */
	this.properties = {};
	this.properties[bc.properties.ITEM_SCALE] = 1;
	this.properties[bc.properties.ITEM_COLOR] = '#ffff00';
	this.properties[bc.properties.ITEM_ALPHA] = 1;
	this.properties[bc.properties.LINE_ONLENGTH] = 10;
	this.properties[bc.properties.LINE_OFFLENGTH] = 10;
	this.properties[bc.properties.LINE_CURVED] = false;
	this.properties[bc.properties.TEXT_ALIGN] = 'l';
	this.properties[bc.properties.TEXT_BG] = false;

	for (var key in defaultProperties) {
		if (this.properties[key] !== undefined)
			this.properties[key] = defaultProperties[key];
	}

	this.tempLine = new bc.model.Line({
		controlPoints: [ new goog.math.Coordinate(0,0) ]
	}, this.properties);

	this.addItem(this.tempLine);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.addItem = function(item) {
	this.items.push(item);
};

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.removeItem = function(item) {
	goog.array.remove(this.items, item);
};

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.removeAllItems = function(item) {
	this.items = [];
	this.addItem(this.tempLine);
};

/**
 * @param {string} id
 * @return {bc.model.Item|null}
 */
bc.model.Canvas.prototype.getItem = function(id) {
	return /** @type {bc.model.Item|null} */(goog.array.find(this.items, function(item) {
		return item.id == id;
	}));
};

/**
 * Call the function f with each item in order, top down (newest first). If any call to f returns true, stop the looping
 *
 * @param {function(bc.model.Item)} f
 * @param {boolean=} selectedFirst If this is set to true then we cycle through selected items first, then the rest top down
 */
bc.model.Canvas.prototype.eachOrderedItem = function(f, selectedFirst) {
	if (selectedFirst) {
		goog.array.some(this.controller.getSelectedItems(), function(item) {
			return !!f(item);
		});
	}

	for (var i = this.items.length - 1; i >= 0; i--) {
		if (this.items[i] == this.tempLine || (selectedFirst && this.controller.isItemSelected(this.items[i])))
			continue;

		if (f(this.items[i]) === true)
			return;
	}
};

/**
 * Call the function f with each item in order, bottom up. If any call to f returns true, stop the looping
 *
 * @param {function(bc.model.Item)} f
 * @param {boolean=} includeHidden
 */
bc.model.Canvas.prototype.eachItem = function(f, includeHidden) {
	for (var i = 0, l = this.items.length; i < l; i++) {
		if (!includeHidden && this.items[i] == this.tempLine)
			continue;

		if (f(this.items[i]) === true)
			return;
	}
};

bc.model.Canvas.prototype.zoomOut = function() {
	for (var i = 0, l = this.scales.length; i < l; i++) {
		if (goog.math.nearlyEquals(this.scales[i], this.scale)) {
			this.scale = this.scales[goog.math.clamp(i - 1, 0, l - 1)];
			return;
		}
		else if (this.scale > this.scales[i] && (!this.scales[i+1] || this.scale < this.scales[i+1])) {
			this.scale = this.scales[i];
			return;
		}
	}
};

bc.model.Canvas.prototype.zoomIn = function() {
	for (var i = 0, l = this.scales.length; i < l; i++) {
		if (goog.math.nearlyEquals(this.scales[i], this.scale)) {
			this.scale = this.scales[goog.math.clamp(i + 1, 0, l - 1)];
			return;
		}
		else if (this.scale > this.scales[i] && this.scales[i+1] && this.scale < this.scales[i+1]) {
			this.scale = this.scales[i+1];
			return;
		}
	}
};

/**
 * @param {number} zoom
 */
bc.model.Canvas.prototype.zoomTo = function(zoom) {
	this.scale = goog.math.clamp(zoom, this.scales[0], this.scales[this.scales.length-1]);
};


/* === src/lib/betacreator/models/Line.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Line');

goog.require('bc.model.Item');
goog.require('bc.math');
goog.require('bc.object');
goog.require('bc.render.DashedLine');
goog.require('bc.uuid');
goog.require('goog.array');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Line = function(params, defaults) {
	params = params || {};

	this.isLine = true;
	
	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.LINE;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || defaults[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = params.color || defaults[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || defaults[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_LINEWIDTH] = params.lineWidth || 3;
	this.properties[bc.properties.LINE_CONTROLPOINTS] = params.controlPoints || [];
	this.properties[bc.properties.LINE_ONLENGTH] = params.onLength || defaults[bc.properties.LINE_ONLENGTH];
	this.properties[bc.properties.LINE_OFFLENGTH] = goog.isNumber(params.offLength) ? params.offLength : defaults[bc.properties.LINE_OFFLENGTH];
	this.properties[bc.properties.LINE_CURVED] = params.curved || defaults[bc.properties.LINE_CURVED];


	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.controlPoints = /** @type {function(Array.<goog.math.Coordinate>=):Array.<goog.math.Coordinate>} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CONTROLPOINTS));
	this.onLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_ONLENGTH));
	this.offLength = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.LINE_OFFLENGTH));
	this.curved = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.LINE_CURVED));
	
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_LINEWIDTH,
		bc.properties.LINE_CONTROLPOINTS,
		bc.properties.LINE_ONLENGTH,
		bc.properties.LINE_OFFLENGTH,
		bc.properties.LINE_CURVED
	];

	this.offset = new goog.math.Coordinate(0,0);
	
	/** @type {Array.<goog.math.Coordinate>} */
	this.points = [];
	
	this.updatePoints();
};

/**
* Get points along a curve
* 
* @param {number} sx start x
* @param {number} sy start y
* @param {number} cx Control point x
* @param {number} cy Control point y
* @param {number} x
* @param {number} y
* @param {number} pointDistance
* 
* @return {Array.<goog.math.Coordinate>}
*/
bc.model.Line.prototype.getCurvePoints = function(sx, sy, cx, cy, x, y, pointDistance) {
	/** @type {Array.<goog.math.Coordinate>} */
	var ret = [];
	
	/** @type {number} */
	var segLength = bc.math.Line.curveLength(sx, sy, cx, cy, x, y);
	/** @type {number} */
	var t = 0;
	/** @type {number} */
	var t2 = 0;
	/** @type {Array.<number>} */
	var c;
	
	var remainLength = segLength;
	var fullDashCount = Math.floor(remainLength/pointDistance);
	var ont = pointDistance/segLength;
	
	if (fullDashCount){
		for (var i=0; i<fullDashCount; i++){
			t2 = t + ont;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			ret.push(new goog.math.Coordinate(c[4], c[5]));
			t = t2;
		}
		
		ret.push(new goog.math.Coordinate(x, y));
	}
	
	return ret;
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/

/**
 * Apply the offset to all the control points and return the result
 *
 * @return {Object}
 */
bc.model.Line.prototype.applyOffset = function() {	
	var me = this,
		cp = [],
		ret = {};
	
	goog.array.forEach(this.controlPoints(), function(point) {
		cp.push(new goog.math.Coordinate(point.x + me.offset.x, point.y + me.offset.y));
	});
	
	this.offset.x = 0;
	this.offset.y = 0;

	ret[bc.properties.LINE_CONTROLPOINTS] = cp;
	return ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Line.parseParams = function(params) {
	params = params || {};
	
	var ret = {
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		lineWidth:	params[bc.properties.ITEM_LINEWIDTH],
		onLength:	params[bc.properties.LINE_ONLENGTH],
		offLength:	params[bc.properties.LINE_OFFLENGTH],
		curved:		params[bc.properties.LINE_CURVED]
	};
	
	if (params[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(params[bc.properties.LINE_CONTROLPOINTS])) {
		var cp = [];
		goog.array.forEach(params[bc.properties.LINE_CONTROLPOINTS], function(point) {
			cp.push(new goog.math.Coordinate(point['x'], point['y']));
		});
		ret.controlPoints = cp;
	}
	
	return ret;
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Line.prototype.setOffset = function(p) {
	this.offset = p;
};

/**
 * @return {Object}
 */
bc.model.Line.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	if (ret[bc.properties.LINE_CONTROLPOINTS] && goog.isArray(ret[bc.properties.LINE_CONTROLPOINTS])) {
		var cps = [];
		goog.array.forEach(ret[bc.properties.LINE_CONTROLPOINTS], function(p) {
			cps.push({
				'x': p.x,
				'y': p.y
			});
		});
		ret[bc.properties.LINE_CONTROLPOINTS] = cps;
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Line.prototype.getActionParams = function() {
	var me = this,
		ret = {};

	goog.array.forEach(this.actionProperties, function(key) {
		ret[key] = me.properties[key];
	});

	return ret;
};

/**
 * @param {Object} params
 */
bc.model.Line.prototype.setActionParams = function(params) {
	var me = this;
	goog.array.forEach(this.actionProperties, function(key) {
		if (params[key] !== undefined)
			me.properties[key] = params[key];
	});
};

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.Line.prototype.hitTest = function(x,y,selected) {
	var p = this.points,
		minDist = this.lineWidth()*this.scale()/2 + 6;
	
	for(var i = 0, l = p.length - 1; i < l; i++) {
		if(bc.math.distanceFromLineSegment(new goog.math.Coordinate(x,y),p[i],p[i+1]) < minDist) {
			return true;
		}
	}
	return false;
};

/**
 * Calculate the bounding box based on the control points and set the 'bb' property.
 */
bc.model.Line.prototype.updateBoundingBox = function() {
	if (this.controlPoints().length === 0) {
		this.bb = null;
		return;
	}
	
	var minX = Number.MAX_VALUE,
		maxX = -Number.MAX_VALUE,
		minY = Number.MAX_VALUE,
		maxY = -Number.MAX_VALUE;
	
	goog.array.forEach(this.controlPoints(), function(point) {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	});
	
	this.bb = new bc.math.Box(minX, minY, maxX - minX, maxY - minY);
};

/**
 * Get all the points for the line (used in hit test) and set the 'points'
 * property
 */
bc.model.Line.prototype.updatePoints = function() {
	var me = this;
	
	/** @type {Array.<goog.math.Coordinate>} */
	var ret = [];
	
	var pointDistance = 10;
	
	if (this.curved()) {
		var cps = this.controlPoints(),
			cpLength = cps.length;
		
		goog.array.forEach(cps, function(cp, i) {
			// for first point, just move to it
			if (i === 0) {
				ret.push(new goog.math.Coordinate(cp.x, cp.y));
			}
			else {
				var prevCP = cps[i - 1];
				
				// for second point just add a point at half way between it and
				// the first
				if (i == 1)
					ret.push(new goog.math.Coordinate((cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2));
				// for every other points, get the points for the curve from the
				// previous half-way point to the current half-way point
				else
					ret = ret.concat(me.getCurvePoints(
							ret[ret.length-1].x,
							ret[ret.length-1].y,
							prevCP.x,
							prevCP.y,
							(cp.x + prevCP.x)/2,
							(cp.y + prevCP.y)/2,
							pointDistance
						));
				
				// if it's the last point, add it
				if (i == cpLength - 1)
					ret.push(new goog.math.Coordinate(cp.x, cp.y));
			}
		});
	}
	else {
		goog.array.forEach(this.controlPoints(), function(cp, i) {
			ret.push(new goog.math.Coordinate(cp.x, cp.y));
		});
	}
	
	this.points = ret;
};


/* === src/lib/betacreator/models/Text.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Text');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Text = function(params, defaults) {
	params = params || {};

	this.isText = true;

	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.TEXT;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || defaults[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = params.color || defaults[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || defaults[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_X] = params.x || 0;
	this.properties[bc.properties.ITEM_Y] = params.y || 0;
	this.properties[bc.properties.TEXT] = params.text || '';
	this.properties[bc.properties.TEXT_ALIGN] = params.textAlign || defaults[bc.properties.TEXT_ALIGN];
	this.properties[bc.properties.TEXT_BG] = params.textBG || defaults[bc.properties.TEXT_BG];
	
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	this.textAlign = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_ALIGN));
	this.textBG = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_BG));
	
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_X,
		bc.properties.ITEM_Y,
		bc.properties.TEXT,
		bc.properties.TEXT_ALIGN,
		bc.properties.TEXT_BG
	];

	this.offset = new goog.math.Coordinate(0,0);

	/**
	 * @type {?goog.math.Coordinate}
	 * @private
	 */
	this.boundingBox = null;

	/**
	 * @type {number}
	 * @private
	 */
	this.boundingBoxPadding = 0;

	/** @type {Array.<bc.TextLine>} */
	this.lines = [];
};

/** @typedef {{text:string, top:number, size:number, width:number, bold:boolean, italic:boolean}} */
bc.TextLine;

/**
 * Apply the offset and return the result
 *
 * @return {Object}
 */
bc.model.Text.prototype.applyOffset = function() {
	var ret = {};

	ret[bc.properties.ITEM_X] = this.x() + this.offset.x;
	ret[bc.properties.ITEM_Y] = this.y() + this.offset.y;
	
	this.offset.x = 0;
	this.offset.y = 0;

	return ret;
};

/**
 * Sets the size of the bounding box (x == w, y == h)
 *
 * @param {goog.math.Coordinate} bbSize
 * @param {number} bbPad
 */
bc.model.Text.prototype.setBoundingBox = function(bbSize, bbPad) {
	this.boundingBox = bbSize;
	this.boundingBoxPadding = bbPad;
};

/**
 * @return {Array.<bc.TextLine>}
 */
bc.model.Text.prototype.calculateLines = function() {
	var defaultSize = 12,
		defaultLineSpacing = 1.5,
		lines = goog.string.trimRight(this.text()).replace(/\n\r/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ').split('\n'),
		offset = 0,
		ret = [];

	goog.array.forEach(lines, function(line, i) {
		ret.push({
			text: line,
			top: offset,
			size: defaultSize,
			width: -1,
			bold: false,
			italic: false
		});

		offset += defaultLineSpacing*defaultSize;
	});

	return this.lines = ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Text.parseParams = function(params) {
	params = params || {};
	
	return {
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		x:			params[bc.properties.ITEM_X],
		y:			params[bc.properties.ITEM_Y],
		text:		params[bc.properties.TEXT],
		textAlign:		params[bc.properties.TEXT_ALIGN],
		textBG:		params[bc.properties.TEXT_BG]
	};
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Text.prototype.setOffset = function(p) {
	this.offset.x = p.x;
	this.offset.y = p.y;
};

/**
 * @return {Object}
 */
bc.model.Text.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Text.prototype.getActionParams = function() {
	var me = this,
		ret = {};

	goog.array.forEach(this.actionProperties, function(key) {
		ret[key] = me.properties[key];
	});

	return ret;
};

/**
 * @param {Object} params
 */
bc.model.Text.prototype.setActionParams = function(params) {
	var me = this;
	goog.array.forEach(this.actionProperties, function(key) {
		if (params[key] !== undefined)
			me.properties[key] = params[key];
	});
};

/**
 * For text we hit test agains each line so we could put other items in the white space if we want
 *
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.Text.prototype.hitTest = function(x,y,selected) {
	if (!this.boundingBox)
		return false;

	var scale = this.scale(),
		ta = this.textAlign(),
		bb = new bc.math.Box(this.x(), this.y(), this.boundingBox.x*this.scale(), this.boundingBox.y*this.scale()),
		pad = (this.textBG() || selected) ? this.boundingBoxPadding : 0;

	if (ta == 'c')
		bb.x -= bb.w/2;
	else if (ta == 'r')
		bb.x -= bb.w;

	// if we are outside the bounding box (with padding), return early
	if (Math.abs(x - bb.x - bb.w/2) > bb.w/2 + pad || Math.abs(y - bb.y - bb.h/2) > bb.h/2 + pad) {
		return false;
	}

	// if we are in the box (which we have to be to get here) and text bg is on or the item is selected, return true.
	if (this.textBG() || selected) {
		return true;
	}
	else {
		var lw = 0; // line width
		for(var i = 0, l = this.lines.length; i < l; i++) {
			lw = this.lines[i].width*scale;
			if( lw > -1 &&
				x >= bb.x + (ta == 'c' ? bb.w/2 - lw/2 : (ta == 'r' ? bb.w - lw : 0)) &&
				x <= bb.x + (ta == 'c' ? bb.w/2 + lw/2 : (ta == 'r' ? bb.w : lw)) &&
				y >= bb.y + this.lines[i].top*scale &&
				y <= bb.y + (i+1 < l ? this.lines[i+1].top : (this.lines[i].top + this.lines[i].size))*scale
			) {
				return true;
			}
		}
	}

	return false;
};


/* === src/lib/betacreator/models/Stamp.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Stamp');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Stamp = function(params, defaults) {
	params = params || {};

	this.isStamp = true;

	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = null;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || defaults[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = params.color || defaults[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || defaults[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_LINEWIDTH] = params.lineWidth || 3;
	this.properties[bc.properties.ITEM_X] = params.x || 0;
	this.properties[bc.properties.ITEM_Y] = params.y || 0;
	this.properties[bc.properties.ITEM_W] = params.w || 18;
	this.properties[bc.properties.ITEM_H] = params.h || 18;
	this.properties[bc.properties.TEXT] = params.text || '';
	
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.w = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_W));
	this.h = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_H));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_X,
		bc.properties.ITEM_Y,
		bc.properties.ITEM_W,
		bc.properties.ITEM_H,
		bc.properties.TEXT
	];

	this.offset = new goog.math.Coordinate(0,0);
};

/**
 * Apply the offset and return the result
 *
 * @return {Object}
 */
bc.model.Stamp.prototype.applyOffset = function() {
	var ret = {};

	ret[bc.properties.ITEM_X] = this.x() + this.offset.x;
	ret[bc.properties.ITEM_Y] = this.y() + this.offset.y;
	
	this.offset.x = 0;
	this.offset.y = 0;

	return ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Stamp.parseParams = function(params) {
	params = params || {};
	
	return {
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		lineWidth:	params[bc.properties.ITEM_LINEWIDTH],
		x:			params[bc.properties.ITEM_X],
		y:			params[bc.properties.ITEM_Y],
		w:			params[bc.properties.ITEM_W],
		h:			params[bc.properties.ITEM_H],
		text:		params[bc.properties.TEXT]
	};
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Stamp.prototype.setOffset = function(p) {
	this.offset.x = p.x;
	this.offset.y = p.y;
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.getActionParams = function() {
	var me = this,
		ret = {};

	goog.array.forEach(this.actionProperties, function(key) {
		ret[key] = me.properties[key];
	});

	return ret;
};

/**
 * @param {Object} params
 */
bc.model.Stamp.prototype.setActionParams = function(params) {
	var me = this;
	goog.array.forEach(this.actionProperties, function(key) {
		if (params[key] !== undefined)
			me.properties[key] = params[key];
	});
};


/* === src/lib/betacreator/models/stamps/Anchor.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.model.stamp.Anchor');

goog.require('bc.model.Stamp');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Anchor = function(params, defaults) {
	params = params || {};
	
	if (!params.w)
		params.w = 10;
	if (!params.h)
		params.h = 10;

	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.ANCHOR);
};
goog.inherits(bc.model.stamp.Anchor, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Anchor.prototype.hitTest = function(x,y,selected) {
	var scale = this.scale(),
		w = this.w()*scale,
		h = this.h()*scale,
		dist = this.lineWidth()*scale/2 + 6;
	
	if(bc.math.distanceFromLineSegment(
			new goog.math.Coordinate(x,y),
			new goog.math.Coordinate(this.x() - w/2, this.y() - h/2),
			new goog.math.Coordinate(this.x() + w/2, this.y() + h/2)
		) < dist || bc.math.distanceFromLineSegment(
			new goog.math.Coordinate(x,y),
			new goog.math.Coordinate(this.x() + w/2, this.y() - h/2),
			new goog.math.Coordinate(this.x() - w/2, this.y() + h/2)
		) < dist) {
		return true;
	}

	return false;
};


/* === src/lib/betacreator/models/stamps/Belay.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.model.stamp.Belay');

goog.require('bc.model.Stamp');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Belay = function(params, defaults) {
	params = params || {};
	
	if (!params.lineWidth)
		params.lineWidth = 2;

	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.BELAY);
};
goog.inherits(bc.model.stamp.Belay, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Belay.prototype.hitTest = function(x,y,selected) {
	var dist = this.lineWidth()*this.scale()/2 + 1;

	if (goog.math.Coordinate.distance(
			new goog.math.Coordinate(x, y),
			new goog.math.Coordinate(this.x(), this.y())
		) <= this.w()*this.scale()/2 + dist)
		return true;

	return false;
};


/* === src/lib/betacreator/models/stamps/Piton.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.model.stamp.Piton');

goog.require('bc.model.Stamp');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Piton = function(params, defaults) {
	params = params || {};

	if (!params.w)
		params.w = 12;
	if (!params.h)
		params.h = 12;

	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.PITON);
};
goog.inherits(bc.model.stamp.Piton, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Piton.prototype.hitTest = function(x,y,selected) {
	var dist = this.lineWidth()*this.scale()/2 + 1,
		w = this.w()*this.scale(),
		h = this.h()*this.scale();

	// if the point is outside the bounding box return early
	if (Math.abs(x - this.x()) > w/2 + dist || Math.abs(y - this.y()) > h/2 + dist)
		return false;

	var leftEdge = this.x() - 0.1*w,
		pBottom = this.y() + 0.1*h;

	if (x < leftEdge - dist || (x > leftEdge + dist && y > pBottom + dist))
		return false;

	return true;
};


/* === src/lib/betacreator/models/stamps/Rappel.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.model.stamp.Rappel');

goog.require('bc.model.Stamp');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Rappel = function(params, defaults) {
	params = params || {};
	
	if (!params.lineWidth)
		params.lineWidth = 2;
	
	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.RAPPEL);
};
goog.inherits(bc.model.stamp.Rappel, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Rappel.prototype.hitTest = function(x,y,selected) {
	var dist = this.lineWidth()*this.scale()/2 + 1;

	if (goog.math.Coordinate.distance(
			new goog.math.Coordinate(x, y),
			new goog.math.Coordinate(this.x(), this.y())
		) <= this.w()*this.scale()/2 + dist)
		return true;

	return false;
};


/* === src/lib/betacreator/views/Item.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Item');

/**
 * @interface
 */
bc.view.Item = function() {};

/**
 * @param {number=} pageScale
 * @param {boolean=} selected
 * @param {bc.Client.modes=} mode
 */
bc.view.Item.prototype.render = function(pageScale, selected, mode) {};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number=} scale
 */
bc.view.Item.prototype.renderToContext = function(ctx, scale) {};

/**
 */
bc.view.Item.prototype.destroy = function() {};


/* === src/lib/betacreator/views/Canvas.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Canvas');

goog.require('bc.model.Canvas');
goog.require('bc.view.stamp.Anchor');
goog.require('bc.view.stamp.Piton');
goog.require('bc.view.stamp.Rappel');
goog.require('bc.view.stamp.Belay');
goog.require('bc.view.Text');
goog.require('bc.view.Line');
goog.require('goog.dom');

/**
 * @param {bc.controller.Canvas} controller
 * @param {bc.model.Canvas} model
 * @constructor
 */
bc.view.Canvas = function(controller, model) {
	this.controller = controller;
	this.model = model;

	/**
	 * @type {number}
	 * @private
	 */
	this.scaleLastRender = 1;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.needsRender = true;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.needsCentering = false;
	
	this.container = goog.dom.createDom(goog.dom.TagName.DIV, 'canvas-container');
	goog.dom.appendChild(this.container, this.model.image);
	
	this.itemContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.container, this.itemContainer);
	
	/** @type {Object.<string,bc.view.Item>} */
	this.views = {};
	
	setInterval(goog.bind(this.checkRender, this), 10);
	
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.CANVAS_RENDER, goog.bind(this.invalidate, this));
};

/**
 * @param {boolean=} force Force re-render
 * @private
 */
bc.view.Canvas.prototype.invalidate = function(force) {
	this.needsRender = true;
	
	if (force)
		this.checkRender();
};

/**
 * @private
 */
bc.view.Canvas.prototype.checkRender = function() {
	if (this.needsRender)
		this.render(this.model.scale);
		
	this.needsRender = false;
};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Canvas.prototype.render = function(pageScale) {
	var me = this,
		itemIdMap = {};
	
	this.model.eachItem(function(item) {
		me.renderItem(item, pageScale);
		itemIdMap[item.id] = true;
	}, true);
	
	// destroy the views for any deleted items
	for (var viewId in this.views) {
		if (!itemIdMap[viewId]) {
			this.views[viewId].destroy();
			delete this.views[viewId];
		}
	}

	// if the page scale has changed, change the image size and center when zooming
	if (this.model.scale != this.scaleLastRender || this.needsCentering) {
		goog.style.setStyle(this.container, {
			'width': Math.round(this.model.scale*this.model.w) + 'px',
			'height': Math.round(this.model.scale*this.model.h) + 'px'
		});

		if (this.needsCentering) {
			this.controller.setCenterOffset();

			this.needsCentering = false;
		}
		else {
			this.controller.setZoomOffset(this.model.scale/this.scaleLastRender);
		}

		this.container.style.left = this.controller.offset.x + 'px';
		this.container.style.top = this.controller.offset.y + 'px';
	}

	this.scaleLastRender = this.model.scale;
};

/**
 * @param {bc.model.Item} item
 * @param {number=} pageScale
 * @private
 */
bc.view.Canvas.prototype.renderItem = function(item, pageScale) {
	pageScale = pageScale || 1;
	
	var view = this.views[item.id];
	// if no view exists for the item, create it
	if (!view) {
		switch (item.type()) {
			case bc.model.ItemTypes.ANCHOR:
				view = new bc.view.stamp.Anchor(/** @type {bc.model.stamp.Anchor} */(item));
				break;
			case bc.model.ItemTypes.PITON:
				view = new bc.view.stamp.Piton(/** @type {bc.model.stamp.Piton} */(item));
				break;
			case bc.model.ItemTypes.RAPPEL:
				view = new bc.view.stamp.Rappel(/** @type {bc.model.stamp.Rappel} */(item));
				break;
			case bc.model.ItemTypes.BELAY:
				view = new bc.view.stamp.Belay(/** @type {bc.model.stamp.Belay} */(item));
				break;
			case bc.model.ItemTypes.TEXT:
				view = new bc.view.Text(/** @type {bc.model.Text} */(item));
				break;
			case bc.model.ItemTypes.LINE:
				view = new bc.view.Line(/** @type {bc.model.Line} */(item));
				break;
			default:
				break;
		}
		
		// if for some reason there is still now view, return early
		if (!view)
			return;
		
		this.views[item.id] = view;
		goog.dom.appendChild(this.itemContainer, view.canvas);
	}
	
	view.render(pageScale, this.controller.isItemSelected(item), this.controller.mode.id);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

bc.view.Canvas.prototype.centerInViewport = function() {
	this.needsCentering = true;
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number=} scale
 */
bc.view.Canvas.prototype.renderToContext = function(ctx, scale) {
	var me = this;
	this.model.eachItem(function(item) {
		if (me.views[item.id])
			me.views[item.id].renderToContext(ctx, scale);
	});
};


/* === src/lib/betacreator/views/Line.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Line');

goog.require('bc.view.Item');
goog.require('bc.model.Line');
goog.require('bc.math');
goog.require('bc.object');
goog.require('bc.color');
goog.require('bc.render.DashedLine');
goog.require('goog.dom');
goog.require('goog.array');

/**
 * @param {bc.model.Line} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Line = function(model) {
	this.model = model;
	
	this.defaultPadding = 10;
	this.padding = this.defaultPadding;

	/** @type {?Object} */
	this.drawProperties = null;
	/** @type {?Object} */
	this.locationProperties = null;
	
	this.canvas = goog.dom.createElement('canvas');
	this.canvas.width = 2*this.padding;
	this.canvas.height = 2*this.padding;
	this.canvas.style.position = 'absolute';
};



/**
 * @param {CanvasRenderingContext2D} context
 * @param {string=} color
 * @param {number=} lineWidth
 * 
 * @private
 */
bc.view.Line.prototype._draw = function(context, color, lineWidth) {
	var me = this,
		scale = this.model.scale(),
		isDashed = this.model.offLength() > 0;
	
	context.strokeStyle = color || this.model.color();
	context.lineWidth = lineWidth || this.model.lineWidth()*scale;
	
	/** @type {CanvasRenderingContext2D|bc.render.DashedLine} */
	var ctx = isDashed ? new bc.render.DashedLine(context, this.model.onLength()*scale, this.model.offLength()*scale) : context;
	
	ctx.beginPath();
	
	if (this.model.curved()) {
		var cps = this.model.controlPoints();
		var cpLength = cps.length;
		goog.array.forEach(cps, function(cp, i) {
			// for first point, just move to it
			if (i === 0) {
				ctx.moveTo(cp.x, cp.y);
			}
			else {
				var prevCP = cps[i - 1];
				
				// for second point just draw a line to half way between it and
				// the first
				if (i == 1)
					ctx.lineTo((cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2);
				// for every other points, draw a curve from the previous
				// half-way pointto the current half-way point
				else
					ctx.quadraticCurveTo(prevCP.x, prevCP.y, (cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2);
				
				// if it's the last point, do a final lineTo
				if (i == cpLength - 1)
					ctx.lineTo(cp.x, cp.y);
			}
		});
	}
	else {
		goog.array.forEach(this.model.controlPoints(), function(cp, i) {
			// for first point, just move to it
			if (i === 0)
				ctx.moveTo(cp.x, cp.y);
			// for every other points just lineTo it
			else
				ctx.lineTo(cp.x, cp.y);
		});
	}
	
	ctx.stroke();

	if (isDashed)
		ctx.destroy();
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pageScale
 * @param {boolean=} selected
 * 
 * @private
 */
bc.view.Line.prototype.draw = function(ctx, pageScale, selected) {
	var scale = this.model.scale();
	ctx.save();
	ctx.lineCap = 'round';
	
	if (selected) {
		ctx.save();
		this._draw(ctx, 'rgba(255,0,0,0.75)', this.model.lineWidth()*scale + 4/pageScale);
		ctx.restore();
	}
	else {
		ctx.save();
		this._draw(ctx, bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5), this.model.lineWidth()*scale + 2/pageScale);
		ctx.restore();
	}

	this._draw(ctx);
	ctx.restore();
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number=} scale
 * 
 * @private
 */
bc.view.Line.prototype.drawControlPoints = function(ctx, scale) {
	scale = scale || 1;

	var me = this,
		strokeColor = this.model.color(),
		shadowColor = bc.color.highContrastWhiteOrBlack(strokeColor, 0.5),
		r = 7/scale;
	
	ctx.save();
	
	goog.array.forEach(this.model.controlPoints(), function(cp, i) {
		ctx.beginPath();
		ctx.moveTo(cp.x + r, cp.y);
		ctx.arc(cp.x,cp.y,r,0,2*Math.PI,false);
		ctx.strokeStyle = shadowColor;
		ctx.lineWidth = 6/scale;
		ctx.stroke();
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 4/scale;
		ctx.stroke();
	});
	
	ctx.restore();
};

/**
 * @param {number=} scale
 * @private
 */
bc.view.Line.prototype.updateLocation = function(scale) {
	scale = scale || 1;
	
	this.canvas.style.left = Math.round(scale*(this.model.offset.x + this.model.bb.x) - this.padding) + 'px';
	this.canvas.style.top = Math.round(scale*(this.model.offset.y + this.model.bb.y) - this.padding) + 'px';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scale
 * @param {boolean=} selected
 * @param {?bc.Client.modes=} mode
 * @param {boolean=} directOnCanvas Skip resizing and clearing canvas if true
 * @private
 */
bc.view.Line.prototype._render  = function(ctx, scale, selected, mode, directOnCanvas) {
	this.padding = this.defaultPadding*Math.max(1,this.model.scale()*scale);

	this.model.updateBoundingBox();
	this.model.updatePoints();

	var canvasWidth = Math.round(scale*this.model.bb.w) + 2*this.padding,
		canvasHeight = Math.round(scale*this.model.bb.h) + 2*this.padding;

	if (!directOnCanvas) {
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}

	ctx.save();

	if (!directOnCanvas)
		ctx.translate(this.padding - Math.round(scale*this.model.bb.x), this.padding - Math.round(scale*this.model.bb.y));

	ctx.scale(scale, scale);

	this.draw(ctx, scale, selected);

	if (selected && mode == bc.Client.modes.LINE_EDIT)
		this.drawControlPoints(ctx, scale);

	ctx.restore();
};



/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @inheritDoc
 */
bc.view.Line.prototype.render = function(scale, selected, mode) {
	scale = scale || 1;

	var drawProperties = this.model.serializeParams();
	drawProperties.scale = scale;
	drawProperties.selected = !!selected;
	drawProperties.mode = mode || null;
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;

		var ctx = this.canvas.getContext('2d');

		this._render(ctx, scale, selected, mode);
	}

	var locationProperties = {
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		x: this.model.bb.x,
		y: this.model.bb.y,
		w: this.model.bb.w,
		h: this.model.bb.h,
		scale: scale*this.model.scale()
	};
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(scale);
	}
};

/**
 * @inheritDoc
 */
bc.view.Line.prototype.renderToContext = function(ctx, scale) {
	ctx.save();
	this._render(ctx, (scale || 1), false, null, true);
	ctx.restore();
};

bc.view.Line.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};


/* === src/lib/betacreator/views/Text.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Text');

goog.require('bc.view.Item');
goog.require('bc.model.Text');
goog.require('bc.object');
goog.require('goog.dom');

/**
 * @param {bc.model.Text} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Text = function(model) {
	this.model = model;
	this.defaultPadding = 15;
	this.padding = this.defaultPadding;
	
	/** @type {?Object} */
	this.drawProperties = null;

	/** @type {?Object} */
	this.locationProperties = null;

	/** @type {?goog.math.Coordinate} */
	this.boundingBox = null;
	
	this.canvas = goog.dom.createElement(goog.dom.TagName.CANVAS);
	this.canvas.style.position = 'absolute';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string=} strokeColor
 * @param {number=} strokeWidth
 * @private
 */
bc.view.Text.prototype.draw = function(ctx, strokeColor, strokeWidth) {
	var oneSize, oneBold, oneItalic,
		me = this,
		regular = strokeColor === undefined;

	switch (this.model.textAlign()) {
		case 'c':
			ctx.textAlign = 'center';
			break;
		case 'r':
			ctx.textAlign = 'right';
			break;
		default:
			ctx.textAlign = 'left';
			break;
	}
	ctx.textBaseline = 'top';
	ctx.fillStyle = this.model.color();
	ctx.strokeStyle = strokeColor || this.model.color();
	ctx.lineWidth = strokeWidth || 0;

	goog.array.forEach(this.model.lines, function(line, i) {
		if (oneSize != line.size || oneBold != line.bold || oneItalic != line.italic) {
			oneSize = line.size;
			oneBold = line.bold;
			oneItalic = line.italic;
			ctx.font = me.getFontStyle(line.italic, line.bold, line.size);
		}
		if (regular)
			ctx.fillText(line.text, 0, line.top);
		else
			ctx.strokeText(line.text, 0, line.top);
	});
};

/**
 * @param {boolean} italic
 * @param {boolean} bold
 * @param {number} size
 *
 * @return {string}
 * @private
 */
bc.view.Text.prototype.getFontStyle = function(italic, bold, size) {
	var font = '';

	if (italic)
		font += 'italic ';

	if (bold)
		font += 'bold ';

	return font + size + 'px Arial, Helvetica, sans-serif';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 *
 * @return {goog.math.Coordinate}
 * @private
 */
bc.view.Text.prototype.calculateBoundingBox = function(ctx) {
	var me = this,
		maxWidth = 2048,
		w = 0;

	ctx.save();
	goog.array.forEach(this.model.lines, function(line, i) {
		ctx.font = me.getFontStyle(line.italic, line.bold, line.size);
		line.width = ctx.measureText(line.text).width;
		w = Math.min(maxWidth, Math.max(line.width, w));
	});
	ctx.restore();

	return new goog.math.Coordinate(w, this.model.lines[this.model.lines.length-1].top + this.model.lines[this.model.lines.length-1].size);
};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Text.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.model.scale(),
		canvasWidth = Math.round(scale*this.boundingBox.x) + 2*this.padding,
		canvasHeight = Math.round(scale*this.boundingBox.y) + 2*this.padding;
	
	switch(this.model.textAlign()) {
		case 'c':
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth/2) + 'px';
			break;
		case 'r':
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth + this.padding) + 'px';
			break;
		default:
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - this.padding) + 'px';
			break;
	}

	this.canvas.style.top = Math.round(pageScale*(this.model.y() + this.model.offset.y) - this.padding) + 'px';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scale
 * @param {boolean=} selected
 * @param {boolean=} directOnCanvas Skip resizing and clearing canvas if true
 * @param {number=} directScale
 * @private
 */
bc.view.Text.prototype._render  = function(ctx, scale, selected, directOnCanvas, directScale) {
	this.padding = this.defaultPadding*Math.max(1,scale);

	this.model.calculateLines();
	this.boundingBox = this.calculateBoundingBox(ctx);
	this.model.setBoundingBox(this.boundingBox, this.padding);

	var canvasWidth = Math.round(scale*this.boundingBox.x) + 2*this.padding,
		canvasHeight = Math.round(scale*this.boundingBox.y) + 2*this.padding;
	
	if (!directOnCanvas) {
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}

	ctx.save();

	if (directOnCanvas) {
		ctx.translate(this.model.x(), this.model.y());
		switch(this.model.textAlign()) {
			case 'c':
				ctx.translate(-canvasWidth/2, -this.padding);
				break;
			case 'r':
				ctx.translate(-canvasWidth + this.padding, -this.padding);
				break;
			default:
				ctx.translate(-this.padding, -this.padding);
				break;
		}
	}

	if (this.model.textBG()) {
		ctx.save();
		ctx.fillStyle = bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5);
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.restore();
	}

	if (selected) {
		ctx.save();
		ctx.strokeStyle = 'rgba(255,0,0,0.75)';
		ctx.lineWidth = 1;
		ctx.strokeRect(0.5, 0.5, canvasWidth-1, canvasHeight-1);
		ctx.restore();
	}

	switch(this.model.textAlign()) {
		case 'c':
			ctx.translate(canvasWidth/2, this.padding);
			break;
		case 'r':
			ctx.translate(canvasWidth - this.padding, this.padding);
			break;
		default:
			ctx.translate(this.padding, this.padding);
			break;
	}

	ctx.scale(scale, scale);
	ctx.lineCap = 'round';
	
	if (!this.model.textBG()) {
		ctx.save();
		this.draw(ctx, bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5), 2/(scale * (directScale || 1)));
		ctx.restore();
	}
	
	this.draw(ctx);
	
	ctx.restore();
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @inheritDoc
 */
bc.view.Text.prototype.render = function(pageScale, selected, mode) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.model.scale();
	
	var drawProperties = {
		color: this.model.color(),
		alpha: this.model.alpha(),
		scale: scale,
		selected: selected,
		text: this.model.text(),
		textAlign: this.model.textAlign(),
		textBG: this.model.textBG()
	};
	
	var locationProperties = {
		x: this.model.x(),
		y: this.model.y(),
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		scale: scale,
		textAlign: this.model.textAlign()
	};
	
	// if something has changed since last rendering that will affect rendering,
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;

		var ctx = this.canvas.getContext('2d');

		this._render(ctx, scale, selected);
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
};

/**
 * @inheritDoc
 */
bc.view.Text.prototype.renderToContext = function(ctx, scale) {
	ctx.save();
	ctx.scale(scale || 1, scale || 1);
	this._render(ctx, this.model.scale(), false, true, scale);
	ctx.restore();
};

bc.view.Text.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};


/* === src/lib/betacreator/views/Stamp.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Stamp');

goog.require('bc.view.Item');
goog.require('bc.model.Stamp');
goog.require('bc.object');
goog.require('goog.dom');

/**
 * @param {bc.model.Stamp} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Stamp = function(model) {
	this.model = model;
	this.defaultPadding = 10;
	this.padding = this.defaultPadding;
	
	/** @type {?Object} */
	this.drawProperties = null;
	/** @type {?Object} */
	this.locationProperties = null;
	
	this.canvas = goog.dom.createElement(goog.dom.TagName.CANVAS);
	this.canvas.width = this.model.w() + 2*this.padding;
	this.canvas.height = this.model.h() + 2*this.padding;
	this.canvas.style.position = 'absolute';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string=} color
 * @param {number=} lineWidth
 * @protected
 */
bc.view.Stamp.prototype.draw = function(ctx, color, lineWidth) {};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Stamp.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.model.scale(),
		canvasWidth = Math.round(scale*this.model.w()) + 2*this.padding,
		canvasHeight = Math.round(scale*this.model.h()) + 2*this.padding;
	
	this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth/2) + 'px';
	this.canvas.style.top = Math.round(pageScale*(this.model.y() + this.model.offset.y) - canvasHeight/2) + 'px';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scale
 * @param {boolean=} selected
 * @param {boolean=} directOnCanvas Skip resizing and clearing canvas if true
 * @param {number=} directScale
 * @private
 */
bc.view.Stamp.prototype._render  = function(ctx, scale, selected, directOnCanvas, directScale) {
	this.padding = this.defaultPadding*Math.max(1,scale);
		
	var canvasWidth = Math.round(scale*this.model.w()) + 2*this.padding,
		canvasHeight = Math.round(scale*this.model.h()) + 2*this.padding;
	
	if (!directOnCanvas) {
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}

	ctx.save();

	if (directOnCanvas) {
		ctx.translate(Math.round(this.model.x() - canvasWidth/2), Math.round(this.model.y() - canvasHeight/2));
	}
	
	ctx.translate(this.padding, this.padding);
	ctx.scale(scale, scale);
	ctx.lineCap = 'round';

	if (selected) {
		ctx.save();
		// this.draw(ctx, 'rgba(52,156,240,0.75)', this.model.lineWidth() + 4/scale);
		this.draw(ctx, 'rgba(255,0,0,0.75)', this.model.lineWidth() + 4/scale);
		ctx.restore();
	}

	ctx.save();
	this.draw(
		ctx,
		bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5),
		this.model.lineWidth() + 2/(scale * (directScale || 1))
	);
	ctx.restore();
	
	this.draw(ctx);
	
	ctx.restore();
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @inheritDoc
 */
bc.view.Stamp.prototype.render = function(pageScale, selected, mode) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.model.scale();
	
	var drawProperties = {
		w: this.model.w(),
		h: this.model.h(),
		color: this.model.color(),
		alpha: this.model.alpha(),
		scale: scale,
		selected: selected,
		text: this.model.text()
	};
	
	var locationProperties = {
		x: this.model.x(),
		y: this.model.y(),
		w: this.model.w(),
		h: this.model.h(),
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		scale: scale
	};
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;

		var ctx = this.canvas.getContext('2d');

		this._render(ctx, scale, selected);
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
};

/**
 * @inheritDoc
 */
bc.view.Stamp.prototype.renderToContext = function(ctx, scale) {
	ctx.save();
	ctx.scale(scale || 1, scale || 1);
	this._render(ctx, this.model.scale(), false, true, scale);
	ctx.restore();
};

bc.view.Stamp.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};


/* === src/lib/betacreator/views/stamps/Anchor.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.stamp.Anchor');

goog.require('bc.model.stamp.Anchor');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Anchor} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Anchor = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Anchor} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Anchor, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Anchor.prototype.draw = function(ctx, color, lineWidth) {
	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(this.model.w(),this.model.h());
	ctx.moveTo(this.model.w(),0);
	ctx.lineTo(0,this.model.h());
	ctx.stroke();
};


/* === src/lib/betacreator/views/stamps/Belay.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.stamp.Belay');

goog.require('bc.model.stamp.Belay');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Belay} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Belay = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Belay} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Belay, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Belay.prototype.draw = function(ctx, color, lineWidth) {
	var regular = color === undefined,
		startAngle = 0,
		w = this.model.w(),
		h = this.model.h(),
		r = Math.min(w,h)/2;

	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();

	ctx.moveTo(w/2 + r*Math.cos(startAngle), h/2 + r*Math.sin(startAngle));
	ctx.arc(w/2,h/2,r,startAngle,Math.PI*2,false);

	ctx.stroke();

	if (this.model.text()) {
		ctx.font = '12px Arial, Helvetica, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if (regular) {
			ctx.fillStyle = this.model.color();
			ctx.fillText(this.model.text(), w/2, h/2);
		}
		else {
			ctx.strokeStyle = color || this.model.color();
			ctx.lineWidth = Math.min(2, (lineWidth || this.model.lineWidth()) - this.model.lineWidth());
			ctx.strokeText(this.model.text(), w/2, h/2);
		}
	}
};


/* === src/lib/betacreator/views/stamps/Piton.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.stamp.Piton');

goog.require('bc.model.stamp.Piton');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Piton} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Piton = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Piton} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Piton, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Piton.prototype.draw = function(ctx, color, lineWidth) {
	var w = this.model.w(),
		h = this.model.h(),
		r = 0.3*h;

	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	
	ctx.moveTo(0.4*w,h);
	ctx.lineTo(0.4*w,0);
	ctx.lineTo(w-r,0);
	ctx.arc(w-r,r,r,-Math.PI/2,Math.PI/2,false);
	ctx.lineTo(0.4*w,2*r);

	ctx.stroke();
};


/* === src/lib/betacreator/views/stamps/Rappel.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.stamp.Rappel');

goog.require('bc.model.stamp.Rappel');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Rappel} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Rappel = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Rappel} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Rappel, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Rappel.prototype.draw = function(ctx, color, lineWidth) {
	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	
	var startAngle = 0,
		w = this.model.w(),
		h = this.model.h(),
		r = Math.min(this.model.w(),this.model.h())/2;

	ctx.moveTo(w/2 + r*Math.cos(startAngle), h/2 + r*Math.sin(startAngle));
	ctx.arc(w/2,h/2,r,startAngle,Math.PI*2,false);

	// draw the arrow
	ctx.moveTo(w/2,0.25*h);
	ctx.lineTo(w/2,0.75*h);
	ctx.moveTo(0.25*w,h/2);
	ctx.lineTo(w/2,0.75*h);
	ctx.lineTo(0.75*w,h/2);

	ctx.stroke();
};


/* === src/lib/betacreator/render/DashedLine.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  The DashedLine class provides a means to draw with standard drawing
 *  methods but allows you to draw using dashed lines. Dashed lines are continuous
 *  between drawing commands so dashes won't be interrupted when new lines
 *  are drawn in succession
 *
 *  This code is a conversion of Trevor McCauley's ActionScript 3 DashedLine class
 */
 
goog.provide('bc.render.DashedLine');

goog.require('bc.math');

/**
 * @param {CanvasRenderingContext2D} context The canvas context to draw the line on.
 * @param {number} onLength Length of visible dash lines.
 * @param {number} offLength Length of space between dash lines.
 *
 * @constructor
 */
bc.render.DashedLine = function(context, onLength, offLength) {
	
	/**
	 * The target context in which drawings are to be made
	 * @type {CanvasRenderingContext2D}
	 */
	this.ctx = context;
	/**
	 * A value representing the accuracy used in determining the length
	 * of curveTo curves.
	 *
	 * @type {number}
	 */
	this._curveaccuracy = 6;
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this.isLine = true;
	/**
	 * @type {number}
	 * @private
	 */
	this.overflow = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.offLength = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.onLength = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.dashLength = 0;
	/**
	 * @type {Object}
	 * @private
	 */
	this.pen = null;
	
	
	this.setDash(onLength, offLength);
	this.isLine = true;
	this.overflow = 0;
	this.pen = {x:0, y:0};
};


// public methods
/**
* Sets new lengths for dash sizes
* @param {number} onLength Length of visible dash lines.
* @param {number} offLength Length of space between dash lines.
*/
bc.render.DashedLine.prototype.setDash = function(onLength, offLength) {
	this.onLength = onLength;
	this.offLength = offLength;
	this.dashLength = this.onLength + this.offLength;
};

/**
* Gets the current lengths for dash sizes
*
* @return {Array.<number>} Array containing the onLength and offLength values
* respectively in that order
*/
bc.render.DashedLine.prototype.getDash = function() {
	return [this.onLength, this.offLength];
};

/**
* Moves the current drawing position in target to (x, y).
*
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.moveTo = function(x, y) {
	this.ctxMoveTo(x, y);
};

/**
* Draws a dashed line in target using the current line style from the current drawing position
* to (x, y); the current drawing position is then set to (x, y).
*
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.lineTo = function(x,y) {
	var dx = x-this.pen.x,	dy = y-this.pen.y;
	var a = Math.atan2(dy, dx);
	var ca = Math.cos(a), sa = Math.sin(a);
	var segLength = bc.math.Line.lineLength(0, 0, dx, dy);
	
	if (this.overflow){
		if (this.overflow > segLength){
			if (this.isLine) this.ctxLineTo(x, y);
			else this.ctxMoveTo(x, y);
			this.overflow -= segLength;
			
			return;
		}
		
		if (this.isLine)
			this.ctxLineTo(this.pen.x + ca*this.overflow, this.pen.y + sa*this.overflow);
		else
			this.ctxMoveTo(this.pen.x + ca*this.overflow, this.pen.y + sa*this.overflow);
		
		segLength -= this.overflow;
		this.overflow = 0;
		this.isLine = !this.isLine;
		
		if (!segLength)
			return;
	}
	
	var fullDashCount = Math.floor(segLength/this.dashLength);
	
	if (fullDashCount){
		var onx = ca*this.onLength,	ony = sa*this.onLength;
		var offx = ca*this.offLength, offy = sa*this.offLength;
		for (var i=0; i<fullDashCount; i++) {
			if (this.isLine){
				this.ctxLineTo(this.pen.x+onx, this.pen.y+ony);
				this.ctxMoveTo(this.pen.x+offx, this.pen.y+offy);
			}
			else{
				this.ctxMoveTo(this.pen.x+offx, this.pen.y+offy);
				this.ctxLineTo(this.pen.x+onx, this.pen.y+ony);
			}
		}
		segLength -= this.dashLength*fullDashCount;
	}
	
	if (this.isLine){
		if (segLength > this.onLength){
			this.ctxLineTo(this.pen.x+ca*this.onLength, this.pen.y+sa*this.onLength);
			this.ctxMoveTo(x, y);
			this.overflow = this.offLength-(segLength-this.onLength);
			this.isLine = false;
		}
		else{
			this.ctxLineTo(x, y);
			if (segLength == this.onLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else{
				this.overflow = this.onLength-segLength;
				this.ctxMoveTo(x, y);
			}
		}
	}
	else{
		if (segLength > this.offLength){
			this.ctxMoveTo(this.pen.x+ca*this.offLength, this.pen.y+sa*this.offLength);
			this.ctxLineTo(x, y);
			this.overflow = this.onLength-(segLength-this.offLength);
			this.isLine = true;
		}
		else{
			this.ctxMoveTo(x, y);
			if (segLength == this.offLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else {
				this.overflow = this.offLength-segLength;
			}
		}
	}
};

/**
* Draws a dashed curve in target using the current line style from the current drawing position to
* (x, y) using the control point specified by (cx, cy). The current  drawing position is then set
* to (x, y).
*
* @param {number} cx Control point x
* @param {number} cy Control point y
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.quadraticCurveTo = function(cx, cy, x, y) {
	/**@type {number} */
	var sx = this.pen.x;
	/**@type {number} */
	var sy = this.pen.y;
	/**@type {number} */
	var segLength = bc.math.Line.curveLength(sx, sy, cx, cy, x, y, this._curveaccuracy);
	/**@type {number} */
	var t = 0;
	/**@type {number} */
	var t2 = 0;
	/**@type {Array.<number>} */
	var c;
	
	if (this.overflow){
		if (this.overflow > segLength){
			if (this.isLine) this.ctxCurveTo(cx, cy, x, y);
			else this.ctxMoveTo(x, y);
			this.overflow -= segLength;
			return;
		}
		
		t = this.overflow/segLength;
		c = bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, x, y, t);
		
		if (this.isLine)
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
		else
			this.ctxMoveTo(c[4], c[5]);
		
		this.overflow = 0;
		this.isLine = !this.isLine;
		
		if (!segLength)
			return;
	}
	
	var remainLength = segLength - segLength*t;
	var fullDashCount = Math.floor(remainLength/this.dashLength);
	var ont = this.onLength/segLength;
	var offt = this.offLength/segLength;
	
	if (fullDashCount){
		for (var i=0; i<fullDashCount; i++){
			if (this.isLine){
				t2 = t + ont;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxCurveTo(c[2], c[3], c[4], c[5]);
				t = t2;
				t2 = t + offt;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxMoveTo(c[4], c[5]);
			}
			else{
				t2 = t + offt;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxMoveTo(c[4], c[5]);
				t = t2;
				t2 = t + ont;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			}
			t = t2;
		}
	}
	
	remainLength = segLength - segLength*t;
	
	if (this.isLine){
		if (remainLength > this.onLength){
			t2 = t + ont;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			this.ctxMoveTo(x, y);
			this.overflow = this.offLength-(remainLength-this.onLength);
			this.isLine = false;
		}
		else{
			c = bc.math.Line.curveSliceFrom(sx, sy, cx, cy, x, y, t);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			if (segLength == this.onLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else{
				this.overflow = this.onLength-remainLength;
				this.ctxMoveTo(x, y);
			}
		}
	}
	else{
		if (remainLength > this.offLength){
			t2 = t + offt;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			this.ctxMoveTo(c[4], c[5]);
			c = bc.math.Line.curveSliceFrom(sx, sy, cx, cy, x, y, t2);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);

			this.overflow = this.onLength-(remainLength-this.offLength);
			this.isLine = true;
		}
		else{
			this.ctxMoveTo(x, y);
			if (remainLength == this.offLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else {
				this.overflow = this.offLength-remainLength;
			}
		}
	}
};

// direct translations
/**
* Begin path
*/
bc.render.DashedLine.prototype.beginPath = function() {
	this.ctx.beginPath();
};

/**
* Apply Stroke
*/
bc.render.DashedLine.prototype.stroke = function() {
	this.ctx.stroke();
};

/**
* Clears the drawing
*
* @param {number} x
* @param {number} y
* @param {number} w
* @param {number} h
*/
bc.render.DashedLine.prototype.clearRect = function(x,y,w,h) {
	this.ctx.clearRect(x,y,w,h);
};

/**
* Sets the lineStyle for target
* @param {number} thickness A number that indicates the thickness of the line in points
* @param {string} rgb A hex color value (for example, red is #FF0000, blue is #0000FF, and so on) of
* the line. If a value is not indicated, JavaScript uses #000000 (black).
*/
bc.render.DashedLine.prototype.lineStyle = function(thickness,rgb) {
	this.ctx.lineWidth = thickness;
	this.ctx.strokeStyle = rgb;
};

/**
* Destroy the Dashed Line instance
*/
bc.render.DashedLine.prototype.destroy = function() {
	this.ctx = null;
	this.pen = null;
};

/**
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxMoveTo = function(x, y) {
	this.pen = {x:x, y:y};
	this.ctx.moveTo(x, y);
};

/**
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxLineTo = function(x, y) {
	if (x == this.pen.x && y == this.pen.y)
		return;
	
	this.pen = {x:x, y:y};
	this.ctx.lineTo(x, y);
};

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxCurveTo = function(cx, cy, x, y) {
	if (cx == x && cy == y && x == this.pen.x && y == this.pen.y)
		return;
	
	this.pen = {x:x, y:y};
	this.ctx.quadraticCurveTo(cx, cy, x, y);
};


/* === src/lib/betacreator/modes/Mode.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.Mode');

//goog.require('bc.model.Canvas');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 *
 * @constructor
 */
bc.Mode = function(canvas, id) {
	this.canvas = canvas;
	this.id = id;
};

/**
 * @param {Event} e
 * @param {goog.math.Coordinate} point
 */
bc.Mode.prototype.mouseDown = function(e, point) {};

/**
 * @param {Event} e
 * @param {goog.math.Coordinate} point
 */
bc.Mode.prototype.mouseMove = function(e, point) {};

/**
 * @param {Event} e
 * @param {goog.math.Coordinate} point
 */
bc.Mode.prototype.mouseUp = function(e, point) {};

/**
 * @param {Event} e
 * @param {goog.math.Coordinate} point
 */
bc.Mode.prototype.dblClick = function(e, point) {};

/**
 * @param {Event} e
 * @return {boolean|undefined}
 */
bc.Mode.prototype.keyDown = function(e) {};

/**
 * @return {string}
 */
bc.Mode.prototype.getCursor = function() {
	return 'default';
};


/* === src/lib/betacreator/modes/Select.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.mode.Select');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');
goog.require('goog.events');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Select = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	/** @type {goog.math.Coordinate|null} */
	this.mouseDownPoint = null;

	/**
	 * @type {?goog.events.Key}
	 * @private
	 */
	this.moveKey = null;

	/**
	 * @type {?goog.events.Key}
	 * @private
	 */
	this.upOutKey = null;


};
goog.inherits(bc.mode.Select, bc.Mode);

/**
 * @private
 */
bc.mode.Select.prototype.stopDrag = function() {
	this.canvas.endPan();

	goog.events.unlistenByKey(this.moveKey);
	goog.events.unlistenByKey(this.upOutKey);
};

/**
 * @param {Event} e
 * @private
 */
bc.mode.Select.prototype.startDrag = function(e) {
	var me = this;

	this.stopDrag();
	this.canvas.startPan();

	var x = e.clientX,
		y = e.clientY;

	this.moveKey = goog.events.listen(document.body, goog.events.EventType.MOUSEMOVE, function(e) {
		me.canvas.panTo(e.clientX - x, e.clientY - y);
	});

	this.upOutKey = goog.events.listen(document.body, goog.events.EventType.MOUSEUP, function(e) {
		me.stopDrag();
	});
};

/**
 * Called each time the mode is deactivated
 */
bc.mode.Select.prototype.onDeactivate = function() {
	this.mouseDownPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseDown = function(e, point) {
	var me = this,
		deselect = true;

	// just in case
	if (this.mouseDownPoint)
		this.mouseUp(e, point);

	this.mouseDownPoint = point;

	// loop through top down
	this.canvas.model.eachOrderedItem(function(item) {
		if (item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			me.canvas.selectItem(item);
			deselect = false;
			return true;
		}
	});

	if (deselect) {
		this.canvas.deselectAll();

		this.startDrag(e);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseMove = function(e, point) {
	var me = this;
	if (this.mouseDownPoint) {
		goog.array.forEach(this.canvas.getSelectedItems(), function(item, i) {
			item.setOffset(new goog.math.Coordinate(point.x - me.mouseDownPoint.x, point.y - me.mouseDownPoint.y));
		});
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.mouseUp = function(e, point) {
	var me = this;
	if (this.mouseDownPoint) {
		var dx = point.x - this.mouseDownPoint.x,
			dy = point.y - this.mouseDownPoint.y;

		if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
			goog.array.forEach(this.canvas.getSelectedItems(), function(item, i) {
				var changed = item.applyOffset(new goog.math.Coordinate(dx, dy));
				changed.id = item.id;
				me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
			});
		}
	}

	this.mouseDownPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.Select.prototype.dblClick = function(e, point) {
	var item,
		me = this;
	
	// loop through top down
	this.canvas.model.eachOrderedItem(function(item) {
		if (item.type() == bc.model.ItemTypes.LINE && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE_EDIT);
			return true;
		}
		else if (item.type() == bc.model.ItemTypes.BELAY && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			var text = prompt(bc.i18n('Enter text for the belay:'), item.text());

			if (text !== null && text != item.text()) {
				var changed = { id: item.id };
				changed[bc.properties.TEXT] = text;
				me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
			}
			return true;
		}
		else if (item.type() == bc.model.ItemTypes.TEXT && item.hitTest(point.x, point.y, me.canvas.isItemSelected(item))) {
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.SHOW_TEXT_AREA, function(text) {
				if (text !== null && text != item.text()) {
					var changed = { id: item.id };
					changed[bc.properties.TEXT] = text;
					me.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
				}
			}, item.text());
			return true;
		}
	});
};



/* === src/lib/betacreator/modes/Line.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.mode.Line');

goog.require('bc.Mode');
goog.require('bc.model.Line');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 * @param {bc.model.Line} tempLine
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Line = function(canvas, id, tempLine) {
	bc.Mode.call(this, canvas, id);

	/**
	 * @type {Array.<goog.math.Coordinate>}
	 * @private
	 */
	this.points = [];

	/**
	 * @type {goog.math.Coordinate|null}
	 * @private
	 */
	this.movingPoint = null;

	/**
	 * @type {bc.model.Line|null}
	 * @private
	 */
	this.activeLine = null;

	/**
	 * @type {bc.model.Line|null}
	 * @private
	 */
	this.tempLine = null;

	/**
	 * @type {bc.model.Line}
	 * @private
	 */
	this._tempLine = tempLine;
};
goog.inherits(bc.mode.Line, bc.Mode);

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseDown = function(e, point) {
	if (this.activeLine) {
		this.activeLine.controlPoints(this.getPoints());
	}

	this.points.push(new goog.math.Coordinate(point.x, point.y));

	if (this.activeLine) {
		var changed = { id: this.activeLine.id };
		changed[bc.properties.LINE_CONTROLPOINTS] = this.getPoints();
		this.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
	}
	else if (this.points.length > 1) {
		this.resetTempLine();
		var action = new bc.model.Action(bc.model.ActionType.CreateLine, {
			controlPoints: this.getPoints()
		});
		this.canvas.runAction(action);
		this.activeLine = /** @type {bc.model.Line|null} */(this.canvas.model.getItem(action.params.id));
	}
	else {
		this.movingPoint = new goog.math.Coordinate(point.x, point.y);
		this.tempLine = this._tempLine;
		this.tempLine.controlPoints(this.getPoints(this.movingPoint));
		this.tempLine.onLength(this.canvas.model.properties[bc.properties.LINE_ONLENGTH]);
		this.tempLine.offLength(this.canvas.model.properties[bc.properties.LINE_OFFLENGTH]);
		this.tempLine.scale(this.canvas.model.properties[bc.properties.ITEM_SCALE]);
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.mouseMove = function(e, point) {
	var affectedLine = this.activeLine || this.tempLine;
	if (affectedLine) {
		this.movingPoint = new goog.math.Coordinate(point.x, point.y);
		affectedLine.controlPoints(this.getPoints(this.movingPoint));
		affectedLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.Line.prototype.keyDown = function(e) {
	if(e.keyCode == goog.events.KeyCodes.ENTER && this.activeLine) {
		this.onDeactivate();
		return true;
	}
};

bc.mode.Line.prototype.onDeactivate = function() {
	if (this.activeLine) {
		this.activeLine.controlPoints(this.getPoints());
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
	this.points = [];
	this.movingPoint = null;
	this.activeLine = null;
	this.resetTempLine();
};

/**
 * Return a clone of the points array. Don't pass around the original points 
 * array because we change it in here.
 * 
 * @param {goog.math.Coordinate=} extraPoint
 * @return {Array.<goog.math.Coordinate>}
 * @private
 */
bc.mode.Line.prototype.getPoints = function(extraPoint) {
	if (extraPoint)
		return this.points.concat([extraPoint]);
	else
		return this.points.concat([]);
};

/**
 * @private
 */
bc.mode.Line.prototype.resetTempLine = function() {
	if (this.tempLine)
		this.tempLine.controlPoints([new goog.math.Coordinate(0,0)]);
	this.tempLine = null;
};


/* === src/lib/betacreator/modes/LineEdit.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.mode.LineEdit');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 * 
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.LineEdit = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	/** @type {goog.math.Coordinate|null} */
	this.mouseDownPoint = null;

	/** @type {bc.model.Line|null} */
	this.activeLine = null;

	/** @type {goog.math.Coordinate|null} */
	this.controlPoint = null;

	/** @type {goog.math.Coordinate|null} */
	this.originalControlPoint = null;
};
goog.inherits(bc.mode.LineEdit, bc.Mode);

/**
 * Called each time the mode is activated
 */
bc.mode.LineEdit.prototype.onActivate = function() {
	var me = this;
	goog.array.some(this.canvas.getSelectedItems(), function(item) {
		if (item.type() == bc.model.ItemTypes.LINE) {
			me.activeLine = /** @type {bc.model.Line} */(item);
			bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
			return true;
		}

		return false;
	});
};

/**
 * Called each time the mode is deactivated
 */
bc.mode.LineEdit.prototype.onDeactivate = function() {
	this.mouseDownPoint = null;
	this.activeLine = null;
	this.controlPoint = null;
	this.originalControlPoint = null;
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseDown = function(e, point) {
	// just in case
	if (this.mouseDownPoint)
		this.mouseUp(e, point);

	if (!this.activeLine)
		return;

	var me = this;

	// check if we are near a control point, if so store it and a clone
	goog.array.some(this.activeLine.controlPoints(), function(cp, i) {
		if (goog.math.Coordinate.squaredDistance(/** @type {!goog.math.Coordinate} */(point), /** @type {!goog.math.Coordinate} */(cp)) < 100) {
			me.controlPoint = cp;
			me.originalControlPoint = cp.clone();
			return true;
		}

		return false;
	});

	if (this.controlPoint)
		this.mouseDownPoint = point;
	else
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseMove = function(e, point) {
	// if we have an active control point we are moving, just change it's x and y values directly
	if (this.mouseDownPoint && this.activeLine && this.controlPoint) {
		this.controlPoint.x = this.originalControlPoint.x + point.x - this.mouseDownPoint.x;
		this.controlPoint.y = this.originalControlPoint.y + point.y - this.mouseDownPoint.y;
		this.activeLine.updatePoints();
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	}
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.mouseUp = function(e, point) {
	this.mouseMove(e, point);

	if (this.mouseDownPoint && this.activeLine && this.controlPoint) {
		// copy the control points in a new array
		var newCPs = [];
		goog.array.forEach(this.activeLine.controlPoints(), function(cp) {
			newCPs.push(cp.clone());
		});

		// set the active control point back to what it was so when we run an action,
		// the undo history will be correct
		this.controlPoint.x = this.originalControlPoint.x;
		this.controlPoint.y = this.originalControlPoint.y;

		var changed = { id: this.activeLine.id };
		changed[bc.properties.LINE_CONTROLPOINTS] = newCPs;
		this.canvas.runAction(new bc.model.Action(bc.model.ActionType.EditItem, changed));
	}

	this.mouseDownPoint = null;
	this.controlPoint = null;
	this.originalControlPoint = null;
};

/**
 * @inheritDoc
 */
bc.mode.LineEdit.prototype.keyDown = function(e) {
	if(e.keyCode == goog.events.KeyCodes.ENTER) {
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
		return true;
	}
};


/* === src/lib/betacreator/modes/Stamp.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.mode.Stamp');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Stamp = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	this.itemType = null;
};
goog.inherits(bc.mode.Stamp, bc.Mode);

/**
 * Called each time the mode is activated
 * @param {?number=} itemType
 */
bc.mode.Stamp.prototype.onActivate = function(itemType) {
	this.itemType = goog.isNumber(itemType) ? itemType : null;
};

/**
 * @inheritDoc
 */
bc.mode.Stamp.prototype.mouseDown = function(e, point) {
	if (this.itemType === null)
		return;

	this.canvas.runAction(new bc.model.Action(bc.model.ActionType.CreateStamp, {
		type: this.itemType,
		x: point.x,
		y: point.y
	}));
};

/**
 * @inheritDoc
 */
bc.mode.Stamp.prototype.getCursor = function() {
	return 'url(http://cdn1.iconfinder.com/data/icons/BRILLIANT/sports/png/24/ballooning.png) 12 12';
};


/* === src/lib/betacreator/modes/Text.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.mode.Text');

goog.require('bc.Mode');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {bc.Client.modes} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Text = function(canvas, id) {
	bc.Mode.call(this, canvas, id);
};
goog.inherits(bc.mode.Text, bc.Mode);

/**
 * @inheritDoc
 */
bc.mode.Text.prototype.mouseDown = function(e, point) {
	var me = this;
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SHOW_TEXT_AREA, function(text) {
		if (text) {
			me.canvas.runAction(new bc.model.Action(bc.model.ActionType.CreateText, {
				text: text,
				x: point.x,
				y: point.y
			}));
		}
	}, bc.i18n('Enter some text'));
};

/**
 * @inheritDoc
 */
bc.mode.Text.prototype.getCursor = function() {
	return 'text';
};


/* === src/lib/betacreator/gui/input/input.js === */
goog.provide('bc.gui.Input');

/**
 * Interface for input elements
 * 
 * @interface
 */
bc.gui.Input = function() {}


/** @return {Element} */
bc.gui.Input.prototype.getContainer = function() {};

/**
 * Append the input to a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.appendTo = function(parent, width) {}

/**
 * @return {*}
 */
bc.gui.Input.prototype.getValue = function() {}

/**
 * enable the input
 * 
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.enable = function() {}

/**
 * disable the input
 * 
 * @return {bc.gui.Input}
 */
bc.gui.Input.prototype.disable = function() {}


/* === src/lib/betacreator/gui/input/buttonbar.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.gui.input.ButtonBar');

goog.require('bc.gui.Input');
goog.require('bc.ClassSet');
goog.require('goog.array');


/**
 * Represents a button bar (set of buttons)
 * 
 * @param {Array.<Object>} buttons
 * @param {?Object.<string, boolean|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.ButtonBar = function(buttons, options, parent, width) {
	options = options || {};
	
	/** @type {Array.<Object>} */
	this.buttonsAr = buttons;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'button-bar' + (options.classes ? ' ' + options.classes : ''),
		css: options.css || null
	});
	this.containerClasses = new bc.ClassSet(this.container);
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/**
	 * @type {Array.<*>}
	 * @private
	 */
	this.value = [];


	/** @type {Array.<function(*=, boolean=)>} */
	this.changeCallbacks = [];

	if (options.change)
		this.changeCallbacks.push(options.change);

	if (parent)
		this.appendTo(parent, width);
	
	// build it initially
	this.build();
	
	// disable it if options.disabled is true
	if (this._disabled)
		this.disable();
};

/**
 * Set a new value
 *
 * @param {number} newValue
 * @private
 */
bc.gui.input.ButtonBar.prototype._setValue = function(newValue) {
	this.value.push(newValue);
};

/**
 * Trigger change callbacks
 *
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ButtonBar.prototype.onChange = function(programmatic) {
	var me = this;

	goog.array.forEach(this.changeCallbacks, function(f) {
		f.call(me, me.value, !!programmatic);
	});
};


/*======================================================================
 =======================================================================
 ==
 ==
 ==                         PUBLIC INTERFACE
 ==
 ==
 =======================================================================
 =====================================================================*/

/**
 * Append the button bar do a dom element and adjust width (optional)
 *
 * @param {Element} parent
 * @param {?number=} width
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : 'auto');
	goog.dom.appendChild(parent, this.container);
	
	return this;
};

/**
 * @private
 */
bc.gui.input.ButtonBar.prototype.build = function() {
	var me = this;
	
	this.value = [];
	
	goog.array.forEach(this.buttonsAr, function(button) {
		var selected = button.selected && button.selected(),
			disabled = me._disabled || (button.disabled && button.disabled());
		
		if (selected && (button.value || button.value === 0 || button.value === false))
			me._setValue(button.value);
		
		goog.dom.appendChild(me.container, bc.domBuilder({
			classes: 'button-bar-item' +
				(selected ? ' selected' : '') +
				(disabled && !me._disabled ? ' disabled' : ''),
			title: button.tooltip || null,
			click: function(event) {
				disabled = me._disabled || (button.disabled && button.disabled());
				if(!disabled) {
					button.action();
					me.refresh(true);
				}
			},
			children: [{
				classes: 'icon-13 icon-13-' + button.icon
			}]
		}));
	});
};

/**
 * Refresh the DOM (rebuild the buttons)
 *
 * @param {boolean=} resultOfClick
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.refresh = function(resultOfClick) {
	var me = this;
	
	this.value = [];
	
	goog.array.forEach(this.buttonsAr, function(button, idx) {
		var selected = button.selected && button.selected(),
			disabled = me._disabled || (button.disabled && button.disabled());
		
		if (selected && (button.value || button.value === 0 || button.value === false))
			me._setValue(button.value);
		
		goog.dom.getChildren(me.container)[idx].className = 'button-bar-item' +
			(selected ? ' selected' : '') +
			(disabled && !me._disabled ? ' disabled' : '');
	});
	
	this.onChange(!resultOfClick || false);
	
	return this;
};

/**
 * @return {Array.<*>}
 */
bc.gui.input.ButtonBar.prototype.getValue = function() {
	return this.value;
};

/**
 * enable the button bar
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');
		this._disabled = false;
	}
	
	return this.refresh();
};

/**
 * disable the button bar
 *
 * @return {bc.gui.input.ButtonBar}
 */
bc.gui.input.ButtonBar.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');
		this._disabled = true;
	}
	
	return this.refresh();
};

/**
 * @return {Element}
 */
bc.gui.input.ButtonBar.prototype.getContainer = function() {
	return this.container;
};


/* === src/lib/betacreator/gui/input/colorwell.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.gui.input.ColorWell');

goog.require('bc.gui.Input');
goog.require('bc.domBuilder');
goog.require('goog.style');
goog.require('goog.array');

/**
 * Represents a color well
 * 
 * @param {?Object.<string, boolean|number|string|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.ColorWell = function(options, parent, width) {
	options = options || {};

	var me = this;

	/** @type {Element} */
	this.swatch = null;
	
	/** @type {Element} */
	this.swatchCanvas = null;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'color-well',
		children: [{
			classes: 'color-well-wrapper',
			children: [{
				classes: 'swatch-container',
				click: function(e, dom) {
					if(me._disabled)
						return;
					
					var offset = goog.style.getPageOffset(dom),
						size = goog.style.getSize(dom);

					bc.Client.pubsub.publish(
						bc.Client.pubsubTopics.SHOW_COLOR_PICKER,
						offset.x + size.width/2,
						offset.y + size.height + 2,
						function(newColor) {
							me._setValue(newColor);
						},
						me.value || null
					);
				},
				children: [
					{
						classes: 'swatch',
						create: function(dom) {
							me.swatch = dom;
						},
						children: [{
							tag: 'canvas',
							css: {'position': 'absolute'},
							create: function(dom) {
								me.swatchCanvas = dom;
							}
						}]
					},{
						classes: 'border'
					}
				]
			}]
		}]
	});
	
	this.containerClasses = new bc.ClassSet(this.container);

	/** 
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/** 
	 * @type {?bc.Color}
	 * @private 
	 */
	this.value = options.value || new bc.Color('#fff');


	/** @type {Array.<function(*=, boolean=)>} */
	this.changeCallbacks = [];

	if (options.change)
		this.changeCallbacks.push(options.change);

	if (parent)
		this.appendTo(parent, width);
	
	// disable it if options.disabled is true
	if (this._disabled)
		this.disable();
};

/**
 * Render the color or gradient in the swatch
 *
 * @param {boolean=} force render whether it's hidden or not
 */
bc.gui.input.ColorWell.prototype.render = function(force) {
	if (!this.swatchCanvasSetup) {
		var size = goog.style.getSize(this.swatch);
		if(size.width == 0 && !force)
			return;
		
		this.swatchCanvas.width = size.width;
		this.swatchCanvas.height = size.height;
		this.swatchCanvasSetup = true;
	}
	
	var ctx = this.swatchCanvas.getContext('2d'),
		fillColor = this.value;

	this.containerClasses.removeClass('no-fill');

	if (this._disabled)
		fillColor = new bc.Color('#ccccccff');
	
	if (!fillColor)
		this.containerClasses.addClass('no-fill');
	
	var x = 0,
		y = 0,
		w = ctx.canvas.width,
		h = ctx.canvas.height,
		bb = new bc.math.Box(x,y,w,h);
	
	ctx.clearRect(x,y,w,h);
	
	if (!fillColor)
		return;
	
	ctx.save();
	ctx.fillStyle = fillColor.rgbaStyle();
	ctx.fillRect(x,y,w,h);
	ctx.restore();
};

/**
 * Set a new value
 * 
 * @param {?bc.Color} newValue
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ColorWell.prototype._setValue = function(newValue, programmatic) {
	this.value = newValue;
	
	this.render();
	
	this.onChange(!!programmatic);
};

/**
 * Trigger change callbacks
 * 
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.ColorWell.prototype.onChange = function(programmatic) {
	var me = this;
	var valid = true, errorMessage = null;

	goog.array.forEach(this.changeCallbacks, function(f) {
		f.call(me, me.value, !!programmatic);
	});
};


/*======================================================================
 =======================================================================
 ==
 ==
 ==                         PUBLIC INTERFACE
 ==
 ==
 =======================================================================
 =====================================================================*/

/**
 * Append the input do a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : '');
	goog.dom.appendChild(parent, this.container);

	return this;
};

/**
 * @return {?bc.Color}
 */
bc.gui.input.ColorWell.prototype.getValue = function() {
	return this.value;
};

/**
 * Set a new value (public)
 * 
 * @param {?string|Object.<string,string|number|Array.<Object.<string, string|number>>>|bc.Color} newValue
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.setValue = function(newValue) {
	this._setValue(new bc.Color(newValue), true);
	
	return this;
};

/**
 * Add a change callback
 * 
 * @param {function((?bc.Color)=, boolean=)} changeCallback
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.addChangeCallback = function(changeCallback) {
	this.changeCallbacks.push(changeCallback);
	
	return this;
};

/**
 * enable the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');

		this._disabled = false;
		this.render();
	}
	
	return this;
};

/**
 * disable the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');

		this._disabled = true;
		this.render();
	}
	
	return this;
};

/**
 * reset the input
 * 
 * @return {bc.gui.input.ColorWell}
 */
bc.gui.input.ColorWell.prototype.reset = function() {
	this._setValue(null, true);
	
	return this;
};

/**
 * @return {Element}
 * */
bc.gui.input.ColorWell.prototype.getContainer = function() {
	return this.container;
};


/* === src/lib/betacreator/gui/input/spinner.js === */
goog.provide('bc.gui.input.Spinner');

goog.require('bc.gui.Input');
goog.require('bc.math');
goog.require('bc.array');
goog.require('bc.ClassSet');
goog.require('goog.array');

/**
 * Represents a spinner input control
 * 
 * @param {?Object.<string, boolean|number|string|function(number=)>=} options
 * @param {Element=} parent
 * @param {number=} width
 * 
 * @implements {bc.gui.Input}
 * @constructor
 */
bc.gui.input.Spinner = function(options, parent, width) {
	options = options || {};

	var me = this;

	/** @type {Element} */
	this.input = null;

	/** @type {Element} */
	this.upButton = null;

	/** @type {Element} */
	this.downButton = null;

	/** @type {Element} */
	this.container = bc.domBuilder({
		classes: 'spinner',
		css: options.css || null,
		children: [
			{
				classes: 'spinner-textbox',
				children: [{
					tag: 'input',
					type: 'text',
					create: function(dom) {
						me.input = dom;
					}
				}]
			},{
				classes: 'spinner-buttons',
				children: [
					{
						classes: 'spinner-up',
						create: function(dom) {
							me.upButton = dom;
						},
						children: [{
							classes: 'icon-13 icon-13-spinner-arrows'
						}]
					},{
						classes: 'spinner-down',
						create: function(dom) {
							me.downButton = dom;
						},
						children: [{
							classes: 'icon-13 icon-13-spinner-arrows'
						}]
					}
				]
			}
		]
	});
	this.containerClasses = new bc.ClassSet(this.container);

	/**
	 * @type {boolean}
	 * @private
	 */
	this._disabled = options.disabled || false;

	/** @type {number} */
	this.min = options.min || 0;

	/** @type {number} */
	this.max = options.max === undefined ? 100 : options.max;

	/** @type {number} */
	this.step = options.step || 1;
	
	/** @type {number} */
	this.round = options.round || 0;
	
	/** @type {boolean} */
	this.loop = !!options.loop;

	/** @type {string} */
	this.suffix = options.suffix || '';
	
	/** @type {string|number} */
	this.defaultVal = options.defaultVal || 0;
	
	/** @type {number} */
	this.displayFactor = options.displayFactor || 1;
	
	/** @type {number} */
	this.displayRound = options.displayRound === undefined ? this.round : options.displayRound;

	/** 
	 * @type {number|string}
	 * @private 
	 */
	this.value = 0;

	/** @type {Array.<function((number|string)=, boolean=)>} */
	this.changeCallbacks = [];
	
	/** @type {Array.<function((number|string)=)>} */
	this.focusCallbacks = [];
	
	/** @type {Array.<function()>} */
	this.blurCallbacks = [];

	this._setValue(options.value || this.defaultVal || 0, true);

	if (options.change)
		this.changeCallbacks.push(options.change);
	
	if (options.focus)
		this.focusCallbacks.push(options.focus);
	
	if (options.blur)
		this.blurCallbacks.push(options.blur);


	if (parent)
		this.appendTo(parent, width);


	/* bind event handlers
	==================================================================*/
	var onChange = function() {
		if (me._disabled)
			return;

		var newVal = parseFloat(me.input.value);
		if (goog.isNumber(newVal))
			newVal /= me.displayFactor;

		me._setValue(/** @type {number|string} */(bc.array.coalesce([newVal, me.defaultVal, me.value])));
	};

	goog.events.listen(this.input, goog.events.EventType.CHANGE, function(e) {
		onChange();
	});

	goog.events.listen(this.input, goog.events.EventType.KEYDOWN, function(e) {
		if (me._disabled)
			return;

		var keyCode = e.keyCode;

		// up
		if (keyCode == 38) {
			me.stepUp();
			e.preventDefault();
		}

		// down
		else if (keyCode == 40) {
			me.stepDown();
			e.preventDefault();
		}
		
		// enter
		else if (keyCode == 13) {
			onChange();
			me.input.blur();
			e.preventDefault();
		}

		e.stopPropagation();
	});

	goog.events.listen(this.input, goog.events.EventType.FOCUS, function(e) {
		me.onFocus();
	});

	goog.events.listen(this.input, goog.events.EventType.BLUR, function(e) {
		me.onBlur();
	});

	goog.events.listen(this.upButton, goog.events.EventType.CLICK, function(e) {
		if (me._disabled)
			return;

		me.stepUp();
	});

	goog.events.listen(this.downButton, goog.events.EventType.CLICK, function(e) {
		if (me._disabled)
			return;

		me.stepDown();
	});
	
	// disable it if options.disabled is true
	if (this._disabled) {
		this._disabled = false;
		this.disable();
	}
};

/**
 * Step up to the next stepping value
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.stepUp = function() {
	if(!goog.isNumber(this.value) && this.lastValidValue != null)
		this.value = this.lastValidValue;

	var newVal = (Math.round(this.displayFactor*this.value/this.step) + 1)*this.step/this.displayFactor;
	
	if (this.loop && newVal > this.max)
		newVal = this.min + (newVal - (this.max + 1));
	
	this._setValue(newVal);
}

/**
 * Step down to the next stepping value
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.stepDown = function() {
	if(!goog.isNumber(this.value) && this.lastValidValue != null)
		this.value = this.lastValidValue;

	var newVal = (Math.round(this.displayFactor*this.value/this.step) - 1)*this.step/this.displayFactor;

	if (this.loop && newVal < this.min)
		newVal = (this.max + 1) - (this.min - newVal);

	this._setValue(newVal);
}

/**
 * Set a new value
 * 
 * @param {string|number} newValue
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.Spinner.prototype._setValue = function(newValue, programmatic) {
	var changed = false;

	if (newValue !== this.value || programmatic) {
		newValue = parseFloat(newValue);

		// if it's NaN set it to default if applicable. Otherwise it stays unchanged
		if (isNaN(newValue)) {
			if (this.defaultVal !== null)
				this.value = this.defaultVal;
		}
		else {
			this.value = (newValue > this.max) ? this.max : ((newValue < this.min) ? this.min : newValue);

			this.value = 1*this.value.toFixed(this.round);
			this.lastValidValue = this.value;
		}
		
		this.onChange(!!programmatic);

		changed = true;
	}
	
	// make sure the input has the suffix on it
	if (!programmatic || changed || this.input.value === "")
		this.input.value = goog.isString(this.value) ? this.value : (bc.math.toFixed(this.value*this.displayFactor, this.displayRound) + this.suffix);
};

/**
 * Trigger change callbacks
 * 
 * @param {boolean=} programmatic
 * @private
 */
bc.gui.input.Spinner.prototype.onChange = function(programmatic) {
	var me = this;
	var valid = true,
		errorMessage = null;

	goog.array.forEach(this.changeCallbacks, function(f) {
		f.call(me, me.value, !!programmatic);
	});
};

/**
 * Trigger focus callbacks
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.onFocus = function() {
	var me = this;

	// timeout or else the mousedown will set the caret after focus is called
	// and the text will get unselected
	setTimeout(function() {
		me.input.select();
	}, 10);

	goog.array.forEach(this.focusCallbacks, function(f) {
		f.call(me, me.value);
	});
};

/**
 * Trigger blur callbacks
 * 
 * @private
 */
bc.gui.input.Spinner.prototype.onBlur = function() {
	var me = this;
	
	goog.array.forEach(this.blurCallbacks, function(f) {
		f.call(me);
	});
};


/*======================================================================
 =======================================================================
 ==
 ==
 ==                         PUBLIC INTERFACE
 ==
 ==
 =======================================================================
 =====================================================================*/

/**
 * Append the spinner do a dom element and adjust width (optional)
 * 
 * @param {Element} parent
 * @param {?number=} width
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.appendTo = function(parent, width) {
	this.container.style.width = (width ? width + 'px' : 'auto');
	goog.dom.appendChild(parent, this.container);

	return this;
};

/**
 * Set a new value (public)
 * 
 * @param {number} newValue
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.setValue = function(newValue) {
	if (this._disabled)
		return this;

	this._setValue(newValue, true);
	
	return this;
};

/**
 * @return {number|string}
 */
bc.gui.input.Spinner.prototype.getValue = function() {
	return this.value;
};

/**
 * @return {boolean}
 */
bc.gui.input.Spinner.prototype.isDefault = function() {
	return (this.defaultVal !== null && this.value == this.defaultVal);
};

/**
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.reset = function() {
	if (this.defaultVal !== null)
		this._setValue(this.defaultVal, true);
	
	return this;
};

/**
 * focus the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.focus = function() {
	this.input.focus();
	
	return this;
};

/**
 * blur the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.blur = function() {
	this.input.blur();
	
	return this;
};

/**
 * enable the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.enable = function() {
	if(this._disabled) {
		this.containerClasses.removeClass('disabled');
		this.input.disabled = false;

		this._disabled = false;
	}
	
	return this;
};

/**
 * disable the spinner
 * 
 * @return {bc.gui.input.Spinner}
 */
bc.gui.input.Spinner.prototype.disable = function() {
	if(!this._disabled) {
		this.containerClasses.addClass('disabled');
		this.input.disabled = true;

		this._disabled = true;
	}
	
	return this;
};

/**
 * @return {Element}
 * */
bc.gui.input.Spinner.prototype.getContainer = function() {
	return this.container;
};


/* === src/lib/betacreator/gui/ColorPicker.js === */
goog.provide('bc.gui.ColorPicker');

goog.require('bc.Color');
goog.require('bc.domBuilder');
goog.require('goog.positioning');
goog.require('goog.dom.query');

/**
 * SIMPLE COLOR PICKER
 *
 * @constructor
 */
bc.gui.ColorPicker = function() {

	var me = this;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.visible = false;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.userIsTyping = false;

	/**
	 * @type {Element}
	 */
	this.userSwatchContainer = null;

	this.userPalette = [];
	this.userPaletteCount = 12;

	/**
	 * @type {Element}
	 */
	this.swatchContainer = null;

	/**
	 * @type {Element}
	 */
	this.container = bc.domBuilder({
		classes: 'callout hidden',
		children: [
			{
				classes: 'callout-bubble',
				create: function(dom) {
					me.bubble = dom;
				},
				children: [{
					classes: 'simple-color-picker',
					children: [
						{
							classes: 'preview-swatch',
							create: function(dom) {
								me.previewSwatch = dom;
							}
						},{
							classes: 'input-container',
							children: [{
								tag: 'input',
								type: 'text',
								classes: 'box-sizing-border',
								create: function(dom) {
									me.previewInput = dom;

									goog.events.listen(dom, goog.events.EventType.FOCUS, function(e) {
										me.userIsTyping = true;
									});

									goog.events.listen(dom, goog.events.EventType.BLUR, function(e) {
										me.userIsTyping = false;
									});

									goog.events.listen(dom, goog.events.EventType.KEYDOWN, function(e) {
										e.stopPropagation();
									});
								},
								change: function(event, dom) {
									try {
										var newColor = new bc.Color(bc.color.parse(dom.value).hex);
										me.setSelectedColor(newColor);
									}
									catch(e) {
										me.resetPreview();
									}
								}
							}]
						},{
							classes: 'button-container',
							children: [{
								tag: 'button',
								text: 'Done',
								click: function() {
									if (!me.callback || me.callback(me.selectedColor) != false)
										me.hide();
								}
							}]
						},{
							classes: 'spacer'
						},{
							classes: 'swatch-container',
							create: function(dom) {
								me.swatchContainer = dom;
							}
						}
					]
				}]
			},{
				classes: 'callout-pointer-border'
			},{
				classes: 'callout-pointer'
			}
		]
	});

	// prevent hide overlays when mousing down on bubble
	goog.events.listen(this.bubble, goog.events.EventType.MOUSEDOWN, function(e) {
		e.stopPropagation();
	});

	// on mouse out on bubble, reset the selected swatch
	goog.events.listen(this.bubble, goog.events.EventType.MOUSEOUT, function(e) {
		me.highlightSwatch(me.selectedSwatch);
		me.resetPreview();
	});

	/**
	 * keyed to hex string for each color
	 * value is the dom element for each swatch
	 * @type {Object.<string,Element>}
	 */
	this.swatches = {};

	/**
	 * @type {Element}
	 */
	this.selectedSwatch = null;

	/**
	 * @type {bc.Color}
	 */
	this.selectedColor = null;

	/**
	 * @type {?function(bc.Color)}
	 */
	this.callback = null;

	this.build();

	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.HIDE_OVERLAYS, function() {
		me.hide();
	});
};


/**
 * @param {?bc.Color} color
 * @private
 */
bc.gui.ColorPicker.prototype.previewColor = function(color) {
	if (color && color.rgba()[3] > 0) {
		goog.dom.classes.remove(this.previewSwatch, 'transparent');
		this.previewSwatch.style.backgroundColor = color.hex();

		if (!this.userIsTyping)
			this.previewInput.value = color.hex();
	}
	else {
		goog.dom.classes.add(this.previewSwatch, 'transparent');

		if (!this.userIsTyping)
			this.previewInput.value = 'transparent';
	}
};


/**
 * @private
 */
bc.gui.ColorPicker.prototype.resetPreview = function() {
	this.previewColor(this.selectedColor);
};


/**
 * @param {?Element=} swatch
 * @private
 */
bc.gui.ColorPicker.prototype.highlightSwatch = function(swatch) {
	goog.array.forEach(/** @type {Array} */(goog.dom.query('.selected', this.swatchContainer)), function(element) {
		goog.dom.classes.remove(element, 'selected');
	});

	if (swatch)
		goog.dom.classes.add(swatch, 'selected');
};


/**
 * @param {?bc.Color=} color
 * @private
 */
bc.gui.ColorPicker.prototype.setSelectedColor = function(color) {
	if (color) {
		this.selectedSwatch = this.swatches[color.hex().toLowerCase()] || null;
		this.selectedColor = new bc.Color(color.hex());

		if (this.selectedSwatch) {
			this.highlightSwatch(this.selectedSwatch);
		}

		this.previewColor(color);
	}
	else {
		this.selectedSwatch = null;
		this.selectedColor = null;
	}
};


/**
 * @private
 */
bc.gui.ColorPicker.prototype.build = function() {
	var me = this,
		i;

	this.swatches = {};

	/** @type {bc.Color} */
	var color = new bc.Color();
	
	// grayscale
	for (i = 0; i < 12; i++) {
		color.hsv([0, 0, (11 - i)/11]);
		me.addColor(color);
	}
	
	// colors
	for (var j = 0; j < 9; j++) {
		for (i = 0; i < 360; i+= 30) {
			color.hsl([i, 1, (9 - j)/10]);
			me.addColor(color);
		}
	}

	goog.dom.appendChild(this.swatchContainer, bc.domBuilder({
			classes: 'clear'
		}));
};


/**
 * Adds a color passed off a RGB color code to the available picker selection
 *
 * @param {Array.<number>} rgb
 */
bc.gui.ColorPicker.prototype.addElem = function(rgb) {
	var me = this;

	goog.dom.appendChild(this.swatchContainer, bc.domBuilder({
		classes: 'swatch' + (rgb ? '' : ' transparent'),
		css: {
			'backgroundColor': rgb ? 'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')' : 'transparent'
		},
		create: function(dom) {
			var color = null;

			if (rgb) {
				color = new bc.Color(rgb);
				me.swatches[color.hex().toLowerCase()] = dom;
			}

			goog.events.listen(dom, goog.events.EventType.MOUSEOVER, function(e) {
				me.highlightSwatch(dom);
				me.previewColor(color);
			});

			goog.events.listen(dom, goog.events.EventType.CLICK, function(e) {
				if (!me.callback || me.callback(color) !== false)
					me.hide();
			});
		}
	}));
};


/**
 * Add the given colors to the available selection popup.
 *
 * @param {bc.Color=} color
 */
bc.gui.ColorPicker.prototype.addColor = function(color) {
	this.addElem(/** @type {Array.<number>} */ (color.rgb()));
};


/**
 * @param {number} x
 * @param {number} y
 * @param {function(?bc.Color)} callback
 * @param {?bc.Color=} selectedColor
 */
bc.gui.ColorPicker.prototype.show = function(x, y, callback, selectedColor) {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);

	// this.swatchContainer.find('.selected').removeClass('selected');

	this.callback = callback;

	this.setSelectedColor(selectedColor);

	this.visible = true;

	this.container.style.display = 'block';

	var parentOffset = goog.positioning.getOffsetParentPageOffset(this.container);
	
	goog.style.setPosition(this.container, x - parentOffset.x, y - parentOffset.y);
};


/**
 *
 */
bc.gui.ColorPicker.prototype.hide = function() {
	this.visible = false;

	this.container.style.display = 'none';
};


/* === src/lib/betacreator/gui/TextArea.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.gui.TextArea');

goog.require('bc.domBuilder');

/**
 * Text Area for inputing text content
 *
 * @constructor
 */
bc.gui.TextArea = function() {

	var me = this;

	/**
	 * @type {boolean}
	 */
	this.visible = false;

	/**
	 * @type {Element}
	 * @private
	 */
	this.textarea = null;

	/**
	 * @type {Element}
	 */
	this.container = bc.domBuilder({
		classes: 'text-area-container',
		children: [
			{
				classes: 'overlay'
			},{
				classes: 'wrapper',
				children: [
					{
						classes: 'heading',
						text: bc.i18n('Edit Text Content')
					},{
						tag: 'textarea',
						create: function(dom) {
							me.textarea = dom;

							goog.events.listen(dom, goog.events.EventType.KEYDOWN, function(e) {
								e.stopPropagation();
							});
						}
					},{
						tag: 'button',
						classes: 'cancel',
						text: bc.i18n('Cancel'),
						click: function() {
							me.hide();
						}
					},{
						tag: 'button',
						classes: 'save',
						text: bc.i18n('Save'),
						click: function() {
							me.save();
						}
					}
				]
			}
		]
	});

	/**
	 * @type {?function(string)}
	 * @private
	 */
	this.callback = null;
};


/**
 *
 */
bc.gui.TextArea.prototype.save = function() {
	if (!this.callback || this.callback(this.textarea.value) !== false)
		this.hide();
};


/**
 * @param {function(string)} callback
 * @param {?string=} defaultText
 */
bc.gui.TextArea.prototype.show = function(callback, defaultText) {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);

	this.visible = true;

	this.callback = callback;

	this.textarea.value = defaultText || '';

	this.container.style.display = 'block';

	// timeout to wait for mouse up
	setTimeout(goog.bind(function() {
		if (this.textarea.select)
			this.textarea.select();
	}, this), 250);
};


/**
 *
 */
bc.gui.TextArea.prototype.hide = function() {
	this.visible = false;

	this.callback = null;

	this.container.style.display = 'none';
};


/* === src/lib/betacreator/gui/OptionBar.js === */
goog.provide('bc.gui.OptionBar');

goog.require('bc.gui.input.ColorWell');
goog.require('bc.gui.input.ButtonBar');
goog.require('bc.gui.input.Spinner');
goog.require('bc.property');
goog.require('bc.i18n');
goog.require('goog.array');

/**
 * @param {Object} config
 * @constructor
 */
bc.gui.OptionBar = function(config) {
	var me = this;

	this.config = config;

	// create the container
	this.container = goog.dom.createDom(goog.dom.TagName.DIV, 'option-bar');
	
	// create the viewport
	this.viewport = goog.dom.createDom(goog.dom.TagName.DIV, 'fullsize');
	goog.dom.appendChild(this.container, this.viewport);

	/** @type {Array.<function()>} */
	this.refreshFunctions = [];

	this.viewportSelection = null;

	this.createControls(this.container);

	this.mode = null;
	this.itemType = null;
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.MODE, function(mode, itemType) {
		me.mode = mode;
		me.itemType = itemType;
		me.refresh();
	});
};

/**
 */
bc.gui.OptionBar.prototype.init = function() {
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SELECTION_CHANGE, goog.bind(this.refresh, this));
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.ACTION, goog.bind(this.refresh, this));
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
};

/**
 * @param {Element} container
 * @return {Element}
 * @private
 */
bc.gui.OptionBar.prototype.getInputWrapper = function(container) {
	var ret = bc.domBuilder({
		classes: 'option-bar-input'
	});

	goog.dom.appendChild(container, ret);

	return ret;
};

/**
 * @param {Element} container
 * @private
 */
bc.gui.OptionBar.prototype.addDivider = function(container) {
	goog.dom.appendChild(container, bc.domBuilder({
		classes: 'option-bar-divider'
	}));
};

/**
 * @param {Element} container
 * @param {?string=} label
 * @param {?boolean=} left
 * @param {?boolean=} right
 * @param {?string=} icon
 * @private
 */
bc.gui.OptionBar.prototype.addLabel = function(container, label, left, right, icon) {
	goog.dom.appendChild(container, bc.domBuilder({
		classes: 'option-bar-label' + (left ? '-left' : (right ? '-right' : '')),
		text: label || null,
		children: icon ? [{classes: 'icon-13 icon-13-' + icon}] : null
	}));
};

/**
 * @param {bc.gui.Input} input
 * @param {string} property
 * @private
 */
bc.gui.OptionBar.prototype.standardInputRefresh = function(input, property) {
	var val = bc.property.get(property);
	if (val === undefined) {
		input.setValue(null);
		input.disable();
	}
	else {
		input.enable();
		input.setValue(val);
	}
};

/**
 * @param {Element} container
 * @private
 */
bc.gui.OptionBar.prototype.createControls = function(container) {
	var me = this;

	var createButtons = function(control) {
		var buttons = [];
		goog.array.forEach(control.buttons, function(button) {
			// this button set changes a property and acts like a radio button set
			if (control.property) {
				button.action = function() {
					bc.property.set(control.property, button.val);
				};
				button.selected = function() {
					return bc.property.get(control.property) == button.val;
				};
				button.disabled = function() {
					return bc.property.get(control.property) === undefined;
				};
			}
			// otherwise each button acts independently like a checkbox set
			else if (button.property) {
				button.action = function() {
					bc.property.set(button.property, !bc.property.get(button.property));
				};
				button.selected = function() {
					return !!bc.property.get(button.property);
				};
				button.disabled = function() {
					return bc.property.get(button.property) === undefined;
				};
			}

			buttons.push(button);
		});
		
		return buttons;
	};

	/**
	* @param {string} icon
	* @param {bc.Client.modes} mode
	* @param {string} tooltip
	* @param {bc.model.ItemTypes=} itemType
	*/
	var createToolButton = function(icon, mode, tooltip, itemType) {
		return new bc.gui.input.ButtonBar(
			[{
				icon:icon,
				action: function() {
					bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, mode, itemType);
				},
				tooltip:bc.i18n(tooltip),
				selected: function() { return me.mode == mode && (itemType === undefined || itemType == me.itemType); },
				disabled: function() { return false; }
			}],
			null,
			me.getInputWrapper(container)
		);
	};

	var selectButton = createToolButton('tool-select', bc.Client.modes.SELECT, 'Select Tool');
	var lineButton = createToolButton('tool-line', bc.Client.modes.LINE, 'Line Tool');
	var anchorButton = createToolButton('tool-anchor', bc.Client.modes.STAMP, 'Anchor Tool', bc.model.ItemTypes.ANCHOR);
	var pitonButton = createToolButton('tool-piton', bc.Client.modes.STAMP, 'Piton Tool', bc.model.ItemTypes.PITON);
	var rappelButton = createToolButton('tool-rappel', bc.Client.modes.STAMP, 'Rappel Tool', bc.model.ItemTypes.RAPPEL);
	var belayButton = createToolButton('tool-belay', bc.Client.modes.STAMP, 'Belay Tool', bc.model.ItemTypes.BELAY);
	var textButton = createToolButton('tool-text', bc.Client.modes.TEXT, 'Text Tool');

	this.addDivider(container);

	var colorWell = new bc.gui.input.ColorWell(
		{
			change: function(val, programmatic) {
				if (programmatic)
					return;

				bc.property.set(bc.properties.ITEM_COLOR, val.hex());
			}
		},
		this.getInputWrapper(container)
	);

	colorWell.refresh = goog.bind(this.standardInputRefresh, this, colorWell, bc.properties.ITEM_COLOR);

	this.addDivider(container);

	this.addLabel(container, 'Scale:', true);

	var scaleFactor = this.config.scaleFactor || 1;

	var scaleSpinner = new bc.gui.input.Spinner(
		{
			min:0.25*scaleFactor,
			max:8*scaleFactor,
			step:10,
			round:2,
			width:60,
			value:1,
			displayFactor: 100/scaleFactor,
			suffix:'%',
			change: function(val, programmatic) {
				if (programmatic)
					return;

				bc.property.set(bc.properties.ITEM_SCALE, val);
			}
		},
		this.getInputWrapper(container),
		50
	);

	scaleSpinner.refresh = goog.bind(this.standardInputRefresh, this, scaleSpinner, bc.properties.ITEM_SCALE);

	this.addDivider(container);

	var textStyleDisabled = function() {
		return !goog.isString(bc.property.get(bc.properties.TEXT_ALIGN));
	};

	var textAlignButtonBar = new bc.gui.input.ButtonBar(
		createButtons({
			buttons: [
				{
					icon:'text-align-l',
					val: 'l',
					tooltip:bc.i18n('Left Align'),
					selected: function() { return /** @type {string} */(bc.property.get(bc.properties.TEXT_ALIGN)) == 'l'; },
					disabled: textStyleDisabled
				},{
					icon:'text-align-c',
					val: 'c',
					tooltip:bc.i18n('Center Align'),
					selected: function() { return /** @type {string} */(bc.property.get(bc.properties.TEXT_ALIGN)) == 'c'; },
					disabled: textStyleDisabled
				},{
					icon:'text-align-r',
					val:'r',
					tooltip:bc.i18n('Right Align'),
					selected: function() { return /** @type {string} */(bc.property.get(bc.properties.TEXT_ALIGN)) == 'r'; },
					disabled: textStyleDisabled
				}
			],
			property: bc.properties.TEXT_ALIGN
		}),
		null,
		this.getInputWrapper(container)
	);

	var textBGButton = new bc.gui.input.ButtonBar(
		createButtons({
			buttons: [{
				icon:'text-bg',
				property: bc.properties.TEXT_BG,
				tooltip:bc.i18n('Toggle Text Background')
			}]
		}),
		null,
		this.getInputWrapper(container)
	);

	this.addDivider(container);

	var lineStyleDisabled = function() {
		return !goog.isNumber(bc.property.get(bc.properties.LINE_OFFLENGTH));
	};

	var lineStyleButtonBar = new bc.gui.input.ButtonBar(
		[
			{
				icon:'line-solid',
				action: function() {
					bc.property.set(bc.properties.LINE_OFFLENGTH, 0);
				},
				tooltip:bc.i18n('Solid Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_OFFLENGTH)) === 0; },
				disabled: lineStyleDisabled
			},{
				icon:'line-dashed',
				action: function() {
					bc.property.setBatch([
						[bc.properties.LINE_OFFLENGTH, 10],
						[bc.properties.LINE_ONLENGTH, 10]
					]);
				},
				tooltip:bc.i18n('Dashed Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_ONLENGTH)) > 2; },
				disabled: lineStyleDisabled
			},{
				icon:'line-dotted',
				action: function() {
					bc.property.setBatch([
						[bc.properties.LINE_OFFLENGTH, 8],
						[bc.properties.LINE_ONLENGTH, 0.01]
					]);
				},
				tooltip:bc.i18n('Dotted Line'),
				selected: function() { return /** @type {number} */(bc.property.get(bc.properties.LINE_OFFLENGTH)) > 0 && /** @type {number} */(bc.property.get(bc.properties.LINE_ONLENGTH)) <= 2; },
				disabled: lineStyleDisabled
			}
		],
		null,
		this.getInputWrapper(container)
	);

	var lineCurveButton = new bc.gui.input.ButtonBar(
		createButtons({
			buttons: [{
				icon:'line-curved',
				property: bc.properties.LINE_CURVED,
				tooltip:bc.i18n('Toggle Line Curvature')
			}]
		}),
		null,
		this.getInputWrapper(container)
	);

	var lineEditButton = new bc.gui.input.ButtonBar(
		[{
			icon:'line-edit',
			action: function() {
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE_EDIT);
			},
			tooltip:bc.i18n('Edit Line Shape'),
			selected: function() { return me.mode == bc.Client.modes.LINE_EDIT; },
			disabled: lineStyleDisabled
		}],
		null,
		me.getInputWrapper(container)
	);

	var inputs = [
		selectButton,
		lineButton,
		anchorButton,
		pitonButton,
		rappelButton,
		belayButton,
		textButton,
		colorWell,
		scaleSpinner,
		textAlignButtonBar,
		textBGButton,
		lineStyleButtonBar,
		lineCurveButton,
		lineEditButton
	];

	this.refreshFunctions.push(function() {
		goog.array.forEach(inputs, function(input) {
			if(input.refresh) {
				input.refresh();
			}
		});
	});
};


/**
 * @private
 */
bc.gui.OptionBar.prototype.refresh = function() {
	goog.array.forEach(this.refreshFunctions, function(f) {
		f();
	});
};


/* === src/lib/betacreator/gui/GUI.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.GUI');

goog.require('bc.domBuilder');
goog.require('bc.gui.ColorPicker');
goog.require('bc.gui.OptionBar');
goog.require('bc.gui.TextArea');
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');

/**
 * @param {bc.Client} client
 * @param {Object} config
 *
 * @constructor
 */
bc.GUI = function(client, config) {
	var me = this;

	this.client = client;
	this.config = config;
	
	this.wrapper = bc.domBuilder({
		id: 'betacreator',
		children: [
			{
				classes: 'fullsize viewport',
				create: function(dom) {
					me.viewport = dom;
				}
			},{
				classes: 'fullsize hitdiv',
				create: function(dom) {
					me.hitTestDiv = dom;
				}
			},{
				classes: 'bc-gui',
				create: function(dom) {
					me.uiContainer = dom;
				}
			},{
				create: function(dom) {
					me.modalContainer = dom;
				}
			}
		]
	});
	
	// add the canvas view to the viewport
	/** @type {bc.controller.Canvas} */
	this.canvasController = this.client.canvasController;
	goog.dom.appendChild(this.viewport, this.canvasController.view.container);

	// create the option bar and add it to the ui container
	/** @type {bc.gui.OptionBar} */
	this.optionBar = new bc.gui.OptionBar(this.config);
	goog.dom.appendChild(this.uiContainer, this.optionBar.container);

	// create the color picker and add it to the ui container
	/** @type {bc.gui.ColorPicker} */
	this.colorPicker = new bc.gui.ColorPicker();
	goog.dom.appendChild(this.uiContainer, this.colorPicker.container);
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SHOW_COLOR_PICKER, function(x, y, callback, color) {
		me.colorPicker.show(
			/** @type {number} */(x),
			/** @type {number} */(y),
			/** @type {function(?bc.Color)} */(callback),
			/** @type {null|bc.Color} */(color)
		);
	});

	// create textarea for inputing text content
	this.textArea = new bc.gui.TextArea();
	goog.dom.appendChild(this.modalContainer, this.textArea.container);
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.SHOW_TEXT_AREA, function(callback, defaultText) {
		me.textArea.show(
			/** @type {function(string)} */(callback),
			/** @type {?string|undefined} */(defaultText)
		);
	});
};

/**
 * Called after the gui has been added to the DOM
 */
bc.GUI.prototype.init = function() {
	// bind all mouse event listeners
	this.bindEventListeners();

	this.optionBar.init();
};

/**
 * Bind mouse and keyboard event listeners to hitTestDiv and document respectively
 * @private
 */
bc.GUI.prototype.bindEventListeners = function() {
	var me = this;
	
	// mousedown on everything to hide overlays
	goog.events.listen(this.wrapper, goog.events.EventType.MOUSEDOWN, function(e) {
		bc.Client.pubsub.publish(bc.Client.pubsubTopics.HIDE_OVERLAYS);
	});

	// mouse down
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEDOWN, function(e) {
		me.canvasController.mouseDown(e);
	});
	
	// mouse move
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEMOVE, function(e) {
		me.canvasController.mouseMove(e);
	});
	
	// mouse up
	goog.events.listen(this.hitTestDiv, goog.events.EventType.MOUSEUP, function(e) {
		me.canvasController.mouseUp(e);
	});

	// double click
	goog.events.listen(this.hitTestDiv, goog.events.EventType.DBLCLICK, function(e) {
		me.canvasController.dblClick(e);
	});
	
	// key down
	goog.events.listen(document, goog.events.EventType.KEYDOWN, function(e) {
		e.stopPropagation();

		if (me.canvasController.keyDown(e))
			return;

		var preventDefault = false;
		switch (e.keyCode) {
			case goog.events.KeyCodes.A:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.ANCHOR);
				break;
			case goog.events.KeyCodes.B:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.BELAY);
				break;
			case goog.events.KeyCodes.L:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.LINE);
				break;
			case goog.events.KeyCodes.P:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.PITON);
				break;
			case goog.events.KeyCodes.R:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.STAMP, bc.model.ItemTypes.RAPPEL);
				break;
			case goog.events.KeyCodes.T:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.TEXT);
				break;
			case goog.events.KeyCodes.V:
			case goog.events.KeyCodes.ESC:
				bc.Client.pubsub.publish(bc.Client.pubsubTopics.MODE, bc.Client.modes.SELECT);
				break;
			case goog.events.KeyCodes.Y:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.redo();
				}
				break;
			case goog.events.KeyCodes.Z:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					if (e.shiftKey)
						me.canvasController.redo();
					else
						me.canvasController.undo();
				}
				break;
			case goog.events.KeyCodes.BACKSPACE:
			case goog.events.KeyCodes.DELETE:
				preventDefault = false;
				me.canvasController.startUndoBatch();
				goog.array.forEach(me.canvasController.getSelectedItems(), function(item) {
					var properties = null;
					if (item.isStamp) {
						preventDefault = true;
						properties = bc.model.Stamp.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteStamp, properties));
					}
					else if (item.isLine) {
						preventDefault = true;
						properties = bc.model.Line.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteLine, properties));
					}
					else if (item.isText) {
						preventDefault = true;
						properties = bc.model.Text.parseParams(item.properties);
						properties.id = item.id;
						me.canvasController.runAction(new bc.model.Action(bc.model.ActionType.DeleteText, properties));
					}
				});
				me.canvasController.endUndoBatch();
				me.canvasController.deselectAll();
				break;
			case goog.events.KeyCodes.DASH:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.zoomOut();
				}
				break;
			case goog.events.KeyCodes.EQUALS:
				if (e.ctrlKey || e.metaKey) {
					preventDefault = true;
					me.canvasController.zoomIn();
				}
				break;
			default:
				break;
		}
		
		if (preventDefault)
			e.preventDefault();
	});
};


/* === src/lib/betacreator/controllers/Canvas.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.controller.Canvas');

goog.require('bc.mode.Select');
goog.require('bc.mode.Line');
goog.require('bc.mode.Stamp');
goog.require('bc.mode.Text');
goog.require('bc.mode.LineEdit');
goog.require('bc.model.Action');
goog.require('bc.model.stamp.Anchor');
goog.require('bc.model.stamp.Piton');
goog.require('bc.model.stamp.Rappel');
goog.require('bc.model.stamp.Belay');
goog.require('bc.model.Text');
goog.require('bc.model.Line');
goog.require('bc.model.Canvas');
goog.require('bc.view.Canvas');
goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.Client} client
 * @param {Image} image
 * @param {Object=} defaultProperties
 * @constructor
 */
bc.controller.Canvas = function(client, image, defaultProperties) {
	var me = this;
	
	this.client = client;
	this.model = new bc.model.Canvas(this, image, defaultProperties);
	this.view = new bc.view.Canvas(this, this.model);

	this.offset = new goog.math.Coordinate();

	/** @type {string|null} */
	this.selected = null;

	bc.property.canvas = this;
	
	/* Modes
	========================================================================= */
	
	this.modes = {};

	this.modes[bc.Client.modes.SELECT] = new bc.mode.Select(this, bc.Client.modes.SELECT);
	this.modes[bc.Client.modes.LINE] = new bc.mode.Line(this, bc.Client.modes.LINE, this.model.tempLine);
	this.modes[bc.Client.modes.STAMP] = new bc.mode.Stamp(this, bc.Client.modes.STAMP);
	this.modes[bc.Client.modes.TEXT] = new bc.mode.Text(this, bc.Client.modes.TEXT);
	this.modes[bc.Client.modes.LINE_EDIT] = new bc.mode.LineEdit(this, bc.Client.modes.LINE_EDIT);

	var lastModeParam = null;
	bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.MODE, function(mode, param) {
		if (me.modes[mode]) {
			var changed = me.mode != me.modes[mode] || lastModeParam != param;

			if (changed && me.mode && me.mode.onDeactivate)
				me.mode.onDeactivate();

			me.mode = me.modes[mode];

			if (changed && me.mode.onActivate)
				me.mode.onActivate(param);

			lastModeParam = param;
		}
	});
	
	/** @type {bc.Mode} */
	this.mode = null;
	
	
	/* Undo/redo functionality
	========================================================================= */
	
	/**
	 * A list of actions that have been done that could be undone.
	 * @type {Array.<Array.<bc.model.Action>>}
	 */
	this.undoHistory = [];
	
	/**
	 * A list of actions that have been undone that could be redone.
	 * @type {Array.<Array.<bc.model.Action>>}
	 */
	this.redoHistory = [];
	
	/**
	 * Depth of the current undo batch.  When this is zero,
	 * we commit the current batch to undoHistory.
	 * @type {number}
	 */
	this.undoBatchLevel = 0;
	
	/**
	 * A list of actions that have been done that could be undone.
	 * When undoBatchLevel reaches 0, these are committed to
	 * undoHistory.
	 * @type {Array.<bc.model.Action>}
	 */
	this.undoBatch = [];
	
	//Just in case some Javascript error keeps endUndoBatch from getting
	//called, call it ourselves very frequently so that not too much undo
	//data gets bunched up together.
	setInterval(function() {
		me.endUndoBatch();
	}, 100);
};

/**
 * Start a batch of actions that should be undone as a unit.
 */
bc.controller.Canvas.prototype.startUndoBatch = function() {
	this.undoBatchLevel++;
};

/**
 * End a batch of actions that should be undone as a unit
 */
bc.controller.Canvas.prototype.endUndoBatch = function() {	
	this.undoBatchLevel = Math.max(0, this.undoBatchLevel - 1);
	
	if(this.undoBatchLevel == 0 && this.undoBatch.length > 0) {
		this.undoHistory.unshift(this.undoBatch);
		this.redoHistory = [];
		this.undoBatch = [];
	}
};

/**
 * @return {boolean} True if there is something in the undo history
 * @private
 */
bc.controller.Canvas.prototype.canUndo = function() {
	return this.undoHistory.length > 0;
};

/**
 * @return {boolean} True if there is something in the redo history
 * @private
 */
bc.controller.Canvas.prototype.canRedo = function() {
	return this.redoHistory.length > 0;
};

/**
 * Clears all undo and redo history
 * @private
 */
bc.controller.Canvas.prototype.clearUndoHistory = function() {
	this.undoHistory = [];
	this.redoHistory = [];
};

/**
 * @param {Event} e
 * @return {goog.math.Coordinate}
 * @private
 */
bc.controller.Canvas.prototype.eventToCoord = function(e) {
	var x = e.clientX,
		y = e.clientY,
		pageOffset = goog.style.getViewportPageOffset(document),
		offset = goog.style.getPageOffset(this.client.gui.viewport);
	
	return new goog.math.Coordinate(
		Math.round((x + pageOffset.x - offset.x - this.offset.x)/this.model.scale),
		Math.round((y + pageOffset.y - offset.y - this.offset.y)/this.model.scale)
	);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * Undoes the most recent batch in the undo history
 */
bc.controller.Canvas.prototype.undo = function() {
	if(this.undoHistory.length === 0)
		return;
	
	var oldBatch = this.undoHistory[0];
	var newBatch = [];
	
	var me = this;
	goog.array.forEach(oldBatch, function(a) {
		a = bc.model.Action.getReverseAction(a);
		if(a != null) {
			a.isUndo = true;
			a.isRedo = false;
			newBatch.unshift(a);
			
			me.runAction(a);
		}
	});
	
	//Remove the old actionset from the end of the undo history.
	this.undoHistory.shift();
	
	//Add the new actionset to the redo history
	this.redoHistory.unshift(newBatch);
};

/**
 * Redoes the most recent batch in the redo history
 */
bc.controller.Canvas.prototype.redo = function() {
	if(this.redoHistory.length === 0)
		return;
	
	var oldBatch = this.redoHistory[0];
	var newBatch = [];

	var me = this;
	goog.array.forEach(oldBatch, function(a) {
		a = bc.model.Action.getReverseAction(a);
		if(a != null) {
			a.isRedo = true;
			a.isUndo = false;
			newBatch.unshift(a);
			
			me.runAction(a);
		}
	});
	
	//Remove the old actionset from the start of the redo history.
	this.redoHistory.shift();
	
	//Add the new actionset to the undo history
	this.undoHistory.unshift(newBatch);
};

/**
 * @param {bc.model.Action} action
 * @return {boolean} success
 */
bc.controller.Canvas.prototype.runAction = function(action) {
	var item;
	switch (action.type) {
		case bc.model.ActionType.CreateStamp:
			switch (action.params.type) {
				case bc.model.ItemTypes.ANCHOR:
					item = new bc.model.stamp.Anchor(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.PITON:
					item = new bc.model.stamp.Piton(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.RAPPEL:
					item = new bc.model.stamp.Rappel(action.params, this.model.properties);
					break;
				case bc.model.ItemTypes.BELAY:
					item = new bc.model.stamp.Belay(action.params, this.model.properties);
					break;
				default:
					break;
			}
			
			if (item) {
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else
				return false;
			
			break;
		case bc.model.ActionType.CreateLine:
			if (action.params.controlPoints && action.params.controlPoints.length > 1) {
				item = new bc.model.Line(action.params, this.model.properties);
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else {
				return false;
			}
			
			break;
		case bc.model.ActionType.CreateText:
			if (action.params.text) {
				item = new bc.model.Text(action.params, this.model.properties);
				action.params.id = item.id;
				this.model.addItem(item);
			}
			else {
				return false;
			}
			
			break;
		case bc.model.ActionType.EditItem:
			item = this.model.getItem(action.params.id);
			
			if (item) {
				if (!action.oldParams) {
					var allParams = item.getActionParams(),
						oldParams = {
							id: action.params.id
						};

					for (var key in action.params) {
						if (allParams[key] !== undefined)
							oldParams[key] = allParams[key];
					}
					action.oldParams = oldParams;
				}

				item.setActionParams(action.params);
			}
			else
				return false;
			
			break;
		case bc.model.ActionType.DeleteStamp:
		case bc.model.ActionType.DeleteText:
		case bc.model.ActionType.DeleteLine:
			item = this.model.getItem(action.params.id);
			
			if (item)
				this.model.removeItem(item);
			else
				return false;
			
			break;
		default:
			return false;
	}
	
	this.startUndoBatch();
	
	if(!action.isUndo && !action.isRedo)
		this.undoBatch.unshift(action);

	this.endUndoBatch();

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.ACTION);
	
	return true;
};

/**
 * @param {bc.model.Item} item
 * @return {boolean}
 */
bc.controller.Canvas.prototype.isItemSelected = function(item) {
	return this.selected == item.id;
};

/**
 * @param {bc.model.Item} item
 */
bc.controller.Canvas.prototype.selectItem = function(item) {
	this.selected = item.id;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @return {Array.<bc.model.Item>} items
 */
bc.controller.Canvas.prototype.getSelectedItems = function() {
	if (!this.selected)
		return [];

	var item = this.model.getItem(this.selected);

	if (item)
		return [item];
	else
		return [];
};

/**
 */
bc.controller.Canvas.prototype.deselectAll = function() {
	this.selected = null;

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.SELECTION_CHANGE);
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseDown = function(e) {
	this.mode.mouseDown(e, this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseMove = function(e) {
	this.mode.mouseMove(e, this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.mouseUp = function(e) {
	this.mode.mouseUp(e, this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.dblClick = function(e) {
	this.mode.dblClick(e, this.eventToCoord(e));
};

/**
 * @param {Event} e
 */
bc.controller.Canvas.prototype.keyDown = function(e) {
	return this.mode.keyDown(e);
};

bc.controller.Canvas.prototype.zoomOut = function() {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);

	this.model.zoomOut();
};

bc.controller.Canvas.prototype.zoomIn = function() {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);

	this.model.zoomIn();
};

/**
 * @param {number|string} zoom can be a number (from 1-1200) or 'cover' or 'contain'
 */
bc.controller.Canvas.prototype.setZoom = function(zoom) {
	if (goog.isNumber(zoom)) {
		zoom /= 100;
	}
	else if (zoom == 'cover') {
		zoom = Math.max(
			this.client.viewportWidth/this.model.w,
			this.client.viewportHeight/this.model.h
		);
	}
	else { // contain
		zoom = Math.min(
			this.client.viewportWidth/this.model.w,
			this.client.viewportHeight/this.model.h
		);
	}

	this.model.zoomTo(zoom);

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {number} scaleFactor
 */
bc.controller.Canvas.prototype.setZoomOffset = function(scaleFactor) {
	var centerX = scaleFactor*(this.client.viewportWidth/2 - this.offset.x),
		centerY = scaleFactor*(this.client.viewportHeight/2 - this.offset.y),
		w = this.model.w*this.model.scale,
		h = this.model.h*this.model.scale;

	this.offset.x = -Math.round(centerX - this.client.viewportWidth/2);
	this.offset.y = -Math.round(centerY - this.client.viewportHeight/2);

	if (w <= this.client.viewportWidth)
		this.offset.x = Math.round(this.client.viewportWidth/2 - w/2);
	else
		this.offset.x = goog.math.clamp(this.offset.x, this.client.viewportWidth - w, 0);

	if (h <= this.client.viewportHeight)
		this.offset.y = Math.round(this.client.viewportHeight/2 - h/2);
	else
		this.offset.y = goog.math.clamp(this.offset.y, this.client.viewportHeight - h, 0);
};

bc.controller.Canvas.prototype.setCenterOffset = function() {
	this.offset.x = Math.round(this.client.viewportWidth/2 - this.model.w*this.model.scale/2);
	this.offset.y = Math.round(this.client.viewportHeight/2 - this.model.h*this.model.scale/2);
};

bc.controller.Canvas.prototype.startPan = function() {
	var w = Math.round(this.model.w*this.model.scale),
		h = Math.round(this.model.h*this.model.scale);

	this.minPanDx = -Math.max(this.offset.x + w - this.client.viewportWidth, 0);
	this.maxPanDx = Math.max(-this.offset.x, 0);
	this.minPanDy = -Math.max(this.offset.y + h - this.client.viewportHeight, 0);
	this.maxPanDy = Math.max(-this.offset.y, 0);
};

bc.controller.Canvas.prototype.panTo = function(dx, dy) {
	dx = goog.math.clamp(dx, this.minPanDx, this.maxPanDx);
	dy = goog.math.clamp(dy, this.minPanDy, this.maxPanDy);

	this.lastPanDx = dx;
	this.lastPanDy = dy;

	this.view.container.style.left = (this.offset.x + dx) + 'px';
	this.view.container.style.top = (this.offset.y + dy) + 'px';
};

bc.controller.Canvas.prototype.endPan = function() {
	this.offset.x += this.lastPanDx || 0;
	this.offset.y += this.lastPanDy || 0;

	this.lastPanDx = 0;
	this.lastPanDy = 0;
};

/**
 * @param {boolean=} includeSource
 * @param {string=} type
 * @param {?number=} width
 * @param {Image=} srcImage
 * @return {string}
 */
bc.controller.Canvas.prototype.getImage = function(includeSource, type, width, srcImage) {
	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER, true);

	var canvas = goog.dom.createElement(goog.dom.TagName.CANVAS),
		ctx = canvas.getContext('2d'),
		scale = 1;

	type = (includeSource && type && type.toLowerCase() == 'jpg') ? 'jpeg' : 'png';

	if (width) {
		scale = width/this.model.w;
		canvas.width = width;
		canvas.height = Math.round(width*this.model.h/this.model.w);
	}
	else {
		canvas.width = this.model.w;
		canvas.height = this.model.h;
	}

	if (includeSource) {
		if (scale !== 1) {
			ctx.drawImage(srcImage || this.model.image, 0, 0, canvas.width, canvas.height);
		}
		else {
			ctx.drawImage(srcImage || this.model.image, 0, 0);
		}
	}

	this.view.renderToContext(ctx, scale);

	try {
		return canvas.toDataURL("image/" + type);
	}
	catch(e) {
		alert('Source image must be from the same domain to be included in getImage. Try getImage() without any parameters.');
		return '';
	}
};


/* === src/lib/betacreator/Client.js === */
/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
goog.provide('bc.Client');

//goog.require('bc.view.Line');
//goog.require('bc.view.stamp.Anchor');
goog.require('bc.GUI');
goog.require('bc.properties');
goog.require('bc.controller.Canvas');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.string');
goog.require('goog.pubsub.PubSub');

/**
 * @param {Image} sourceImg
 * @param {?Function=} onReady
 * @param {Object=} params
 *
 * @constructor
 */
bc.Client = function(sourceImg, onReady, params) {
	params = params || {};
	
	this.params = {
		w: params['width'] || null, // null for auto
		h: params['height'] || null, // null for auto
		zoom: params['zoom'] || 'contain',
		parent: params['parent'] || null, // null to replace image
		onChange: params['onChange'] || null,
		scaleFactor: params['scaleFactor'] || 1
	};

	this.defaultProperties = {};
	this.defaultProperties[bc.properties.ITEM_SCALE] = this.params.scaleFactor;

	this.guiConfig = {
		scaleFactor: this.params.scaleFactor
	};
	
	this.minWidth = 556;

	this.sourceImage = sourceImg;

	this.initialized = false;

	/**
	 * @type {Array.<Function>}
	 */
	this.postInitializeCallbacks = [];

	if (onReady) {
		this.postInitializeCallbacks.push(onReady);
	}
	
	// load the image url into a new img element and call init on completion
	var image = goog.dom.createElement('img');
	this.imageLoadHandle = goog.events.listen(image, goog.events.EventType.LOAD, function() {
		this.init(image);
	}, false, this);

	image.src = this.sourceImage.src;

	if (this.params.onChange) {
		bc.Client.pubsub.subscribe(bc.Client.pubsubTopics.ACTION, function() {
			this.params.onChange();
		}, this);
	}
};

/**
 * @private
 */
bc.Client.prototype.init = function(image) {
	goog.events.unlistenByKey(this.imageLoadHandle);
	
	this.canvasController = new bc.controller.Canvas(this, image, this.defaultProperties);
	this.gui = new bc.GUI(this, this.guiConfig);

	this.viewportWidth = this.params.w || image.width;
	this.viewportHeight = this.params.h || image.height;

	if (goog.isNumber(this.viewportWidth) && this.viewportWidth < this.minWidth)
		this.viewportWidth = this.minWidth;

	var optionbarHeight = 29;
	
	goog.style.setStyle(this.gui.wrapper, {
		'position': 'relative',
		'display': (this.sourceImage.style.display == 'inherit' ? 'inline-block' : (this.sourceImage.style.display || 'inline-block')),
		'width': goog.isNumber(this.viewportWidth) ? (this.viewportWidth + 'px') : this.viewportWidth,
		'height': goog.isNumber(this.viewportHeight) ? ((this.viewportHeight + optionbarHeight) + 'px') : this.viewportHeight
	});

	if (this.params.parent)
		goog.dom.appendChild(this.params.parent, this.gui.wrapper);
	else
		goog.dom.replaceNode(this.gui.wrapper, this.sourceImage);

	if (!goog.isNumber(this.viewportWidth))
		this.viewportWidth = goog.style.getBorderBoxSize(this.gui.wrapper).width - 2;
	if (!goog.isNumber(this.viewportHeight))
		this.viewportHeight = goog.style.getBorderBoxSize(this.gui.wrapper).height - optionbarHeight - 2;

	this.gui.init();

	this.canvasController.setZoom(this.params.zoom);
	this.canvasController.view.centerInViewport();

	this.initialized = true;
	goog.array.forEach(this.postInitializeCallbacks, function(f) {
		f();
	});
	this.postInitializeCallbacks = [];
};

/**
 * @param {Object} data
 * @private
 */
bc.Client.prototype.loadData = function(data) {
	var me = this;

	this.canvasController.model.removeAllItems();

	goog.array.forEach(data['items'] || [], function(itemData) {
		var item = null;
		switch(itemData[bc.properties.ITEM_TYPE]) {
			case bc.model.ItemTypes.ANCHOR:
				item = new bc.model.stamp.Anchor(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.PITON:
				item = new bc.model.stamp.Piton(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.RAPPEL:
				item = new bc.model.stamp.Rappel(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.BELAY:
				item = new bc.model.stamp.Belay(bc.model.Stamp.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.LINE:
				item = new bc.model.Line(bc.model.Line.parseParams(itemData), me.canvasController.model.properties);
				break;
			case bc.model.ItemTypes.TEXT:
				item = new bc.model.Text(bc.model.Text.parseParams(itemData), me.canvasController.model.properties);
				break;
			default:
				break;
		}

		if (item)
			me.canvasController.model.addItem(item);
	});

	bc.Client.pubsub.publish(bc.Client.pubsubTopics.CANVAS_RENDER);
};

/**
 * @param {boolean=} escape
 * @return {string}
 * @private
 */
bc.Client.prototype.getData = function(escape) {
	var items = [];

	this.canvasController.model.eachItem(function(item) {
		items.push(item.serializeParams());
	});

	if (escape)
		return goog.string.stripQuotes(goog.string.quote(goog.json.serialize({
			'items': items
		})), '"');
	else
		return goog.json.serialize({
			'items': items
		});
};

/**
 * @param {boolean=} includeSource
 * @param {string=} type
 * @param {?number=} width
 * @param {Image=} srcImage
 * @return {string}
 * @private
 */
bc.Client.prototype.getImage = function(includeSource, type, width, srcImage) {
	return this.canvasController.getImage(includeSource, type, width, srcImage);
};

/**
 * @param {Image} sourceImg
 * @param {?Function=} onReady
 * @param {Object=} options
 * @return {Object}
 */
bc.Client.go = function(sourceImg, onReady, options) {
	var ret,
		client = new bc.Client(sourceImg, onReady ? function() { onReady.call(ret); } : null, options),
		onError = options['onError'] || function(er) { alert (er); };

	ret = {
		'loadData': function(data) {
			try {
				data = goog.json.parse(data);
				if (!client.initialized) {
					client.postInitializeCallbacks.push(function() {
						client.loadData(data);
					});
				}
				else {
					client.loadData(data);
				}
			}
			catch(e) {
				onError(bc.i18n("Invalid data."));
			}
		},
		'getData': function(escape) {
			try {
				return client.getData(escape);
			}
			catch(e) {
				onError(bc.i18n("Editor hasn't been initialized yet, make calls in onReady callback."));
			}
		},
		'getImage': function(includeSource, type, width, srcImage) {
			try {
				return client.getImage(includeSource, type, parseInt(width, 10) || null, srcImage);
			}
			catch(e) {
				onError(bc.i18n("Editor hasn't been initialized yet, make calls in onReady callback."));
			}
		}
	};

	return ret;
};

/**
 * @type {goog.pubsub.PubSub}
 */
bc.Client.pubsub = new goog.pubsub.PubSub();

/**
 * @enum {string}
 */
bc.Client.pubsubTopics = {
	CANVAS_RENDER: 'cr',
	SELECTION_CHANGE: 'sc',
	SHOW_COLOR_PICKER: 'scp',
	SHOW_TEXT_AREA: 'sta',
	HIDE_OVERLAYS: 'ho',
	MODE: 'm',
	ACTION: 'a'
};

/**
 * @enum {number}
 */
bc.Client.modes = {
	SELECT: 0,
	LINE: 1,
	STAMP: 2,
	TEXT: 3,
	LINE_EDIT: 4
};

goog.exportSymbol('BetaCreator', bc.Client.go);
