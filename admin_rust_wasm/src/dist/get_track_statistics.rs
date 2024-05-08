use super::get_lat_or_lon;

/// Get track statistics from gpx file as complete path
/// 
/// * `content` - gpx file content as string
/// 
/// * `ele_smoothing` - Elevation smoothing in meters. Best is 4.0 m.
/// 
/// * `dist_smoothing` - Distance smoothing inmeters. Best is 25.0 m.
/// 
/// * `filter` - Elevation lowpass filter if > 0.0. 
/// 
/// * `distvec` - vector of distances as mutable reference. Will be modifed
/// 
/// * `elevec` - vector of elevations as mutable reference. Will be modifed
/// 
/// * `lats` - vector of latitudes as mutable reference. Will be modifed
/// 
/// * `lons` - vector of longitudes as mutable reference. Will be modifed
/// 
/// Returns (ascent / [m], descent / [m], distance / [km], min_ele  / [m], max_ele  / [m], min_lat, min_lon, max_lat, max_lon, n_trkpts)
/// 
pub fn get_track_statistics(content: &str, ele_smoothing: f64, dist_smoothing: f64, filter: f64,
    distvec: &mut Vec<f64>, elevec: &mut Vec<f64>, lats: &mut Vec<f64>, lons: &mut Vec<f64>) 
    -> (f64, f64, f64, f64, f64, f64, f64, f64, f64, i32) {
       
    let mut n_trkpts: i32 = 0;
    let mut trkpt_open: bool = false;
    let mut has_valid_elev: bool = false;
    let mut trkpt_diff: i32 = 0;

    let mut ascent: f64 = 0.0;
    let mut descent: f64 = 0.0;
    let mut last_ele: f64 = 0.0;
    let mut cur_ele: f64 = 0.0;
    let mut ele_delta: f64;
    let mut min_ele: f64 = 10000.0;
    let mut max_ele: f64 = -1000.0;

    let mut dist: f64 = 0.0;
    let mut cur_dist: f64 = 0.0;

    let mut last_lat: f64 = 0.0;
    let mut last_lon: f64 = 0.0;
    let mut first_lat: f64 = 0.0;
    let mut first_lon: f64 = 0.0;
    let mut cur_lat: f64 = 0.0;
    let mut cur_lon: f64 = 0.0;
    let mut max_lat: f64 = 0.0;
    let mut max_lon: f64 = 0.0;
    let mut min_lat: f64 = 90.0;
    let mut min_lon: f64 = 90.0;

    // filter elevation data
    let mut yk: f64 = 0.;

    // prepare vectors
    distvec.clear();
    elevec.clear();
    lats.clear();
    lons.clear();

    // get stat, both from file if included, get vectors: lat, lon, dist, ele
    let mut clines = content.lines();
    while let Some(line) = clines.next() {
        // get the coordinates from the line : cur_lat, cur_lon
        if line.contains("<trkpt ") {
            // get the current coordinates
            match (get_lat_or_lon(line, "lat=\""), get_lat_or_lon(line, "lon=\"")) {
                (Ok(lat), Ok(lon)) => {
                    cur_lat = lat;
                    cur_lon = lon;
                    trkpt_open = true;
                    has_valid_elev = false;
                    continue;
                }
                _ => (),
            }
        } else if trkpt_open && line.contains("<ele>") && line.contains("</ele>") {
            if let Ok(result) = super::parse_float(line) {
                cur_ele = result;
                has_valid_elev = true;
                continue;
            } else {
                // skip the point because elevation is wrong
                trkpt_open = false;
                has_valid_elev = false;
                continue;
            }
        } else if line.contains("</trkpt") && trkpt_open && has_valid_elev {
            trkpt_open = false;
            has_valid_elev = false;
            n_trkpts += 1;

            // calculate the distance now
            if n_trkpts == 1 { 
                last_lat = cur_lat;
                last_lon = cur_lon;
                first_lat = cur_lat;
                first_lon = cur_lon;

                // add distance to vector. distance in km.
                distvec.push(cur_dist);
                lats.push(cur_lat);
                lons.push(cur_lon);

                // elevation data
                last_ele = cur_ele;
                // filter elevation data
                yk = cur_ele;
                elevec.push(cur_ele);
            } else if n_trkpts > 1 {
                // filter elevation data
                if filter > 0.0 {
                    yk = yk + filter * (cur_ele - yk);
                } else {
                    yk = cur_ele;
                }    
                cur_ele = yk;
                ele_delta = cur_ele - last_ele;
            
                if ele_delta.abs() > ele_smoothing {
                    if ele_delta>0.0{
                        ascent += ele_delta;
                    } else {
                        descent -= ele_delta;
                    }
                    last_ele = cur_ele;
                }

                cur_dist = super::distance(last_lat, last_lon, cur_lat, cur_lon);
                if cur_dist.abs() > dist_smoothing {
                    dist += cur_dist;
                    last_lat = cur_lat;
                    last_lon = cur_lon;
                    // add distance to vector. distance in km.
                    distvec.push(cur_dist);
                    lats.push(cur_lat);
                    lons.push(cur_lon);
                    elevec.push(cur_ele);
                } else {
                  trkpt_diff += 1;
                }
            }
                // get coord bounds
            if cur_lat > max_lat {
                max_lat = cur_lat;
            }
            if cur_lat < min_lat {
                min_lat = cur_lat;
            }
            if cur_lon > max_lon {
                max_lon = cur_lon;
            }
            if cur_lon < min_lon {
                min_lon = cur_lon;
            }

            // set the extrema values for elevation
            if cur_ele > max_ele {
                max_ele = cur_ele;
            }
            if cur_ele < min_ele {
                min_ele = cur_ele;
            }
        }
    }

    // check if the track is closed
    cur_dist = super::distance(last_lat, last_lon, first_lat, first_lon).abs();
    if cur_dist <= dist_smoothing {
        ascent = (ascent + descent) / 2.;
        descent = ascent;
    }
    
    n_trkpts = n_trkpts - trkpt_diff;
    
    (ascent, descent, dist, min_ele, max_ele, min_lat, min_lon, max_lat, max_lon, n_trkpts)
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_get_track_statistics_one_point() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"47.72\" lon=\"12.39\">
        <ele>605</ele>
        </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 0.0);
        assert_eq!(result.2, 0.0);
        assert_eq!(result.3, 605.0);
        assert_eq!(result.4, 605.0);
        assert_eq!(result.5, 47.72);
        assert_eq!(result.6, 12.39);
        assert_eq!(result.7, 47.72);
        assert_eq!(result.8, 12.39);
        assert_eq!(result.9, 1);
    }
    #[test]
    fn test_get_track_statistics_empty() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let result = crate::get_track_statistics("<ele>123.456</ele>", 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 0.0);
        assert_eq!(result.2, 0.0);
        assert_eq!(result.3, 10000.0);
        assert_eq!(result.4, -1000.0);
        assert_eq!(result.5, 90.0);
        assert_eq!(result.6, 90.0);
        assert_eq!(result.7, 0.0);
        assert_eq!(result.8, 0.0);
        assert_eq!(result.9, 0);
    }

    #[test]
    fn test_get_track_statistics_two_points_one_point_wrong() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"47.72\" lon=\"12.39\">
        <ele>605</ele>
        </trkpt>
        <trkpt lat=\"47.721\" lon=\"12.391\">
        <ele>abscd</ele>
        </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 0.0);
        assert_eq!(result.2, 0.0);
        assert_eq!(result.3, 605.0);
        assert_eq!(result.4, 605.0);
        assert_eq!(result.5, 47.72);
        assert_eq!(result.6, 12.39);
        assert_eq!(result.7, 47.72);
        assert_eq!(result.8, 12.39);
        assert_eq!(result.9, 1);
    }

    #[test]
    fn test_get_track_statistics_two_points() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"47.72\" lon=\"12.39\">
        <ele>605</ele>
        </trkpt>
        <trkpt lat=\"47.721\" lon=\"12.391\">
        <ele>615</ele>
        </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 10.0);
        assert_eq!(result.1, 0.0);
        assert_eq!(result.2, 0.13401593648062907);
        assert_eq!(result.3, 605.0);
        assert_eq!(result.4, 615.0);
        assert_eq!(result.5, 47.72);
        assert_eq!(result.6, 12.39);
        assert_eq!(result.7, 47.721);
        assert_eq!(result.8, 12.391);
        assert_eq!(result.9, 2);
    }

    #[test]
    fn test_get_track_statistics_4_points() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"47.72\" lon=\"12.39\">
        <ele>605</ele>
        </trkpt>
        <trkpt lat=\"47.721\" lon=\"12.391\">
        <ele>705</ele>
        </trkpt>
        <trkpt lat=\"47.722\" lon=\"12.392\">
        <ele>805</ele>
        </trkpt>
        <trkpt lat=\"47.723\" lon=\"12.393\">
        <ele>505</ele>
        </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 200.0);
        assert_eq!(result.1, 300.0);
        assert_eq!(result.2, 0.40204540495859076);
        assert_eq!(result.3, 505.0);
        assert_eq!(result.4, 805.0);
        assert_eq!(result.5, 47.72);
        assert_eq!(result.6, 12.39);
        assert_eq!(result.7, 47.723);
        assert_eq!(result.8, 12.393);
        assert_eq!(result.9, 4);
    }

    #[test]
    fn test_get_track_statistics_4_points_one_wrong() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"47.72\" lon=\"12.39\">
        <ele>605</ele>
        </trkpt>
        <trkpt lat=\"47.721\" loxn=\"12.391\">
        <ele>705</ele>
        </trkpt>
        <trkpt lat=\"47.722\" lon=\"12.392\">
        <ele>805</ele>
        </trxxxxxxxxxxxkpt>
        <trkpt lat=\"47.723\" lon=\"12.393\">
        <ele>505</ele>
        </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 100.0);
        assert_eq!(result.2, 0.40204540489488133);
        assert_eq!(result.3, 505.0);
        assert_eq!(result.4, 605.0);
        assert_eq!(result.5, 47.72);
        assert_eq!(result.6, 12.39);
        assert_eq!(result.7, 47.723);
        assert_eq!(result.8, 12.393);
        assert_eq!(result.9, 2);
    }

    #[test]
    fn test_get_track_statistics_2_points_long() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"46.52\" lon=\"12.92\">
        <ele>947</ele>
        <time>2023-10-03T06:14:33.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>108</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
        <ele>948</ele>
        <time>2023-10-03T06:14:35.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>105</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 1.0);
        assert_eq!(result.1, 0.0);
        assert_eq!(result.2, 0.6309702939885793);
        assert_eq!(result.3, 947.0);
        assert_eq!(result.4, 948.0);
        assert_eq!(result.5, 46.52);
        assert_eq!(result.6, 12.92);
        assert_eq!(result.7, 46.523);
        assert_eq!(result.8, 12.927);
        assert_eq!(result.9, 2);
    }

    #[test]
    fn test_get_track_statistics_3_points_long() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"46.52\" lon=\"12.92\">
        <ele>47</ele>
        <time>2023-10-03T06:14:33.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>108</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
        <ele>1947</ele>
        <time>2023-10-03T06:14:35.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>105</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.93\">
        <time>2023-10-03T06:14:35.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>105</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
        <ele>-53</ele>
      </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 1900.0);
        assert_eq!(result.1, 2000.0);
        assert_eq!(result.2, 0.8604977505965244);
        assert_eq!(result.3, -53.0);
        assert_eq!(result.4, 1947.0);
        assert_eq!(result.5, 46.52);
        assert_eq!(result.6, 12.92);
        assert_eq!(result.7, 46.523);
        assert_eq!(result.8, 12.93);
        assert_eq!(result.9, 3);
    }

    #[test]
    fn test_get_track_statistics_3_points_wrong() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"46.52\" lon=\"12.92\">
        <ele>47</ele>
        <time>2023-10-03T06:14:33.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>108</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
        <time>2023-10-03T06:14:35.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>105</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
        <ele>-53</ele>
      </trkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 100.0);
        assert_eq!(result.2, 0.6309702939885793);
        assert_eq!(result.3, -53.0);
        assert_eq!(result.4, 47.0);
        assert_eq!(result.5, 46.52);
        assert_eq!(result.6, 12.92);
        assert_eq!(result.7, 46.523);
        assert_eq!(result.8, 12.927);
        assert_eq!(result.9, 2);
    }

    #[test]
    fn test_get_track_statistics_4_points_wrong() {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content = "<trkpt lat=\"46.52\" lon=\"12.92\">
        <ele>47</ele>
        <time>2023-10-03T06:14:33.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>108</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
      </trkpt>
      <trkpt lat=\"46.523\" lon=\"12.927\">
        <time>2023-10-03T06:14:35.000Z</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:hr>105</ns3:hr>
            <ns3:cad>49</ns3:cad>
          </ns3:TrackPointExtension>
        </extensions>
        <ele>-53</ele>
      </trkpt>
      <trkpt lat=\"46.5231\" lon=\"12.9271\">
        <time>2023-10-03T06:14:35.000Z</time>
        <ele>100</ele>
      </trXXXXXkpt>";

        let result = crate::get_track_statistics(content, 0.0, 0.0, 0.0, &mut dists, &mut elevs, &mut lats, &mut lons);
        assert_eq!(result.0, 0.0);
        assert_eq!(result.1, 100.0);
        assert_eq!(result.2, 0.6309702939885793);
        assert_eq!(result.3, -53.0);
        assert_eq!(result.4, 47.0);
        assert_eq!(result.5, 46.52);
        assert_eq!(result.6, 12.92);
        assert_eq!(result.7, 46.523);
        assert_eq!(result.8, 12.927);
        assert_eq!(result.9, 2);
    }

}