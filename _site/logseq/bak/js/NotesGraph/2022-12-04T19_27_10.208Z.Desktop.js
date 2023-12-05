var commentFlag = true;
let hasLoadedGraph = true;

window.addEventListener("load", initLoad);


function initLoad() {
    /* I really don't understand what this piece of code was for, it was causing a bug 
    and unnecesarily setting up an  event listener that,
    loaded the graph every time you scrolled (WTF)
     if (!( document.getElementById("graph-wrapper").getBoundingClientRect().top <
           window.innerHeight * 1.5 &&
        commentFlag)){
      console.log("im here bro")
      return;
    } */

    var oScript = document.createElement("script");
    oScript.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js";
    oScript.crossOrigin = 'anonymous';
    oScript.integrity =
        "sha512-FHsFVKQ/T1KWJDGSbrUhTJyS1ph3eRrxI228ND0EGaEp6v4a/vGwPWd3Dtd/+9cI7ccofZvl/wulICEurHN1pg==";
    document.body.appendChild(oScript);

    oScript.onload = () => {
        const MINIMAL_NODE_SIZE = 14;
        const MAX_NODE_SIZE = 18;
        const ACTIVE_RADIUS_FACTOR = 1.5;
        const STROKE = 2;
        const FONT_SIZE = 16;
        const TICKS = 200;
        const FONT_BASELINE = 40;
        const MAX_LABEL_LENGTH = 50;

        const request = new XMLHttpRequest();
        request.open('GET', './_includes/notes_graph.json', true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                const data = JSON.parse(this.response);
                const graphData = data;
                loadGraph(graphData);
            } else {
                // Error
                console.error(`Error loading notes_graph.json: ${this.status} ${this.statusText}`);
            }
        };

        request.onerror = function() {
            // Connection error
            console.error("Error loading notes_graph.json");
        };

        request.send();

        function loadGraph(graphData) {

            let nodesData = graphData.nodes;
            let linksData = graphData.edges;

            const nodeSize = {};
            
            window.addEventListener('keydown', (event) => {
              if (event.key === 'r') {
                  restart();
              }
            });
             

            const updateNodeSize = () => {
                nodesData.forEach((el) => {
                    let weight =
                        3 *
                        Math.sqrt(
                            linksData.filter((l) => l.source.id === el.id || l.target.id === el.id)
                            .length + 1
                        );
                    if (weight < MINIMAL_NODE_SIZE) {
                        weight = MINIMAL_NODE_SIZE;
                    } else if (weight > MAX_NODE_SIZE) {
                        weight = MAX_NODE_SIZE;
                    }
                    nodeSize[el.id] = weight;
                });
            };

            const onClick = (d) => {
                window.location = d.path
            };

            const onMouseover = function(d) {
                const relatedNodesSet = new Set();
                linksData
                    .filter((n) => n.target.id == d.id || n.source.id == d.id)
                    .forEach((n) => {
                        relatedNodesSet.add(n.target.id);
                        relatedNodesSet.add(n.source.id);
                    });

                node.attr("class", (node_d) => {
                    if (node_d.id !== d.id && !relatedNodesSet.has(node_d.id)) {
                        return "inactive";
                    }
                    return "";
                });

                link.attr("class", (link_d) => {
                    if (link_d.source.id !== d.id && link_d.target.id !== d.id) {
                        return "inactive";
                    }
                    return "";
                });

                link.attr("stroke-width", (link_d) => {
                    if (link_d.source.id === d.id || link_d.target.id === d.id) {
                        return STROKE * 4;
                    }
                    return STROKE;
                });

                text.attr("class", (text_d) => {
                    if (text_d.id !== d.id && !relatedNodesSet.has(text_d.id)) {
                        return "inactive";
                    }
                    return "";
                });
            };

            const onMouseout = function(d) {
                node.attr("class", "");
                link.attr("class", "");
                text.attr("class", "");
                link.attr("stroke-width", STROKE);
            };

            const sameNodes = (previous, next) => {
                if (next.length !== previous.length) {
                    return false;
                }

                const map = new Map();
                for (const node of previous) {
                    map.set(node.id, node.label);
                }

                for (const node of next) {
                    const found = map.get(node.id);
                    if (!found || found !== node.title) {
                        return false;
                    }
                }

                return true;
            };

            const sameEdges = (previous, next) => {
                if (next.length !== previous.length) {
                    return false;
                }

                const set = new Set();
                for (const edge of previous) {
                    set.add(`${edge.source.id}-${edge.target.id}`);
                }

                for (const edge of next) {
                    if (!set.has(`${edge.source.id}-${edge.target.id}`)) {
                        return false;
                    }
                }

                return true;
            };

            // This defines the width and height of the svg
            const graphWrapper = document.getElementById('graph-wrapper')
            const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            element.setAttribute("width", graphWrapper.getBoundingClientRect().width);
            element.setAttribute("height", window.innerHeight * 0.685);

            graphWrapper.appendChild(element);

            const reportWindowSize = () => {
                const graphWrapper = document.getElementById('graph-wrapper');
                element.setAttribute("width", graphWrapper.getBoundingClientRect().width);
                element.setAttribute("height", window.innerHeight * .7);
                restart();
            };

            window.onresize = reportWindowSize;

            const svg = d3.select("svg");
            const width = Number(svg.attr("width"));
            const height = Number(svg.attr("height"));
            let zoomLevel = 1;

            const simulation = d3
                .forceSimulation(nodesData)
                .force("forceX", d3.forceX().x(width / 2))
                .force("forceY", d3.forceY().y(height / 2))
                .force("charge", d3.forceManyBody())
                .force(
                    "link",
                    d3
                    .forceLink(linksData)
                    .id((d) => d.id)
                    .distance(70)
                )
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(80))
                .stop();

            const g = svg.append("g");
            let link = g.append("g").attr("class", "links").selectAll(".link");
            let node = g.append("g").attr("class", "nodes").selectAll(".node");
            let text = g.append("g").attr("class", "text").selectAll(".text");

            const resize = () => {
                if (d3.event) {
                    const scale = d3.event.transform;
                    zoomLevel = scale.k;
                    g.attr("transform", scale);
                }

                const zoomOrKeep = (value) => (zoomLevel >= 1 ? value / zoomLevel : value);

                const font = Math.max(Math.round(zoomOrKeep(FONT_SIZE)), 1);

                text.attr("font-size", (d) => font);
                text.attr("y", (d) => d.y - zoomOrKeep(FONT_BASELINE) + 8);
                link.attr("stroke-width", zoomOrKeep(STROKE));
                node.attr("r", (d) => {
                    return zoomOrKeep(nodeSize[d.id]);
                });
                svg
                    .selectAll("circle")
                    .filter((_d, i, nodes) => d3.select(nodes[i]).attr("active"))
                    .attr("r", (d) => zoomOrKeep(ACTIVE_RADIUS_FACTOR * nodeSize[d.id]));
            };

            const ticked = () => {
                node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
                text
                    .attr("x", (d) => d.x)
                    .attr("y", (d) => d.y - (FONT_BASELINE - nodeSize[d.id]) / zoomLevel);
                link
                    .attr("x1", (d) => d.source.x)
                    .attr("y1", (d) => d.source.y)
                    .attr("x2", (d) => d.target.x)
                    .attr("y2", (d) => d.target.y);
            };

            const restart = () => {
                updateNodeSize();
                node = node.data(nodesData, (d) => d.id);
                node.exit().remove();
                node = node
                    .enter()
                    .append("circle")
                    .attr("r", (d) => {
                        return nodeSize[d.id];
                    })
                    .on("click", onClick)
                    .on("mouseover", onMouseover)
                    .on("mouseout", onMouseout)
                    .merge(node);
                link = link.data(linksData, (d) => `${d.source.id}-${d.target.id}`);
                link.exit().remove();
                link = link.enter().append("line").attr("stroke-width", STROKE).merge(link);

                text = text.data(nodesData, (d) => d.label);
                text.exit().remove();
                text = text
                    .enter()
                    .append("text")
                    .text((d) => shorten(d.label.replace(/_*/g, ""), MAX_LABEL_LENGTH))
                    .attr("font-size", `${FONT_SIZE}px`)
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "central")
                    .on("click", onClick)
                    .on("mouseover", onMouseover)
                    .on("mouseout", onMouseout)
                    .merge(text);

                node.attr("active", (d) => isCurrentPath(d.path) ? true : null);
                node.attr("visited", (d) => hasVisitedNode(d.path) ? true : null);
                text.attr("active", (d) => isCurrentPath(d.path) ? true : null);

                // Center active node
                function centerActiveNode(node) {
                  node.each(function(d) {
                      if (isCurrentPath(d.path)) {
                          d.fy = element.height.animVal.value / 2;
                          d.fx = element.width.animVal.value / 2;
                      }
                  })
                }
                
                simulation.nodes(nodesData);
                simulation.force("link").links(linksData);
                simulation.alpha(1).restart();
                simulation.stop();

                for (let i = 0; i < TICKS; i++) {
                    simulation.tick();
                }

                ticked();
            };

            const zoomHandler = d3.zoom().scaleExtent([0.2, 3]).on("zoom", resize);

            zoomHandler(svg);
            restart();

            function isCurrentPath(notePath) {
                return window.location.pathname == notePath;
            }

            function hasVisitedNode(notePath) {
                return localStorage.getItem("visited").includes("\"" + notePath + "\"");
            }

            // Shorten a string if it exceeds a max length
            function shorten(str, maxLen, separator = ' ') {
                if (str.length <= maxLen) return str;
                return str.substr(0, str.lastIndexOf(separator, maxLen)) + '...';
            }
            commentFlag = false;
        }
    }
}