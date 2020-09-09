(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';

  // usando arrow functions para os métodos auxiliares, abaixo exemplo de uma
  const helloWorld = () => 'Hello World!';

  // seria análogo à escrever da maneira
  function helloWorld2 () {
    return 'Hello World';
  }

  // usar earclipping pra triangularizar graficos
  const rastComplexPolygon = () => {
    return false;
  }

  // parametrica serve para gerar pontos x1 = r * cos(teta) + h | x2 = r * sen(teta) + k
  // gerando vértices para transformar o círculo em triângulos.
  const parametrica = (raio, pontos = 10) => {
    const vertices = [];
    const twoPi = Math.PI * 2;

    for(let i = 0; i <= pontos; i++){
      const x1 = Math.round(raio * Math.cos(((twoPi * i) / pontos)));
      const x2 = Math.round(raio * Math.sin(((twoPi * i) / pontos)))

      vertices.push([x1, x2])
    }

    return vertices;
  }
  
  // transforma o círculo em triângulos
  const circleToTriangles = (primitive, pontos = 10) => {
    const triangles = [];

    const { center } = primitive;
    const vertices = parametrica(primitive.radius, pontos);
  
    for(let i = 0; i < vertices.length-1; i++){
      triangles.push({  
        shape: "triangle",
        vertices: [ 
          [ center[0], center[1] ],
          [ center[0] + vertices[i][0],  center[1] + vertices[i][1] ],
          [ center[0] + vertices[i+1][0], center[1] + vertices[i+1][1] ]
        ],
        color: primitive.color    
      })
    }
    
    return triangles;
  }

  // equação implicíta da reta:
  // (x1 - h)^2 + (x2 - k)^2 = r^2 se p está na borda || < r^2 no interior || > r^2 no exterior

  const rastCircle = (x, y, r, center) => {
    const k = center[0];
    const h = center[1];
    const result = (x - k)**2 + (y - h)**2 ;

    if(result > r**2) return false;
    return true
  }

  const parseVertices = (array) => {
    const vertices = [];

    for(let i = 0; i < array.length; i += 2){
      vertices.push([array[i], array[i+1]])
    }

    return vertices;
  }

  const buildVectors = (vertices) => {
    if(vertices.length === 2) {
      return [vertices[0][0] - vertices[1][0], vertices[0][1] - vertices[1][1]];
    }
    
    const vectors = [];
  
    for (let i = 0; i < vertices.length; i++){
      if(i+1 === vertices.length){
        vectors.push([vertices[0][0] - vertices[i][0], vertices[0][1] - vertices[i][1]]);
      } else {
        vectors.push([vertices[i+1][0] - vertices[i][0], vertices[i+1][1] - vertices[i][1]]);
      }
    }

    return vectors;
  }

  const innerProduct = (v1, v2) => (v1[0] * v2[0]) + (v1[1] * v2[1]);

  const rastSimplePolygon = (x, y, primitive) => {
    const {vectors, vertices} = primitive;

    for(let i = 0; i < vertices.length; i++){
      const q = buildVectors([[x, y], vertices[i]])
      const n = [(-1) * vectors[i][1], vectors[i][0]];

      if(innerProduct(q, n) < 0) return false;
    }

    return true;
  };

  function inside(x, y, primitive) {
    switch(primitive.shape){
      case 'circle':
        return rastCircle(x, y, primitive.radius, primitive.center);
      case 'polygon':
        return rastSimplePolygon(x, y, primitive);
      default:
        return rastSimplePolygon(x, y, primitive);
    }
  }
      
  const boundingBox = (vertices) => {
    let xStart = 99999999, yStart = 99999999, xEnd = 0, yEnd = 0;

    for(const vertice of vertices){
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
    if (primitive.shape === 'circle') {
      if (primitive.center.selection) {
        primitive.center = primitive.center.selection.data;
      }

      return { 
        x: {
          start: primitive.center[0] - primitive.radius,
          end: primitive.center[0] + primitive.radius, 
        },
        y: {
          start: primitive.center[1] - primitive.radius,
          end: primitive.center[1] + primitive.radius,
        }
      };
    }

    if(primitive.vertices.selection) {
      primitive.vertices = parseVertices(primitive.vertices.selection.data);
    }

    primitive.vectors = buildVectors(primitive.vertices);        
    return boundingBox(primitive.vertices);
  }

  function Screen ( width, height, scene ) {
    this.width = width;
    this.height = height;
    this.scene = this.preprocess(scene);   
    this.createImage(); 
  }

  Object.assign( Screen.prototype, {

    preprocess: function(scene) {
      const newScene = [];

      for (let i = 0; i < scene.length; i++){
        let primitive = scene[i];

        if(primitive.shape === 'circle'){
          primitive.center = primitive.center.selection.data;

          // usando 10 pontos na função que transforma para triangulo para ficar mais evidente a transformação
          const triangles = circleToTriangles(primitive, 10);
          newScene.push(...triangles);
        } else {
          newScene.push(scene[i]);
        }

      }

      // Descomentar a linha abaixo para usar os círculos transformatos em triangulos
      // scene = newScene;

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
        // usando o bounding box como limites para os loops
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
      console.log('vertices =', primitive.vertices);
      console.log('vectors =', primitive.vectors);
      console.log('center =', primitive.center);
      console.log('limits =', primitive.boundingBox);
      console.log('FIM DA RASTERIZAÇÃO')
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
  });

  exports.Screen = Screen;
})));
