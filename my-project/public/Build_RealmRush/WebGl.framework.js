/** @format */

var unityFramework = (() => {
  var _scriptDir =
    typeof document !== "undefined" && document.currentScript
      ? document.currentScript.src
      : undefined;

  return function (unityFramework = {}) {
    var Module = typeof unityFramework != "undefined" ? unityFramework : {};
    var readyPromiseResolve, readyPromiseReject;
    Module["ready"] = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var stackTraceReference =
      "(^|\\n)(\\s+at\\s+|)jsStackTrace(\\s+\\(|@)([^\\n]+):\\d+:\\d+(\\)|)(\\n|$)";
    var stackTraceReferenceMatch = jsStackTrace().match(
      new RegExp(stackTraceReference)
    );
    if (stackTraceReferenceMatch)
      Module.stackTraceRegExp = new RegExp(
        stackTraceReference
          .replace(
            "([^\\n]+)",
            stackTraceReferenceMatch[4].replace(/[\\^${}[\]().*+?|]/g, "\\$&")
          )
          .replace("jsStackTrace", "[^\\n]+")
      );
    var abort = function (what) {
      if (ABORT) return;
      ABORT = true;
      EXITSTATUS = 1;
      if (
        typeof ENVIRONMENT_IS_PTHREAD !== "undefined" &&
        ENVIRONMENT_IS_PTHREAD
      )
        console.error("Pthread aborting at " + new Error().stack);
      if (what !== undefined) {
        out(what);
        err(what);
        what = JSON.stringify(what);
      } else {
        what = "";
      }
      var message = "abort(" + what + ") at " + stackTrace();
      if (Module.abortHandler && Module.abortHandler(message)) return;
      throw message;
    };
    Module["SetFullscreen"] = function (fullscreen) {
      if (typeof runtimeInitialized === "undefined" || !runtimeInitialized) {
        console.log("Runtime not initialized yet.");
      } else if (typeof JSEvents === "undefined") {
        console.log("Player not loaded yet.");
      } else {
        var tmp = JSEvents.canPerformEventHandlerRequests;
        JSEvents.canPerformEventHandlerRequests = function () {
          return 1;
        };
        Module.ccall("SetFullscreen", null, ["number"], [fullscreen]);
        JSEvents.canPerformEventHandlerRequests = tmp;
      }
    };
    if (!Module["ENVIRONMENT_IS_PTHREAD"]) {
      Module["preRun"].push(function () {
        var unityFileSystemInit =
          Module["unityFileSystemInit"] ||
          function () {
            FS.mkdir("/idbfs");
            FS.mount(IDBFS, {}, "/idbfs");
            Module.addRunDependency("JS_FileSystem_Mount");
            FS.syncfs(true, function (err) {
              if (err)
                console.log(
                  "IndexedDB is not available. Data will not persist in cache and PlayerPrefs will not be saved."
                );
              Module.removeRunDependency("JS_FileSystem_Mount");
            });
          };
        unityFileSystemInit();
      });
    }
    var videoInputDevices = [];
    var videoInputDevicesSuccessfullyEnumerated = false;
    function matchToOldDevice(newDevice) {
      var oldDevices = Object.keys(videoInputDevices);
      for (var i = 0; i < oldDevices.length; ++i) {
        var old = videoInputDevices[oldDevices[i]];
        if (old.deviceId && old.deviceId == newDevice.deviceId) return old;
      }
      for (var i = 0; i < oldDevices.length; ++i) {
        var old = videoInputDevices[oldDevices[i]];
        if (old == newDevice) return old;
      }
      for (var i = 0; i < oldDevices.length; ++i) {
        var old = videoInputDevices[oldDevices[i]];
        if (old.label && old.label == newDevice.label) return old;
      }
      for (var i = 0; i < oldDevices.length; ++i) {
        var old = videoInputDevices[oldDevices[i]];
        if (
          old.groupId &&
          old.kind &&
          old.groupId == newDevice.groupId &&
          old.kind == newDevice.kind
        )
          return old;
      }
    }
    function assignNewVideoInputId() {
      for (var i = 0; ; ++i) {
        if (!videoInputDevices[i]) return i;
      }
    }
    function updateVideoInputDevices(devices) {
      videoInputDevicesSuccessfullyEnumerated = true;
      videoInputDevices = [];
      var retainedDevices = {};
      var newDevices = [];
      devices.forEach(function (device) {
        if (device.kind === "videoinput") {
          var oldDevice = matchToOldDevice(device);
          if (oldDevice) {
            retainedDevices[oldDevice.id] = oldDevice;
          } else {
            newDevices.push(device);
          }
        }
      });
      videoInputDevices = retainedDevices;
      newDevices.forEach(function (device) {
        if (!device.id) {
          device.id = assignNewVideoInputId();
          device.name = device.label || "Video input #" + (device.id + 1);
          device.isFrontFacing =
            device.name.toLowerCase().includes("front") ||
            (!device.name.toLowerCase().includes("front") &&
              !device.name.toLowerCase().includes("back"));
          videoInputDevices[device.id] = device;
        }
      });
    }
    var mediaDevicesRunDependencyPending = true;
    function removeEnumerateMediaDevicesRunDependency() {
      if (!mediaDevicesRunDependencyPending) return;
      mediaDevicesRunDependencyPending = false;
      try {
        removeRunDependency("enumerateMediaDevices");
      } catch (e) {
        Module.startupErrorHandler(e);
      }
    }
    function enumerateMediaDeviceList() {
      if (!videoInputDevices) return;
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          updateVideoInputDevices(devices);
          removeEnumerateMediaDevicesRunDependency();
        })
        .catch(function (e) {
          console.warn(
            "Unable to enumerate media devices: " +
              e +
              "\nWebcams will not be available."
          );
          disableAccessToMediaDevices();
        });
      if (/Firefox/.test(navigator.userAgent)) {
        setTimeout(enumerateMediaDeviceList, 6e4);
        warnOnce(
          "Applying workaround to Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=1397977"
        );
      }
    }
    function disableAccessToMediaDevices() {
      if (
        navigator.mediaDevices &&
        navigator.mediaDevices.removeEventListener
      ) {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          enumerateMediaDeviceList
        );
      }
      videoInputDevices = null;
    }
    Module["disableAccessToMediaDevices"] = disableAccessToMediaDevices;
    if (!Module["ENVIRONMENT_IS_PTHREAD"]) {
      if (!navigator.mediaDevices) {
        console.warn(
          "navigator.mediaDevices not supported by this browser. Webcam access will not be available." +
            (location.protocol == "https:"
              ? ""
              : " Try hosting the page over HTTPS, because some browsers disable webcam access when insecure HTTP is being used.")
        );
        disableAccessToMediaDevices();
      } else
        setTimeout(function () {
          try {
            addRunDependency("enumerateMediaDevices");
            enumerateMediaDeviceList();
            navigator.mediaDevices.addEventListener(
              "devicechange",
              enumerateMediaDeviceList
            );
            setTimeout(removeEnumerateMediaDevicesRunDependency, 1e3);
          } catch (e) {
            console.warn("Unable to enumerate media devices: " + e);
            disableAccessToMediaDevices();
          }
        }, 0);
    }
    function SendMessage(gameObject, func, param) {
      var func_cstr = stringToNewUTF8(func);
      var gameObject_cstr = stringToNewUTF8(gameObject);
      var param_cstr = 0;
      try {
        if (param === undefined) _SendMessage(gameObject_cstr, func_cstr);
        else if (typeof param === "string") {
          param_cstr = stringToNewUTF8(param);
          _SendMessageString(gameObject_cstr, func_cstr, param_cstr);
        } else if (typeof param === "number")
          _SendMessageFloat(gameObject_cstr, func_cstr, param);
        else
          throw (
            "" +
            param +
            " is does not have a type which is supported by SendMessage."
          );
      } finally {
        _free(param_cstr);
        _free(gameObject_cstr);
        _free(func_cstr);
      }
    }
    Module["SendMessage"] = SendMessage;
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = true;
    var ENVIRONMENT_IS_WORKER = false;
    var ENVIRONMENT_IS_NODE = false;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(
          0,
          scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
        );
      } else {
        scriptDirectory = "";
      }
      {
        read_ = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = (url, onload, onerror) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = (title) => (document.title = title);
    } else {
    }
    var out = Module["print"] || console.log.bind(console);
    var err = Module["printErr"] || console.error.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module["arguments"]) arguments_ = Module["arguments"];
    if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
    if (Module["quit"]) quit_ = Module["quit"];
    var wasmBinary;
    if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
    var noExitRuntime = Module["noExitRuntime"] || true;
    if (typeof WebAssembly != "object") {
      abort("no native wasm support detected");
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module["HEAP8"] = HEAP8 = new Int8Array(b);
      Module["HEAP16"] = HEAP16 = new Int16Array(b);
      Module["HEAP32"] = HEAP32 = new Int32Array(b);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATEXIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    var runtimeKeepaliveCounter = 0;
    function keepRuntimeAlive() {
      return noExitRuntime || runtimeKeepaliveCounter > 0;
    }
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
          Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
      FS.ignorePermissions = false;
      TTY.init();
      SOCKFS.root = FS.mount(SOCKFS, {}, null);
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
          Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      if (Module["onAbort"]) {
        Module["onAbort"](what);
      }
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    var wasmBinaryFile;
    wasmBinaryFile = "build.wasm";
    if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile);
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw "both async and sync fetching of the wasm failed";
      } catch (err) {
        abort(err);
      }
    }
    function getBinaryPromise(binaryFile) {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function") {
          return fetch(binaryFile, { credentials: "same-origin" })
            .then((response) => {
              if (!response["ok"]) {
                throw "failed to load wasm binary file at '" + binaryFile + "'";
              }
              return response["arrayBuffer"]();
            })
            .catch(() => getBinary(binaryFile));
        }
      }
      return Promise.resolve().then(() => getBinary(binaryFile));
    }
    function instantiateArrayBuffer(binaryFile, imports, receiver) {
      return getBinaryPromise(binaryFile)
        .then((binary) => {
          return WebAssembly.instantiate(binary, imports);
        })
        .then((instance) => {
          return instance;
        })
        .then(receiver, (reason) => {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
    }
    function instantiateAsync(binary, binaryFile, imports, callback) {
      if (
        !binary &&
        typeof WebAssembly.instantiateStreaming == "function" &&
        !isDataURI(binaryFile) &&
        typeof fetch == "function"
      ) {
        return fetch(binaryFile, { credentials: "same-origin" }).then(
          (response) => {
            var result = WebAssembly.instantiateStreaming(response, imports);
            return result.then(callback, function (reason) {
              err("wasm streaming compile failed: " + reason);
              err("falling back to ArrayBuffer instantiation");
              return instantiateArrayBuffer(binaryFile, imports, callback);
            });
          }
        );
      } else {
        return instantiateArrayBuffer(binaryFile, imports, callback);
      }
    }
    function createWasm() {
      var info = { env: wasmImports, wasi_snapshot_preview1: wasmImports };
      function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmMemory = Module["asm"]["memory"];
        updateMemoryViews();
        wasmTable = Module["asm"]["__indirect_function_table"];
        addOnInit(Module["asm"]["__wasm_call_ctors"]);
        removeRunDependency("wasm-instantiate");
        return exports;
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      if (Module["instantiateWasm"]) {
        try {
          return Module["instantiateWasm"](info, receiveInstance);
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          readyPromiseReject(e);
        }
      }
      instantiateAsync(
        wasmBinary,
        wasmBinaryFile,
        info,
        receiveInstantiationResult
      ).catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    }
    function dynCallLegacy(sig, ptr, args) {
      var f = Module["dynCall_" + sig];
      return args && args.length
        ? f.apply(null, [ptr].concat(args))
        : f.call(null, ptr);
    }
    var wasmTableMirror = [];
    function _GetJSLoadTimeInfo(loadTimePtr) {
      loadTimePtr = loadTimePtr >>= 2;
      HEAPU32[loadTimePtr] = Module.pageStartupTime || 0;
      HEAPU32[loadTimePtr + 1] = Module.dataUrlLoadEndTime || 0;
      HEAPU32[loadTimePtr + 2] = Module.codeDownloadTimeEnd || 0;
    }
    function _GetJSMemoryInfo(totalJSptr, usedJSptr) {
      totalJSptr = totalJSptr >>= 3;
      usedJSptr = usedJSptr >>= 3;
      if (performance.memory) {
        HEAPF64[totalJSptr] = performance.memory.totalJSHeapSize;
        HEAPF64[usedJSptr] = performance.memory.usedJSHeapSize;
      } else {
        HEAPF64[totalJSptr] = NaN;
        HEAPF64[usedJSptr] = NaN;
      }
    }
    var JS_Accelerometer = null;
    var JS_Accelerometer_callback = 0;
    function _JS_Accelerometer_IsRunning() {
      return (
        (JS_Accelerometer && JS_Accelerometer.activated) ||
        JS_Accelerometer_callback != 0
      );
    }
    var JS_Accelerometer_multiplier = 1;
    var JS_Accelerometer_lastValue = { x: 0, y: 0, z: 0 };
    function JS_Accelerometer_eventHandler() {
      JS_Accelerometer_lastValue = {
        x: JS_Accelerometer.x * JS_Accelerometer_multiplier,
        y: JS_Accelerometer.y * JS_Accelerometer_multiplier,
        z: JS_Accelerometer.z * JS_Accelerometer_multiplier,
      };
      if (JS_Accelerometer_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_Accelerometer_callback, a1, a2, a3]))(
          JS_Accelerometer_lastValue.x,
          JS_Accelerometer_lastValue.y,
          JS_Accelerometer_lastValue.z
        );
    }
    var JS_Accelerometer_frequencyRequest = 0;
    var JS_Accelerometer_frequency = 0;
    var JS_LinearAccelerationSensor_callback = 0;
    var JS_GravitySensor_callback = 0;
    var JS_Gyroscope_callback = 0;
    function JS_ComputeGravity(accelerometerValue, linearAccelerationValue) {
      var difference = {
        x: accelerometerValue.x - linearAccelerationValue.x,
        y: accelerometerValue.y - linearAccelerationValue.y,
        z: accelerometerValue.z - linearAccelerationValue.z,
      };
      var differenceMagnitudeSq =
        difference.x * difference.x +
        difference.y * difference.y +
        difference.z * difference.z;
      var sum = {
        x: accelerometerValue.x + linearAccelerationValue.x,
        y: accelerometerValue.y + linearAccelerationValue.y,
        z: accelerometerValue.z + linearAccelerationValue.z,
      };
      var sumMagnitudeSq = sum.x * sum.x + sum.y * sum.y + sum.z * sum.z;
      return differenceMagnitudeSq <= sumMagnitudeSq ? difference : sum;
    }
    function JS_DeviceMotion_eventHandler(event) {
      var accelerometerValue = {
        x: event.accelerationIncludingGravity.x * JS_Accelerometer_multiplier,
        y: event.accelerationIncludingGravity.y * JS_Accelerometer_multiplier,
        z: event.accelerationIncludingGravity.z * JS_Accelerometer_multiplier,
      };
      if (JS_Accelerometer_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_Accelerometer_callback, a1, a2, a3]))(
          accelerometerValue.x,
          accelerometerValue.y,
          accelerometerValue.z
        );
      var linearAccelerationValue = {
        x: event.acceleration.x * JS_Accelerometer_multiplier,
        y: event.acceleration.y * JS_Accelerometer_multiplier,
        z: event.acceleration.z * JS_Accelerometer_multiplier,
      };
      if (JS_LinearAccelerationSensor_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [
            JS_LinearAccelerationSensor_callback,
            a1,
            a2,
            a3,
          ]))(
          linearAccelerationValue.x,
          linearAccelerationValue.y,
          linearAccelerationValue.z
        );
      if (JS_GravitySensor_callback != 0) {
        var gravityValue = JS_ComputeGravity(
          accelerometerValue,
          linearAccelerationValue
        );
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_GravitySensor_callback, a1, a2, a3]))(
          gravityValue.x,
          gravityValue.y,
          gravityValue.z
        );
      }
      if (JS_Gyroscope_callback != 0) {
        var degToRad = Math.PI / 180;
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_Gyroscope_callback, a1, a2, a3]))(
          event.rotationRate.alpha * degToRad,
          event.rotationRate.beta * degToRad,
          event.rotationRate.gamma * degToRad
        );
      }
    }
    var JS_DeviceSensorPermissions = 0;
    function JS_RequestDeviceSensorPermissions(permissions) {
      if (permissions & 1) {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission()
            .then(function (permissionState) {
              if (permissionState === "granted") {
                JS_DeviceSensorPermissions &= ~1;
              } else {
                warnOnce("DeviceOrientationEvent permission not granted");
              }
            })
            .catch(function (err) {
              warnOnce(err);
              JS_DeviceSensorPermissions |= 1;
            });
        }
      }
      if (permissions & 2) {
        if (typeof DeviceMotionEvent.requestPermission === "function") {
          DeviceMotionEvent.requestPermission()
            .then(function (permissionState) {
              if (permissionState === "granted") {
                JS_DeviceSensorPermissions &= ~2;
              } else {
                warnOnce("DeviceMotionEvent permission not granted");
              }
            })
            .catch(function (err) {
              warnOnce(err);
              JS_DeviceSensorPermissions |= 2;
            });
        }
      }
    }
    function JS_DeviceMotion_add() {
      if (
        JS_Accelerometer_callback == 0 &&
        JS_LinearAccelerationSensor_callback == 0 &&
        JS_GravitySensor_callback == 0 &&
        JS_Gyroscope_callback == 0
      ) {
        JS_RequestDeviceSensorPermissions(2);
        window.addEventListener("devicemotion", JS_DeviceMotion_eventHandler);
      }
    }
    function JS_DefineAccelerometerMultiplier() {
      var g = 9.80665;
      JS_Accelerometer_multiplier = /(iPhone|iPad|Macintosh)/i.test(
        navigator.userAgent
      )
        ? 1 / g
        : -1 / g;
    }
    function _JS_Accelerometer_Start(callback, frequency) {
      JS_DefineAccelerometerMultiplier();
      if (typeof Accelerometer === "undefined") {
        JS_DeviceMotion_add();
        if (callback != 0) JS_Accelerometer_callback = callback;
        return;
      }
      if (callback != 0) JS_Accelerometer_callback = callback;
      function InitializeAccelerometer(frequency) {
        JS_Accelerometer = new Accelerometer({
          frequency: frequency,
          referenceFrame: "device",
        });
        JS_Accelerometer.addEventListener(
          "reading",
          JS_Accelerometer_eventHandler
        );
        JS_Accelerometer.addEventListener("error", function (e) {
          warnOnce(e.error ? e.error : e);
        });
        JS_Accelerometer.start();
        JS_Accelerometer_frequency = frequency;
      }
      if (JS_Accelerometer) {
        if (JS_Accelerometer_frequency != frequency) {
          JS_Accelerometer.stop();
          JS_Accelerometer.removeEventListener(
            "reading",
            JS_Accelerometer_eventHandler
          );
          InitializeAccelerometer(frequency);
        }
      } else if (JS_Accelerometer_frequencyRequest != 0) {
        JS_Accelerometer_frequencyRequest = frequency;
      } else {
        JS_Accelerometer_frequencyRequest = frequency;
        navigator.permissions
          .query({ name: "accelerometer" })
          .then(function (result) {
            if (result.state === "granted") {
              InitializeAccelerometer(JS_Accelerometer_frequencyRequest);
            } else {
              warnOnce("No permission to use Accelerometer.");
            }
            JS_Accelerometer_frequencyRequest = 0;
          });
      }
    }
    function JS_DeviceMotion_remove() {
      if (
        JS_Accelerometer_callback == 0 &&
        JS_LinearAccelerationSensor_callback == 0 &&
        JS_GravitySensor_callback == 0 &&
        JS_Gyroscope_callback == 0
      ) {
        window.removeEventListener(
          "devicemotion",
          JS_DeviceOrientation_eventHandler
        );
      }
    }
    function _JS_Accelerometer_Stop() {
      if (JS_Accelerometer) {
        if (
          typeof GravitySensor !== "undefined" ||
          JS_GravitySensor_callback == 0
        ) {
          JS_Accelerometer.stop();
          JS_Accelerometer.removeEventListener(
            "reading",
            JS_Accelerometer_eventHandler
          );
          JS_Accelerometer = null;
        }
        JS_Accelerometer_callback = 0;
        JS_Accelerometer_frequency = 0;
      } else if (JS_Accelerometer_callback != 0) {
        JS_Accelerometer_callback = 0;
        JS_DeviceMotion_remove();
      }
    }
    var ExceptionsSeen = 0;
    function LogErrorWithAdditionalInformation(error) {
      if (
        (error instanceof ReferenceError || error instanceof TypeError) &&
        error.message.indexOf("dynCall_") != -1
      ) {
        error.message =
          'Detected use of deprecated "Module.dynCall_*" API. Use "makeDynCall" API instead. Refer to https://docs.unity3d.com/6000.0/Documentation/Manual/web-interacting-browser-deprecated.html#dyncall for more information.\n' +
          error.message;
      }
      console.error(error);
    }
    function _JS_CallAsLongAsNoExceptionsSeen(cb) {
      if (!ExceptionsSeen) {
        try {
          (() => dynCall_v.call(null, cb))();
        } catch (e) {
          ExceptionsSeen = 1;
          console.error("Uncaught exception from main loop:");
          LogErrorWithAdditionalInformation(e);
          console.error("Halting program.");
          if (Module.errorHandler) Module.errorHandler(e);
          throw e;
        }
      }
    }
    function _JS_Cursor_SetImage(ptr, length) {
      ptr = ptr;
      var binary = "";
      for (var i = 0; i < length; i++)
        binary += String.fromCharCode(HEAPU8[ptr + i]);
      Module.canvas.style.cursor =
        "url(data:image/cur;base64," + btoa(binary) + "),default";
    }
    function _JS_Cursor_SetShow(show) {
      Module.canvas.style.cursor = show ? "default" : "none";
    }
    function jsDomCssEscapeId(id) {
      if (
        typeof window.CSS !== "undefined" &&
        typeof window.CSS.escape !== "undefined"
      ) {
        return window.CSS.escape(id);
      }
      return id.replace(/(#|\.|\+|\[|\]|\(|\)|\{|\})/g, "\\$1");
    }
    function jsCanvasSelector() {
      var canvasId = Module["canvas"] ? Module["canvas"].id : "unity-canvas";
      return "#" + jsDomCssEscapeId(canvasId);
    }
    function _JS_DOM_MapViewportCoordinateToElementLocalCoordinate(
      viewportX,
      viewportY,
      targetX,
      targetY
    ) {
      targetX = targetX >> 2;
      targetY = targetY >> 2;
      var canvas = document.querySelector(jsCanvasSelector());
      var rect = canvas && canvas.getBoundingClientRect();
      HEAPU32[targetX] = viewportX - (rect ? rect.left : 0);
      HEAPU32[targetY] = viewportY - (rect ? rect.top : 0);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | (u >> 6);
          heap[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | (u >> 12);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | (u >> 18);
          heap[outIdx++] = 128 | ((u >> 12) & 63);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function stringToNewUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8(str, ret, size);
      return ret;
    }
    function _JS_DOM_UnityCanvasSelector() {
      var canvasSelector = jsCanvasSelector();
      if (_JS_DOM_UnityCanvasSelector.selector != canvasSelector) {
        _free(_JS_DOM_UnityCanvasSelector.ptr);
        _JS_DOM_UnityCanvasSelector.ptr = stringToNewUTF8(canvasSelector);
        _JS_DOM_UnityCanvasSelector.selector = canvasSelector;
      }
      return _JS_DOM_UnityCanvasSelector.ptr;
    }
    var UTF8Decoder =
      typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 =
            ((u0 & 7) << 18) |
            (u1 << 12) |
            (u2 << 6) |
            (heapOrArray[idx++] & 63);
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function _JS_Eval_OpenURL(ptr) {
      var str = UTF8ToString(ptr);
      window.open(str, "_blank", "");
    }
    function _JS_FileSystem_Initialize() {}
    var JS_FileSystem_Sync_state = 0;
    function _JS_FileSystem_Sync() {
      function onSyncComplete() {
        if (JS_FileSystem_Sync_state === "again") startSync();
        else JS_FileSystem_Sync_state = 0;
      }
      function startSync() {
        JS_FileSystem_Sync_state = "idb";
        FS.syncfs(false, onSyncComplete);
      }
      if (JS_FileSystem_Sync_state === 0) {
        JS_FileSystem_Sync_state = setTimeout(startSync, 0);
      } else if (JS_FileSystem_Sync_state === "idb") {
        JS_FileSystem_Sync_state = "again";
      }
    }
    function _JS_GetRandomBytes(destBuffer, numBytes) {
      if (typeof crypto === "undefined" || numBytes > 65535) return 0;
      crypto.getRandomValues(
        new Uint8Array(HEAPU8.buffer, destBuffer, numBytes)
      );
      return 1;
    }
    function _JS_Get_WASM_Size() {
      return Module.wasmFileSize;
    }
    var JS_GravitySensor = null;
    function _JS_GravitySensor_IsRunning() {
      return typeof GravitySensor !== "undefined"
        ? JS_GravitySensor && JS_GravitySensor.activated
        : JS_GravitySensor_callback != 0;
    }
    function JS_GravitySensor_eventHandler() {
      if (JS_GravitySensor_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_GravitySensor_callback, a1, a2, a3]))(
          JS_GravitySensor.x * JS_Accelerometer_multiplier,
          JS_GravitySensor.y * JS_Accelerometer_multiplier,
          JS_GravitySensor.z * JS_Accelerometer_multiplier
        );
    }
    var JS_GravitySensor_frequencyRequest = 0;
    var JS_LinearAccelerationSensor = null;
    function JS_LinearAccelerationSensor_eventHandler() {
      var linearAccelerationValue = {
        x: JS_LinearAccelerationSensor.x * JS_Accelerometer_multiplier,
        y: JS_LinearAccelerationSensor.y * JS_Accelerometer_multiplier,
        z: JS_LinearAccelerationSensor.z * JS_Accelerometer_multiplier,
      };
      if (JS_LinearAccelerationSensor_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [
            JS_LinearAccelerationSensor_callback,
            a1,
            a2,
            a3,
          ]))(
          linearAccelerationValue.x,
          linearAccelerationValue.y,
          linearAccelerationValue.z
        );
      if (
        JS_GravitySensor_callback != 0 &&
        typeof GravitySensor === "undefined"
      ) {
        var gravityValue = JS_ComputeGravity(
          JS_Accelerometer_lastValue,
          linearAccelerationValue
        );
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_GravitySensor_callback, a1, a2, a3]))(
          gravityValue.x,
          gravityValue.y,
          gravityValue.z
        );
      }
    }
    var JS_LinearAccelerationSensor_frequencyRequest = 0;
    var JS_LinearAccelerationSensor_frequency = 0;
    function _JS_LinearAccelerationSensor_Start(callback, frequency) {
      JS_DefineAccelerometerMultiplier();
      if (typeof LinearAccelerationSensor === "undefined") {
        JS_DeviceMotion_add();
        if (callback != 0) JS_LinearAccelerationSensor_callback = callback;
        return;
      }
      if (callback != 0) JS_LinearAccelerationSensor_callback = callback;
      function InitializeLinearAccelerationSensor(frequency) {
        JS_LinearAccelerationSensor = new LinearAccelerationSensor({
          frequency: frequency,
          referenceFrame: "device",
        });
        JS_LinearAccelerationSensor.addEventListener(
          "reading",
          JS_LinearAccelerationSensor_eventHandler
        );
        JS_LinearAccelerationSensor.addEventListener("error", function (e) {
          warnOnce(e.error ? e.error : e);
        });
        JS_LinearAccelerationSensor.start();
        JS_LinearAccelerationSensor_frequency = frequency;
      }
      if (JS_LinearAccelerationSensor) {
        if (JS_LinearAccelerationSensor_frequency != frequency) {
          JS_LinearAccelerationSensor.stop();
          JS_LinearAccelerationSensor.removeEventListener(
            "reading",
            JS_LinearAccelerationSensor_eventHandler
          );
          InitializeLinearAccelerationSensor(frequency);
        }
      } else if (JS_LinearAccelerationSensor_frequencyRequest != 0) {
        JS_LinearAccelerationSensor_frequencyRequest = frequency;
      } else {
        JS_LinearAccelerationSensor_frequencyRequest = frequency;
        navigator.permissions
          .query({ name: "accelerometer" })
          .then(function (result) {
            if (result.state === "granted") {
              InitializeLinearAccelerationSensor(
                JS_LinearAccelerationSensor_frequencyRequest
              );
            } else {
              warnOnce("No permission to use LinearAccelerationSensor.");
            }
            JS_LinearAccelerationSensor_frequencyRequest = 0;
          });
      }
    }
    function _JS_GravitySensor_Start(callback, frequency) {
      if (typeof GravitySensor === "undefined") {
        _JS_Accelerometer_Start(
          0,
          Math.max(frequency, JS_Accelerometer_frequency)
        );
        _JS_LinearAccelerationSensor_Start(
          0,
          Math.max(frequency, JS_LinearAccelerationSensor_frequency)
        );
        JS_GravitySensor_callback = callback;
        return;
      }
      JS_DefineAccelerometerMultiplier();
      JS_GravitySensor_callback = callback;
      function InitializeGravitySensor(frequency) {
        JS_GravitySensor = new GravitySensor({
          frequency: frequency,
          referenceFrame: "device",
        });
        JS_GravitySensor.addEventListener(
          "reading",
          JS_GravitySensor_eventHandler
        );
        JS_GravitySensor.addEventListener("error", function (e) {
          warnOnce(e.error ? e.error : e);
        });
        JS_GravitySensor.start();
      }
      if (JS_GravitySensor) {
        JS_GravitySensor.stop();
        JS_GravitySensor.removeEventListener(
          "reading",
          JS_GravitySensor_eventHandler
        );
        InitializeGravitySensor(frequency);
      } else if (JS_GravitySensor_frequencyRequest != 0) {
        JS_GravitySensor_frequencyRequest = frequency;
      } else {
        JS_GravitySensor_frequencyRequest = frequency;
        navigator.permissions
          .query({ name: "accelerometer" })
          .then(function (result) {
            if (result.state === "granted") {
              InitializeGravitySensor(JS_GravitySensor_frequencyRequest);
            } else {
              warnOnce("No permission to use GravitySensor.");
            }
            JS_GravitySensor_frequencyRequest = 0;
          });
      }
    }
    function _JS_LinearAccelerationSensor_Stop() {
      if (JS_LinearAccelerationSensor) {
        if (
          typeof GravitySensor !== "undefined" ||
          JS_GravitySensor_callback == 0
        ) {
          JS_LinearAccelerationSensor.stop();
          JS_LinearAccelerationSensor.removeEventListener(
            "reading",
            JS_LinearAccelerationSensor_eventHandler
          );
          JS_LinearAccelerationSensor = null;
        }
        JS_LinearAccelerationSensor_callback = 0;
        JS_LinearAccelerationSensor_frequency = 0;
      } else if (JS_LinearAccelerationSensor_callback != 0) {
        JS_LinearAccelerationSensor_callback = 0;
        JS_DeviceMotion_remove();
      }
    }
    function _JS_GravitySensor_Stop() {
      JS_GravitySensor_callback = 0;
      if (typeof GravitySensor === "undefined") {
        if (JS_Accelerometer_callback == 0) _JS_Accelerometer_Stop();
        if (JS_LinearAccelerationSensor_callback == 0)
          _JS_LinearAccelerationSensor_Stop();
        return;
      }
      if (JS_GravitySensor) {
        JS_GravitySensor.stop();
        JS_GravitySensor.removeEventListener(
          "reading",
          JS_GravitySensor_eventHandler
        );
        JS_GravitySensor = null;
      }
    }
    var JS_Gyroscope = null;
    function _JS_Gyroscope_IsRunning() {
      return (
        (JS_Gyroscope && JS_Gyroscope.activated) || JS_Gyroscope_callback != 0
      );
    }
    function JS_Gyroscope_eventHandler() {
      if (JS_Gyroscope_callback != 0)
        ((a1, a2, a3) =>
          dynCall_vfff.apply(null, [JS_Gyroscope_callback, a1, a2, a3]))(
          JS_Gyroscope.x,
          JS_Gyroscope.y,
          JS_Gyroscope.z
        );
    }
    var JS_Gyroscope_frequencyRequest = 0;
    function _JS_Gyroscope_Start(callback, frequency) {
      if (typeof Gyroscope === "undefined") {
        JS_DeviceMotion_add();
        JS_Gyroscope_callback = callback;
        return;
      }
      JS_Gyroscope_callback = callback;
      function InitializeGyroscope(frequency) {
        JS_Gyroscope = new Gyroscope({
          frequency: frequency,
          referenceFrame: "device",
        });
        JS_Gyroscope.addEventListener("reading", JS_Gyroscope_eventHandler);
        JS_Gyroscope.addEventListener("error", function (e) {
          warnOnce(e.error ? e.error : e);
        });
        JS_Gyroscope.start();
      }
      if (JS_Gyroscope) {
        JS_Gyroscope.stop();
        JS_Gyroscope.removeEventListener("reading", JS_Gyroscope_eventHandler);
        InitializeGyroscope(frequency);
      } else if (JS_Gyroscope_frequencyRequest != 0) {
        JS_Gyroscope_frequencyRequest = frequency;
      } else {
        JS_Gyroscope_frequencyRequest = frequency;
        navigator.permissions
          .query({ name: "gyroscope" })
          .then(function (result) {
            if (result.state === "granted") {
              InitializeGyroscope(JS_Gyroscope_frequencyRequest);
            } else {
              warnOnce("No permission to use Gyroscope.");
            }
            JS_Gyroscope_frequencyRequest = 0;
          });
      }
    }
    function _JS_Gyroscope_Stop() {
      if (JS_Gyroscope) {
        JS_Gyroscope.stop();
        JS_Gyroscope.removeEventListener("reading", JS_Gyroscope_eventHandler);
        JS_Gyroscope = null;
        JS_Gyroscope_callback = 0;
      } else if (JS_Gyroscope_callback != 0) {
        JS_Gyroscope_callback = 0;
        JS_DeviceMotion_remove();
      }
    }
    function _JS_Init_ContextMenuHandler() {
      const _handleContextMenu = function (event) {
        if (event.target.localName !== "canvas") _ReleaseKeys();
      };
      document.addEventListener("contextmenu", _handleContextMenu);
      Module.deinitializers.push(function () {
        document.removeEventListener("contextmenu", _handleContextMenu);
      });
    }
    var mobile_input_hide_delay = null;
    var mobile_input_text = null;
    var mobile_input = null;
    function _JS_Init_CopyPaste() {
      const _handlePaste = function (event) {
        event.preventDefault();
        const data = event.clipboardData.getData("text");
        if (!!mobile_input) {
          mobile_input.input.value += data;
        } else {
          var str_wasm = stringToNewUTF8(data);
          _SendPasteEvent(str_wasm);
          _free(str_wasm);
        }
      };
      const _handleCopy = function (event) {
        event.preventDefault();
        const data = !!mobile_input
          ? mobile_input.input.value.slice(
              mobile_input.input.selectionStart,
              mobile_input.input.selectionEnd
            )
          : UTF8ToString(_GetCopyBufferAsCStr());
        event.clipboardData.setData("text/plain", data);
      };
      window.addEventListener("paste", _handlePaste);
      window.addEventListener("copy", _handleCopy);
      window.addEventListener("cut", _handleCopy);
      Module.deinitializers.push(function () {
        window.removeEventListener("paste", _handlePaste);
        window.removeEventListener("copy", _handleCopy);
        window.removeEventListener("cut", _handleCopy);
      });
    }
    function _JS_LinearAccelerationSensor_IsRunning() {
      return (
        (JS_LinearAccelerationSensor &&
          JS_LinearAccelerationSensor.activated) ||
        JS_LinearAccelerationSensor_callback != 0
      );
    }
    function _JS_Log_Dump(ptr, type) {
      var str = UTF8ToString(ptr);
      if (typeof dump == "function") dump(str);
      switch (type) {
        case 0:
        case 1:
        case 4:
          console.error(str);
          return;
        case 2:
          console.warn(str);
          return;
        case 3:
        case 5:
          // console.log(str);
          return;
        default:
          console.error("Unknown console message type!");
          console.error(str);
      }
    }
    function _JS_Log_StackTrace(buffer, bufferSize) {
      var trace = stackTrace();
      if (buffer) stringToUTF8(trace, buffer, bufferSize);
      return lengthBytesUTF8(trace);
    }
    var mobile_input_ignore_blur_event = false;
    function _JS_MobileKeybard_GetIgnoreBlurEvent() {
      return mobile_input_ignore_blur_event;
    }
    function _JS_MobileKeyboard_GetKeyboardStatus() {
      var kKeyboardStatusVisible = 0;
      var kKeyboardStatusDone = 1;
      if (!mobile_input) return kKeyboardStatusDone;
      return kKeyboardStatusVisible;
    }
    function _JS_MobileKeyboard_GetText(buffer, bufferSize) {
      var text =
        mobile_input && mobile_input.input
          ? mobile_input.input.value
          : mobile_input_text
          ? mobile_input_text
          : "";
      if (buffer) stringToUTF8(text, buffer, bufferSize);
      return lengthBytesUTF8(text);
    }
    function _JS_MobileKeyboard_GetTextSelection(outStart, outLength) {
      outStart = outStart >>= 2;
      outLength = outLength >>= 2;
      if (!mobile_input) {
        HEAP32[outStart] = 0;
        HEAP32[outLength] = 0;
        return;
      }
      HEAP32[outStart] = mobile_input.input.selectionStart;
      HEAP32[outLength] =
        mobile_input.input.selectionEnd - mobile_input.input.selectionStart;
    }
    function _JS_MobileKeyboard_Hide(delay) {
      if (mobile_input_hide_delay) return;
      mobile_input_ignore_blur_event = true;
      function hideMobileKeyboard() {
        if (mobile_input && mobile_input.input) {
          mobile_input_text = mobile_input.input.value;
          mobile_input.input = null;
          if (mobile_input.parentNode && mobile_input.parentNode) {
            mobile_input.parentNode.removeChild(mobile_input);
          }
        }
        mobile_input = null;
        mobile_input_hide_delay = null;
        setTimeout(function () {
          mobile_input_ignore_blur_event = false;
        }, 100);
      }
      if (delay) {
        var hideDelay = 200;
        mobile_input_hide_delay = setTimeout(hideMobileKeyboard, hideDelay);
      } else {
        hideMobileKeyboard();
      }
    }
    function _JS_MobileKeyboard_SetCharacterLimit(limit) {
      if (!mobile_input) return;
      mobile_input.input.maxLength = limit;
    }
    function _JS_MobileKeyboard_SetText(text) {
      if (!mobile_input) return;
      text = UTF8ToString(text);
      mobile_input.input.value = text;
    }
    function _JS_MobileKeyboard_SetTextSelection(start, length) {
      if (!mobile_input) return;
      if (mobile_input.input.type === "number") {
        mobile_input.input.type = "text";
        mobile_input.input.setSelectionRange(start, start + length);
        mobile_input.input.type = "number";
      } else {
        mobile_input.input.setSelectionRange(start, start + length);
      }
    }
    function _JS_MobileKeyboard_Show(
      text,
      keyboardType,
      autocorrection,
      multiline,
      secure,
      alert,
      placeholder,
      characterLimit
    ) {
      if (mobile_input_hide_delay) {
        clearTimeout(mobile_input_hide_delay);
        mobile_input_hide_delay = null;
      }
      text = UTF8ToString(text);
      mobile_input_text = text;
      placeholder = UTF8ToString(placeholder);
      var container = document.body;
      var hasExistingMobileInput = !!mobile_input;
      var input_type;
      var KEYBOARD_TYPE_NUMBERS_AND_PUNCTUATION = 2;
      var KEYBOARD_TYPE_URL = 3;
      var KEYBOARD_TYPE_NUMBER_PAD = 4;
      var KEYBOARD_TYPE_PHONE_PAD = 5;
      var KEYBOARD_TYPE_EMAIL_ADDRESS = 7;
      if (!secure) {
        switch (keyboardType) {
          case KEYBOARD_TYPE_EMAIL_ADDRESS:
            input_type = "email";
            break;
          case KEYBOARD_TYPE_URL:
            input_type = "url";
            break;
          case KEYBOARD_TYPE_NUMBERS_AND_PUNCTUATION:
          case KEYBOARD_TYPE_NUMBER_PAD:
          case KEYBOARD_TYPE_PHONE_PAD:
            input_type = "number";
            break;
          default:
            input_type = "text";
            break;
        }
      } else {
        input_type = "password";
      }
      if (hasExistingMobileInput) {
        if (mobile_input.multiline != multiline) {
          _JS_MobileKeyboard_Hide(false);
          return;
        }
      }
      var inputContainer = mobile_input || document.createElement("div");
      if (!hasExistingMobileInput) {
        inputContainer.style =
          "width:100%; position:fixed; bottom:0px; margin:0px; padding:0px; left:0px; border: 1px solid #000; border-radius: 5px; background-color:#fff; font-size:14pt;";
        container.appendChild(inputContainer);
        mobile_input = inputContainer;
      }
      var input = hasExistingMobileInput
        ? mobile_input.input
        : document.createElement(multiline ? "textarea" : "input");
      mobile_input.multiline = multiline;
      mobile_input.secure = secure;
      mobile_input.keyboardType = keyboardType;
      mobile_input.inputType = input_type;
      input.type = input_type;
      input.style =
        "width:calc(100% - 85px); " +
        (multiline ? "height:100px;" : "") +
        "vertical-align:top; border-radius: 5px; outline:none; cursor:default; resize:none; border:0px; padding:10px 0px 10px 10px;";
      input.spellcheck = autocorrection ? true : false;
      input.maxLength = characterLimit > 0 ? characterLimit : 524288;
      input.value = text;
      input.placeholder = placeholder;
      if (!hasExistingMobileInput) {
        inputContainer.appendChild(input);
        inputContainer.input = input;
      }
      if (!hasExistingMobileInput) {
        var okButton = document.createElement("button");
        okButton.innerText = "OK";
        okButton.style =
          "border:0; position:absolute; left:calc(100% - 75px); top:0px; width:75px; height:100%; margin:0; padding:0; border-radius: 5px; background-color:#fff";
        okButton.addEventListener("touchend", function () {
          _JS_MobileKeyboard_Hide(true);
        });
        inputContainer.appendChild(okButton);
        inputContainer.okButton = okButton;
        input.addEventListener("keyup", function (e) {
          if (input.parentNode.multiline) return;
          if (e.code == "Enter" || e.which == 13 || e.keyCode == 13) {
            _JS_MobileKeyboard_Hide(true);
          }
        });
        input.addEventListener("blur", function (e) {
          _JS_MobileKeyboard_Hide(true);
          e.stopPropagation();
          e.preventDefault();
        });
        input.select();
        input.focus();
      } else {
        input.select();
      }
    }
    function _JS_Module_WebGLContextAttributes_PowerPreference() {
      return Module.webglContextAttributes.powerPreference;
    }
    function _JS_Module_WebGLContextAttributes_PremultipliedAlpha() {
      return Module.webglContextAttributes.premultipliedAlpha;
    }
    function _JS_Module_WebGLContextAttributes_PreserveDrawingBuffer() {
      return Module.webglContextAttributes.preserveDrawingBuffer;
    }
    var JS_OrientationSensor = null;
    var JS_OrientationSensor_callback = 0;
    function _JS_OrientationSensor_IsRunning() {
      return (
        (JS_OrientationSensor && JS_OrientationSensor.activated) ||
        JS_OrientationSensor_callback != 0
      );
    }
    function JS_OrientationSensor_eventHandler() {
      if (JS_OrientationSensor_callback != 0)
        ((a1, a2, a3, a4) =>
          dynCall_vffff.apply(null, [
            JS_OrientationSensor_callback,
            a1,
            a2,
            a3,
            a4,
          ]))(
          JS_OrientationSensor.quaternion[0],
          JS_OrientationSensor.quaternion[1],
          JS_OrientationSensor.quaternion[2],
          JS_OrientationSensor.quaternion[3]
        );
    }
    var JS_OrientationSensor_frequencyRequest = 0;
    function JS_DeviceOrientation_eventHandler(event) {
      if (JS_OrientationSensor_callback) {
        var degToRad = Math.PI / 180;
        var x = event.beta * degToRad;
        var y = event.gamma * degToRad;
        var z = event.alpha * degToRad;
        var cx = Math.cos(x / 2);
        var sx = Math.sin(x / 2);
        var cy = Math.cos(y / 2);
        var sy = Math.sin(y / 2);
        var cz = Math.cos(z / 2);
        var sz = Math.sin(z / 2);
        var qx = sx * cy * cz - cx * sy * sz;
        var qy = cx * sy * cz + sx * cy * sz;
        var qz = cx * cy * sz + sx * sy * cz;
        var qw = cx * cy * cz - sx * sy * sz;
        ((a1, a2, a3, a4) =>
          dynCall_vffff.apply(null, [
            JS_OrientationSensor_callback,
            a1,
            a2,
            a3,
            a4,
          ]))(qx, qy, qz, qw);
      }
    }
    function _JS_OrientationSensor_Start(callback, frequency) {
      if (typeof RelativeOrientationSensor === "undefined") {
        if (JS_OrientationSensor_callback == 0) {
          JS_OrientationSensor_callback = callback;
          JS_RequestDeviceSensorPermissions(1);
          window.addEventListener(
            "deviceorientation",
            JS_DeviceOrientation_eventHandler
          );
        }
        return;
      }
      JS_OrientationSensor_callback = callback;
      function InitializeOrientationSensor(frequency) {
        JS_OrientationSensor = new RelativeOrientationSensor({
          frequency: frequency,
          referenceFrame: "device",
        });
        JS_OrientationSensor.addEventListener(
          "reading",
          JS_OrientationSensor_eventHandler
        );
        JS_OrientationSensor.addEventListener("error", function (e) {
          warnOnce(e.error ? e.error : e);
        });
        JS_OrientationSensor.start();
      }
      if (JS_OrientationSensor) {
        JS_OrientationSensor.stop();
        JS_OrientationSensor.removeEventListener(
          "reading",
          JS_OrientationSensor_eventHandler
        );
        InitializeOrientationSensor(frequency);
      } else if (JS_OrientationSensor_frequencyRequest != 0) {
        JS_OrientationSensor_frequencyRequest = frequency;
      } else {
        JS_OrientationSensor_frequencyRequest = frequency;
        Promise.all([
          navigator.permissions.query({ name: "accelerometer" }),
          navigator.permissions.query({ name: "gyroscope" }),
        ]).then(function (results) {
          if (
            results.every(function (result) {
              return result.state === "granted";
            })
          ) {
            InitializeOrientationSensor(JS_OrientationSensor_frequencyRequest);
          } else {
            warnOnce("No permissions to use RelativeOrientationSensor.");
          }
          JS_OrientationSensor_frequencyRequest = 0;
        });
      }
    }
    function _JS_OrientationSensor_Stop() {
      if (JS_OrientationSensor) {
        JS_OrientationSensor.stop();
        JS_OrientationSensor.removeEventListener(
          "reading",
          JS_OrientationSensor_eventHandler
        );
        JS_OrientationSensor = null;
      } else if (JS_OrientationSensor_callback != 0) {
        window.removeEventListener(
          "deviceorientation",
          JS_DeviceOrientation_eventHandler
        );
      }
      JS_OrientationSensor_callback = 0;
    }
    function _JS_RequestDeviceSensorPermissionsOnTouch() {
      if (JS_DeviceSensorPermissions == 0) return;
      JS_RequestDeviceSensorPermissions(JS_DeviceSensorPermissions);
    }
    function _JS_RunQuitCallbacks() {
      Module.QuitCleanup();
    }
    var JS_ScreenOrientation_callback = 0;
    function JS_ScreenOrientation_eventHandler() {
      if (JS_ScreenOrientation_callback)
        ((a1, a2, a3) =>
          dynCall_viii.apply(null, [
            JS_ScreenOrientation_callback,
            a1,
            a2,
            a3,
          ]))(
          window.innerWidth,
          window.innerHeight,
          screen.orientation ? screen.orientation.angle : window.orientation
        );
    }
    function _JS_ScreenOrientation_DeInit() {
      JS_ScreenOrientation_callback = 0;
      window.removeEventListener("resize", JS_ScreenOrientation_eventHandler);
      if (screen.orientation) {
        screen.orientation.removeEventListener(
          "change",
          JS_ScreenOrientation_eventHandler
        );
      }
    }
    function _JS_ScreenOrientation_Init(callback) {
      if (!JS_ScreenOrientation_callback) {
        if (screen.orientation) {
          screen.orientation.addEventListener(
            "change",
            JS_ScreenOrientation_eventHandler
          );
        }
        window.addEventListener("resize", JS_ScreenOrientation_eventHandler);
        JS_ScreenOrientation_callback = callback;
        setTimeout(JS_ScreenOrientation_eventHandler, 0);
      }
    }
    var JS_ScreenOrientation_requestedLockType = -1;
    var JS_ScreenOrientation_appliedLockType = -1;
    var JS_ScreenOrientation_timeoutID = -1;
    function _JS_ScreenOrientation_Lock(orientationLockType) {
      if (!screen.orientation || !screen.orientation.lock) {
        return;
      }
      function applyLock() {
        JS_ScreenOrientation_appliedLockType =
          JS_ScreenOrientation_requestedLockType;
        var screenOrientations = [
          "any",
          0,
          "landscape",
          "portrait",
          "portrait-primary",
          "portrait-secondary",
          "landscape-primary",
          "landscape-secondary",
        ];
        var type = screenOrientations[JS_ScreenOrientation_appliedLockType];
        screen.orientation
          .lock(type)
          .then(function () {
            if (
              JS_ScreenOrientation_requestedLockType !=
              JS_ScreenOrientation_appliedLockType
            ) {
              JS_ScreenOrientation_timeoutID = setTimeout(applyLock, 0);
            } else {
              JS_ScreenOrientation_timeoutID = -1;
            }
          })
          .catch(function (err) {
            warnOnce(err);
            JS_ScreenOrientation_timeoutID = -1;
          });
      }
      JS_ScreenOrientation_requestedLockType = orientationLockType;
      if (
        JS_ScreenOrientation_timeoutID == -1 &&
        orientationLockType != JS_ScreenOrientation_appliedLockType
      ) {
        JS_ScreenOrientation_timeoutID = setTimeout(applyLock, 0);
      }
    }
    function handleException(e) {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
    var PATH = {
      isAbs: (path) => path.charAt(0) === "/",
      splitPath: (filename) => {
        var splitPathRe =
          /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
      normalizeArray: (parts, allowAboveRoot) => {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === ".") {
            parts.splice(i, 1);
          } else if (last === "..") {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift("..");
          }
        }
        return parts;
      },
      normalize: (path) => {
        var isAbsolute = PATH.isAbs(path),
          trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(
          path.split("/").filter((p) => !!p),
          !isAbsolute
        ).join("/");
        if (!path && !isAbsolute) {
          path = ".";
        }
        if (path && trailingSlash) {
          path += "/";
        }
        return (isAbsolute ? "/" : "") + path;
      },
      dirname: (path) => {
        var result = PATH.splitPath(path),
          root = result[0],
          dir = result[1];
        if (!root && !dir) {
          return ".";
        }
        if (dir) {
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },
      basename: (path) => {
        if (path === "/") return "/";
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1);
      },
      join: function () {
        var paths = Array.prototype.slice.call(arguments);
        return PATH.normalize(paths.join("/"));
      },
      join2: (l, r) => {
        return PATH.normalize(l + "/" + r);
      },
    };
    function initRandomFill() {
      if (
        typeof crypto == "object" &&
        typeof crypto["getRandomValues"] == "function"
      ) {
        return (view) => crypto.getRandomValues(view);
      } else abort("initRandomDevice");
    }
    function randomFill(view) {
      return (randomFill = initRandomFill())(view);
    }
    var PATH_FS = {
      resolve: function () {
        var resolvedPath = "",
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = i >= 0 ? arguments[i] : FS.cwd();
          if (typeof path != "string") {
            throw new TypeError("Arguments to path.resolve must be strings");
          } else if (!path) {
            return "";
          }
          resolvedPath = path + "/" + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        resolvedPath = PATH.normalizeArray(
          resolvedPath.split("/").filter((p) => !!p),
          !resolvedAbsolute
        ).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
      },
      relative: (from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== "") break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== "") break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
      },
    };
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(
        stringy,
        u8array,
        0,
        u8array.length
      );
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }
    var TTY = {
      ttys: [],
      init: function () {},
      shutdown: function () {},
      register: function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
      stream_ops: {
        open: function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
        close: function (stream) {
          stream.tty.ops.fsync(stream.tty);
        },
        fsync: function (stream) {
          stream.tty.ops.fsync(stream.tty);
        },
        read: function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset + i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
        write: function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        },
      },
      default_tty_ops: {
        get_char: function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (
              typeof window != "undefined" &&
              typeof window.prompt == "function"
            ) {
              result = window.prompt("Input: ");
              if (result !== null) {
                result += "\n";
              }
            } else if (typeof readline == "function") {
              result = readline();
              if (result !== null) {
                result += "\n";
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },
        put_char: function (tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        fsync: function (tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        },
      },
      default_tty1_ops: {
        put_char: function (tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        fsync: function (tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        },
      },
    };
    function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
      return address;
    }
    function alignMemory(size, alignment) {
      return Math.ceil(size / alignment) * alignment;
    }
    function mmapAlloc(size) {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (!ptr) return 0;
      return zeroMemory(ptr, size);
    }
    var MEMFS = {
      ops_table: null,
      mount: function (mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0);
      },
      createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink,
              },
              stream: { llseek: MEMFS.stream_ops.llseek },
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync,
              },
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink,
              },
              stream: {},
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
              },
              stream: FS.chrdev_stream_ops,
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0;
          node.contents = null;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },
      getFileDataAsTypedArray: function (node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray)
          return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
      },
      expandFileStorage: function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(
          newCapacity,
          (prevCapacity *
            (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
            0
        );
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0)
          node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
      },
      resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null;
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize);
          if (oldContents) {
            node.contents.set(
              oldContents.subarray(0, Math.min(newSize, node.usedBytes))
            );
          }
          node.usedBytes = newSize;
        }
      },
      node_ops: {
        getattr: function (node) {
          var attr = {};
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
        setattr: function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
        lookup: function (parent, name) {
          throw FS.genericErrors[44];
        },
        mknod: function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
        rename: function (old_node, new_dir, new_name) {
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {}
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now();
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },
        unlink: function (parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
        rmdir: function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },
        readdir: function (node) {
          var entries = [".", ".."];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },
        symlink: function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
          node.link = oldpath;
          return node;
        },
        readlink: function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
      },
      stream_ops: {
        read: function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) {
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++)
              buffer[offset + i] = contents[position + i];
          }
          return size;
        },
        write: function (stream, buffer, offset, length, position, canOwn) {
          if (buffer.buffer === HEAP8.buffer) {
            canOwn = false;
          }
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
          if (buffer.subarray && (!node.contents || node.contents.subarray)) {
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) {
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) {
              node.contents.set(
                buffer.subarray(offset, offset + length),
                position
              );
              return length;
            }
          }
          MEMFS.expandFileStorage(node, position + length);
          if (node.contents.subarray && buffer.subarray) {
            node.contents.set(
              buffer.subarray(offset, offset + length),
              position
            );
          } else {
            for (var i = 0; i < length; i++) {
              node.contents[position + i] = buffer[offset + i];
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
        llseek: function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
        allocate: function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(
            stream.node.usedBytes,
            offset + length
          );
        },
        mmap: function (stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(
                  contents,
                  position,
                  position + length
                );
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },
        msync: function (stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          return 0;
        },
      },
    };
    function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
      readAsync(
        url,
        (arrayBuffer) => {
          assert(
            arrayBuffer,
            `Loading data file "${url}" failed (no arrayBuffer).`
          );
          onload(new Uint8Array(arrayBuffer));
          if (dep) removeRunDependency(dep);
        },
        (event) => {
          if (onerror) {
            onerror();
          } else {
            throw `Loading data file "${url}" failed.`;
          }
        }
      );
      if (dep) addRunDependency(dep);
    }
    var preloadPlugins = Module["preloadPlugins"] || [];
    function FS_handledByPreloadPlugin(byteArray, fullname, finish, onerror) {
      if (typeof Browser != "undefined") Browser.init();
      var handled = false;
      preloadPlugins.forEach(function (plugin) {
        if (handled) return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    }
    function FS_createPreloadedFile(
      parent,
      name,
      url,
      canRead,
      canWrite,
      onload,
      onerror,
      dontCreateFile,
      canOwn,
      preFinish
    ) {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency("cp " + fullname);
      function processData(byteArray) {
        function finish(byteArray) {
          if (preFinish) preFinish();
          if (!dontCreateFile) {
            FS.createDataFile(
              parent,
              name,
              byteArray,
              canRead,
              canWrite,
              canOwn
            );
          }
          if (onload) onload();
          removeRunDependency(dep);
        }
        if (
          FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
            if (onerror) onerror();
            removeRunDependency(dep);
          })
        ) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url, (byteArray) => processData(byteArray), onerror);
      } else {
        processData(url);
      }
    }
    function FS_modeStringToFlags(str) {
      var flagModes = {
        r: 0,
        "r+": 2,
        w: 512 | 64 | 1,
        "w+": 512 | 64 | 2,
        a: 1024 | 64 | 1,
        "a+": 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error("Unknown file open mode: " + str);
      }
      return flags;
    }
    function FS_getMode(canRead, canWrite) {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    }
    var IDBFS = {
      dbs: {},
      indexedDB: () => {
        if (typeof indexedDB != "undefined") return indexedDB;
        var ret = null;
        if (typeof window == "object")
          ret =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB;
        assert(ret, "IDBFS used, but indexedDB not supported");
        return ret;
      },
      DB_VERSION: 21,
      DB_STORE_NAME: "FILE_DATA",
      mount: function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },
      syncfs: (mount, populate, callback) => {
        IDBFS.getLocalSet(mount, (err, local) => {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, (err, remote) => {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },
      quit: () => {
        Object.values(IDBFS.dbs).forEach((value) => value.close());
        IDBFS.dbs = {};
      },
      getDB: (name, callback) => {
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        if (!req) {
          return callback("Unable to connect to IndexedDB");
        }
        req.onupgradeneeded = (e) => {
          var db = e.target.result;
          var transaction = e.target.transaction;
          var fileStore;
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
          if (!fileStore.indexNames.contains("timestamp")) {
            fileStore.createIndex("timestamp", "timestamp", { unique: false });
          }
        };
        req.onsuccess = () => {
          db = req.result;
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = (e) => {
          callback(this.error);
          e.preventDefault();
        };
      },
      getLocalSet: (mount, callback) => {
        var entries = {};
        function isRealDir(p) {
          return p !== "." && p !== "..";
        }
        function toAbsolute(root) {
          return (p) => {
            return PATH.join2(root, p);
          };
        }
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat;
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(
              check,
              FS.readdir(path).filter(isRealDir).map(toAbsolute(path))
            );
          }
          entries[path] = { timestamp: stat.mtime };
        }
        return callback(null, { type: "local", entries: entries });
      },
      getRemoteSet: (mount, callback) => {
        var entries = {};
        IDBFS.getDB(mount.mountpoint, (err, db) => {
          if (err) return callback(err);
          try {
            var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
            transaction.onerror = (e) => {
              callback(this.error);
              e.preventDefault();
            };
            var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
            var index = store.index("timestamp");
            index.openKeyCursor().onsuccess = (event) => {
              var cursor = event.target.result;
              if (!cursor) {
                return callback(null, {
                  type: "remote",
                  db: db,
                  entries: entries,
                });
              }
              entries[cursor.primaryKey] = { timestamp: cursor.key };
              cursor.continue();
            };
          } catch (e) {
            return callback(e);
          }
        });
      },
      loadLocalEntry: (path, callback) => {
        var stat, node;
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, {
            timestamp: stat.mtime,
            mode: stat.mode,
            contents: node.contents,
          });
        } else {
          return callback(new Error("node type not supported"));
        }
      },
      storeLocalEntry: (path, entry, callback) => {
        try {
          if (FS.isDir(entry["mode"])) {
            FS.mkdirTree(path, entry["mode"]);
          } else if (FS.isFile(entry["mode"])) {
            FS.writeFile(path, entry["contents"], { canOwn: true });
          } else {
            return callback(new Error("node type not supported"));
          }
          FS.chmod(path, entry["mode"]);
          FS.utime(path, entry["timestamp"], entry["timestamp"]);
        } catch (e) {
          return callback(e);
        }
        callback(null);
      },
      removeLocalEntry: (path, callback) => {
        try {
          var stat = FS.stat(path);
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
        callback(null);
      },
      loadRemoteEntry: (store, path, callback) => {
        var req = store.get(path);
        req.onsuccess = (event) => {
          callback(null, event.target.result);
        };
        req.onerror = (e) => {
          callback(this.error);
          e.preventDefault();
        };
      },
      storeRemoteEntry: (store, path, entry, callback) => {
        try {
          var req = store.put(entry, path);
        } catch (e) {
          callback(e);
          return;
        }
        req.onsuccess = () => {
          callback(null);
        };
        req.onerror = (e) => {
          callback(this.error);
          e.preventDefault();
        };
      },
      removeRemoteEntry: (store, path, callback) => {
        var req = store.delete(path);
        req.onsuccess = () => {
          callback(null);
        };
        req.onerror = (e) => {
          callback(this.error);
          e.preventDefault();
        };
      },
      reconcile: (src, dst, callback) => {
        var total = 0;
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e["timestamp"].getTime() != e2["timestamp"].getTime()) {
            create.push(key);
            total++;
          }
        });
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          if (!src.entries[key]) {
            remove.push(key);
            total++;
          }
        });
        if (!total) {
          return callback(null);
        }
        var errored = false;
        var db = src.type === "remote" ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        function done(err) {
          if (err && !errored) {
            errored = true;
            return callback(err);
          }
        }
        transaction.onerror = (e) => {
          done(this.error);
          e.preventDefault();
        };
        transaction.oncomplete = (e) => {
          if (!errored) {
            callback(null);
          }
        };
        create.sort().forEach((path) => {
          if (dst.type === "local") {
            IDBFS.loadRemoteEntry(store, path, (err, entry) => {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, (err, entry) => {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
        remove
          .sort()
          .reverse()
          .forEach((path) => {
            if (dst.type === "local") {
              IDBFS.removeLocalEntry(path, done);
            } else {
              IDBFS.removeRemoteEntry(store, path, done);
            }
          });
      },
    };
    var FS = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: "/",
      initialized: false,
      ignorePermissions: true,
      ErrnoError: null,
      genericErrors: {},
      filesystems: null,
      syncFSRequests: 0,
      lookupPath: (path, opts = {}) => {
        path = PATH_FS.resolve(path);
        if (!path) return { path: "", node: null };
        var defaults = { follow_mount: true, recurse_count: 0 };
        opts = Object.assign(defaults, opts);
        if (opts.recurse_count > 8) {
          throw new FS.ErrnoError(32);
        }
        var parts = path.split("/").filter((p) => !!p);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
          var islast = i === parts.length - 1;
          if (islast && opts.parent) {
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, {
                recurse_count: opts.recurse_count + 1,
              });
              current = lookup.node;
              if (count++ > 40) {
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },
      getPath: (node) => {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length - 1] !== "/"
              ? mount + "/" + path
              : mount + path;
          }
          path = path ? node.name + "/" + path : node.name;
          node = node.parent;
        }
      },
      hashName: (parentid, name) => {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
      hashAddNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
      hashRemoveNode: (node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
      lookupNode: (parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        return FS.lookup(parent, name);
      },
      createNode: (parent, name, mode, rdev) => {
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
      },
      destroyNode: (node) => {
        FS.hashRemoveNode(node);
      },
      isRoot: (node) => {
        return node === node.parent;
      },
      isMountpoint: (node) => {
        return !!node.mounted;
      },
      isFile: (mode) => {
        return (mode & 61440) === 32768;
      },
      isDir: (mode) => {
        return (mode & 61440) === 16384;
      },
      isLink: (mode) => {
        return (mode & 61440) === 40960;
      },
      isChrdev: (mode) => {
        return (mode & 61440) === 8192;
      },
      isBlkdev: (mode) => {
        return (mode & 61440) === 24576;
      },
      isFIFO: (mode) => {
        return (mode & 61440) === 4096;
      },
      isSocket: (mode) => {
        return (mode & 49152) === 49152;
      },
      flagsToPermissionString: (flag) => {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
          perms += "w";
        }
        return perms;
      },
      nodePermissions: (node, perms) => {
        if (FS.ignorePermissions) {
          return 0;
        }
        if (perms.includes("r") && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes("w") && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes("x") && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
      mayLookup: (dir) => {
        var errCode = FS.nodePermissions(dir, "x");
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
      mayCreate: (dir, name) => {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {}
        return FS.nodePermissions(dir, "wx");
      },
      mayDelete: (dir, name, isdir) => {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
      mayOpen: (node, flags) => {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
      MAX_OPEN_FDS: 4096,
      nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
      getStream: (fd) => FS.streams[fd],
      createStream: (stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
          FS.FSStream = function () {
            this.shared = {};
          };
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function () {
                return this.node;
              },
              set: function (val) {
                this.node = val;
              },
            },
            isRead: {
              get: function () {
                return (this.flags & 2097155) !== 1;
              },
            },
            isWrite: {
              get: function () {
                return (this.flags & 2097155) !== 0;
              },
            },
            isAppend: {
              get: function () {
                return this.flags & 1024;
              },
            },
            flags: {
              get: function () {
                return this.shared.flags;
              },
              set: function (val) {
                this.shared.flags = val;
              },
            },
            position: {
              get: function () {
                return this.shared.position;
              },
              set: function (val) {
                this.shared.position = val;
              },
            },
          });
        }
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
      closeStream: (fd) => {
        FS.streams[fd] = null;
      },
      chrdev_stream_ops: {
        open: (stream) => {
          var device = FS.getDevice(stream.node.rdev);
          stream.stream_ops = device.stream_ops;
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },
        llseek: () => {
          throw new FS.ErrnoError(70);
        },
      },
      major: (dev) => dev >> 8,
      minor: (dev) => dev & 255,
      makedev: (ma, mi) => (ma << 8) | mi,
      registerDevice: (dev, ops) => {
        FS.devices[dev] = { stream_ops: ops };
      },
      getDevice: (dev) => FS.devices[dev],
      getMounts: (mount) => {
        var mounts = [];
        var check = [mount];
        while (check.length) {
          var m = check.pop();
          mounts.push(m);
          check.push.apply(check, m.mounts);
        }
        return mounts;
      },
      syncfs: (populate, callback) => {
        if (typeof populate == "function") {
          callback = populate;
          populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
          err(
            "warning: " +
              FS.syncFSRequests +
              " FS.syncfs operations in flight at once, probably just doing extra work"
          );
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        }
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
      mount: (type, opts, mountpoint) => {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          mountpoint = lookup.path;
          node = lookup.node;
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: [],
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          node.mounted = mount;
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
        return mountRoot;
      },
      unmount: (mountpoint) => {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
          while (current) {
            var next = current.name_next;
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
            current = next;
          }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },
      lookup: (parent, name) => {
        return parent.node_ops.lookup(parent, name);
      },
      mknod: (path, mode, dev) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
      create: (path, mode) => {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
      mkdir: (path, mode) => {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
      mkdirTree: (path, mode) => {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += "/" + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch (e) {
            if (e.errno != 20) throw e;
          }
        }
      },
      mkdev: (path, mode, dev) => {
        if (typeof dev == "undefined") {
          dev = mode;
          mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
      symlink: (oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
      rename: (old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
          throw new FS.ErrnoError(28);
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
          throw new FS.ErrnoError(55);
        }
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (old_node === new_node) {
          return;
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        errCode = new_node
          ? FS.mayDelete(new_dir, new_name, isdir)
          : FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (
          FS.isMountpoint(old_node) ||
          (new_node && FS.isMountpoint(new_node))
        ) {
          throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, "w");
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        FS.hashRemoveNode(old_node);
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          FS.hashAddNode(old_node);
        }
      },
      rmdir: (path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
      readdir: (path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },
      unlink: (path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
      readlink: (path) => {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(
          FS.getPath(link.parent),
          link.node_ops.readlink(link)
        );
      },
      stat: (path, dontFollow) => {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },
      lstat: (path) => {
        return FS.stat(path, true);
      },
      chmod: (path, mode, dontFollow) => {
        var node;
        if (typeof path == "string") {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now(),
        });
      },
      lchmod: (path, mode) => {
        FS.chmod(path, mode, true);
      },
      fchmod: (fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },
      chown: (path, uid, gid, dontFollow) => {
        var node;
        if (typeof path == "string") {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, { timestamp: Date.now() });
      },
      lchown: (path, uid, gid) => {
        FS.chown(path, uid, gid, true);
      },
      fchown: (fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },
      truncate: (path, len) => {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == "string") {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
      },
      ftruncate: (fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },
      utime: (path, atime, mtime) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
      },
      open: (path, flags, mode) => {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
        mode = typeof mode == "undefined" ? 438 : mode;
        if (flags & 64) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == "object") {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
            node = lookup.node;
          } catch (e) {}
        }
        var created = false;
        if (flags & 64) {
          if (node) {
            if (flags & 128) {
              throw new FS.ErrnoError(20);
            }
          } else {
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        if (flags & 512 && !created) {
          FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          ungotten: [],
          error: false,
        });
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
      close: (stream) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null;
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
      isClosed: (stream) => {
        return stream.fd === null;
      },
      llseek: (stream, offset, whence) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
      read: (stream, buffer, offset, length, position) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(
          stream,
          buffer,
          offset,
          length,
          position
        );
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
      write: (stream, buffer, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(
          stream,
          buffer,
          offset,
          length,
          position,
          canOwn
        );
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
      allocate: (stream, offset, length) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },
      mmap: (stream, length, position, prot, flags) => {
        if (
          (prot & 2) !== 0 &&
          (flags & 2) === 0 &&
          (stream.flags & 2097155) !== 2
        ) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
      msync: (stream, buffer, offset, length, mmapFlags) => {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(
          stream,
          buffer,
          offset,
          length,
          mmapFlags
        );
      },
      munmap: (stream) => 0,
      ioctl: (stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
      readFile: (path, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === "binary") {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
      writeFile: (path, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == "string") {
          var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error("Unsupported data type");
        }
        FS.close(stream);
      },
      cwd: () => FS.currentPath,
      chdir: (path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, "x");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
      createDefaultDirectories: () => {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user");
      },
      createDefaultDevices: () => {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var randomBuffer = new Uint8Array(1024),
          randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomLeft = randomFill(randomBuffer).byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice("/dev", "random", randomByte);
        FS.createDevice("/dev", "urandom", randomByte);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp");
      },
      createSpecialDirectories: () => {
        FS.mkdir("/proc");
        var proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount(
          {
            mount: () => {
              var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
              node.node_ops = {
                lookup: (parent, name) => {
                  var fd = +name;
                  var stream = FS.getStream(fd);
                  if (!stream) throw new FS.ErrnoError(8);
                  var ret = {
                    parent: null,
                    mount: { mountpoint: "fake" },
                    node_ops: { readlink: () => stream.path },
                  };
                  ret.parent = ret;
                  return ret;
                },
              };
              return node;
            },
          },
          {},
          "/proc/self/fd"
        );
      },
      createStandardStreams: () => {
        if (Module["stdin"]) {
          FS.createDevice("/dev", "stdin", Module["stdin"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdin");
        }
        if (Module["stdout"]) {
          FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        } else {
          FS.symlink("/dev/tty", "/dev/stdout");
        }
        if (Module["stderr"]) {
          FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        } else {
          FS.symlink("/dev/tty1", "/dev/stderr");
        }
        var stdin = FS.open("/dev/stdin", 0);
        var stdout = FS.open("/dev/stdout", 1);
        var stderr = FS.open("/dev/stderr", 1);
      },
      ensureErrnoError: () => {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.name = "ErrnoError";
          this.node = node;
          this.setErrno = function (errno) {
            this.errno = errno;
          };
          this.setErrno(errno);
          this.message = "FS error";
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = "<generic error, no stack>";
        });
      },
      staticInit: () => {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = { MEMFS: MEMFS, IDBFS: IDBFS };
      },
      init: (input, output, error) => {
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams();
      },
      quit: () => {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },
      findObject: (path, dontResolveLastLink) => {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
      analyzePath: (path, dontResolveLastLink) => {
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {}
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null,
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === "/";
        } catch (e) {
          ret.error = e.errno;
        }
        return ret;
      },
      createPath: (parent, path, canRead, canWrite) => {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {}
          parent = current;
        }
        return current;
      },
      createFile: (parent, name, properties, canRead, canWrite) => {
        var path = PATH.join2(
          typeof parent == "string" ? parent : FS.getPath(parent),
          name
        );
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
      createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
        var path = name;
        if (parent) {
          parent = typeof parent == "string" ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == "string") {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i)
              arr[i] = data.charCodeAt(i);
            data = arr;
          }
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },
      createDevice: (parent, name, input, output) => {
        var path = PATH.join2(
          typeof parent == "string" ? parent : FS.getPath(parent),
          name
        );
        var mode = FS_getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
          open: (stream) => {
            stream.seekable = false;
          },
          close: (stream) => {
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: (stream, buffer, offset, length, pos) => {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: (stream, buffer, offset, length, pos) => {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset + i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          },
        });
        return FS.mkdev(path, mode, dev);
      },
      forceLoadFile: (obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
          return true;
        if (typeof XMLHttpRequest != "undefined") {
          throw new Error(
            "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
          );
        } else if (read_) {
          try {
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error("Cannot load without read() or XMLHttpRequest.");
        }
      },
      createLazyFile: (parent, name, url, canRead, canWrite) => {
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize) | 0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter =
          function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          };
        LazyUint8Array.prototype.cacheLength =
          function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (
              !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
            )
              throw new Error(
                "Couldn't load " + url + ". Status: " + xhr.status
              );
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing =
              (header = xhr.getResponseHeader("Accept-Ranges")) &&
              header === "bytes";
            var usesGzip =
              (header = xhr.getResponseHeader("Content-Encoding")) &&
              header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = (from, to) => {
              if (from > to)
                throw new Error(
                  "invalid range (" +
                    from +
                    ", " +
                    to +
                    ") or no bytes requested!"
                );
              if (to > datalength - 1)
                throw new Error(
                  "only " + datalength + " bytes available! programmer error!"
                );
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              if (datalength !== chunkSize)
                xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
              xhr.responseType = "arraybuffer";
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/plain; charset=x-user-defined");
              }
              xhr.send(null);
              if (
                !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
              )
                throw new Error(
                  "Couldn't load " + url + ". Status: " + xhr.status
                );
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              }
              return intArrayFromString(xhr.responseText || "", true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum + 1) * chunkSize - 1;
              end = Math.min(end, datalength - 1);
              if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == "undefined")
                throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
              chunkSize = datalength = 1;
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out(
                "LazyFiles on gzip forces download of the whole file when length is accessed"
              );
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          };
        if (typeof XMLHttpRequest != "undefined") {
          if (!ENVIRONMENT_IS_WORKER)
            throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: function () {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              },
            },
            chunkSize: {
              get: function () {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              },
            },
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        Object.defineProperties(node, {
          usedBytes: {
            get: function () {
              return this.contents.length;
            },
          },
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length) return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position);
        };
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr: ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
    };
    var SYSCALLS = {
      DEFAULT_POLLMASK: 5,
      calculateAt: function (dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },
      doStat: function (func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (
            e &&
            e.node &&
            PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))
          ) {
            return -54;
          }
          throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[(buf + 8) >> 2] = stat.ino;
        HEAP32[(buf + 12) >> 2] = stat.mode;
        HEAPU32[(buf + 16) >> 2] = stat.nlink;
        HEAP32[(buf + 20) >> 2] = stat.uid;
        HEAP32[(buf + 24) >> 2] = stat.gid;
        HEAP32[(buf + 28) >> 2] = stat.rdev;
        (tempI64 = [
          stat.size >>> 0,
          ((tempDouble = stat.size),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(buf + 40) >> 2] = tempI64[0]),
          (HEAP32[(buf + 44) >> 2] = tempI64[1]);
        HEAP32[(buf + 48) >> 2] = 4096;
        HEAP32[(buf + 52) >> 2] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        (tempI64 = [
          Math.floor(atime / 1e3) >>> 0,
          ((tempDouble = Math.floor(atime / 1e3)),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(buf + 56) >> 2] = tempI64[0]),
          (HEAP32[(buf + 60) >> 2] = tempI64[1]);
        HEAPU32[(buf + 64) >> 2] = (atime % 1e3) * 1e3;
        (tempI64 = [
          Math.floor(mtime / 1e3) >>> 0,
          ((tempDouble = Math.floor(mtime / 1e3)),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(buf + 72) >> 2] = tempI64[0]),
          (HEAP32[(buf + 76) >> 2] = tempI64[1]);
        HEAPU32[(buf + 80) >> 2] = (mtime % 1e3) * 1e3;
        (tempI64 = [
          Math.floor(ctime / 1e3) >>> 0,
          ((tempDouble = Math.floor(ctime / 1e3)),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(buf + 88) >> 2] = tempI64[0]),
          (HEAP32[(buf + 92) >> 2] = tempI64[1]);
        HEAPU32[(buf + 96) >> 2] = (ctime % 1e3) * 1e3;
        (tempI64 = [
          stat.ino >>> 0,
          ((tempDouble = stat.ino),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(buf + 104) >> 2] = tempI64[0]),
          (HEAP32[(buf + 108) >> 2] = tempI64[1]);
        return 0;
      },
      doMsync: function (addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
      varargs: undefined,
      get: function () {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
        return ret;
      },
      getStr: function (ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
      getStreamFromFD: function (fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      },
    };
    function _proc_exit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module["onExit"]) Module["onExit"](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
    function exitJS(status, implicit) {
      EXITSTATUS = status;
      _proc_exit(status);
    }
    var _exit = exitJS;
    function maybeExit() {
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    }
    function callUserCallback(func) {
      if (ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    }
    function safeSetTimeout(func, timeout) {
      return setTimeout(() => {
        callUserCallback(func);
      }, timeout);
    }
    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    var Browser = {
      mainLoop: {
        running: false,
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++;
        },
        resume: function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },
        updateStatus: function () {
          if (Module["setStatus"]) {
            var message = Module["statusMessage"] || "Please wait...";
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module["setStatus"](
                  message + " (" + (expected - remaining) + "/" + expected + ")"
                );
              } else {
                Module["setStatus"](message);
              }
            } else {
              Module["setStatus"]("");
            }
          }
        },
        runIter: function (func) {
          if (ABORT) return;
          if (Module["preMainLoop"]) {
            var preRet = Module["preMainLoop"]();
            if (preRet === false) {
              return;
            }
          }
          callUserCallback(func);
          if (Module["postMainLoop"]) Module["postMainLoop"]();
        },
      },
      isFullscreen: false,
      pointerLock: false,
      moduleContextCreatedCallbacks: [],
      workers: [],
      init: function () {
        if (Browser.initted) return;
        Browser.initted = true;
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin["handle"] = function imagePlugin_handle(
          byteArray,
          name,
          onload,
          onerror
        ) {
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          if (b.size !== byteArray.length) {
            b = new Blob([new Uint8Array(byteArray).buffer], {
              type: Browser.getMimetype(name),
            });
          }
          var url = URL.createObjectURL(b);
          var img = new Image();
          img.onload = () => {
            assert(img.complete, "Image " + name + " could not be decoded");
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            preloadedImages[name] = canvas;
            URL.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = (event) => {
            out("Image " + url + " could not be decoded");
            if (onerror) onerror();
          };
          img.src = url;
        };
        preloadPlugins.push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
          return (
            !Module.noAudioDecoding &&
            name.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 }
          );
        };
        audioPlugin["handle"] = function audioPlugin_handle(
          byteArray,
          name,
          onload,
          onerror
        ) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            preloadedAudios[name] = audio;
            if (onload) onload(byteArray);
          }
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          var url = URL.createObjectURL(b);
          var audio = new Audio();
          audio.addEventListener("canplaythrough", () => finish(audio), false);
          audio.onerror = function audio_onerror(event) {
            if (done) return;
            err(
              "warning: browser could not fully decode audio " +
                name +
                ", trying slower base64 approach"
            );
            function encode64(data) {
              var BASE =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
              var PAD = "=";
              var ret = "";
              var leftchar = 0;
              var leftbits = 0;
              for (var i = 0; i < data.length; i++) {
                leftchar = (leftchar << 8) | data[i];
                leftbits += 8;
                while (leftbits >= 6) {
                  var curr = (leftchar >> (leftbits - 6)) & 63;
                  leftbits -= 6;
                  ret += BASE[curr];
                }
              }
              if (leftbits == 2) {
                ret += BASE[(leftchar & 3) << 4];
                ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar & 15) << 2];
                ret += PAD;
              }
              return ret;
            }
            audio.src =
              "data:audio/x-" +
              name.substr(-3) +
              ";base64," +
              encode64(byteArray);
            finish(audio);
          };
          audio.src = url;
          safeSetTimeout(() => {
            finish(audio);
          }, 1e4);
        };
        preloadPlugins.push(audioPlugin);
        function pointerLockChange() {
          Browser.pointerLock =
            document["pointerLockElement"] === Module["canvas"] ||
            document["mozPointerLockElement"] === Module["canvas"] ||
            document["webkitPointerLockElement"] === Module["canvas"] ||
            document["msPointerLockElement"] === Module["canvas"];
        }
        var canvas = Module["canvas"];
        if (canvas) {
          canvas.requestPointerLock =
            canvas["requestPointerLock"] ||
            canvas["mozRequestPointerLock"] ||
            canvas["webkitRequestPointerLock"] ||
            canvas["msRequestPointerLock"] ||
            (() => {});
          canvas.exitPointerLock =
            document["exitPointerLock"] ||
            document["mozExitPointerLock"] ||
            document["webkitExitPointerLock"] ||
            document["msExitPointerLock"] ||
            (() => {});
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
          document.addEventListener(
            "pointerlockchange",
            pointerLockChange,
            false
          );
          document.addEventListener(
            "mozpointerlockchange",
            pointerLockChange,
            false
          );
          document.addEventListener(
            "webkitpointerlockchange",
            pointerLockChange,
            false
          );
          document.addEventListener(
            "mspointerlockchange",
            pointerLockChange,
            false
          );
          if (Module["elementPointerLock"]) {
            canvas.addEventListener(
              "click",
              (ev) => {
                if (
                  !Browser.pointerLock &&
                  Module["canvas"].requestPointerLock
                ) {
                  Module["canvas"].requestPointerLock();
                  ev.preventDefault();
                }
              },
              false
            );
          }
        }
      },
      createContext: function (
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
      ) {
        if (useWebGL && Module.ctx && canvas == Module.canvas)
          return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: typeof WebGL2RenderingContext != "undefined" ? 2 : 1,
          };
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
          if (typeof GL != "undefined") {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext("2d");
        }
        if (!ctx) return null;
        if (setInModule) {
          if (!useWebGL)
            assert(
              typeof GLctx == "undefined",
              "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"
            );
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach((callback) =>
            callback()
          );
          Browser.init();
        }
        return ctx;
      },
      destroyContext: function (canvas, useWebGL, setInModule) {},
      fullscreenHandlersInstalled: false,
      lockPointer: undefined,
      resizeCanvas: undefined,
      requestFullscreen: function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == "undefined")
          Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == "undefined")
          Browser.resizeCanvas = false;
        var canvas = Module["canvas"];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if (
            (document["fullscreenElement"] ||
              document["mozFullScreenElement"] ||
              document["msFullscreenElement"] ||
              document["webkitFullscreenElement"] ||
              document["webkitCurrentFullScreenElement"]) === canvasContainer
          ) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          if (Module["onFullScreen"])
            Module["onFullScreen"](Browser.isFullscreen);
          if (Module["onFullscreen"])
            Module["onFullscreen"](Browser.isFullscreen);
        }
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener(
            "fullscreenchange",
            fullscreenChange,
            false
          );
          document.addEventListener(
            "mozfullscreenchange",
            fullscreenChange,
            false
          );
          document.addEventListener(
            "webkitfullscreenchange",
            fullscreenChange,
            false
          );
          document.addEventListener(
            "MSFullscreenChange",
            fullscreenChange,
            false
          );
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen =
          canvasContainer["requestFullscreen"] ||
          canvasContainer["mozRequestFullScreen"] ||
          canvasContainer["msRequestFullscreen"] ||
          (canvasContainer["webkitRequestFullscreen"]
            ? () =>
                canvasContainer["webkitRequestFullscreen"](
                  Element["ALLOW_KEYBOARD_INPUT"]
                )
            : null) ||
          (canvasContainer["webkitRequestFullScreen"]
            ? () =>
                canvasContainer["webkitRequestFullScreen"](
                  Element["ALLOW_KEYBOARD_INPUT"]
                )
            : null);
        canvasContainer.requestFullscreen();
      },
      exitFullscreen: function () {
        if (!Browser.isFullscreen) {
          return false;
        }
        var CFS =
          document["exitFullscreen"] ||
          document["cancelFullScreen"] ||
          document["mozCancelFullScreen"] ||
          document["msExitFullscreen"] ||
          document["webkitCancelFullScreen"] ||
          (() => {});
        CFS.apply(document, []);
        return true;
      },
      nextRAF: 0,
      fakeRequestAnimationFrame: function (func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1e3 / 60;
        } else {
          while (now + 2 >= Browser.nextRAF) {
            Browser.nextRAF += 1e3 / 60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },
      requestAnimationFrame: function (func) {
        if (typeof requestAnimationFrame == "function") {
          requestAnimationFrame(func);
          return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func);
      },
      safeSetTimeout: function (func, timeout) {
        return safeSetTimeout(func, timeout);
      },
      safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(() => {
          callUserCallback(func);
        });
      },
      getMimetype: function (name) {
        return {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          bmp: "image/bmp",
          ogg: "audio/ogg",
          wav: "audio/wav",
          mp3: "audio/mpeg",
        }[name.substr(name.lastIndexOf(".") + 1)];
      },
      getUserMedia: function (func) {
        if (!window.getUserMedia) {
          window.getUserMedia =
            navigator["getUserMedia"] || navigator["mozGetUserMedia"];
        }
        window.getUserMedia(func);
      },
      getMovementX: function (event) {
        return (
          event["movementX"] ||
          event["mozMovementX"] ||
          event["webkitMovementX"] ||
          0
        );
      },
      getMovementY: function (event) {
        return (
          event["movementY"] ||
          event["mozMovementY"] ||
          event["webkitMovementY"] ||
          0
        );
      },
      getMouseWheelDelta: function (event) {
        var delta = 0;
        switch (event.type) {
          case "DOMMouseScroll":
            delta = event.detail / 3;
            break;
          case "mousewheel":
            delta = event.wheelDelta / 120;
            break;
          case "wheel":
            delta = event.deltaY;
            switch (event.deltaMode) {
              case 0:
                delta /= 100;
                break;
              case 1:
                delta /= 3;
                break;
              case 2:
                delta *= 80;
                break;
              default:
                throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
            }
            break;
          default:
            throw "unrecognized mouse wheel event: " + event.type;
        }
        return delta;
      },
      mouseX: 0,
      mouseY: 0,
      mouseMovementX: 0,
      mouseMovementY: 0,
      touches: {},
      lastTouches: {},
      calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
          if (event.type != "mousemove" && "mozMovementX" in event) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          if (typeof SDL != "undefined") {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          var scrollX =
            typeof window.scrollX != "undefined"
              ? window.scrollX
              : window.pageXOffset;
          var scrollY =
            typeof window.scrollY != "undefined"
              ? window.scrollY
              : window.pageYOffset;
          if (
            event.type === "touchstart" ||
            event.type === "touchend" ||
            event.type === "touchmove"
          ) {
            var touch = event.touch;
            if (touch === undefined) {
              return;
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
            var coords = { x: adjustedX, y: adjustedY };
            if (event.type === "touchstart") {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (
              event.type === "touchend" ||
              event.type === "touchmove"
            ) {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },
      resizeListeners: [],
      updateResizeListeners: function () {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach((listener) =>
          listener(canvas.width, canvas.height)
        );
      },
      setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },
      windowedWidth: 0,
      windowedHeight: 0,
      setFullscreenCanvasSize: function () {
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[SDL.screen >> 2];
          flags = flags | 8388608;
          HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
      },
      setWindowedCanvasSize: function () {
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[SDL.screen >> 2];
          flags = flags & ~8388608;
          HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
      },
      updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
          if (w / h < Module["forcedAspectRatio"]) {
            w = Math.round(h * Module["forcedAspectRatio"]);
          } else {
            h = Math.round(w / Module["forcedAspectRatio"]);
          }
        }
        if (
          (document["fullscreenElement"] ||
            document["mozFullScreenElement"] ||
            document["msFullscreenElement"] ||
            document["webkitFullscreenElement"] ||
            document["webkitCurrentFullScreenElement"]) === canvas.parentNode &&
          typeof screen != "undefined"
        ) {
          var factor = Math.min(screen.width / w, screen.height / h);
          w = Math.round(w * factor);
          h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width != w) canvas.width = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != "undefined") {
            canvas.style.removeProperty("width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width != wNative) canvas.width = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != "undefined") {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty("width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty("width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },
    };
    function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
      if (!Browser.mainLoop.func) {
        return 1;
      }
      if (!Browser.mainLoop.running) {
        Browser.mainLoop.running = true;
      }
      if (mode == 0) {
        Browser.mainLoop.scheduler =
          function Browser_mainLoop_scheduler_setTimeout() {
            var timeUntilNextTick =
              Math.max(
                0,
                Browser.mainLoop.tickStartTime + value - _emscripten_get_now()
              ) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
          };
        Browser.mainLoop.method = "timeout";
      } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "rAF";
      } else if (mode == 2) {
        if (typeof setImmediate == "undefined") {
          var setImmediates = [];
          var emscriptenMainLoopMessageId = "setimmediate";
          var Browser_setImmediate_messageHandler = (event) => {
            if (
              event.data === emscriptenMainLoopMessageId ||
              event.data.target === emscriptenMainLoopMessageId
            ) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          };
          addEventListener(
            "message",
            Browser_setImmediate_messageHandler,
            true
          );
          setImmediate = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module["setImmediates"] === undefined)
                Module["setImmediates"] = [];
              Module["setImmediates"].push(func);
              postMessage({ target: emscriptenMainLoopMessageId });
            } else postMessage(emscriptenMainLoopMessageId, "*");
          };
        }
        Browser.mainLoop.scheduler =
          function Browser_mainLoop_scheduler_setImmediate() {
            setImmediate(Browser.mainLoop.runner);
          };
        Browser.mainLoop.method = "immediate";
      }
      return 0;
    }
    var _emscripten_get_now;
    _emscripten_get_now = () => performance.now();
    function setMainLoop(
      browserIterationFunc,
      fps,
      simulateInfiniteLoop,
      arg,
      noSetTiming
    ) {
      assert(
        !Browser.mainLoop.func,
        "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters."
      );
      Browser.mainLoop.func = browserIterationFunc;
      Browser.mainLoop.arg = arg;
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
      function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
          return false;
        }
        return true;
      }
      Browser.mainLoop.running = false;
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next =
              remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              next = next + 0.5;
              Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
            }
          }
          out(
            'main loop blocker "' +
              blocker.name +
              '" took ' +
              (Date.now() - start) +
              " ms"
          );
          Browser.mainLoop.updateStatus();
          if (!checkIsRunning()) return;
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
        if (!checkIsRunning()) return;
        Browser.mainLoop.currentFrameNumber =
          (Browser.mainLoop.currentFrameNumber + 1) | 0;
        if (
          Browser.mainLoop.timingMode == 1 &&
          Browser.mainLoop.timingValue > 1 &&
          Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue !=
            0
        ) {
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
        GL.newRenderingFrameStarted();
        Browser.mainLoop.runIter(browserIterationFunc);
        if (!checkIsRunning()) return;
        if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData)
          SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler();
      };
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler();
      }
      if (simulateInfiniteLoop) {
        throw "unwind";
      }
    }
    function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
      var browserIterationFunc = () => dynCall_v.call(null, func);
      setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
    }
    function _JS_SetMainLoop(func, fps, simulateInfiniteLoop) {
      try {
        _emscripten_set_main_loop(func, fps, simulateInfiniteLoop);
      } catch {}
    }
    var WEBAudio = {
      audioInstanceIdCounter: 0,
      audioInstances: {},
      audioContext: null,
      audioWebEnabled: 0,
      audioCache: [],
      pendingAudioSources: {},
      FAKEMOD_SAMPLERATE: 44100,
    };
    function jsAudioMixinSetPitch(source) {
      source.estimatePlaybackPosition = function () {
        var t =
          (WEBAudio.audioContext.currentTime - source.playbackStartTime) *
          source.playbackRate.value;
        if (source.loop && t >= source.loopStart) {
          t =
            ((t - source.loopStart) % (source.loopEnd - source.loopStart)) +
            source.loopStart;
        }
        return t;
      };
      source.setPitch = function (newPitch) {
        var curPosition = source.estimatePlaybackPosition();
        if (curPosition >= 0) {
          source.playbackStartTime =
            WEBAudio.audioContext.currentTime - curPosition / newPitch;
        }
        if (source.playbackRate.value !== newPitch)
          source.playbackRate.value = newPitch;
      };
    }
    function jsAudioCreateUncompressedSoundClip(buffer, error) {
      var soundClip = { buffer: buffer, error: error };
      soundClip.release = function () {};
      soundClip.getLength = function () {
        if (!this.buffer) {
          console.log("Trying to get length of sound which is not loaded.");
          return 0;
        }
        return this.buffer.length;
      };
      soundClip.getData = function (ptr, length) {
        if (!this.buffer) {
          console.log("Trying to get data of sound which is not loaded.");
          return 0;
        }
        var startOutputBuffer = ptr >> 2;
        var output = HEAPF32.subarray(
          startOutputBuffer,
          startOutputBuffer + (length >> 2)
        );
        var numMaxSamples = Math.floor(
          (length >> 2) / this.buffer.numberOfChannels
        );
        var numReadSamples = Math.min(this.buffer.length, numMaxSamples);
        for (var i = 0; i < this.buffer.numberOfChannels; i++) {
          var channelData = this.buffer
            .getChannelData(i)
            .subarray(0, numReadSamples);
          output.set(channelData, i * numReadSamples);
        }
        return numReadSamples * this.buffer.numberOfChannels * 4;
      };
      soundClip.getNumberOfChannels = function () {
        if (!this.buffer) {
          console.log("Trying to get metadata of sound which is not loaded.");
          return 0;
        }
        return this.buffer.numberOfChannels;
      };
      soundClip.getFrequency = function () {
        if (!this.buffer) {
          console.log("Trying to get metadata of sound which is not loaded.");
          return 0;
        }
        return this.buffer.sampleRate;
      };
      soundClip.createSourceNode = function () {
        if (!this.buffer) {
          console.log("Trying to play sound which is not loaded.");
        }
        var source = WEBAudio.audioContext.createBufferSource();
        source.buffer = this.buffer;
        jsAudioMixinSetPitch(source);
        return source;
      };
      return soundClip;
    }
    function jsAudioCreateChannel(callback, userData) {
      var channel = {
        callback: callback,
        userData: userData,
        source: null,
        gain: WEBAudio.audioContext.createGain(),
        panner: WEBAudio.audioContext.createPanner(),
        spatialBlendDryGain: WEBAudio.audioContext.createGain(),
        spatialBlendWetGain: WEBAudio.audioContext.createGain(),
        spatialBlendLevel: 0,
        loop: false,
        loopStart: 0,
        loopEnd: 0,
        pitch: 1,
      };
      channel.panner.rolloffFactor = 0;
      channel.release = function () {
        this.disconnectSource();
        this.gain.disconnect();
        this.panner.disconnect();
      };
      channel.playSoundClip = function (soundClip, startTime, startOffset) {
        try {
          var self = this;
          this.source = soundClip.createSourceNode();
          this.configurePanningNodes();
          this.setSpatialBlendLevel(this.spatialBlendLevel);
          this.source.onended = function () {
            self.source.isStopped = true;
            self.disconnectSource();
            if (self.callback) {
              ((a1) => dynCall_vi.apply(null, [self.callback, a1]))(
                self.userData
              );
            }
          };
          this.source.loop = this.loop;
          this.source.loopStart = this.loopStart;
          this.source.loopEnd = this.loopEnd;
          this.source.start(startTime, startOffset);
          this.source.playbackStartTime =
            startTime - startOffset / this.source.playbackRate.value;
          this.source.setPitch(this.pitch);
        } catch (e) {
          console.error("Channel.playSoundClip error. Exception: " + e);
        }
      };
      channel.stop = function (delay) {
        if (!this.source) {
          return;
        }
        try {
          channel.source.stop(WEBAudio.audioContext.currentTime + delay);
        } catch (e) {}
        if (delay == 0) {
          this.disconnectSource();
        }
      };
      channel.isPaused = function () {
        if (!this.source) {
          return true;
        }
        if (this.source.isPausedMockNode) {
          return true;
        }
        if (this.source.mediaElement) {
          return this.source.mediaElement.paused || this.source.pauseRequested;
        }
        return false;
      };
      channel.pause = function () {
        if (!this.source || this.source.isPausedMockNode) {
          return;
        }
        if (this.source.mediaElement) {
          this.source._pauseMediaElement();
          return;
        }
        var pausedSource = {
          isPausedMockNode: true,
          buffer: this.source.buffer,
          loop: this.source.loop,
          loopStart: this.source.loopStart,
          loopEnd: this.source.loopEnd,
          playbackRate: this.source.playbackRate.value,
          scheduledStopTime: undefined,
          playbackPausedAtPosition: this.source.estimatePlaybackPosition(),
          setPitch: function (v) {
            this.playbackRate = v;
          },
          stop: function (when) {
            this.scheduledStopTime = when;
          },
        };
        this.stop(0);
        this.disconnectSource();
        this.source = pausedSource;
      };
      channel.resume = function () {
        if (this.source && this.source.mediaElement) {
          this.source.start(undefined, this.source.currentTime);
          return;
        }
        if (!this.source || !this.source.isPausedMockNode) {
          return;
        }
        var pausedSource = this.source;
        var soundClip = jsAudioCreateUncompressedSoundClip(
          pausedSource.buffer,
          false
        );
        this.playSoundClip(
          soundClip,
          WEBAudio.audioContext.currentTime,
          Math.max(0, pausedSource.playbackPausedAtPosition)
        );
        this.source.loop = pausedSource.loop;
        this.source.loopStart = pausedSource.loopStart;
        this.source.loopEnd = pausedSource.loopEnd;
        this.source.setPitch(pausedSource.playbackRate);
        if (typeof pausedSource.scheduledStopTime !== "undefined") {
          var delay = Math.max(
            pausedSource.scheduledStopTime - WEBAudio.audioContext.currentTime,
            0
          );
          this.stop(delay);
        }
      };
      channel.setLoop = function (loop) {
        this.loop = loop;
        if (!this.source || this.source.loop == loop) {
          return;
        }
        this.source.loop = loop;
      };
      channel.setLoopPoints = function (loopStart, loopEnd) {
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        if (!this.source) {
          return;
        }
        if (this.source.loopStart !== loopStart) {
          this.source.loopStart = loopStart;
        }
        if (this.source.loopEnd !== loopEnd) {
          this.source.loopEnd = loopEnd;
        }
      };
      channel.set3D = function (spatialBlendLevel) {
        if (this.spatialBlendLevel != spatialBlendLevel) {
          this.setSpatialBlendLevel(spatialBlendLevel);
        }
      };
      channel.setPitch = function (pitch) {
        this.pitch = pitch;
        if (!this.source) {
          return;
        }
        this.source.setPitch(pitch);
      };
      channel.setVolume = function (volume) {
        if (this.gain.gain.value == volume) {
          return;
        }
        this.gain.gain.value = volume;
      };
      channel.setPosition = function (x, y, z) {
        var p = this.panner;
        if (p.positionX) {
          if (p.positionX.value !== x) p.positionX.value = x;
          if (p.positionY.value !== y) p.positionY.value = y;
          if (p.positionZ.value !== z) p.positionZ.value = z;
        } else if (p._x !== x || p._y !== y || p._z !== z) {
          p.setPosition(x, y, z);
          p._x = x;
          p._y = y;
          p._z = z;
        }
      };
      channel.disconnectSource = function () {
        if (!this.source || this.source.isPausedMockNode) {
          return;
        }
        if (this.source.mediaElement) {
          this.source._pauseMediaElement();
        }
        this.source.onended = null;
        this.source.disconnect();
        delete this.source;
      };
      channel.setSpatialBlendLevel = function (spatialBlendLevel) {
        var sourceCanBeConfigured =
          this.source && !this.source.isPausedMockNode;
        var spatializationTypeChanged =
          (this.spatialBlendLevel > 0 && spatialBlendLevel == 0) ||
          (this.spatialBlendLevel == 0 && spatialBlendLevel > 0);
        var needToReconfigureNodes =
          sourceCanBeConfigured && spatializationTypeChanged;
        this.spatialBlendWetGain.gain.value = spatialBlendLevel;
        this.spatialBlendDryGain.gain.value = 1 - spatialBlendLevel;
        this.spatialBlendLevel = spatialBlendLevel;
        if (needToReconfigureNodes) this.configurePanningNodes();
      };
      channel.configurePanningNodes = function () {
        if (!this.source) return;
        this.source.disconnect();
        this.spatialBlendDryGain.disconnect();
        this.spatialBlendWetGain.disconnect();
        this.panner.disconnect();
        this.gain.disconnect();
        if (this.spatialBlendLevel > 0) {
          this.source.connect(this.spatialBlendDryGain);
          this.spatialBlendDryGain.connect(this.gain);
          this.source.connect(this.spatialBlendWetGain);
          this.spatialBlendWetGain.connect(this.panner);
          this.panner.connect(this.gain);
        } else {
          this.source.connect(this.gain);
        }
        this.gain.connect(WEBAudio.audioContext.destination);
      };
      channel.isStopped = function () {
        if (!this.source) {
          return true;
        }
        if (this.source.mediaElement) {
          return this.source.isStopped;
        }
        return false;
      };
      return channel;
    }
    function _JS_Sound_Create_Channel(callback, userData) {
      if (WEBAudio.audioWebEnabled == 0) return;
      WEBAudio.audioInstances[++WEBAudio.audioInstanceIdCounter] =
        jsAudioCreateChannel(callback, userData);
      return WEBAudio.audioInstanceIdCounter;
    }
    function _JS_Sound_GetAudioBufferSampleRate(soundInstance) {
      if (WEBAudio.audioWebEnabled == 0) return WEBAudio.FAKEMOD_SAMPLERATE;
      var audioInstance = WEBAudio.audioInstances[soundInstance];
      if (!audioInstance) return WEBAudio.FAKEMOD_SAMPLERATE;
      var buffer = audioInstance.buffer
        ? audioInstance.buffer
        : audioInstance.source
        ? audioInstance.source.buffer
        : 0;
      if (!buffer) return WEBAudio.FAKEMOD_SAMPLERATE;
      return buffer.sampleRate;
    }
    function _JS_Sound_GetAudioContextSampleRate() {
      if (WEBAudio.audioWebEnabled == 0) return WEBAudio.FAKEMOD_SAMPLERATE;
      return WEBAudio.audioContext.sampleRate;
    }
    function _JS_Sound_GetLength(bufferInstance) {
      if (WEBAudio.audioWebEnabled == 0) return 0;
      var soundClip = WEBAudio.audioInstances[bufferInstance];
      if (!soundClip) return 0;
      return soundClip.getLength();
    }
    function _JS_Sound_GetLoadState(bufferInstance) {
      if (WEBAudio.audioWebEnabled == 0) return 2;
      var sound = WEBAudio.audioInstances[bufferInstance];
      if (sound.error) return 2;
      if (sound.buffer || sound.url) return 0;
      return 1;
    }
    function jsAudioPlayPendingBlockedAudio(soundId) {
      var pendingAudio = WEBAudio.pendingAudioSources[soundId];
      pendingAudio.sourceNode._startPlayback(pendingAudio.offset);
      delete WEBAudio.pendingAudioSources[soundId];
    }
    function jsAudioPlayBlockedAudios() {
      Object.keys(WEBAudio.pendingAudioSources).forEach(function (audioId) {
        jsAudioPlayPendingBlockedAudio(audioId);
      });
    }
    function _JS_Sound_Init() {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        WEBAudio.audioContext = new AudioContext();
        var tryToResumeAudioContext = function () {
          if (WEBAudio.audioContext.state === "suspended")
            WEBAudio.audioContext.resume().catch(function (error) {
              console.warn(
                "Could not resume audio context. Exception: " + error
              );
            });
          else Module.clearInterval(resumeInterval);
        };
        var resumeInterval = Module.setInterval(tryToResumeAudioContext, 400);
        WEBAudio.audioWebEnabled = 1;
        var _userEventCallback = function () {
          try {
            if (
              WEBAudio.audioContext.state !== "running" &&
              WEBAudio.audioContext.state !== "closed"
            ) {
              WEBAudio.audioContext.resume().catch(function (error) {
                console.warn(
                  "Could not resume audio context. Exception: " + error
                );
              });
            }
            jsAudioPlayBlockedAudios();
            var audioCacheSize = 20;
            while (WEBAudio.audioCache.length < audioCacheSize) {
              var audio = new Audio();
              audio.autoplay = false;
              WEBAudio.audioCache.push(audio);
            }
          } catch (e) {}
        };
        window.addEventListener("mousedown", _userEventCallback);
        window.addEventListener("touchstart", _userEventCallback);
        Module.deinitializers.push(function () {
          window.removeEventListener("mousedown", _userEventCallback);
          window.removeEventListener("touchstart", _userEventCallback);
        });
      } catch (e) {
        alert("Web Audio API is not supported in this browser");
      }
    }
    function jsAudioCreateUncompressedSoundClipFromCompressedAudio(audioData) {
      var soundClip = jsAudioCreateUncompressedSoundClip(null, false);
      WEBAudio.audioContext.decodeAudioData(
        audioData,
        function (_buffer) {
          soundClip.buffer = _buffer;
        },
        function (_error) {
          soundClip.error = true;
          console.log("Decode error: " + _error);
        }
      );
      return soundClip;
    }
    function jsAudioAddPendingBlockedAudio(sourceNode, offset) {
      WEBAudio.pendingAudioSources[sourceNode.mediaElement.src] = {
        sourceNode: sourceNode,
        offset: offset,
      };
    }
    function jsAudioGetMimeTypeFromType(fmodSoundType) {
      switch (fmodSoundType) {
        case 13:
          return "audio/mpeg";
        case 20:
          return "audio/wav";
        default:
          return "audio/mp4";
      }
    }
    function jsAudioCreateCompressedSoundClip(audioData, fmodSoundType) {
      var mimeType = jsAudioGetMimeTypeFromType(fmodSoundType);
      var blob = new Blob([audioData], { type: mimeType });
      var soundClip = {
        url: URL.createObjectURL(blob),
        error: false,
        mediaElement: new Audio(),
      };
      soundClip.mediaElement.preload = "metadata";
      soundClip.mediaElement.src = soundClip.url;
      soundClip.release = function () {
        if (!this.mediaElement) {
          return;
        }
        this.mediaElement.src = "";
        URL.revokeObjectURL(this.url);
        delete this.mediaElement;
        delete this.url;
      };
      soundClip.getLength = function () {
        return this.mediaElement.duration * 44100;
      };
      soundClip.getData = function (ptr, length) {
        console.warn("getData() is not supported for compressed sound.");
        return 0;
      };
      soundClip.getNumberOfChannels = function () {
        console.warn(
          "getNumberOfChannels() is not supported for compressed sound."
        );
        return 0;
      };
      soundClip.getFrequency = function () {
        console.warn("getFrequency() is not supported for compressed sound.");
        return 0;
      };
      soundClip.createSourceNode = function () {
        var self = this;
        var mediaElement = WEBAudio.audioCache.length
          ? WEBAudio.audioCache.pop()
          : new Audio();
        mediaElement.preload = "metadata";
        mediaElement.src = this.url;
        var source =
          WEBAudio.audioContext.createMediaElementSource(mediaElement);
        Object.defineProperty(source, "loop", {
          get: function () {
            return source.mediaElement.loop;
          },
          set: function (v) {
            if (source.mediaElement.loop !== v) source.mediaElement.loop = v;
          },
        });
        source.playbackRate = {};
        Object.defineProperty(source.playbackRate, "value", {
          get: function () {
            return source.mediaElement.playbackRate;
          },
          set: function (v) {
            if (source.mediaElement.playbackRate !== v)
              source.mediaElement.playbackRate = v;
          },
        });
        Object.defineProperty(source, "currentTime", {
          get: function () {
            return source.mediaElement.currentTime;
          },
          set: function (v) {
            if (source.mediaElement.currentTime !== v)
              source.mediaElement.currentTime = v;
          },
        });
        Object.defineProperty(source, "mute", {
          get: function () {
            return source.mediaElement.mute;
          },
          set: function (v) {
            if (source.mediaElement.mute !== v) source.mediaElement.mute = v;
          },
        });
        Object.defineProperty(source, "onended", {
          get: function () {
            return source.mediaElement.onended;
          },
          set: function (onended) {
            source.mediaElement.onended = onended;
          },
        });
        source.playPromise = null;
        source.playTimeout = null;
        source.pauseRequested = false;
        source.isStopped = false;
        source._pauseMediaElement = function () {
          if (source.playPromise || source.playTimeout) {
            source.pauseRequested = true;
          } else {
            source.mediaElement.pause();
          }
        };
        source._startPlayback = function (offset) {
          if (source.playPromise || source.playTimeout) {
            source.mediaElement.currentTime = offset;
            source.pauseRequested = false;
            return;
          }
          source.mediaElement.currentTime = offset;
          source.playPromise = source.mediaElement.play();
          if (source.playPromise) {
            source.playPromise
              .then(function () {
                if (source.pauseRequested) {
                  source.mediaElement.pause();
                  source.pauseRequested = false;
                }
                source.playPromise = null;
              })
              .catch(function (error) {
                source.playPromise = null;
                if (error.name !== "NotAllowedError") throw error;
                jsAudioAddPendingBlockedAudio(source, offset);
              });
          }
        };
        source.start = function (startTime, offset) {
          if (typeof startTime === "undefined") {
            startTime = WEBAudio.audioContext.currentTime;
          }
          if (typeof offset === "undefined") {
            offset = 0;
          }
          var startDelayThresholdMS = 4;
          var startDelayMS =
            (startTime - WEBAudio.audioContext.currentTime) * 1e3;
          if (startDelayMS > startDelayThresholdMS) {
            source.playTimeout = setTimeout(function () {
              source.playTimeout = null;
              source._startPlayback(offset);
            }, startDelayMS);
          } else {
            source._startPlayback(offset);
          }
        };
        source.stop = function (stopTime) {
          if (typeof stopTime === "undefined") {
            stopTime = WEBAudio.audioContext.currentTime;
          }
          var stopDelayThresholdMS = 4;
          var stopDelayMS =
            (stopTime - WEBAudio.audioContext.currentTime) * 1e3;
          if (stopDelayMS > stopDelayThresholdMS) {
            setTimeout(function () {
              source._pauseMediaElement();
              source.isStopped = true;
            }, stopDelayMS);
          } else {
            source._pauseMediaElement();
            source.isStopped = true;
          }
        };
        jsAudioMixinSetPitch(source);
        return source;
      };
      return soundClip;
    }
    function _JS_Sound_Load(ptr, length, decompress, fmodSoundType) {
      if (WEBAudio.audioWebEnabled == 0) return 0;
      ptr = ptr;
      var audioData = HEAPU8.buffer.slice(ptr, ptr + length);
      if (length < 131072) decompress = 1;
      var sound;
      if (decompress) {
        sound =
          jsAudioCreateUncompressedSoundClipFromCompressedAudio(audioData);
      } else {
        sound = jsAudioCreateCompressedSoundClip(audioData, fmodSoundType);
      }
      WEBAudio.audioInstances[++WEBAudio.audioInstanceIdCounter] = sound;
      return WEBAudio.audioInstanceIdCounter;
    }
    function jsAudioCreateUncompressedSoundClipFromPCM(
      channels,
      length,
      sampleRate,
      ptr
    ) {
      var buffer = WEBAudio.audioContext.createBuffer(
        channels,
        length,
        sampleRate
      );
      var idx = ptr >> 2;
      for (var i = 0; i < channels; i++) {
        var offs = idx + length * i;
        var copyToChannel =
          buffer["copyToChannel"] ||
          function (source, channelNumber, startInChannel) {
            var clipped = source.subarray(
              0,
              Math.min(source.length, this.length - (startInChannel | 0))
            );
            this.getChannelData(channelNumber | 0).set(
              clipped,
              startInChannel | 0
            );
          };
        copyToChannel.apply(buffer, [
          HEAPF32.subarray(offs, offs + length),
          i,
          0,
        ]);
      }
      return jsAudioCreateUncompressedSoundClip(buffer, false);
    }
    function _JS_Sound_Load_PCM(channels, length, sampleRate, ptr) {
      if (WEBAudio.audioWebEnabled == 0) return 0;
      var sound = jsAudioCreateUncompressedSoundClipFromPCM(
        channels,
        length,
        sampleRate,
        ptr
      );
      WEBAudio.audioInstances[++WEBAudio.audioInstanceIdCounter] = sound;
      return WEBAudio.audioInstanceIdCounter;
    }
    function _JS_Sound_Play(bufferInstance, channelInstance, offset, delay) {
      if (WEBAudio.audioWebEnabled == 0) return;
      _JS_Sound_Stop(channelInstance, 0);
      var soundClip = WEBAudio.audioInstances[bufferInstance];
      var channel = WEBAudio.audioInstances[channelInstance];
      if (!soundClip) {
        console.log("Trying to play sound which is not loaded.");
        return;
      }
      try {
        channel.playSoundClip(
          soundClip,
          WEBAudio.audioContext.currentTime + delay,
          offset
        );
      } catch (error) {
        console.error("playSoundClip error. Exception: " + e);
      }
    }
    function _JS_Sound_ReleaseInstance(instance) {
      var object = WEBAudio.audioInstances[instance];
      if (object) {
        object.release();
      }
      delete WEBAudio.audioInstances[instance];
    }
    function _JS_Sound_ResumeIfNeeded() {
      if (WEBAudio.audioWebEnabled == 0) return;
      if (WEBAudio.audioContext.state === "suspended")
        WEBAudio.audioContext.resume().catch(function (error) {
          console.warn("Could not resume audio context. Exception: " + error);
        });
    }
    function _JS_Sound_Set3D(channelInstance, spatialBlendLevel) {
      var channel = WEBAudio.audioInstances[channelInstance];
      channel.set3D(spatialBlendLevel);
    }
    function _JS_Sound_SetListenerOrientation(x, y, z, xUp, yUp, zUp) {
      if (WEBAudio.audioWebEnabled == 0) return;
      x = -x;
      y = -y;
      z = -z;
      var l = WEBAudio.audioContext.listener;
      if (l.forwardX) {
        if (l.forwardX.value !== x) l.forwardX.value = x;
        if (l.forwardY.value !== y) l.forwardY.value = y;
        if (l.forwardZ.value !== z) l.forwardZ.value = z;
        if (l.upX.value !== xUp) l.upX.value = xUp;
        if (l.upY.value !== yUp) l.upY.value = yUp;
        if (l.upZ.value !== zUp) l.upZ.value = zUp;
      } else if (
        l._forwardX !== x ||
        l._forwardY !== y ||
        l._forwardZ !== z ||
        l._upX !== xUp ||
        l._upY !== yUp ||
        l._upZ !== zUp
      ) {
        l.setOrientation(x, y, z, xUp, yUp, zUp);
        l._forwardX = x;
        l._forwardY = y;
        l._forwardZ = z;
        l._upX = xUp;
        l._upY = yUp;
        l._upZ = zUp;
      }
    }
    function _JS_Sound_SetListenerPosition(x, y, z) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var l = WEBAudio.audioContext.listener;
      if (l.positionX) {
        if (l.positionX.value !== x) l.positionX.value = x;
        if (l.positionY.value !== y) l.positionY.value = y;
        if (l.positionZ.value !== z) l.positionZ.value = z;
      } else if (
        l._positionX !== x ||
        l._positionY !== y ||
        l._positionZ !== z
      ) {
        l.setPosition(x, y, z);
        l._positionX = x;
        l._positionY = y;
        l._positionZ = z;
      }
    }
    function _JS_Sound_SetLoop(channelInstance, loop) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var channel = WEBAudio.audioInstances[channelInstance];
      channel.setLoop(loop);
    }
    function _JS_Sound_SetLoopPoints(channelInstance, loopStart, loopEnd) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var channel = WEBAudio.audioInstances[channelInstance];
      channel.setLoopPoints(loopStart, loopEnd);
    }
    function _JS_Sound_SetPaused(channelInstance, paused) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var channel = WEBAudio.audioInstances[channelInstance];
      if (paused != channel.isPaused()) {
        if (paused) channel.pause();
        else channel.resume();
      }
    }
    function _JS_Sound_SetPitch(channelInstance, v) {
      if (WEBAudio.audioWebEnabled == 0) return;
      try {
        var channel = WEBAudio.audioInstances[channelInstance];
        channel.setPitch(v);
      } catch (e) {
        console.error(
          "JS_Sound_SetPitch(channel=" +
            channelInstance +
            ", pitch=" +
            v +
            ") threw an exception: " +
            e
        );
      }
    }
    function _JS_Sound_SetPosition(channelInstance, x, y, z) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var channel = WEBAudio.audioInstances[channelInstance];
      channel.setPosition(x, y, z);
    }
    function _JS_Sound_SetVolume(channelInstance, v) {
      if (WEBAudio.audioWebEnabled == 0) return;
      try {
        var channel = WEBAudio.audioInstances[channelInstance];
        channel.setVolume(v);
      } catch (e) {
        console.error(
          "JS_Sound_SetVolume(channel=" +
            channelInstance +
            ", volume=" +
            v +
            ") threw an exception: " +
            e
        );
      }
    }
    function _JS_Sound_Stop(channelInstance, delay) {
      if (WEBAudio.audioWebEnabled == 0) return;
      var channel = WEBAudio.audioInstances[channelInstance];
      channel.stop(delay);
    }
    function _JS_SystemInfo_GetCanvasClientSize(
      domElementSelector,
      outWidth,
      outHeight
    ) {
      var selector = UTF8ToString(domElementSelector);
      var canvas =
        selector == "#canvas"
          ? Module["canvas"]
          : document.querySelector(selector);
      var w = 0,
        h = 0;
      if (canvas) {
        var size = canvas.getBoundingClientRect();
        w = size.width;
        h = size.height;
      }
      outWidth = outWidth >>= 3;
      outHeight = outHeight >>= 3;
      HEAPF64[outWidth] = w;
      HEAPF64[outHeight] = h;
    }
    function _JS_SystemInfo_GetDocumentURL(buffer, bufferSize) {
      if (buffer) stringToUTF8(document.URL, buffer, bufferSize);
      return lengthBytesUTF8(document.URL);
    }
    function _JS_SystemInfo_GetGPUInfo(buffer, bufferSize) {
      var gpuinfo = Module.SystemInfo.gpu;
      if (buffer) stringToUTF8(gpuinfo, buffer, bufferSize);
      return lengthBytesUTF8(gpuinfo);
    }
    function _JS_SystemInfo_GetMatchWebGLToCanvasSize() {
      return (
        Module.matchWebGLToCanvasSize ||
        Module.matchWebGLToCanvasSize === undefined
      );
    }
    function _JS_SystemInfo_GetOS(buffer, bufferSize) {
      var browser = Module.SystemInfo.os + " " + Module.SystemInfo.osVersion;
      if (buffer) stringToUTF8(browser, buffer, bufferSize);
      return lengthBytesUTF8(browser);
    }
    function _JS_SystemInfo_GetPreferredDevicePixelRatio() {
      return Module.matchWebGLToCanvasSize == false
        ? 1
        : Module.devicePixelRatio || window.devicePixelRatio || 1;
    }
    function _JS_SystemInfo_GetScreenSize(outWidth, outHeight) {
      outWidth = outWidth >>= 3;
      outHeight = outHeight >>= 3;
      HEAPF64[outWidth] = Module.SystemInfo.width;
      HEAPF64[outHeight] = Module.SystemInfo.height;
    }
    function _JS_SystemInfo_HasAstcHdr() {
      var ext = GLctx.getExtension("WEBGL_compressed_texture_astc");
      if (ext && ext.getSupportedProfiles) {
        return ext.getSupportedProfiles().includes("hdr");
      }
      return false;
    }
    function _JS_SystemInfo_HasCursorLock() {
      return Module.SystemInfo.hasCursorLock;
    }
    function _JS_SystemInfo_HasFullscreen() {
      return Module.SystemInfo.hasFullscreen;
    }
    function _JS_SystemInfo_HasWebGL() {
      return Module.SystemInfo.hasWebGL;
    }
    function _JS_SystemInfo_HasWebGPU() {
      return Module.SystemInfo.hasWebGPU;
    }
    function _JS_UnityEngineShouldQuit() {
      return !!Module.shouldQuit;
    }
    var activeWebCams = {};
    function _JS_WebCamVideo_GetNativeHeight(deviceId) {
      return (
        activeWebCams[deviceId] && activeWebCams[deviceId].video.videoHeight
      );
    }
    function _JS_WebCamVideo_GetNativeWidth(deviceId) {
      return (
        activeWebCams[deviceId] && activeWebCams[deviceId].video.videoWidth
      );
    }
    function _JS_WebCamVideo_GrabFrame(
      deviceId,
      buffer,
      destWidth,
      destHeight
    ) {
      var webcam = activeWebCams[deviceId];
      if (!webcam) return;
      var timeNow = performance.now();
      if (timeNow < webcam.nextFrameAvailableTime) {
        return;
      }
      webcam.nextFrameAvailableTime += webcam.frameLengthInMsecs;
      if (webcam.nextFrameAvailableTime < timeNow) {
        webcam.nextFrameAvailableTime = timeNow + webcam.frameLengthInMsecs;
      }
      var canvas = webcam.canvas;
      if (
        canvas.width != destWidth ||
        canvas.height != destHeight ||
        !webcam.context2d
      ) {
        canvas.width = destWidth;
        canvas.height = destHeight;
        webcam.context2d = canvas.getContext("2d");
      }
      var context = webcam.context2d;
      context.drawImage(
        webcam.video,
        0,
        0,
        webcam.video.videoWidth,
        webcam.video.videoHeight,
        0,
        0,
        destWidth,
        destHeight
      );
      HEAPU8.set(
        context.getImageData(0, 0, destWidth, destHeight).data,
        buffer
      );
      return 1;
    }
    function _JS_WebGPU_SetCommandEncoder(encoder) {
      Module["WebGPU"].commandEncoder = encoder;
    }
    var wgpu = {};
    function _JS_WebGPU_Setup(adapter, device) {
      Module["WebGPU"] = {};
      Module["WebGPU"].adapter = wgpu[adapter];
      Module["WebGPU"].device = wgpu[device];
    }
    var exceptionCaught = [];
    var uncaughtExceptionCount = 0;
    function ___cxa_begin_catch(ptr) {
      var info = new ExceptionInfo(ptr);
      if (!info.get_caught()) {
        info.set_caught(true);
        uncaughtExceptionCount--;
      }
      info.set_rethrown(false);
      exceptionCaught.push(info);
      ___cxa_increment_exception_refcount(info.excPtr);
      return info.get_exception_ptr();
    }
    var exceptionLast = 0;
    function ___cxa_end_catch() {
      _setThrew(0);
      var info = exceptionCaught.pop();
      ___cxa_decrement_exception_refcount(info.excPtr);
      exceptionLast = 0;
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
      this.set_type = function (type) {
        HEAPU32[(this.ptr + 4) >> 2] = type;
      };
      this.get_type = function () {
        return HEAPU32[(this.ptr + 4) >> 2];
      };
      this.set_destructor = function (destructor) {
        HEAPU32[(this.ptr + 8) >> 2] = destructor;
      };
      this.get_destructor = function () {
        return HEAPU32[(this.ptr + 8) >> 2];
      };
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(this.ptr + 12) >> 0] = caught;
      };
      this.get_caught = function () {
        return HEAP8[(this.ptr + 12) >> 0] != 0;
      };
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(this.ptr + 13) >> 0] = rethrown;
      };
      this.get_rethrown = function () {
        return HEAP8[(this.ptr + 13) >> 0] != 0;
      };
      this.init = function (type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
      };
      this.set_adjusted_ptr = function (adjustedPtr) {
        HEAPU32[(this.ptr + 16) >> 2] = adjustedPtr;
      };
      this.get_adjusted_ptr = function () {
        return HEAPU32[(this.ptr + 16) >> 2];
      };
      this.get_exception_ptr = function () {
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
          return HEAPU32[this.excPtr >> 2];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.excPtr;
      };
    }
    function ___resumeException(ptr) {
      if (!exceptionLast) {
        exceptionLast = ptr;
      }
      throw exceptionLast;
    }
    function ___cxa_find_matching_catch() {
      var thrown = exceptionLast;
      if (!thrown) {
        setTempRet0(0);
        return 0;
      }
      var info = new ExceptionInfo(thrown);
      info.set_adjusted_ptr(thrown);
      var thrownType = info.get_type();
      if (!thrownType) {
        setTempRet0(0);
        return thrown;
      }
      for (var i = 0; i < arguments.length; i++) {
        var caughtType = arguments[i];
        if (caughtType === 0 || caughtType === thrownType) {
          break;
        }
        var adjusted_ptr_addr = info.ptr + 16;
        if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
          setTempRet0(caughtType);
          return thrown;
        }
      }
      setTempRet0(thrownType);
      return thrown;
    }
    var ___cxa_find_matching_catch_2 = ___cxa_find_matching_catch;
    var ___cxa_find_matching_catch_3 = ___cxa_find_matching_catch;
    var ___cxa_find_matching_catch_4 = ___cxa_find_matching_catch;
    function ___cxa_rethrow() {
      var info = exceptionCaught.pop();
      if (!info) {
        abort("no exception to throw");
      }
      var ptr = info.excPtr;
      if (!info.get_rethrown()) {
        exceptionCaught.push(info);
        info.set_rethrown(true);
        info.set_caught(false);
        uncaughtExceptionCount++;
      }
      exceptionLast = ptr;
      throw exceptionLast;
    }
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw exceptionLast;
    }
    function ___cxa_uncaught_exceptions() {
      return uncaughtExceptionCount;
    }
    function ___syscall__newselect(
      nfds,
      readfds,
      writefds,
      exceptfds,
      timeout
    ) {
      try {
        var total = 0;
        var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0,
          srcReadHigh = readfds ? HEAP32[(readfds + 4) >> 2] : 0;
        var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0,
          srcWriteHigh = writefds ? HEAP32[(writefds + 4) >> 2] : 0;
        var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0,
          srcExceptHigh = exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0;
        var dstReadLow = 0,
          dstReadHigh = 0;
        var dstWriteLow = 0,
          dstWriteHigh = 0;
        var dstExceptLow = 0,
          dstExceptHigh = 0;
        var allLow =
          (readfds ? HEAP32[readfds >> 2] : 0) |
          (writefds ? HEAP32[writefds >> 2] : 0) |
          (exceptfds ? HEAP32[exceptfds >> 2] : 0);
        var allHigh =
          (readfds ? HEAP32[(readfds + 4) >> 2] : 0) |
          (writefds ? HEAP32[(writefds + 4) >> 2] : 0) |
          (exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0);
        var check = function (fd, low, high, val) {
          return fd < 32 ? low & val : high & val;
        };
        for (var fd = 0; fd < nfds; fd++) {
          var mask = 1 << fd % 32;
          if (!check(fd, allLow, allHigh, mask)) {
            continue;
          }
          var stream = SYSCALLS.getStreamFromFD(fd);
          var flags = SYSCALLS.DEFAULT_POLLMASK;
          if (stream.stream_ops.poll) {
            flags = stream.stream_ops.poll(stream);
          }
          if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
            fd < 32
              ? (dstReadLow = dstReadLow | mask)
              : (dstReadHigh = dstReadHigh | mask);
            total++;
          }
          if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
            fd < 32
              ? (dstWriteLow = dstWriteLow | mask)
              : (dstWriteHigh = dstWriteHigh | mask);
            total++;
          }
          if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
            fd < 32
              ? (dstExceptLow = dstExceptLow | mask)
              : (dstExceptHigh = dstExceptHigh | mask);
            total++;
          }
        }
        if (readfds) {
          HEAP32[readfds >> 2] = dstReadLow;
          HEAP32[(readfds + 4) >> 2] = dstReadHigh;
        }
        if (writefds) {
          HEAP32[writefds >> 2] = dstWriteLow;
          HEAP32[(writefds + 4) >> 2] = dstWriteHigh;
        }
        if (exceptfds) {
          HEAP32[exceptfds >> 2] = dstExceptLow;
          HEAP32[(exceptfds + 4) >> 2] = dstExceptHigh;
        }
        return total;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_chmod(path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        FS.chmod(path, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    var SOCKFS = {
      mount: function (mount) {
        Module["websocket"] =
          Module["websocket"] && "object" === typeof Module["websocket"]
            ? Module["websocket"]
            : {};
        Module["websocket"]._callbacks = {};
        Module["websocket"]["on"] = function (event, callback) {
          if ("function" === typeof callback) {
            this._callbacks[event] = callback;
          }
          return this;
        };
        Module["websocket"].emit = function (event, param) {
          if ("function" === typeof this._callbacks[event]) {
            this._callbacks[event].call(this, param);
          }
        };
        return FS.createNode(null, "/", 16384 | 511, 0);
      },
      createSocket: function (family, type, protocol) {
        type &= ~526336;
        var streaming = type == 1;
        if (streaming && protocol && protocol != 6) {
          throw new FS.ErrnoError(66);
        }
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          error: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops,
        };
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: 2,
          seekable: false,
          stream_ops: SOCKFS.stream_ops,
        });
        sock.stream = stream;
        return sock;
      },
      getSocket: function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },
      stream_ops: {
        poll: function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },
        ioctl: function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },
        read: function (stream, buffer, offset, length, position) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },
        write: function (stream, buffer, offset, length, position) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },
        close: function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        },
      },
      nextname: function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return "socket[" + SOCKFS.nextname.current++ + "]";
      },
      websocket_sock_ops: {
        createPeer: function (sock, addr, port) {
          var ws;
          if (typeof addr == "object") {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            } else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error(
                  "WebSocket URL must be in the format ws(s)://address:port"
                );
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            try {
              var runtimeConfig =
                Module["websocket"] && "object" === typeof Module["websocket"];
              var url = "ws:#".replace("#", "//");
              if (runtimeConfig) {
                if ("string" === typeof Module["websocket"]["url"]) {
                  url = Module["websocket"]["url"];
                }
              }
              if (url === "ws://" || url === "wss://") {
                var parts = addr.split("/");
                url =
                  url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
              }
              var subProtocols = "binary";
              if (runtimeConfig) {
                if ("string" === typeof Module["websocket"]["subprotocol"]) {
                  subProtocols = Module["websocket"]["subprotocol"];
                }
              }
              var opts = undefined;
              if (subProtocols !== "null") {
                subProtocols = subProtocols
                  .replace(/^ +| +$/g, "")
                  .split(/ *, */);
                opts = subProtocols;
              }
              if (
                runtimeConfig &&
                null === Module["websocket"]["subprotocol"]
              ) {
                subProtocols = "null";
                opts = undefined;
              }
              var WebSocketConstructor;
              {
                WebSocketConstructor = WebSocket;
              }
              ws = new WebSocketConstructor(url, opts);
              ws.binaryType = "arraybuffer";
            } catch (e) {
              throw new FS.ErrnoError(23);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: [],
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          if (sock.type === 2 && typeof sock.sport != "undefined") {
            peer.dgram_send_queue.push(
              new Uint8Array([
                255,
                255,
                255,
                255,
                "p".charCodeAt(0),
                "o".charCodeAt(0),
                "r".charCodeAt(0),
                "t".charCodeAt(0),
                (sock.sport & 65280) >> 8,
                sock.sport & 255,
              ])
            );
          }
          return peer;
        },
        getPeer: function (sock, addr, port) {
          return sock.peers[addr + ":" + port];
        },
        addPeer: function (sock, peer) {
          sock.peers[peer.addr + ":" + peer.port] = peer;
        },
        removePeer: function (sock, peer) {
          delete sock.peers[peer.addr + ":" + peer.port];
        },
        handlePeerEvents: function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            Module["websocket"].emit("open", sock.stream.fd);
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              peer.socket.close();
            }
          };
          function handleMessage(data) {
            if (typeof data == "string") {
              var encoder = new TextEncoder();
              data = encoder.encode(data);
            } else {
              assert(data.byteLength !== undefined);
              if (data.byteLength == 0) {
                return;
              }
              data = new Uint8Array(data);
            }
            var wasfirst = first;
            first = false;
            if (
              wasfirst &&
              data.length === 10 &&
              data[0] === 255 &&
              data[1] === 255 &&
              data[2] === 255 &&
              data[3] === 255 &&
              data[4] === "p".charCodeAt(0) &&
              data[5] === "o".charCodeAt(0) &&
              data[6] === "r".charCodeAt(0) &&
              data[7] === "t".charCodeAt(0)
            ) {
              var newport = (data[8] << 8) | data[9];
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({
              addr: peer.addr,
              port: peer.port,
              data: data,
            });
            Module["websocket"].emit("message", sock.stream.fd);
          }
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on("open", handleOpen);
            peer.socket.on("message", function (data, isBinary) {
              if (!isBinary) {
                return;
              }
              handleMessage(new Uint8Array(data).buffer);
            });
            peer.socket.on("close", function () {
              Module["websocket"].emit("close", sock.stream.fd);
            });
            peer.socket.on("error", function (error) {
              sock.error = 14;
              Module["websocket"].emit("error", [
                sock.stream.fd,
                sock.error,
                "ECONNREFUSED: Connection refused",
              ]);
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function () {
              Module["websocket"].emit("close", sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function (error) {
              sock.error = 14;
              Module["websocket"].emit("error", [
                sock.stream.fd,
                sock.error,
                "ECONNREFUSED: Connection refused",
              ]);
            };
          }
        },
        poll: function (sock) {
          if (sock.type === 1 && sock.server) {
            return sock.pending.length ? 64 | 1 : 0;
          }
          var mask = 0;
          var dest =
            sock.type === 1
              ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
              : null;
          if (
            sock.recv_queue.length ||
            !dest ||
            (dest && dest.socket.readyState === dest.socket.CLOSING) ||
            (dest && dest.socket.readyState === dest.socket.CLOSED)
          ) {
            mask |= 64 | 1;
          }
          if (!dest || (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if (
            (dest && dest.socket.readyState === dest.socket.CLOSING) ||
            (dest && dest.socket.readyState === dest.socket.CLOSED)
          ) {
            mask |= 16;
          }
          return mask;
        },
        ioctl: function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[arg >> 2] = bytes;
              return 0;
            default:
              return 28;
          }
        },
        close: function (sock) {
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {}
            sock.server = null;
          }
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {}
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },
        bind: function (sock, addr, port) {
          if (
            typeof sock.saddr != "undefined" ||
            typeof sock.sport != "undefined"
          ) {
            throw new FS.ErrnoError(28);
          }
          sock.saddr = addr;
          sock.sport = port;
          if (sock.type === 2) {
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e.name === "ErrnoError")) throw e;
              if (e.errno !== 138) throw e;
            }
          }
        },
        connect: function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(138);
          }
          if (
            typeof sock.daddr != "undefined" &&
            typeof sock.dport != "undefined"
          ) {
            var dest = SOCKFS.websocket_sock_ops.getPeer(
              sock,
              sock.daddr,
              sock.dport
            );
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(7);
              } else {
                throw new FS.ErrnoError(30);
              }
            }
          }
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          throw new FS.ErrnoError(26);
        },
        listen: function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(138);
          }
        },
        accept: function (listensock) {
          if (!listensock.server || !listensock.pending.length) {
            throw new FS.ErrnoError(28);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },
        getname: function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(53);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },
        sendmsg: function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(17);
            }
          } else {
            addr = sock.daddr;
            port = sock.dport;
          }
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          if (sock.type === 1) {
            if (
              !dest ||
              dest.socket.readyState === dest.socket.CLOSING ||
              dest.socket.readyState === dest.socket.CLOSED
            ) {
              throw new FS.ErrnoError(53);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(6);
            }
          }
          if (ArrayBuffer.isView(buffer)) {
            offset += buffer.byteOffset;
            buffer = buffer.buffer;
          }
          var data;
          data = buffer.slice(offset, offset + length);
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              if (
                !dest ||
                dest.socket.readyState === dest.socket.CLOSING ||
                dest.socket.readyState === dest.socket.CLOSED
              ) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(28);
          }
        },
        recvmsg: function (sock, length) {
          if (sock.type === 1 && sock.server) {
            throw new FS.ErrnoError(53);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(
                sock,
                sock.daddr,
                sock.dport
              );
              if (!dest) {
                throw new FS.ErrnoError(53);
              }
              if (
                dest.socket.readyState === dest.socket.CLOSING ||
                dest.socket.readyState === dest.socket.CLOSED
              ) {
                return null;
              }
              throw new FS.ErrnoError(6);
            }
            throw new FS.ErrnoError(6);
          }
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port,
          };
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(
              queuedBuffer,
              queuedOffset + bytesRead,
              bytesRemaining
            );
            sock.recv_queue.unshift(queued);
          }
          return res;
        },
      },
    };
    function getSocketFromFD(fd) {
      var socket = SOCKFS.getSocket(fd);
      if (!socket) throw new FS.ErrnoError(8);
      return socket;
    }
    function setErrNo(value) {
      HEAP32[___errno_location() >> 2] = value;
      return value;
    }
    function inetNtop4(addr) {
      return (
        (addr & 255) +
        "." +
        ((addr >> 8) & 255) +
        "." +
        ((addr >> 16) & 255) +
        "." +
        ((addr >> 24) & 255)
      );
    }
    function inetNtop6(ints) {
      var str = "";
      var word = 0;
      var longest = 0;
      var lastzero = 0;
      var zstart = 0;
      var len = 0;
      var i = 0;
      var parts = [
        ints[0] & 65535,
        ints[0] >> 16,
        ints[1] & 65535,
        ints[1] >> 16,
        ints[2] & 65535,
        ints[2] >> 16,
        ints[3] & 65535,
        ints[3] >> 16,
      ];
      var hasipv4 = true;
      var v4part = "";
      for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) {
          hasipv4 = false;
          break;
        }
      }
      if (hasipv4) {
        v4part = inetNtop4(parts[6] | (parts[7] << 16));
        if (parts[5] === -1) {
          str = "::ffff:";
          str += v4part;
          return str;
        }
        if (parts[5] === 0) {
          str = "::";
          if (v4part === "0.0.0.0") v4part = "";
          if (v4part === "0.0.0.1") v4part = "1";
          str += v4part;
          return str;
        }
      }
      for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
          if (word - lastzero > 1) {
            len = 0;
          }
          lastzero = word;
          len++;
        }
        if (len > longest) {
          longest = len;
          zstart = word - longest + 1;
        }
      }
      for (word = 0; word < 8; word++) {
        if (longest > 1) {
          if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
            if (word === zstart) {
              str += ":";
              if (zstart === 0) str += ":";
            }
            continue;
          }
        }
        str += Number(_ntohs(parts[word] & 65535)).toString(16);
        str += word < 7 ? ":" : "";
      }
      return str;
    }
    function readSockaddr(sa, salen) {
      var family = HEAP16[sa >> 1];
      var port = _ntohs(HEAPU16[(sa + 2) >> 1]);
      var addr;
      switch (family) {
        case 2:
          if (salen !== 16) {
            return { errno: 28 };
          }
          addr = HEAP32[(sa + 4) >> 2];
          addr = inetNtop4(addr);
          break;
        case 10:
          if (salen !== 28) {
            return { errno: 28 };
          }
          addr = [
            HEAP32[(sa + 8) >> 2],
            HEAP32[(sa + 12) >> 2],
            HEAP32[(sa + 16) >> 2],
            HEAP32[(sa + 20) >> 2],
          ];
          addr = inetNtop6(addr);
          break;
        default:
          return { errno: 5 };
      }
      return { family: family, addr: addr, port: port };
    }
    function inetPton4(str) {
      var b = str.split(".");
      for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp;
      }
      return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
    }
    function jstoi_q(str) {
      return parseInt(str);
    }
    function inetPton6(str) {
      var words;
      var w, offset, z;
      var valid6regx =
        /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
      var parts = [];
      if (!valid6regx.test(str)) {
        return null;
      }
      if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0];
      }
      if (str.startsWith("::")) {
        str = str.replace("::", "Z:");
      } else {
        str = str.replace("::", ":Z:");
      }
      if (str.indexOf(".") > 0) {
        str = str.replace(new RegExp("[.]", "g"), ":");
        words = str.split(":");
        words[words.length - 4] =
          jstoi_q(words[words.length - 4]) +
          jstoi_q(words[words.length - 3]) * 256;
        words[words.length - 3] =
          jstoi_q(words[words.length - 2]) +
          jstoi_q(words[words.length - 1]) * 256;
        words = words.slice(0, words.length - 2);
      } else {
        words = str.split(":");
      }
      offset = 0;
      z = 0;
      for (w = 0; w < words.length; w++) {
        if (typeof words[w] == "string") {
          if (words[w] === "Z") {
            for (z = 0; z < 8 - words.length + 1; z++) {
              parts[w + z] = 0;
            }
            offset = z - 1;
          } else {
            parts[w + offset] = _htons(parseInt(words[w], 16));
          }
        } else {
          parts[w + offset] = words[w];
        }
      }
      return [
        (parts[1] << 16) | parts[0],
        (parts[3] << 16) | parts[2],
        (parts[5] << 16) | parts[4],
        (parts[7] << 16) | parts[6],
      ];
    }
    var DNS = {
      address_map: { id: 1, addrs: {}, names: {} },
      lookup_name: function (name) {
        var res = inetPton4(name);
        if (res !== null) {
          return name;
        }
        res = inetPton6(name);
        if (res !== null) {
          return name;
        }
        var addr;
        if (DNS.address_map.addrs[name]) {
          addr = DNS.address_map.addrs[name];
        } else {
          var id = DNS.address_map.id++;
          assert(id < 65535, "exceeded max address mappings of 65535");
          addr = "172.29." + (id & 255) + "." + (id & 65280);
          DNS.address_map.names[addr] = name;
          DNS.address_map.addrs[name] = addr;
        }
        return addr;
      },
      lookup_addr: function (addr) {
        if (DNS.address_map.names[addr]) {
          return DNS.address_map.names[addr];
        }
        return null;
      },
    };
    function getSocketAddress(addrp, addrlen, allowNull) {
      if (allowNull && addrp === 0) return null;
      var info = readSockaddr(addrp, addrlen);
      if (info.errno) throw new FS.ErrnoError(info.errno);
      info.addr = DNS.lookup_addr(info.addr) || info.addr;
      return info;
    }
    function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
      try {
        var sock = getSocketFromFD(fd);
        var info = getSocketAddress(addr, addrlen);
        sock.sock_ops.connect(sock, info.addr, info.port);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_faccessat(dirfd, path, amode, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -28;
            }
            var newStream;
            newStream = FS.createStream(stream, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 5: {
            var arg = SYSCALLS.get();
            var offset = 0;
            HEAP16[(arg + offset) >> 1] = 2;
            return 0;
          }
          case 6:
          case 7:
            return 0;
          case 16:
          case 8:
            return -28;
          case 9:
            setErrNo(28);
            return -1;
          default: {
            return -28;
          }
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_fstat64(fd, buf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.doStat(FS.stat, stream.path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_getcwd(buf, size) {
      try {
        if (size === 0) return -28;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
        if (size < cwdLengthInBytes) return -68;
        stringToUTF8(cwd, buf, size);
        return cwdLengthInBytes;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_getdents64(fd, dirp, count) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (!stream.getdents) {
          stream.getdents = FS.readdir(stream.path);
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
          var id;
          var type;
          var name = stream.getdents[idx];
          if (name === ".") {
            id = stream.node.id;
            type = 4;
          } else if (name === "..") {
            var lookup = FS.lookupPath(stream.path, { parent: true });
            id = lookup.node.id;
            type = 4;
          } else {
            var child = FS.lookupNode(stream.node, name);
            id = child.id;
            type = FS.isChrdev(child.mode)
              ? 2
              : FS.isDir(child.mode)
              ? 4
              : FS.isLink(child.mode)
              ? 10
              : 8;
          }
          (tempI64 = [
            id >>> 0,
            ((tempDouble = id),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil(
                    (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                  ) >>> 0
              : 0),
          ]),
            (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
            (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
          (tempI64 = [
            ((idx + 1) * struct_size) >>> 0,
            ((tempDouble = (idx + 1) * struct_size),
            +Math.abs(tempDouble) >= 1
              ? tempDouble > 0
                ? +Math.floor(tempDouble / 4294967296) >>> 0
                : ~~+Math.ceil(
                    (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                  ) >>> 0
              : 0),
          ]),
            (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
            (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
          HEAP16[(dirp + pos + 16) >> 1] = 280;
          HEAP8[(dirp + pos + 18) >> 0] = type;
          stringToUTF8(name, dirp + pos + 19, 256);
          pos += struct_size;
          idx += 1;
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509:
          case 21505: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21519: {
            if (!stream.tty) return -59;
            var argp = SYSCALLS.get();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -59;
            return -28;
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21524: {
            if (!stream.tty) return -59;
            return 0;
          }
          default:
            return -28;
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_lstat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.lstat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_mkdirat(dirfd, path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/")
          path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_newfstatat(dirfd, path, buf, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        var allowEmpty = flags & 4096;
        flags = flags & ~6400;
        path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
        return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? SYSCALLS.get() : 0;
        return FS.open(path, flags, mode).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function writeSockaddr(sa, family, addr, port, addrlen) {
      switch (family) {
        case 2:
          addr = inetPton4(addr);
          zeroMemory(sa, 16);
          if (addrlen) {
            HEAP32[addrlen >> 2] = 16;
          }
          HEAP16[sa >> 1] = family;
          HEAP32[(sa + 4) >> 2] = addr;
          HEAP16[(sa + 2) >> 1] = _htons(port);
          break;
        case 10:
          addr = inetPton6(addr);
          zeroMemory(sa, 28);
          if (addrlen) {
            HEAP32[addrlen >> 2] = 28;
          }
          HEAP32[sa >> 2] = family;
          HEAP32[(sa + 8) >> 2] = addr[0];
          HEAP32[(sa + 12) >> 2] = addr[1];
          HEAP32[(sa + 16) >> 2] = addr[2];
          HEAP32[(sa + 20) >> 2] = addr[3];
          HEAP16[(sa + 2) >> 1] = _htons(port);
          break;
        default:
          return 5;
      }
      return 0;
    }
    function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
      try {
        var sock = getSocketFromFD(fd);
        var msg = sock.sock_ops.recvmsg(sock, len);
        if (!msg) return 0;
        if (addr) {
          var errno = writeSockaddr(
            addr,
            sock.family,
            DNS.lookup_name(msg.addr),
            msg.port,
            addrlen
          );
        }
        HEAPU8.set(msg.buffer, buf);
        return msg.buffer.byteLength;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
      try {
        oldpath = SYSCALLS.getStr(oldpath);
        newpath = SYSCALLS.getStr(newpath);
        oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
        newpath = SYSCALLS.calculateAt(newdirfd, newpath);
        FS.rename(oldpath, newpath);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
      try {
        var sock = getSocketFromFD(fd);
        var dest = getSocketAddress(addr, addr_len, true);
        if (!dest) {
          return FS.write(sock.stream, HEAP8, message, length);
        }
        return sock.sock_ops.sendmsg(
          sock,
          HEAP8,
          message,
          length,
          dest.addr,
          dest.port
        );
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_socket(domain, type, protocol) {
      try {
        var sock = SOCKFS.createSocket(domain, type, protocol);
        return sock.stream.fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.doStat(FS.stat, path, buf);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_statfs64(path, size, buf) {
      try {
        path = SYSCALLS.getStr(path);
        HEAP32[(buf + 4) >> 2] = 4096;
        HEAP32[(buf + 40) >> 2] = 4096;
        HEAP32[(buf + 8) >> 2] = 1e6;
        HEAP32[(buf + 12) >> 2] = 5e5;
        HEAP32[(buf + 16) >> 2] = 5e5;
        HEAP32[(buf + 20) >> 2] = FS.nextInode;
        HEAP32[(buf + 24) >> 2] = 1e6;
        HEAP32[(buf + 28) >> 2] = 42;
        HEAP32[(buf + 44) >> 2] = 2;
        HEAP32[(buf + 36) >> 2] = 255;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_symlink(target, linkpath) {
      try {
        target = SYSCALLS.getStr(target);
        linkpath = SYSCALLS.getStr(linkpath);
        FS.symlink(target, linkpath);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function convertI32PairToI53Checked(lo, hi) {
      return (hi + 2097152) >>> 0 < 4194305 - !!lo
        ? (lo >>> 0) + hi * 4294967296
        : NaN;
    }
    function ___syscall_truncate64(path, length_low, length_high) {
      try {
        var length = convertI32PairToI53Checked(length_low, length_high);
        if (isNaN(length)) return -61;
        path = SYSCALLS.getStr(path);
        FS.truncate(path, length);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_unlinkat(dirfd, path, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (flags === 0) {
          FS.unlink(path);
        } else if (flags === 512) {
          FS.rmdir(path);
        } else {
          abort("Invalid flags passed to unlinkat");
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function readI53FromI64(ptr) {
      return HEAPU32[ptr >> 2] + HEAP32[(ptr + 4) >> 2] * 4294967296;
    }
    function ___syscall_utimensat(dirfd, path, times, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path, true);
        if (!times) {
          var atime = Date.now();
          var mtime = atime;
        } else {
          var seconds = readI53FromI64(times);
          var nanoseconds = HEAP32[(times + 8) >> 2];
          atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
          times += 16;
          seconds = readI53FromI64(times);
          nanoseconds = HEAP32[(times + 8) >> 2];
          mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
        }
        FS.utime(path, atime, mtime);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    var nowIsMonotonic = true;
    function __emscripten_get_now_is_monotonic() {
      return nowIsMonotonic;
    }
    function __emscripten_throw_longjmp() {
      throw Infinity;
    }
    function __gmtime_js(time, tmPtr) {
      var date = new Date(readI53FromI64(time) * 1e3);
      HEAP32[tmPtr >> 2] = date.getUTCSeconds();
      HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
      HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
      HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
      HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
      HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
      HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
    }
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var MONTH_DAYS_LEAP_CUMULATIVE = [
      0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335,
    ];
    var MONTH_DAYS_REGULAR_CUMULATIVE = [
      0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
    ];
    function ydayFromDate(date) {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = leap
        ? MONTH_DAYS_LEAP_CUMULATIVE
        : MONTH_DAYS_REGULAR_CUMULATIVE;
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
      return yday;
    }
    function __localtime_js(time, tmPtr) {
      var date = new Date(readI53FromI64(time) * 1e3);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
      HEAP32[(tmPtr + 8) >> 2] = date.getHours();
      HEAP32[(tmPtr + 12) >> 2] = date.getDate();
      HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
      HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
      HEAP32[(tmPtr + 24) >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
      HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst =
        (summerOffset != winterOffset &&
          date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[(tmPtr + 32) >> 2] = dst;
    }
    function __mktime_js(tmPtr) {
      var date = new Date(
        HEAP32[(tmPtr + 20) >> 2] + 1900,
        HEAP32[(tmPtr + 16) >> 2],
        HEAP32[(tmPtr + 12) >> 2],
        HEAP32[(tmPtr + 8) >> 2],
        HEAP32[(tmPtr + 4) >> 2],
        HEAP32[tmPtr >> 2],
        0
      );
      var dst = HEAP32[(tmPtr + 32) >> 2];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset);
      if (dst < 0) {
        HEAP32[(tmPtr + 32) >> 2] = Number(
          summerOffset != winterOffset && dstOffset == guessedOffset
        );
      } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
      }
      HEAP32[(tmPtr + 24) >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
      HEAP32[(tmPtr + 8) >> 2] = date.getHours();
      HEAP32[(tmPtr + 12) >> 2] = date.getDate();
      HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
      HEAP32[(tmPtr + 20) >> 2] = date.getYear();
      return (date.getTime() / 1e3) | 0;
    }
    function __mmap_js(len, prot, flags, fd, off, allocated, addr) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var res = FS.mmap(stream, len, off, prot, flags);
        var ptr = res.ptr;
        HEAP32[allocated >> 2] = res.allocated;
        HEAPU32[addr >> 2] = ptr;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function __munmap_js(addr, len, prot, flags, fd, offset) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (prot & 2) {
          SYSCALLS.doMsync(addr, stream, len, flags, offset);
        }
        FS.munmap(stream);
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function __tzset_js(timezone, daylight, tzname) {
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      }
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = stringToNewUTF8(winterName);
      var summerNamePtr = stringToNewUTF8(summerName);
      if (summerOffset < winterOffset) {
        HEAPU32[tzname >> 2] = winterNamePtr;
        HEAPU32[(tzname + 4) >> 2] = summerNamePtr;
      } else {
        HEAPU32[tzname >> 2] = summerNamePtr;
        HEAPU32[(tzname + 4) >> 2] = winterNamePtr;
      }
    }
    function _abort() {
      abort("");
    }
    function _emscripten_cancel_main_loop() {
      Browser.mainLoop.pause();
      Browser.mainLoop.func = null;
    }
    function _emscripten_clear_interval(id) {
      clearInterval(id);
    }
    function _emscripten_date_now() {
      return Date.now();
    }
    function _emscripten_debugger() {
      debugger;
    }
    function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
    var JSEvents = {
      inEventHandler: 0,
      removeAllEventListeners: function () {
        for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
          JSEvents._removeHandler(i);
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = [];
      },
      registerRemoveEventListeners: function () {
        if (!JSEvents.removeEventListenersRegistered) {
          __ATEXIT__.push(JSEvents.removeAllEventListeners);
          JSEvents.removeEventListenersRegistered = true;
        }
      },
      deferredCalls: [],
      deferCall: function (targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
          if (arrA.length != arrB.length) return false;
          for (var i in arrA) {
            if (arrA[i] != arrB[i]) return false;
          }
          return true;
        }
        for (var i in JSEvents.deferredCalls) {
          var call = JSEvents.deferredCalls[i];
          if (
            call.targetFunction == targetFunction &&
            arraysHaveEqualContent(call.argsList, argsList)
          ) {
            return;
          }
        }
        JSEvents.deferredCalls.push({
          targetFunction: targetFunction,
          precedence: precedence,
          argsList: argsList,
        });
        JSEvents.deferredCalls.sort(function (x, y) {
          return x.precedence < y.precedence;
        });
      },
      removeDeferredCalls: function (targetFunction) {
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
            JSEvents.deferredCalls.splice(i, 1);
            --i;
          }
        }
      },
      canPerformEventHandlerRequests: function () {
        return (
          JSEvents.inEventHandler &&
          JSEvents.currentEventHandler.allowsDeferredCalls
        );
      },
      runDeferredCalls: function () {
        if (!JSEvents.canPerformEventHandlerRequests()) {
          return;
        }
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          var call = JSEvents.deferredCalls[i];
          JSEvents.deferredCalls.splice(i, 1);
          --i;
          call.targetFunction.apply(null, call.argsList);
        }
      },
      eventHandlers: [],
      removeAllHandlersOnTarget: function (target, eventTypeString) {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
          if (
            JSEvents.eventHandlers[i].target == target &&
            (!eventTypeString ||
              eventTypeString == JSEvents.eventHandlers[i].eventTypeString)
          ) {
            JSEvents._removeHandler(i--);
          }
        }
      },
      _removeHandler: function (i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(
          h.eventTypeString,
          h.eventListenerFunc,
          h.useCapture
        );
        JSEvents.eventHandlers.splice(i, 1);
      },
      registerOrRemoveHandler: function (eventHandler) {
        if (!eventHandler.target) {
          return -4;
        }
        var jsEventHandler = function jsEventHandler(event) {
          ++JSEvents.inEventHandler;
          JSEvents.currentEventHandler = eventHandler;
          JSEvents.runDeferredCalls();
          eventHandler.handlerFunc(event);
          JSEvents.runDeferredCalls();
          --JSEvents.inEventHandler;
        };
        if (eventHandler.callbackfunc) {
          eventHandler.eventListenerFunc = jsEventHandler;
          eventHandler.target.addEventListener(
            eventHandler.eventTypeString,
            jsEventHandler,
            eventHandler.useCapture
          );
          JSEvents.eventHandlers.push(eventHandler);
          JSEvents.registerRemoveEventListeners();
        } else {
          for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (
              JSEvents.eventHandlers[i].target == eventHandler.target &&
              JSEvents.eventHandlers[i].eventTypeString ==
                eventHandler.eventTypeString
            ) {
              JSEvents._removeHandler(i--);
            }
          }
        }
        return 0;
      },
      getNodeNameForTarget: function (target) {
        if (!target) return "";
        if (target == window) return "#window";
        if (target == screen) return "#screen";
        return target && target.nodeName ? target.nodeName : "";
      },
      fullscreenEnabled: function () {
        return (
          document.fullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.webkitFullscreenEnabled
        );
      },
    };
    var currentFullscreenStrategy = {};
    function maybeCStringToJsString(cString) {
      return cString > 2 ? UTF8ToString(cString) : cString;
    }
    var specialHTMLTargets = [0, document, window];
    function findEventTarget(target) {
      target = maybeCStringToJsString(target);
      var domElement =
        specialHTMLTargets[target] || document.querySelector(target);
      return domElement;
    }
    function findCanvasEventTarget(target) {
      return findEventTarget(target);
    }
    function _emscripten_get_canvas_element_size(target, width, height) {
      var canvas = findCanvasEventTarget(target);
      if (!canvas) return -4;
      HEAP32[width >> 2] = canvas.width;
      HEAP32[height >> 2] = canvas.height;
    }
    function stringToUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    }
    function getCanvasElementSize(target) {
      return withStackSave(function () {
        var w = stackAlloc(8);
        var h = w + 4;
        var targetInt = stringToUTF8OnStack(target.id);
        var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
        var size = [HEAP32[w >> 2], HEAP32[h >> 2]];
        return size;
      });
    }
    function _emscripten_set_canvas_element_size(target, width, height) {
      var canvas = findCanvasEventTarget(target);
      if (!canvas) return -4;
      canvas.width = width;
      canvas.height = height;
      return 0;
    }
    function setCanvasElementSize(target, width, height) {
      if (!target.controlTransferredOffscreen) {
        target.width = width;
        target.height = height;
      } else {
        withStackSave(function () {
          var targetInt = stringToUTF8OnStack(target.id);
          _emscripten_set_canvas_element_size(targetInt, width, height);
        });
      }
    }
    function registerRestoreOldStyle(canvas) {
      var canvasSize = getCanvasElementSize(canvas);
      var oldWidth = canvasSize[0];
      var oldHeight = canvasSize[1];
      var oldCssWidth = canvas.style.width;
      var oldCssHeight = canvas.style.height;
      var oldBackgroundColor = canvas.style.backgroundColor;
      var oldDocumentBackgroundColor = document.body.style.backgroundColor;
      var oldPaddingLeft = canvas.style.paddingLeft;
      var oldPaddingRight = canvas.style.paddingRight;
      var oldPaddingTop = canvas.style.paddingTop;
      var oldPaddingBottom = canvas.style.paddingBottom;
      var oldMarginLeft = canvas.style.marginLeft;
      var oldMarginRight = canvas.style.marginRight;
      var oldMarginTop = canvas.style.marginTop;
      var oldMarginBottom = canvas.style.marginBottom;
      var oldDocumentBodyMargin = document.body.style.margin;
      var oldDocumentOverflow = document.documentElement.style.overflow;
      var oldDocumentScroll = document.body.scroll;
      var oldImageRendering = canvas.style.imageRendering;
      function restoreOldStyle() {
        var fullscreenElement =
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement;
        if (!fullscreenElement) {
          document.removeEventListener("fullscreenchange", restoreOldStyle);
          document.removeEventListener("mozfullscreenchange", restoreOldStyle);
          document.removeEventListener(
            "webkitfullscreenchange",
            restoreOldStyle
          );
          setCanvasElementSize(canvas, oldWidth, oldHeight);
          canvas.style.width = oldCssWidth;
          canvas.style.height = oldCssHeight;
          canvas.style.backgroundColor = oldBackgroundColor;
          if (!oldDocumentBackgroundColor)
            document.body.style.backgroundColor = "white";
          document.body.style.backgroundColor = oldDocumentBackgroundColor;
          canvas.style.paddingLeft = oldPaddingLeft;
          canvas.style.paddingRight = oldPaddingRight;
          canvas.style.paddingTop = oldPaddingTop;
          canvas.style.paddingBottom = oldPaddingBottom;
          canvas.style.marginLeft = oldMarginLeft;
          canvas.style.marginRight = oldMarginRight;
          canvas.style.marginTop = oldMarginTop;
          canvas.style.marginBottom = oldMarginBottom;
          document.body.style.margin = oldDocumentBodyMargin;
          document.documentElement.style.overflow = oldDocumentOverflow;
          document.body.scroll = oldDocumentScroll;
          canvas.style.imageRendering = oldImageRendering;
          if (canvas.GLctxObject)
            canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
          if (currentFullscreenStrategy.canvasResizedCallback) {
            ((a1, a2, a3) =>
              dynCall_iiii.apply(null, [
                currentFullscreenStrategy.canvasResizedCallback,
                a1,
                a2,
                a3,
              ]))(
              37,
              0,
              currentFullscreenStrategy.canvasResizedCallbackUserData
            );
          }
        }
      }
      document.addEventListener("fullscreenchange", restoreOldStyle);
      document.addEventListener("mozfullscreenchange", restoreOldStyle);
      document.addEventListener("webkitfullscreenchange", restoreOldStyle);
      return restoreOldStyle;
    }
    function setLetterbox(element, topBottom, leftRight) {
      element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
      element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
    }
    function getBoundingClientRect(e) {
      return specialHTMLTargets.indexOf(e) < 0
        ? e.getBoundingClientRect()
        : { left: 0, top: 0 };
    }
    function JSEvents_resizeCanvasForFullscreen(target, strategy) {
      var restoreOldStyle = registerRestoreOldStyle(target);
      var cssWidth = strategy.softFullscreen ? innerWidth : screen.width;
      var cssHeight = strategy.softFullscreen ? innerHeight : screen.height;
      var rect = getBoundingClientRect(target);
      var windowedCssWidth = rect.width;
      var windowedCssHeight = rect.height;
      var canvasSize = getCanvasElementSize(target);
      var windowedRttWidth = canvasSize[0];
      var windowedRttHeight = canvasSize[1];
      if (strategy.scaleMode == 3) {
        setLetterbox(
          target,
          (cssHeight - windowedCssHeight) / 2,
          (cssWidth - windowedCssWidth) / 2
        );
        cssWidth = windowedCssWidth;
        cssHeight = windowedCssHeight;
      } else if (strategy.scaleMode == 2) {
        if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
          var desiredCssHeight =
            (windowedRttHeight * cssWidth) / windowedRttWidth;
          setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
          cssHeight = desiredCssHeight;
        } else {
          var desiredCssWidth =
            (windowedRttWidth * cssHeight) / windowedRttHeight;
          setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
          cssWidth = desiredCssWidth;
        }
      }
      if (!target.style.backgroundColor) target.style.backgroundColor = "black";
      if (!document.body.style.backgroundColor)
        document.body.style.backgroundColor = "black";
      target.style.width = cssWidth + "px";
      target.style.height = cssHeight + "px";
      if (strategy.filteringMode == 1) {
        target.style.imageRendering = "optimizeSpeed";
        target.style.imageRendering = "-moz-crisp-edges";
        target.style.imageRendering = "-o-crisp-edges";
        target.style.imageRendering = "-webkit-optimize-contrast";
        target.style.imageRendering = "optimize-contrast";
        target.style.imageRendering = "crisp-edges";
        target.style.imageRendering = "pixelated";
      }
      var dpiScale =
        strategy.canvasResolutionScaleMode == 2 ? devicePixelRatio : 1;
      if (strategy.canvasResolutionScaleMode != 0) {
        var newWidth = (cssWidth * dpiScale) | 0;
        var newHeight = (cssHeight * dpiScale) | 0;
        setCanvasElementSize(target, newWidth, newHeight);
        if (target.GLctxObject)
          target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
      }
      return restoreOldStyle;
    }
    function JSEvents_requestFullscreen(target, strategy) {
      if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
        JSEvents_resizeCanvasForFullscreen(target, strategy);
      }
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen();
      } else if (target.mozRequestFullscreen) {
        target.mozRequestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else {
        return JSEvents.fullscreenEnabled() ? -3 : -1;
      }
      currentFullscreenStrategy = strategy;
      if (strategy.canvasResizedCallback) {
        ((a1, a2, a3) =>
          dynCall_iiii.apply(null, [
            strategy.canvasResizedCallback,
            a1,
            a2,
            a3,
          ]))(37, 0, strategy.canvasResizedCallbackUserData);
      }
      return 0;
    }
    function _emscripten_exit_fullscreen() {
      if (!JSEvents.fullscreenEnabled()) return -1;
      JSEvents.removeDeferredCalls(JSEvents_requestFullscreen);
      var d = specialHTMLTargets[1];
      if (d.exitFullscreen) {
        d.fullscreenElement && d.exitFullscreen();
      } else if (d.mozCancelFullScreen) {
        d.mozFullScreenElement && d.mozCancelFullScreen();
      } else if (d.webkitExitFullscreen) {
        d.webkitFullscreenElement && d.webkitExitFullscreen();
      } else {
        return -1;
      }
      return 0;
    }
    function requestPointerLock(target) {
      if (target.requestPointerLock) {
        target.requestPointerLock();
      } else {
        if (document.body.requestPointerLock) {
          return -3;
        }
        return -1;
      }
      return 0;
    }
    function _emscripten_exit_pointerlock() {
      JSEvents.removeDeferredCalls(requestPointerLock);
      if (document.exitPointerLock) {
        document.exitPointerLock();
      } else {
        return -1;
      }
      return 0;
    }
    function fillFullscreenChangeEventData(eventStruct) {
      var fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      var isFullscreen = !!fullscreenElement;
      HEAP32[eventStruct >> 2] = isFullscreen;
      HEAP32[(eventStruct + 4) >> 2] = JSEvents.fullscreenEnabled();
      var reportedElement = isFullscreen
        ? fullscreenElement
        : JSEvents.previousFullscreenElement;
      var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
      var id = reportedElement && reportedElement.id ? reportedElement.id : "";
      stringToUTF8(nodeName, eventStruct + 8, 128);
      stringToUTF8(id, eventStruct + 136, 128);
      HEAP32[(eventStruct + 264) >> 2] = reportedElement
        ? reportedElement.clientWidth
        : 0;
      HEAP32[(eventStruct + 268) >> 2] = reportedElement
        ? reportedElement.clientHeight
        : 0;
      HEAP32[(eventStruct + 272) >> 2] = screen.width;
      HEAP32[(eventStruct + 276) >> 2] = screen.height;
      if (isFullscreen) {
        JSEvents.previousFullscreenElement = fullscreenElement;
      }
    }
    function _emscripten_get_fullscreen_status(fullscreenStatus) {
      if (!JSEvents.fullscreenEnabled()) return -1;
      fillFullscreenChangeEventData(fullscreenStatus);
      return 0;
    }
    function fillGamepadEventData(eventStruct, e) {
      HEAPF64[eventStruct >> 3] = e.timestamp;
      for (var i = 0; i < e.axes.length; ++i) {
        HEAPF64[(eventStruct + i * 8 + 16) >> 3] = e.axes[i];
      }
      for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == "object") {
          HEAPF64[(eventStruct + i * 8 + 528) >> 3] = e.buttons[i].value;
        } else {
          HEAPF64[(eventStruct + i * 8 + 528) >> 3] = e.buttons[i];
        }
      }
      for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == "object") {
          HEAP32[(eventStruct + i * 4 + 1040) >> 2] = e.buttons[i].pressed;
        } else {
          HEAP32[(eventStruct + i * 4 + 1040) >> 2] = e.buttons[i] == 1;
        }
      }
      HEAP32[(eventStruct + 1296) >> 2] = e.connected;
      HEAP32[(eventStruct + 1300) >> 2] = e.index;
      HEAP32[(eventStruct + 8) >> 2] = e.axes.length;
      HEAP32[(eventStruct + 12) >> 2] = e.buttons.length;
      stringToUTF8(e.id, eventStruct + 1304, 64);
      stringToUTF8(e.mapping, eventStruct + 1368, 64);
    }
    function _emscripten_get_gamepad_status(index, gamepadState) {
      if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
      if (!JSEvents.lastGamepadState[index]) return -7;
      fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
      return 0;
    }
    function getHeapMax() {
      return 2147418112;
    }
    function _emscripten_get_heap_max() {
      return getHeapMax();
    }
    function _emscripten_get_now_res() {
      return 1e3;
    }
    function _emscripten_get_num_gamepads() {
      return JSEvents.lastGamepadState.length;
    }
    function _emscripten_html5_remove_all_event_listeners() {
      JSEvents.removeAllEventListeners();
    }
    function webgl_enable_ANGLE_instanced_arrays(ctx) {
      var ext = ctx.getExtension("ANGLE_instanced_arrays");
      if (ext) {
        ctx["vertexAttribDivisor"] = function (index, divisor) {
          ext["vertexAttribDivisorANGLE"](index, divisor);
        };
        ctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
          ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
        };
        ctx["drawElementsInstanced"] = function (
          mode,
          count,
          type,
          indices,
          primcount
        ) {
          ext["drawElementsInstancedANGLE"](
            mode,
            count,
            type,
            indices,
            primcount
          );
        };
        return 1;
      }
    }
    function webgl_enable_OES_vertex_array_object(ctx) {
      var ext = ctx.getExtension("OES_vertex_array_object");
      if (ext) {
        ctx["createVertexArray"] = function () {
          return ext["createVertexArrayOES"]();
        };
        ctx["deleteVertexArray"] = function (vao) {
          ext["deleteVertexArrayOES"](vao);
        };
        ctx["bindVertexArray"] = function (vao) {
          ext["bindVertexArrayOES"](vao);
        };
        ctx["isVertexArray"] = function (vao) {
          return ext["isVertexArrayOES"](vao);
        };
        return 1;
      }
    }
    function webgl_enable_WEBGL_draw_buffers(ctx) {
      var ext = ctx.getExtension("WEBGL_draw_buffers");
      if (ext) {
        ctx["drawBuffers"] = function (n, bufs) {
          ext["drawBuffersWEBGL"](n, bufs);
        };
        return 1;
      }
    }
    function webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(ctx) {
      return !!(ctx.dibvbi = ctx.getExtension(
        "WEBGL_draw_instanced_base_vertex_base_instance"
      ));
    }
    function webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(
      ctx
    ) {
      return !!(ctx.mdibvbi = ctx.getExtension(
        "WEBGL_multi_draw_instanced_base_vertex_base_instance"
      ));
    }
    function webgl_enable_WEBGL_multi_draw(ctx) {
      return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
    }
    var GL = {
      counter: 1,
      buffers: [],
      mappedBuffers: {},
      programs: [],
      framebuffers: [],
      renderbuffers: [],
      textures: [],
      shaders: [],
      vaos: [],
      contexts: [],
      offscreenCanvases: {},
      queries: [],
      samplers: [],
      transformFeedbacks: [],
      syncs: [],
      byteSizeByTypeRoot: 5120,
      byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
      stringCache: {},
      stringiCache: {},
      unpackAlignment: 4,
      recordError: function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },
      getNewId: function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },
      MAX_TEMP_BUFFER_SIZE: 2097152,
      numTempVertexBuffersPerSize: 64,
      log2ceilLookup: function (i) {
        return 32 - Math.clz32(i === 0 ? 0 : i - 1);
      },
      generateTempBuffers: function (quads, context) {
        var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        context.tempVertexBufferCounters1 = [];
        context.tempVertexBufferCounters2 = [];
        context.tempVertexBufferCounters1.length =
          context.tempVertexBufferCounters2.length = largestIndex + 1;
        context.tempVertexBuffers1 = [];
        context.tempVertexBuffers2 = [];
        context.tempVertexBuffers1.length = context.tempVertexBuffers2.length =
          largestIndex + 1;
        context.tempIndexBuffers = [];
        context.tempIndexBuffers.length = largestIndex + 1;
        for (var i = 0; i <= largestIndex; ++i) {
          context.tempIndexBuffers[i] = null;
          context.tempVertexBufferCounters1[i] =
            context.tempVertexBufferCounters2[i] = 0;
          var ringbufferLength = GL.numTempVertexBuffersPerSize;
          context.tempVertexBuffers1[i] = [];
          context.tempVertexBuffers2[i] = [];
          var ringbuffer1 = context.tempVertexBuffers1[i];
          var ringbuffer2 = context.tempVertexBuffers2[i];
          ringbuffer1.length = ringbuffer2.length = ringbufferLength;
          for (var j = 0; j < ringbufferLength; ++j) {
            ringbuffer1[j] = ringbuffer2[j] = null;
          }
        }
        if (quads) {
          context.tempQuadIndexBuffer = GLctx.createBuffer();
          context.GLctx.bindBuffer(34963, context.tempQuadIndexBuffer);
          var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
          var quadIndexes = new Uint16Array(numIndexes);
          var i = 0,
            v = 0;
          while (1) {
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v + 1;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v + 2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v + 2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v + 3;
            if (i >= numIndexes) break;
            v += 4;
          }
          context.GLctx.bufferData(34963, quadIndexes, 35044);
          context.GLctx.bindBuffer(34963, null);
        }
      },
      getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup(sizeBytes);
        var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
        var nextFreeBufferIndex =
          GL.currentContext.tempVertexBufferCounters1[idx];
        GL.currentContext.tempVertexBufferCounters1[idx] =
          (GL.currentContext.tempVertexBufferCounters1[idx] + 1) &
          (GL.numTempVertexBuffersPerSize - 1);
        var vbo = ringbuffer[nextFreeBufferIndex];
        if (vbo) {
          return vbo;
        }
        var prevVBO = GLctx.getParameter(34964);
        ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
        GLctx.bindBuffer(34962, ringbuffer[nextFreeBufferIndex]);
        GLctx.bufferData(34962, 1 << idx, 35048);
        GLctx.bindBuffer(34962, prevVBO);
        return ringbuffer[nextFreeBufferIndex];
      },
      getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup(sizeBytes);
        var ibo = GL.currentContext.tempIndexBuffers[idx];
        if (ibo) {
          return ibo;
        }
        var prevIBO = GLctx.getParameter(34965);
        GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
        GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[idx]);
        GLctx.bufferData(34963, 1 << idx, 35048);
        GLctx.bindBuffer(34963, prevIBO);
        return GL.currentContext.tempIndexBuffers[idx];
      },
      newRenderingFrameStarted: function newRenderingFrameStarted() {
        if (!GL.currentContext) {
          return;
        }
        var vb = GL.currentContext.tempVertexBuffers1;
        GL.currentContext.tempVertexBuffers1 =
          GL.currentContext.tempVertexBuffers2;
        GL.currentContext.tempVertexBuffers2 = vb;
        vb = GL.currentContext.tempVertexBufferCounters1;
        GL.currentContext.tempVertexBufferCounters1 =
          GL.currentContext.tempVertexBufferCounters2;
        GL.currentContext.tempVertexBufferCounters2 = vb;
        var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        for (var i = 0; i <= largestIndex; ++i) {
          GL.currentContext.tempVertexBufferCounters1[i] = 0;
        }
      },
      getSource: function (shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
          var len = length ? HEAP32[(length + i * 4) >> 2] : -1;
          source += UTF8ToString(
            HEAP32[(string + i * 4) >> 2],
            len < 0 ? undefined : len
          );
        }
        return source;
      },
      calcBufLength: function calcBufLength(size, type, stride, count) {
        if (stride > 0) {
          return count * stride;
        }
        var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
        return size * typeSize * count;
      },
      usedTempBuffers: [],
      preDrawHandleClientVertexAttribBindings:
        function preDrawHandleClientVertexAttribBindings(count) {
          GL.resetBufferBinding = false;
          for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
            var cb = GL.currentContext.clientBuffers[i];
            if (!cb.clientside || !cb.enabled) continue;
            GL.resetBufferBinding = true;
            var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
            var buf = GL.getTempVertexBuffer(size);
            GLctx.bindBuffer(34962, buf);
            GLctx.bufferSubData(
              34962,
              0,
              HEAPU8.subarray(cb.ptr, cb.ptr + size)
            );
            cb.vertexAttribPointerAdaptor.call(
              GLctx,
              i,
              cb.size,
              cb.type,
              cb.normalized,
              cb.stride,
              0
            );
          }
        },
      postDrawHandleClientVertexAttribBindings:
        function postDrawHandleClientVertexAttribBindings() {
          if (GL.resetBufferBinding) {
            GLctx.bindBuffer(
              34962,
              GL.buffers[GLctx.currentArrayBufferBinding]
            );
          }
        },
      createContext: function (canvas, webGLContextAttributes) {
        function getChromeVersion() {
          var chromeVersion = navigator.userAgent.match(
            /Chrom(e|ium)\/([0-9]+)\./
          );
          if (chromeVersion) return chromeVersion[2] | 0;
        }
        if (!canvas.getContextSafariWebGL2Fixed) {
          canvas.getContextSafariWebGL2Fixed = canvas.getContext;
          function fixedGetContext(ver, attrs) {
            var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
            return (ver == "webgl") == gl instanceof WebGLRenderingContext
              ? gl
              : null;
          }
          canvas.getContext = fixedGetContext;
        }
        var ctx =
          webGLContextAttributes.majorVersion > 1
            ? !(getChromeVersion() <= 57) &&
              canvas.getContext("webgl2", webGLContextAttributes)
            : canvas.getContext("webgl", webGLContextAttributes);
        if (!ctx) return 0;
        var handle = GL.registerContext(ctx, webGLContextAttributes);
        return handle;
      },
      registerContext: function (ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {
          handle: handle,
          attributes: webGLContextAttributes,
          version: webGLContextAttributes.majorVersion,
          GLctx: ctx,
        };
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (
          typeof webGLContextAttributes.enableExtensionsByDefault ==
            "undefined" ||
          webGLContextAttributes.enableExtensionsByDefault
        ) {
          GL.initExtensions(context);
        }
        context.maxVertexAttribs = context.GLctx.getParameter(34921);
        context.clientBuffers = [];
        for (var i = 0; i < context.maxVertexAttribs; i++) {
          context.clientBuffers[i] = {
            enabled: false,
            clientside: false,
            size: 0,
            type: 0,
            normalized: 0,
            stride: 0,
            ptr: 0,
            vertexAttribPointerAdaptor: null,
          };
        }
        GL.generateTempBuffers(false, context);
        return handle;
      },
      makeContextCurrent: function (contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx);
      },
      getContext: function (contextHandle) {
        return GL.contexts[contextHandle];
      },
      deleteContext: function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle])
          GL.currentContext = null;
        if (typeof JSEvents == "object")
          JSEvents.removeAllHandlersOnTarget(
            GL.contexts[contextHandle].GLctx.canvas
          );
        if (
          GL.contexts[contextHandle] &&
          GL.contexts[contextHandle].GLctx.canvas
        )
          GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        GL.contexts[contextHandle] = null;
      },
      initExtensions: function (context) {
        if (!context) context = GL.currentContext;
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        webgl_enable_ANGLE_instanced_arrays(GLctx);
        webgl_enable_OES_vertex_array_object(GLctx);
        webgl_enable_WEBGL_draw_buffers(GLctx);
        webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
        webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(
          GLctx
        );
        if (context.version >= 2) {
          GLctx.disjointTimerQueryExt = GLctx.getExtension(
            "EXT_disjoint_timer_query_webgl2"
          );
        }
        if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
          GLctx.disjointTimerQueryExt = GLctx.getExtension(
            "EXT_disjoint_timer_query"
          );
        }
        webgl_enable_WEBGL_multi_draw(GLctx);
        var exts = GLctx.getSupportedExtensions() || [];
        exts.forEach(function (ext) {
          if (!ext.includes("lose_context") && !ext.includes("debug")) {
            GLctx.getExtension(ext);
          }
        });
      },
    };
    function _emscripten_is_webgl_context_lost(contextHandle) {
      return (
        !GL.contexts[contextHandle] ||
        GL.contexts[contextHandle].GLctx.isContextLost()
      );
    }
    function reallyNegative(x) {
      return x < 0 || (x === 0 && 1 / x === -Infinity);
    }
    function convertI32PairToI53(lo, hi) {
      return (lo >>> 0) + hi * 4294967296;
    }
    function convertU32PairToI53(lo, hi) {
      return (lo >>> 0) + (hi >>> 0) * 4294967296;
    }
    function reSign(value, bits) {
      if (value <= 0) {
        return value;
      }
      var half = bits <= 32 ? Math.abs(1 << (bits - 1)) : Math.pow(2, bits - 1);
      if (value >= half && (bits <= 32 || value > half)) {
        value = -2 * half + value;
      }
      return value;
    }
    function unSign(value, bits) {
      if (value >= 0) {
        return value;
      }
      return bits <= 32
        ? 2 * Math.abs(1 << (bits - 1)) + value
        : Math.pow(2, bits) + value;
    }
    function strLen(ptr) {
      var end = ptr;
      while (HEAPU8[end]) ++end;
      return end - ptr;
    }
    function formatString(format, varargs) {
      var textIndex = format;
      var argIndex = varargs;
      function prepVararg(ptr, type) {
        if (type === "double" || type === "i64") {
          if (ptr & 7) {
            ptr += 4;
          }
        } else {
        }
        return ptr;
      }
      function getNextArg(type) {
        var ret;
        argIndex = prepVararg(argIndex, type);
        if (type === "double") {
          ret = HEAPF64[argIndex >> 3];
          argIndex += 8;
        } else if (type == "i64") {
          ret = [HEAP32[argIndex >> 2], HEAP32[(argIndex + 4) >> 2]];
          argIndex += 8;
        } else {
          type = "i32";
          ret = HEAP32[argIndex >> 2];
          argIndex += 4;
        }
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while (1) {
        var startTextIndex = textIndex;
        curr = HEAP8[textIndex >> 0];
        if (curr === 0) break;
        next = HEAP8[(textIndex + 1) >> 0];
        if (curr == 37) {
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[(textIndex + 1) >> 0];
          }
          var width = 0;
          if (next == 42) {
            width = getNextArg("i32");
            textIndex++;
            next = HEAP8[(textIndex + 1) >> 0];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[(textIndex + 1) >> 0];
            }
          }
          var precisionSet = false,
            precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[(textIndex + 1) >> 0];
            if (next == 42) {
              precision = getNextArg("i32");
              textIndex++;
            } else {
              while (1) {
                var precisionChr = HEAP8[(textIndex + 1) >> 0];
                if (precisionChr < 48 || precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[(textIndex + 1) >> 0];
          }
          if (precision < 0) {
            precision = 6;
            precisionSet = false;
          }
          var argSize;
          switch (String.fromCharCode(next)) {
            case "h":
              var nextNext = HEAP8[(textIndex + 2) >> 0];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1;
              } else {
                argSize = 2;
              }
              break;
            case "l":
              var nextNext = HEAP8[(textIndex + 2) >> 0];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8;
              } else {
                argSize = 4;
              }
              break;
            case "L":
            case "q":
            case "j":
              argSize = 8;
              break;
            case "z":
            case "t":
            case "I":
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[(textIndex + 1) >> 0];
          switch (String.fromCharCode(next)) {
            case "d":
            case "i":
            case "u":
            case "o":
            case "x":
            case "X":
            case "p": {
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              currArg = getNextArg("i" + argSize * 8);
              var argText;
              if (argSize == 8) {
                currArg =
                  next == 117
                    ? convertU32PairToI53(currArg[0], currArg[1])
                    : convertI32PairToI53(currArg[0], currArg[1]);
              }
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(
                  currArg & limit,
                  argSize * 8
                );
              }
              var currAbsArg = Math.abs(currArg);
              var prefix = "";
              if (next == 100 || next == 105) {
                argText = reSign(currArg, 8 * argSize).toString(10);
              } else if (next == 117) {
                argText = unSign(currArg, 8 * argSize).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative && currArg != 0 ? "0x" : "";
                if (currArg < 0) {
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((15 - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join("");
                  while (argText.length < argSize * 2) argText = "f" + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = "(nil)";
                } else {
                  prefix = "0x";
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = "0" + argText;
                }
              }
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = "+" + prefix;
                } else if (flagPadSign) {
                  prefix = " " + prefix;
                }
              }
              if (argText.charAt(0) == "-") {
                prefix = "-" + prefix;
                argText = argText.substr(1);
              }
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += " ";
                } else {
                  if (flagZeroPad) {
                    argText = "0" + argText;
                  } else {
                    prefix = " " + prefix;
                  }
                }
              }
              argText = prefix + argText;
              argText.split("").forEach(function (chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case "f":
            case "F":
            case "e":
            case "E":
            case "g":
            case "G": {
              currArg = getNextArg("double");
              var argText;
              if (isNaN(currArg)) {
                argText = "nan";
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? "-" : "") + "inf";
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(
                    currArg.toExponential(effectivePrecision).split("e")[1],
                    10
                  );
                  if (precision > exponent && exponent >= -4) {
                    next = (next == 103 ? "f" : "F").charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = (next == 103 ? "e" : "E").charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + "0" + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && reallyNegative(currArg)) {
                    argText = "-" + argText;
                  }
                }
                var parts = argText.split("e");
                if (isGeneral && !flagAlternative) {
                  while (
                    parts[0].length > 1 &&
                    parts[0].includes(".") &&
                    (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")
                  ) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  if (flagAlternative && argText.indexOf(".") == -1)
                    parts[0] += ".";
                  while (precision > effectivePrecision++) parts[0] += "0";
                }
                argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
                if (next == 69) argText = argText.toUpperCase();
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = "+" + argText;
                  } else if (flagPadSign) {
                    argText = " " + argText;
                  }
                }
              }
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += " ";
                } else {
                  if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
                    argText = argText[0] + "0" + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? "0" : " ") + argText;
                  }
                }
              }
              if (next < 97) argText = argText.toUpperCase();
              argText.split("").forEach(function (chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case "s": {
              var arg = getNextArg("i8*");
              var argLength = arg ? strLen(arg) : "(null)".length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[arg++ >> 0]);
                }
              } else {
                ret = ret.concat(
                  intArrayFromString("(null)".substr(0, argLength), true)
                );
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case "c": {
              if (flagLeftAlign) ret.push(getNextArg("i8"));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg("i8"));
              break;
            }
            case "n": {
              var ptr = getNextArg("i32*");
              HEAP32[ptr >> 2] = ret.length;
              break;
            }
            case "%": {
              ret.push(curr);
              break;
            }
            default: {
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[i >> 0]);
              }
            }
          }
          textIndex += 2;
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }
    function traverseStack(args) {
      if (!args || !args.callee || !args.callee.name) {
        return [null, "", ""];
      }
      var funstr = args.callee.toString();
      var funcname = args.callee.name;
      var str = "(";
      var first = true;
      for (var i in args) {
        var a = args[i];
        if (!first) {
          str += ", ";
        }
        first = false;
        if (typeof a == "number" || typeof a == "string") {
          str += a;
        } else {
          str += "(" + typeof a + ")";
        }
      }
      str += ")";
      var caller = args.callee.caller;
      args = caller ? caller.arguments : [];
      if (first) str = "";
      return [args, funcname, str];
    }
    function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        try {
          throw new Error();
        } catch (e) {
          error = e;
        }
        if (!error.stack) {
          return "(no stack trace available)";
        }
      }
      return error.stack.toString();
    }
    function getCallstack(flags) {
      var callstack = jsStackTrace();
      var iThisFunc = callstack.lastIndexOf("_emscripten_log");
      var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
      var iNextLine =
        callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
      callstack = callstack.slice(iNextLine);
      if (flags & 32) {
        warnOnce("EM_LOG_DEMANGLE is deprecated; ignoring");
      }
      if (flags & 8 && typeof emscripten_source_map == "undefined") {
        warnOnce(
          'Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.'
        );
        flags ^= 8;
        flags |= 16;
      }
      var stack_args = null;
      if (flags & 128) {
        stack_args = traverseStack(arguments);
        while (stack_args[1].includes("_emscripten_"))
          stack_args = traverseStack(stack_args[0]);
      }
      var lines = callstack.split("\n");
      callstack = "";
      var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
      var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
      var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
      for (var l in lines) {
        var line = lines[l];
        var symbolName = "";
        var file = "";
        var lineno = 0;
        var column = 0;
        var parts = chromeRe.exec(line);
        if (parts && parts.length == 5) {
          symbolName = parts[1];
          file = parts[2];
          lineno = parts[3];
          column = parts[4];
        } else {
          parts = newFirefoxRe.exec(line);
          if (!parts) parts = firefoxRe.exec(line);
          if (parts && parts.length >= 4) {
            symbolName = parts[1];
            file = parts[2];
            lineno = parts[3];
            column = parts[4] | 0;
          } else {
            callstack += line + "\n";
            continue;
          }
        }
        var haveSourceMap = false;
        if (flags & 8) {
          var orig = emscripten_source_map.originalPositionFor({
            line: lineno,
            column: column,
          });
          haveSourceMap = orig && orig.source;
          if (haveSourceMap) {
            if (flags & 64) {
              orig.source = orig.source.substring(
                orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1
              );
            }
            callstack += `    at ${symbolName} (${orig.source}:${orig.line}:${orig.column})\n`;
          }
        }
        if (flags & 16 || !haveSourceMap) {
          if (flags & 64) {
            file = file.substring(
              file.replace(/\\/g, "/").lastIndexOf("/") + 1
            );
          }
          callstack +=
            (haveSourceMap ? `     = ${symbolName}` : `    at ${symbolName}`) +
            ` (${file}:${lineno}:${column})\n`;
        }
        if (flags & 128 && stack_args[0]) {
          if (stack_args[1] == symbolName && stack_args[2].length > 0) {
            callstack = callstack.replace(/\s+$/, "");
            callstack +=
              " with values: " + stack_args[1] + stack_args[2] + "\n";
          }
          stack_args = traverseStack(stack_args[0]);
        }
      }
      callstack = callstack.replace(/\s+$/, "");
      return callstack;
    }
    function emscriptenLog(flags, str) {
      if (flags & 24) {
        str = str.replace(/\s+$/, "");
        str += (str.length > 0 ? "\n" : "") + getCallstack(flags);
      }
      if (flags & 1) {
        if (flags & 4) {
          console.error(str);
        } else if (flags & 2) {
          console.warn(str);
        } else if (flags & 512) {
          console.info(str);
        } else if (flags & 256) {
          console.debug(str);
        } else {
          // console.log(str);
        }
      } else if (flags & 6) {
        err(str);
      } else {
        out(str);
      }
    }
    function _emscripten_log(flags, format, varargs) {
      var result = formatString(format, varargs);
      var str = UTF8ArrayToString(result, 0);
      emscriptenLog(flags, str);
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function doRequestFullscreen(target, strategy) {
      if (!JSEvents.fullscreenEnabled()) return -1;
      target = findEventTarget(target);
      if (!target) return -4;
      if (
        !target.requestFullscreen &&
        !target.mozRequestFullScreen &&
        !target.mozRequestFullscreen &&
        !target.webkitRequestFullscreen
      ) {
        return -3;
      }
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
      if (!canPerformRequests) {
        if (strategy.deferUntilInEventHandler) {
          JSEvents.deferCall(JSEvents_requestFullscreen, 1, [target, strategy]);
          return 1;
        }
        return -2;
      }
      return JSEvents_requestFullscreen(target, strategy);
    }
    function _emscripten_request_fullscreen(target, deferUntilInEventHandler) {
      var strategy = {
        scaleMode: 0,
        canvasResolutionScaleMode: 0,
        filteringMode: 0,
        deferUntilInEventHandler: deferUntilInEventHandler,
        canvasResizedCallbackTargetThread: 2,
      };
      return doRequestFullscreen(target, strategy);
    }
    function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
      target = findEventTarget(target);
      if (!target) return -4;
      if (!target.requestPointerLock) {
        return -1;
      }
      var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
      if (!canPerformRequests) {
        if (deferUntilInEventHandler) {
          JSEvents.deferCall(requestPointerLock, 2, [target]);
          return 1;
        }
        return -2;
      }
      return requestPointerLock(target);
    }
    function abortOnCannotGrowMemory(requestedSize) {
      abort("OOM");
    }
    function emscripten_realloc_buffer(size) {
      var b = wasmMemory.buffer;
      try {
        wasmMemory.grow((size - b.byteLength + 65535) >>> 16);
        updateMemoryViews();
        return 1;
      } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        abortOnCannotGrowMemory(requestedSize);
      }
      var alignUp = (x, multiple) =>
        x + ((multiple - (x % multiple)) % multiple);
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(
          overGrownHeapSize,
          requestedSize + 100663296
        );
        var newSize = Math.min(
          maxHeapSize,
          alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
        );
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      abortOnCannotGrowMemory(requestedSize);
    }
    function _emscripten_sample_gamepad_data() {
      try {
        if (navigator.getGamepads)
          return (JSEvents.lastGamepadState = navigator.getGamepads()) ? 0 : -1;
      } catch (e) {
        navigator.getGamepads = null;
      }
      return -1;
    }
    function registerFocusEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.focusEvent) JSEvents.focusEvent = _malloc(256);
      var focusEventHandlerFunc = function (e = event) {
        var nodeName = JSEvents.getNodeNameForTarget(e.target);
        var id = e.target.id ? e.target.id : "";
        var focusEvent = JSEvents.focusEvent;
        stringToUTF8(nodeName, focusEvent + 0, 128);
        stringToUTF8(id, focusEvent + 128, 128);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            focusEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: findEventTarget(target),
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: focusEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_blur_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerFocusEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        12,
        "blur",
        targetThread
      );
    }
    function _emscripten_set_focus_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerFocusEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        13,
        "focus",
        targetThread
      );
    }
    function registerFullscreenChangeEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.fullscreenChangeEvent)
        JSEvents.fullscreenChangeEvent = _malloc(280);
      var fullscreenChangeEventhandlerFunc = function (e = event) {
        var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
        fillFullscreenChangeEventData(fullscreenChangeEvent);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            fullscreenChangeEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: target,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: fullscreenChangeEventhandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_fullscreenchange_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      if (!JSEvents.fullscreenEnabled()) return -1;
      target = findEventTarget(target);
      if (!target) return -4;
      registerFullscreenChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        19,
        "mozfullscreenchange",
        targetThread
      );
      registerFullscreenChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        19,
        "webkitfullscreenchange",
        targetThread
      );
      return registerFullscreenChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        19,
        "fullscreenchange",
        targetThread
      );
    }
    function registerGamepadEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.gamepadEvent) JSEvents.gamepadEvent = _malloc(1432);
      var gamepadEventHandlerFunc = function (e = event) {
        var gamepadEvent = JSEvents.gamepadEvent;
        fillGamepadEventData(gamepadEvent, e["gamepad"]);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            gamepadEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: findEventTarget(target),
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: gamepadEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_gamepadconnected_callback_on_thread(
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      if (_emscripten_sample_gamepad_data()) return -1;
      return registerGamepadEventCallback(
        2,
        userData,
        useCapture,
        callbackfunc,
        26,
        "gamepadconnected",
        targetThread
      );
    }
    function _emscripten_set_gamepaddisconnected_callback_on_thread(
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      if (_emscripten_sample_gamepad_data()) return -1;
      return registerGamepadEventCallback(
        2,
        userData,
        useCapture,
        callbackfunc,
        27,
        "gamepaddisconnected",
        targetThread
      );
    }
    function _emscripten_set_interval(cb, msecs, userData) {
      return setInterval(function () {
        callUserCallback(function () {
          ((a1) => dynCall_vi.apply(null, [cb, a1]))(userData);
        });
      }, msecs);
    }
    function registerKeyEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.keyEvent) JSEvents.keyEvent = _malloc(176);
      var keyEventHandlerFunc = function (e) {
        var keyEventData = JSEvents.keyEvent;
        keyEventData = keyEventData;
        HEAPF64[keyEventData >> 3] = e.timeStamp;
        var idx = keyEventData >> 2;
        HEAP32[idx + 2] = e.location;
        HEAP32[idx + 3] = e.ctrlKey;
        HEAP32[idx + 4] = e.shiftKey;
        HEAP32[idx + 5] = e.altKey;
        HEAP32[idx + 6] = e.metaKey;
        HEAP32[idx + 7] = e.repeat;
        HEAP32[idx + 8] = e.charCode;
        HEAP32[idx + 9] = e.keyCode;
        HEAP32[idx + 10] = e.which;
        stringToUTF8(e.key || "", keyEventData + 44, 32);
        stringToUTF8(e.code || "", keyEventData + 76, 32);
        stringToUTF8(e.char || "", keyEventData + 108, 32);
        stringToUTF8(e.locale || "", keyEventData + 140, 32);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            keyEventData,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: findEventTarget(target),
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: keyEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_keydown_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerKeyEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        2,
        "keydown",
        targetThread
      );
    }
    function _emscripten_set_keypress_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerKeyEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        1,
        "keypress",
        targetThread
      );
    }
    function _emscripten_set_keyup_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerKeyEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        3,
        "keyup",
        targetThread
      );
    }
    function fillMouseEventData(eventStruct, e, target) {
      HEAPF64[eventStruct >> 3] = e.timeStamp;
      var idx = eventStruct >> 2;
      HEAP32[idx + 2] = e.screenX;
      HEAP32[idx + 3] = e.screenY;
      HEAP32[idx + 4] = e.clientX;
      HEAP32[idx + 5] = e.clientY;
      HEAP32[idx + 6] = e.ctrlKey;
      HEAP32[idx + 7] = e.shiftKey;
      HEAP32[idx + 8] = e.altKey;
      HEAP32[idx + 9] = e.metaKey;
      HEAP16[idx * 2 + 20] = e.button;
      HEAP16[idx * 2 + 21] = e.buttons;
      HEAP32[idx + 11] = e["movementX"];
      HEAP32[idx + 12] = e["movementY"];
      var rect = getBoundingClientRect(target);
      HEAP32[idx + 13] = e.clientX - rect.left;
      HEAP32[idx + 14] = e.clientY - rect.top;
    }
    function registerMouseEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(72);
      target = findEventTarget(target);
      var mouseEventHandlerFunc = function (e = event) {
        fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            JSEvents.mouseEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: target,
        allowsDeferredCalls:
          eventTypeString != "mousemove" &&
          eventTypeString != "mouseenter" &&
          eventTypeString != "mouseleave",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_mousedown_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        5,
        "mousedown",
        targetThread
      );
    }
    function _emscripten_set_mousemove_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        8,
        "mousemove",
        targetThread
      );
    }
    function _emscripten_set_mouseup_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerMouseEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        6,
        "mouseup",
        targetThread
      );
    }
    function fillPointerlockChangeEventData(eventStruct) {
      var pointerLockElement =
        document.pointerLockElement ||
        document.mozPointerLockElement ||
        document.webkitPointerLockElement ||
        document.msPointerLockElement;
      var isPointerlocked = !!pointerLockElement;
      HEAP32[eventStruct >> 2] = isPointerlocked;
      var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
      var id =
        pointerLockElement && pointerLockElement.id
          ? pointerLockElement.id
          : "";
      stringToUTF8(nodeName, eventStruct + 4, 128);
      stringToUTF8(id, eventStruct + 132, 128);
    }
    function registerPointerlockChangeEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.pointerlockChangeEvent)
        JSEvents.pointerlockChangeEvent = _malloc(260);
      var pointerlockChangeEventHandlerFunc = function (e = event) {
        var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
        fillPointerlockChangeEventData(pointerlockChangeEvent);
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            pointerlockChangeEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: target,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: pointerlockChangeEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_pointerlockchange_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      if (
        !document ||
        !document.body ||
        (!document.body.requestPointerLock &&
          !document.body.mozRequestPointerLock &&
          !document.body.webkitRequestPointerLock &&
          !document.body.msRequestPointerLock)
      ) {
        return -1;
      }
      target = findEventTarget(target);
      if (!target) return -4;
      registerPointerlockChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        20,
        "mozpointerlockchange",
        targetThread
      );
      registerPointerlockChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        20,
        "webkitpointerlockchange",
        targetThread
      );
      registerPointerlockChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        20,
        "mspointerlockchange",
        targetThread
      );
      return registerPointerlockChangeEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        20,
        "pointerlockchange",
        targetThread
      );
    }
    function registerTouchEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1696);
      target = findEventTarget(target);
      var touchEventHandlerFunc = function (e) {
        var t,
          touches = {},
          et = e.touches;
        for (var i = 0; i < et.length; ++i) {
          t = et[i];
          t.isChanged = t.onTarget = 0;
          touches[t.identifier] = t;
        }
        for (var i = 0; i < e.changedTouches.length; ++i) {
          t = e.changedTouches[i];
          t.isChanged = 1;
          touches[t.identifier] = t;
        }
        for (var i = 0; i < e.targetTouches.length; ++i) {
          touches[e.targetTouches[i].identifier].onTarget = 1;
        }
        var touchEvent = JSEvents.touchEvent;
        HEAPF64[touchEvent >> 3] = e.timeStamp;
        var idx = touchEvent >> 2;
        HEAP32[idx + 3] = e.ctrlKey;
        HEAP32[idx + 4] = e.shiftKey;
        HEAP32[idx + 5] = e.altKey;
        HEAP32[idx + 6] = e.metaKey;
        idx += 7;
        var targetRect = getBoundingClientRect(target);
        var numTouches = 0;
        for (var i in touches) {
          t = touches[i];
          HEAP32[idx + 0] = t.identifier;
          HEAP32[idx + 1] = t.screenX;
          HEAP32[idx + 2] = t.screenY;
          HEAP32[idx + 3] = t.clientX;
          HEAP32[idx + 4] = t.clientY;
          HEAP32[idx + 5] = t.pageX;
          HEAP32[idx + 6] = t.pageY;
          HEAP32[idx + 7] = t.isChanged;
          HEAP32[idx + 8] = t.onTarget;
          HEAP32[idx + 9] = t.clientX - targetRect.left;
          HEAP32[idx + 10] = t.clientY - targetRect.top;
          idx += 13;
          if (++numTouches > 31) {
            break;
          }
        }
        HEAP32[(touchEvent + 8) >> 2] = numTouches;
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            touchEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: target,
        allowsDeferredCalls:
          eventTypeString == "touchstart" || eventTypeString == "touchend",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: touchEventHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_touchcancel_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        25,
        "touchcancel",
        targetThread
      );
    }
    function _emscripten_set_touchend_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        23,
        "touchend",
        targetThread
      );
    }
    function _emscripten_set_touchmove_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        24,
        "touchmove",
        targetThread
      );
    }
    function _emscripten_set_touchstart_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      return registerTouchEventCallback(
        target,
        userData,
        useCapture,
        callbackfunc,
        22,
        "touchstart",
        targetThread
      );
    }
    function registerWheelEventCallback(
      target,
      userData,
      useCapture,
      callbackfunc,
      eventTypeId,
      eventTypeString,
      targetThread
    ) {
      if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(104);
      var wheelHandlerFunc = function (e = event) {
        var wheelEvent = JSEvents.wheelEvent;
        fillMouseEventData(wheelEvent, e, target);
        HEAPF64[(wheelEvent + 72) >> 3] = e["deltaX"];
        HEAPF64[(wheelEvent + 80) >> 3] = e["deltaY"];
        HEAPF64[(wheelEvent + 88) >> 3] = e["deltaZ"];
        HEAP32[(wheelEvent + 96) >> 2] = e["deltaMode"];
        if (
          ((a1, a2, a3) =>
            dynCall_iiii.apply(null, [callbackfunc, a1, a2, a3]))(
            eventTypeId,
            wheelEvent,
            userData
          )
        )
          e.preventDefault();
      };
      var eventHandler = {
        target: target,
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: wheelHandlerFunc,
        useCapture: useCapture,
      };
      return JSEvents.registerOrRemoveHandler(eventHandler);
    }
    function _emscripten_set_wheel_callback_on_thread(
      target,
      userData,
      useCapture,
      callbackfunc,
      targetThread
    ) {
      target = findEventTarget(target);
      if (!target) return -4;
      if (typeof target.onwheel != "undefined") {
        return registerWheelEventCallback(
          target,
          userData,
          useCapture,
          callbackfunc,
          9,
          "wheel",
          targetThread
        );
      } else {
        return -1;
      }
    }
    var emscripten_webgl_power_preferences = [
      "default",
      "low-power",
      "high-performance",
    ];
    function _emscripten_webgl_do_create_context(target, attributes) {
      var a = attributes >> 2;
      var powerPreference = HEAP32[a + (24 >> 2)];
      var contextAttributes = {
        alpha: !!HEAP32[a + (0 >> 2)],
        depth: !!HEAP32[a + (4 >> 2)],
        stencil: !!HEAP32[a + (8 >> 2)],
        antialias: !!HEAP32[a + (12 >> 2)],
        premultipliedAlpha: !!HEAP32[a + (16 >> 2)],
        preserveDrawingBuffer: !!HEAP32[a + (20 >> 2)],
        powerPreference: emscripten_webgl_power_preferences[powerPreference],
        failIfMajorPerformanceCaveat: !!HEAP32[a + (28 >> 2)],
        majorVersion: HEAP32[a + (32 >> 2)],
        minorVersion: HEAP32[a + (36 >> 2)],
        enableExtensionsByDefault: HEAP32[a + (40 >> 2)],
        explicitSwapControl: HEAP32[a + (44 >> 2)],
        proxyContextToMainThread: HEAP32[a + (48 >> 2)],
        renderViaOffscreenBackBuffer: HEAP32[a + (52 >> 2)],
      };
      var canvas = findCanvasEventTarget(target);
      if (!canvas) {
        return 0;
      }
      if (contextAttributes.explicitSwapControl) {
        return 0;
      }
      var contextHandle = GL.createContext(canvas, contextAttributes);
      return contextHandle;
    }
    var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;
    function _emscripten_webgl_destroy_context(contextHandle) {
      if (GL.currentContext == contextHandle) GL.currentContext = 0;
      GL.deleteContext(contextHandle);
    }
    function _emscripten_webgl_enable_extension(contextHandle, extension) {
      var context = GL.getContext(contextHandle);
      var extString = UTF8ToString(extension);
      if (extString.startsWith("GL_")) extString = extString.substr(3);
      if (extString == "ANGLE_instanced_arrays")
        webgl_enable_ANGLE_instanced_arrays(GLctx);
      if (extString == "OES_vertex_array_object")
        webgl_enable_OES_vertex_array_object(GLctx);
      if (extString == "WEBGL_draw_buffers")
        webgl_enable_WEBGL_draw_buffers(GLctx);
      if (extString == "WEBGL_draw_instanced_base_vertex_base_instance")
        webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
      if (extString == "WEBGL_multi_draw_instanced_base_vertex_base_instance")
        webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(
          GLctx
        );
      if (extString == "WEBGL_multi_draw") webgl_enable_WEBGL_multi_draw(GLctx);
      var ext = context.GLctx.getExtension(extString);
      return !!ext;
    }
    function _emscripten_webgl_do_get_current_context() {
      return GL.currentContext ? GL.currentContext.handle : 0;
    }
    var _emscripten_webgl_get_current_context =
      _emscripten_webgl_do_get_current_context;
    function _emscripten_webgl_init_context_attributes(attributes) {
      var a = attributes >> 2;
      for (var i = 0; i < 56 >> 2; ++i) {
        HEAP32[a + i] = 0;
      }
      HEAP32[a + (0 >> 2)] =
        HEAP32[a + (4 >> 2)] =
        HEAP32[a + (12 >> 2)] =
        HEAP32[a + (16 >> 2)] =
        HEAP32[a + (32 >> 2)] =
        HEAP32[a + (40 >> 2)] =
          1;
    }
    function _emscripten_webgl_make_context_current(contextHandle) {
      var success = GL.makeContextCurrent(contextHandle);
      return success ? 0 : -5;
    }
    var ENV = {};
    function getExecutableName() {
      return thisProgram || "./this.program";
    }
    function getEnvStrings() {
      if (!getEnvStrings.strings) {
        var lang =
          (
            (typeof navigator == "object" &&
              navigator.languages &&
              navigator.languages[0]) ||
            "C"
          ).replace("-", "_") + ".UTF-8";
        var env = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: lang,
          _: getExecutableName(),
        };
        for (var x in ENV) {
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + "=" + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
    function stringToAscii(str, buffer) {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      HEAP8[buffer >> 0] = 0;
    }
    function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function (string, i) {
        var ptr = environ_buf + bufSize;
        HEAPU32[(__environ + i * 4) >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }
    function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach(function (string) {
        bufSize += string.length + 1;
      });
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    }
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    function doReadv(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
        if (typeof offset !== "undefined") {
          offset += curr;
        }
      }
      return ret;
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      try {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        (tempI64 = [
          stream.position >>> 0,
          ((tempDouble = stream.position),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[newOffset >> 2] = tempI64[0]),
          (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    function doWritev(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (typeof offset !== "undefined") {
          offset += curr;
        }
      }
      return ret;
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    function getHostByName(name) {
      var ret = _malloc(20);
      var nameBuf = stringToNewUTF8(name);
      HEAPU32[ret >> 2] = nameBuf;
      var aliasesBuf = _malloc(4);
      HEAPU32[aliasesBuf >> 2] = 0;
      HEAPU32[(ret + 4) >> 2] = aliasesBuf;
      var afinet = 2;
      HEAP32[(ret + 8) >> 2] = afinet;
      HEAP32[(ret + 12) >> 2] = 4;
      var addrListBuf = _malloc(12);
      HEAPU32[addrListBuf >> 2] = addrListBuf + 8;
      HEAPU32[(addrListBuf + 4) >> 2] = 0;
      HEAP32[(addrListBuf + 8) >> 2] = inetPton4(DNS.lookup_name(name));
      HEAPU32[(ret + 16) >> 2] = addrListBuf;
      return ret;
    }
    function _gethostbyaddr(addr, addrlen, type) {
      if (type !== 2) {
        setErrNo(5);
        return null;
      }
      addr = HEAP32[addr >> 2];
      var host = inetNtop4(addr);
      var lookup = DNS.lookup_addr(host);
      if (lookup) {
        host = lookup;
      }
      return getHostByName(host);
    }
    function _gethostbyname(name) {
      return getHostByName(UTF8ToString(name));
    }
    function _glActiveTexture(x0) {
      GLctx.activeTexture(x0);
    }
    function _glAttachShader(program, shader) {
      program = GL.programs[program];
      shader = GL.shaders[shader];
      program[shader.shaderType] = shader;
      GLctx.attachShader(program, shader);
    }
    function _glBeginQuery(target, id) {
      GLctx.beginQuery(target, GL.queries[id]);
    }
    function _glBindAttribLocation(program, index, name) {
      GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
    }
    function _glBindBuffer(target, buffer) {
      if (target == 34962) {
        GLctx.currentArrayBufferBinding = buffer;
      } else if (target == 34963) {
        GLctx.currentElementArrayBufferBinding = buffer;
      }
      if (target == 35051) {
        GLctx.currentPixelPackBufferBinding = buffer;
      } else if (target == 35052) {
        GLctx.currentPixelUnpackBufferBinding = buffer;
      }
      GLctx.bindBuffer(target, GL.buffers[buffer]);
    }
    function _glBindBufferBase(target, index, buffer) {
      GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
    }
    function _glBindBufferRange(target, index, buffer, offset, ptrsize) {
      GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize);
    }
    function _glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
    }
    function _glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
    }
    function _glBindSampler(unit, sampler) {
      GLctx.bindSampler(unit, GL.samplers[sampler]);
    }
    function _glBindTexture(target, texture) {
      GLctx.bindTexture(target, GL.textures[texture]);
    }
    function _glBindVertexArray(vao) {
      GLctx.bindVertexArray(GL.vaos[vao]);
      var ibo = GLctx.getParameter(34965);
      GLctx.currentElementArrayBufferBinding = ibo ? ibo.name | 0 : 0;
    }
    function _glBlendEquation(x0) {
      GLctx.blendEquation(x0);
    }
    function _glBlendEquationSeparate(x0, x1) {
      GLctx.blendEquationSeparate(x0, x1);
    }
    function _glBlendFuncSeparate(x0, x1, x2, x3) {
      GLctx.blendFuncSeparate(x0, x1, x2, x3);
    }
    function _glBlitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) {
      GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
    }
    function _glBufferData(target, size, data, usage) {
      if (GL.currentContext.version >= 2) {
        if (data && size) {
          GLctx.bufferData(target, HEAPU8, usage, data, size);
        } else {
          GLctx.bufferData(target, size, usage);
        }
      } else {
        GLctx.bufferData(
          target,
          data ? HEAPU8.subarray(data, data + size) : size,
          usage
        );
      }
    }
    function _glBufferSubData(target, offset, size, data) {
      if (GL.currentContext.version >= 2) {
        size && GLctx.bufferSubData(target, offset, HEAPU8, data, size);
        return;
      }
      GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
    }
    function _glCheckFramebufferStatus(x0) {
      return GLctx.checkFramebufferStatus(x0);
    }
    function _glClear(x0) {
      GLctx.clear(x0);
    }
    function _glClearBufferfi(x0, x1, x2, x3) {
      GLctx.clearBufferfi(x0, x1, x2, x3);
    }
    function _glClearBufferfv(buffer, drawbuffer, value) {
      GLctx.clearBufferfv(buffer, drawbuffer, HEAPF32, value >> 2);
    }
    function _glClearBufferuiv(buffer, drawbuffer, value) {
      GLctx.clearBufferuiv(buffer, drawbuffer, HEAPU32, value >> 2);
    }
    function _glClearColor(x0, x1, x2, x3) {
      GLctx.clearColor(x0, x1, x2, x3);
    }
    function _glClearDepthf(x0) {
      GLctx.clearDepth(x0);
    }
    function _glClearStencil(x0) {
      GLctx.clearStencil(x0);
    }
    function _glClientWaitSync(sync, flags, timeout_low, timeout_high) {
      var timeout = convertI32PairToI53(timeout_low, timeout_high);
      return GLctx.clientWaitSync(GL.syncs[sync], flags, timeout);
    }
    function _glColorMask(red, green, blue, alpha) {
      GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
    }
    function _glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }
    function _glCompressedTexImage2D(
      target,
      level,
      internalFormat,
      width,
      height,
      border,
      imageSize,
      data
    ) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
          GLctx.compressedTexImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            imageSize,
            data
          );
        } else {
          GLctx.compressedTexImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            HEAPU8,
            data,
            imageSize
          );
        }
        return;
      }
      GLctx.compressedTexImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        border,
        data ? HEAPU8.subarray(data, data + imageSize) : null
      );
    }
    function _glCompressedTexImage3D(
      target,
      level,
      internalFormat,
      width,
      height,
      depth,
      border,
      imageSize,
      data
    ) {
      if (GLctx.currentPixelUnpackBufferBinding) {
        GLctx.compressedTexImage3D(
          target,
          level,
          internalFormat,
          width,
          height,
          depth,
          border,
          imageSize,
          data
        );
      } else {
        GLctx.compressedTexImage3D(
          target,
          level,
          internalFormat,
          width,
          height,
          depth,
          border,
          HEAPU8,
          data,
          imageSize
        );
      }
    }
    function _glCompressedTexSubImage2D(
      target,
      level,
      xoffset,
      yoffset,
      width,
      height,
      format,
      imageSize,
      data
    ) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
          GLctx.compressedTexSubImage2D(
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            imageSize,
            data
          );
        } else {
          GLctx.compressedTexSubImage2D(
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            HEAPU8,
            data,
            imageSize
          );
        }
        return;
      }
      GLctx.compressedTexSubImage2D(
        target,
        level,
        xoffset,
        yoffset,
        width,
        height,
        format,
        data ? HEAPU8.subarray(data, data + imageSize) : null
      );
    }
    function _glCompressedTexSubImage3D(
      target,
      level,
      xoffset,
      yoffset,
      zoffset,
      width,
      height,
      depth,
      format,
      imageSize,
      data
    ) {
      if (GLctx.currentPixelUnpackBufferBinding) {
        GLctx.compressedTexSubImage3D(
          target,
          level,
          xoffset,
          yoffset,
          zoffset,
          width,
          height,
          depth,
          format,
          imageSize,
          data
        );
      } else {
        GLctx.compressedTexSubImage3D(
          target,
          level,
          xoffset,
          yoffset,
          zoffset,
          width,
          height,
          depth,
          format,
          HEAPU8,
          data,
          imageSize
        );
      }
    }
    function _glCopyBufferSubData(x0, x1, x2, x3, x4) {
      GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
    }
    function _glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
      GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
    }
    function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
      GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);
    }
    function _glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      program.maxUniformLength =
        program.maxAttributeLength =
        program.maxUniformBlockNameLength =
          0;
      program.uniformIdCounter = 1;
      GL.programs[id] = program;
      return id;
    }
    function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      GL.shaders[id].shaderType = shaderType & 1 ? "vs" : "fs";
      return id;
    }
    function _glCullFace(x0) {
      GLctx.cullFace(x0);
    }
    function _glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(buffers + i * 4) >> 2];
        var buffer = GL.buffers[id];
        if (!buffer) continue;
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
        if (id == GLctx.currentArrayBufferBinding)
          GLctx.currentArrayBufferBinding = 0;
        if (id == GLctx.currentElementArrayBufferBinding)
          GLctx.currentElementArrayBufferBinding = 0;
        if (id == GLctx.currentPixelPackBufferBinding)
          GLctx.currentPixelPackBufferBinding = 0;
        if (id == GLctx.currentPixelUnpackBufferBinding)
          GLctx.currentPixelUnpackBufferBinding = 0;
      }
    }
    function _glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(framebuffers + i * 4) >> 2];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue;
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }
    function _glDeleteProgram(id) {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
    }
    function _glDeleteQueries(n, ids) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(ids + i * 4) >> 2];
        var query = GL.queries[id];
        if (!query) continue;
        GLctx.deleteQuery(query);
        GL.queries[id] = null;
      }
    }
    function _glDeleteRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(renderbuffers + i * 4) >> 2];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer) continue;
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }
    function _glDeleteSamplers(n, samplers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(samplers + i * 4) >> 2];
        var sampler = GL.samplers[id];
        if (!sampler) continue;
        GLctx.deleteSampler(sampler);
        sampler.name = 0;
        GL.samplers[id] = null;
      }
    }
    function _glDeleteShader(id) {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }
    function _glDeleteSync(id) {
      if (!id) return;
      var sync = GL.syncs[id];
      if (!sync) {
        GL.recordError(1281);
        return;
      }
      GLctx.deleteSync(sync);
      sync.name = 0;
      GL.syncs[id] = null;
    }
    function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(textures + i * 4) >> 2];
        var texture = GL.textures[id];
        if (!texture) continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }
    function _glDeleteVertexArrays(n, vaos) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(vaos + i * 4) >> 2];
        GLctx.deleteVertexArray(GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }
    function _glDepthFunc(x0) {
      GLctx.depthFunc(x0);
    }
    function _glDepthMask(flag) {
      GLctx.depthMask(!!flag);
    }
    function _glDetachShader(program, shader) {
      GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
    }
    function _glDisable(x0) {
      GLctx.disable(x0);
    }
    function _glDisableVertexAttribArray(index) {
      var cb = GL.currentContext.clientBuffers[index];
      cb.enabled = false;
      GLctx.disableVertexAttribArray(index);
    }
    function _glDrawArrays(mode, first, count) {
      GL.preDrawHandleClientVertexAttribBindings(first + count);
      GLctx.drawArrays(mode, first, count);
      GL.postDrawHandleClientVertexAttribBindings();
    }
    function _glDrawArraysInstanced(mode, first, count, primcount) {
      GLctx.drawArraysInstanced(mode, first, count, primcount);
    }
    var tempFixedLengthArray = [];
    function _glDrawBuffers(n, bufs) {
      var bufArray = tempFixedLengthArray[n];
      for (var i = 0; i < n; i++) {
        bufArray[i] = HEAP32[(bufs + i * 4) >> 2];
      }
      GLctx.drawBuffers(bufArray);
    }
    function _glDrawElements(mode, count, type, indices) {
      var buf;
      if (!GLctx.currentElementArrayBufferBinding) {
        var size = GL.calcBufLength(1, type, 0, count);
        buf = GL.getTempIndexBuffer(size);
        GLctx.bindBuffer(34963, buf);
        GLctx.bufferSubData(34963, 0, HEAPU8.subarray(indices, indices + size));
        indices = 0;
      }
      GL.preDrawHandleClientVertexAttribBindings(count);
      GLctx.drawElements(mode, count, type, indices);
      GL.postDrawHandleClientVertexAttribBindings(count);
      if (!GLctx.currentElementArrayBufferBinding) {
        GLctx.bindBuffer(34963, null);
      }
    }
    function _glDrawElementsInstanced(mode, count, type, indices, primcount) {
      GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
    }
    function _glEnable(x0) {
      GLctx.enable(x0);
    }
    function _glEnableVertexAttribArray(index) {
      var cb = GL.currentContext.clientBuffers[index];
      cb.enabled = true;
      GLctx.enableVertexAttribArray(index);
    }
    function _glEndQuery(x0) {
      GLctx.endQuery(x0);
    }
    function _glFenceSync(condition, flags) {
      var sync = GLctx.fenceSync(condition, flags);
      if (sync) {
        var id = GL.getNewId(GL.syncs);
        sync.name = id;
        GL.syncs[id] = sync;
        return id;
      }
      return 0;
    }
    function _glFinish() {
      GLctx.finish();
    }
    function _glFlush() {
      GLctx.flush();
    }
    function emscriptenWebGLGetBufferBinding(target) {
      switch (target) {
        case 34962:
          target = 34964;
          break;
        case 34963:
          target = 34965;
          break;
        case 35051:
          target = 35053;
          break;
        case 35052:
          target = 35055;
          break;
        case 35982:
          target = 35983;
          break;
        case 36662:
          target = 36662;
          break;
        case 36663:
          target = 36663;
          break;
        case 35345:
          target = 35368;
          break;
      }
      var buffer = GLctx.getParameter(target);
      if (buffer) return buffer.name | 0;
      else return 0;
    }
    function emscriptenWebGLValidateMapBufferTarget(target) {
      switch (target) {
        case 34962:
        case 34963:
        case 36662:
        case 36663:
        case 35051:
        case 35052:
        case 35882:
        case 35982:
        case 35345:
          return true;
        default:
          return false;
      }
    }
    function _glFlushMappedBufferRange(target, offset, length) {
      if (!emscriptenWebGLValidateMapBufferTarget(target)) {
        GL.recordError(1280);
        err("GL_INVALID_ENUM in glFlushMappedBufferRange");
        return;
      }
      var mapping = GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)];
      if (!mapping) {
        GL.recordError(1282);
        err("buffer was never mapped in glFlushMappedBufferRange");
        return;
      }
      if (!(mapping.access & 16)) {
        GL.recordError(1282);
        err(
          "buffer was not mapped with GL_MAP_FLUSH_EXPLICIT_BIT in glFlushMappedBufferRange"
        );
        return;
      }
      if (offset < 0 || length < 0 || offset + length > mapping.length) {
        GL.recordError(1281);
        err("invalid range in glFlushMappedBufferRange");
        return;
      }
      GLctx.bufferSubData(
        target,
        mapping.offset,
        HEAPU8.subarray(mapping.mem + offset, mapping.mem + offset + length)
      );
    }
    function _glFramebufferRenderbuffer(
      target,
      attachment,
      renderbuffertarget,
      renderbuffer
    ) {
      GLctx.framebufferRenderbuffer(
        target,
        attachment,
        renderbuffertarget,
        GL.renderbuffers[renderbuffer]
      );
    }
    function _glFramebufferTexture2D(
      target,
      attachment,
      textarget,
      texture,
      level
    ) {
      GLctx.framebufferTexture2D(
        target,
        attachment,
        textarget,
        GL.textures[texture],
        level
      );
    }
    function _glFramebufferTextureLayer(
      target,
      attachment,
      texture,
      level,
      layer
    ) {
      GLctx.framebufferTextureLayer(
        target,
        attachment,
        GL.textures[texture],
        level,
        layer
      );
    }
    function _glFrontFace(x0) {
      GLctx.frontFace(x0);
    }
    function __glGenObject(n, buffers, createFunction, objectTable) {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx[createFunction]();
        var id = buffer && GL.getNewId(objectTable);
        if (buffer) {
          buffer.name = id;
          objectTable[id] = buffer;
        } else {
          GL.recordError(1282);
        }
        HEAP32[(buffers + i * 4) >> 2] = id;
      }
    }
    function _glGenBuffers(n, buffers) {
      __glGenObject(n, buffers, "createBuffer", GL.buffers);
    }
    function _glGenFramebuffers(n, ids) {
      __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
    }
    function _glGenQueries(n, ids) {
      __glGenObject(n, ids, "createQuery", GL.queries);
    }
    function _glGenRenderbuffers(n, renderbuffers) {
      __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
    }
    function _glGenSamplers(n, samplers) {
      __glGenObject(n, samplers, "createSampler", GL.samplers);
    }
    function _glGenTextures(n, textures) {
      __glGenObject(n, textures, "createTexture", GL.textures);
    }
    function _glGenVertexArrays(n, arrays) {
      __glGenObject(n, arrays, "createVertexArray", GL.vaos);
    }
    function _glGenerateMipmap(x0) {
      GLctx.generateMipmap(x0);
    }
    function __glGetActiveAttribOrUniform(
      funcName,
      program,
      index,
      bufSize,
      length,
      size,
      type,
      name
    ) {
      program = GL.programs[program];
      var info = GLctx[funcName](program, index);
      if (info) {
        var numBytesWrittenExclNull =
          name && stringToUTF8(info.name, name, bufSize);
        if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
        if (size) HEAP32[size >> 2] = info.size;
        if (type) HEAP32[type >> 2] = info.type;
      }
    }
    function _glGetActiveAttrib(
      program,
      index,
      bufSize,
      length,
      size,
      type,
      name
    ) {
      __glGetActiveAttribOrUniform(
        "getActiveAttrib",
        program,
        index,
        bufSize,
        length,
        size,
        type,
        name
      );
    }
    function _glGetActiveUniform(
      program,
      index,
      bufSize,
      length,
      size,
      type,
      name
    ) {
      __glGetActiveAttribOrUniform(
        "getActiveUniform",
        program,
        index,
        bufSize,
        length,
        size,
        type,
        name
      );
    }
    function _glGetActiveUniformBlockName(
      program,
      uniformBlockIndex,
      bufSize,
      length,
      uniformBlockName
    ) {
      program = GL.programs[program];
      var result = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
      if (!result) return;
      if (uniformBlockName && bufSize > 0) {
        var numBytesWrittenExclNull = stringToUTF8(
          result,
          uniformBlockName,
          bufSize
        );
        if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
      } else {
        if (length) HEAP32[length >> 2] = 0;
      }
    }
    function _glGetActiveUniformBlockiv(
      program,
      uniformBlockIndex,
      pname,
      params
    ) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      if (pname == 35393) {
        var name = GLctx.getActiveUniformBlockName(program, uniformBlockIndex);
        HEAP32[params >> 2] = name.length + 1;
        return;
      }
      var result = GLctx.getActiveUniformBlockParameter(
        program,
        uniformBlockIndex,
        pname
      );
      if (result === null) return;
      if (pname == 35395) {
        for (var i = 0; i < result.length; i++) {
          HEAP32[(params + i * 4) >> 2] = result[i];
        }
      } else {
        HEAP32[params >> 2] = result;
      }
    }
    function _glGetActiveUniformsiv(
      program,
      uniformCount,
      uniformIndices,
      pname,
      params
    ) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      if (uniformCount > 0 && uniformIndices == 0) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      var ids = [];
      for (var i = 0; i < uniformCount; i++) {
        ids.push(HEAP32[(uniformIndices + i * 4) >> 2]);
      }
      var result = GLctx.getActiveUniforms(program, ids, pname);
      if (!result) return;
      var len = result.length;
      for (var i = 0; i < len; i++) {
        HEAP32[(params + i * 4) >> 2] = result[i];
      }
    }
    function _glGetAttribLocation(program, name) {
      return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
    }
    function _glGetBufferSubData(target, offset, size, data) {
      if (!data) {
        GL.recordError(1281);
        return;
      }
      size && GLctx.getBufferSubData(target, offset, HEAPU8, data, size);
    }
    function _glGetError() {
      var error = GLctx.getError() || GL.lastError;
      GL.lastError = 0;
      return error;
    }
    function _glGetFramebufferAttachmentParameteriv(
      target,
      attachment,
      pname,
      params
    ) {
      var result = GLctx.getFramebufferAttachmentParameter(
        target,
        attachment,
        pname
      );
      if (
        result instanceof WebGLRenderbuffer ||
        result instanceof WebGLTexture
      ) {
        result = result.name | 0;
      }
      HEAP32[params >> 2] = result;
    }
    function writeI53ToI64(ptr, num) {
      HEAPU32[ptr >> 2] = num;
      HEAPU32[(ptr + 4) >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
    }
    function emscriptenWebGLGetIndexed(target, index, data, type) {
      if (!data) {
        GL.recordError(1281);
        return;
      }
      var result = GLctx.getIndexedParameter(target, index);
      var ret;
      switch (typeof result) {
        case "boolean":
          ret = result ? 1 : 0;
          break;
        case "number":
          ret = result;
          break;
        case "object":
          if (result === null) {
            switch (target) {
              case 35983:
              case 35368:
                ret = 0;
                break;
              default: {
                GL.recordError(1280);
                return;
              }
            }
          } else if (result instanceof WebGLBuffer) {
            ret = result.name | 0;
          } else {
            GL.recordError(1280);
            return;
          }
          break;
        default:
          GL.recordError(1280);
          return;
      }
      switch (type) {
        case 1:
          writeI53ToI64(data, ret);
          break;
        case 0:
          HEAP32[data >> 2] = ret;
          break;
        case 2:
          HEAPF32[data >> 2] = ret;
          break;
        case 4:
          HEAP8[data >> 0] = ret ? 1 : 0;
          break;
        default:
          throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type;
      }
    }
    function _glGetIntegeri_v(target, index, data) {
      emscriptenWebGLGetIndexed(target, index, data, 0);
    }
    function emscriptenWebGLGet(name_, p, type) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      var ret = undefined;
      switch (name_) {
        case 36346:
          ret = 1;
          break;
        case 36344:
          if (type != 0 && type != 1) {
            GL.recordError(1280);
          }
          return;
        case 34814:
        case 36345:
          ret = 0;
          break;
        case 34466:
          var formats = GLctx.getParameter(34467);
          ret = formats ? formats.length : 0;
          break;
        case 33390:
          ret = 1048576;
          break;
        case 33309:
          if (GL.currentContext.version < 2) {
            GL.recordError(1282);
            return;
          }
          var exts = GLctx.getSupportedExtensions() || [];
          ret = 2 * exts.length;
          break;
        case 33307:
        case 33308:
          if (GL.currentContext.version < 2) {
            GL.recordError(1280);
            return;
          }
          ret = name_ == 33307 ? 3 : 0;
          break;
      }
      if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(1280);
            return;
          case "object":
            if (result === null) {
              switch (name_) {
                case 34964:
                case 35725:
                case 34965:
                case 36006:
                case 36007:
                case 32873:
                case 34229:
                case 36662:
                case 36663:
                case 35053:
                case 35055:
                case 36010:
                case 35097:
                case 35869:
                case 32874:
                case 36389:
                case 35983:
                case 35368:
                case 34068: {
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(1280);
                  return;
                }
              }
            } else if (
              result instanceof Float32Array ||
              result instanceof Uint32Array ||
              result instanceof Int32Array ||
              result instanceof Array
            ) {
              for (var i = 0; i < result.length; ++i) {
                switch (type) {
                  case 0:
                    HEAP32[(p + i * 4) >> 2] = result[i];
                    break;
                  case 2:
                    HEAPF32[(p + i * 4) >> 2] = result[i];
                    break;
                  case 4:
                    HEAP8[(p + i) >> 0] = result[i] ? 1 : 0;
                    break;
                }
              }
              return;
            } else {
              try {
                ret = result.name | 0;
              } catch (e) {
                GL.recordError(1280);
                err(
                  "GL_INVALID_ENUM in glGet" +
                    type +
                    "v: Unknown object returned from WebGL getParameter(" +
                    name_ +
                    ")! (error: " +
                    e +
                    ")"
                );
                return;
              }
            }
            break;
          default:
            GL.recordError(1280);
            err(
              "GL_INVALID_ENUM in glGet" +
                type +
                "v: Native code calling glGet" +
                type +
                "v(" +
                name_ +
                ") and it returns " +
                result +
                " of type " +
                typeof result +
                "!"
            );
            return;
        }
      }
      switch (type) {
        case 1:
          writeI53ToI64(p, ret);
          break;
        case 0:
          HEAP32[p >> 2] = ret;
          break;
        case 2:
          HEAPF32[p >> 2] = ret;
          break;
        case 4:
          HEAP8[p >> 0] = ret ? 1 : 0;
          break;
      }
    }
    function _glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 0);
    }
    function _glGetInternalformativ(
      target,
      internalformat,
      pname,
      bufSize,
      params
    ) {
      if (bufSize < 0) {
        GL.recordError(1281);
        return;
      }
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var ret = GLctx.getInternalformatParameter(target, internalformat, pname);
      if (ret === null) return;
      for (var i = 0; i < ret.length && i < bufSize; ++i) {
        HEAP32[(params + i * 4) >> 2] = ret[i];
      }
    }
    function _glGetProgramBinary(
      program,
      bufSize,
      length,
      binaryFormat,
      binary
    ) {
      GL.recordError(1282);
    }
    function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = "(unknown error)";
      var numBytesWrittenExclNull =
        maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _glGetProgramiv(program, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (program >= GL.counter) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      if (pname == 35716) {
        var log = GLctx.getProgramInfoLog(program);
        if (log === null) log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1;
      } else if (pname == 35719) {
        if (!program.maxUniformLength) {
          for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
            program.maxUniformLength = Math.max(
              program.maxUniformLength,
              GLctx.getActiveUniform(program, i).name.length + 1
            );
          }
        }
        HEAP32[p >> 2] = program.maxUniformLength;
      } else if (pname == 35722) {
        if (!program.maxAttributeLength) {
          for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
            program.maxAttributeLength = Math.max(
              program.maxAttributeLength,
              GLctx.getActiveAttrib(program, i).name.length + 1
            );
          }
        }
        HEAP32[p >> 2] = program.maxAttributeLength;
      } else if (pname == 35381) {
        if (!program.maxUniformBlockNameLength) {
          for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
            program.maxUniformBlockNameLength = Math.max(
              program.maxUniformBlockNameLength,
              GLctx.getActiveUniformBlockName(program, i).length + 1
            );
          }
        }
        HEAP32[p >> 2] = program.maxUniformBlockNameLength;
      } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
      }
    }
    function _glGetQueryObjectuiv(id, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      var query = GL.queries[id];
      var param = GLctx.getQueryParameter(query, pname);
      var ret;
      if (typeof param == "boolean") {
        ret = param ? 1 : 0;
      } else {
        ret = param;
      }
      HEAP32[params >> 2] = ret;
    }
    function _glGetQueryiv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getQuery(target, pname);
    }
    function _glGetRenderbufferParameteriv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
    }
    function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = "(unknown error)";
      var numBytesWrittenExclNull =
        maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
      if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _glGetShaderPrecisionFormat(
      shaderType,
      precisionType,
      range,
      precision
    ) {
      var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
      HEAP32[range >> 2] = result.rangeMin;
      HEAP32[(range + 4) >> 2] = result.rangeMax;
      HEAP32[precision >> 2] = result.precision;
    }
    function _glGetShaderSource(shader, bufSize, length, source) {
      var result = GLctx.getShaderSource(GL.shaders[shader]);
      if (!result) return;
      var numBytesWrittenExclNull =
        bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
      if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
    }
    function _glGetShaderiv(shader, pname, p) {
      if (!p) {
        GL.recordError(1281);
        return;
      }
      if (pname == 35716) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = "(unknown error)";
        var logLength = log ? log.length + 1 : 0;
        HEAP32[p >> 2] = logLength;
      } else if (pname == 35720) {
        var source = GLctx.getShaderSource(GL.shaders[shader]);
        var sourceLength = source ? source.length + 1 : 0;
        HEAP32[p >> 2] = sourceLength;
      } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }
    function _glGetString(name_) {
      var ret = GL.stringCache[name_];
      if (!ret) {
        switch (name_) {
          case 7939:
            var exts = GLctx.getSupportedExtensions() || [];
            exts = exts.concat(
              exts.map(function (e) {
                return "GL_" + e;
              })
            );
            ret = stringToNewUTF8(exts.join(" "));
            break;
          case 7936:
          case 7937:
          case 37445:
          case 37446:
            var s = GLctx.getParameter(name_);
            if (!s) {
              GL.recordError(1280);
            }
            ret = s && stringToNewUTF8(s);
            break;
          case 7938:
            var glVersion = GLctx.getParameter(7938);
            if (GL.currentContext.version >= 2)
              glVersion = "OpenGL ES 3.0 (" + glVersion + ")";
            else {
              glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
            }
            ret = stringToNewUTF8(glVersion);
            break;
          case 35724:
            var glslVersion = GLctx.getParameter(35724);
            var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            var ver_num = glslVersion.match(ver_re);
            if (ver_num !== null) {
              if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
              glslVersion =
                "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
            }
            ret = stringToNewUTF8(glslVersion);
            break;
          default:
            GL.recordError(1280);
        }
        GL.stringCache[name_] = ret;
      }
      return ret;
    }
    function _glGetStringi(name, index) {
      if (GL.currentContext.version < 2) {
        GL.recordError(1282);
        return 0;
      }
      var stringiCache = GL.stringiCache[name];
      if (stringiCache) {
        if (index < 0 || index >= stringiCache.length) {
          GL.recordError(1281);
          return 0;
        }
        return stringiCache[index];
      }
      switch (name) {
        case 7939:
          var exts = GLctx.getSupportedExtensions() || [];
          exts = exts.concat(
            exts.map(function (e) {
              return "GL_" + e;
            })
          );
          exts = exts.map(function (e) {
            return stringToNewUTF8(e);
          });
          stringiCache = GL.stringiCache[name] = exts;
          if (index < 0 || index >= stringiCache.length) {
            GL.recordError(1281);
            return 0;
          }
          return stringiCache[index];
        default:
          GL.recordError(1280);
          return 0;
      }
    }
    function _glGetTexParameteriv(target, pname, params) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
    }
    function _glGetUniformBlockIndex(program, uniformBlockName) {
      return GLctx.getUniformBlockIndex(
        GL.programs[program],
        UTF8ToString(uniformBlockName)
      );
    }
    function _glGetUniformIndices(
      program,
      uniformCount,
      uniformNames,
      uniformIndices
    ) {
      if (!uniformIndices) {
        GL.recordError(1281);
        return;
      }
      if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      var names = [];
      for (var i = 0; i < uniformCount; i++)
        names.push(UTF8ToString(HEAP32[(uniformNames + i * 4) >> 2]));
      var result = GLctx.getUniformIndices(program, names);
      if (!result) return;
      var len = result.length;
      for (var i = 0; i < len; i++) {
        HEAP32[(uniformIndices + i * 4) >> 2] = result[i];
      }
    }
    function webglGetLeftBracePos(name) {
      return name.slice(-1) == "]" && name.lastIndexOf("[");
    }
    function webglPrepareUniformLocationsBeforeFirstUse(program) {
      var uniformLocsById = program.uniformLocsById,
        uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,
        i,
        j;
      if (!uniformLocsById) {
        program.uniformLocsById = uniformLocsById = {};
        program.uniformArrayNamesById = {};
        for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
          var u = GLctx.getActiveUniform(program, i);
          var nm = u.name;
          var sz = u.size;
          var lb = webglGetLeftBracePos(nm);
          var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
          var id = uniformSizeAndIdsByName[arrayName]
            ? uniformSizeAndIdsByName[arrayName][1]
            : program.uniformIdCounter;
          program.uniformIdCounter = Math.max(
            id + sz,
            program.uniformIdCounter
          );
          uniformSizeAndIdsByName[arrayName] = [sz, id];
          for (j = 0; j < sz; ++j) {
            uniformLocsById[id] = j;
            program.uniformArrayNamesById[id++] = arrayName;
          }
        }
      }
    }
    function _glGetUniformLocation(program, name) {
      name = UTF8ToString(name);
      if ((program = GL.programs[program])) {
        webglPrepareUniformLocationsBeforeFirstUse(program);
        var uniformLocsById = program.uniformLocsById;
        var arrayIndex = 0;
        var uniformBaseName = name;
        var leftBrace = webglGetLeftBracePos(name);
        if (leftBrace > 0) {
          arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
          uniformBaseName = name.slice(0, leftBrace);
        }
        var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
        if (sizeAndId && arrayIndex < sizeAndId[0]) {
          arrayIndex += sizeAndId[1];
          if (
            (uniformLocsById[arrayIndex] =
              uniformLocsById[arrayIndex] ||
              GLctx.getUniformLocation(program, name))
          ) {
            return arrayIndex;
          }
        }
      } else {
        GL.recordError(1281);
      }
      return -1;
    }
    function webglGetUniformLocation(location) {
      var p = GLctx.currentProgram;
      if (p) {
        var webglLoc = p.uniformLocsById[location];
        if (typeof webglLoc == "number") {
          p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(
            p,
            p.uniformArrayNamesById[location] +
              (webglLoc > 0 ? "[" + webglLoc + "]" : "")
          );
        }
        return webglLoc;
      } else {
        GL.recordError(1282);
      }
    }
    function emscriptenWebGLGetUniform(program, location, params, type) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      program = GL.programs[program];
      webglPrepareUniformLocationsBeforeFirstUse(program);
      var data = GLctx.getUniform(program, webglGetUniformLocation(location));
      if (typeof data == "number" || typeof data == "boolean") {
        switch (type) {
          case 0:
            HEAP32[params >> 2] = data;
            break;
          case 2:
            HEAPF32[params >> 2] = data;
            break;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 0:
              HEAP32[(params + i * 4) >> 2] = data[i];
              break;
            case 2:
              HEAPF32[(params + i * 4) >> 2] = data[i];
              break;
          }
        }
      }
    }
    function _glGetUniformiv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 0);
    }
    function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
      if (!params) {
        GL.recordError(1281);
        return;
      }
      if (GL.currentContext.clientBuffers[index].enabled) {
        err(
          "glGetVertexAttrib*v on client-side array: not supported, bad data returned"
        );
      }
      var data = GLctx.getVertexAttrib(index, pname);
      if (pname == 34975) {
        HEAP32[params >> 2] = data && data["name"];
      } else if (typeof data == "number" || typeof data == "boolean") {
        switch (type) {
          case 0:
            HEAP32[params >> 2] = data;
            break;
          case 2:
            HEAPF32[params >> 2] = data;
            break;
          case 5:
            HEAP32[params >> 2] = Math.fround(data);
            break;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 0:
              HEAP32[(params + i * 4) >> 2] = data[i];
              break;
            case 2:
              HEAPF32[(params + i * 4) >> 2] = data[i];
              break;
            case 5:
              HEAP32[(params + i * 4) >> 2] = Math.fround(data[i]);
              break;
          }
        }
      }
    }
    function _glGetVertexAttribiv(index, pname, params) {
      emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
    }
    function _glInvalidateFramebuffer(target, numAttachments, attachments) {
      var list = tempFixedLengthArray[numAttachments];
      for (var i = 0; i < numAttachments; i++) {
        list[i] = HEAP32[(attachments + i * 4) >> 2];
      }
      GLctx.invalidateFramebuffer(target, list);
    }
    function _glIsEnabled(x0) {
      return GLctx.isEnabled(x0);
    }
    function _glIsVertexArray(array) {
      var vao = GL.vaos[array];
      if (!vao) return 0;
      return GLctx.isVertexArray(vao);
    }
    function _glLinkProgram(program) {
      program = GL.programs[program];
      GLctx.linkProgram(program);
      program.uniformLocsById = 0;
      program.uniformSizeAndIdsByName = {};
      [program["vs"], program["fs"]].forEach(function (s) {
        Object.keys(s.explicitUniformLocations).forEach(function (
          shaderLocation
        ) {
          var loc = s.explicitUniformLocations[shaderLocation];
          program.uniformSizeAndIdsByName[shaderLocation] = [1, loc];
          program.uniformIdCounter = Math.max(
            program.uniformIdCounter,
            loc + 1
          );
        });
      });
      function copyKeys(dst, src) {
        Object.keys(src).forEach(function (key) {
          dst[key] = src[key];
        });
      }
      program.explicitUniformBindings = {};
      program.explicitSamplerBindings = {};
      [program["vs"], program["fs"]].forEach(function (s) {
        copyKeys(program.explicitUniformBindings, s.explicitUniformBindings);
        copyKeys(program.explicitSamplerBindings, s.explicitSamplerBindings);
      });
      program.explicitProgramBindingsApplied = 0;
    }
    function _glMapBufferRange(target, offset, length, access) {
      if ((access & (1 | 32)) != 0) {
        err(
          "glMapBufferRange access does not support MAP_READ or MAP_UNSYNCHRONIZED"
        );
        return 0;
      }
      if ((access & 2) == 0) {
        err("glMapBufferRange access must include MAP_WRITE");
        return 0;
      }
      if ((access & (4 | 8)) == 0) {
        err(
          "glMapBufferRange access must include INVALIDATE_BUFFER or INVALIDATE_RANGE"
        );
        return 0;
      }
      if (!emscriptenWebGLValidateMapBufferTarget(target)) {
        GL.recordError(1280);
        err("GL_INVALID_ENUM in glMapBufferRange");
        return 0;
      }
      var mem = _malloc(length);
      if (!mem) return 0;
      GL.mappedBuffers[emscriptenWebGLGetBufferBinding(target)] = {
        offset: offset,
        length: length,
        mem: mem,
        access: access,
      };
      return mem;
    }
    function _glPixelStorei(pname, param) {
      if (pname == 3317) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }
    function _glPolygonOffset(x0, x1) {
      GLctx.polygonOffset(x0, x1);
    }
    function _glProgramBinary(program, binaryFormat, binary, length) {
      GL.recordError(1280);
    }
    function _glProgramParameteri(program, pname, value) {
      GL.recordError(1280);
    }
    function _glReadBuffer(x0) {
      GLctx.readBuffer(x0);
    }
    function computeUnpackAlignedImageSize(
      width,
      height,
      sizePerPixel,
      alignment
    ) {
      function roundedToNextMultipleOf(x, y) {
        return (x + y - 1) & -y;
      }
      var plainRowSize = width * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
      return height * alignedRowSize;
    }
    function colorChannelsInGlTextureFormat(format) {
      var colorChannels = {
        5: 3,
        6: 4,
        8: 2,
        29502: 3,
        29504: 4,
        26917: 2,
        26918: 2,
        29846: 3,
        29847: 4,
      };
      return colorChannels[format - 6402] || 1;
    }
    function heapObjectForWebGLType(type) {
      type -= 5120;
      if (type == 0) return HEAP8;
      if (type == 1) return HEAPU8;
      if (type == 2) return HEAP16;
      if (type == 4) return HEAP32;
      if (type == 6) return HEAPF32;
      if (
        type == 5 ||
        type == 28922 ||
        type == 28520 ||
        type == 30779 ||
        type == 30782
      )
        return HEAPU32;
      return HEAPU16;
    }
    function heapAccessShiftForWebGLHeap(heap) {
      return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
    }
    function emscriptenWebGLGetTexPixelData(
      type,
      format,
      width,
      height,
      pixels,
      internalFormat
    ) {
      var heap = heapObjectForWebGLType(type);
      var shift = heapAccessShiftForWebGLHeap(heap);
      var sizePerPixel = colorChannelsInGlTextureFormat(format) << shift;
      var bytes = computeUnpackAlignedImageSize(
        width,
        height,
        sizePerPixel,
        GL.unpackAlignment
      );
      return heap.subarray(pixels >> shift, (pixels + bytes) >> shift);
    }
    function _glReadPixels(x, y, width, height, format, type, pixels) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelPackBufferBinding) {
          GLctx.readPixels(x, y, width, height, format, type, pixels);
        } else {
          var heap = heapObjectForWebGLType(type);
          GLctx.readPixels(
            x,
            y,
            width,
            height,
            format,
            type,
            heap,
            pixels >> heapAccessShiftForWebGLHeap(heap)
          );
        }
        return;
      }
      var pixelData = emscriptenWebGLGetTexPixelData(
        type,
        format,
        width,
        height,
        pixels,
        format
      );
      if (!pixelData) {
        GL.recordError(1280);
        return;
      }
      GLctx.readPixels(x, y, width, height, format, type, pixelData);
    }
    function _glRenderbufferStorage(x0, x1, x2, x3) {
      GLctx.renderbufferStorage(x0, x1, x2, x3);
    }
    function _glRenderbufferStorageMultisample(x0, x1, x2, x3, x4) {
      GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);
    }
    function _glSamplerParameteri(sampler, pname, param) {
      GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
    }
    function _glScissor(x0, x1, x2, x3) {
      GLctx.scissor(x0, x1, x2, x3);
    }
    function find_closing_parens_index(arr, i, opening = "(", closing = ")") {
      for (var nesting = 0; i < arr.length; ++i) {
        if (arr[i] == opening) ++nesting;
        if (arr[i] == closing && --nesting == 0) {
          return i;
        }
      }
    }
    function preprocess_c_code(code, defs = {}) {
      var i = 0,
        len = code.length,
        out = "",
        stack = [1];
      defs["defined"] = (args) => {
        return defs[args[0].trim()] ? 1 : 0;
      };
      function isWhitespace(str, i) {
        return !(str.charCodeAt(i) > 32);
      }
      function nextWhitespace(str, i) {
        while (!isWhitespace(str, i)) ++i;
        return i;
      }
      function classifyChar(str, idx) {
        var cc = str.charCodeAt(idx);
        if (cc > 32) {
          if (cc < 48) return 1;
          if (cc < 58) return 2;
          if (cc < 65) return 1;
          if (cc < 91 || cc == 95) return 3;
          if (cc < 97) return 1;
          if (cc < 123) return 3;
          return 1;
        }
        return cc < 33 ? 0 : 4;
      }
      function tokenize(exprString, keepWhitespace) {
        var out = [],
          len = exprString.length;
        for (var i = 0; i <= len; ++i) {
          var kind = classifyChar(exprString, i);
          if (kind == 2 || kind == 3) {
            for (var j = i + 1; j <= len; ++j) {
              var kind2 = classifyChar(exprString, j);
              if (kind2 != kind && (kind2 != 2 || kind != 3)) {
                out.push(exprString.substring(i, j));
                i = j - 1;
                break;
              }
            }
          } else if (kind == 1) {
            var op2 = exprString.substr(i, 2);
            if (["<=", ">=", "==", "!=", "&&", "||"].includes(op2)) {
              out.push(op2);
              ++i;
            } else {
              out.push(exprString[i]);
            }
          }
        }
        return out;
      }
      function expandMacros(str, lineStart, lineEnd) {
        if (lineEnd === undefined) lineEnd = str.length;
        var len = str.length;
        var out = "";
        for (var i = lineStart; i < lineEnd; ++i) {
          var kind = classifyChar(str, i);
          if (kind == 3) {
            for (var j = i + 1; j <= lineEnd; ++j) {
              var kind2 = classifyChar(str, j);
              if (kind2 != 2 && kind2 != 3) {
                var symbol = str.substring(i, j);
                var pp = defs[symbol];
                if (pp) {
                  var expanded = str.substring(lineStart, i);
                  if (pp.length) {
                    while (isWhitespace(str, j)) ++j;
                    if (str[j] == "(") {
                      var closeParens = find_closing_parens_index(str, j);
                      expanded +=
                        pp(str.substring(j + 1, closeParens).split(",")) +
                        str.substring(closeParens + 1, lineEnd);
                    } else {
                      var j2 = nextWhitespace(str, j);
                      expanded +=
                        pp([str.substring(j, j2)]) + str.substring(j2, lineEnd);
                    }
                  } else {
                    expanded += pp() + str.substring(j, lineEnd);
                  }
                  return expandMacros(expanded, 0);
                }
                out += symbol;
                i = j - 1;
                break;
              }
            }
          } else {
            out += str[i];
          }
        }
        return out;
      }
      function buildExprTree(tokens) {
        while (tokens.length > 1 || typeof tokens[0] != "function") {
          tokens = (function (tokens) {
            var i,
              j,
              p,
              operatorAndPriority = -2;
            for (j = 0; j < tokens.length; ++j) {
              if (
                (p = [
                  "*",
                  "/",
                  "+",
                  "-",
                  "!",
                  "<",
                  "<=",
                  ">",
                  ">=",
                  "==",
                  "!=",
                  "&&",
                  "||",
                  "(",
                ].indexOf(tokens[j])) > operatorAndPriority
              ) {
                i = j;
                operatorAndPriority = p;
              }
            }
            if (operatorAndPriority == 13) {
              var j = find_closing_parens_index(tokens, i);
              if (j) {
                tokens.splice(
                  i,
                  j + 1 - i,
                  buildExprTree(tokens.slice(i + 1, j))
                );
                return tokens;
              }
            }
            if (operatorAndPriority == 4) {
              i = tokens.lastIndexOf("!");
              var innerExpr = buildExprTree(tokens.slice(i + 1, i + 2));
              tokens.splice(i, 2, function () {
                return !innerExpr();
              });
              return tokens;
            }
            if (operatorAndPriority >= 0) {
              var left = buildExprTree(tokens.slice(0, i));
              var right = buildExprTree(tokens.slice(i + 1));
              switch (tokens[i]) {
                case "&&":
                  return [
                    function () {
                      return left() && right();
                    },
                  ];
                case "||":
                  return [
                    function () {
                      return left() || right();
                    },
                  ];
                case "==":
                  return [
                    function () {
                      return left() == right();
                    },
                  ];
                case "!=":
                  return [
                    function () {
                      return left() != right();
                    },
                  ];
                case "<":
                  return [
                    function () {
                      return left() < right();
                    },
                  ];
                case "<=":
                  return [
                    function () {
                      return left() <= right();
                    },
                  ];
                case ">":
                  return [
                    function () {
                      return left() > right();
                    },
                  ];
                case ">=":
                  return [
                    function () {
                      return left() >= right();
                    },
                  ];
                case "+":
                  return [
                    function () {
                      return left() + right();
                    },
                  ];
                case "-":
                  return [
                    function () {
                      return left() - right();
                    },
                  ];
                case "*":
                  return [
                    function () {
                      return left() * right();
                    },
                  ];
                case "/":
                  return [
                    function () {
                      return Math.floor(left() / right());
                    },
                  ];
              }
            }
            var num = jstoi_q(tokens[i]);
            return [
              function () {
                return num;
              },
            ];
          })(tokens);
        }
        return tokens[0];
      }
      for (; i < len; ++i) {
        var lineStart = i;
        i = code.indexOf("\n", i);
        if (i < 0) i = len;
        for (var j = lineStart; j < i && isWhitespace(code, j); ++j);
        var thisLineIsInActivePreprocessingBlock = stack[stack.length - 1];
        if (code[j] != "#") {
          if (thisLineIsInActivePreprocessingBlock) {
            out += expandMacros(code, lineStart, i) + "\n";
          }
          continue;
        }
        var space = nextWhitespace(code, j);
        var directive = code.substring(j + 1, space);
        var expression = code.substring(space, i).trim();
        switch (directive) {
          case "if":
            var tokens = tokenize(expandMacros(expression, 0));
            var exprTree = buildExprTree(tokens);
            var evaluated = exprTree();
            stack.push(!!evaluated * stack[stack.length - 1]);
            break;
          case "ifdef":
            stack.push(!!defs[expression] * stack[stack.length - 1]);
            break;
          case "ifndef":
            stack.push(!defs[expression] * stack[stack.length - 1]);
            break;
          case "else":
            stack[stack.length - 1] =
              (1 - stack[stack.length - 1]) * stack[stack.length - 2];
            break;
          case "endif":
            stack.pop();
            break;
          case "define":
            if (thisLineIsInActivePreprocessingBlock) {
              var macroStart = expression.indexOf("(");
              var firstWs = nextWhitespace(expression, 0);
              if (firstWs < macroStart) macroStart = 0;
              if (macroStart > 0) {
                var macroEnd = expression.indexOf(")", macroStart);
                let params = expression
                  .substring(macroStart + 1, macroEnd)
                  .split(",")
                  .map((x) => x.trim());
                let value = tokenize(expression.substring(macroEnd + 1).trim());
                defs[expression.substring(0, macroStart)] = (args) => {
                  var ret = "";
                  value.forEach((x) => {
                    var argIndex = params.indexOf(x);
                    ret += argIndex >= 0 ? args[argIndex] : x;
                  });
                  return ret;
                };
              } else {
                let value = expandMacros(
                  expression.substring(firstWs + 1).trim(),
                  0
                );
                defs[expression.substring(0, firstWs)] = () => value;
              }
            }
            break;
          case "undef":
            if (thisLineIsInActivePreprocessingBlock) delete defs[expression];
            break;
          default:
            if (
              directive != "version" &&
              directive != "pragma" &&
              directive != "extension" &&
              directive != "line"
            ) {
            }
            out += expandMacros(code, lineStart, i) + "\n";
        }
      }
      return out;
    }
    function remove_cpp_comments_in_shaders(code) {
      var i = 0,
        out = "",
        ch,
        next,
        len = code.length;
      for (; i < len; ++i) {
        ch = code[i];
        if (ch == "/") {
          next = code[i + 1];
          if (next == "/") {
            while (i < len && code[i + 1] != "\n") ++i;
          } else if (next == "*") {
            while (i < len && (code[i - 1] != "*" || code[i] != "/")) ++i;
          } else {
            out += ch;
          }
        } else {
          out += ch;
        }
      }
      return out;
    }
    function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      source = preprocess_c_code(remove_cpp_comments_in_shaders(source), {
        GL_FRAGMENT_PRECISION_HIGH: () => 1,
        GL_ES: () => 1,
        __VERSION__: () => (source.includes("#version 300") ? 300 : 100),
      });
      var regex =
          /layout\s*\(\s*location\s*=\s*(-?\d+)\s*\)\s*(uniform\s+((lowp|mediump|highp)\s+)?\w+\s+(\w+))/g,
        explicitUniformLocations = {},
        match;
      while ((match = regex.exec(source))) {
        explicitUniformLocations[match[5]] = jstoi_q(match[1]);
        if (
          !(
            explicitUniformLocations[match[5]] >= 0 &&
            explicitUniformLocations[match[5]] < 1048576
          )
        ) {
          err(
            'Specified an out of range layout(location=x) directive "' +
              explicitUniformLocations[match[5]] +
              '"! (' +
              match[0] +
              ")"
          );
          GL.recordError(1281);
          return;
        }
      }
      source = source.replace(regex, "$2");
      GL.shaders[shader].explicitUniformLocations = explicitUniformLocations;
      var bindingRegex =
          /layout\s*\(.*?binding\s*=\s*(-?\d+).*?\)\s*uniform\s+(\w+)\s+(\w+)?/g,
        samplerBindings = {},
        uniformBindings = {},
        bindingMatch;
      while ((bindingMatch = bindingRegex.exec(source))) {
        var arrayLength = 1;
        for (
          var i = bindingMatch.index;
          i < source.length && source[i] != ";";
          ++i
        ) {
          if (source[i] == "[") {
            arrayLength = jstoi_q(source.slice(i + 1));
            break;
          }
          if (source[i] == "{")
            i = find_closing_parens_index(source, i, "{", "}") - 1;
        }
        var binding = jstoi_q(bindingMatch[1]);
        var bindingsType = 34930;
        if (bindingMatch[3] && bindingMatch[2].indexOf("sampler") != -1) {
          samplerBindings[bindingMatch[3]] = [binding, arrayLength];
        } else {
          bindingsType = 35374;
          uniformBindings[bindingMatch[2]] = [binding, arrayLength];
        }
        var numBindingPoints = GLctx.getParameter(bindingsType);
        if (!(binding >= 0 && binding + arrayLength <= numBindingPoints)) {
          err(
            'Specified an out of range layout(binding=x) directive "' +
              binding +
              '"! (' +
              bindingMatch[0] +
              "). Valid range is [0, " +
              numBindingPoints +
              "-1]"
          );
          GL.recordError(1281);
          return;
        }
      }
      source = source.replace(/layout\s*\(.*?binding\s*=\s*([-\d]+).*?\)/g, "");
      source = source.replace(
        /(layout\s*\((.*?)),\s*binding\s*=\s*([-\d]+)\)/g,
        "$1)"
      );
      source = source.replace(
        /layout\s*\(\s*binding\s*=\s*([-\d]+)\s*,(.*?)\)/g,
        "layout($2)"
      );
      GL.shaders[shader].explicitSamplerBindings = samplerBindings;
      GL.shaders[shader].explicitUniformBindings = uniformBindings;
      GLctx.shaderSource(GL.shaders[shader], source);
    }
    function _glStencilFuncSeparate(x0, x1, x2, x3) {
      GLctx.stencilFuncSeparate(x0, x1, x2, x3);
    }
    function _glStencilMask(x0) {
      GLctx.stencilMask(x0);
    }
    function _glStencilOpSeparate(x0, x1, x2, x3) {
      GLctx.stencilOpSeparate(x0, x1, x2, x3);
    }
    function _glTexImage2D(
      target,
      level,
      internalFormat,
      width,
      height,
      border,
      format,
      type,
      pixels
    ) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
          GLctx.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            pixels
          );
        } else if (pixels) {
          var heap = heapObjectForWebGLType(type);
          GLctx.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            heap,
            pixels >> heapAccessShiftForWebGLHeap(heap)
          );
        } else {
          GLctx.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            null
          );
        }
        return;
      }
      GLctx.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        border,
        format,
        type,
        pixels
          ? emscriptenWebGLGetTexPixelData(
              type,
              format,
              width,
              height,
              pixels,
              internalFormat
            )
          : null
      );
    }
    function _glTexImage3D(
      target,
      level,
      internalFormat,
      width,
      height,
      depth,
      border,
      format,
      type,
      pixels
    ) {
      if (GLctx.currentPixelUnpackBufferBinding) {
        GLctx.texImage3D(
          target,
          level,
          internalFormat,
          width,
          height,
          depth,
          border,
          format,
          type,
          pixels
        );
      } else if (pixels) {
        var heap = heapObjectForWebGLType(type);
        GLctx.texImage3D(
          target,
          level,
          internalFormat,
          width,
          height,
          depth,
          border,
          format,
          type,
          heap,
          pixels >> heapAccessShiftForWebGLHeap(heap)
        );
      } else {
        GLctx.texImage3D(
          target,
          level,
          internalFormat,
          width,
          height,
          depth,
          border,
          format,
          type,
          null
        );
      }
    }
    function _glTexParameterf(x0, x1, x2) {
      GLctx.texParameterf(x0, x1, x2);
    }
    function _glTexParameteri(x0, x1, x2) {
      GLctx.texParameteri(x0, x1, x2);
    }
    function _glTexParameteriv(target, pname, params) {
      var param = HEAP32[params >> 2];
      GLctx.texParameteri(target, pname, param);
    }
    function _glTexStorage2D(x0, x1, x2, x3, x4) {
      GLctx.texStorage2D(x0, x1, x2, x3, x4);
    }
    function _glTexStorage3D(x0, x1, x2, x3, x4, x5) {
      GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);
    }
    function _glTexSubImage2D(
      target,
      level,
      xoffset,
      yoffset,
      width,
      height,
      format,
      type,
      pixels
    ) {
      if (GL.currentContext.version >= 2) {
        if (GLctx.currentPixelUnpackBufferBinding) {
          GLctx.texSubImage2D(
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            type,
            pixels
          );
        } else if (pixels) {
          var heap = heapObjectForWebGLType(type);
          GLctx.texSubImage2D(
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            type,
            heap,
            pixels >> heapAccessShiftForWebGLHeap(heap)
          );
        } else {
          GLctx.texSubImage2D(
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            type,
            null
          );
        }
        return;
      }
      var pixelData = null;
      if (pixels)
        pixelData = emscriptenWebGLGetTexPixelData(
          type,
          format,
          width,
          height,
          pixels,
          0
        );
      GLctx.texSubImage2D(
        target,
        level,
        xoffset,
        yoffset,
        width,
        height,
        format,
        type,
        pixelData
      );
    }
    function _glTexSubImage3D(
      target,
      level,
      xoffset,
      yoffset,
      zoffset,
      width,
      height,
      depth,
      format,
      type,
      pixels
    ) {
      if (GLctx.currentPixelUnpackBufferBinding) {
        GLctx.texSubImage3D(
          target,
          level,
          xoffset,
          yoffset,
          zoffset,
          width,
          height,
          depth,
          format,
          type,
          pixels
        );
      } else if (pixels) {
        var heap = heapObjectForWebGLType(type);
        GLctx.texSubImage3D(
          target,
          level,
          xoffset,
          yoffset,
          zoffset,
          width,
          height,
          depth,
          format,
          type,
          heap,
          pixels >> heapAccessShiftForWebGLHeap(heap)
        );
      } else {
        GLctx.texSubImage3D(
          target,
          level,
          xoffset,
          yoffset,
          zoffset,
          width,
          height,
          depth,
          format,
          type,
          null
        );
      }
    }
    var miniTempWebGLFloatBuffers = [];
    function _glUniform1fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform1fv(
            webglGetUniformLocation(location),
            HEAPF32,
            value >> 2,
            count
          );
        return;
      }
      if (count <= 288) {
        var view = miniTempWebGLFloatBuffers[count - 1];
        for (var i = 0; i < count; ++i) {
          view[i] = HEAPF32[(value + 4 * i) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 4) >> 2);
      }
      GLctx.uniform1fv(webglGetUniformLocation(location), view);
    }
    function _glUniform1i(location, v0) {
      GLctx.uniform1i(webglGetUniformLocation(location), v0);
    }
    var miniTempWebGLIntBuffers = [];
    function _glUniform1iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform1iv(
            webglGetUniformLocation(location),
            HEAP32,
            value >> 2,
            count
          );
        return;
      }
      if (count <= 288) {
        var view = miniTempWebGLIntBuffers[count - 1];
        for (var i = 0; i < count; ++i) {
          view[i] = HEAP32[(value + 4 * i) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, (value + count * 4) >> 2);
      }
      GLctx.uniform1iv(webglGetUniformLocation(location), view);
    }
    function _glUniform1uiv(location, count, value) {
      count &&
        GLctx.uniform1uiv(
          webglGetUniformLocation(location),
          HEAPU32,
          value >> 2,
          count
        );
    }
    function _glUniform2fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform2fv(
            webglGetUniformLocation(location),
            HEAPF32,
            value >> 2,
            count * 2
          );
        return;
      }
      if (count <= 144) {
        var view = miniTempWebGLFloatBuffers[2 * count - 1];
        for (var i = 0; i < 2 * count; i += 2) {
          view[i] = HEAPF32[(value + 4 * i) >> 2];
          view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 8) >> 2);
      }
      GLctx.uniform2fv(webglGetUniformLocation(location), view);
    }
    function _glUniform2iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform2iv(
            webglGetUniformLocation(location),
            HEAP32,
            value >> 2,
            count * 2
          );
        return;
      }
      if (count <= 144) {
        var view = miniTempWebGLIntBuffers[2 * count - 1];
        for (var i = 0; i < 2 * count; i += 2) {
          view[i] = HEAP32[(value + 4 * i) >> 2];
          view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, (value + count * 8) >> 2);
      }
      GLctx.uniform2iv(webglGetUniformLocation(location), view);
    }
    function _glUniform2uiv(location, count, value) {
      count &&
        GLctx.uniform2uiv(
          webglGetUniformLocation(location),
          HEAPU32,
          value >> 2,
          count * 2
        );
    }
    function _glUniform3fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform3fv(
            webglGetUniformLocation(location),
            HEAPF32,
            value >> 2,
            count * 3
          );
        return;
      }
      if (count <= 96) {
        var view = miniTempWebGLFloatBuffers[3 * count - 1];
        for (var i = 0; i < 3 * count; i += 3) {
          view[i] = HEAPF32[(value + 4 * i) >> 2];
          view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2];
          view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 12) >> 2);
      }
      GLctx.uniform3fv(webglGetUniformLocation(location), view);
    }
    function _glUniform3iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform3iv(
            webglGetUniformLocation(location),
            HEAP32,
            value >> 2,
            count * 3
          );
        return;
      }
      if (count <= 96) {
        var view = miniTempWebGLIntBuffers[3 * count - 1];
        for (var i = 0; i < 3 * count; i += 3) {
          view[i] = HEAP32[(value + 4 * i) >> 2];
          view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2];
          view[i + 2] = HEAP32[(value + (4 * i + 8)) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, (value + count * 12) >> 2);
      }
      GLctx.uniform3iv(webglGetUniformLocation(location), view);
    }
    function _glUniform3uiv(location, count, value) {
      count &&
        GLctx.uniform3uiv(
          webglGetUniformLocation(location),
          HEAPU32,
          value >> 2,
          count * 3
        );
    }
    function _glUniform4fv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform4fv(
            webglGetUniformLocation(location),
            HEAPF32,
            value >> 2,
            count * 4
          );
        return;
      }
      if (count <= 72) {
        var view = miniTempWebGLFloatBuffers[4 * count - 1];
        var heap = HEAPF32;
        value = value >> 2;
        for (var i = 0; i < 4 * count; i += 4) {
          view[i] = heap[value++];
          view[i + 1] = heap[value++];
          view[i + 2] = heap[value++];
          view[i + 3] = heap[value++];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 16) >> 2);
      }
      GLctx.uniform4fv(webglGetUniformLocation(location), view);
    }
    function _glUniform4iv(location, count, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniform4iv(
            webglGetUniformLocation(location),
            HEAP32,
            value >> 2,
            count * 4
          );
        return;
      }
      if (count <= 72) {
        var view = miniTempWebGLIntBuffers[4 * count - 1];
        for (var i = 0; i < 4 * count; i += 4) {
          view[i] = HEAP32[(value + 4 * i) >> 2];
          view[i + 1] = HEAP32[(value + (4 * i + 4)) >> 2];
          view[i + 2] = HEAP32[(value + (4 * i + 8)) >> 2];
          view[i + 3] = HEAP32[(value + (4 * i + 12)) >> 2];
        }
      } else {
        var view = HEAP32.subarray(value >> 2, (value + count * 16) >> 2);
      }
      GLctx.uniform4iv(webglGetUniformLocation(location), view);
    }
    function _glUniform4uiv(location, count, value) {
      count &&
        GLctx.uniform4uiv(
          webglGetUniformLocation(location),
          HEAPU32,
          value >> 2,
          count * 4
        );
    }
    function _glUniformBlockBinding(
      program,
      uniformBlockIndex,
      uniformBlockBinding
    ) {
      program = GL.programs[program];
      GLctx.uniformBlockBinding(
        program,
        uniformBlockIndex,
        uniformBlockBinding
      );
    }
    function _glUniformMatrix3fv(location, count, transpose, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniformMatrix3fv(
            webglGetUniformLocation(location),
            !!transpose,
            HEAPF32,
            value >> 2,
            count * 9
          );
        return;
      }
      if (count <= 32) {
        var view = miniTempWebGLFloatBuffers[9 * count - 1];
        for (var i = 0; i < 9 * count; i += 9) {
          view[i] = HEAPF32[(value + 4 * i) >> 2];
          view[i + 1] = HEAPF32[(value + (4 * i + 4)) >> 2];
          view[i + 2] = HEAPF32[(value + (4 * i + 8)) >> 2];
          view[i + 3] = HEAPF32[(value + (4 * i + 12)) >> 2];
          view[i + 4] = HEAPF32[(value + (4 * i + 16)) >> 2];
          view[i + 5] = HEAPF32[(value + (4 * i + 20)) >> 2];
          view[i + 6] = HEAPF32[(value + (4 * i + 24)) >> 2];
          view[i + 7] = HEAPF32[(value + (4 * i + 28)) >> 2];
          view[i + 8] = HEAPF32[(value + (4 * i + 32)) >> 2];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 36) >> 2);
      }
      GLctx.uniformMatrix3fv(
        webglGetUniformLocation(location),
        !!transpose,
        view
      );
    }
    function _glUniformMatrix4fv(location, count, transpose, value) {
      if (GL.currentContext.version >= 2) {
        count &&
          GLctx.uniformMatrix4fv(
            webglGetUniformLocation(location),
            !!transpose,
            HEAPF32,
            value >> 2,
            count * 16
          );
        return;
      }
      if (count <= 18) {
        var view = miniTempWebGLFloatBuffers[16 * count - 1];
        var heap = HEAPF32;
        value = value >> 2;
        for (var i = 0; i < 16 * count; i += 16) {
          view[i] = heap[value++];
          view[i + 1] = heap[value++];
          view[i + 2] = heap[value++];
          view[i + 3] = heap[value++];
          view[i + 4] = heap[value++];
          view[i + 5] = heap[value++];
          view[i + 6] = heap[value++];
          view[i + 7] = heap[value++];
          view[i + 8] = heap[value++];
          view[i + 9] = heap[value++];
          view[i + 10] = heap[value++];
          view[i + 11] = heap[value++];
          view[i + 12] = heap[value++];
          view[i + 13] = heap[value++];
          view[i + 14] = heap[value++];
          view[i + 15] = heap[value++];
        }
      } else {
        var view = HEAPF32.subarray(value >> 2, (value + count * 64) >> 2);
      }
      GLctx.uniformMatrix4fv(
        webglGetUniformLocation(location),
        !!transpose,
        view
      );
    }
    function _glUnmapBuffer(target) {
      if (!emscriptenWebGLValidateMapBufferTarget(target)) {
        GL.recordError(1280);
        err("GL_INVALID_ENUM in glUnmapBuffer");
        return 0;
      }
      var buffer = emscriptenWebGLGetBufferBinding(target);
      var mapping = GL.mappedBuffers[buffer];
      if (!mapping) {
        GL.recordError(1282);
        err("buffer was never mapped in glUnmapBuffer");
        return 0;
      }
      GL.mappedBuffers[buffer] = null;
      if (!(mapping.access & 16))
        if (GL.currentContext.version >= 2) {
          GLctx.bufferSubData(
            target,
            mapping.offset,
            HEAPU8,
            mapping.mem,
            mapping.length
          );
        } else {
          GLctx.bufferSubData(
            target,
            mapping.offset,
            HEAPU8.subarray(mapping.mem, mapping.mem + mapping.length)
          );
        }
      _free(mapping.mem);
      return 1;
    }
    function webglApplyExplicitProgramBindings() {
      var p = GLctx.currentProgram;
      if (!p.explicitProgramBindingsApplied) {
        if (GL.currentContext.version >= 2) {
          Object.keys(p.explicitUniformBindings).forEach(function (ubo) {
            var bindings = p.explicitUniformBindings[ubo];
            for (var i = 0; i < bindings[1]; ++i) {
              var blockIndex = GLctx.getUniformBlockIndex(
                p,
                ubo + (bindings[1] > 1 ? "[" + i + "]" : "")
              );
              GLctx.uniformBlockBinding(p, blockIndex, bindings[0] + i);
            }
          });
        }
        Object.keys(p.explicitSamplerBindings).forEach(function (sampler) {
          var bindings = p.explicitSamplerBindings[sampler];
          for (var i = 0; i < bindings[1]; ++i) {
            GLctx.uniform1i(
              GLctx.getUniformLocation(p, sampler + (i ? "[" + i + "]" : "")),
              bindings[0] + i
            );
          }
        });
        p.explicitProgramBindingsApplied = 1;
      }
    }
    function _glUseProgram(program) {
      program = GL.programs[program];
      GLctx.useProgram(program);
      if ((GLctx.currentProgram = program)) {
        webglApplyExplicitProgramBindings();
      }
    }
    function _glValidateProgram(program) {
      GLctx.validateProgram(GL.programs[program]);
    }
    function _glVertexAttrib4f(x0, x1, x2, x3, x4) {
      GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
    }
    function _glVertexAttrib4fv(index, v) {
      v = v >> 2;
      GLctx.vertexAttrib4f(
        index,
        HEAPF32[v],
        HEAPF32[v + 1],
        HEAPF32[v + 2],
        HEAPF32[v + 3]
      );
    }
    function _glVertexAttribIPointer(index, size, type, stride, ptr) {
      var cb = GL.currentContext.clientBuffers[index];
      if (!GLctx.currentArrayBufferBinding) {
        cb.size = size;
        cb.type = type;
        cb.normalized = false;
        cb.stride = stride;
        cb.ptr = ptr;
        cb.clientside = true;
        cb.vertexAttribPointerAdaptor = function (
          index,
          size,
          type,
          normalized,
          stride,
          ptr
        ) {
          this.vertexAttribIPointer(index, size, type, stride, ptr);
        };
        return;
      }
      cb.clientside = false;
      GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
    }
    function _glVertexAttribPointer(
      index,
      size,
      type,
      normalized,
      stride,
      ptr
    ) {
      var cb = GL.currentContext.clientBuffers[index];
      if (!GLctx.currentArrayBufferBinding) {
        cb.size = size;
        cb.type = type;
        cb.normalized = normalized;
        cb.stride = stride;
        cb.ptr = ptr;
        cb.clientside = true;
        cb.vertexAttribPointerAdaptor = function (
          index,
          size,
          type,
          normalized,
          stride,
          ptr
        ) {
          this.vertexAttribPointer(index, size, type, normalized, stride, ptr);
        };
        return;
      }
      cb.clientside = false;
      GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
    }
    function _glViewport(x0, x1, x2, x3) {
      GLctx.viewport(x0, x1, x2, x3);
    }
    function _llvm_eh_typeid_for(type) {
      return type;
    }
    if (!String.prototype.replaceAll)
      String.prototype.replaceAll = function (str, newStr) {
        if (str === "?") str = "\\?";
        return this.replace(
          str instanceof RegExp ? str : new RegExp(str, "g"),
          newStr
        );
      };
    function wgpuDecodeStrings(s, c, ch) {
      ch = ch || 65;
      for (c = c.split("|"); c[0]; )
        s = s["replaceAll"](String.fromCharCode(ch++), c.pop());
      return [,].concat(s.split(" "));
    }
    var GPUTextureAndVertexFormats = wgpuDecodeStrings(
      "r8YA8TA8SA8UALSALUALWR8YR8TR8SR8UANSANUANWRLSRLURLW V8Y V8Z V8T V8S V8U bgra8Y bgra8ZRb9e5uWRbJa2SRbJa2YR11bJuWRNSRNURNW VLS VLU VLW VNS VNU VNWB8ILYI24plusI24plus-E8INWINW-E8Q1-V-YQ1-V-ZQ2-V-YQ2-V-ZQ3-V-YQ3-V-ZQ4-r-YQ4-r-TQ5-rg-YQ5-rg-TQ6h-rgb-uWQ6h-rgb-WQ7-V-YQ7-V-ZPYPZPa1YPa1Z etc2-V8Y etc2-V8ZFr11YFr11TFrg11YFrg11TX4x4-YX4x4-ZX5x4-YX5x4-ZX5x5-YX5x5-ZX6x5-YX6x5-ZX6x6-YX6x6-ZX8x5-YX8x5-ZX8x6-YX8x6-ZX8x8-YX8x8-ZXJx5-YXJx5-ZXJx6-YXJx6-ZXJx8-YXJx8-ZXJxJ-YXJxJ-ZX12xJ-YX12xJ-ZX12x12-YX12x12-Z S8MS8KU8MU8KY8MY8KT8MT8KSLMSLKULMULKYLMYLKTLMTLKWLMWLKWN WNMWNx3 WNKSN SNMSNx3 SNKUN UNMUNx3 UNKYJ-J-J-2",
      "unorm-srgb|unorm| astc-|float|rgba|sint|snorm|uint| rg| bc| etc2-rgb8|-AC|32|x2 |16|x4 |10| depth|-B|SC| eac-|stencil|-ESJ|-E-A| E| r"
    );
    function _navigator_gpu_get_preferred_canvas_format() {
      return GPUTextureAndVertexFormats.indexOf(
        navigator["gpu"]["getPreferredCanvasFormat"]()
      );
    }
    var wgpuIdCounter = 1;
    function wgpuStore(object) {
      if (object) {
        while (wgpu[++wgpuIdCounter])
          if (wgpuIdCounter > 2147483646) wgpuIdCounter = 1;
        wgpu[wgpuIdCounter] = object;
        object.wid = wgpuIdCounter;
        return wgpuIdCounter;
      }
    }
    function debugDir(x, desc) {
      return x;
    }
    function _wgpuMuteJsExceptions(fn) {
      return (p) => {
        try {
          return fn(p);
        } catch (e) {}
      };
    }
    function _navigator_gpu_request_adapter_async(
      options,
      adapterCallback,
      userData
    ) {
      options >>= 2;
      let gpu = navigator["gpu"],
        powerPreference = [, "low-power", "high-performance"][HEAPU32[options]],
        opts = {};
      if (gpu) {
        if (options) {
          opts["forceFallbackAdapter"] = !!HEAPU32[options + 1];
          if (powerPreference) opts["powerPreference"] = powerPreference;
        }
        function cb(adapter) {
          ((a1, a2) => dynCall_vii.apply(null, [adapterCallback, a1, a2]))(
            wgpuStore(adapter),
            userData
          );
        }
        gpu["requestAdapter"](opts)
          .then(_wgpuMuteJsExceptions(cb))
          .catch(() => {
            cb();
          });
        return 1;
      }
    }
    function arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {}
      return sum;
    }
    var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[
          currentMonth
        ];
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1;
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1);
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
        } else {
          newDate.setDate(newDate.getDate() + days);
          return newDate;
        }
      }
      return newDate;
    }
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer);
    }
    function _strftime(s, maxsize, format, tm) {
      var tm_zone = HEAP32[(tm + 40) >> 2];
      var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[(tm + 4) >> 2],
        tm_hour: HEAP32[(tm + 8) >> 2],
        tm_mday: HEAP32[(tm + 12) >> 2],
        tm_mon: HEAP32[(tm + 16) >> 2],
        tm_year: HEAP32[(tm + 20) >> 2],
        tm_wday: HEAP32[(tm + 24) >> 2],
        tm_yday: HEAP32[(tm + 28) >> 2],
        tm_isdst: HEAP32[(tm + 32) >> 2],
        tm_gmtoff: HEAP32[(tm + 36) >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : "",
      };
      var pattern = UTF8ToString(format);
      var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y",
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(
          new RegExp(rule, "g"),
          EXPANSION_RULES_1[rule]
        );
      }
      var WEEKDAYS = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      var MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      function leadingSomething(value, digits, character) {
        var str = typeof value == "number" ? value.toString() : value || "";
        while (str.length < digits) {
          str = character[0] + str;
        }
        return str;
      }
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0");
      }
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : value > 0 ? 1 : 0;
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
            compare = sgn(date1.getDate() - date2.getDate());
          }
        }
        return compare;
      }
      function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
          case 0:
            return new Date(janFourth.getFullYear() - 1, 11, 29);
          case 1:
            return janFourth;
          case 2:
            return new Date(janFourth.getFullYear(), 0, 3);
          case 3:
            return new Date(janFourth.getFullYear(), 0, 2);
          case 4:
            return new Date(janFourth.getFullYear(), 0, 1);
          case 5:
            return new Date(janFourth.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(janFourth.getFullYear() - 1, 11, 30);
        }
      }
      function getWeekBasedYear(date) {
        var thisDate = addDays(
          new Date(date.tm_year + 1900, 0, 1),
          date.tm_yday
        );
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
          if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
            return thisDate.getFullYear() + 1;
          }
          return thisDate.getFullYear();
        }
        return thisDate.getFullYear() - 1;
      }
      var EXPANSION_RULES_2 = {
        "%a": function (date) {
          return WEEKDAYS[date.tm_wday].substring(0, 3);
        },
        "%A": function (date) {
          return WEEKDAYS[date.tm_wday];
        },
        "%b": function (date) {
          return MONTHS[date.tm_mon].substring(0, 3);
        },
        "%B": function (date) {
          return MONTHS[date.tm_mon];
        },
        "%C": function (date) {
          var year = date.tm_year + 1900;
          return leadingNulls((year / 100) | 0, 2);
        },
        "%d": function (date) {
          return leadingNulls(date.tm_mday, 2);
        },
        "%e": function (date) {
          return leadingSomething(date.tm_mday, 2, " ");
        },
        "%g": function (date) {
          return getWeekBasedYear(date).toString().substring(2);
        },
        "%G": function (date) {
          return getWeekBasedYear(date);
        },
        "%H": function (date) {
          return leadingNulls(date.tm_hour, 2);
        },
        "%I": function (date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        "%j": function (date) {
          return leadingNulls(
            date.tm_mday +
              arraySum(
                isLeapYear(date.tm_year + 1900)
                  ? MONTH_DAYS_LEAP
                  : MONTH_DAYS_REGULAR,
                date.tm_mon - 1
              ),
            3
          );
        },
        "%m": function (date) {
          return leadingNulls(date.tm_mon + 1, 2);
        },
        "%M": function (date) {
          return leadingNulls(date.tm_min, 2);
        },
        "%n": function () {
          return "\n";
        },
        "%p": function (date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return "AM";
          }
          return "PM";
        },
        "%S": function (date) {
          return leadingNulls(date.tm_sec, 2);
        },
        "%t": function () {
          return "\t";
        },
        "%u": function (date) {
          return date.tm_wday || 7;
        },
        "%U": function (date) {
          var days = date.tm_yday + 7 - date.tm_wday;
          return leadingNulls(Math.floor(days / 7), 2);
        },
        "%V": function (date) {
          var val = Math.floor(
            (date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7
          );
          if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
            val++;
          }
          if (!val) {
            val = 52;
            var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
            if (
              dec31 == 4 ||
              (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))
            ) {
              val++;
            }
          } else if (val == 53) {
            var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
            if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
          }
          return leadingNulls(val, 2);
        },
        "%w": function (date) {
          return date.tm_wday;
        },
        "%W": function (date) {
          var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
          return leadingNulls(Math.floor(days / 7), 2);
        },
        "%y": function (date) {
          return (date.tm_year + 1900).toString().substring(2);
        },
        "%Y": function (date) {
          return date.tm_year + 1900;
        },
        "%z": function (date) {
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          off = (off / 60) * 100 + (off % 60);
          return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
        },
        "%Z": function (date) {
          return date.tm_zone;
        },
        "%%": function () {
          return "%";
        },
      };
      pattern = pattern.replace(/%%/g, "\0\0");
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(
            new RegExp(rule, "g"),
            EXPANSION_RULES_2[rule](date)
          );
        }
      }
      pattern = pattern.replace(/\0\0/g, "%");
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
      writeArrayToMemory(bytes, s);
      return bytes.length - 1;
    }
    function _strftime_l(s, maxsize, format, tm, loc) {
      return _strftime(s, maxsize, format, tm);
    }
    var _wgpuFeatures = wgpuDecodeStrings(
      "B-clip-control B32D-Aencil8EbcEetc2EaAc timeAamp-query indirect-firA-inAance shader-f16 rg11b10uD-rendC bgra8unorm-Aorage D32-filtC",
      " texture-compression-|float|erable|depth|st"
    ).slice(1);
    function _wgpu_adapter_or_device_get_features(adapterOrDevice) {
      let id = 1,
        featuresBitMask = 0;
      for (let feature of _wgpuFeatures) {
        if (wgpu[adapterOrDevice]["features"].has(feature))
          featuresBitMask |= id;
        id *= 2;
      }
      return featuresBitMask;
    }
    var _wgpu32BitLimitNames = wgpuDecodeStrings(
      ">1D >2D >3D maxTextureArrayLayer<6<6sPlus7=<BindingsPer6 maxDynamicUniform=;DynamicS:=;SampledTexture@maxSampler@maxS:=@maxS:Texture@maxUniform=@minUniform=9inS:=9ax7=<7Attribute<7=ArrayStride max8Component<8Variable<ColorAttachment<ColorAttachmentBytesPerSample?pS:Size maxComputeInvocationsPerWorkgroup?pSizeX?pSizeY?pSizeZ",
      "sPerShaderStage | maxComputeWorkgrou|maxTextureDimension|Buffer|s max|sPerPipelineLayout max|torage|OffsetAlignment m|InterStageShader|Vertex|BindGroup|Uniform7|8ColorAttachmen",
      52
    ).slice(1);
    var _wgpu64BitLimitNames = wgpuDecodeStrings(
      "maxUniform4Storage4BufferSize",
      "BufferBindingSize max",
      52
    ).slice(1);
    function wgpuWriteI53ToU64HeapIdx(heap32Idx, number) {
      HEAPU32[heap32Idx] = number;
      HEAPU32[heap32Idx + 1] = number / 4294967296;
    }
    function _wgpu_adapter_or_device_get_limits(adapterOrDevice, limits) {
      let l = wgpu[adapterOrDevice]["limits"];
      limits >>= 2;
      for (let limitName of _wgpu64BitLimitNames) {
        wgpuWriteI53ToU64HeapIdx(limits, l[limitName]);
        limits += 2;
      }
      for (let limitName of _wgpu32BitLimitNames) {
        HEAPU32[limits++] = l[limitName];
      }
    }
    function wgpuReadI53FromU64HeapIdx(heap32Idx) {
      return HEAPU32[heap32Idx] + HEAPU32[heap32Idx + 1] * 4294967296;
    }
    function _wgpu_adapter_request_device_async(
      adapter,
      descriptor,
      deviceCallback,
      userData
    ) {
      descriptor >>= 2;
      let requiredFeatures = [],
        requiredLimits = {},
        v = HEAPU32[descriptor],
        defaultQueueLabel;
      descriptor += 2;
      for (let i = 0; i < 11; ++i) {
        if (v & (1 << i)) requiredFeatures.push(_wgpuFeatures[i]);
      }
      for (let limitName of _wgpu64BitLimitNames) {
        if ((v = wgpuReadI53FromU64HeapIdx(descriptor)))
          requiredLimits[limitName] = v;
        descriptor += 2;
      }
      for (let limitName of _wgpu32BitLimitNames) {
        if ((v = HEAPU32[descriptor++])) requiredLimits[limitName] = v;
      }
      function cb(device) {
        if (device) {
          device.derivedObjects = [];
          wgpuStore(device["queue"]);
        }
        ((a1, a2) => dynCall_vii.apply(null, [deviceCallback, a1, a2]))(
          wgpuStore(device),
          userData
        );
      }
      defaultQueueLabel = HEAPU32[descriptor];
      wgpu[adapter]["requestDevice"](
        debugDir(
          {
            requiredFeatures: requiredFeatures,
            requiredLimits: requiredLimits,
            defaultQueue: defaultQueueLabel
              ? { label: UTF8ToString(defaultQueueLabel) }
              : void 0,
          },
          "GPUAdapter.requestDevice() with desc"
        )
      )
        .then(_wgpuMuteJsExceptions(cb))
        .catch(() => {
          cb();
        });
    }
    function _wgpu_buffer_get_mapped_range(gpuBuffer, offset, size) {
      gpuBuffer = wgpu[gpuBuffer];
      try {
        gpuBuffer.mappedRanges[offset] =
          size < 0
            ? gpuBuffer["getMappedRange"](offset)
            : gpuBuffer["getMappedRange"](offset, size);
      } catch (e) {
        return -1;
      }
      return offset;
    }
    function _wgpu_buffer_map_async(
      buffer,
      callback,
      userData,
      mode,
      offset,
      size
    ) {
      let bufferObject = wgpu[buffer];
      (size < 0
        ? bufferObject["mapAsync"](mode, offset)
        : bufferObject["mapAsync"](mode, offset, size)
      ).then(() => {
        ((a1, a2, a3, a4, a5) =>
          dynCall_viiidd.apply(null, [callback, a1, a2, a3, a4, a5]))(
          buffer,
          userData,
          mode,
          offset,
          size
        );
      });
    }
    function _wgpu_buffer_read_mapped_range(
      gpuBuffer,
      startOffset,
      subOffset,
      dst,
      size
    ) {
      HEAPU8.set(
        new Uint8Array(
          wgpu[gpuBuffer].mappedRanges[startOffset],
          subOffset,
          size
        ),
        dst
      );
    }
    function _wgpu_buffer_unmap(gpuBuffer) {
      gpuBuffer = wgpu[gpuBuffer];
      gpuBuffer["unmap"]();
      gpuBuffer.mappedRanges = {};
    }
    var HTMLPredefinedColorSpaces = [, "srgb", "display-p3"];
    function wgpuReadArrayOfWgpuObjects(ptr, numObjects) {
      ptr >>= 2;
      let arrayOfObjects = [];
      while (numObjects--) {
        arrayOfObjects.push(wgpu[HEAPU32[ptr++]]);
      }
      return arrayOfObjects;
    }
    function _wgpu_canvas_context_configure(canvasContext, config) {
      config >>= 2;
      wgpu[canvasContext]["configure"](
        debugDir(
          {
            device: wgpu[HEAPU32[config]],
            format: GPUTextureAndVertexFormats[HEAPU32[config + 1]],
            usage: HEAPU32[config + 2],
            viewFormats: wgpuReadArrayOfWgpuObjects(
              HEAPU32[config + 4],
              HEAPU32[config + 3]
            ),
            colorSpace: HTMLPredefinedColorSpaces[HEAPU32[config + 5]],
            alphaMode: [, "opaque", "premultiplied"][HEAPU32[config + 6]],
          },
          "canvasContext.configure() with config"
        )
      );
    }
    function _wgpu_object_destroy(object) {
      let o = wgpu[object];
      if (o) {
        if (o["destroy"]) o["destroy"]();
        if (o.derivedObjects) o.derivedObjects.forEach(_wgpu_object_destroy);
        delete wgpu[object];
      }
    }
    function _wgpu_canvas_context_get_current_texture(canvasContext) {
      canvasContext = wgpu[canvasContext]["getCurrentTexture"]();
      if (canvasContext != wgpu[1]) {
        _wgpu_object_destroy(1);
        wgpu[1] = canvasContext;
        canvasContext.wid = 1;
        canvasContext.derivedObjects = [];
      }
      return 1;
    }
    function _wgpu_canvas_get_webgpu_context(canvasSelector) {
      return wgpuStore(
        debugDir(
          debugDir(
            document.querySelector(UTF8ToString(canvasSelector)),
            "canvas"
          ).getContext("webgpu"),
          'canvas.getContext("webgpu")'
        )
      );
    }
    function wgpuReadTimestampWrites(timestampWritesIndex) {
      let querySet = HEAPU32[timestampWritesIndex];
      if (querySet) {
        let timestampWrites = { querySet: wgpu[querySet] },
          i;
        if ((i = HEAP32[timestampWritesIndex + 1]) >= 0)
          timestampWrites["beginningOfPassWriteIndex"] = i;
        if ((i = HEAP32[timestampWritesIndex + 2]) >= 0)
          timestampWrites["endOfPassWriteIndex"] = i;
        return timestampWrites;
      }
    }
    function _wgpu_command_encoder_begin_compute_pass(
      commandEncoder,
      descriptor
    ) {
      commandEncoder = wgpu[commandEncoder];
      descriptor >>= 2;
      let desc = { timestampWrites: wgpuReadTimestampWrites(descriptor) };
      let computePassEncoder = commandEncoder["beginComputePass"](desc);
      return wgpuStore(computePassEncoder);
    }
    var GPULoadOps = [, "load", "clear"];
    var GPUStoreOps = [, "store", "discard"];
    function _wgpu_command_encoder_begin_render_pass(
      commandEncoder,
      descriptor
    ) {
      descriptor >>= 2;
      let colorAttachments = [],
        numColorAttachments = HEAP32[descriptor++],
        colorAttachmentsIdx = HEAPU32[descriptor++] >> 2,
        colorAttachmentsIdxDbl = (colorAttachmentsIdx + 6) >> 1,
        depthStencilView = wgpu[HEAPU32[descriptor]];
      while (numColorAttachments--) {
        colorAttachments.push(
          HEAPU32[colorAttachmentsIdx]
            ? {
                view: wgpu[HEAPU32[colorAttachmentsIdx]],
                depthSlice:
                  HEAP32[colorAttachmentsIdx + 1] < 0
                    ? undefined
                    : HEAP32[colorAttachmentsIdx + 1],
                resolveTarget: wgpu[HEAPU32[colorAttachmentsIdx + 2]],
                storeOp: GPUStoreOps[HEAPU32[colorAttachmentsIdx + 3]],
                loadOp: GPULoadOps[HEAPU32[colorAttachmentsIdx + 4]],
                clearValue: [
                  HEAPF64[colorAttachmentsIdxDbl],
                  HEAPF64[colorAttachmentsIdxDbl + 1],
                  HEAPF64[colorAttachmentsIdxDbl + 2],
                  HEAPF64[colorAttachmentsIdxDbl + 3],
                ],
              }
            : null
        );
        colorAttachmentsIdx += 14;
        colorAttachmentsIdxDbl += 7;
      }
      return wgpuStore(
        debugDir(
          wgpu[commandEncoder]["beginRenderPass"](
            debugDir(
              {
                colorAttachments: colorAttachments,
                depthStencilAttachment: depthStencilView
                  ? {
                      view: depthStencilView,
                      depthLoadOp: GPULoadOps[HEAPU32[descriptor + 1]],
                      depthClearValue: HEAPF32[descriptor + 2],
                      depthStoreOp: GPUStoreOps[HEAPU32[descriptor + 3]],
                      depthReadOnly: !!HEAPU32[descriptor + 4],
                      stencilLoadOp: GPULoadOps[HEAPU32[descriptor + 5]],
                      stencilClearValue: HEAPU32[descriptor + 6],
                      stencilStoreOp: GPUStoreOps[HEAPU32[descriptor + 7]],
                      stencilReadOnly: !!HEAPU32[descriptor + 8],
                    }
                  : void 0,
                occlusionQuerySet: wgpu[HEAPU32[descriptor + 9]],
                maxDrawCount: HEAPF64[(descriptor + 10) >> 1] || void 0,
                timestampWrites: wgpuReadTimestampWrites(descriptor + 12),
              },
              "GPUCommandEncoder.beginRenderPass() with desc"
            )
          ),
          "returned"
        )
      );
    }
    function _wgpu_command_encoder_begin_render_pass_1color_0depth(
      commandEncoder,
      descriptor
    ) {
      descriptor >>= 2;
      let colorAttachmentsIdx = HEAPU32[descriptor + 1] >> 2,
        colorAttachmentsIdxDbl = (colorAttachmentsIdx + 6) >> 1;
      return wgpuStore(
        debugDir(
          wgpu[commandEncoder]["beginRenderPass"](
            debugDir(
              {
                colorAttachments: [
                  {
                    view: wgpu[HEAPU32[colorAttachmentsIdx]],
                    depthSlice:
                      HEAP32[colorAttachmentsIdx + 1] < 0
                        ? undefined
                        : HEAP32[colorAttachmentsIdx + 1],
                    resolveTarget: wgpu[HEAPU32[colorAttachmentsIdx + 2]],
                    storeOp: GPUStoreOps[HEAPU32[colorAttachmentsIdx + 3]],
                    loadOp: GPULoadOps[HEAPU32[colorAttachmentsIdx + 4]],
                    clearValue: [
                      HEAPF64[colorAttachmentsIdxDbl],
                      HEAPF64[colorAttachmentsIdxDbl + 1],
                      HEAPF64[colorAttachmentsIdxDbl + 2],
                      HEAPF64[colorAttachmentsIdxDbl + 3],
                    ],
                  },
                ],
              },
              "GPUCommandEncoder.beginRenderPass() with desc"
            )
          ),
          "returned"
        )
      );
    }
    function _wgpu_command_encoder_copy_buffer_to_buffer(
      commandEncoder,
      source,
      sourceOffset,
      destination,
      destinationOffset,
      size
    ) {
      wgpu[commandEncoder]["copyBufferToBuffer"](
        wgpu[source],
        sourceOffset,
        wgpu[destination],
        destinationOffset,
        size
      );
    }
    var GPUTextureAspects = wgpuDecodeStrings("all stencilA depthA", "-only");
    function wgpuReadGpuImageCopyTexture(ptr) {
      ptr >>= 2;
      return {
        texture: wgpu[HEAPU32[ptr]],
        mipLevel: HEAP32[ptr + 1],
        origin: [HEAP32[ptr + 2], HEAP32[ptr + 3], HEAP32[ptr + 4]],
        aspect: GPUTextureAspects[HEAPU32[ptr + 5]],
      };
    }
    function wgpuReadGpuImageCopyBuffer(ptr) {
      ptr >>= 2;
      return {
        offset: wgpuReadI53FromU64HeapIdx(ptr),
        bytesPerRow: HEAP32[ptr + 2],
        rowsPerImage: HEAP32[ptr + 3],
        buffer: wgpu[HEAPU32[ptr + 4]],
      };
    }
    function _wgpu_command_encoder_copy_texture_to_buffer(
      commandEncoder,
      source,
      destination,
      copyWidth,
      copyHeight,
      copyDepthOrArrayLayers
    ) {
      wgpu[commandEncoder]["copyTextureToBuffer"](
        wgpuReadGpuImageCopyTexture(source),
        wgpuReadGpuImageCopyBuffer(destination),
        [copyWidth, copyHeight, copyDepthOrArrayLayers]
      );
    }
    function _wgpu_command_encoder_copy_texture_to_texture(
      commandEncoder,
      source,
      destination,
      copyWidth,
      copyHeight,
      copyDepthOrArrayLayers
    ) {
      wgpu[commandEncoder]["copyTextureToTexture"](
        wgpuReadGpuImageCopyTexture(source),
        wgpuReadGpuImageCopyTexture(destination),
        [copyWidth, copyHeight, copyDepthOrArrayLayers]
      );
    }
    function _wgpu_compute_pass_encoder_dispatch_workgroups(
      encoder,
      workgroupCountX,
      workgroupCountY,
      workgroupCountZ
    ) {
      wgpu[encoder]["dispatchWorkgroups"](
        workgroupCountX,
        workgroupCountY,
        workgroupCountZ
      );
    }
    function _wgpu_compute_pass_encoder_dispatch_workgroups_indirect(
      encoder,
      indirectBuffer,
      indirectOffset
    ) {
      wgpu[encoder]["dispatchWorkgroupsIndirect"](
        wgpu[indirectBuffer],
        indirectOffset
      );
    }
    function wgpuStoreAndSetParent(object, parent) {
      object = wgpuStore(object);
      object && parent.derivedObjects.push(object);
      return object;
    }
    function _wgpu_device_create_bind_group(
      device,
      layout,
      entries,
      numEntries
    ) {
      device = wgpu[device];
      entries >>= 2;
      let e = [];
      while (numEntries--) {
        let bindingIdx = HEAPU32[entries],
          resource = wgpu[HEAPU32[entries + 1]];
        let binding = { binding: bindingIdx, resource: resource };
        if (resource.isBuffer) {
          let resourceBinding = {
              buffer: resource,
              offset: wgpuReadI53FromU64HeapIdx(entries + 2),
            },
            size = wgpuReadI53FromU64HeapIdx(entries + 4);
          if (size) resourceBinding["size"] = size;
          binding["resource"] = resourceBinding;
        }
        e.push(binding);
        entries += 6;
      }
      return wgpuStoreAndSetParent(
        device["createBindGroup"](
          debugDir(
            { layout: wgpu[layout], entries: e },
            "GPUDevice.createBindGroup() with desc"
          )
        ),
        device
      );
    }
    var GPUBufferBindingTypes = wgpuDecodeStrings(
      "uniform A read-only-A",
      "storage"
    );
    var GPUSamplerBindingTypes = wgpuDecodeStrings(
      "Anon-Acomparison",
      "filtering "
    );
    var GPUTextureSampleTypes = wgpuDecodeStrings(
      "Aunfilterable-Adepth sint uint",
      "float "
    );
    var GPUTextureViewDimensions = wgpuDecodeStrings(
      "1B 2dCA AC3d",
      "-array |d 2d|cube"
    );
    var GPUStorageTextureSampleTypes = wgpuDecodeStrings(
      "A-BBA",
      "only read-|write"
    );
    function wgpuReadBindGroupLayoutDescriptor(entries, numEntries) {
      entries >>= 2;
      let e = [];
      while (numEntries--) {
        let entry = {
            binding: HEAPU32[entries],
            visibility: HEAPU32[entries + 1],
          },
          type = HEAPU32[entries + 2];
        entries += 4;
        if (type == 1) {
          entry["buffer"] = {
            type: GPUBufferBindingTypes[HEAPU32[entries]],
            hasDynamicOffset: !!HEAPU32[entries + 1],
            minBindingSize: wgpuReadI53FromU64HeapIdx(entries + 2),
          };
        } else if (type == 2) {
          entry["sampler"] = { type: GPUSamplerBindingTypes[HEAPU32[entries]] };
        } else if (type == 3) {
          entry["texture"] = {
            sampleType: GPUTextureSampleTypes[HEAPU32[entries]],
            viewDimension: GPUTextureViewDimensions[HEAPU32[entries + 1]],
            multisampled: !!HEAPU32[entries + 2],
          };
        } else if (type == 4) {
          entry["storageTexture"] = {
            access: GPUStorageTextureSampleTypes[HEAPU32[entries]],
            format: GPUTextureAndVertexFormats[HEAPU32[entries + 1]],
            viewDimension: GPUTextureViewDimensions[HEAPU32[entries + 2]],
          };
        } else {
          entry["externalTexture"] = {};
        }
        entries += 4;
        e.push(entry);
      }
      return { entries: e };
    }
    function _wgpu_device_create_bind_group_layout(
      device,
      entries,
      numEntries
    ) {
      device = wgpu[device];
      let desc = wgpuReadBindGroupLayoutDescriptor(entries, numEntries);
      let bgl = device["createBindGroupLayout"](desc);
      return wgpuStoreAndSetParent(bgl, device);
    }
    function _wgpu_device_create_buffer(device, descriptor) {
      device = wgpu[device];
      descriptor >>= 2;
      let buffer = device["createBuffer"](
        debugDir(
          {
            size: wgpuReadI53FromU64HeapIdx(descriptor),
            usage: HEAPU32[descriptor + 2],
            mappedAtCreation: !!HEAPU32[descriptor + 3],
          },
          "GPUDevice.createBuffer() with desc"
        )
      );
      buffer.mappedRanges = {};
      buffer.isBuffer = 1;
      return wgpuStoreAndSetParent(buffer, device);
    }
    function _wgpu_device_create_command_encoder(device, descriptor) {
      return wgpuStoreAndSetParent(
        wgpu[device]["createCommandEncoder"](
          debugDir(void 0, "GPUDevice.createCommandEncoder() with desc")
        ),
        wgpu[device]
      );
    }
    function _wgpu_device_create_command_encoder_simple(device) {
      return wgpuStoreAndSetParent(
        wgpu[device]["createCommandEncoder"](),
        wgpu[device]
      );
    }
    function wgpuReadConstants(constants, numConstants) {
      let c = {};
      while (numConstants--) {
        c[UTF8ToString(HEAPU32[constants >> 2])] =
          HEAPF64[(constants + 8) >> 3];
        constants += 16;
      }
      return c;
    }
    var GPUAutoLayoutMode = "auto";
    function _wgpu_device_create_compute_pipeline(
      device,
      computeModule,
      entryPoint,
      layout,
      constants,
      numConstants
    ) {
      device = wgpu[device];
      return wgpuStoreAndSetParent(
        device["createComputePipeline"](
          debugDir(
            {
              layout: layout > 1 ? wgpu[layout] : GPUAutoLayoutMode,
              compute: {
                module: wgpu[computeModule],
                entryPoint: UTF8ToString(entryPoint) || void 0,
                constants: wgpuReadConstants(constants, numConstants),
              },
            },
            "GPUDevice.createComputePipeline() with desc"
          )
        ),
        device
      );
    }
    function _wgpu_device_create_pipeline_layout(device, layouts, numLayouts) {
      device = wgpu[device];
      return wgpuStoreAndSetParent(
        device["createPipelineLayout"](
          debugDir(
            {
              bindGroupLayouts: wgpuReadArrayOfWgpuObjects(layouts, numLayouts),
            },
            "GPUDevice.createPipelineLayout() with desc"
          )
        ),
        device
      );
    }
    var GPUCompareFunctions = wgpuDecodeStrings(
      "neverA equalACB notCBCalways",
      "-equal |greater| less"
    );
    var GPUStencilOperations = wgpuDecodeStrings(
      "keep zero replace invert inCBdeCBinCA deCA",
      "crement-|clamp |wrap"
    );
    function wgpuReadGpuStencilFaceState(idx) {
      return {
        compare: GPUCompareFunctions[HEAPU32[idx]],
        failOp: GPUStencilOperations[HEAPU32[idx + 1]],
        depthFailOp: GPUStencilOperations[HEAPU32[idx + 2]],
        passOp: GPUStencilOperations[HEAPU32[idx + 3]],
      };
    }
    var GPUBlendOperations = wgpuDecodeStrings(
      "add Areverse-Amin max",
      "subtract "
    );
    var GPUBlendFactors = wgpuDecodeStrings(
      "zero one BEB BDEBD AEA ADEAD BD-saturated CEC",
      " one-minus-|-alpha|constant|src|dst"
    );
    function wgpuReadGpuBlendComponent(idx) {
      return {
        operation: GPUBlendOperations[HEAPU32[idx]],
        srcFactor: GPUBlendFactors[HEAPU32[idx + 1]],
        dstFactor: GPUBlendFactors[HEAPU32[idx + 2]],
      };
    }
    var GPUIndexFormats = wgpuDecodeStrings("A16 A32", "uint");
    var GPUPrimitiveTopologys = wgpuDecodeStrings(
      "pointDADAB CDCB",
      "-list |triangle|-strip|line"
    );
    function wgpuReadRenderPipelineDescriptor(descriptor) {
      let vertexBuffers = [],
        targets = [],
        vertexIdx = descriptor >> 2,
        numVertexBuffers = HEAP32[vertexIdx + 2],
        vertexBuffersIdx = HEAPU32[vertexIdx + 3] >> 2,
        primitiveIdx = vertexIdx + 6,
        depthStencilIdx = primitiveIdx + 5,
        multisampleIdx = depthStencilIdx + 17,
        fragmentIdx = multisampleIdx + 3,
        numTargets = HEAP32[fragmentIdx + 2],
        targetsIdx = HEAPU32[fragmentIdx + 3] >> 2,
        depthStencilFormat = HEAPU32[depthStencilIdx++],
        multisampleCount = HEAPU32[multisampleIdx],
        fragmentModule = HEAPU32[fragmentIdx],
        pipelineLayoutId = HEAPU32[fragmentIdx + 6],
        desc;
      while (numVertexBuffers--) {
        let attributes = [],
          numAttributes = HEAP32[vertexBuffersIdx],
          attributesIdx = HEAPU32[vertexBuffersIdx + 1] >> 2;
        while (numAttributes--) {
          attributes.push({
            offset: wgpuReadI53FromU64HeapIdx(attributesIdx),
            shaderLocation: HEAPU32[attributesIdx + 2],
            format: GPUTextureAndVertexFormats[HEAPU32[attributesIdx + 3]],
          });
          attributesIdx += 4;
        }
        vertexBuffers.push({
          arrayStride: wgpuReadI53FromU64HeapIdx(vertexBuffersIdx + 2),
          stepMode: [, "vertex", "instance"][HEAPU32[vertexBuffersIdx + 4]],
          attributes: attributes,
        });
        vertexBuffersIdx += 6;
      }
      while (numTargets--) {
        targets.push(
          HEAPU32[targetsIdx]
            ? {
                format: GPUTextureAndVertexFormats[HEAPU32[targetsIdx]],
                blend: HEAPU32[targetsIdx + 1]
                  ? {
                      color: wgpuReadGpuBlendComponent(targetsIdx + 1),
                      alpha: wgpuReadGpuBlendComponent(targetsIdx + 4),
                    }
                  : void 0,
                writeMask: HEAPU32[targetsIdx + 7],
              }
            : null
        );
        targetsIdx += 8;
      }
      desc = {
        vertex: {
          module: wgpu[HEAPU32[vertexIdx]],
          entryPoint: UTF8ToString(HEAPU32[vertexIdx + 1]) || void 0,
          buffers: vertexBuffers,
          constants: wgpuReadConstants(
            HEAPU32[vertexIdx + 5],
            HEAP32[vertexIdx + 4]
          ),
        },
        primitive: {
          topology: GPUPrimitiveTopologys[HEAPU32[primitiveIdx]],
          stripIndexFormat: GPUIndexFormats[HEAPU32[primitiveIdx + 1]],
          frontFace: [, "ccw", "cw"][HEAPU32[primitiveIdx + 2]],
          cullMode: [, "none", "front", "back"][HEAPU32[primitiveIdx + 3]],
          unclippedDepth: !!HEAPU32[primitiveIdx + 4],
        },
        layout:
          pipelineLayoutId > 1 ? wgpu[pipelineLayoutId] : GPUAutoLayoutMode,
      };
      if (depthStencilFormat)
        desc["depthStencil"] = {
          format: GPUTextureAndVertexFormats[depthStencilFormat],
          depthWriteEnabled: !!HEAPU32[depthStencilIdx++],
          depthCompare: GPUCompareFunctions[HEAPU32[depthStencilIdx++]],
          stencilReadMask: HEAPU32[depthStencilIdx++],
          stencilWriteMask: HEAPU32[depthStencilIdx++],
          depthBias: HEAP32[depthStencilIdx++],
          depthBiasSlopeScale: HEAPF32[depthStencilIdx++],
          depthBiasClamp: HEAPF32[depthStencilIdx++],
          stencilFront: wgpuReadGpuStencilFaceState(depthStencilIdx),
          stencilBack: wgpuReadGpuStencilFaceState(depthStencilIdx + 4),
          clampDepth: !!HEAPU32[depthStencilIdx + 8],
        };
      if (multisampleCount)
        desc["multisample"] = {
          count: multisampleCount,
          mask: HEAPU32[multisampleIdx + 1],
          alphaToCoverageEnabled: !!HEAPU32[multisampleIdx + 2],
        };
      if (fragmentModule)
        desc["fragment"] = {
          module: wgpu[fragmentModule],
          entryPoint: UTF8ToString(HEAPU32[fragmentIdx + 1]) || void 0,
          targets: targets,
          constants: wgpuReadConstants(
            HEAPU32[fragmentIdx + 5],
            HEAP32[fragmentIdx + 4]
          ),
        };
      return desc;
    }
    function _wgpu_device_create_render_pipeline(device, descriptor) {
      return wgpuStoreAndSetParent(
        wgpu[device]["createRenderPipeline"](
          debugDir(
            wgpuReadRenderPipelineDescriptor(descriptor),
            "GPUDevice.createRenderPipeline() with desc"
          )
        ),
        wgpu[device]
      );
    }
    var GPUAddressModes = wgpuDecodeStrings(
      "clamp-to-edge A mirror-A",
      "repeat"
    );
    var GPUFilterModes = wgpuDecodeStrings("Aest liA", "near");
    var GPUMipmapFilterModes = wgpuDecodeStrings("Aest liA", "near");
    function _wgpu_device_create_sampler(device, descriptor) {
      device = wgpu[device];
      descriptor >>= 2;
      let desc = descriptor
        ? {
            addressModeU: GPUAddressModes[HEAPU32[descriptor]],
            addressModeV: GPUAddressModes[HEAPU32[descriptor + 1]],
            addressModeW: GPUAddressModes[HEAPU32[descriptor + 2]],
            magFilter: GPUFilterModes[HEAPU32[descriptor + 3]],
            minFilter: GPUFilterModes[HEAPU32[descriptor + 4]],
            mipmapFilter: GPUMipmapFilterModes[HEAPU32[descriptor + 5]],
            lodMinClamp: HEAPF32[descriptor + 6],
            lodMaxClamp: HEAPF32[descriptor + 7],
            compare: GPUCompareFunctions[HEAPU32[descriptor + 8]],
            maxAnisotropy: HEAPU32[descriptor + 9],
          }
        : void 0;
      let sampler = device["createSampler"](desc);
      return wgpuStoreAndSetParent(sampler, device);
    }
    function wgpuReadShaderModuleCompilationHints(index) {
      let numHints = HEAP32[index],
        hints = [],
        hintsIndex = HEAPU32[index + 1] >> 2,
        hint;
      while (numHints--) {
        hint = HEAPU32[hintsIndex + 1];
        hints.push({
          entryPoint: UTF8ToString(HEAPU32[hintsIndex]),
          layout: hint > 1 ? wgpu[hint] : hint ? GPUAutoLayoutMode : null,
        });
        hintsIndex += 2;
      }
      return hints;
    }
    function wgpuReadShaderModuleDescriptor(descriptor) {
      descriptor = descriptor >> 2;
      return {
        code: UTF8ToString(HEAPU32[descriptor]),
        compilationHints: wgpuReadShaderModuleCompilationHints(descriptor + 1),
      };
    }
    function _wgpu_device_create_shader_module(device, descriptor) {
      return wgpuStoreAndSetParent(
        wgpu[device]["createShaderModule"](
          debugDir(
            wgpuReadShaderModuleDescriptor(descriptor),
            "device.createShaderModule() with desc"
          )
        ),
        wgpu[device]
      );
    }
    function _wgpu_device_create_texture(device, descriptor) {
      device = wgpu[device];
      descriptor >>= 2;
      let desc = {
        size: [
          HEAP32[descriptor],
          HEAP32[descriptor + 1],
          HEAP32[descriptor + 2],
        ],
        mipLevelCount: HEAP32[descriptor + 3],
        sampleCount: HEAP32[descriptor + 4],
        dimension: HEAPU32[descriptor + 5] + "d",
        format: GPUTextureAndVertexFormats[HEAPU32[descriptor + 6]],
        usage: HEAPU32[descriptor + 7],
        viewFormats: wgpuReadArrayOfWgpuObjects(
          HEAPU32[descriptor + 9],
          HEAPU32[descriptor + 8]
        ),
      };
      let texture = device["createTexture"](desc);
      texture.derivedObjects = [];
      return wgpuStoreAndSetParent(texture, device);
    }
    function _wgpu_device_get_queue(device) {
      return wgpu[device]["queue"].wid;
    }
    function _wgpuReportErrorCodeAndMessage(
      device,
      callback,
      errorCode,
      stringMessage,
      userData
    ) {
      if (stringMessage) {
        var stackTop = stackSave(),
          len = lengthBytesUTF8(stringMessage) + 1,
          errorMessage = stackAlloc(len);
        stringToUTF8(stringMessage, errorMessage, len);
      }
      ((a1, a2, a3, a4) =>
        dynCall_viiii.apply(null, [callback, a1, a2, a3, a4]))(
        device,
        errorCode,
        errorMessage,
        userData
      );
      if (stackTop) stackRestore(stackTop);
    }
    function _wgpuDispatchWebGpuErrorEvent(device, callback, error, userData) {
      _wgpuReportErrorCodeAndMessage(
        device,
        callback,
        error
          ? error instanceof GPUInternalError
            ? 3
            : error instanceof GPUValidationError
            ? 2
            : error instanceof GPUOutOfMemoryError
            ? 1
            : 3
          : 0,
        error && error["message"],
        userData
      );
    }
    function _wgpu_device_pop_error_scope_async(device, callback, userData) {
      function dispatchErrorCallback(error) {
        _wgpuDispatchWebGpuErrorEvent(device, callback, error, userData);
      }
      wgpu[device]["popErrorScope"]()
        .then(_wgpuMuteJsExceptions(dispatchErrorCallback))
        .catch(dispatchErrorCallback);
    }
    function _wgpu_device_push_error_scope(device, filter) {
      wgpu[device]["pushErrorScope"](
        [, "out-of-memory", "validation", "internal"][filter]
      );
    }
    function _wgpu_device_set_uncapturederror_callback(
      device,
      callback,
      userData
    ) {
      wgpu[device]["onuncapturederror"] = callback
        ? function (uncapturedError) {
            _wgpuDispatchWebGpuErrorEvent(
              device,
              callback,
              uncapturedError["error"],
              userData
            );
          }
        : null;
    }
    function _wgpu_encoder_end(encoder) {
      wgpu[encoder]["end"]();
      _wgpu_object_destroy(encoder);
    }
    function _wgpu_encoder_finish(encoder) {
      let cmdBuffer = wgpu[encoder]["finish"]();
      _wgpu_object_destroy(encoder);
      return wgpuStore(cmdBuffer);
    }
    function _wgpu_encoder_pop_debug_group(encoder) {
      wgpu[encoder]["popDebugGroup"]();
    }
    function _wgpu_encoder_push_debug_group(encoder, groupLabel) {
      wgpu[encoder]["pushDebugGroup"](UTF8ToString(groupLabel));
    }
    function _wgpu_encoder_set_bind_group(
      encoder,
      index,
      bindGroup,
      dynamicOffsets,
      numDynamicOffsets
    ) {
      wgpu[encoder]["setBindGroup"](
        index,
        wgpu[bindGroup],
        HEAPU32,
        dynamicOffsets >> 2,
        numDynamicOffsets
      );
    }
    function _wgpu_encoder_set_pipeline(encoder, pipeline) {
      wgpu[encoder]["setPipeline"](wgpu[pipeline]);
    }
    function _wgpu_is_valid_object(o) {
      return !!wgpu[o];
    }
    function _wgpu_object_set_label(o, label) {
      wgpu[o]["label"] = UTF8ToString(label);
    }
    function _wgpu_pipeline_get_bind_group_layout(pipelineBase, index) {
      return wgpuStore(
        debugDir(wgpu[pipelineBase]["getBindGroupLayout"](index), "returned")
      );
    }
    function _wgpu_queue_submit_multiple_and_destroy(
      queue,
      commandBuffers,
      numCommandBuffers
    ) {
      wgpu[queue]["submit"](
        wgpuReadArrayOfWgpuObjects(commandBuffers, numCommandBuffers)
      );
      commandBuffers >>= 2;
      let end = commandBuffers + numCommandBuffers;
      while (commandBuffers < end)
        _wgpu_object_destroy(HEAPU32[commandBuffers++]);
    }
    function _wgpu_queue_submit_one_and_destroy(queue, commandBuffer) {
      wgpu[queue]["submit"]([wgpu[commandBuffer]]);
      _wgpu_object_destroy(commandBuffer);
    }
    function _wgpu_queue_write_buffer(queue, buffer, bufferOffset, data, size) {
      wgpu[queue]["writeBuffer"](
        wgpu[buffer],
        bufferOffset,
        HEAPU8,
        data,
        size
      );
    }
    function _wgpu_queue_write_texture(
      queue,
      destination,
      data,
      bytesPerBlockRow,
      blockRowsPerImage,
      writeWidth,
      writeHeight,
      writeDepthOrArrayLayers
    ) {
      wgpu[queue]["writeTexture"](
        wgpuReadGpuImageCopyTexture(destination),
        HEAPU8,
        {
          offset: data,
          bytesPerRow: bytesPerBlockRow,
          rowsPerImage: blockRowsPerImage,
        },
        [writeWidth, writeHeight, writeDepthOrArrayLayers]
      );
    }
    function _wgpu_render_commands_mixin_draw(
      passEncoder,
      vertexCount,
      instanceCount,
      firstVertex,
      firstInstance
    ) {
      wgpu[passEncoder]["draw"](
        vertexCount,
        instanceCount,
        firstVertex,
        firstInstance
      );
    }
    function _wgpu_render_commands_mixin_draw_indexed(
      passEncoder,
      indexCount,
      instanceCount,
      firstVertex,
      baseVertex,
      firstInstance
    ) {
      wgpu[passEncoder]["drawIndexed"](
        indexCount,
        instanceCount,
        firstVertex,
        baseVertex,
        firstInstance
      );
    }
    function _wgpu_render_commands_mixin_draw_indexed_indirect(
      passEncoder,
      indirectBuffer,
      indirectOffset
    ) {
      wgpu[passEncoder]["drawIndexedIndirect"](
        wgpu[indirectBuffer],
        indirectOffset
      );
    }
    function _wgpu_render_commands_mixin_draw_indirect(
      passEncoder,
      indirectBuffer,
      indirectOffset
    ) {
      wgpu[passEncoder]["drawIndirect"](wgpu[indirectBuffer], indirectOffset);
    }
    function _wgpu_render_commands_mixin_set_index_buffer(
      passEncoder,
      buffer,
      indexFormat,
      offset,
      size
    ) {
      size < 0
        ? wgpu[passEncoder]["setIndexBuffer"](
            wgpu[buffer],
            GPUIndexFormats[indexFormat],
            offset
          )
        : wgpu[passEncoder]["setIndexBuffer"](
            wgpu[buffer],
            GPUIndexFormats[indexFormat],
            offset,
            size
          );
    }
    function _wgpu_render_commands_mixin_set_vertex_buffer(
      passEncoder,
      slot,
      buffer,
      offset,
      size
    ) {
      size < 0
        ? wgpu[passEncoder]["setVertexBuffer"](slot, wgpu[buffer], offset)
        : wgpu[passEncoder]["setVertexBuffer"](
            slot,
            wgpu[buffer],
            offset,
            size
          );
    }
    function _wgpu_render_pass_encoder_set_scissor_rect(
      encoder,
      x,
      y,
      width,
      height
    ) {
      wgpu[encoder]["setScissorRect"](x, y, width, height);
    }
    function _wgpu_render_pass_encoder_set_stencil_reference(
      encoder,
      stencilValue
    ) {
      wgpu[encoder]["setStencilReference"](stencilValue);
    }
    function _wgpu_render_pass_encoder_set_viewport(
      encoder,
      x,
      y,
      width,
      height,
      minDepth,
      maxDepth
    ) {
      wgpu[encoder]["setViewport"](x, y, width, height, minDepth, maxDepth);
    }
    function _wgpu_texture_create_view(texture, descriptor) {
      descriptor >>= 2;
      return wgpuStoreAndSetParent(
        wgpu[texture]["createView"](
          debugDir(
            descriptor
              ? {
                  format: GPUTextureAndVertexFormats[HEAPU32[descriptor]],
                  dimension: GPUTextureViewDimensions[HEAPU32[descriptor + 1]],
                  aspect: GPUTextureAspects[HEAPU32[descriptor + 2]],
                  baseMipLevel: HEAP32[descriptor + 3],
                  mipLevelCount: HEAP32[descriptor + 4],
                  baseArrayLayer: HEAP32[descriptor + 5],
                  arrayLayerCount: HEAP32[descriptor + 6],
                }
              : void 0,
            "GPUTexture.createView() with desc"
          )
        ),
        wgpu[texture]
      );
    }
    function _wgpu_texture_create_view_simple(texture) {
      return wgpuStoreAndSetParent(
        wgpu[texture]["createView"](),
        wgpu[texture]
      );
    }
    function getCFunc(ident) {
      var func = Module["_" + ident];
      return func;
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        string: (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) {
            ret = stringToUTF8OnStack(str);
          }
          return ret;
        },
        array: (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        },
      };
      function convertReturnValue(ret) {
        if (returnType === "string") {
          return UTF8ToString(ret);
        }
        if (returnType === "boolean") return Boolean(ret);
        return ret;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
      ret = onDone(ret);
      return ret;
    }
    function cwrap(ident, returnType, argTypes, opts) {
      var numericArgs =
        !argTypes ||
        argTypes.every((type) => type === "number" || type === "boolean");
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }
    function demangle(func) {
      return func;
    }
    function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]";
      });
    }
    function stackTrace() {
      var js = jsStackTrace();
      if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
      return demangleAll(js);
    }
    Module["requestFullscreen"] = function Module_requestFullscreen(
      lockPointer,
      resizeCanvas
    ) {
      Browser.requestFullscreen(lockPointer, resizeCanvas);
    };
    Module["requestAnimationFrame"] = function Module_requestAnimationFrame(
      func
    ) {
      Browser.requestAnimationFrame(func);
    };
    Module["setCanvasSize"] = function Module_setCanvasSize(
      width,
      height,
      noUpdates
    ) {
      Browser.setCanvasSize(width, height, noUpdates);
    };
    Module["pauseMainLoop"] = function Module_pauseMainLoop() {
      Browser.mainLoop.pause();
    };
    Module["resumeMainLoop"] = function Module_resumeMainLoop() {
      Browser.mainLoop.resume();
    };
    Module["getUserMedia"] = function Module_getUserMedia() {
      Browser.getUserMedia();
    };
    Module["createContext"] = function Module_createContext(
      canvas,
      useWebGL,
      setInModule,
      webGLContextAttributes
    ) {
      return Browser.createContext(
        canvas,
        useWebGL,
        setInModule,
        webGLContextAttributes
      );
    };
    var preloadedImages = {};
    var preloadedAudios = {};
    var FSNode = function (parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.mounted = null;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.node_ops = {};
      this.stream_ops = {};
      this.rdev = rdev;
    };
    var readMode = 292 | 73;
    var writeMode = 146;
    Object.defineProperties(FSNode.prototype, {
      read: {
        get: function () {
          return (this.mode & readMode) === readMode;
        },
        set: function (val) {
          val ? (this.mode |= readMode) : (this.mode &= ~readMode);
        },
      },
      write: {
        get: function () {
          return (this.mode & writeMode) === writeMode;
        },
        set: function (val) {
          val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
        },
      },
      isFolder: {
        get: function () {
          return FS.isDir(this.mode);
        },
      },
      isDevice: {
        get: function () {
          return FS.isChrdev(this.mode);
        },
      },
    });
    FS.FSNode = FSNode;
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    Module["FS_createPath"] = FS.createPath;
    Module["FS_createDataFile"] = FS.createDataFile;
    var GLctx;
    for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));
    var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
    for (var i = 0; i < 288; ++i) {
      miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(
        0,
        i + 1
      );
    }
    var miniTempWebGLIntBuffersStorage = new Int32Array(288);
    for (var i = 0; i < 288; ++i) {
      miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(
        0,
        i + 1
      );
    }
    var wasmImports = {
      GetJSLoadTimeInfo: _GetJSLoadTimeInfo,
      GetJSMemoryInfo: _GetJSMemoryInfo,
      JS_Accelerometer_IsRunning: _JS_Accelerometer_IsRunning,
      JS_Accelerometer_Start: _JS_Accelerometer_Start,
      JS_Accelerometer_Stop: _JS_Accelerometer_Stop,
      JS_CallAsLongAsNoExceptionsSeen: _JS_CallAsLongAsNoExceptionsSeen,
      JS_Cursor_SetImage: _JS_Cursor_SetImage,
      JS_Cursor_SetShow: _JS_Cursor_SetShow,
      JS_DOM_MapViewportCoordinateToElementLocalCoordinate:
        _JS_DOM_MapViewportCoordinateToElementLocalCoordinate,
      JS_DOM_UnityCanvasSelector: _JS_DOM_UnityCanvasSelector,
      JS_Eval_OpenURL: _JS_Eval_OpenURL,
      JS_FileSystem_Initialize: _JS_FileSystem_Initialize,
      JS_FileSystem_Sync: _JS_FileSystem_Sync,
      JS_GetRandomBytes: _JS_GetRandomBytes,
      JS_Get_WASM_Size: _JS_Get_WASM_Size,
      JS_GravitySensor_IsRunning: _JS_GravitySensor_IsRunning,
      JS_GravitySensor_Start: _JS_GravitySensor_Start,
      JS_GravitySensor_Stop: _JS_GravitySensor_Stop,
      JS_Gyroscope_IsRunning: _JS_Gyroscope_IsRunning,
      JS_Gyroscope_Start: _JS_Gyroscope_Start,
      JS_Gyroscope_Stop: _JS_Gyroscope_Stop,
      JS_Init_ContextMenuHandler: _JS_Init_ContextMenuHandler,
      JS_Init_CopyPaste: _JS_Init_CopyPaste,
      JS_LinearAccelerationSensor_IsRunning:
        _JS_LinearAccelerationSensor_IsRunning,
      JS_LinearAccelerationSensor_Start: _JS_LinearAccelerationSensor_Start,
      JS_LinearAccelerationSensor_Stop: _JS_LinearAccelerationSensor_Stop,
      JS_Log_Dump: _JS_Log_Dump,
      JS_Log_StackTrace: _JS_Log_StackTrace,
      JS_MobileKeybard_GetIgnoreBlurEvent: _JS_MobileKeybard_GetIgnoreBlurEvent,
      JS_MobileKeyboard_GetKeyboardStatus: _JS_MobileKeyboard_GetKeyboardStatus,
      JS_MobileKeyboard_GetText: _JS_MobileKeyboard_GetText,
      JS_MobileKeyboard_GetTextSelection: _JS_MobileKeyboard_GetTextSelection,
      JS_MobileKeyboard_Hide: _JS_MobileKeyboard_Hide,
      JS_MobileKeyboard_SetCharacterLimit: _JS_MobileKeyboard_SetCharacterLimit,
      JS_MobileKeyboard_SetText: _JS_MobileKeyboard_SetText,
      JS_MobileKeyboard_SetTextSelection: _JS_MobileKeyboard_SetTextSelection,
      JS_MobileKeyboard_Show: _JS_MobileKeyboard_Show,
      JS_Module_WebGLContextAttributes_PowerPreference:
        _JS_Module_WebGLContextAttributes_PowerPreference,
      JS_Module_WebGLContextAttributes_PremultipliedAlpha:
        _JS_Module_WebGLContextAttributes_PremultipliedAlpha,
      JS_Module_WebGLContextAttributes_PreserveDrawingBuffer:
        _JS_Module_WebGLContextAttributes_PreserveDrawingBuffer,
      JS_OrientationSensor_IsRunning: _JS_OrientationSensor_IsRunning,
      JS_OrientationSensor_Start: _JS_OrientationSensor_Start,
      JS_OrientationSensor_Stop: _JS_OrientationSensor_Stop,
      JS_RequestDeviceSensorPermissionsOnTouch:
        _JS_RequestDeviceSensorPermissionsOnTouch,
      JS_RunQuitCallbacks: _JS_RunQuitCallbacks,
      JS_ScreenOrientation_DeInit: _JS_ScreenOrientation_DeInit,
      JS_ScreenOrientation_Init: _JS_ScreenOrientation_Init,
      JS_ScreenOrientation_Lock: _JS_ScreenOrientation_Lock,
      JS_SetMainLoop: _JS_SetMainLoop,
      JS_Sound_Create_Channel: _JS_Sound_Create_Channel,
      JS_Sound_GetAudioBufferSampleRate: _JS_Sound_GetAudioBufferSampleRate,
      JS_Sound_GetAudioContextSampleRate: _JS_Sound_GetAudioContextSampleRate,
      JS_Sound_GetLength: _JS_Sound_GetLength,
      JS_Sound_GetLoadState: _JS_Sound_GetLoadState,
      JS_Sound_Init: _JS_Sound_Init,
      JS_Sound_Load: _JS_Sound_Load,
      JS_Sound_Load_PCM: _JS_Sound_Load_PCM,
      JS_Sound_Play: _JS_Sound_Play,
      JS_Sound_ReleaseInstance: _JS_Sound_ReleaseInstance,
      JS_Sound_ResumeIfNeeded: _JS_Sound_ResumeIfNeeded,
      JS_Sound_Set3D: _JS_Sound_Set3D,
      JS_Sound_SetListenerOrientation: _JS_Sound_SetListenerOrientation,
      JS_Sound_SetListenerPosition: _JS_Sound_SetListenerPosition,
      JS_Sound_SetLoop: _JS_Sound_SetLoop,
      JS_Sound_SetLoopPoints: _JS_Sound_SetLoopPoints,
      JS_Sound_SetPaused: _JS_Sound_SetPaused,
      JS_Sound_SetPitch: _JS_Sound_SetPitch,
      JS_Sound_SetPosition: _JS_Sound_SetPosition,
      JS_Sound_SetVolume: _JS_Sound_SetVolume,
      JS_Sound_Stop: _JS_Sound_Stop,
      JS_SystemInfo_GetCanvasClientSize: _JS_SystemInfo_GetCanvasClientSize,
      JS_SystemInfo_GetDocumentURL: _JS_SystemInfo_GetDocumentURL,
      JS_SystemInfo_GetGPUInfo: _JS_SystemInfo_GetGPUInfo,
      JS_SystemInfo_GetMatchWebGLToCanvasSize:
        _JS_SystemInfo_GetMatchWebGLToCanvasSize,
      JS_SystemInfo_GetOS: _JS_SystemInfo_GetOS,
      JS_SystemInfo_GetPreferredDevicePixelRatio:
        _JS_SystemInfo_GetPreferredDevicePixelRatio,
      JS_SystemInfo_GetScreenSize: _JS_SystemInfo_GetScreenSize,
      JS_SystemInfo_HasAstcHdr: _JS_SystemInfo_HasAstcHdr,
      JS_SystemInfo_HasCursorLock: _JS_SystemInfo_HasCursorLock,
      JS_SystemInfo_HasFullscreen: _JS_SystemInfo_HasFullscreen,
      JS_SystemInfo_HasWebGL: _JS_SystemInfo_HasWebGL,
      JS_SystemInfo_HasWebGPU: _JS_SystemInfo_HasWebGPU,
      JS_UnityEngineShouldQuit: _JS_UnityEngineShouldQuit,
      JS_WebCamVideo_GetNativeHeight: _JS_WebCamVideo_GetNativeHeight,
      JS_WebCamVideo_GetNativeWidth: _JS_WebCamVideo_GetNativeWidth,
      JS_WebCamVideo_GrabFrame: _JS_WebCamVideo_GrabFrame,
      JS_WebGPU_SetCommandEncoder: _JS_WebGPU_SetCommandEncoder,
      JS_WebGPU_Setup: _JS_WebGPU_Setup,
      __cxa_begin_catch: ___cxa_begin_catch,
      __cxa_end_catch: ___cxa_end_catch,
      __cxa_find_matching_catch_2: ___cxa_find_matching_catch_2,
      __cxa_find_matching_catch_3: ___cxa_find_matching_catch_3,
      __cxa_find_matching_catch_4: ___cxa_find_matching_catch_4,
      __cxa_rethrow: ___cxa_rethrow,
      __cxa_throw: ___cxa_throw,
      __cxa_uncaught_exceptions: ___cxa_uncaught_exceptions,
      __resumeException: ___resumeException,
      __syscall__newselect: ___syscall__newselect,
      __syscall_chmod: ___syscall_chmod,
      __syscall_connect: ___syscall_connect,
      __syscall_faccessat: ___syscall_faccessat,
      __syscall_fcntl64: ___syscall_fcntl64,
      __syscall_fstat64: ___syscall_fstat64,
      __syscall_getcwd: ___syscall_getcwd,
      __syscall_getdents64: ___syscall_getdents64,
      __syscall_ioctl: ___syscall_ioctl,
      __syscall_lstat64: ___syscall_lstat64,
      __syscall_mkdirat: ___syscall_mkdirat,
      __syscall_newfstatat: ___syscall_newfstatat,
      __syscall_openat: ___syscall_openat,
      __syscall_readlinkat: ___syscall_readlinkat,
      __syscall_recvfrom: ___syscall_recvfrom,
      __syscall_renameat: ___syscall_renameat,
      __syscall_rmdir: ___syscall_rmdir,
      __syscall_sendto: ___syscall_sendto,
      __syscall_socket: ___syscall_socket,
      __syscall_stat64: ___syscall_stat64,
      __syscall_statfs64: ___syscall_statfs64,
      __syscall_symlink: ___syscall_symlink,
      __syscall_truncate64: ___syscall_truncate64,
      __syscall_unlinkat: ___syscall_unlinkat,
      __syscall_utimensat: ___syscall_utimensat,
      _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
      _emscripten_throw_longjmp: __emscripten_throw_longjmp,
      _gmtime_js: __gmtime_js,
      _localtime_js: __localtime_js,
      _mktime_js: __mktime_js,
      _mmap_js: __mmap_js,
      _munmap_js: __munmap_js,
      _tzset_js: __tzset_js,
      abort: _abort,
      emscripten_cancel_main_loop: _emscripten_cancel_main_loop,
      emscripten_clear_interval: _emscripten_clear_interval,
      emscripten_date_now: _emscripten_date_now,
      emscripten_debugger: _emscripten_debugger,
      emscripten_exit_fullscreen: _emscripten_exit_fullscreen,
      emscripten_exit_pointerlock: _emscripten_exit_pointerlock,
      emscripten_get_canvas_element_size: _emscripten_get_canvas_element_size,
      emscripten_get_fullscreen_status: _emscripten_get_fullscreen_status,
      emscripten_get_gamepad_status: _emscripten_get_gamepad_status,
      emscripten_get_heap_max: _emscripten_get_heap_max,
      emscripten_get_now: _emscripten_get_now,
      emscripten_get_now_res: _emscripten_get_now_res,
      emscripten_get_num_gamepads: _emscripten_get_num_gamepads,
      emscripten_html5_remove_all_event_listeners:
        _emscripten_html5_remove_all_event_listeners,
      emscripten_is_webgl_context_lost: _emscripten_is_webgl_context_lost,
      emscripten_log: _emscripten_log,
      emscripten_memcpy_big: _emscripten_memcpy_big,
      emscripten_request_fullscreen: _emscripten_request_fullscreen,
      emscripten_request_pointerlock: _emscripten_request_pointerlock,
      emscripten_resize_heap: _emscripten_resize_heap,
      emscripten_sample_gamepad_data: _emscripten_sample_gamepad_data,
      emscripten_set_blur_callback_on_thread:
        _emscripten_set_blur_callback_on_thread,
      emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size,
      emscripten_set_focus_callback_on_thread:
        _emscripten_set_focus_callback_on_thread,
      emscripten_set_fullscreenchange_callback_on_thread:
        _emscripten_set_fullscreenchange_callback_on_thread,
      emscripten_set_gamepadconnected_callback_on_thread:
        _emscripten_set_gamepadconnected_callback_on_thread,
      emscripten_set_gamepaddisconnected_callback_on_thread:
        _emscripten_set_gamepaddisconnected_callback_on_thread,
      emscripten_set_interval: _emscripten_set_interval,
      emscripten_set_keydown_callback_on_thread:
        _emscripten_set_keydown_callback_on_thread,
      emscripten_set_keypress_callback_on_thread:
        _emscripten_set_keypress_callback_on_thread,
      emscripten_set_keyup_callback_on_thread:
        _emscripten_set_keyup_callback_on_thread,
      emscripten_set_main_loop_timing: _emscripten_set_main_loop_timing,
      emscripten_set_mousedown_callback_on_thread:
        _emscripten_set_mousedown_callback_on_thread,
      emscripten_set_mousemove_callback_on_thread:
        _emscripten_set_mousemove_callback_on_thread,
      emscripten_set_mouseup_callback_on_thread:
        _emscripten_set_mouseup_callback_on_thread,
      emscripten_set_pointerlockchange_callback_on_thread:
        _emscripten_set_pointerlockchange_callback_on_thread,
      emscripten_set_touchcancel_callback_on_thread:
        _emscripten_set_touchcancel_callback_on_thread,
      emscripten_set_touchend_callback_on_thread:
        _emscripten_set_touchend_callback_on_thread,
      emscripten_set_touchmove_callback_on_thread:
        _emscripten_set_touchmove_callback_on_thread,
      emscripten_set_touchstart_callback_on_thread:
        _emscripten_set_touchstart_callback_on_thread,
      emscripten_set_wheel_callback_on_thread:
        _emscripten_set_wheel_callback_on_thread,
      emscripten_webgl_create_context: _emscripten_webgl_create_context,
      emscripten_webgl_destroy_context: _emscripten_webgl_destroy_context,
      emscripten_webgl_enable_extension: _emscripten_webgl_enable_extension,
      emscripten_webgl_get_current_context:
        _emscripten_webgl_get_current_context,
      emscripten_webgl_init_context_attributes:
        _emscripten_webgl_init_context_attributes,
      emscripten_webgl_make_context_current:
        _emscripten_webgl_make_context_current,
      environ_get: _environ_get,
      environ_sizes_get: _environ_sizes_get,
      exit: _exit,
      fd_close: _fd_close,
      fd_read: _fd_read,
      fd_seek: _fd_seek,
      fd_write: _fd_write,
      gethostbyaddr: _gethostbyaddr,
      gethostbyname: _gethostbyname,
      glActiveTexture: _glActiveTexture,
      glAttachShader: _glAttachShader,
      glBeginQuery: _glBeginQuery,
      glBindAttribLocation: _glBindAttribLocation,
      glBindBuffer: _glBindBuffer,
      glBindBufferBase: _glBindBufferBase,
      glBindBufferRange: _glBindBufferRange,
      glBindFramebuffer: _glBindFramebuffer,
      glBindRenderbuffer: _glBindRenderbuffer,
      glBindSampler: _glBindSampler,
      glBindTexture: _glBindTexture,
      glBindVertexArray: _glBindVertexArray,
      glBlendEquation: _glBlendEquation,
      glBlendEquationSeparate: _glBlendEquationSeparate,
      glBlendFuncSeparate: _glBlendFuncSeparate,
      glBlitFramebuffer: _glBlitFramebuffer,
      glBufferData: _glBufferData,
      glBufferSubData: _glBufferSubData,
      glCheckFramebufferStatus: _glCheckFramebufferStatus,
      glClear: _glClear,
      glClearBufferfi: _glClearBufferfi,
      glClearBufferfv: _glClearBufferfv,
      glClearBufferuiv: _glClearBufferuiv,
      glClearColor: _glClearColor,
      glClearDepthf: _glClearDepthf,
      glClearStencil: _glClearStencil,
      glClientWaitSync: _glClientWaitSync,
      glColorMask: _glColorMask,
      glCompileShader: _glCompileShader,
      glCompressedTexImage2D: _glCompressedTexImage2D,
      glCompressedTexImage3D: _glCompressedTexImage3D,
      glCompressedTexSubImage2D: _glCompressedTexSubImage2D,
      glCompressedTexSubImage3D: _glCompressedTexSubImage3D,
      glCopyBufferSubData: _glCopyBufferSubData,
      glCopyTexImage2D: _glCopyTexImage2D,
      glCopyTexSubImage2D: _glCopyTexSubImage2D,
      glCreateProgram: _glCreateProgram,
      glCreateShader: _glCreateShader,
      glCullFace: _glCullFace,
      glDeleteBuffers: _glDeleteBuffers,
      glDeleteFramebuffers: _glDeleteFramebuffers,
      glDeleteProgram: _glDeleteProgram,
      glDeleteQueries: _glDeleteQueries,
      glDeleteRenderbuffers: _glDeleteRenderbuffers,
      glDeleteSamplers: _glDeleteSamplers,
      glDeleteShader: _glDeleteShader,
      glDeleteSync: _glDeleteSync,
      glDeleteTextures: _glDeleteTextures,
      glDeleteVertexArrays: _glDeleteVertexArrays,
      glDepthFunc: _glDepthFunc,
      glDepthMask: _glDepthMask,
      glDetachShader: _glDetachShader,
      glDisable: _glDisable,
      glDisableVertexAttribArray: _glDisableVertexAttribArray,
      glDrawArrays: _glDrawArrays,
      glDrawArraysInstanced: _glDrawArraysInstanced,
      glDrawBuffers: _glDrawBuffers,
      glDrawElements: _glDrawElements,
      glDrawElementsInstanced: _glDrawElementsInstanced,
      glEnable: _glEnable,
      glEnableVertexAttribArray: _glEnableVertexAttribArray,
      glEndQuery: _glEndQuery,
      glFenceSync: _glFenceSync,
      glFinish: _glFinish,
      glFlush: _glFlush,
      glFlushMappedBufferRange: _glFlushMappedBufferRange,
      glFramebufferRenderbuffer: _glFramebufferRenderbuffer,
      glFramebufferTexture2D: _glFramebufferTexture2D,
      glFramebufferTextureLayer: _glFramebufferTextureLayer,
      glFrontFace: _glFrontFace,
      glGenBuffers: _glGenBuffers,
      glGenFramebuffers: _glGenFramebuffers,
      glGenQueries: _glGenQueries,
      glGenRenderbuffers: _glGenRenderbuffers,
      glGenSamplers: _glGenSamplers,
      glGenTextures: _glGenTextures,
      glGenVertexArrays: _glGenVertexArrays,
      glGenerateMipmap: _glGenerateMipmap,
      glGetActiveAttrib: _glGetActiveAttrib,
      glGetActiveUniform: _glGetActiveUniform,
      glGetActiveUniformBlockName: _glGetActiveUniformBlockName,
      glGetActiveUniformBlockiv: _glGetActiveUniformBlockiv,
      glGetActiveUniformsiv: _glGetActiveUniformsiv,
      glGetAttribLocation: _glGetAttribLocation,
      glGetBufferSubData: _glGetBufferSubData,
      glGetError: _glGetError,
      glGetFramebufferAttachmentParameteriv:
        _glGetFramebufferAttachmentParameteriv,
      glGetIntegeri_v: _glGetIntegeri_v,
      glGetIntegerv: _glGetIntegerv,
      glGetInternalformativ: _glGetInternalformativ,
      glGetProgramBinary: _glGetProgramBinary,
      glGetProgramInfoLog: _glGetProgramInfoLog,
      glGetProgramiv: _glGetProgramiv,
      glGetQueryObjectuiv: _glGetQueryObjectuiv,
      glGetQueryiv: _glGetQueryiv,
      glGetRenderbufferParameteriv: _glGetRenderbufferParameteriv,
      glGetShaderInfoLog: _glGetShaderInfoLog,
      glGetShaderPrecisionFormat: _glGetShaderPrecisionFormat,
      glGetShaderSource: _glGetShaderSource,
      glGetShaderiv: _glGetShaderiv,
      glGetString: _glGetString,
      glGetStringi: _glGetStringi,
      glGetTexParameteriv: _glGetTexParameteriv,
      glGetUniformBlockIndex: _glGetUniformBlockIndex,
      glGetUniformIndices: _glGetUniformIndices,
      glGetUniformLocation: _glGetUniformLocation,
      glGetUniformiv: _glGetUniformiv,
      glGetVertexAttribiv: _glGetVertexAttribiv,
      glInvalidateFramebuffer: _glInvalidateFramebuffer,
      glIsEnabled: _glIsEnabled,
      glIsVertexArray: _glIsVertexArray,
      glLinkProgram: _glLinkProgram,
      glMapBufferRange: _glMapBufferRange,
      glPixelStorei: _glPixelStorei,
      glPolygonOffset: _glPolygonOffset,
      glProgramBinary: _glProgramBinary,
      glProgramParameteri: _glProgramParameteri,
      glReadBuffer: _glReadBuffer,
      glReadPixels: _glReadPixels,
      glRenderbufferStorage: _glRenderbufferStorage,
      glRenderbufferStorageMultisample: _glRenderbufferStorageMultisample,
      glSamplerParameteri: _glSamplerParameteri,
      glScissor: _glScissor,
      glShaderSource: _glShaderSource,
      glStencilFuncSeparate: _glStencilFuncSeparate,
      glStencilMask: _glStencilMask,
      glStencilOpSeparate: _glStencilOpSeparate,
      glTexImage2D: _glTexImage2D,
      glTexImage3D: _glTexImage3D,
      glTexParameterf: _glTexParameterf,
      glTexParameteri: _glTexParameteri,
      glTexParameteriv: _glTexParameteriv,
      glTexStorage2D: _glTexStorage2D,
      glTexStorage3D: _glTexStorage3D,
      glTexSubImage2D: _glTexSubImage2D,
      glTexSubImage3D: _glTexSubImage3D,
      glUniform1fv: _glUniform1fv,
      glUniform1i: _glUniform1i,
      glUniform1iv: _glUniform1iv,
      glUniform1uiv: _glUniform1uiv,
      glUniform2fv: _glUniform2fv,
      glUniform2iv: _glUniform2iv,
      glUniform2uiv: _glUniform2uiv,
      glUniform3fv: _glUniform3fv,
      glUniform3iv: _glUniform3iv,
      glUniform3uiv: _glUniform3uiv,
      glUniform4fv: _glUniform4fv,
      glUniform4iv: _glUniform4iv,
      glUniform4uiv: _glUniform4uiv,
      glUniformBlockBinding: _glUniformBlockBinding,
      glUniformMatrix3fv: _glUniformMatrix3fv,
      glUniformMatrix4fv: _glUniformMatrix4fv,
      glUnmapBuffer: _glUnmapBuffer,
      glUseProgram: _glUseProgram,
      glValidateProgram: _glValidateProgram,
      glVertexAttrib4f: _glVertexAttrib4f,
      glVertexAttrib4fv: _glVertexAttrib4fv,
      glVertexAttribIPointer: _glVertexAttribIPointer,
      glVertexAttribPointer: _glVertexAttribPointer,
      glViewport: _glViewport,
      invoke_ddiii: invoke_ddiii,
      invoke_di: invoke_di,
      invoke_dii: invoke_dii,
      invoke_diii: invoke_diii,
      invoke_fffi: invoke_fffi,
      invoke_fi: invoke_fi,
      invoke_fiffi: invoke_fiffi,
      invoke_fii: invoke_fii,
      invoke_fiiffi: invoke_fiiffi,
      invoke_fiii: invoke_fiii,
      invoke_fiiii: invoke_fiiii,
      invoke_i: invoke_i,
      invoke_ii: invoke_ii,
      invoke_iifi: invoke_iifi,
      invoke_iii: invoke_iii,
      invoke_iiif: invoke_iiif,
      invoke_iiifi: invoke_iiifi,
      invoke_iiifii: invoke_iiifii,
      invoke_iiii: invoke_iiii,
      invoke_iiiidii: invoke_iiiidii,
      invoke_iiiifii: invoke_iiiifii,
      invoke_iiiii: invoke_iiiii,
      invoke_iiiiii: invoke_iiiiii,
      invoke_iiiiiiffiiiiiiiiiffffiii: invoke_iiiiiiffiiiiiiiiiffffiii,
      invoke_iiiiiii: invoke_iiiiiii,
      invoke_iiiiiiidii: invoke_iiiiiiidii,
      invoke_iiiiiiii: invoke_iiiiiiii,
      invoke_iiiiiiiii: invoke_iiiiiiiii,
      invoke_iiiiiiiiii: invoke_iiiiiiiiii,
      invoke_iiiiiiiiiii: invoke_iiiiiiiiiii,
      invoke_iiiiiiiiiiii: invoke_iiiiiiiiiiii,
      invoke_iiiiiiiiiiiii: invoke_iiiiiiiiiiiii,
      invoke_iiiiiiiiiji: invoke_iiiiiiiiiji,
      invoke_iiiijii: invoke_iiiijii,
      invoke_iiijii: invoke_iiijii,
      invoke_iiijiii: invoke_iiijiii,
      invoke_iij: invoke_iij,
      invoke_iiji: invoke_iiji,
      invoke_iijii: invoke_iijii,
      invoke_iijiii: invoke_iijiii,
      invoke_iijji: invoke_iijji,
      invoke_iji: invoke_iji,
      invoke_ijji: invoke_ijji,
      invoke_j: invoke_j,
      invoke_ji: invoke_ji,
      invoke_jii: invoke_jii,
      invoke_jiii: invoke_jiii,
      invoke_jiiii: invoke_jiiii,
      invoke_jiiiii: invoke_jiiiii,
      invoke_jiiiiiiiiii: invoke_jiiiiiiiiii,
      invoke_jiji: invoke_jiji,
      invoke_jijii: invoke_jijii,
      invoke_jjji: invoke_jjji,
      invoke_v: invoke_v,
      invoke_vi: invoke_vi,
      invoke_vidi: invoke_vidi,
      invoke_viffi: invoke_viffi,
      invoke_vifi: invoke_vifi,
      invoke_vififiiii: invoke_vififiiii,
      invoke_vifii: invoke_vifii,
      invoke_vii: invoke_vii,
      invoke_viidi: invoke_viidi,
      invoke_viidiji: invoke_viidiji,
      invoke_viiff: invoke_viiff,
      invoke_viiffi: invoke_viiffi,
      invoke_viifi: invoke_viifi,
      invoke_viifii: invoke_viifii,
      invoke_viifiii: invoke_viifiii,
      invoke_viii: invoke_viii,
      invoke_viiifi: invoke_viiifi,
      invoke_viiififiii: invoke_viiififiii,
      invoke_viiifii: invoke_viiifii,
      invoke_viiii: invoke_viiii,
      invoke_viiiidi: invoke_viiiidi,
      invoke_viiiifi: invoke_viiiifi,
      invoke_viiiii: invoke_viiiii,
      invoke_viiiiii: invoke_viiiiii,
      invoke_viiiiiifii: invoke_viiiiiifii,
      invoke_viiiiiii: invoke_viiiiiii,
      invoke_viiiiiiii: invoke_viiiiiiii,
      invoke_viiiiiiiiii: invoke_viiiiiiiiii,
      invoke_viiiiiiiiiiiiiii: invoke_viiiiiiiiiiiiiii,
      invoke_viiiji: invoke_viiiji,
      invoke_viiji: invoke_viiji,
      invoke_viijii: invoke_viijii,
      invoke_viji: invoke_viji,
      invoke_vijii: invoke_vijii,
      invoke_vijiii: invoke_vijiii,
      invoke_vji: invoke_vji,
      invoke_vjiiiii: invoke_vjiiiii,
      invoke_vjjjiiii: invoke_vjjjiiii,
      llvm_eh_typeid_for: _llvm_eh_typeid_for,
      navigator_gpu_get_preferred_canvas_format:
        _navigator_gpu_get_preferred_canvas_format,
      navigator_gpu_request_adapter_async: _navigator_gpu_request_adapter_async,
      strftime: _strftime,
      strftime_l: _strftime_l,
      wgpu_adapter_or_device_get_features: _wgpu_adapter_or_device_get_features,
      wgpu_adapter_or_device_get_limits: _wgpu_adapter_or_device_get_limits,
      wgpu_adapter_request_device_async: _wgpu_adapter_request_device_async,
      wgpu_buffer_get_mapped_range: _wgpu_buffer_get_mapped_range,
      wgpu_buffer_map_async: _wgpu_buffer_map_async,
      wgpu_buffer_read_mapped_range: _wgpu_buffer_read_mapped_range,
      wgpu_buffer_unmap: _wgpu_buffer_unmap,
      wgpu_canvas_context_configure: _wgpu_canvas_context_configure,
      wgpu_canvas_context_get_current_texture:
        _wgpu_canvas_context_get_current_texture,
      wgpu_canvas_get_webgpu_context: _wgpu_canvas_get_webgpu_context,
      wgpu_command_encoder_begin_compute_pass:
        _wgpu_command_encoder_begin_compute_pass,
      wgpu_command_encoder_begin_render_pass:
        _wgpu_command_encoder_begin_render_pass,
      wgpu_command_encoder_begin_render_pass_1color_0depth:
        _wgpu_command_encoder_begin_render_pass_1color_0depth,
      wgpu_command_encoder_copy_buffer_to_buffer:
        _wgpu_command_encoder_copy_buffer_to_buffer,
      wgpu_command_encoder_copy_texture_to_buffer:
        _wgpu_command_encoder_copy_texture_to_buffer,
      wgpu_command_encoder_copy_texture_to_texture:
        _wgpu_command_encoder_copy_texture_to_texture,
      wgpu_compute_pass_encoder_dispatch_workgroups:
        _wgpu_compute_pass_encoder_dispatch_workgroups,
      wgpu_compute_pass_encoder_dispatch_workgroups_indirect:
        _wgpu_compute_pass_encoder_dispatch_workgroups_indirect,
      wgpu_device_create_bind_group: _wgpu_device_create_bind_group,
      wgpu_device_create_bind_group_layout:
        _wgpu_device_create_bind_group_layout,
      wgpu_device_create_buffer: _wgpu_device_create_buffer,
      wgpu_device_create_command_encoder: _wgpu_device_create_command_encoder,
      wgpu_device_create_command_encoder_simple:
        _wgpu_device_create_command_encoder_simple,
      wgpu_device_create_compute_pipeline: _wgpu_device_create_compute_pipeline,
      wgpu_device_create_pipeline_layout: _wgpu_device_create_pipeline_layout,
      wgpu_device_create_render_pipeline: _wgpu_device_create_render_pipeline,
      wgpu_device_create_sampler: _wgpu_device_create_sampler,
      wgpu_device_create_shader_module: _wgpu_device_create_shader_module,
      wgpu_device_create_texture: _wgpu_device_create_texture,
      wgpu_device_get_queue: _wgpu_device_get_queue,
      wgpu_device_pop_error_scope_async: _wgpu_device_pop_error_scope_async,
      wgpu_device_push_error_scope: _wgpu_device_push_error_scope,
      wgpu_device_set_uncapturederror_callback:
        _wgpu_device_set_uncapturederror_callback,
      wgpu_encoder_end: _wgpu_encoder_end,
      wgpu_encoder_finish: _wgpu_encoder_finish,
      wgpu_encoder_pop_debug_group: _wgpu_encoder_pop_debug_group,
      wgpu_encoder_push_debug_group: _wgpu_encoder_push_debug_group,
      wgpu_encoder_set_bind_group: _wgpu_encoder_set_bind_group,
      wgpu_encoder_set_pipeline: _wgpu_encoder_set_pipeline,
      wgpu_is_valid_object: _wgpu_is_valid_object,
      wgpu_object_destroy: _wgpu_object_destroy,
      wgpu_object_set_label: _wgpu_object_set_label,
      wgpu_pipeline_get_bind_group_layout: _wgpu_pipeline_get_bind_group_layout,
      wgpu_queue_submit_multiple_and_destroy:
        _wgpu_queue_submit_multiple_and_destroy,
      wgpu_queue_submit_one_and_destroy: _wgpu_queue_submit_one_and_destroy,
      wgpu_queue_write_buffer: _wgpu_queue_write_buffer,
      wgpu_queue_write_texture: _wgpu_queue_write_texture,
      wgpu_render_commands_mixin_draw: _wgpu_render_commands_mixin_draw,
      wgpu_render_commands_mixin_draw_indexed:
        _wgpu_render_commands_mixin_draw_indexed,
      wgpu_render_commands_mixin_draw_indexed_indirect:
        _wgpu_render_commands_mixin_draw_indexed_indirect,
      wgpu_render_commands_mixin_draw_indirect:
        _wgpu_render_commands_mixin_draw_indirect,
      wgpu_render_commands_mixin_set_index_buffer:
        _wgpu_render_commands_mixin_set_index_buffer,
      wgpu_render_commands_mixin_set_vertex_buffer:
        _wgpu_render_commands_mixin_set_vertex_buffer,
      wgpu_render_pass_encoder_set_scissor_rect:
        _wgpu_render_pass_encoder_set_scissor_rect,
      wgpu_render_pass_encoder_set_stencil_reference:
        _wgpu_render_pass_encoder_set_stencil_reference,
      wgpu_render_pass_encoder_set_viewport:
        _wgpu_render_pass_encoder_set_viewport,
      wgpu_texture_create_view: _wgpu_texture_create_view,
      wgpu_texture_create_view_simple: _wgpu_texture_create_view_simple,
    };
    var asm = createWasm();
    var ___wasm_call_ctors = function () {
      return (___wasm_call_ctors = Module["asm"]["__wasm_call_ctors"]).apply(
        null,
        arguments
      );
    };
    var _ReleaseKeys = (Module["_ReleaseKeys"] = function () {
      return (_ReleaseKeys = Module["_ReleaseKeys"] =
        Module["asm"]["ReleaseKeys"]).apply(null, arguments);
    });
    var _GetCopyBufferAsCStr = (Module["_GetCopyBufferAsCStr"] = function () {
      return (_GetCopyBufferAsCStr = Module["_GetCopyBufferAsCStr"] =
        Module["asm"]["GetCopyBufferAsCStr"]).apply(null, arguments);
    });
    var _getMetricsInfo = (Module["_getMetricsInfo"] = function () {
      return (_getMetricsInfo = Module["_getMetricsInfo"] =
        Module["asm"]["getMetricsInfo"]).apply(null, arguments);
    });
    var _SendMessageFloat = (Module["_SendMessageFloat"] = function () {
      return (_SendMessageFloat = Module["_SendMessageFloat"] =
        Module["asm"]["SendMessageFloat"]).apply(null, arguments);
    });
    var _SendMessageString = (Module["_SendMessageString"] = function () {
      return (_SendMessageString = Module["_SendMessageString"] =
        Module["asm"]["SendMessageString"]).apply(null, arguments);
    });
    var _SendMessage = (Module["_SendMessage"] = function () {
      return (_SendMessage = Module["_SendMessage"] =
        Module["asm"]["SendMessage"]).apply(null, arguments);
    });
    var _SetFullscreen = (Module["_SetFullscreen"] = function () {
      return (_SetFullscreen = Module["_SetFullscreen"] =
        Module["asm"]["SetFullscreen"]).apply(null, arguments);
    });
    var _main = (Module["_main"] = function () {
      return (_main = Module["_main"] =
        Module["asm"]["__main_argc_argv"]).apply(null, arguments);
    });
    var _SendPasteEvent = (Module["_SendPasteEvent"] = function () {
      return (_SendPasteEvent = Module["_SendPasteEvent"] =
        Module["asm"]["SendPasteEvent"]).apply(null, arguments);
    });
    var ___errno_location = function () {
      return (___errno_location = Module["asm"]["__errno_location"]).apply(
        null,
        arguments
      );
    };
    var _htonl = function () {
      return (_htonl = Module["asm"]["htonl"]).apply(null, arguments);
    };
    var _htons = function () {
      return (_htons = Module["asm"]["htons"]).apply(null, arguments);
    };
    var _ntohs = function () {
      return (_ntohs = Module["asm"]["ntohs"]).apply(null, arguments);
    };
    var _malloc = function () {
      return (_malloc = Module["asm"]["malloc"]).apply(null, arguments);
    };
    var _free = function () {
      return (_free = Module["asm"]["free"]).apply(null, arguments);
    };
    var _emscripten_builtin_memalign = function () {
      return (_emscripten_builtin_memalign =
        Module["asm"]["emscripten_builtin_memalign"]).apply(null, arguments);
    };
    var _setThrew = function () {
      return (_setThrew = Module["asm"]["setThrew"]).apply(null, arguments);
    };
    var setTempRet0 = function () {
      return (setTempRet0 = Module["asm"]["setTempRet0"]).apply(
        null,
        arguments
      );
    };
    var getTempRet0 = function () {
      return (getTempRet0 = Module["asm"]["getTempRet0"]).apply(
        null,
        arguments
      );
    };
    var stackSave = function () {
      return (stackSave = Module["asm"]["stackSave"]).apply(null, arguments);
    };
    var stackRestore = function () {
      return (stackRestore = Module["asm"]["stackRestore"]).apply(
        null,
        arguments
      );
    };
    var stackAlloc = function () {
      return (stackAlloc = Module["asm"]["stackAlloc"]).apply(null, arguments);
    };
    var ___cxa_free_exception = function () {
      return (___cxa_free_exception =
        Module["asm"]["__cxa_free_exception"]).apply(null, arguments);
    };
    var ___cxa_increment_exception_refcount = function () {
      return (___cxa_increment_exception_refcount =
        Module["asm"]["__cxa_increment_exception_refcount"]).apply(
        null,
        arguments
      );
    };
    var ___cxa_decrement_exception_refcount = function () {
      return (___cxa_decrement_exception_refcount =
        Module["asm"]["__cxa_decrement_exception_refcount"]).apply(
        null,
        arguments
      );
    };
    var ___cxa_can_catch = function () {
      return (___cxa_can_catch = Module["asm"]["__cxa_can_catch"]).apply(
        null,
        arguments
      );
    };
    var ___cxa_is_pointer_type = function () {
      return (___cxa_is_pointer_type =
        Module["asm"]["__cxa_is_pointer_type"]).apply(null, arguments);
    };
    var dynCall_ii = (Module["dynCall_ii"] = function () {
      return (dynCall_ii = Module["dynCall_ii"] =
        Module["asm"]["dynCall_ii"]).apply(null, arguments);
    });
    var dynCall_iiii = (Module["dynCall_iiii"] = function () {
      return (dynCall_iiii = Module["dynCall_iiii"] =
        Module["asm"]["dynCall_iiii"]).apply(null, arguments);
    });
    var dynCall_jiji = (Module["dynCall_jiji"] = function () {
      return (dynCall_jiji = Module["dynCall_jiji"] =
        Module["asm"]["dynCall_jiji"]).apply(null, arguments);
    });
    var dynCall_iidiiii = (Module["dynCall_iidiiii"] = function () {
      return (dynCall_iidiiii = Module["dynCall_iidiiii"] =
        Module["asm"]["dynCall_iidiiii"]).apply(null, arguments);
    });
    var dynCall_vii = (Module["dynCall_vii"] = function () {
      return (dynCall_vii = Module["dynCall_vii"] =
        Module["asm"]["dynCall_vii"]).apply(null, arguments);
    });
    var dynCall_iii = (Module["dynCall_iii"] = function () {
      return (dynCall_iii = Module["dynCall_iii"] =
        Module["asm"]["dynCall_iii"]).apply(null, arguments);
    });
    var dynCall_vi = (Module["dynCall_vi"] = function () {
      return (dynCall_vi = Module["dynCall_vi"] =
        Module["asm"]["dynCall_vi"]).apply(null, arguments);
    });
    var dynCall_iiiii = (Module["dynCall_iiiii"] = function () {
      return (dynCall_iiiii = Module["dynCall_iiiii"] =
        Module["asm"]["dynCall_iiiii"]).apply(null, arguments);
    });
    var dynCall_viii = (Module["dynCall_viii"] = function () {
      return (dynCall_viii = Module["dynCall_viii"] =
        Module["asm"]["dynCall_viii"]).apply(null, arguments);
    });
    var dynCall_v = (Module["dynCall_v"] = function () {
      return (dynCall_v = Module["dynCall_v"] =
        Module["asm"]["dynCall_v"]).apply(null, arguments);
    });
    var dynCall_i = (Module["dynCall_i"] = function () {
      return (dynCall_i = Module["dynCall_i"] =
        Module["asm"]["dynCall_i"]).apply(null, arguments);
    });
    var dynCall_iiiiiiii = (Module["dynCall_iiiiiiii"] = function () {
      return (dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiijiii = (Module["dynCall_iiijiii"] = function () {
      return (dynCall_iiijiii = Module["dynCall_iiijiii"] =
        Module["asm"]["dynCall_iiijiii"]).apply(null, arguments);
    });
    var dynCall_iij = (Module["dynCall_iij"] = function () {
      return (dynCall_iij = Module["dynCall_iij"] =
        Module["asm"]["dynCall_iij"]).apply(null, arguments);
    });
    var dynCall_iiiiii = (Module["dynCall_iiiiii"] = function () {
      return (dynCall_iiiiii = Module["dynCall_iiiiii"] =
        Module["asm"]["dynCall_iiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiii = (Module["dynCall_iiiiiii"] = function () {
      return (dynCall_iiiiiii = Module["dynCall_iiiiiii"] =
        Module["asm"]["dynCall_iiiiiii"]).apply(null, arguments);
    });
    var dynCall_jii = (Module["dynCall_jii"] = function () {
      return (dynCall_jii = Module["dynCall_jii"] =
        Module["asm"]["dynCall_jii"]).apply(null, arguments);
    });
    var dynCall_viiii = (Module["dynCall_viiii"] = function () {
      return (dynCall_viiii = Module["dynCall_viiii"] =
        Module["asm"]["dynCall_viiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiiii = (Module["dynCall_iiiiiiiiiii"] = function () {
      return (dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_jiiii = (Module["dynCall_jiiii"] = function () {
      return (dynCall_jiiii = Module["dynCall_jiiii"] =
        Module["asm"]["dynCall_jiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiii"] = function () {
      return (dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_fiii = (Module["dynCall_fiii"] = function () {
      return (dynCall_fiii = Module["dynCall_fiii"] =
        Module["asm"]["dynCall_fiii"]).apply(null, arguments);
    });
    var dynCall_diii = (Module["dynCall_diii"] = function () {
      return (dynCall_diii = Module["dynCall_diii"] =
        Module["asm"]["dynCall_diii"]).apply(null, arguments);
    });
    var dynCall_viiiiiii = (Module["dynCall_viiiiiii"] = function () {
      return (dynCall_viiiiiii = Module["dynCall_viiiiiii"] =
        Module["asm"]["dynCall_viiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiii"] = function () {
      return (dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiii = (Module["dynCall_viiiiiiiiii"] = function () {
      return (dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] =
        Module["asm"]["dynCall_viiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiiiiii"] =
      function () {
        return (dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] =
          Module["asm"]["dynCall_viiiiiiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_iiiiiiiii = (Module["dynCall_iiiiiiiii"] = function () {
      return (dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiij = (Module["dynCall_iiiiij"] = function () {
      return (dynCall_iiiiij = Module["dynCall_iiiiij"] =
        Module["asm"]["dynCall_iiiiij"]).apply(null, arguments);
    });
    var dynCall_iiiiid = (Module["dynCall_iiiiid"] = function () {
      return (dynCall_iiiiid = Module["dynCall_iiiiid"] =
        Module["asm"]["dynCall_iiiiid"]).apply(null, arguments);
    });
    var dynCall_iiiiijj = (Module["dynCall_iiiiijj"] = function () {
      return (dynCall_iiiiijj = Module["dynCall_iiiiijj"] =
        Module["asm"]["dynCall_iiiiijj"]).apply(null, arguments);
    });
    var dynCall_iiiiiijj = (Module["dynCall_iiiiiijj"] = function () {
      return (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] =
        Module["asm"]["dynCall_iiiiiijj"]).apply(null, arguments);
    });
    var dynCall_viiiiii = (Module["dynCall_viiiiii"] = function () {
      return (dynCall_viiiiii = Module["dynCall_viiiiii"] =
        Module["asm"]["dynCall_viiiiii"]).apply(null, arguments);
    });
    var dynCall_viijii = (Module["dynCall_viijii"] = function () {
      return (dynCall_viijii = Module["dynCall_viijii"] =
        Module["asm"]["dynCall_viijii"]).apply(null, arguments);
    });
    var dynCall_viiiii = (Module["dynCall_viiiii"] = function () {
      return (dynCall_viiiii = Module["dynCall_viiiii"] =
        Module["asm"]["dynCall_viiiii"]).apply(null, arguments);
    });
    var dynCall_vijii = (Module["dynCall_vijii"] = function () {
      return (dynCall_vijii = Module["dynCall_vijii"] =
        Module["asm"]["dynCall_vijii"]).apply(null, arguments);
    });
    var dynCall_iijiii = (Module["dynCall_iijiii"] = function () {
      return (dynCall_iijiii = Module["dynCall_iijiii"] =
        Module["asm"]["dynCall_iijiii"]).apply(null, arguments);
    });
    var dynCall_iji = (Module["dynCall_iji"] = function () {
      return (dynCall_iji = Module["dynCall_iji"] =
        Module["asm"]["dynCall_iji"]).apply(null, arguments);
    });
    var dynCall_viififiiii = (Module["dynCall_viififiiii"] = function () {
      return (dynCall_viififiiii = Module["dynCall_viififiiii"] =
        Module["asm"]["dynCall_viififiiii"]).apply(null, arguments);
    });
    var dynCall_fiiffi = (Module["dynCall_fiiffi"] = function () {
      return (dynCall_fiiffi = Module["dynCall_fiiffi"] =
        Module["asm"]["dynCall_fiiffi"]).apply(null, arguments);
    });
    var dynCall_vififiiii = (Module["dynCall_vififiiii"] = function () {
      return (dynCall_vififiiii = Module["dynCall_vififiiii"] =
        Module["asm"]["dynCall_vififiiii"]).apply(null, arguments);
    });
    var dynCall_fiffi = (Module["dynCall_fiffi"] = function () {
      return (dynCall_fiffi = Module["dynCall_fiffi"] =
        Module["asm"]["dynCall_fiffi"]).apply(null, arguments);
    });
    var dynCall_iiji = (Module["dynCall_iiji"] = function () {
      return (dynCall_iiji = Module["dynCall_iiji"] =
        Module["asm"]["dynCall_iiji"]).apply(null, arguments);
    });
    var dynCall_viiiji = (Module["dynCall_viiiji"] = function () {
      return (dynCall_viiiji = Module["dynCall_viiiji"] =
        Module["asm"]["dynCall_viiiji"]).apply(null, arguments);
    });
    var dynCall_diidi = (Module["dynCall_diidi"] = function () {
      return (dynCall_diidi = Module["dynCall_diidi"] =
        Module["asm"]["dynCall_diidi"]).apply(null, arguments);
    });
    var dynCall_fiiii = (Module["dynCall_fiiii"] = function () {
      return (dynCall_fiiii = Module["dynCall_fiiii"] =
        Module["asm"]["dynCall_fiiii"]).apply(null, arguments);
    });
    var dynCall_jiiji = (Module["dynCall_jiiji"] = function () {
      return (dynCall_jiiji = Module["dynCall_jiiji"] =
        Module["asm"]["dynCall_jiiji"]).apply(null, arguments);
    });
    var dynCall_fiifi = (Module["dynCall_fiifi"] = function () {
      return (dynCall_fiifi = Module["dynCall_fiifi"] =
        Module["asm"]["dynCall_fiifi"]).apply(null, arguments);
    });
    var dynCall_iiffi = (Module["dynCall_iiffi"] = function () {
      return (dynCall_iiffi = Module["dynCall_iiffi"] =
        Module["asm"]["dynCall_iiffi"]).apply(null, arguments);
    });
    var dynCall_iiidii = (Module["dynCall_iiidii"] = function () {
      return (dynCall_iiidii = Module["dynCall_iiidii"] =
        Module["asm"]["dynCall_iiidii"]).apply(null, arguments);
    });
    var dynCall_iiiifi = (Module["dynCall_iiiifi"] = function () {
      return (dynCall_iiiifi = Module["dynCall_iiiifi"] =
        Module["asm"]["dynCall_iiiifi"]).apply(null, arguments);
    });
    var dynCall_vifi = (Module["dynCall_vifi"] = function () {
      return (dynCall_vifi = Module["dynCall_vifi"] =
        Module["asm"]["dynCall_vifi"]).apply(null, arguments);
    });
    var dynCall_vifii = (Module["dynCall_vifii"] = function () {
      return (dynCall_vifii = Module["dynCall_vifii"] =
        Module["asm"]["dynCall_vifii"]).apply(null, arguments);
    });
    var dynCall_viifi = (Module["dynCall_viifi"] = function () {
      return (dynCall_viifi = Module["dynCall_viifi"] =
        Module["asm"]["dynCall_viifi"]).apply(null, arguments);
    });
    var dynCall_viidiji = (Module["dynCall_viidiji"] = function () {
      return (dynCall_viidiji = Module["dynCall_viidiji"] =
        Module["asm"]["dynCall_viidiji"]).apply(null, arguments);
    });
    var dynCall_viidjii = (Module["dynCall_viidjii"] = function () {
      return (dynCall_viidjii = Module["dynCall_viidjii"] =
        Module["asm"]["dynCall_viidjii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiii = (Module["dynCall_viiiiiiii"] = function () {
      return (dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] =
        Module["asm"]["dynCall_viiiiiiii"]).apply(null, arguments);
    });
    var dynCall_fii = (Module["dynCall_fii"] = function () {
      return (dynCall_fii = Module["dynCall_fii"] =
        Module["asm"]["dynCall_fii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiii = (Module["dynCall_iiiiiiiiii"] = function () {
      return (dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] =
        Module["asm"]["dynCall_iiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_vidi = (Module["dynCall_vidi"] = function () {
      return (dynCall_vidi = Module["dynCall_vidi"] =
        Module["asm"]["dynCall_vidi"]).apply(null, arguments);
    });
    var dynCall_fffi = (Module["dynCall_fffi"] = function () {
      return (dynCall_fffi = Module["dynCall_fffi"] =
        Module["asm"]["dynCall_fffi"]).apply(null, arguments);
    });
    var dynCall_viifii = (Module["dynCall_viifii"] = function () {
      return (dynCall_viifii = Module["dynCall_viifii"] =
        Module["asm"]["dynCall_viifii"]).apply(null, arguments);
    });
    var dynCall_iiiidii = (Module["dynCall_iiiidii"] = function () {
      return (dynCall_iiiidii = Module["dynCall_iiiidii"] =
        Module["asm"]["dynCall_iiiidii"]).apply(null, arguments);
    });
    var dynCall_viidi = (Module["dynCall_viidi"] = function () {
      return (dynCall_viidi = Module["dynCall_viidi"] =
        Module["asm"]["dynCall_viidi"]).apply(null, arguments);
    });
    var dynCall_viiiidi = (Module["dynCall_viiiidi"] = function () {
      return (dynCall_viiiidi = Module["dynCall_viiiidi"] =
        Module["asm"]["dynCall_viiiidi"]).apply(null, arguments);
    });
    var dynCall_viiji = (Module["dynCall_viiji"] = function () {
      return (dynCall_viiji = Module["dynCall_viiji"] =
        Module["asm"]["dynCall_viiji"]).apply(null, arguments);
    });
    var dynCall_iiiiiiidii = (Module["dynCall_iiiiiiidii"] = function () {
      return (dynCall_iiiiiiidii = Module["dynCall_iiiiiiidii"] =
        Module["asm"]["dynCall_iiiiiiidii"]).apply(null, arguments);
    });
    var dynCall_dii = (Module["dynCall_dii"] = function () {
      return (dynCall_dii = Module["dynCall_dii"] =
        Module["asm"]["dynCall_dii"]).apply(null, arguments);
    });
    var dynCall_ji = (Module["dynCall_ji"] = function () {
      return (dynCall_ji = Module["dynCall_ji"] =
        Module["asm"]["dynCall_ji"]).apply(null, arguments);
    });
    var dynCall_di = (Module["dynCall_di"] = function () {
      return (dynCall_di = Module["dynCall_di"] =
        Module["asm"]["dynCall_di"]).apply(null, arguments);
    });
    var dynCall_iiifii = (Module["dynCall_iiifii"] = function () {
      return (dynCall_iiifii = Module["dynCall_iiifii"] =
        Module["asm"]["dynCall_iiifii"]).apply(null, arguments);
    });
    var dynCall_iifi = (Module["dynCall_iifi"] = function () {
      return (dynCall_iifi = Module["dynCall_iifi"] =
        Module["asm"]["dynCall_iifi"]).apply(null, arguments);
    });
    var dynCall_viiiifi = (Module["dynCall_viiiifi"] = function () {
      return (dynCall_viiiifi = Module["dynCall_viiiifi"] =
        Module["asm"]["dynCall_viiiifi"]).apply(null, arguments);
    });
    var dynCall_iiijii = (Module["dynCall_iiijii"] = function () {
      return (dynCall_iiijii = Module["dynCall_iiijii"] =
        Module["asm"]["dynCall_iiijii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiiji = (Module["dynCall_iiiiiiiiiji"] = function () {
      return (dynCall_iiiiiiiiiji = Module["dynCall_iiiiiiiiiji"] =
        Module["asm"]["dynCall_iiiiiiiiiji"]).apply(null, arguments);
    });
    var dynCall_vji = (Module["dynCall_vji"] = function () {
      return (dynCall_vji = Module["dynCall_vji"] =
        Module["asm"]["dynCall_vji"]).apply(null, arguments);
    });
    var dynCall_iiiijii = (Module["dynCall_iiiijii"] = function () {
      return (dynCall_iiiijii = Module["dynCall_iiiijii"] =
        Module["asm"]["dynCall_iiiijii"]).apply(null, arguments);
    });
    var dynCall_viiififiii = (Module["dynCall_viiififiii"] = function () {
      return (dynCall_viiififiii = Module["dynCall_viiififiii"] =
        Module["asm"]["dynCall_viiififiii"]).apply(null, arguments);
    });
    var dynCall_jiii = (Module["dynCall_jiii"] = function () {
      return (dynCall_jiii = Module["dynCall_jiii"] =
        Module["asm"]["dynCall_jiii"]).apply(null, arguments);
    });
    var dynCall_ddiii = (Module["dynCall_ddiii"] = function () {
      return (dynCall_ddiii = Module["dynCall_ddiii"] =
        Module["asm"]["dynCall_ddiii"]).apply(null, arguments);
    });
    var dynCall_iiiifii = (Module["dynCall_iiiifii"] = function () {
      return (dynCall_iiiifii = Module["dynCall_iiiifii"] =
        Module["asm"]["dynCall_iiiifii"]).apply(null, arguments);
    });
    var dynCall_viiiifii = (Module["dynCall_viiiifii"] = function () {
      return (dynCall_viiiifii = Module["dynCall_viiiifii"] =
        Module["asm"]["dynCall_viiiifii"]).apply(null, arguments);
    });
    var dynCall_viiffi = (Module["dynCall_viiffi"] = function () {
      return (dynCall_viiffi = Module["dynCall_viiffi"] =
        Module["asm"]["dynCall_viiffi"]).apply(null, arguments);
    });
    var dynCall_iiddi = (Module["dynCall_iiddi"] = function () {
      return (dynCall_iiddi = Module["dynCall_iiddi"] =
        Module["asm"]["dynCall_iiddi"]).apply(null, arguments);
    });
    var dynCall_iijji = (Module["dynCall_iijji"] = function () {
      return (dynCall_iijji = Module["dynCall_iijji"] =
        Module["asm"]["dynCall_iijji"]).apply(null, arguments);
    });
    var dynCall_jijii = (Module["dynCall_jijii"] = function () {
      return (dynCall_jijii = Module["dynCall_jijii"] =
        Module["asm"]["dynCall_jijii"]).apply(null, arguments);
    });
    var dynCall_viiiiiifii = (Module["dynCall_viiiiiifii"] = function () {
      return (dynCall_viiiiiifii = Module["dynCall_viiiiiifii"] =
        Module["asm"]["dynCall_viiiiiifii"]).apply(null, arguments);
    });
    var dynCall_iiifi = (Module["dynCall_iiifi"] = function () {
      return (dynCall_iiifi = Module["dynCall_iiifi"] =
        Module["asm"]["dynCall_iiifi"]).apply(null, arguments);
    });
    var dynCall_iidi = (Module["dynCall_iidi"] = function () {
      return (dynCall_iidi = Module["dynCall_iidi"] =
        Module["asm"]["dynCall_iidi"]).apply(null, arguments);
    });
    var dynCall_didi = (Module["dynCall_didi"] = function () {
      return (dynCall_didi = Module["dynCall_didi"] =
        Module["asm"]["dynCall_didi"]).apply(null, arguments);
    });
    var dynCall_fifi = (Module["dynCall_fifi"] = function () {
      return (dynCall_fifi = Module["dynCall_fifi"] =
        Module["asm"]["dynCall_fifi"]).apply(null, arguments);
    });
    var dynCall_jjji = (Module["dynCall_jjji"] = function () {
      return (dynCall_jjji = Module["dynCall_jjji"] =
        Module["asm"]["dynCall_jjji"]).apply(null, arguments);
    });
    var dynCall_jiiiii = (Module["dynCall_jiiiii"] = function () {
      return (dynCall_jiiiii = Module["dynCall_jiiiii"] =
        Module["asm"]["dynCall_jiiiii"]).apply(null, arguments);
    });
    var dynCall_j = (Module["dynCall_j"] = function () {
      return (dynCall_j = Module["dynCall_j"] =
        Module["asm"]["dynCall_j"]).apply(null, arguments);
    });
    var dynCall_iijii = (Module["dynCall_iijii"] = function () {
      return (dynCall_iijii = Module["dynCall_iijii"] =
        Module["asm"]["dynCall_iijii"]).apply(null, arguments);
    });
    var dynCall_ijji = (Module["dynCall_ijji"] = function () {
      return (dynCall_ijji = Module["dynCall_ijji"] =
        Module["asm"]["dynCall_ijji"]).apply(null, arguments);
    });
    var dynCall_vijiii = (Module["dynCall_vijiii"] = function () {
      return (dynCall_vijiii = Module["dynCall_vijiii"] =
        Module["asm"]["dynCall_vijiii"]).apply(null, arguments);
    });
    var dynCall_vjjjiiii = (Module["dynCall_vjjjiiii"] = function () {
      return (dynCall_vjjjiiii = Module["dynCall_vjjjiiii"] =
        Module["asm"]["dynCall_vjjjiiii"]).apply(null, arguments);
    });
    var dynCall_vjiiiii = (Module["dynCall_vjiiiii"] = function () {
      return (dynCall_vjiiiii = Module["dynCall_vjiiiii"] =
        Module["asm"]["dynCall_vjiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiji = (Module["dynCall_iiiji"] = function () {
      return (dynCall_iiiji = Module["dynCall_iiiji"] =
        Module["asm"]["dynCall_iiiji"]).apply(null, arguments);
    });
    var dynCall_viji = (Module["dynCall_viji"] = function () {
      return (dynCall_viji = Module["dynCall_viji"] =
        Module["asm"]["dynCall_viji"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiiiii"] =
      function () {
        return (dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] =
          Module["asm"]["dynCall_viiiiiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_viiiiiiiiiii = (Module["dynCall_viiiiiiiiiii"] = function () {
      return (dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] =
        Module["asm"]["dynCall_viiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiii = (Module["dynCall_viiiiiiiii"] = function () {
      return (dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] =
        Module["asm"]["dynCall_viiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiji = (Module["dynCall_iiiiji"] = function () {
      return (dynCall_iiiiji = Module["dynCall_iiiiji"] =
        Module["asm"]["dynCall_iiiiji"]).apply(null, arguments);
    });
    var dynCall_viiijii = (Module["dynCall_viiijii"] = function () {
      return (dynCall_viiijii = Module["dynCall_viiijii"] =
        Module["asm"]["dynCall_viiijii"]).apply(null, arguments);
    });
    var dynCall_jji = (Module["dynCall_jji"] = function () {
      return (dynCall_jji = Module["dynCall_jji"] =
        Module["asm"]["dynCall_jji"]).apply(null, arguments);
    });
    var dynCall_fji = (Module["dynCall_fji"] = function () {
      return (dynCall_fji = Module["dynCall_fji"] =
        Module["asm"]["dynCall_fji"]).apply(null, arguments);
    });
    var dynCall_dji = (Module["dynCall_dji"] = function () {
      return (dynCall_dji = Module["dynCall_dji"] =
        Module["asm"]["dynCall_dji"]).apply(null, arguments);
    });
    var dynCall_ijjiii = (Module["dynCall_ijjiii"] = function () {
      return (dynCall_ijjiii = Module["dynCall_ijjiii"] =
        Module["asm"]["dynCall_ijjiii"]).apply(null, arguments);
    });
    var dynCall_ijiiii = (Module["dynCall_ijiiii"] = function () {
      return (dynCall_ijiiii = Module["dynCall_ijiiii"] =
        Module["asm"]["dynCall_ijiiii"]).apply(null, arguments);
    });
    var dynCall_ijiii = (Module["dynCall_ijiii"] = function () {
      return (dynCall_ijiii = Module["dynCall_ijiii"] =
        Module["asm"]["dynCall_ijiii"]).apply(null, arguments);
    });
    var dynCall_iiiifiiiiii = (Module["dynCall_iiiifiiiiii"] = function () {
      return (dynCall_iiiifiiiiii = Module["dynCall_iiiifiiiiii"] =
        Module["asm"]["dynCall_iiiifiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiifiiiii = (Module["dynCall_iiiifiiiii"] = function () {
      return (dynCall_iiiifiiiii = Module["dynCall_iiiifiiiii"] =
        Module["asm"]["dynCall_iiiifiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiifiiii = (Module["dynCall_iiiifiiii"] = function () {
      return (dynCall_iiiifiiii = Module["dynCall_iiiifiiii"] =
        Module["asm"]["dynCall_iiiifiiii"]).apply(null, arguments);
    });
    var dynCall_iiiifiii = (Module["dynCall_iiiifiii"] = function () {
      return (dynCall_iiiifiii = Module["dynCall_iiiifiii"] =
        Module["asm"]["dynCall_iiiifiii"]).apply(null, arguments);
    });
    var dynCall_viffffi = (Module["dynCall_viffffi"] = function () {
      return (dynCall_viffffi = Module["dynCall_viffffi"] =
        Module["asm"]["dynCall_viffffi"]).apply(null, arguments);
    });
    var dynCall_diiiii = (Module["dynCall_diiiii"] = function () {
      return (dynCall_diiiii = Module["dynCall_diiiii"] =
        Module["asm"]["dynCall_diiiii"]).apply(null, arguments);
    });
    var dynCall_vijji = (Module["dynCall_vijji"] = function () {
      return (dynCall_vijji = Module["dynCall_vijji"] =
        Module["asm"]["dynCall_vijji"]).apply(null, arguments);
    });
    var dynCall_fi = (Module["dynCall_fi"] = function () {
      return (dynCall_fi = Module["dynCall_fi"] =
        Module["asm"]["dynCall_fi"]).apply(null, arguments);
    });
    var dynCall_vfffi = (Module["dynCall_vfffi"] = function () {
      return (dynCall_vfffi = Module["dynCall_vfffi"] =
        Module["asm"]["dynCall_vfffi"]).apply(null, arguments);
    });
    var dynCall_vffi = (Module["dynCall_vffi"] = function () {
      return (dynCall_vffi = Module["dynCall_vffi"] =
        Module["asm"]["dynCall_vffi"]).apply(null, arguments);
    });
    var dynCall_vffffi = (Module["dynCall_vffffi"] = function () {
      return (dynCall_vffffi = Module["dynCall_vffffi"] =
        Module["asm"]["dynCall_vffffi"]).apply(null, arguments);
    });
    var dynCall_viiifi = (Module["dynCall_viiifi"] = function () {
      return (dynCall_viiifi = Module["dynCall_viiifi"] =
        Module["asm"]["dynCall_viiifi"]).apply(null, arguments);
    });
    var dynCall_viiiiffi = (Module["dynCall_viiiiffi"] = function () {
      return (dynCall_viiiiffi = Module["dynCall_viiiiffi"] =
        Module["asm"]["dynCall_viiiiffi"]).apply(null, arguments);
    });
    var dynCall_viiiffii = (Module["dynCall_viiiffii"] = function () {
      return (dynCall_viiiffii = Module["dynCall_viiiffii"] =
        Module["asm"]["dynCall_viiiffii"]).apply(null, arguments);
    });
    var dynCall_vifffi = (Module["dynCall_vifffi"] = function () {
      return (dynCall_vifffi = Module["dynCall_vifffi"] =
        Module["asm"]["dynCall_vifffi"]).apply(null, arguments);
    });
    var dynCall_viffffffi = (Module["dynCall_viffffffi"] = function () {
      return (dynCall_viffffffi = Module["dynCall_viffffffi"] =
        Module["asm"]["dynCall_viffffffi"]).apply(null, arguments);
    });
    var dynCall_vffffffii = (Module["dynCall_vffffffii"] = function () {
      return (dynCall_vffffffii = Module["dynCall_vffffffii"] =
        Module["asm"]["dynCall_vffffffii"]).apply(null, arguments);
    });
    var dynCall_viffi = (Module["dynCall_viffi"] = function () {
      return (dynCall_viffi = Module["dynCall_viffi"] =
        Module["asm"]["dynCall_viffi"]).apply(null, arguments);
    });
    var dynCall_ifi = (Module["dynCall_ifi"] = function () {
      return (dynCall_ifi = Module["dynCall_ifi"] =
        Module["asm"]["dynCall_ifi"]).apply(null, arguments);
    });
    var dynCall_vfiii = (Module["dynCall_vfiii"] = function () {
      return (dynCall_vfiii = Module["dynCall_vfiii"] =
        Module["asm"]["dynCall_vfiii"]).apply(null, arguments);
    });
    var dynCall_ffi = (Module["dynCall_ffi"] = function () {
      return (dynCall_ffi = Module["dynCall_ffi"] =
        Module["asm"]["dynCall_ffi"]).apply(null, arguments);
    });
    var dynCall_ffffi = (Module["dynCall_ffffi"] = function () {
      return (dynCall_ffffi = Module["dynCall_ffffi"] =
        Module["asm"]["dynCall_ffffi"]).apply(null, arguments);
    });
    var dynCall_iffi = (Module["dynCall_iffi"] = function () {
      return (dynCall_iffi = Module["dynCall_iffi"] =
        Module["asm"]["dynCall_iffi"]).apply(null, arguments);
    });
    var dynCall_fffifffi = (Module["dynCall_fffifffi"] = function () {
      return (dynCall_fffifffi = Module["dynCall_fffifffi"] =
        Module["asm"]["dynCall_fffifffi"]).apply(null, arguments);
    });
    var dynCall_fdi = (Module["dynCall_fdi"] = function () {
      return (dynCall_fdi = Module["dynCall_fdi"] =
        Module["asm"]["dynCall_fdi"]).apply(null, arguments);
    });
    var dynCall_idi = (Module["dynCall_idi"] = function () {
      return (dynCall_idi = Module["dynCall_idi"] =
        Module["asm"]["dynCall_idi"]).apply(null, arguments);
    });
    var dynCall_dddi = (Module["dynCall_dddi"] = function () {
      return (dynCall_dddi = Module["dynCall_dddi"] =
        Module["asm"]["dynCall_dddi"]).apply(null, arguments);
    });
    var dynCall_ddi = (Module["dynCall_ddi"] = function () {
      return (dynCall_ddi = Module["dynCall_ddi"] =
        Module["asm"]["dynCall_ddi"]).apply(null, arguments);
    });
    var dynCall_vfii = (Module["dynCall_vfii"] = function () {
      return (dynCall_vfii = Module["dynCall_vfii"] =
        Module["asm"]["dynCall_vfii"]).apply(null, arguments);
    });
    var dynCall_ddddi = (Module["dynCall_ddddi"] = function () {
      return (dynCall_ddddi = Module["dynCall_ddddi"] =
        Module["asm"]["dynCall_ddddi"]).apply(null, arguments);
    });
    var dynCall_jjjji = (Module["dynCall_jjjji"] = function () {
      return (dynCall_jjjji = Module["dynCall_jjjji"] =
        Module["asm"]["dynCall_jjjji"]).apply(null, arguments);
    });
    var dynCall_vjiiii = (Module["dynCall_vjiiii"] = function () {
      return (dynCall_vjiiii = Module["dynCall_vjiiii"] =
        Module["asm"]["dynCall_vjiiii"]).apply(null, arguments);
    });
    var dynCall_vijjii = (Module["dynCall_vijjii"] = function () {
      return (dynCall_vijjii = Module["dynCall_vijjii"] =
        Module["asm"]["dynCall_vijjii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiiii"] =
      function () {
        return (dynCall_viiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiii"] =
          Module["asm"]["dynCall_viiiiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_viiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiii"] = function () {
      return (dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] =
        Module["asm"]["dynCall_viiiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiifii = (Module["dynCall_viiifii"] = function () {
      return (dynCall_viiifii = Module["dynCall_viiifii"] =
        Module["asm"]["dynCall_viiifii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiijijiiiii = (Module["dynCall_viiiiiiiijijiiiii"] =
      function () {
        return (dynCall_viiiiiiiijijiiiii = Module[
          "dynCall_viiiiiiiijijiiiii"
        ] =
          Module["asm"]["dynCall_viiiiiiiijijiiiii"]).apply(null, arguments);
      });
    var dynCall_viiiififfi = (Module["dynCall_viiiififfi"] = function () {
      return (dynCall_viiiififfi = Module["dynCall_viiiififfi"] =
        Module["asm"]["dynCall_viiiififfi"]).apply(null, arguments);
    });
    var dynCall_viiiifiifi = (Module["dynCall_viiiifiifi"] = function () {
      return (dynCall_viiiifiifi = Module["dynCall_viiiifiifi"] =
        Module["asm"]["dynCall_viiiifiifi"]).apply(null, arguments);
    });
    var dynCall_viiiifiiii = (Module["dynCall_viiiifiiii"] = function () {
      return (dynCall_viiiifiiii = Module["dynCall_viiiifiiii"] =
        Module["asm"]["dynCall_viiiifiiii"]).apply(null, arguments);
    });
    var dynCall_viiiifiiiii = (Module["dynCall_viiiifiiiii"] = function () {
      return (dynCall_viiiifiiiii = Module["dynCall_viiiifiiiii"] =
        Module["asm"]["dynCall_viiiifiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiifiiiiiiii = (Module["dynCall_viiiifiiiiiiii"] =
      function () {
        return (dynCall_viiiifiiiiiiii = Module["dynCall_viiiifiiiiiiii"] =
          Module["asm"]["dynCall_viiiifiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_iiifiii = (Module["dynCall_iiifiii"] = function () {
      return (dynCall_iiifiii = Module["dynCall_iiifiii"] =
        Module["asm"]["dynCall_iiifiii"]).apply(null, arguments);
    });
    var dynCall_viiiiiffii = (Module["dynCall_viiiiiffii"] = function () {
      return (dynCall_viiiiiffii = Module["dynCall_viiiiiffii"] =
        Module["asm"]["dynCall_viiiiiffii"]).apply(null, arguments);
    });
    var dynCall_vfi = (Module["dynCall_vfi"] = function () {
      return (dynCall_vfi = Module["dynCall_vfi"] =
        Module["asm"]["dynCall_vfi"]).apply(null, arguments);
    });
    var dynCall_viffffii = (Module["dynCall_viffffii"] = function () {
      return (dynCall_viffffii = Module["dynCall_viffffii"] =
        Module["asm"]["dynCall_viffffii"]).apply(null, arguments);
    });
    var dynCall_vijiiii = (Module["dynCall_vijiiii"] = function () {
      return (dynCall_vijiiii = Module["dynCall_vijiiii"] =
        Module["asm"]["dynCall_vijiiii"]).apply(null, arguments);
    });
    var dynCall_viiifiii = (Module["dynCall_viiifiii"] = function () {
      return (dynCall_viiifiii = Module["dynCall_viiifiii"] =
        Module["asm"]["dynCall_viiifiii"]).apply(null, arguments);
    });
    var dynCall_viiififi = (Module["dynCall_viiififi"] = function () {
      return (dynCall_viiififi = Module["dynCall_viiififi"] =
        Module["asm"]["dynCall_viiififi"]).apply(null, arguments);
    });
    var dynCall_viiififfi = (Module["dynCall_viiififfi"] = function () {
      return (dynCall_viiififfi = Module["dynCall_viiififfi"] =
        Module["asm"]["dynCall_viiififfi"]).apply(null, arguments);
    });
    var dynCall_iiiiifi = (Module["dynCall_iiiiifi"] = function () {
      return (dynCall_iiiiifi = Module["dynCall_iiiiifi"] =
        Module["asm"]["dynCall_iiiiifi"]).apply(null, arguments);
    });
    var dynCall_iifii = (Module["dynCall_iifii"] = function () {
      return (dynCall_iifii = Module["dynCall_iifii"] =
        Module["asm"]["dynCall_iifii"]).apply(null, arguments);
    });
    var dynCall_iifiii = (Module["dynCall_iifiii"] = function () {
      return (dynCall_iifiii = Module["dynCall_iifiii"] =
        Module["asm"]["dynCall_iifiii"]).apply(null, arguments);
    });
    var dynCall_viifiiii = (Module["dynCall_viifiiii"] = function () {
      return (dynCall_viifiiii = Module["dynCall_viifiiii"] =
        Module["asm"]["dynCall_viifiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiifiii = (Module["dynCall_iiiiifiii"] = function () {
      return (dynCall_iiiiifiii = Module["dynCall_iiiiifiii"] =
        Module["asm"]["dynCall_iiiiifiii"]).apply(null, arguments);
    });
    var dynCall_iiifiiii = (Module["dynCall_iiifiiii"] = function () {
      return (dynCall_iiifiiii = Module["dynCall_iiifiiii"] =
        Module["asm"]["dynCall_iiifiiii"]).apply(null, arguments);
    });
    var dynCall_vifffffi = (Module["dynCall_vifffffi"] = function () {
      return (dynCall_vifffffi = Module["dynCall_vifffffi"] =
        Module["asm"]["dynCall_vifffffi"]).apply(null, arguments);
    });
    var dynCall_viiiiifi = (Module["dynCall_viiiiifi"] = function () {
      return (dynCall_viiiiifi = Module["dynCall_viiiiifi"] =
        Module["asm"]["dynCall_viiiiifi"]).apply(null, arguments);
    });
    var dynCall_iiifiiiiiii = (Module["dynCall_iiifiiiiiii"] = function () {
      return (dynCall_iiifiiiiiii = Module["dynCall_iiifiiiiiii"] =
        Module["asm"]["dynCall_iiifiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iifiiiiiii = (Module["dynCall_iifiiiiiii"] = function () {
      return (dynCall_iifiiiiiii = Module["dynCall_iifiiiiiii"] =
        Module["asm"]["dynCall_iifiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiifiiiiiiii = (Module["dynCall_iiifiiiiiiii"] = function () {
      return (dynCall_iiifiiiiiiii = Module["dynCall_iiifiiiiiiii"] =
        Module["asm"]["dynCall_iiifiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viffiiii = (Module["dynCall_viffiiii"] = function () {
      return (dynCall_viffiiii = Module["dynCall_viffiiii"] =
        Module["asm"]["dynCall_viffiiii"]).apply(null, arguments);
    });
    var dynCall_viiiffffiiii = (Module["dynCall_viiiffffiiii"] = function () {
      return (dynCall_viiiffffiiii = Module["dynCall_viiiffffiiii"] =
        Module["asm"]["dynCall_viiiffffiiii"]).apply(null, arguments);
    });
    var dynCall_viifffffffiiiii = (Module["dynCall_viifffffffiiiii"] =
      function () {
        return (dynCall_viifffffffiiiii = Module["dynCall_viifffffffiiiii"] =
          Module["asm"]["dynCall_viifffffffiiiii"]).apply(null, arguments);
      });
    var dynCall_fiiiii = (Module["dynCall_fiiiii"] = function () {
      return (dynCall_fiiiii = Module["dynCall_fiiiii"] =
        Module["asm"]["dynCall_fiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiifiii = (Module["dynCall_viiiifiii"] = function () {
      return (dynCall_viiiifiii = Module["dynCall_viiiifiii"] =
        Module["asm"]["dynCall_viiiifiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiffiiiiiiiiiffffiiii = (Module[
      "dynCall_iiiiiiffiiiiiiiiiffffiiii"
    ] = function () {
      return (dynCall_iiiiiiffiiiiiiiiiffffiiii = Module[
        "dynCall_iiiiiiffiiiiiiiiiffffiiii"
      ] =
        Module["asm"]["dynCall_iiiiiiffiiiiiiiiiffffiiii"]).apply(
        null,
        arguments
      );
    });
    var dynCall_iiiiiiffiiiiiiiiiiiiiii = (Module[
      "dynCall_iiiiiiffiiiiiiiiiiiiiii"
    ] = function () {
      return (dynCall_iiiiiiffiiiiiiiiiiiiiii = Module[
        "dynCall_iiiiiiffiiiiiiiiiiiiiii"
      ] =
        Module["asm"]["dynCall_iiiiiiffiiiiiiiiiiiiiii"]).apply(
        null,
        arguments
      );
    });
    var dynCall_viijji = (Module["dynCall_viijji"] = function () {
      return (dynCall_viijji = Module["dynCall_viijji"] =
        Module["asm"]["dynCall_viijji"]).apply(null, arguments);
    });
    var dynCall_viififii = (Module["dynCall_viififii"] = function () {
      return (dynCall_viififii = Module["dynCall_viififii"] =
        Module["asm"]["dynCall_viififii"]).apply(null, arguments);
    });
    var dynCall_viiidi = (Module["dynCall_viiidi"] = function () {
      return (dynCall_viiidi = Module["dynCall_viiidi"] =
        Module["asm"]["dynCall_viiidi"]).apply(null, arguments);
    });
    var dynCall_jijji = (Module["dynCall_jijji"] = function () {
      return (dynCall_jijji = Module["dynCall_jijji"] =
        Module["asm"]["dynCall_jijji"]).apply(null, arguments);
    });
    var dynCall_viiffffi = (Module["dynCall_viiffffi"] = function () {
      return (dynCall_viiffffi = Module["dynCall_viiffffi"] =
        Module["asm"]["dynCall_viiffffi"]).apply(null, arguments);
    });
    var dynCall_fifffi = (Module["dynCall_fifffi"] = function () {
      return (dynCall_fifffi = Module["dynCall_fifffi"] =
        Module["asm"]["dynCall_fifffi"]).apply(null, arguments);
    });
    var dynCall_ifffi = (Module["dynCall_ifffi"] = function () {
      return (dynCall_ifffi = Module["dynCall_ifffi"] =
        Module["asm"]["dynCall_ifffi"]).apply(null, arguments);
    });
    var dynCall_fiifii = (Module["dynCall_fiifii"] = function () {
      return (dynCall_fiifii = Module["dynCall_fiifii"] =
        Module["asm"]["dynCall_fiifii"]).apply(null, arguments);
    });
    var dynCall_fiifiii = (Module["dynCall_fiifiii"] = function () {
      return (dynCall_fiifiii = Module["dynCall_fiifiii"] =
        Module["asm"]["dynCall_fiifiii"]).apply(null, arguments);
    });
    var dynCall_fiffffi = (Module["dynCall_fiffffi"] = function () {
      return (dynCall_fiffffi = Module["dynCall_fiffffi"] =
        Module["asm"]["dynCall_fiffffi"]).apply(null, arguments);
    });
    var dynCall_fffffffi = (Module["dynCall_fffffffi"] = function () {
      return (dynCall_fffffffi = Module["dynCall_fffffffi"] =
        Module["asm"]["dynCall_fffffffi"]).apply(null, arguments);
    });
    var dynCall_viffiii = (Module["dynCall_viffiii"] = function () {
      return (dynCall_viffiii = Module["dynCall_viffiii"] =
        Module["asm"]["dynCall_viffiii"]).apply(null, arguments);
    });
    var dynCall_viffifi = (Module["dynCall_viffifi"] = function () {
      return (dynCall_viffifi = Module["dynCall_viffifi"] =
        Module["asm"]["dynCall_viffifi"]).apply(null, arguments);
    });
    var dynCall_viiffifi = (Module["dynCall_viiffifi"] = function () {
      return (dynCall_viiffifi = Module["dynCall_viiffifi"] =
        Module["asm"]["dynCall_viiffifi"]).apply(null, arguments);
    });
    var dynCall_viiiffiiiiii = (Module["dynCall_viiiffiiiiii"] = function () {
      return (dynCall_viiiffiiiiii = Module["dynCall_viiiffiiiiii"] =
        Module["asm"]["dynCall_viiiffiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiffiiiii = (Module["dynCall_viiiffiiiii"] = function () {
      return (dynCall_viiiffiiiii = Module["dynCall_viiiffiiiii"] =
        Module["asm"]["dynCall_viiiffiiiii"]).apply(null, arguments);
    });
    var dynCall_viiffiiiiiii = (Module["dynCall_viiffiiiiiii"] = function () {
      return (dynCall_viiffiiiiiii = Module["dynCall_viiffiiiiiii"] =
        Module["asm"]["dynCall_viiffiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiffiiiiii = (Module["dynCall_viiffiiiiii"] = function () {
      return (dynCall_viiffiiiiii = Module["dynCall_viiffiiiiii"] =
        Module["asm"]["dynCall_viiffiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiffiiii = (Module["dynCall_iiiffiiii"] = function () {
      return (dynCall_iiiffiiii = Module["dynCall_iiiffiiii"] =
        Module["asm"]["dynCall_iiiffiiii"]).apply(null, arguments);
    });
    var dynCall_viififiii = (Module["dynCall_viififiii"] = function () {
      return (dynCall_viififiii = Module["dynCall_viififiii"] =
        Module["asm"]["dynCall_viififiii"]).apply(null, arguments);
    });
    var dynCall_fffffi = (Module["dynCall_fffffi"] = function () {
      return (dynCall_fffffi = Module["dynCall_fffffi"] =
        Module["asm"]["dynCall_fffffi"]).apply(null, arguments);
    });
    var dynCall_iiiiffiiii = (Module["dynCall_iiiiffiiii"] = function () {
      return (dynCall_iiiiffiiii = Module["dynCall_iiiiffiiii"] =
        Module["asm"]["dynCall_iiiiffiiii"]).apply(null, arguments);
    });
    var dynCall_viiiffi = (Module["dynCall_viiiffi"] = function () {
      return (dynCall_viiiffi = Module["dynCall_viiiffi"] =
        Module["asm"]["dynCall_viiiffi"]).apply(null, arguments);
    });
    var dynCall_viiififii = (Module["dynCall_viiififii"] = function () {
      return (dynCall_viiififii = Module["dynCall_viiififii"] =
        Module["asm"]["dynCall_viiififii"]).apply(null, arguments);
    });
    var dynCall_diiii = (Module["dynCall_diiii"] = function () {
      return (dynCall_diiii = Module["dynCall_diiii"] =
        Module["asm"]["dynCall_diiii"]).apply(null, arguments);
    });
    var dynCall_ijii = (Module["dynCall_ijii"] = function () {
      return (dynCall_ijii = Module["dynCall_ijii"] =
        Module["asm"]["dynCall_ijii"]).apply(null, arguments);
    });
    var dynCall_vjii = (Module["dynCall_vjii"] = function () {
      return (dynCall_vjii = Module["dynCall_vjii"] =
        Module["asm"]["dynCall_vjii"]).apply(null, arguments);
    });
    var dynCall_viiiiiffi = (Module["dynCall_viiiiiffi"] = function () {
      return (dynCall_viiiiiffi = Module["dynCall_viiiiiffi"] =
        Module["asm"]["dynCall_viiiiiffi"]).apply(null, arguments);
    });
    var dynCall_viffffiii = (Module["dynCall_viffffiii"] = function () {
      return (dynCall_viffffiii = Module["dynCall_viffffiii"] =
        Module["asm"]["dynCall_viffffiii"]).apply(null, arguments);
    });
    var dynCall_vifiiiiii = (Module["dynCall_vifiiiiii"] = function () {
      return (dynCall_vifiiiiii = Module["dynCall_vifiiiiii"] =
        Module["asm"]["dynCall_vifiiiiii"]).apply(null, arguments);
    });
    var dynCall_viiffiiii = (Module["dynCall_viiffiiii"] = function () {
      return (dynCall_viiffiiii = Module["dynCall_viiffiiii"] =
        Module["asm"]["dynCall_viiffiiii"]).apply(null, arguments);
    });
    var dynCall_viffii = (Module["dynCall_viffii"] = function () {
      return (dynCall_viffii = Module["dynCall_viffii"] =
        Module["asm"]["dynCall_viffii"]).apply(null, arguments);
    });
    var dynCall_iijjjiii = (Module["dynCall_iijjjiii"] = function () {
      return (dynCall_iijjjiii = Module["dynCall_iijjjiii"] =
        Module["asm"]["dynCall_iijjjiii"]).apply(null, arguments);
    });
    var dynCall_viiffii = (Module["dynCall_viiffii"] = function () {
      return (dynCall_viiffii = Module["dynCall_viiffii"] =
        Module["asm"]["dynCall_viiffii"]).apply(null, arguments);
    });
    var dynCall_ffii = (Module["dynCall_ffii"] = function () {
      return (dynCall_ffii = Module["dynCall_ffii"] =
        Module["asm"]["dynCall_ffii"]).apply(null, arguments);
    });
    var dynCall_viifiii = (Module["dynCall_viifiii"] = function () {
      return (dynCall_viifiii = Module["dynCall_viifiii"] =
        Module["asm"]["dynCall_viifiii"]).apply(null, arguments);
    });
    var dynCall_fifii = (Module["dynCall_fifii"] = function () {
      return (dynCall_fifii = Module["dynCall_fifii"] =
        Module["asm"]["dynCall_fifii"]).apply(null, arguments);
    });
    var dynCall_vifffii = (Module["dynCall_vifffii"] = function () {
      return (dynCall_vifffii = Module["dynCall_vifffii"] =
        Module["asm"]["dynCall_vifffii"]).apply(null, arguments);
    });
    var dynCall_viiifffi = (Module["dynCall_viiifffi"] = function () {
      return (dynCall_viiifffi = Module["dynCall_viiifffi"] =
        Module["asm"]["dynCall_viiifffi"]).apply(null, arguments);
    });
    var dynCall_iifffi = (Module["dynCall_iifffi"] = function () {
      return (dynCall_iifffi = Module["dynCall_iifffi"] =
        Module["asm"]["dynCall_iifffi"]).apply(null, arguments);
    });
    var dynCall_viiiidii = (Module["dynCall_viiiidii"] = function () {
      return (dynCall_viiiidii = Module["dynCall_viiiidii"] =
        Module["asm"]["dynCall_viiiidii"]).apply(null, arguments);
    });
    var dynCall_vidiiiii = (Module["dynCall_vidiiiii"] = function () {
      return (dynCall_vidiiiii = Module["dynCall_vidiiiii"] =
        Module["asm"]["dynCall_vidiiiii"]).apply(null, arguments);
    });
    var dynCall_viiidjii = (Module["dynCall_viiidjii"] = function () {
      return (dynCall_viiidjii = Module["dynCall_viiidjii"] =
        Module["asm"]["dynCall_viiidjii"]).apply(null, arguments);
    });
    var dynCall_viidii = (Module["dynCall_viidii"] = function () {
      return (dynCall_viidii = Module["dynCall_viidii"] =
        Module["asm"]["dynCall_viidii"]).apply(null, arguments);
    });
    var dynCall_iidii = (Module["dynCall_iidii"] = function () {
      return (dynCall_iidii = Module["dynCall_iidii"] =
        Module["asm"]["dynCall_iidii"]).apply(null, arguments);
    });
    var dynCall_viijijji = (Module["dynCall_viijijji"] = function () {
      return (dynCall_viijijji = Module["dynCall_viijijji"] =
        Module["asm"]["dynCall_viijijji"]).apply(null, arguments);
    });
    var dynCall_vijijji = (Module["dynCall_vijijji"] = function () {
      return (dynCall_vijijji = Module["dynCall_vijijji"] =
        Module["asm"]["dynCall_vijijji"]).apply(null, arguments);
    });
    var dynCall_vidii = (Module["dynCall_vidii"] = function () {
      return (dynCall_vidii = Module["dynCall_vidii"] =
        Module["asm"]["dynCall_vidii"]).apply(null, arguments);
    });
    var dynCall_iddi = (Module["dynCall_iddi"] = function () {
      return (dynCall_iddi = Module["dynCall_iddi"] =
        Module["asm"]["dynCall_iddi"]).apply(null, arguments);
    });
    var dynCall_ifiii = (Module["dynCall_ifiii"] = function () {
      return (dynCall_ifiii = Module["dynCall_ifiii"] =
        Module["asm"]["dynCall_ifiii"]).apply(null, arguments);
    });
    var dynCall_viiiiifii = (Module["dynCall_viiiiifii"] = function () {
      return (dynCall_viiiiifii = Module["dynCall_viiiiifii"] =
        Module["asm"]["dynCall_viiiiifii"]).apply(null, arguments);
    });
    var dynCall_viiiffffi = (Module["dynCall_viiiffffi"] = function () {
      return (dynCall_viiiffffi = Module["dynCall_viiiffffi"] =
        Module["asm"]["dynCall_viiiffffi"]).apply(null, arguments);
    });
    var dynCall_viifffi = (Module["dynCall_viifffi"] = function () {
      return (dynCall_viifffi = Module["dynCall_viifffi"] =
        Module["asm"]["dynCall_viifffi"]).apply(null, arguments);
    });
    var dynCall_viifffffi = (Module["dynCall_viifffffi"] = function () {
      return (dynCall_viifffffi = Module["dynCall_viifffffi"] =
        Module["asm"]["dynCall_viifffffi"]).apply(null, arguments);
    });
    var dynCall_viiffffffi = (Module["dynCall_viiffffffi"] = function () {
      return (dynCall_viiffffffi = Module["dynCall_viiffffffi"] =
        Module["asm"]["dynCall_viiffffffi"]).apply(null, arguments);
    });
    var dynCall_viifffffffi = (Module["dynCall_viifffffffi"] = function () {
      return (dynCall_viifffffffi = Module["dynCall_viifffffffi"] =
        Module["asm"]["dynCall_viifffffffi"]).apply(null, arguments);
    });
    var dynCall_viiffffffffi = (Module["dynCall_viiffffffffi"] = function () {
      return (dynCall_viiffffffffi = Module["dynCall_viiffffffffi"] =
        Module["asm"]["dynCall_viiffffffffi"]).apply(null, arguments);
    });
    var dynCall_vifiiii = (Module["dynCall_vifiiii"] = function () {
      return (dynCall_vifiiii = Module["dynCall_vifiiii"] =
        Module["asm"]["dynCall_vifiiii"]).apply(null, arguments);
    });
    var dynCall_vidiii = (Module["dynCall_vidiii"] = function () {
      return (dynCall_vidiii = Module["dynCall_vidiii"] =
        Module["asm"]["dynCall_vidiii"]).apply(null, arguments);
    });
    var dynCall_viifffffffiii = (Module["dynCall_viifffffffiii"] = function () {
      return (dynCall_viifffffffiii = Module["dynCall_viifffffffiii"] =
        Module["asm"]["dynCall_viifffffffiii"]).apply(null, arguments);
    });
    var dynCall_viiiiffffii = (Module["dynCall_viiiiffffii"] = function () {
      return (dynCall_viiiiffffii = Module["dynCall_viiiiffffii"] =
        Module["asm"]["dynCall_viiiiffffii"]).apply(null, arguments);
    });
    var dynCall_fiiiiii = (Module["dynCall_fiiiiii"] = function () {
      return (dynCall_fiiiiii = Module["dynCall_fiiiiii"] =
        Module["asm"]["dynCall_fiiiiii"]).apply(null, arguments);
    });
    var dynCall_idiiii = (Module["dynCall_idiiii"] = function () {
      return (dynCall_idiiii = Module["dynCall_idiiii"] =
        Module["asm"]["dynCall_idiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiiiiiiiii = (Module["dynCall_iiiiiiiiiiiiii"] =
      function () {
        return (dynCall_iiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiii"] =
          Module["asm"]["dynCall_iiiiiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_jjii = (Module["dynCall_jjii"] = function () {
      return (dynCall_jjii = Module["dynCall_jjii"] =
        Module["asm"]["dynCall_jjii"]).apply(null, arguments);
    });
    var dynCall_vijiiiiiii = (Module["dynCall_vijiiiiiii"] = function () {
      return (dynCall_vijiiiiiii = Module["dynCall_vijiiiiiii"] =
        Module["asm"]["dynCall_vijiiiiiii"]).apply(null, arguments);
    });
    var dynCall_vijiiiiiiii = (Module["dynCall_vijiiiiiiii"] = function () {
      return (dynCall_vijiiiiiiii = Module["dynCall_vijiiiiiiii"] =
        Module["asm"]["dynCall_vijiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_jijiii = (Module["dynCall_jijiii"] = function () {
      return (dynCall_jijiii = Module["dynCall_jijiii"] =
        Module["asm"]["dynCall_jijiii"]).apply(null, arguments);
    });
    var dynCall_jjiiii = (Module["dynCall_jjiiii"] = function () {
      return (dynCall_jjiiii = Module["dynCall_jjiiii"] =
        Module["asm"]["dynCall_jjiiii"]).apply(null, arguments);
    });
    var dynCall_jjiiiii = (Module["dynCall_jjiiiii"] = function () {
      return (dynCall_jjiiiii = Module["dynCall_jjiiiii"] =
        Module["asm"]["dynCall_jjiiiii"]).apply(null, arguments);
    });
    var dynCall_viijiiiiii = (Module["dynCall_viijiiiiii"] = function () {
      return (dynCall_viijiiiiii = Module["dynCall_viijiiiiii"] =
        Module["asm"]["dynCall_viijiiiiii"]).apply(null, arguments);
    });
    var dynCall_iijiiiiii = (Module["dynCall_iijiiiiii"] = function () {
      return (dynCall_iijiiiiii = Module["dynCall_iijiiiiii"] =
        Module["asm"]["dynCall_iijiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiijjii = (Module["dynCall_iiiijjii"] = function () {
      return (dynCall_iiiijjii = Module["dynCall_iiiijjii"] =
        Module["asm"]["dynCall_iiiijjii"]).apply(null, arguments);
    });
    var dynCall_jijjji = (Module["dynCall_jijjji"] = function () {
      return (dynCall_jijjji = Module["dynCall_jijjji"] =
        Module["asm"]["dynCall_jijjji"]).apply(null, arguments);
    });
    var dynCall_jijjjii = (Module["dynCall_jijjjii"] = function () {
      return (dynCall_jijjjii = Module["dynCall_jijjjii"] =
        Module["asm"]["dynCall_jijjjii"]).apply(null, arguments);
    });
    var dynCall_jjiii = (Module["dynCall_jjiii"] = function () {
      return (dynCall_jjiii = Module["dynCall_jjiii"] =
        Module["asm"]["dynCall_jjiii"]).apply(null, arguments);
    });
    var dynCall_ijijiiiii = (Module["dynCall_ijijiiiii"] = function () {
      return (dynCall_ijijiiiii = Module["dynCall_ijijiiiii"] =
        Module["asm"]["dynCall_ijijiiiii"]).apply(null, arguments);
    });
    var dynCall_ijjjiii = (Module["dynCall_ijjjiii"] = function () {
      return (dynCall_ijjjiii = Module["dynCall_ijjjiii"] =
        Module["asm"]["dynCall_ijjjiii"]).apply(null, arguments);
    });
    var dynCall_vijjjiijii = (Module["dynCall_vijjjiijii"] = function () {
      return (dynCall_vijjjiijii = Module["dynCall_vijjjiijii"] =
        Module["asm"]["dynCall_vijjjiijii"]).apply(null, arguments);
    });
    var dynCall_ijjjiijii = (Module["dynCall_ijjjiijii"] = function () {
      return (dynCall_ijjjiijii = Module["dynCall_ijjjiijii"] =
        Module["asm"]["dynCall_ijjjiijii"]).apply(null, arguments);
    });
    var dynCall_vijiiiiii = (Module["dynCall_vijiiiiii"] = function () {
      return (dynCall_vijiiiiii = Module["dynCall_vijiiiiii"] =
        Module["asm"]["dynCall_vijiiiiii"]).apply(null, arguments);
    });
    var dynCall_jdi = (Module["dynCall_jdi"] = function () {
      return (dynCall_jdi = Module["dynCall_jdi"] =
        Module["asm"]["dynCall_jdi"]).apply(null, arguments);
    });
    var dynCall_jfi = (Module["dynCall_jfi"] = function () {
      return (dynCall_jfi = Module["dynCall_jfi"] =
        Module["asm"]["dynCall_jfi"]).apply(null, arguments);
    });
    var dynCall_dfi = (Module["dynCall_dfi"] = function () {
      return (dynCall_dfi = Module["dynCall_dfi"] =
        Module["asm"]["dynCall_dfi"]).apply(null, arguments);
    });
    var dynCall_jidii = (Module["dynCall_jidii"] = function () {
      return (dynCall_jidii = Module["dynCall_jidii"] =
        Module["asm"]["dynCall_jidii"]).apply(null, arguments);
    });
    var dynCall_jidi = (Module["dynCall_jidi"] = function () {
      return (dynCall_jidi = Module["dynCall_jidi"] =
        Module["asm"]["dynCall_jidi"]).apply(null, arguments);
    });
    var dynCall_ijiijii = (Module["dynCall_ijiijii"] = function () {
      return (dynCall_ijiijii = Module["dynCall_ijiijii"] =
        Module["asm"]["dynCall_ijiijii"]).apply(null, arguments);
    });
    var dynCall_vjjiiiii = (Module["dynCall_vjjiiiii"] = function () {
      return (dynCall_vjjiiiii = Module["dynCall_vjjiiiii"] =
        Module["asm"]["dynCall_vjjiiiii"]).apply(null, arguments);
    });
    var dynCall_vjjii = (Module["dynCall_vjjii"] = function () {
      return (dynCall_vjjii = Module["dynCall_vjjii"] =
        Module["asm"]["dynCall_vjjii"]).apply(null, arguments);
    });
    var dynCall_ijiiji = (Module["dynCall_ijiiji"] = function () {
      return (dynCall_ijiiji = Module["dynCall_ijiiji"] =
        Module["asm"]["dynCall_ijiiji"]).apply(null, arguments);
    });
    var dynCall_ijiiiii = (Module["dynCall_ijiiiii"] = function () {
      return (dynCall_ijiiiii = Module["dynCall_ijiiiii"] =
        Module["asm"]["dynCall_ijiiiii"]).apply(null, arguments);
    });
    var dynCall_ijiiiiji = (Module["dynCall_ijiiiiji"] = function () {
      return (dynCall_ijiiiiji = Module["dynCall_ijiiiiji"] =
        Module["asm"]["dynCall_ijiiiiji"]).apply(null, arguments);
    });
    var dynCall_ddii = (Module["dynCall_ddii"] = function () {
      return (dynCall_ddii = Module["dynCall_ddii"] =
        Module["asm"]["dynCall_ddii"]).apply(null, arguments);
    });
    var dynCall_idiii = (Module["dynCall_idiii"] = function () {
      return (dynCall_idiii = Module["dynCall_idiii"] =
        Module["asm"]["dynCall_idiii"]).apply(null, arguments);
    });
    var dynCall_idiiiii = (Module["dynCall_idiiiii"] = function () {
      return (dynCall_idiiiii = Module["dynCall_idiiiii"] =
        Module["asm"]["dynCall_idiiiii"]).apply(null, arguments);
    });
    var dynCall_iidiii = (Module["dynCall_iidiii"] = function () {
      return (dynCall_iidiii = Module["dynCall_iidiii"] =
        Module["asm"]["dynCall_iidiii"]).apply(null, arguments);
    });
    var dynCall_ifiiiii = (Module["dynCall_ifiiiii"] = function () {
      return (dynCall_ifiiiii = Module["dynCall_ifiiiii"] =
        Module["asm"]["dynCall_ifiiiii"]).apply(null, arguments);
    });
    var dynCall_jjjii = (Module["dynCall_jjjii"] = function () {
      return (dynCall_jjjii = Module["dynCall_jjjii"] =
        Module["asm"]["dynCall_jjjii"]).apply(null, arguments);
    });
    var dynCall_vdiii = (Module["dynCall_vdiii"] = function () {
      return (dynCall_vdiii = Module["dynCall_vdiii"] =
        Module["asm"]["dynCall_vdiii"]).apply(null, arguments);
    });
    var dynCall_jdii = (Module["dynCall_jdii"] = function () {
      return (dynCall_jdii = Module["dynCall_jdii"] =
        Module["asm"]["dynCall_jdii"]).apply(null, arguments);
    });
    var dynCall_iijjji = (Module["dynCall_iijjji"] = function () {
      return (dynCall_iijjji = Module["dynCall_iijjji"] =
        Module["asm"]["dynCall_iijjji"]).apply(null, arguments);
    });
    var dynCall_viijjji = (Module["dynCall_viijjji"] = function () {
      return (dynCall_viijjji = Module["dynCall_viijjji"] =
        Module["asm"]["dynCall_viijjji"]).apply(null, arguments);
    });
    var dynCall_vdii = (Module["dynCall_vdii"] = function () {
      return (dynCall_vdii = Module["dynCall_vdii"] =
        Module["asm"]["dynCall_vdii"]).apply(null, arguments);
    });
    var dynCall_diddi = (Module["dynCall_diddi"] = function () {
      return (dynCall_diddi = Module["dynCall_diddi"] =
        Module["asm"]["dynCall_diddi"]).apply(null, arguments);
    });
    var dynCall_viiiijii = (Module["dynCall_viiiijii"] = function () {
      return (dynCall_viiiijii = Module["dynCall_viiiijii"] =
        Module["asm"]["dynCall_viiiijii"]).apply(null, arguments);
    });
    var dynCall_viiijji = (Module["dynCall_viiijji"] = function () {
      return (dynCall_viiijji = Module["dynCall_viiijji"] =
        Module["asm"]["dynCall_viiijji"]).apply(null, arguments);
    });
    var dynCall_iijjii = (Module["dynCall_iijjii"] = function () {
      return (dynCall_iijjii = Module["dynCall_iijjii"] =
        Module["asm"]["dynCall_iijjii"]).apply(null, arguments);
    });
    var dynCall_viijijii = (Module["dynCall_viijijii"] = function () {
      return (dynCall_viijijii = Module["dynCall_viijijii"] =
        Module["asm"]["dynCall_viijijii"]).apply(null, arguments);
    });
    var dynCall_viijijiii = (Module["dynCall_viijijiii"] = function () {
      return (dynCall_viijijiii = Module["dynCall_viijijiii"] =
        Module["asm"]["dynCall_viijijiii"]).apply(null, arguments);
    });
    var dynCall_vijiji = (Module["dynCall_vijiji"] = function () {
      return (dynCall_vijiji = Module["dynCall_vijiji"] =
        Module["asm"]["dynCall_vijiji"]).apply(null, arguments);
    });
    var dynCall_viijiijiii = (Module["dynCall_viijiijiii"] = function () {
      return (dynCall_viijiijiii = Module["dynCall_viijiijiii"] =
        Module["asm"]["dynCall_viijiijiii"]).apply(null, arguments);
    });
    var dynCall_viiiijiiii = (Module["dynCall_viiiijiiii"] = function () {
      return (dynCall_viiiijiiii = Module["dynCall_viiiijiiii"] =
        Module["asm"]["dynCall_viiiijiiii"]).apply(null, arguments);
    });
    var dynCall_jiiiiii = (Module["dynCall_jiiiiii"] = function () {
      return (dynCall_jiiiiii = Module["dynCall_jiiiiii"] =
        Module["asm"]["dynCall_jiiiiii"]).apply(null, arguments);
    });
    var dynCall_vijjji = (Module["dynCall_vijjji"] = function () {
      return (dynCall_vijjji = Module["dynCall_vijjji"] =
        Module["asm"]["dynCall_vijjji"]).apply(null, arguments);
    });
    var dynCall_jiiiiiiiiii = (Module["dynCall_jiiiiiiiiii"] = function () {
      return (dynCall_jiiiiiiiiii = Module["dynCall_jiiiiiiiiii"] =
        Module["asm"]["dynCall_jiiiiiiiiii"]).apply(null, arguments);
    });
    var dynCall_viijjii = (Module["dynCall_viijjii"] = function () {
      return (dynCall_viijjii = Module["dynCall_viijjii"] =
        Module["asm"]["dynCall_viijjii"]).apply(null, arguments);
    });
    var dynCall_fiff = (Module["dynCall_fiff"] = function () {
      return (dynCall_fiff = Module["dynCall_fiff"] =
        Module["asm"]["dynCall_fiff"]).apply(null, arguments);
    });
    var dynCall_vififiii = (Module["dynCall_vififiii"] = function () {
      return (dynCall_vififiii = Module["dynCall_vififiii"] =
        Module["asm"]["dynCall_vififiii"]).apply(null, arguments);
    });
    var dynCall_iiiiidii = (Module["dynCall_iiiiidii"] = function () {
      return (dynCall_iiiiidii = Module["dynCall_iiiiidii"] =
        Module["asm"]["dynCall_iiiiidii"]).apply(null, arguments);
    });
    var dynCall_iiiiijii = (Module["dynCall_iiiiijii"] = function () {
      return (dynCall_iiiiijii = Module["dynCall_iiiiijii"] =
        Module["asm"]["dynCall_iiiiijii"]).apply(null, arguments);
    });
    var dynCall_iiidiii = (Module["dynCall_iiidiii"] = function () {
      return (dynCall_iiidiii = Module["dynCall_iiidiii"] =
        Module["asm"]["dynCall_iiidiii"]).apply(null, arguments);
    });
    var dynCall_viifffiii = (Module["dynCall_viifffiii"] = function () {
      return (dynCall_viifffiii = Module["dynCall_viifffiii"] =
        Module["asm"]["dynCall_viifffiii"]).apply(null, arguments);
    });
    var dynCall_iiiiffiiiji = (Module["dynCall_iiiiffiiiji"] = function () {
      return (dynCall_iiiiffiiiji = Module["dynCall_iiiiffiiiji"] =
        Module["asm"]["dynCall_iiiiffiiiji"]).apply(null, arguments);
    });
    var dynCall_iiiiiidi = (Module["dynCall_iiiiiidi"] = function () {
      return (dynCall_iiiiiidi = Module["dynCall_iiiiiidi"] =
        Module["asm"]["dynCall_iiiiiidi"]).apply(null, arguments);
    });
    var dynCall_iiiiiiji = (Module["dynCall_iiiiiiji"] = function () {
      return (dynCall_iiiiiiji = Module["dynCall_iiiiiiji"] =
        Module["asm"]["dynCall_iiiiiiji"]).apply(null, arguments);
    });
    var dynCall_iiiiiifi = (Module["dynCall_iiiiiifi"] = function () {
      return (dynCall_iiiiiifi = Module["dynCall_iiiiiifi"] =
        Module["asm"]["dynCall_iiiiiifi"]).apply(null, arguments);
    });
    var dynCall_fiiiiiii = (Module["dynCall_fiiiiiii"] = function () {
      return (dynCall_fiiiiiii = Module["dynCall_fiiiiiii"] =
        Module["asm"]["dynCall_fiiiiiii"]).apply(null, arguments);
    });
    var dynCall_iiiiffiiiii = (Module["dynCall_iiiiffiiiii"] = function () {
      return (dynCall_iiiiffiiiii = Module["dynCall_iiiiffiiiii"] =
        Module["asm"]["dynCall_iiiiffiiiii"]).apply(null, arguments);
    });
    var dynCall_idii = (Module["dynCall_idii"] = function () {
      return (dynCall_idii = Module["dynCall_idii"] =
        Module["asm"]["dynCall_idii"]).apply(null, arguments);
    });
    var dynCall_diiiidi = (Module["dynCall_diiiidi"] = function () {
      return (dynCall_diiiidi = Module["dynCall_diiiidi"] =
        Module["asm"]["dynCall_diiiidi"]).apply(null, arguments);
    });
    var dynCall_jiiiiji = (Module["dynCall_jiiiiji"] = function () {
      return (dynCall_jiiiiji = Module["dynCall_jiiiiji"] =
        Module["asm"]["dynCall_jiiiiji"]).apply(null, arguments);
    });
    var dynCall_fiiiifi = (Module["dynCall_fiiiifi"] = function () {
      return (dynCall_fiiiifi = Module["dynCall_fiiiifi"] =
        Module["asm"]["dynCall_fiiiifi"]).apply(null, arguments);
    });
    var dynCall_didii = (Module["dynCall_didii"] = function () {
      return (dynCall_didii = Module["dynCall_didii"] =
        Module["asm"]["dynCall_didii"]).apply(null, arguments);
    });
    var dynCall_vidiji = (Module["dynCall_vidiji"] = function () {
      return (dynCall_vidiji = Module["dynCall_vidiji"] =
        Module["asm"]["dynCall_vidiji"]).apply(null, arguments);
    });
    var dynCall_vidjii = (Module["dynCall_vidjii"] = function () {
      return (dynCall_vidjii = Module["dynCall_vidjii"] =
        Module["asm"]["dynCall_vidjii"]).apply(null, arguments);
    });
    var dynCall_iiidi = (Module["dynCall_iiidi"] = function () {
      return (dynCall_iiidi = Module["dynCall_iiidi"] =
        Module["asm"]["dynCall_iiidi"]).apply(null, arguments);
    });
    var dynCall_vdi = (Module["dynCall_vdi"] = function () {
      return (dynCall_vdi = Module["dynCall_vdi"] =
        Module["asm"]["dynCall_vdi"]).apply(null, arguments);
    });
    var dynCall_iiiijiii = (Module["dynCall_iiiijiii"] = function () {
      return (dynCall_iiiijiii = Module["dynCall_iiiijiii"] =
        Module["asm"]["dynCall_iiiijiii"]).apply(null, arguments);
    });
    var dynCall_iiiij = (Module["dynCall_iiiij"] = function () {
      return (dynCall_iiiij = Module["dynCall_iiiij"] =
        Module["asm"]["dynCall_iiiij"]).apply(null, arguments);
    });
    var dynCall_fff = (Module["dynCall_fff"] = function () {
      return (dynCall_fff = Module["dynCall_fff"] =
        Module["asm"]["dynCall_fff"]).apply(null, arguments);
    });
    var dynCall_viif = (Module["dynCall_viif"] = function () {
      return (dynCall_viif = Module["dynCall_viif"] =
        Module["asm"]["dynCall_viif"]).apply(null, arguments);
    });
    var dynCall_vif = (Module["dynCall_vif"] = function () {
      return (dynCall_vif = Module["dynCall_vif"] =
        Module["asm"]["dynCall_vif"]).apply(null, arguments);
    });
    var dynCall_vid = (Module["dynCall_vid"] = function () {
      return (dynCall_vid = Module["dynCall_vid"] =
        Module["asm"]["dynCall_vid"]).apply(null, arguments);
    });
    var dynCall_ijj = (Module["dynCall_ijj"] = function () {
      return (dynCall_ijj = Module["dynCall_ijj"] =
        Module["asm"]["dynCall_ijj"]).apply(null, arguments);
    });
    var dynCall_vjji = (Module["dynCall_vjji"] = function () {
      return (dynCall_vjji = Module["dynCall_vjji"] =
        Module["asm"]["dynCall_vjji"]).apply(null, arguments);
    });
    var dynCall_viiiiif = (Module["dynCall_viiiiif"] = function () {
      return (dynCall_viiiiif = Module["dynCall_viiiiif"] =
        Module["asm"]["dynCall_viiiiif"]).apply(null, arguments);
    });
    var dynCall_viiiif = (Module["dynCall_viiiif"] = function () {
      return (dynCall_viiiif = Module["dynCall_viiiif"] =
        Module["asm"]["dynCall_viiiif"]).apply(null, arguments);
    });
    var dynCall_viiidd = (Module["dynCall_viiidd"] = function () {
      return (dynCall_viiidd = Module["dynCall_viiidd"] =
        Module["asm"]["dynCall_viiidd"]).apply(null, arguments);
    });
    var dynCall_viiiiiif = (Module["dynCall_viiiiiif"] = function () {
      return (dynCall_viiiiiif = Module["dynCall_viiiiiif"] =
        Module["asm"]["dynCall_viiiiiif"]).apply(null, arguments);
    });
    var dynCall_iiijiiiiiiiiii = (Module["dynCall_iiijiiiiiiiiii"] =
      function () {
        return (dynCall_iiijiiiiiiiiii = Module["dynCall_iiijiiiiiiiiii"] =
          Module["asm"]["dynCall_iiijiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_viiff = (Module["dynCall_viiff"] = function () {
      return (dynCall_viiff = Module["dynCall_viiff"] =
        Module["asm"]["dynCall_viiff"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiiiiiiiii = (Module["dynCall_viiiiiiiiiiiiiiiiii"] =
      function () {
        return (dynCall_viiiiiiiiiiiiiiiiii = Module[
          "dynCall_viiiiiiiiiiiiiiiiii"
        ] =
          Module["asm"]["dynCall_viiiiiiiiiiiiiiiiii"]).apply(null, arguments);
      });
    var dynCall_vifff = (Module["dynCall_vifff"] = function () {
      return (dynCall_vifff = Module["dynCall_vifff"] =
        Module["asm"]["dynCall_vifff"]).apply(null, arguments);
    });
    var dynCall_viffff = (Module["dynCall_viffff"] = function () {
      return (dynCall_viffff = Module["dynCall_viffff"] =
        Module["asm"]["dynCall_viffff"]).apply(null, arguments);
    });
    var dynCall_viifff = (Module["dynCall_viifff"] = function () {
      return (dynCall_viifff = Module["dynCall_viifff"] =
        Module["asm"]["dynCall_viifff"]).apply(null, arguments);
    });
    var dynCall_viff = (Module["dynCall_viff"] = function () {
      return (dynCall_viff = Module["dynCall_viff"] =
        Module["asm"]["dynCall_viff"]).apply(null, arguments);
    });
    var dynCall_vij = (Module["dynCall_vij"] = function () {
      return (dynCall_vij = Module["dynCall_vij"] =
        Module["asm"]["dynCall_vij"]).apply(null, arguments);
    });
    var dynCall_iiif = (Module["dynCall_iiif"] = function () {
      return (dynCall_iiif = Module["dynCall_iiif"] =
        Module["asm"]["dynCall_iiif"]).apply(null, arguments);
    });
    var dynCall_fif = (Module["dynCall_fif"] = function () {
      return (dynCall_fif = Module["dynCall_fif"] =
        Module["asm"]["dynCall_fif"]).apply(null, arguments);
    });
    var dynCall_iiiiiifffiiifiii = (Module["dynCall_iiiiiifffiiifiii"] =
      function () {
        return (dynCall_iiiiiifffiiifiii = Module["dynCall_iiiiiifffiiifiii"] =
          Module["asm"]["dynCall_iiiiiifffiiifiii"]).apply(null, arguments);
      });
    var dynCall_viiiffffffi = (Module["dynCall_viiiffffffi"] = function () {
      return (dynCall_viiiffffffi = Module["dynCall_viiiffffffi"] =
        Module["asm"]["dynCall_viiiffffffi"]).apply(null, arguments);
    });
    var dynCall_iiiiiiifii = (Module["dynCall_iiiiiiifii"] = function () {
      return (dynCall_iiiiiiifii = Module["dynCall_iiiiiiifii"] =
        Module["asm"]["dynCall_iiiiiiifii"]).apply(null, arguments);
    });
    var dynCall_iijjiii = (Module["dynCall_iijjiii"] = function () {
      return (dynCall_iijjiii = Module["dynCall_iijjiii"] =
        Module["asm"]["dynCall_iijjiii"]).apply(null, arguments);
    });
    var dynCall_vijjjii = (Module["dynCall_vijjjii"] = function () {
      return (dynCall_vijjjii = Module["dynCall_vijjjii"] =
        Module["asm"]["dynCall_vijjjii"]).apply(null, arguments);
    });
    var dynCall_viid = (Module["dynCall_viid"] = function () {
      return (dynCall_viid = Module["dynCall_viid"] =
        Module["asm"]["dynCall_viid"]).apply(null, arguments);
    });
    var dynCall_viiif = (Module["dynCall_viiif"] = function () {
      return (dynCall_viiif = Module["dynCall_viiif"] =
        Module["asm"]["dynCall_viiif"]).apply(null, arguments);
    });
    var dynCall_iiiiiifff = (Module["dynCall_iiiiiifff"] = function () {
      return (dynCall_iiiiiifff = Module["dynCall_iiiiiifff"] =
        Module["asm"]["dynCall_iiiiiifff"]).apply(null, arguments);
    });
    var dynCall_iiiiiifiif = (Module["dynCall_iiiiiifiif"] = function () {
      return (dynCall_iiiiiifiif = Module["dynCall_iiiiiifiif"] =
        Module["asm"]["dynCall_iiiiiifiif"]).apply(null, arguments);
    });
    var dynCall_iiiiiifiii = (Module["dynCall_iiiiiifiii"] = function () {
      return (dynCall_iiiiiifiii = Module["dynCall_iiiiiifiii"] =
        Module["asm"]["dynCall_iiiiiifiii"]).apply(null, arguments);
    });
    var dynCall_iiiiiiifiif = (Module["dynCall_iiiiiiifiif"] = function () {
      return (dynCall_iiiiiiifiif = Module["dynCall_iiiiiiifiif"] =
        Module["asm"]["dynCall_iiiiiiifiif"]).apply(null, arguments);
    });
    var dynCall_fiiiiiifiifif = (Module["dynCall_fiiiiiifiifif"] = function () {
      return (dynCall_fiiiiiifiifif = Module["dynCall_fiiiiiifiifif"] =
        Module["asm"]["dynCall_fiiiiiifiifif"]).apply(null, arguments);
    });
    var dynCall_fiiiiiifiiiif = (Module["dynCall_fiiiiiifiiiif"] = function () {
      return (dynCall_fiiiiiifiiiif = Module["dynCall_fiiiiiifiiiif"] =
        Module["asm"]["dynCall_fiiiiiifiiiif"]).apply(null, arguments);
    });
    var dynCall_iifiiiijii = (Module["dynCall_iifiiiijii"] = function () {
      return (dynCall_iifiiiijii = Module["dynCall_iifiiiijii"] =
        Module["asm"]["dynCall_iifiiiijii"]).apply(null, arguments);
    });
    var dynCall_vifif = (Module["dynCall_vifif"] = function () {
      return (dynCall_vifif = Module["dynCall_vifif"] =
        Module["asm"]["dynCall_vifif"]).apply(null, arguments);
    });
    var dynCall_vifijii = (Module["dynCall_vifijii"] = function () {
      return (dynCall_vifijii = Module["dynCall_vifijii"] =
        Module["asm"]["dynCall_vifijii"]).apply(null, arguments);
    });
    var dynCall_iiiifffiii = (Module["dynCall_iiiifffiii"] = function () {
      return (dynCall_iiiifffiii = Module["dynCall_iiiifffiii"] =
        Module["asm"]["dynCall_iiiifffiii"]).apply(null, arguments);
    });
    var dynCall_iiiifffffi = (Module["dynCall_iiiifffffi"] = function () {
      return (dynCall_iiiifffffi = Module["dynCall_iiiifffffi"] =
        Module["asm"]["dynCall_iiiifffffi"]).apply(null, arguments);
    });
    var dynCall_viffiiiif = (Module["dynCall_viffiiiif"] = function () {
      return (dynCall_viffiiiif = Module["dynCall_viffiiiif"] =
        Module["asm"]["dynCall_viffiiiif"]).apply(null, arguments);
    });
    var dynCall_viffiifffffiii = (Module["dynCall_viffiifffffiii"] =
      function () {
        return (dynCall_viffiifffffiii = Module["dynCall_viffiifffffiii"] =
          Module["asm"]["dynCall_viffiifffffiii"]).apply(null, arguments);
      });
    var dynCall_viffffiifffiiiiif = (Module["dynCall_viffffiifffiiiiif"] =
      function () {
        return (dynCall_viffffiifffiiiiif = Module[
          "dynCall_viffffiifffiiiiif"
        ] =
          Module["asm"]["dynCall_viffffiifffiiiiif"]).apply(null, arguments);
      });
    var dynCall_iiiifffffii = (Module["dynCall_iiiifffffii"] = function () {
      return (dynCall_iiiifffffii = Module["dynCall_iiiifffffii"] =
        Module["asm"]["dynCall_iiiifffffii"]).apply(null, arguments);
    });
    var dynCall_viiiiiiiiiiifii = (Module["dynCall_viiiiiiiiiiifii"] =
      function () {
        return (dynCall_viiiiiiiiiiifii = Module["dynCall_viiiiiiiiiiifii"] =
          Module["asm"]["dynCall_viiiiiiiiiiifii"]).apply(null, arguments);
      });
    var dynCall_iiiiifiiiiif = (Module["dynCall_iiiiifiiiiif"] = function () {
      return (dynCall_iiiiifiiiiif = Module["dynCall_iiiiifiiiiif"] =
        Module["asm"]["dynCall_iiiiifiiiiif"]).apply(null, arguments);
    });
    var dynCall_viiifiiiii = (Module["dynCall_viiifiiiii"] = function () {
      return (dynCall_viiifiiiii = Module["dynCall_viiifiiiii"] =
        Module["asm"]["dynCall_viiifiiiii"]).apply(null, arguments);
    });
    var dynCall_viiiifiiiiif = (Module["dynCall_viiiifiiiiif"] = function () {
      return (dynCall_viiiifiiiiif = Module["dynCall_viiiifiiiiif"] =
        Module["asm"]["dynCall_viiiifiiiiif"]).apply(null, arguments);
    });
    var dynCall_iifff = (Module["dynCall_iifff"] = function () {
      return (dynCall_iifff = Module["dynCall_iifff"] =
        Module["asm"]["dynCall_iifff"]).apply(null, arguments);
    });
    var dynCall_iif = (Module["dynCall_iif"] = function () {
      return (dynCall_iif = Module["dynCall_iif"] =
        Module["asm"]["dynCall_iif"]).apply(null, arguments);
    });
    var dynCall_viij = (Module["dynCall_viij"] = function () {
      return (dynCall_viij = Module["dynCall_viij"] =
        Module["asm"]["dynCall_viij"]).apply(null, arguments);
    });
    var dynCall_viijijj = (Module["dynCall_viijijj"] = function () {
      return (dynCall_viijijj = Module["dynCall_viijijj"] =
        Module["asm"]["dynCall_viijijj"]).apply(null, arguments);
    });
    var dynCall_viijj = (Module["dynCall_viijj"] = function () {
      return (dynCall_viijj = Module["dynCall_viijj"] =
        Module["asm"]["dynCall_viijj"]).apply(null, arguments);
    });
    var dynCall_viiiij = (Module["dynCall_viiiij"] = function () {
      return (dynCall_viiiij = Module["dynCall_viiiij"] =
        Module["asm"]["dynCall_viiiij"]).apply(null, arguments);
    });
    var dynCall_fiiiif = (Module["dynCall_fiiiif"] = function () {
      return (dynCall_fiiiif = Module["dynCall_fiiiif"] =
        Module["asm"]["dynCall_fiiiif"]).apply(null, arguments);
    });
    var dynCall_iiiiiff = (Module["dynCall_iiiiiff"] = function () {
      return (dynCall_iiiiiff = Module["dynCall_iiiiiff"] =
        Module["asm"]["dynCall_iiiiiff"]).apply(null, arguments);
    });
    var dynCall_iiij = (Module["dynCall_iiij"] = function () {
      return (dynCall_iiij = Module["dynCall_iiij"] =
        Module["asm"]["dynCall_iiij"]).apply(null, arguments);
    });
    var dynCall_vf = (Module["dynCall_vf"] = function () {
      return (dynCall_vf = Module["dynCall_vf"] =
        Module["asm"]["dynCall_vf"]).apply(null, arguments);
    });
    var dynCall_vffff = (Module["dynCall_vffff"] = function () {
      return (dynCall_vffff = Module["dynCall_vffff"] =
        Module["asm"]["dynCall_vffff"]).apply(null, arguments);
    });
    var dynCall_vff = (Module["dynCall_vff"] = function () {
      return (dynCall_vff = Module["dynCall_vff"] =
        Module["asm"]["dynCall_vff"]).apply(null, arguments);
    });
    var dynCall_vjiiiiiii = (Module["dynCall_vjiiiiiii"] = function () {
      return (dynCall_vjiiiiiii = Module["dynCall_vjiiiiiii"] =
        Module["asm"]["dynCall_vjiiiiiii"]).apply(null, arguments);
    });
    var dynCall_vfff = (Module["dynCall_vfff"] = function () {
      return (dynCall_vfff = Module["dynCall_vfff"] =
        Module["asm"]["dynCall_vfff"]).apply(null, arguments);
    });
    var dynCall_ij = (Module["dynCall_ij"] = function () {
      return (dynCall_ij = Module["dynCall_ij"] =
        Module["asm"]["dynCall_ij"]).apply(null, arguments);
    });
    var dynCall_f = (Module["dynCall_f"] = function () {
      return (dynCall_f = Module["dynCall_f"] =
        Module["asm"]["dynCall_f"]).apply(null, arguments);
    });
    var dynCall_vffffffi = (Module["dynCall_vffffffi"] = function () {
      return (dynCall_vffffffi = Module["dynCall_vffffffi"] =
        Module["asm"]["dynCall_vffffffi"]).apply(null, arguments);
    });
    var dynCall_ff = (Module["dynCall_ff"] = function () {
      return (dynCall_ff = Module["dynCall_ff"] =
        Module["asm"]["dynCall_ff"]).apply(null, arguments);
    });
    var dynCall_iiiiiiffiiiiiiiiiffffiii = (Module[
      "dynCall_iiiiiiffiiiiiiiiiffffiii"
    ] = function () {
      return (dynCall_iiiiiiffiiiiiiiiiffffiii = Module[
        "dynCall_iiiiiiffiiiiiiiiiffffiii"
      ] =
        Module["asm"]["dynCall_iiiiiiffiiiiiiiiiffffiii"]).apply(
        null,
        arguments
      );
    });
    var dynCall_viiffiiiii = (Module["dynCall_viiffiiiii"] = function () {
      return (dynCall_viiffiiiii = Module["dynCall_viiffiiiii"] =
        Module["asm"]["dynCall_viiffiiiii"]).apply(null, arguments);
    });
    var dynCall_d = (Module["dynCall_d"] = function () {
      return (dynCall_d = Module["dynCall_d"] =
        Module["asm"]["dynCall_d"]).apply(null, arguments);
    });
    function invoke_ii(index, a1) {
      var sp = stackSave();
      try {
        return dynCall_ii(index, a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_v(index) {
      var sp = stackSave();
      try {
        dynCall_v(index);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
        dynCall_vii(index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iii(index, a1, a2) {
      var sp = stackSave();
      try {
        return dynCall_iii(index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_iiiiii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_iiii(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        dynCall_viii(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_iiiii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_fiii(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_diii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_diii(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viiii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vi(index, a1) {
      var sp = stackSave();
      try {
        dynCall_vi(index, a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_i(index) {
      var sp = stackSave();
      try {
        return dynCall_i(index);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10
    ) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiiiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12
    ) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiiiiiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11
    ) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiiiiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10
    ) {
      var sp = stackSave();
      try {
        dynCall_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiiiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15
    ) {
      var sp = stackSave();
      try {
        dynCall_viiiiiiiiiiiiiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_viiiii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      var sp = stackSave();
      try {
        dynCall_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vidi(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        dynCall_vidi(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iifi(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_iifi(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiif(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_iiif(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiifi(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_viiifi(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viifi(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viifi(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viifiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viifiii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fii(index, a1, a2) {
      var sp = stackSave();
      try {
        return dynCall_fii(index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vifi(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        dynCall_vifi(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fi(index, a1) {
      var sp = stackSave();
      try {
        return dynCall_fi(index, a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vififiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      var sp = stackSave();
      try {
        dynCall_vififiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiififiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        dynCall_viiififiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fiffi(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_fiffi(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fiiffi(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_fiiffi(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiffiiiiiiiiiffffiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16,
      a17,
      a18,
      a19,
      a20,
      a21,
      a22,
      a23
    ) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiffiiiiiiiiiffffiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11,
          a12,
          a13,
          a14,
          a15,
          a16,
          a17,
          a18,
          a19,
          a20,
          a21,
          a22,
          a23
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vifii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_vifii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viffi(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viffi(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiifii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iiiifii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiifii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viiifii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fffi(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_fffi(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viifii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_viifii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiidii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iiiidii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viidi(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viidi(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_dii(index, a1, a2) {
      var sp = stackSave();
      try {
        return dynCall_dii(index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiidi(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viiiidi(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiidii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_fiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_fiiii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_di(index, a1) {
      var sp = stackSave();
      try {
        return dynCall_di(index, a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiifii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_iiifii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiifi(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viiiifi(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_ddiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_ddiii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiffi(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_viiffi(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiff(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viiff(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      var sp = stackSave();
      try {
        dynCall_viiiiiifii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiifi(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_iiifi(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_jiiii(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iij(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_iij(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiijiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return dynCall_iiijiii(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jii(index, a1, a2) {
      var sp = stackSave();
      try {
        return dynCall_jii(index, a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_ji(index, a1) {
      var sp = stackSave();
      try {
        return dynCall_ji(index, a1);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viijii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_j(index) {
      var sp = stackSave();
      try {
        return dynCall_j(index);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iji(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_iji(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jjji(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_jjji(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vijii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_vijii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iijiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iijiii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viji(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        dynCall_viji(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiji(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_iiji(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiiji(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_viiiji(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        return dynCall_jiii(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viiji(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        dynCall_viiji(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_viidiji(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        dynCall_viidiji(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiijii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iiijii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiiiiiiiji(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11
    ) {
      var sp = stackSave();
      try {
        return dynCall_iiiiiiiiiji(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10,
          a11
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vji(index, a1, a2, a3) {
      var sp = stackSave();
      try {
        dynCall_vji(index, a1, a2, a3);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iiiijii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        return dynCall_iiiijii(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jijii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_jijii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_jiiiii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iijii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_iijii(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_ijji(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
        return dynCall_ijji(index, a1, a2, a3, a4, a5);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jiji(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
        return dynCall_jiji(index, a1, a2, a3, a4);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_iijji(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        return dynCall_iijji(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_jiiiiiiiiii(
      index,
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10
    ) {
      var sp = stackSave();
      try {
        return dynCall_jiiiiiiiiii(
          index,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9,
          a10
        );
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vijiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
        dynCall_vijiii(index, a1, a2, a3, a4, a5, a6);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vjjjiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
      var sp = stackSave();
      try {
        dynCall_vjjjiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    function invoke_vjiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
        dynCall_vjiiiii(index, a1, a2, a3, a4, a5, a6, a7);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    Module["addRunDependency"] = addRunDependency;
    Module["removeRunDependency"] = removeRunDependency;
    Module["FS_createPath"] = FS.createPath;
    Module["FS_createDataFile"] = FS.createDataFile;
    Module["ccall"] = ccall;
    Module["cwrap"] = cwrap;
    Module["stackTrace"] = stackTrace;
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function callMain(args = []) {
      var entryFunction = _main;
      args.unshift(thisProgram);
      var argc = args.length;
      var argv = stackAlloc((argc + 1) * 4);
      var argv_ptr = argv >> 2;
      args.forEach((arg) => {
        HEAP32[argv_ptr++] = stringToUTF8OnStack(arg);
      });
      HEAP32[argv_ptr] = 0;
      try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
      } catch (e) {
        return handleException(e);
      }
    }
    function run(args = arguments_) {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module);
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (shouldRunNow) callMain(args);
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
          setTimeout(function () {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    var shouldRunNow = true;
    if (Module["noInitialRun"]) shouldRunNow = false;
    run();

    return unityFramework.ready;
  };
})();
if (typeof exports === "object" && typeof module === "object")
  module.exports = unityFramework;
else if (typeof define === "function" && define["amd"])
  define([], function () {
    return unityFramework;
  });
else if (typeof exports === "object")
  exports["unityFramework"] = unityFramework;
