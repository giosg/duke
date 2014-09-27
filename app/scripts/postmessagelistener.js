(function(window) {
    window.addEventListener("message", function(event) {
      if (event.source != window)
        return;
      if(event.data._type == 'GIOSGTOOLREQUEST') {
          window.postMessage({ _type: "GIOSGTOOLRESPONSE", query: event.data.query, response: window.giosg.apiConfig }, "*");
        }
    }, false);
})(window);