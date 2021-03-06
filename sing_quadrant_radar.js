var Global = {};
var quadrantRadiusDef = 400;
var totalWidth = 600;
var totalHeight = 640;
var quadrantName = 'techniques';
var spacing = 18;
var radarName = '', animateIndex, originCoord;
function quadrant_setup() {    
    return {
       'languages-and-frameworks': {
            'startAngle': 270,
            'tx': 1,
            'ty': 1,
            'colour': '#587486',
            'left': '33px',
            'right': 'auto',
            'top': '33px',
            'bottom': 'auto'
        },
        'techniques': {
            'startAngle': 0,
            'tx': 0,
            'ty': 1,
            'colour': '#B70062',
            'left': 'auto',
            'right': '33px',
            'top': '33px',
            'bottom': 'auto'
        },
        'tools': {
            'startAngle': 180,
            'tx': 1,
            'ty': 0,
            'colour': '#8FA227',
            'left': '33px',
            'right': 'auto',
            'top': 'auto',
            'bottom': '33px'
        },                       
        'platforms': {
            'startAngle': 90,
            'tx': 0,
            'ty': 0,
            'colour': '#DC6F1D',
            'left': 'auto',
            'right': '33px',
            'top': 'auto',
            'bottom': '33px'
        }
               
        
    };
};

