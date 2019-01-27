/**
 * Wrapper class to store all necessary information about
 * a single Image object.
 * Information that need to be provided are name, size and status.
 */
class Image {
    constructor(name, size, status) {
        this.name = name;
        this.size = size;
        this.status = status;
    }
}