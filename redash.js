const RedashClient = require("redash-client");

module.exports = function(RED) {
  function RedashNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const redash = new RedashClient({
      endPoint: config.end_point,
      apiToken: config.api_token
    });

    node.on("input", function(msg) {
      const params = {
        query: config.query,
        data_source_id: config.data_source_id
      };

      redash
        .queryAndWaitResult(params, config.timeout * 1000)
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
