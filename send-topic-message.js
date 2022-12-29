const {ServiceBusClient} = require("@azure/service-bus");

module.exports = function (RED) {
    "use strict";

    function SendTopicMessage(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.subscription = n.subscription;
        this.connectionString = n.connectionString;
        this.name = n.name;

        const node = this;

        // setup the sender
        if (!node.connectionString || !node.topic || !node.subscription) {
            node.status({
                fill: "gray",
                shape: "ring",
                text: "disconnected"
            });
            return;
        }

        const serviceBus = new ServiceBusClient(node.connectionString);
        const sender = serviceBus.createSender(node.topic, node.subscription);

        node.status({
            fill: "green",
            shape: "ring",
            text: "connected"
        });

        node.on("close", (done) => {
            node.log("Closing sender for " + node.subscription);
            sender.close();
            node.log("Closing service bus");
            serviceBus.close();
            done();
        });

        node.on("input", async (msg, send, done) => {
            const contentType = msg.message?.contentType || "application/json";

            try {
                await sender.sendMessages({
                    contentType: contentType,
                    body: msg.payload,
                    applicationProperties: msg.message?.properties
                });

                node.status({
                    fill: "green",
                    shape: "dot",
                    text: "OK"
                });

                if(done) {
                    done();
                }
            }
            catch(error) {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "error, see debug or output"
                });
                if(done) {
                    done(error);
                }
                else {
                    node.error(error, msg);
                }
            }

        });
    }

    RED.nodes.registerType("Azure Service Bus - Send Topic Message", SendTopicMessage);
}