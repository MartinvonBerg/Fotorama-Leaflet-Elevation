
function showCurrentTrackStatistics(data) {

    let newdata = [].slice.call(data);
    let curmean = mean(newdata);
    let curstd = std(newdata);
    let min1 = curmean - 3*curstd;
    let max1 = curmean + 3*curstd;
    let min2 = curmean - 6*curstd;
    let max2 = curmean + 6*curstd;

    let TESTER = document.getElementById('gpx_canvas3');
    plotly.newPlot( TESTER, [{
        x: data,
        type: 'histogram',}],
        {
        xaxis: {title: "Distance [m]"},
        yaxis: {title: "Frequency"},
        shapes: [
            {
                type: 'line',
                x0: curmean,
                y0: -10,
                x1: curmean,
                y1: 10,
                line: {
                color: 'red',
                width: 2,
                dash: 'dot'
                },},
            /*{
                type: 'line',
                x0: min1,
                y0: -10,
                x1: min1,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
            {
                type: 'line',
                x0: min2,
                y0: -10,
                x1: min2,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
            },},*/
            {
                type: 'line',
                x0: max1,
                y0: -10,
                x1: max1,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
            {
                type: 'line',
                x0: max2,
                y0: -10,
                x1: max2,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
          ],
        title: "Current Track Statistics",
        }
    );
    /*
    const dataSortedWithIndexes = newdata
        .map((f, i) => ({
            floatNumber: f,
            index: i, // <-- original index
        }));
    */
}

function showGpxStatistics(dists, stats1, stats2) {
    // generate an array of x values for plotting with incrementing values
    let xval = [];
    for (let i = 0; i < dists.length; i++) {
        xval.push(i);
    }
    /*
    let xval = [];
    let start = dists[0];
    for (let i = 0; i < dists.length; i++) {
        start = dists[i] + xval[i-1] || 0;
        xval.push(start);
    }
    */
    let TESTER = document.getElementById('gpx_canvas4');

    plotly.newPlot( TESTER, 
        [{
            x: xval,
            y: stats1,
            type: 'scatter',
        },
        {
            x: xval,
            y: stats2,
            type: 'scatter',
        }],
        {
        xaxis: {title: "some"},
        yaxis: {title: "stats"},
        }
    );
}
