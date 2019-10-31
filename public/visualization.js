// TODO: delete data.json file

var jsonresponse;
var myitems = [];

function relevancyCompare(a, b) {
  if (a.count < b.count) {
    return 1;
  }
  if (a.count > b.count) {
    return -1;
  }
  return 0;
}

$(document).ready(function () {
  var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if(this.status != 200) {
            console.log('Retrying...');
            xmlhttp.open("GET", "data.json", true);
            xmlhttp.send();
          } 
          else {
            // From the server
            jsonresponse = JSON.parse(this.responseText);
            
            myitems = [];

            for (var i = 0; i < jsonresponse["results"].length; i++) { //iterate through all results
                for (var j = 0; j < jsonresponse["results"][i]["enriched_text"]["entities"].length; j++) { //iterate through entities
                    if (jsonresponse["results"][i]["enriched_text"]["entities"][j]["type"] === "Company") {
                        myitems.push({
                            text: jsonresponse["results"][i]["enriched_text"]["entities"][j]["text"],
                            count: jsonresponse["results"][i]["enriched_text"]["entities"][j]["relevance"]
                        });
                    }
                }
            }
            
            myitems.sort(relevancyCompare);
            
            var bubbleChart = new d3.svg.BubbleChart({
              supportResponsive: true,
              //container: => use @default
              size: 600,
              //viewBoxSize: => use @default
              innerRadius: 600 / 3.5,
              //outerRadius: => use @default
              radiusMin: 50,
              //radiusMax: use @default
              //intersectDelta: use @default
              //intersectInc: use @default
              //circleColor: use @default
              
              data: {
                items: myitems.slice(0, 10),
                eval: function (item) {return item.count;},
                classed: function (item) {return item.text.split(" ").join("");}
              },
              plugins: [

                {
                  name: "lines",
                  options: {
                    format: [
                      {// Line #0
                        textField: "count",
                        classed: {count: true},
                        style: {
                          "font-size": "28px",
                          "font-family": "Source Sans Pro, sans-serif",
                          "text-anchor": "middle",
                          fill: "white"
                        },
                        attr: {
                          dy: "0px",
                          x: function (d) {return d.cx;},
                          y: function (d) {return d.cy;}
                        }
                      },
                      {// Line #1
                        textField: "text",
                        classed: {text: true},
                        style: {
                          "font-size": "14px",
                          "font-family": "Source Sans Pro, sans-serif",
                          "text-anchor": "middle",
                          fill: "white"
                        },
                        attr: {
                          dy: "20px",
                          x: function (d) {return d.cx;},
                          y: function (d) {return d.cy;}
                        },
                         centralClick: function(item) {
                                    alert("Here is more details: " + item.text + "!!");
                        }
                      }
                    ],
                    centralFormat: [
                      {// Line #0
                        style: {"font-size": "50px"},
                        attr: {}
                      },
                      {// Line #1
                        style: {"font-size": "30px"},
                        attr: {dy: "40px"}
                      }
                    ]
                  }
                }]
            });
          }
        }
        
        // PERFORM DELETION OF DATA.JSON
        
    };
    xmlhttp.open("GET", "data.json", true);
    xmlhttp.send();
    
});
