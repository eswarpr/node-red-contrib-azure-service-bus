# @eswarpr/node-red-contrib-azure-service-bus

A set of [Node-RED](https://nodered.org) nodes to send and receive [Azure Service Bus](https://azure.microsoft.com/en-gb/products/service-bus/)
messages. You will need access to a valid [Microsoft Azure](https://azure.microsoft.com/en-gb/) subscription and Azure Service Bus
deployed in it to use this node.

# Install

Either use the Node-RED Menu -> Manage Palette option to install, or run the following command in your Node-RED user directory - 
typically ``~/.node-red``

``
npm i @eswarpr/node-red-contrib-azure-service-bus
``

# Usage
**Note:** Please ensure that you have a valid Azure Service Bus subscription at hand
before using this node.

## Azure Service Bus - Receive Topic Message
Generates a ``msg.payload`` set to the body of the message received
from service bus.

### Outputs
- ``msg.topic`` - _string_ - the service bus topic that was the source of the message
- ``msg.payload`` - _any_ - the contents of the message that was received from service bus
- ``msg.message`` - _object (see below)_ - additional information about the message

The ``msg.message`` will be set to an object containing the following additional data:
- ``contentType`` - _string_ - the MIME type of the received message, as specified at the source.
- ``id`` - _string_ - the unique ID of the message as specified at the source.
- ``subject`` - _string_ - the subject of the message as specified at the source.
- ``properties`` - _object_ - additional message metadata specified at the source.

## Azure Service Bus - Send Topic Message
Generates and sends a service bus message to the topic specified in the configuration of the node.

### Input
- ``msg.payload`` - _any_ - the message to send
- ``msg.message`` - _object (see below)_ - additional information about the message

The ``msg.message`` property can be setup with the following additional information, which will
passed without changes to service bus as a part of the sent message:
- ``contentType`` - _string_ - the MIME type of the message contents
- ``properties`` - _object_ - additional metadata for the message
- 