# three.js.test

a test-page for displaying 3d-models with three.js/webGL

- npm install three
- you need a webserver or model will not load !

# Findings about Blender .glb-export
- blender-modifiers (mirror,...) need to be applied or will not show up
- only 1 UVmask per mesh; remove unused UVs
- not all shaderoperations possible?; use PrincipledBSDF

- Animations have name of Action Clip (doubleclick in Treeview to edit Armature->Animation->NLATracks->NLATrack->Action Clip)
- Animations are not exported if muted in NLA Editor?

- Drivers usable? input can be bone-position, bone-attribute ?
- transparency?