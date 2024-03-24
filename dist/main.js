/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/gifsparser.js":
/*!***************************!*\
  !*** ./lib/gifsparser.js ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {

eval("/**\n * \n * Gif parser by @gtk2k\n * https://github.com/gtk2k/gtk2k.github.io/tree/master/animation_gif\n *\n */\n\nexports.parseGIF = function (gif, successCB, errorCB) {\n  var pos = 0;\n  var delayTimes = [];\n  var loadCnt = 0;\n  var graphicControl = null;\n  var imageData = null;\n  var frames = [];\n  var loopCnt = 0;\n  if (gif[0] === 0x47 && gif[1] === 0x49 && gif[2] === 0x46 &&\n  // 'GIF'\n  gif[3] === 0x38 && (gif[4] === 0x39 || gif[4] === 0x37) && gif[5] === 0x61) {\n    // '89a'\n    pos += 13 + +!!(gif[10] & 0x80) * Math.pow(2, (gif[10] & 0x07) + 1) * 3;\n    var gifHeader = gif.subarray(0, pos);\n    while (gif[pos] && gif[pos] !== 0x3b) {\n      var offset = pos,\n        blockId = gif[pos];\n      if (blockId === 0x21) {\n        var label = gif[++pos];\n        if ([0x01, 0xfe, 0xf9, 0xff].indexOf(label) !== -1) {\n          label === 0xf9 && delayTimes.push((gif[pos + 3] + (gif[pos + 4] << 8)) * 10);\n          label === 0xff && (loopCnt = gif[pos + 15] + (gif[pos + 16] << 8));\n          while (gif[++pos]) pos += gif[pos];\n          label === 0xf9 && (graphicControl = gif.subarray(offset, pos + 1));\n        } else {\n          errorCB && errorCB('parseGIF: unknown label');\n          break;\n        }\n      } else if (blockId === 0x2c) {\n        pos += 9;\n        pos += 1 + +!!(gif[pos] & 0x80) * (Math.pow(2, (gif[pos] & 0x07) + 1) * 3);\n        while (gif[++pos]) pos += gif[pos];\n        var imageData = gif.subarray(offset, pos + 1);\n        // Each frame should have an image and a flag to indicate how to dispose it.\n        var frame = {\n          // http://matthewflickinger.com/lab/whatsinagif/animation_and_transparency.asp\n          // Disposal method is a flag stored in the 3rd byte of the graphics control\n          // This byte is packed and stores more information, only 3 bits of it represent the disposal\n          disposalMethod: graphicControl[3],\n          blob: URL.createObjectURL(new Blob([gifHeader, graphicControl, imageData]))\n        };\n        frames.push(frame);\n      } else {\n        errorCB && errorCB('parseGIF: unknown blockId');\n        break;\n      }\n      pos++;\n    }\n  } else {\n    errorCB && errorCB('parseGIF: no GIF89a');\n  }\n  if (frames.length) {\n    var cnv = document.createElement('canvas');\n    var loadImg = function loadImg() {\n      for (var i = 0; i < frames.length; i++) {\n        var img = new Image();\n        img.onload = function (e, i) {\n          if (i === 0) {\n            cnv.width = img.width;\n            cnv.height = img.height;\n          }\n          loadCnt++;\n          frames[i] = this;\n          if (loadCnt === frames.length) {\n            loadCnt = 0;\n            imageFix(1);\n          }\n        }.bind(img, null, i);\n        // Link html image tag with the extracted GIF Frame \n        img.src = frames[i].blob;\n        img.disposalMethod = frames[i].disposalMethod;\n      }\n    };\n    var imageFix = function imageFix(i) {\n      var img = new Image();\n      img.onload = function (e, i) {\n        loadCnt++;\n        frames[i] = this;\n        if (loadCnt === frames.length) {\n          cnv = null;\n          successCB && successCB(delayTimes, loopCnt, frames);\n        } else {\n          imageFix(++i);\n        }\n      }.bind(img);\n      img.src = cnv.toDataURL('image/gif');\n    };\n    loadImg();\n  }\n};\n\n//# sourceURL=webpack://aframe-gif-shader/./lib/gifsparser.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _lib_gifsparser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gifsparser */ \"./lib/gifsparser.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\n\nif (typeof AFRAME === 'undefined') {\n  throw 'Component attempted to register before AFRAME was available.';\n}\n\n/* get util from AFRAME */\nvar parseUrl = AFRAME.utils.srcLoader.parseUrl;\nvar debug = AFRAME.utils.debug;\n// debug.enable('shader:gif:*')\ndebug.enable('shader:gif:warn');\nvar warn = debug('shader:gif:warn');\nvar log = debug('shader:gif:debug');\n\n/* store data so that you won't load same data */\nvar gifData = {};\n\n/* create error message */\nfunction createError(err, src) {\n  return {\n    status: 'error',\n    src: src,\n    message: err,\n    timestamp: Date.now()\n  };\n}\nAFRAME.registerShader('gif', {\n  /**\n   * For material component:\n   * @see https://github.com/aframevr/aframe/blob/60d198ef8e2bfbc57a13511ae5fca7b62e01691b/src/components/material.js\n   * For example of `registerShader`:\n   * @see https://github.com/aframevr/aframe/blob/41a50cd5ac65e462120ecc2e5091f5daefe3bd1e/src/shaders/flat.js\n   * For MeshBasicMaterial\n   * @see http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial\n   */\n  schema: {\n    /* For material */\n    color: {\n      type: 'color'\n    },\n    fog: {\n      \"default\": true\n    },\n    /* For texuture */\n    src: {\n      \"default\": null\n    },\n    autoplay: {\n      \"default\": true\n    }\n  },\n  /**\n   * Initialize material. Called once.\n   * @protected\n   */\n  init: function init(data) {\n    log('init', data);\n    log(this.el.components);\n    this.__cnv = document.createElement('canvas');\n    this.__cnv.width = 2;\n    this.__cnv.height = 2;\n    this.__ctx = this.__cnv.getContext('2d');\n    this.__texture = new THREE.Texture(this.__cnv); //renders straight from a canvas\n    if (data.repeat) {\n      this.__texture.wrapS = THREE.RepeatWrapping;\n      this.__texture.wrapT = THREE.RepeatWrapping;\n      this.__texture.repeat.set(data.repeat.x, data.repeat.y);\n    }\n    this.__material = {};\n    this.__reset();\n    this.material = new THREE.MeshBasicMaterial({\n      map: this.__texture\n    });\n    this.el.sceneEl.addBehavior(this);\n    return this.material;\n  },\n  /**\n   * Update or create material.\n   * @param {object|null} oldData\n   */\n  update: function update(oldData) {\n    log('update', oldData);\n    this.__updateMaterial(oldData);\n    this.__updateTexture(oldData);\n    return this.material;\n  },\n  /**\n   * Called on each scene tick.\n   * @protected\n   */\n  tick: function tick(t) {\n    if (!this.__frames || this.paused()) return;\n    if (Date.now() - this.__startTime >= this.__nextFrameTime) {\n      this.nextFrame();\n    }\n  },\n  /*================================\n  =            material            =\n  ================================*/\n  /**\n   * Updating existing material.\n   * @param {object} data - Material component data.\n   */\n  __updateMaterial: function __updateMaterial(data) {\n    var material = this.material;\n    var newData = this.__getMaterialData(data);\n    Object.keys(newData).forEach(function (key) {\n      material[key] = newData[key];\n    });\n  },\n  /**\n   * Builds and normalize material data, normalizing stuff along the way.\n   * @param {Object} data - Material data.\n   * @return {Object} data - Processed material data.\n   */\n  __getMaterialData: function __getMaterialData(data) {\n    return {\n      fog: data.fog,\n      color: new THREE.Color(data.color)\n    };\n  },\n  /*==============================\n  =            texure            =\n  ==============================*/\n  /**\n   * set texure\n   * @private\n   * @param {Object} data\n   * @property {string} status - success / error\n   * @property {string} src - src url\n   * @property {array} times - array of time length of each image\n   * @property {number} cnt - total counts of gif images\n   * @property {array} frames - array of each image\n   * @property {Date} timestamp - created at the texure\n   */\n  __setTexure: function __setTexure(data) {\n    log('__setTexure', data);\n    if (data.status === 'error') {\n      warn(\"Error: \".concat(data.message, \"\\nsrc: \").concat(data.src));\n      this.__reset();\n    } else if (data.status === 'success' && data.src !== this.__textureSrc) {\n      this.__reset();\n      /* Texture added or changed */\n      this.__ready(data);\n    }\n  },\n  /**\n   * Update or create texure.\n   * @param {Object} data - Material component data.\n   */\n  __updateTexture: function __updateTexture(data) {\n    var src = data.src,\n      autoplay = data.autoplay;\n\n    /* autoplay */\n    if (typeof autoplay === 'boolean') {\n      this.__autoplay = autoplay;\n    } else if (typeof autoplay === 'undefined') {\n      this.__autoplay = true;\n    }\n    if (this.__autoplay && this.__frames) {\n      this.play();\n    }\n\n    /* src */\n    if (src) {\n      this.__validateSrc(src, this.__setTexure.bind(this));\n    } else {\n      /* Texture removed */\n      this.__reset();\n    }\n  },\n  /*=============================================\n  =            varidation for texure            =\n  =============================================*/\n  __validateSrc: function __validateSrc(src, cb) {\n    /* check if src is a url */\n    var url = parseUrl(src);\n    if (url) {\n      this.__getImageSrc(url, cb);\n      return;\n    }\n    var message;\n\n    /* check if src is a query selector */\n    var el = this.__validateAndGetQuerySelector(src);\n    if (!el || _typeof(el) !== 'object') {\n      return;\n    }\n    if (el.error) {\n      message = el.error;\n    } else {\n      var tagName = el.tagName.toLowerCase();\n      if (tagName === 'video') {\n        src = el.src;\n        message = 'For video, please use `aframe-video-shader`';\n      } else if (tagName === 'img') {\n        this.__getImageSrc(el.src, cb);\n        return;\n      } else {\n        message = \"For <\".concat(tagName, \"> element, please use `aframe-html-shader`\");\n      }\n    }\n\n    /* if there is message, create error data */\n    if (message) {\n      var srcData = gifData[src];\n      var errData = createError(message, src);\n      /* callbacks */\n      if (srcData && srcData.callbacks) {\n        srcData.callbacks.forEach(function (cb) {\n          return cb(errData);\n        });\n      } else {\n        cb(errData);\n      }\n      /* overwrite */\n      gifData[src] = errData;\n    }\n  },\n  /**\n   * Validate src is a valid image url\n   * @param  {string} src - url that will be tested\n   * @param  {function} cb - callback with the test result\n   */\n  __getImageSrc: function __getImageSrc(src, cb) {\n    var _this = this;\n    /* if src is same as previous, ignore this */\n    if (src === this.__textureSrc) {\n      return;\n    }\n\n    /* check if we already get the srcData */\n    var srcData = gifData[src];\n    if (!srcData || !srcData.callbacks) {\n      /* create callback */\n      srcData = gifData[src] = {\n        callbacks: []\n      };\n      srcData.callbacks.push(cb);\n    } else if (srcData.src) {\n      cb(srcData);\n      return;\n    } else if (srcData.callbacks) {\n      /* add callback */\n      srcData.callbacks.push(cb);\n      return;\n    }\n    var tester = new Image();\n    tester.crossOrigin = 'Anonymous';\n    tester.addEventListener('load', function (e) {\n      /* check if it is gif */\n      _this.__getUnit8Array(src, function (arr) {\n        if (!arr) {\n          onError('This is not gif. Please use `shader:flat` instead');\n          return;\n        }\n        /* parse data */\n        (0,_lib_gifsparser__WEBPACK_IMPORTED_MODULE_0__.parseGIF)(arr, function (times, cnt, frames) {\n          /* store data */\n          var newData = {\n            status: 'success',\n            src: src,\n            times: times,\n            cnt: cnt,\n            frames: frames,\n            timestamp: Date.now()\n          };\n          /* callbacks */\n          if (srcData.callbacks) {\n            srcData.callbacks.forEach(function (cb) {\n              return cb(newData);\n            });\n            /* overwrite */\n            gifData[src] = newData;\n          }\n        }, function (err) {\n          return onError(err);\n        });\n      });\n    });\n    tester.addEventListener('error', function (e) {\n      return onError('Could be the following issue\\n - Not Image\\n - Not Found\\n - Server Error\\n - Cross-Origin Issue');\n    });\n    function onError(message) {\n      /* create error data */\n      var errData = createError(message, src);\n      /* callbacks */\n      if (srcData.callbacks) {\n        srcData.callbacks.forEach(function (cb) {\n          return cb(errData);\n        });\n        /* overwrite */\n        gifData[src] = errData;\n      }\n    }\n    tester.src = src;\n  },\n  /**\n   *\n   * get mine type\n   *\n   */\n  __getUnit8Array: function __getUnit8Array(src, cb) {\n    if (typeof cb !== 'function') {\n      return;\n    }\n    var xhr = new XMLHttpRequest();\n    xhr.open('GET', src);\n    xhr.responseType = 'arraybuffer';\n    xhr.addEventListener('load', function (e) {\n      var uint8Array = new Uint8Array(e.target.response);\n      var arr = uint8Array.subarray(0, 4);\n      // const header = arr.map(value => value.toString(16)).join('')\n      var header = '';\n      for (var i = 0; i < arr.length; i++) {\n        header += arr[i].toString(16);\n      }\n      if (header === '47494638') {\n        cb(uint8Array);\n      } else {\n        cb();\n      }\n    });\n    xhr.addEventListener('error', function (e) {\n      log(e);\n      cb();\n    });\n    xhr.send();\n  },\n  /**\n   * Query and validate a query selector,\n   *\n   * @param  {string} selector - DOM selector.\n   * @return {object} Selected DOM element | error message object.\n   */\n  __validateAndGetQuerySelector: function __validateAndGetQuerySelector(selector) {\n    try {\n      var el = document.querySelector(selector);\n      if (!el) {\n        return {\n          error: 'No element was found matching the selector'\n        };\n      }\n      return el;\n    } catch (e) {\n      // Capture exception if it's not a valid selector.\n      return {\n        error: 'no valid selector'\n      };\n    }\n  },\n  /*================================\n  =            playback            =\n  ================================*/\n  /**\n   * Pause gif\n   * @public\n   */\n  pause: function pause() {\n    log('pause');\n    this.__paused = true;\n  },\n  /**\n   * Play gif\n   * @public\n   */\n  play: function play() {\n    log('play');\n    this.__paused = false;\n  },\n  /**\n   * Toggle playback. play if paused and pause if played.\n   * @public\n   */\n  togglePlayback: function togglePlayback() {\n    if (this.paused()) {\n      this.play();\n    } else {\n      this.pause();\n    }\n  },\n  /**\n   * Return if the playback is paused.\n   * @public\n   * @return {boolean}\n   */\n  paused: function paused() {\n    return this.__paused;\n  },\n  /**\n   * Go to next frame\n   * @public\n   */\n  nextFrame: function nextFrame() {\n    this.__draw();\n\n    /* update next frame time */\n    while (Date.now() - this.__startTime >= this.__nextFrameTime) {\n      this.__nextFrameTime += this.__delayTimes[this.__frameIdx++];\n      if ((this.__infinity || this.__loopCnt) && this.__frameCnt <= this.__frameIdx) {\n        /* go back to the first */\n        this.__frameIdx = 0;\n      }\n    }\n  },\n  /*==============================\n   =            canvas            =\n   ==============================*/\n  /**\n   * clear canvas\n   * @private\n   */\n  __clearCanvas: function __clearCanvas() {\n    this.__ctx.clearRect(0, 0, this.__width, this.__height);\n    this.__texture.needsUpdate = true;\n  },\n  /**\n   * draw\n   * @private\n   */\n  __draw: function __draw() {\n    if (this.__frameIdx != 0) {\n      var lastFrame = this.__frames[this.__frameIdx - 1];\n      // Disposal method indicates if you should clear or not the background.\n      // This flag is represented in binary and is a packed field which can also represent transparency.\n      // http://matthewflickinger.com/lab/whatsinagif/animation_and_transparency.asp\n      if (lastFrame.disposalMethod == 8 || lastFrame.disposalMethod == 9) {\n        this.__clearCanvas();\n      }\n    } else {\n      this.__clearCanvas();\n    }\n    var actualFrame = this.__frames[this.__frameIdx];\n    if (typeof actualFrame !== 'undefined') {\n      this.__ctx.drawImage(actualFrame, 0, 0, this.__width, this.__height);\n      this.__texture.needsUpdate = true;\n    }\n  },\n  /*============================\n  =            ready            =\n  ============================*/\n  /**\n   * setup gif animation and play if autoplay is true\n   * @private\n   * @property {string} src - src url\n   * @param {array} times - array of time length of each image\n   * @param {number} cnt - total counts of gif images\n   * @param {array} frames - array of each image\n   */\n  __ready: function __ready(_ref) {\n    var src = _ref.src,\n      times = _ref.times,\n      cnt = _ref.cnt,\n      frames = _ref.frames;\n    log('__ready');\n    this.__textureSrc = src;\n    this.__delayTimes = times;\n    cnt ? this.__loopCnt = cnt : this.__infinity = true;\n    this.__frames = frames;\n    this.__frameCnt = times.length;\n    this.__startTime = Date.now();\n    this.__width = THREE.Math.floorPowerOfTwo(frames[0].width);\n    this.__height = THREE.Math.floorPowerOfTwo(frames[0].height);\n    this.__cnv.width = this.__width;\n    this.__cnv.height = this.__height;\n    this.__draw();\n    if (this.__autoplay) {\n      this.play();\n    } else {\n      this.pause();\n    }\n  },\n  /*=============================\n  =            reset            =\n  =============================*/\n  /**\n   * @private\n   */\n  __reset: function __reset() {\n    this.pause();\n    this.__clearCanvas();\n    this.__startTime = 0;\n    this.__nextFrameTime = 0;\n    this.__frameIdx = 0;\n    this.__frameCnt = 0;\n    this.__delayTimes = null;\n    this.__infinity = false;\n    this.__loopCnt = 0;\n    this.__frames = null;\n    this.__textureSrc = null;\n  }\n});\n\n//# sourceURL=webpack://aframe-gif-shader/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;