//structure for the transform
struct Transform {
    vec3 position;
    vec3 rotation;
    vec3 scale;
};

Transform defaultTransform() {
    Transform t;
    t.position = vec3(0.0, 0.0, 0.0);   // Default position
    t.rotation = vec3(0.0, 0.0, 0.0);   // Default rotation
    t.scale = vec3(1.0, 1.0, 1.0);      // Default scale
    return t;
}



//transforms the object in position, rotation and scale 
vec3 rot3D(vec3 pos, vec3 rot) {
    // Convert Euler angles to radians
    float yaw = radians(rot.y);   // Rotation around the Y-axis
    float pitch = radians(rot.x); // Rotation around the X-axis
    float roll = radians(rot.z);  // Rotation around the Z-axis

    // Rotation matrices for each axis
    mat3 rotX = mat3(
        1.0,       0.0,        0.0,
        0.0,  cos(pitch), -sin(pitch),
        0.0,  sin(pitch),  cos(pitch)
    );

    mat3 rotY = mat3(
        cos(yaw),  0.0, sin(yaw),
        0.0,       1.0,      0.0,
       -sin(yaw),  0.0, cos(yaw)
    );

    mat3 rotZ = mat3(
        cos(roll), -sin(roll), 0.0,
        sin(roll),  cos(roll), 0.0,
        0.0,        0.0,       1.0
    );

    // Combined rotation matrix: Roll * Pitch * Yaw
    mat3 rotMatrix = rotZ * rotY * rotX;

    // Apply the rotation
    return rotMatrix * pos;
}

vec3 applyTransform(vec3 pos, Transform transform) {
    pos = pos - transform.position;
    pos = rot3D(pos, transform.rotation);
    pos = pos / transform.scale;
    return pos;
}