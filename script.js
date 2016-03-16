console.log('Manipulating data, this time with nest')

d3.csv('../data/hubway_trips_reduced.csv',parse,dataLoaded);

function dataLoaded(err,rows){
    console.log(rows);

    rows.forEach(function(d){
        if(d.gender == "Unknown" || d.age == 0 || d.zipCode == ""){
            d.status =  "Casual";
        }else{
            d.status = "Registered";
        }
    });

    //Step 1: start with the basics: nest, or group, trips with the same starting stations
    //Using d3.nest()...entries()
    var nestedRows = d3.nest()
        .key(function (d){return d.startStation})
        .entries(rows);
    console.log("nest, or group, trips with the same starting stations", nestedRows);

    //Step 2: do the same as above, but instead of .entries(), use .map()
    //How does this compare?
    var nestedRowsMapped = d3.nest()
        .key(function (d){return d.startStation})
        .map(rows,d3.map);
    console.log("do the same as above, but instead of .entries(), use .map()", nestedRowsMapped);

    //Step 3: simple two level nest
    //Nest trips with the same starting stations
    //Under each station, further nest trips into two groups: those by registered vs. casual users
    //Hint: casual users are those with no birth date, gender, or zip code information
    var nestedByStatus = d3.nest()
        .key(function (d){return d.startStation})
        .key(function (d){return d.status})
        .entries(rows);
    console.log("Step 3: simple two level nest", nestedByStatus);


    //Step 4: simple two level nest
    //Same as above, but instead of returning nested trips as sub-arrays, return two numbers:
    //total count of registered trips, vs. casual trips
    var nestedByStatusTotal = d3.nest()
        .key(function (d){return d.startStation})
        .key(function (d){return d.status})
        .rollup(function(status) { return status.length; })
        .entries(rows);
    console.log("//Step 4: simple two level nest", nestedByStatusTotal);


    //Step 5: group trips with the same starting stations, BUT only for 2012
    //Do this without crossfilter
    //Hint: first you have to use array.filter() to reduce all trips to a smaller subset
    //Then you nest the smaller array

    start2012 = new Date ('January 01, 2012 00:00:00');
    end2012 = new Date ('December 31, 2012 23:59:59');

    var year2012 = rows.filter(function(d){return d.startTime>=start2012 || d.startTime>=end2012 });
    nested2012 = d3.nest()
        .key(function(d){return d.startStation})
        .entries(year2012);
    console.log("//Step 5: group trips with the same starting stations, BUT only for 2012", nested2012);


    //Step 6: do the same, but with crossfilter
    //How does this compare to step 5?
    var trips = crossfilter(rows);

    var tripsByYear = trips.dimension(function(d){return d.startDate});
    trips2012 = tripsByYear.filter([start2012,end2012]).top(Infinity);
    console.log("total number of trips in 2012", trips2012);
    
}

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        userAge: d.birth_date?parseDate(d.start_date).getFullYear()- (+d.birth_date):0,
        gender:d.gender? d.gender:"Unknown",
        zipCode: d.zip_code
    };

}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

function parseStatus(d){

    if (d.gender=="Unknown" || d.userAge==0){return "casual"}else{return "registered"};
}