(function($) {


function appendTriangle(svg, x, y, w) {
        return svg.append('path').attr('d', "M412.201,311.406c0.021,0,0.042,0,0.063,0c0.067,0,0.135,0,0.201,0c4.052,0,6.106-0.051,8.168-0.102c2.053-0.051,4.115-0.102,8.176-0.102h0.103c6.976-0.183,10.227-5.306,6.306-11.53c-3.988-6.121-4.97-5.407-8.598-11.224c-1.631-3.008-3.872-4.577-6.179-4.577c-2.276,0-4.613,1.528-6.48,4.699c-3.578,6.077-3.26,6.014-7.306,11.723C").attr("stroke", "white").attr("stroke-width", 2).attr('transform', 'scale(' + (w / 34) + ') translate(' + (-404 + x * (34 / w) - 17) + ', ' + (-282 + y * (34 / w) - 17) + ')');
};
function appendCircle(svg, x, y, w) {
        return svg.append('circle').attr("stroke-width", 1).attr('cx', originCoord.x).attr('cy', originCoord.y).style('opacity', 0).transition().delay(1000).duration(1000).style('opacity', 1).attr('cx', x).attr("cy", y).attr('r', 9).attr('stroke', '#F04923').attr('fill', 'white');
};
function appendRect(svg, x, y, w, h) {
    return svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
};
function getRadian(deg) {
    return deg * Math.PI / 180;
};

function arc(svg, id, innerRadius, outerRadius, colour, radius, startAngle, tx, ty, isFinalQuadrant) {
   var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius).startAngle(getRadian(startAngle)).endAngle(getRadian(startAngle + 90));
    var destArc = d3.svg.arc().startAngle(getRadian(startAngle)).endAngle(getRadian(startAngle + 90)).innerRadius(innerRadius).outerRadius(outerRadius); 
    svg.append('path').attr('d', arc).attr('stroke-width', 0).attr('fill', colour).attr('transform', 'translate(' + (tx *  totalWidth  + spacing) +  ', ' + (ty * totalHeight  + spacing) + ')').transition().delay(animateIndex * 100).attr('d', destArc).attr('stroke-width', 3).attr('stroke', 'white').attr('fill', colour);
    animateIndex++;
};

function quadrant(svg, id, quadrantRadius, scale, segments, startAngle, tx, ty, textColour) {
    animateIndex = 1;
    _(segments).each(function(segment, segmentIndex) {
        
        arc(svg, id, segment.startRadius * scale, segment.endRadius * scale, segment[quadrantName].color, quadrantRadius, startAngle, tx, ty, segmentIndex == segments.length - 1);
    });
    
  
};

function drawLabel (svg, id, quadrantRadius, scale, segments, startAngle, tx, ty, textColour) {
    _(segments).each(function(segment) {
        addLabel(svg, segment.title, segment.startRadius * scale, segment.endRadius * scale, quadrantRadius, tx, ty, textColour);
    });
}


var createShape = function(point, parent, colour, x, y, pointWidth) {
    var shapeFunction = {
        't': appendTriangle,
        'c': appendCircle
    }[point.movement];
    return shapeFunction(parent, x, y, pointWidth).attr('fill', colour).attr('stroke', '#F04923').attr('class', point.ring.toLowerCase() + '-point');
};
var colourLink = function(pointId, bgColor, color, needFocus) {
    var functionCall = 'addClass';
    if(!color) {
        functionCall = 'removeClass';
    }

   var legendElement = $('#legend-' + pointId)[functionCall]('highlight');
    /*legendElement.css({
        'background-color': bgColor        
    });
    $(legendElement).children().css('color', color);*/
if(needFocus) {
    var ringLegend = $(legendElement).parents('.ring-legend-container').position();
    
    var radarLegend = $(legendElement).parents('.radar-legend');
    $(radarLegend).scrollTop(ringLegend.top);
}
};
var blurOtherPoints = function(pointId, animationRequired) {
    d3.selectAll('a circle, a path');
    var points = d3.select('#point-' + pointId).selectAll('circle, path');
    if(animationRequired)
    points.transition().duration(animationRequired? 100: 0).attr('fill', '#F04923').attr('stroke', 'white').attr('stroke-width', 2);
    else
    points.attr('fill', '#F04923').attr('stroke', 'white').attr('stroke-width', 2);
    d3.select('#point-' + pointId).selectAll('text').attr('fill', 'white');
};
var restorepoints = function(animationRequired) {

    
    if(animationRequired)
        d3.selectAll('a path, a circle').transition().duration(animationRequired? 100: 0).attr('r', 9).attr('fill', 'white').attr('stroke','#F04923').attr('stroke-width', 1);
     else 
       d3.selectAll('a path, a circle').attr('r', 9).attr('fill', 'white').attr('stroke','#F04923').attr('stroke-width', 1);
     d3.selectAll('a').selectAll('text').attr('fill', 'black');
};
var unhighlight = function(pointId, needFocus) {
    colourLink(pointId, undefined, undefined, false);
    $('.tooltip-container svg').hide();
    restorepoints(needFocus);
};
var highlight = function(pointId, pointColour, textColour, needFocus) {
    colourLink(pointId, pointColour, textColour, needFocus);

    var currentPoint = _.filter(Global.points, function(item) {
        return item.id == pointId;
    });
    
    if(currentPoint.length > 0) {
        $('.tooltip-title-text').html(createSVGtext(radarName, 30, 0, 50).html());
        $('.tooltip-sub-title-text').html(createSVGtext(quadrantName.replace(/-/g, ' ') + ' / ' + currentPoint[0].ring, 30, 0, 50).html());
        $('.tooltip-element-title-text').html(createSVGtext(currentPoint[0].name, 30, 0, 50).html());
        
        
        $('.tooltip-element-description-text').html(createSVGtext(currentPoint[0].description, 30, 0, 60, 20, 150).html());
        
        $('.tooltip-index-text').text(pointId);
        $('.tooltip-more-element-text').data('href', currentPoint[0].href);
       $('.tooltip-container svg').show(500);
    }
    blurOtherPoints(pointId, needFocus);
};
var pointCoord = function(point, scaleFactor, quadrantRadius, tx, ty, startAngle) {
    var xI = 1;
    var yI = 1;

    if(startAngle == 0) {        
        yI = -1;
    } else if (startAngle == 90) {
        // no change
    } else if (startAngle == 180) {
        xI = -1;
    } else {
        xI = -1;
        yI = -1;
    }

   
    return {
        'x': Math.abs(Math.abs(point.radial * scaleFactor * Math.cos(getRadian(startAngle + point.theta))) + (xI) * tx * totalWidth + (xI * spacing)),
        'y': Math.abs(Math.abs(point.radial * scaleFactor * Math.sin(getRadian(startAngle + point.theta))) + (yI) * ty * totalHeight + (yI * spacing))
    };
};

function addLabel(svg, text, startArc, endArc, quadrantRadius, tx, ty, colour) {
                    
           var x = (totalWidth * tx) + spacing;
           var y = (totalHeight * ty) + spacing;

           var textXPadding = 5, textYPadding = 15;
           var xI = 1;
            if(tx == 1) {
                textXPadding = -5;
                
                xI = -1;
            }

            if(ty == 0) {
                textYPadding = -5;
            }


            svg.append('text').attr({

                "text-anchor": 'middle',
                "fill": colour,
                'transform': 'translate(' + (x + (xI * startArc) + ((quadrantRadiusDef / (4 * 2) * xI) + textXPadding)) + ', ' + (y + textYPadding) + ')'
            }).style({
                'font-size': '14pt',
                'font-family': 'SapientSansLight, Arial'
            }).text(text);
        };


var drawpoint = function(point, svg, colour, scale, quadrantRadius, tx, ty, pointWidth, pointFontSize, startAngle) {
    var coord = pointCoord(point, scale, quadrantRadius, tx, ty, startAngle);
    var link = svg.append('svg:a').attr({
        'id': 'point-' + point.id,
        'target': '_blank'
        
    }).style({
        'text-decoration': 'none',
        'cursor': 'pointer'
    });

    if(point.nameUrl != null && point.nameUrl != '') {
        link.attr('xlink:href', point.nameUrl);
    }

        var highlightPointColor = '#F04923', highlightTextColor = 'white';
    var unHighlightPointColor = 'white', unHighlightTextColor = 'black';
    createShape(point, link, unHighlightPointColor, coord.x, coord.y, pointWidth);

    var textY = point.movement === 't' ? coord.y + 6 : coord.y + 4;
    link.append('text').attr({
        'x': coord.x,
        'y': textY,        
        'fill': '#000'
    }).text(point.radarId).style({
        'text-anchor': 'middle'
    }).style('opacity', 0).transition().delay(2000).duration(100).style('opacity', 1);
    window.setTimeout(function(){
    link.on('touchstart', function() {
        highlight(point.id, highlightPointColor, highlightTextColor, true);
    });
    link.on('touchend', function() {
        unhighlight(point.id, true);
    });
    link.on('mouseenter', function() {
        highlight(point.id, highlightPointColor, highlightTextColor, true);
    });
    link.on('mouseleave', function() {
        unhighlight(point.id, true);
    });
}, 2000);
};

var CONFIG = {
    'quadrantRadius': quadrantRadiusDef,
    'pointWidth': 25,
    'pointFontSize': '10px',
    'textColour': '#000',
    'maxRadius': quadrantRadiusDef,
    'segmentData': [{
        'title': 'Maintain',
        'startRadius': 0,
        'endRadius': quadrantRadiusDef/4,
        'languages-and-frameworks': {
            color: '#36839C'
        },
        'platforms': {
            color: '#2E94CB'
        },
        'tools': {
            color: '#60D0EB'
        },
        'techniques': {
            color: '#507173'
        }
    }, {
        'title': 'Invest',
        'startRadius': quadrantRadiusDef/4 + 1,
        'endRadius': quadrantRadiusDef/2,
        'languages-and-frameworks': {
            color: '#69A2B5'
        },
        'platforms': {
            color: '#64AED9'
        },
        'tools': {
            color: '#89DCEE'
        },
        'techniques': {
            color: '#7B9496'
        }
    }, {
        'title': 'Watch',
        'startRadius': quadrantRadiusDef/2 + 1,
        'endRadius': 3 * quadrantRadiusDef / 4,
        'languages-and-frameworks': {
            color: '#9FC1CE'
        },
        'platforms': {
            color: '#98CAE5'
        },
        'tools': {
            color: '#B0E7F3'
        },
        'techniques': {
            color: '#A7B8B9'
        }
        
    }, {
        'title': 'Exit',
        'startRadius': 3 * quadrantRadiusDef / 4 + 1,
        'endRadius': quadrantRadiusDef,
        'languages-and-frameworks': {
            color: '#C0D8E1'
        },
        'platforms': {
            color: '#BFDEEF'
        },
        'tools': {
            color: '#CEF0F9'
        },
        'techniques': {
            color: '#C8D2D3'
        }
    }],
    'quadrantData': quadrant_setup()
};

function on_leave() {
    var id = parseInt(this.id.replace('legend-', ''));
    unhighlight(id, false);
}

function on_hover() {
   var id = parseInt(this.id.replace('legend-', ''));
    highlight(id, '#F04923', 'white', false);
}

function on_click() {
    var id = parseInt(this.id.replace('legend-', ''));
    var href = $('#point-' + id).attr('href');

    if(href != '')
        window.open(href);
}   
$(document).ready(function(){
    $('#tech-radar').on('draw', drawRadar);    
})
function bindEvents() {
        
        $('div[id*=legend-]').click(on_click);
        $('div[id*=legend-]').on('mouseout', on_leave);
        $('div[id*=legend-]').on('mouseover',on_hover);
        

};



function drawRadar() {
    $('.radar-legend').remove();
     var svg = d3.select('#tech-radar').insert('svg', ':first-child').attr('width', totalWidth + spacing * 2).attr('height', totalHeight + spacing * 2);
    
    appendRect(svg, spacing, spacing, totalWidth, totalHeight)

    var quadSetup = quadrant_setup();
     var scaleFactor = CONFIG.quadrantRadius / CONFIG.maxRadius;
    
    var quadrantData = CONFIG.quadrantData[quadrantName];
   
    
    quadrant(svg, quadrantName, CONFIG.quadrantRadius, scaleFactor, CONFIG.segmentData, quadrantData.startAngle, quadrantData.tx, quadrantData.ty, CONFIG.textColour);
    


    _(CONFIG.segmentData).each(function(segment, segmentIndex) {
        
        addLabel(svg, segment.title, segment.startRadius * scaleFactor, segment.endRadius * scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.segmentData[0][quadrantName].color);        
    });
    

var pointIndex = 0;
var legendIndex = 0;

var quadrantIndex = 1;
     
     var filteredData = _.filter(radar_data, function(d) {return d.quadrant.toLowerCase().replace(/ /g, '-') == quadrantName; })
        
        var legendObject= {};

        legendObject.parent = { color: CONFIG.segmentData[0][quadrantName].color, name: quadrantName, pointIndex: pointIndex };

        legendObject.items = [];
 Global.points = [];
        if(filteredData.length > 0) {
        _(CONFIG.segmentData).each(function(segment) {
            var segmentFilteredData = _.filter(filteredData[0].items, function(d) {return d.ring == segment.title; });
            var ringLegendObject = {
                color: segment[quadrantName].color,
                title: segment.title,
                items:  segmentFilteredData
            };

            legendObject.items.push(ringLegendObject); 


            $.each(segmentFilteredData, function(elementIndex, point_element) {
                pointIndex++;
                var point = {
                    radial:point_element.pc.r,
                    theta: point_element.pc.t,
                    movement: point_element.movement,
                    id: pointIndex,  
                    name: point_element.name,                  
                    ring: segment.title,
                   radarId: pointIndex,
                   description: point_element.description,
                    nameUrl: point_element.url
                };
                Global.points.push(point);
            });


        });
    }

        var templating = _.template($('#legend-template').html());
       $('#quadrant-' + (quadrantIndex) +'-legend').append(templating(legendObject)).hide().fadeIn(1000);
       $('#tech-radar rect:first').attr('fill', legendObject.parent.color);
       $('.quadrant-1 .legend-header').css('color', 'white').html(legendObject.parent.name.replace(/-/g, ' ').replace('and', '&'));
    
       $('.quadrant-1').css(quadrantData);
       quadrantIndex++;
        if(filteredData.length > 0) {        

        if (Global.points !== undefined) {           
            var quadrantData = CONFIG.quadrantData[quadrantName];
                originCoord = pointCoord({radial: 0, theta: 0}, scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, quadrantData.startAngle);
                animateIndex = 1;
                _(Global.points).each(function(point) {
                    
                    drawpoint(point, svg, quadrantData.colour, scaleFactor, CONFIG.quadrantRadius, quadrantData.tx, quadrantData.ty, CONFIG.pointWidth, CONFIG.pointFontSize, quadrantData.startAngle);
                });
           
        }
     }
     

    bindEvents();

};

})(jQuery);