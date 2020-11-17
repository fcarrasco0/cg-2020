(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';

  // ======  pequena observação sobre alguns padrões usados ======

  // usando arrow functions para os métodos auxiliares, abaixo exemplo de uma
  const helloWorld = () => 'Hello World!';

  // seria análogo à escrever da maneira
  function helloWorld2 () {
    return 'Hello World';
  }

  //  ================= fim das observação =======================

  // usar earclipping pra triangularizar poligonos
  const rastComplexPolygon = () => {
    return false;
  }

  // parametrica serve para gerar pontos: x1 = r * cos(teta) + k | x2 = r * sen(teta) + h
  // gerando vértices para transformar o círculo em triângulos.
  const parametrica = (primitive, pontos = 10) => {
    const vertices = [];
    const twoPi = Math.PI * 2;
    const { center, radius } = primitive

    for(let i = 0; i <= pontos; i++){
      // multiplicando 2 pi por i e dividindo pelo número de pontos para  o intervalo de [0,2pi] onde:
      //  i = 0 equivale a pi = 0 
      //  i = pontos equivale à 2 pi;
      const teta = (twoPi * i) / pontos;

      const x1 = Math.round(radius * Math.cos(teta)) + center[0];
      const x2 = Math.round(radius * Math.sin(teta)) + center[1];

      vertices.push([x1, x2])
    }

    return vertices;
  }
  
  // transforma o círculo em triângulos
  const circleToTriangles = (primitive, pontos = 10) => {
    const triangles = [];

    const { center } = primitive;
    const vertices = parametrica(primitive, pontos);
  
    for(let i = 0; i < vertices.length-1; i++){
      var baseStartX, baseEndX;
      var baseStartY, baseEndY;

      if(vertices[i][0] < vertices[i+1][0]){
        baseStartX = vertices[i][0];
        baseEndX = vertices[i+1][0];
      } else {
        baseStartX = vertices[i+1][0];
        baseEndX = vertices[i][0];
      }

      if(vertices[i][1] < vertices[i+1][1]){
        baseStartY = vertices[i][1];
        baseEndY = vertices[i+1][1];
      } else {
        baseStartY = vertices[i+1][1];
        baseEndY = vertices[i][1];
      }

      triangles.push({  
        shape: 'triangle',
        originalShape: 'circle',
        vertices: [ 
          [ center[0], center[1] ],
          [ vertices[i][0], vertices[i][1] ],
          [ vertices[i+1][0], vertices[i+1][1] ]
        ],
        color: primitive.color,
        baseStartX,
        baseEndX,
        baseStartY,
        baseEndY,
        initialColor: Object.assign({}, primitive.color.T.selection.data)
      })
    }

    return triangles;
  }

  // rasterização de círculos usando equação implicíta da reta:
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
      yEnd = yEnd > vertice[1] ? yEnd : vertice[1];
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

  const antiAliasing = (x, y, i, j, primitive) => {
    var colorWeight = 0;

    if(inside( x - 0.5, y, primitive)) colorWeight += 0.25;
    if(inside( x + 0.5, y, primitive)) colorWeight += 0.25;
    if(inside( x, y - 0.5, primitive)) colorWeight += 0.25;
    if(inside( x, y + 0.5, primitive)) colorWeight += 0.25;
    
    if(colorWeight != 0) {
      var color = primitive.color;
      var originalColor = Object.assign({}, primitive.initialColor);

      if (colorWeight != 1) {
        var colorAverage = 240;
        
        // On RGB the lesser the value the more dark the color will be
        // to fix this, the operation (1 - colorWeight) is made
        originalColor[0] += (originalColor[0] || colorAverage) * (1 - colorWeight);
        originalColor[1] += (originalColor[1] || colorAverage) * (1 - colorWeight);
        originalColor[2] += (originalColor[2] || colorAverage) * (1 - colorWeight);
      }
      
      color.T.selection.data[0] = originalColor[0];
      color.T.selection.data[1] = originalColor[1];
      color.T.selection.data[2] = originalColor[2];

      return color;
    }

    return false;
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
        primitive.initialColor = Object.assign({}, primitive.color.T.selection.data);
        
        if(primitive.shape === 'circle'){
          primitive.center = primitive.center.selection.data;

          // usando o tamanho do raio para quantidade de pontos na triangularização do circulo
          const triangles = circleToTriangles(primitive, 20);
          newScene.push(...triangles);
        } else {
          newScene.push(scene[i]);
        }

      }

      // comentar a linha abaixo para usar a rasterização normal do círculo, sem triangulizar
      scene = newScene;

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
      console.log('INICIO DA RASTERIZAÇÃO', new Date().toISOString())
      var circleBordersOnly = true;
      var activedAntiAliasing = true;

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
              var color = primitive.color;
              color.T.selection.data[0] = primitive.initialColor[0];
              color.T.selection.data[1] = primitive.initialColor[1];
              color.T.selection.data[2] = primitive.initialColor[2];
              
              this.set_pixel( i, this.height - (j + 1), color );
              
              // if anti-aliasing is set true
            } else if(activedAntiAliasing === true) {
              // if the original shape was a circle and apply AA only on circle borders is set true
              if(circleBordersOnly === true && primitive.originalShape){
                if( (x > primitive.baseStartX && x < primitive.baseEndX) && (y > primitive.baseStartY && y < primitive.baseEndY)) {
                  var color = antiAliasing(x, y, i, j, primitive, this);
                  if(color) this.set_pixel( i, this.height - (j + 1), color );
                }
              } else {
                var color = antiAliasing(x, y, i, j, primitive, this);
                if(color) this.set_pixel( i, this.height - (j + 1), color );
              }
            } 
          }
        }
      }
      console.log('FIM DA RASTERIZAÇÃO', new Date().toISOString())
    },

    set_pixel: function( i, j, colorarr ) {
      // We assume that every shape has solid color

      this.image.set(j, i, 0, colorarr.get(0));
      this.image.set(j, i, 1, colorarr.get(1));
      this.image.set(j, i, 2, colorarr.get(2));
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
