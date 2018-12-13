class Container {
    constructor(id, name, status, image) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.image = image;
    }

    equals(container) {
        return container.id === this.id;
    }

}