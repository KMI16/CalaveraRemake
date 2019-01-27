/**
 * Wrapper class to store all necessary information about a
 * single container object. Information that need to be
 * provived are id, name, status and the name of the base image.
 */
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