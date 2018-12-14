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

}