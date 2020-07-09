$(document).ready(function () {

  (function ($) {
    // Created by Bert Austin (Technical Team Lead)

    // Ideally the sessionTimeoutHandler() will be moved into a common file down the road

    // Status: Prototype that needs testing

    sessionTimeoutHandler = function (options) {
      "use strict";

      var defaults = {
          // Session lifetime (milliseconds)

          sessionLifetime: 10 * 60000,

          // Minimum time between pings to the server (milliseconds)

          minPingInterval: 1 * 60 * 1000,

          // Space-separated list of events passed to $(document).on() that indicate a user is active

          activityEvents: "mouseup mouseup touchend",

          // URL used to log out when the user clicks a "Log out" button

          logoutUrl: "/LoginV2/SessionTimeOut",

          // URL used to log out when the session times out

          timeoutUrl: "/LoginV2/SessionTimeOut",

          logout: function () {
            // Go to the logout page.

            window.location.href = self.logoutUrl;
          },

          ontimeout: function () {
            // Go to the timeout page.

            window.location.href = self.timeoutUrl;
          },
        },
        self = {},
        _expirationTimeoutID,
        // The time of the last ping to the server.

      function _resetTimers() {
        // Reset the session warning and session expiration timers.
        window.clearTimeout(_expirationTimeoutID);

        _expirationTimeoutID = window.setTimeout(
          _onTimeout,
          self.sessionLifetime
        );
      }

      function _onTimeout() {
        // A wrapper that calls onbeforetimeout and ontimeout and supports asynchronous code.

        $.when(self.onbeforetimeout()).always(self.ontimeout);
      }

      // Add default variables and methods, user specified options, and non-overridable

      // public methods to the session monitor instance.

      $.extend(self, defaults, options);

      // Set an event handler to extend the session upon user activity (e.g. mouseup).

      $(document).on(self.activityEvents);

      // Start the timers and ping the server to ensure they are in sync with the backend session expiration

      return self;
    };

    // Calling the sessionTimeoutHandler using default settings

    sessMon = sessionTimeoutHandler();

    window.sessMon = sessMon;
  })(jQuery);
});
