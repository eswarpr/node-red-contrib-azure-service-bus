const {ServiceBusClient} = require("@azure/service-bus");

module.exports = function (RED) {
    "use strict";

    /**
     * A node-red node to receive messages from an Azure Service Bus Queue
     * @param n
     * @constructor
     */
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
                topic: node.queue,
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


    /**
     * A node-red node to receive messages from an Azure Service Bus Topic
     * @param n
     * @constructor
     */
    function ReceiveTopicMessage(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.subscription = n.subscription;
        this.connectionString = n.connectionString;
        this.name = n.name;

        const node = this;

        // setup the receiver
        if (!node.connectionString || !node.topic || !node.subscription) {
            node.status({
                fill: "gray",
                shape: "ring",
                text: "disconnected"
            });
            return;
        }

        const serviceBus = new ServiceBusClient(node.connectionString);
        const receiver = serviceBus.createReceiver(node.topic, node.subscription);

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

    RED.nodes.registerType("Azure Service Bus - Receive Topic Message", ReceiveTopicMessage);

    /**
     * A node-red node to send a message to an Azure Service Bus Queue
     * @param n
     * @constructor
     */
    function SendQueueMessage(n) {
        RED.nodes.createNode(this, n);
        this.queue = n.queue;
        this.connectionString = n.connectionString;
        this.name = n.name;

        const node = this;

        // setup the sender
        if (!node.connectionString || !node.queue) {
            node.status({
                fill: "gray",
                shape: "ring",
                text: "disconnected"
            });
            return;
        }

        const serviceBus = new ServiceBusClient(node.connectionString);
        const sender = serviceBus.createSender(node.queue);

        node.status({
            fill: "green",
            shape: "ring",
            text: "connected"
        });

        node.on("close", (done) => {
            node.log("Closing sender for " + node.queue);
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

    RED.nodes.registerType("Azure Service Bus - Send Queue Message", SendQueueMessage);

    /**
     * A node-red node to send a message to an Azure Service Bus Topic
     * @param n
     * @constructor
     */
    function SendTopicMessage(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.connectionString = n.connectionString;
        this.name = n.name;

        const node = this;

        // setup the sender
        if (!node.connectionString || !node.topic) {
            node.status({
                fill: "gray",
                shape: "ring",
                text: "disconnected"
            });
            return;
        }

        const serviceBus = new ServiceBusClient(node.connectionString);
        const sender = serviceBus.createSender(node.topic);

        node.status({
            fill: "green",
            shape: "ring",
            text: "connected"
        });

        node.on("close", (done) => {
            node.log("Closing sender for " + node.topic);
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