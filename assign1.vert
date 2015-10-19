//============================================================
// STUDENT NAME: Zhou Yichen
// MATRIC NO.  : A0113598X
// NUS EMAIL   : zhouyichen@u.nus.edu
// COMMENTS TO GRADER:
// Thanks for grading!
//
//============================================================
//
// FILE: assign1.vert


varying vec3 ecPosition; // Vertex's position in eye space.
varying vec3 ecNormal;   // Vertex's normal vector in eye space.
varying vec3 ecTangent;  // Vertex's tangent vector in eye space.

attribute vec3 Tangent;  // Input vertex's tangent vector in model space.


void main( void )
{
	ecPosition = vec3(gl_ModelViewMatrix * gl_Vertex);
	ecNormal = normalize(gl_NormalMatrix * gl_Normal);
	ecTangent = normalize(gl_NormalMatrix * Tangent);

	gl_TexCoord[0]  = gl_MultiTexCoord0;
	gl_Position     = ftransform();
}
