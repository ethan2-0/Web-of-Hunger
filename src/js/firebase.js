var refs = {
  root : new Firebase("https://web-of-hunger.firebaseio.com"),
  users : new Firebase("https://web-of-hunger.firebaseio.com/users"),
  graph : {
    graph : new Firebase("https://web-of-hunger.firebaseio.com/graph"),
    nodes : new Firebase("https://web-of-hunger.firebaseio.com/graph/nodes"),
    edges : new Firebase("https://web-of-hunger.firebaseio.com/graph/edges")
  }
};

//get data
//functions that allow vis to read firebase data
refs.root.on("value", function(snapshot) {
  console.log(snapshot.val());

  //main vis update section
  var data = getGraphData(snapshot.val());

  var visGraphContainer = document.getElementById("visGraph");
  var options = {};

  var visGraph = new vis.Network(visGraphContainer, data, options);
});

var getGraphData = function(data) {
  var nds = [];
  var edgs = [];

  for(var node in data.graph.nodes) {
    if(data.graph.nodes.hasOwnProperty(node)) {
      nds.push({
        id:data.graph.nodes[node].id,
        label:data.graph.nodes[node].label
      });
    }
  }
  for(var edge in data.graph.edges) {
    if(data.graph.edges.hasOwnProperty(edge)) {
      edgs.push({
        from:data.graph.edges[edge].from,
        to:data.graph.edges[edge].to,
        arrows:data.graph.edges[edge].arrows
      });
    }
  }

  return {
    nodes : new vis.DataSet(nds),
    edges : new vis.DataSet(edgs)
  };
};

//check if username, edge and node names exists
var checkIfUsernameExists = function(username) {
  refs.users.child(username).once("value", function(snapshot){
    if(snapshot.exists()) return true;
    return false;
  });
};

var checkIfNodeNameExists = function(nodeName) {
  refs.graph.nodes.child(nodeName).once("value", function(snapshot){
    if(snapshot.exists()) return true;
    return false;
  });
};

var checkIfEdgeNameExists = function(edgeName) {
  refs.graph.edges.child(edgeName).once("value", function(snapshot){
    if(snapshot.exists()) return true;
    return false;
  });
};

//data manipulation functions (low level to high)
var objify = function() {
  var obj = {};
    for (var i = 0; i < arguments.length; i+=2)
      obj[arguments[i]] = arguments[i+1];
    return obj;
}

var addNode = function(node){
  refs.graph.nodes.update(objify(node.name, {
    "id" : node.id,
    "label" : node.label
  }));
};

var addEdge = function(edge) {
  refs.graph.edges.update(objify(edge.name, {
    "from" : edge.from,
    "to" : edge.to,
    "arrows" : edge.arrows
  }));
};

var addUser = function(name, edges){
  if(!checkIfUsernameExists(name) && !checkIfNodeNameExists(name) && !checkIfEdgeNameExists(name)){
    var time = Firebase.ServerValue.TIMESTAMP;
    refs.users.update(objify(name, {
      "name" : name,
      "id" : time,
      "edges" : {
        "to" : {},
        "from" : {}
      }
    }));

    addNode(new Node(name, time, name));

    for(var e in edges){
      refs.users.child(name).child("edges/to").update(objify(edges[e].name, true));
      addEdge(new Edge(edges[e].name, time, edges[e].to, edges[e].arrows));
      //TODO add a "from" edge so that you know who wants to eat you
    }
  } else {
    alert("user/node/edge name taken.");
  }
};
