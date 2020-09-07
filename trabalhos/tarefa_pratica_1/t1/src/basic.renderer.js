(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';
    
    const rastPolygon = () => {

    }

    const rastCircle = (x, y, r, center) => {
        var k = center[0];
        var h = center[1];

        var result = (x - h)**2 + (y - k)**2;
        
        if( result > r**2) return false;

        return true
    }

    function rastTriangle(x, y, vertices) {

    };

    function inside(x, y, primitive) {
        switch(primitive.shape){
            case 'circle':
                return rastCircle(x, y, primitive.radius, primitive.center);
            case 'polygon':
                return true
             default:
                return false;
        }
    }
        
    const boundingBox = (vertices) => {
        let xStart = 99999999, yStart = 99999999, xEnd = 0, yEnd = 0;

        for(const vertice of vertices){
            console.log(`vertice = ${vertice}`);
            xStart = xStart < vertice[0] ? xStart : vertice[0];
            xEnd = xEnd > vertice[0] ? xEnd : vertice[0];

            yStart = yStart < vertice[1] ? yStart : vertice[1];
            yEnd = yEnd > vertice[1] ? yEnd : vertice[1]
        }

        return {
            x: {
                start: xStart,
                end: xEnd,
            },
            y: {
                start: yStart,
                end: yEnd,
            }
        };
    }

    const limits = (primitive) => {
        if(primitive.shape === 'circle') {
            const limits = {};
            primitive.center = primitive.center.selection.data;

            limit = { 
                x: {
                    start: primitive.center[0] - primitive.radius,
                    end: primitive.center[0] + primitive.radius, 
                },
                y: {
                    start: primitive.center[1] - primitive.radius,
                    end: primitive.center[1] + primitive.radius,
                }
            };

            return limits;
        }

        primitive.vertices = parseVertices(primitive.vertices.selection.data);        
        return boundingBox(primitive.vertices);
    }

    const parseVertices = (array) => {
        const vertices = [];

        for(let i = 0; i < array.length; i += 2){
            vertices.push([array[i], array[i+1]])
        }

        return vertices;
    }

    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);   
        this.createImage(); 
    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc
    
                var preprop_scene = [];

                for( var primitive of scene ) {  
                    primitive.boundingBox = limits(primitive);
                    preprop_scene.push( primitive );
                }
                
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;
         
                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {
                    const limits = primitive.boundingBox;
                    
                    for (var i = limits.x.start; i < limits.x.end; i++) {
                        var x = i + 0.5;

                        for( var j = limits.y.start; j < limits.y.end; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive 
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = primitive.color;
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }
                }
                
               
              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }
    );

    exports.Screen = Screen;
    
})));

