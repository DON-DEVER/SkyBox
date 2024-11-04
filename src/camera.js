export class Camera {
    cameraZ = 12;
    camera = new pc.Entity();
    constructor(app) {
        this.app = app;
        this.camera.addComponent("camera", {
        clearColor: new pc.Color(17 / 255, 17 / 255, 33 / 255)
        });
        this.camera.setLocalPosition(12, 7, 12);
        this.camera.lookAt(new pc.Vec3(0, 1, 0));
        this.app.root.addChild(this.camera);
    }
    updateCameraZ() {
        this.cameraZ = 12 + (this.camera.getPosition().y / 20);
        this.camera.setLocalPosition(12, this.camera.getPosition().y, this.cameraZ);
    }

    getEntity() {
        return this.camera;
    }
}
