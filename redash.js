const RedashClient = require("redash-client");

module.exports = function(RED) {
  function RedashNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const redash = new RedashClient({
      endPoint: msg.end_point || config.end_point,
      apiToken: msg.api_token || config.api_token
    });
    const timeout = (msg.timeout || config.timeout) * 1000;

    node.on("input", function(msg) {
      const params = {
        query: msg.query || config.query,
        data_source_id: msg.data_source_id || config.data_source_id
      };

      redash
        .queryAndWaitResult(params, timeout)
        .then(resp => {
          const data = resp.query_result.data;
          data.rows.forEach(row => {
            msg.payload = {
              columns: data.columns,
              row: row
            };
            node.send(msg);
          });
        })
        .catch(e => {
          node.error(e);
        });
    });
  }
  RED.nodes.registerType("redash", RedashNode);
};
