class Container {
    constructor(id, name, status, image) {
        this.name = name;
        this.id = id;
        this.status = status;
        this.image = image;
    }

    equals(container) {
        return container.id === this.id;
    }

    getPortsAsString() {
        var portString = "";
        for (var port in ports) {
            portString += port.privatePort + ":" + port.publicPort;
            portString += " ";
        }
        return portString;
    }
}