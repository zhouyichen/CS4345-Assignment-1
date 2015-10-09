//============================================================
// STUDENT NAME: <your name>
// MATRIC NO.  : <matric no.>
// NUS EMAIL   : <your NUS email address>
// COMMENTS TO GRADER:
// <comments to grader, if any>
//
// ============================================================
//
// FILE: assign2.frag


// The GL_EXT_gpu_shader4 extension extends GLSL 1.10 with 
// 32-bit integer (int) representation, integer bitwise operators, 
// and the modulus operator (%).

#extension GL_EXT_gpu_shader4 : require

#extension GL_ARB_texture_rectangle : require


uniform sampler2DRect InputTex;  // The input texture.

uniform int TexWidth;   // Always an even number.
uniform int TexHeight;

uniform int PassCount;  // For the very first pass, PassCount == 0.


void main()
{
    float P1 = texture2DRect( InputTex, gl_FragCoord.xy ).a;
    float P2;

    if ( PassCount % 2 == 0 )  // PassCount is Even.
    {

        //***********************************************
        //*********** WRITE YOUR CODE HERE **************
        //***********************************************
		int row = int(gl_FragCoord.y);
		int column = int(gl_FragCoord.x);
		vec2 p2Coord;
		if (column % 2 == 0) // the index is even
		{
			p2Coord = vec2(column + 1, row);
			P2 = texture2DRect(InputTex, p2Coord).a;
			gl_FragColor = vec4(min(P1, P2));
		}
		else // the index is odd
		{
			p2Coord = vec2(column - 1, row);
			P2 = texture2DRect(InputTex, p2Coord).a;
			gl_FragColor = vec4(max(P1, P2));
		}

    }

    else  // PassCount is Odd.
    {
        int row = int( gl_FragCoord.y );
        int column = int( gl_FragCoord.x );
        int index1D = row * TexWidth + column;

        //***********************************************
        //*********** WRITE YOUR CODE HERE **************
        //***********************************************

		// if it is the first or last element, just return its value
		if (index1D == 0 || index1D == TexWidth * TexHeight - 1) {
			gl_FragColor = vec4(P1);
		}

		else { // for all the other normal elements in the middle
			if (index1D % 2 == 0) // the index is even
			{
				int p2Index1D = index1D - 1;
				vec2 p2Coord = vec2(p2Index1D % TexWidth, p2Index1D / TexWidth);
				P2 = texture2DRect(InputTex, p2Coord).a;
				gl_FragColor = vec4(max(P1, P2));
			}
			else // the index is odd
			{
				int p2Index1D = index1D + 1;
				vec2 p2Coord = vec2(p2Index1D % TexWidth, p2Index1D / TexWidth);
				P2 = texture2DRect(InputTex, p2Coord).a;
				gl_FragColor = vec4(min(P1, P2));
			}
		}
    }
}
