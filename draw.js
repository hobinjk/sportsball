function drawTeams(gameTeams) {
  // teams are objects with {name: name, rating: r}
  // gameTeams is [[team...]...]
  var paper = Raphael("container", 3 * window.innerWidth, window.innerHeight);

  function getX(gameIndex) {
    return gameIndex * 3 * (window.innerWidth) / (gameTeams.length-1);
  }

  function getY(teamIndex) {
    return teamIndex * (window.innerHeight - 20) / gameTeams[0].length + 10;
  }

  function getYRating(teamRating) {
    return (1400 + 250/2 - teamRating) / 250 * (window.innerHeight - 20) + 10;
  }

  for(var team of gameTeams[0]) {
    console.log("team: "+team.name);
    var color = teamInformation[team.name].colors[0];
    var title = teamInformation[team.name].name;
    var pathStr = "";
    for(var gameIndex = 0; gameIndex < gameTeams.length; gameIndex++) {
      var game = gameTeams[gameIndex];
      // find the index of the first occurence of our team
      // (see ECMAScript 6 findIndex)
      var teamIndex = game.map(function(gameTeam) { return gameTeam.name === team.name; }).indexOf(true);
      var y = getYRating(game[teamIndex].rating);
      var x = getX(gameIndex);
      if(gameIndex > 0)
        pathStr += "L";
      else
        pathStr += "M";
      pathStr += x+","+y;
      //paper.circle(x,y,10).attr({"fill": color});
    }
    console.log(team.name+": "+pathStr);
    paper.path(pathStr)
         .attr({stroke: color, fill: "none", title: title});
  }
}
