const {ServiceBusClient} = require("@azure/service-bus");

module.exports = function (RED) {
    "use strict";

    function ReceiveQueueMessage(n) {
        RED.nodes.createNode(this, n);
        this.queue = n.queue;
        this.connectionString = n.connectionString;
        this.name = n.name;

        const node = this;

        // setup the receiver
        if (!node.connectionString || !node.queue) {
            node.status({
                fill: "gray",
                shape: "ring",
                text: "disconnected"
            });
            return;
        }

        const serviceBus = new ServiceBusClient(node.connectionString);
        const receiver = serviceBus.createReceiver(node.queue);

        node.on("close", (done) => {
            node.log("Closing receiver for " + node.subscription);
            receiver.close();
            node.log("Closing service bus");
            serviceBus.close();
            done();
        });

        async function onMessageReceived(message) {
            node.log(`Messages received. Body: ${JSON.stringify(message.body)} Content-Type: ${message.contentType}`);
            node.send({
                payload: message.body,
                topic: node.topic,
                message: {
                    contentType: message.contentType,
                    id: message.messageId,
                    subject: message.subject,
                    properties: message.applicationProperties
                }
            });
            node.status({
                fill: "green",
                shape: "dot",
                text: "receiving messages"
            });
        }

        async function onError(error) {
            node.log(`Error indicated: ${JSON.stringify(error)}`);
            node.error(error);
            node.status({
                fill: "red",
                shape: "ring",
                text: "error, see debug or outputs"
            });
        }

        function setupSubscriptions() {
            receiver.subscribe({
                processMessage: onMessageReceived,
                processError: onError
            });
            node.status({
                fill: "green",
                shape: "ring",
                text: "connected"
            });
        }

        if (!node.listen) {
            node.listen = true;
            setupSubscriptions();
        }

    }

    RED.nodes.registerType("Azure Service Bus - Receive Queue Message", ReceiveQueueMessage);
}