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
    sphereTransform.position = vec3(sin(iTime), cos(iTime), 0);
    float sphere = sdSphere(applyTransform(worldPos, sphereTransform), 1.);

    //Create boxes
    vec3 repeatedPos = worldPos + vec3(0. ,0., iTime);
    repeatedPos = (fract(repeatedPos) - .5);

    Transform boxTransform = defaultTransform();
    boxTransform.rotation = vec3(iTime * 20.);
    
    //cube SDF's
    float box = sdRoundBox(applyTransform(repeatedPos, boxTransform), vec3(0.15), .02);
    float roundbox = sdSphere(applyTransform(repeatedPos, boxTransform), 0.1);

    // switches between 2 SDF's
    float rawT = 0.5 + 0.5 * sin(iTime * 1.);
    float t = smoothstep(0., 1., rawT);
    float shiftingCube = mix(roundbox, box, t);

    // final scene output
    return opSmoothUnion(sphere, shiftingCube, .25);
}

//Fragment
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from -1 to 1)
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
    vec3 col = vec3(0);
    
    // min amount of distance to object and max distance
    vec2 cameraNearFar = vec2(.01, 100.);
    
    //camera position and rotation
    Transform cameraTransform = defaultTransform();
    cameraTransform.position = vec3(0., 0., -3.);
    cameraTransform.rotation = rot3D(normalize(vec3(uv * 1., 1)), vec3(0.,0.,iTime * 5.));
    
    //total distance travelled by ray
    float rayDistance = 0.;
    
    //ray marching
    int i;
    int itterations = 100;
    for (i = 0; i < itterations; i++){
    
        //Current point of ray in this itteration
        vec3 rayPos = cameraTransform.position + cameraTransform.rotation * rayDistance;

        // distance to closest object in scene
        float distance = scene(rayPos);

        //add the distance of the current march to the total distance
        rayDistance += distance;
        
        //check if very close to object or of exceeded far distance
        if(distance < cameraNearFar.x || rayDistance > cameraNearFar.y) break;
    }
    
    // coloring
    float depthNormalized = rayDistance * 7. / float(itterations);

    col = vec3(palette(depthNormalized));
    float edgeDetect = .7 + (float(i) / float(itterations));

    col *= vec3(edgeDetect);

    // Output to screen
    fragColor = vec4(col, 1);
}