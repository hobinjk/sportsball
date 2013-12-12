var dataRequest = new XMLHttpRequest();

dataRequest.onload = function() {
  onDataLoad(this.responseText);
};

dataRequest.open("get", "data/2012_nfl_pbp_data.csv", true);
dataRequest.send();

function onDataLoad(data) {
  var lines = data.split("\n");
  var i = 0;
  var events = CSV.getObjects(lines);

  finals = events.filter(function(evt) {
    return evt.qtr === "4" && evt.down === "" && evt.togo === "" &&
           evt.description.length === 0 && evt.off.length > 0 && evt.def.length > 0;
  });

  var results = [];

  for(var fin of finals) {
    var off = fin.off;
    var def = fin.def;
    var offScore = parseInt(fin.offscore);
    var defScore = parseInt(fin.defscore);

    var result = {
      off: off,
      def : def,
      offScore: 0.5
    }
    if(offScore > defScore) {
      result.offScore = 1;
    } else if(defScore > offScore) {
      result.offScore = 0;
    } else {
    }

    results.push(result);
  }

  var teamRatings = calculateElo(results);

  var sortedTeams = [];

  for(var teamRating of teamRatings) {
    var teams = [];
    for(var team in teamRating) {
      teams.push({name: team, rating: teamRating[team]});
    }

    function compare(a, b) {
      if(a > b) return 1;
      if(a < b) return -1;
      return 0;
    }

    teams.sort(function(a, b) { return compare(a.rating, b.rating) || compare(a.name, b.name); });
    sortedTeams.push(teams);
  }

  drawTeams(sortedTeams);
}

function calculateElo(results) {
  var teamRatings = [];
  var K = 24; // TODO Set properly
  var initialRating = 1400;

  function addTeam(team) {
    for(rating of teamRatings) {
      rating[team] = initialRating;
    }
  }

  for(var result of results) {
    var ratings = {};
    // icky hard copy
    if(teamRatings.length > 0) {
      var lastRatings = teamRatings[teamRatings.length - 1];
      for(var lastRating in lastRatings) {
        ratings[lastRating] = lastRatings[lastRating];
      }
    }
    teamRatings.push(ratings); // append the new ratings

    if(!(result.off in ratings))
      addTeam(result.off);

    if(!(result.def in ratings))
      addTeam(result.def);

    var offRating = ratings[result.off];
    var defRating = ratings[result.def];

    var offExpected = 1.0/(1 + Math.pow(10, (defRating - offRating)/400.0));
    var defExpected = 1.0/(1 + Math.pow(10, (offRating - defRating)/400.0));

    offRating += K*(result.offScore - offExpected);
    defRating += K*((1 - result.offScore) - defExpected);

    ratings[result.off] = offRating;
    ratings[result.def] = defRating;
  }
  return teamRatings;
}
