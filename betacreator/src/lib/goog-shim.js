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