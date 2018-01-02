module.exports = function (RED) {

    "use strict";
    var mustache = require("mustache");

    var SSH = require('simple-ssh');



    function SimpleSSHNode(config) {


        RED.nodes.createNode(this, config);
        var node = this;
        node.ip = null;
        //var isTemplatedIP = (nodeIP||"").indexOf("{{") != -1;


        node.on('input', function (msg) {

            var preRequestTimestamp = process.hrtime();
            node.status({ fill: "blue", shape: "dot", text: "httpin.status.requesting" });

            node.ip = msg.ip || this.credentials.ip;
            if (msg.ip && this.credentials.ip && (this.credentials.ip !== msg.ip)) {  // revert change below when warning is finally removed
                node.warn(RED._("common.errors.nooverride"));
            }
            // if (isTemplatedIP) {
            //     ip = mustache.render( this.credentials.ip,msg);
            // }
            if (!node.ip) {
                node.error(RED._("httpin.errors.no-ip"), msg);
                return;
            }

            if (!this.credentials && !this.credentials.user && !this.credentials.password) {
                node.error(RED._("httpin.errors.no-auth"), msg);
                return;
            }

            var payload = null;

            var ssh = new SSH({
                host: node.ip,
                user: this.credentials.user,
                pass: this.credentials.password,
                port: this.credentials.port || 22
            });

            ssh
                .exec('', {
                    out: function (stdout) {
                        console.log(stdout);
                        node.send(stdout);
                    }
                }).start();



        });
    }
    RED.nodes.registerType("simple-SSH", SimpleSSHNode, {
        credentials: {
            ip: { type: "text" },
            port: { type: "text" },
            user: { type: "text" },
            password: { type: "password" }
        }
    });
}