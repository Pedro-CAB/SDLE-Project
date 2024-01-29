// ObjectBuilderBase.js

class ObjectBuilderBase {
    constructor(material) {
        this.material = material;
    }

    build() {
        throw new Error("This method should be implemented by subclasses");
    }
}

export default ObjectBuilderBase;
