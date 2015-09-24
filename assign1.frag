//============================================================
// STUDENT NAME: <your name>
// MATRIC NO.  : <matric no.>
// NUS EMAIL   : <your NUS email address>
// COMMENTS TO GRADER:
// <comments to grader, if any>
//
//============================================================
//
// FILE: assign1.frag


//============================================================================
// Eye-space position and vectors for setting up a tangent space at the fragment.
//============================================================================

varying vec3 ecPosition;    // Fragment's 3D position in eye space.
varying vec3 ecNormal;      // Fragment's normal vector in eye space.
varying vec3 ecTangent;     // Frgament's tangent vector in eye space.


//============================================================================
// TileDensity specifies the number of tiles to span across each dimension when the
// texture coordinates gl_TexCoord[0].s and gl_TexCoord[0].t range from 0.0 to 1.0.
//============================================================================

uniform float TileDensity;  // (0.0, inf)


//============================================================================
// TubeRadius is the radius of the semi-circular mirror tubes that run along 
// the boundary of each tile. The radius is relative to the tile size, which 
// is considered to be 1.0 x 1.0.
//============================================================================

uniform float TubeRadius;  // (0.0, 0.5]


//============================================================================
// StickerWidth is the width of the square sticker. The entire square sticker 
// must appear at the center of each tile. The width is relative to the 
// tile size, which is considered to be 1.0 x 1.0.
//============================================================================

uniform float StickerWidth;  // (0.0, 1.0]


//============================================================================
// EnvMap references the environment cubemap for reflection mapping.
//============================================================================

uniform samplerCube EnvMap;


//============================================================================
// DiffuseTex1 references the wood texture map whose color is used to 
// modulate the ambient and diffuse lighting components on the non-mirror and
// non-sticker regions.
//============================================================================

uniform sampler2D DiffuseTex1;


//============================================================================
// DiffuseTex2 references the sticker texture map whose color is used to 
// modulate the ambient and diffuse lighting components on the sticker regions.
//============================================================================

uniform sampler2D DiffuseTex2;



vec4 getFragColorWithTexture(vec4 textureColor, float N_dot_L, float pf)
{
    vec4 scene_ambient_diffuse = textureColor * 
                                (gl_FrontLightModelProduct.sceneColor + 
                                gl_LightSource[0].ambient * gl_FrontMaterial.ambient + 
                                gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * N_dot_L);
    // Including specular
    return scene_ambient_diffuse + (gl_LightSource[0].specular * gl_FrontMaterial.specular * pf);
}

void main()
{
    vec2 c = TileDensity * gl_TexCoord[0].st;
    vec2 p = fract( c ) - vec2( 0.5 );

    // Some useful eye-space vectors.
    vec3 ecNNormal = normalize( ecNormal );
    vec3 ecViewVec = -normalize( ecPosition );

    vec3 ecLightPos = vec3(gl_LightSource[0].position);
    vec3 ecLightVec = normalize(ecLightPos - ecPosition);
    vec3 halfVector = normalize( ecLightVec + ecViewVec );

    vec4 woodColor =  texture2D(DiffuseTex1, gl_TexCoord[0].st);

    if (dot(ecNNormal, ecViewVec) < 0.0)
    {
        //======================================================================
        // In here, fragment is backfacing or in the non-bump region.
        //======================================================================

        // For the lighting computation, use the half-vector approach 
        // to compute the specular component.

        // Emission and ambient and diffuse.

        ///////////////////////////
        // WRITE YOUR CODE HERE. //
        ///////////////////////////
        float N_dot_L   = max(0.0, dot(-ecNormal, ecLightVec));
        float N_dot_H   = max(0.0, dot(-ecNormal, halfVector));

        float pf = ( N_dot_H == 0.0 ) ? 0.0 : pow( N_dot_H, gl_FrontMaterial.shininess );
        gl_FragColor = getFragColorWithTexture(woodColor, N_dot_L, pf);
    }
    else
    {
        //======================================================================
        // In here, fragment is front-facing and in the mirror-like bump region.
        //======================================================================

        vec3 N = ecNNormal;
        vec3 B = normalize( cross( N, ecTangent ) );
        vec3 T = cross( B, N );

        vec3 tanPerturbedNormal;  // The perturbed normal vector in tangent space of fragment.
        vec3 ecPerturbedNormal;   // The perturbed normal vector in eye space.
        vec3 ecReflectVec;        // The mirror reflection vector in eye space.

        ///////////////////////////
        // WRITE YOUR CODE HERE. //
        ///////////////////////////
        float N_dot_L   = max(0.0, dot(ecNormal, ecLightVec));
        float N_dot_H   = max(0.0, dot(ecNormal, halfVector));

        float pf = ( N_dot_H == 0.0 ) ? 0.0 : pow( N_dot_H, gl_FrontMaterial.shininess );
        // if the point is on the sticker
        if (abs(p.x) <= StickerWidth / 2.0 && abs(p.y) <= StickerWidth / 2.0) 
        {
            vec2 stickerCoord = p / StickerWidth + vec2(0.5);
            vec4 stickerColor = texture2D(DiffuseTex2, stickerCoord);
            gl_FragColor = getFragColorWithTexture(stickerColor, N_dot_L, pf);
        }
        // if the point is on the mirror
        else if (abs(p.x) >= 0.5 - TubeRadius || abs(p.y) >= 0.5 - TubeRadius)
        {   
            if (abs(p.x) > abs(p.y)) 
            {
                float x = (abs(p.x) - 0.5) / TubeRadius;
                float z = sqrt(1.0 - x * x);
                if (p.x < 0.0) x = -x;
                tanPerturbedNormal = normalize(vec3(x, 0, z));
            }
            else // abs(p.x) <= abs(p.y) 
            {
                float y = (abs(p.y) - 0.5) / TubeRadius;
                float z = sqrt(1.0 - y * y);
                if (p.y < 0.0) y = -y;
                tanPerturbedNormal = normalize(vec3(0, y, z));
            }
            ecPerturbedNormal = normalize(gl_NormalMatrix * tanPerturbedNormal);
            ecReflectVec = reflect(-ecViewVec, ecPerturbedNormal);
            gl_FragColor = textureCube(EnvMap, ecReflectVec);
        } 
        else // the point is wooden
        {
            gl_FragColor = getFragColorWithTexture(woodColor, N_dot_L, pf);
        }
    }
}