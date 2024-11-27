#include "Transformation.glsl"
#include "SDFS.glsl"
#include "SDF_operators.glsl"

// cosine based palette, 4 vec3 params
vec3 palette(float t)
{
    vec3 a = vec3(0.681, 0.768, 0.968);
    vec3 b = vec3(0.245, 0.764, 0.721);
    vec3 c = vec3(1.202, 0.362, 0.660);
    vec3 d = vec3(0.481, 3.592, 5.705);

    return a + b*cos( 6.283185*(c*t+d) );
}

//Scene
float scene(vec3 worldPos) {
    // Create Sphere
    Transform sphereTransform = defaultTransform();
    sphereTransform.position = vec3(0, 0, 0);
    float sphere = sdSphere(applyTransform(worldPos, sphereTransform), 1.);


    //Create box
    Transform boxTransform = defaultTransform();
    vec3 newPos = worldPos + vec3(0, 0, iTime * 2.5);
    vec3 repeatedPos = (fract(newPos) - .5);
    boxTransform.rotation = vec3(iTime * 30.0,iTime * 30.0,iTime * 30.0);
    float box = sdRoundBox(applyTransform(repeatedPos, boxTransform), vec3(.15 + sin(iTime * 2.5) * .05), 0.05);

    return opSmoothUnion(sphere,box, .4);;
}

//Fragment
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from -1 to 1)
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
    vec3 col = vec3(0);
    
    vec2 cameraNearFar = vec2(.01, 10.);
    
    //camera position and rotation
    Transform cameraTransform = defaultTransform();
    cameraTransform.position = vec3(0.,0.,-3.);
    vec3 relativeRot = vec3(0., 0., iTime * 10.);
    cameraTransform.rotation = rot3D(normalize(vec3(uv * 1.,1)), relativeRot);
    
    //total distance travelled by ray
    float rayDistance = 0.;
    
    //ray marching
    int i;
    for (i = 0; i < 80; i++){
    
        //Current point of ray in this itteration
        vec3 rayPos = cameraTransform.position + cameraTransform.rotation * rayDistance;

        // distance to closest object in scene
        float distance = scene(rayPos);

        //add the distance of the current march to the total distance
        rayDistance += distance;
        
        //check if very close to object or of exceeded far distance
        if(distance < cameraNearFar.x || rayDistance > cameraNearFar.y) break;
    }
    
    // colloring
    col = vec3(palette(rayDistance / cameraNearFar.y));
    col = col * vec3(max(.5,1. - float(i) / 80.));
    
    // Output to screen
    fragColor = vec4(col, 1);
}