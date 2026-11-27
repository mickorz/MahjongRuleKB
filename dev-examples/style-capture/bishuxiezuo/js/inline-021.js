
  (function () {
    try {
      var tokens = JSON.parse(localStorage.getItem("lf_tokens") || "null");
      if (!tokens || !(tokens.access_token || tokens.accessToken)) {
        window.location.replace("/login.html");
      }
    } catch (e) {
      window.location.replace("/login.html");
    }
  })();
