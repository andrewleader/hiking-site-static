/**
 * Minimal Google Closure Library emulation for BetaCreator
 * This provides just enough functionality to run the original BetaCreator code
 */

// Global namespace
window.goog = window.goog || {};

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
  }
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

export default goog;
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
