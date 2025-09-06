(function () {
  // Provide global alias for tests that expect Node-like globals
  if (!window.global) {
    window.global = window;
  }
  if (!window.process) {
    window.process = { env: {} };
  }

  // Basic Notification polyfill for tests (if not present)
  if (!window.Notification) {
    window.Notification = {
      permission: 'granted',
      requestPermission: function () { return Promise.resolve('granted'); }
    };
  }
})();

