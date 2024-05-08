/// Calculate the distance between two points in meters
/// 
/// Note: Height Correction is not used
/// 
/// * `lat1, lon1` - first point, like 14.323, 15.323
/// 
/// * `lat2, lon2` - second point, like 35.634, 35.674
/// 
/// Returns distance in kilometers
/// 
#[inline]
pub fn distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r: f64 = 12742.; // 6371 * 2
    let d_lat: f64 = ( (lat2.to_radians() - lat1.to_radians() ) / 2.).sin(); // phi
    let d_lon: f64 = ( (lon2.to_radians() - lon1.to_radians() ) / 2.).sin(); // lambda
    
    let a: f64 = d_lat * d_lat + lat1.to_radians().cos() * lat2.to_radians().cos() * d_lon * d_lon;
    let d: f64 = r * ((a.sqrt()).atan2((1.0-a).sqrt()));
    d
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_distance() {
        let d = crate::distance(50.0, 51., 10.0, 11.0) - 5763.65;
        assert_eq!( format!("{:.2}", d), "0.00");

        let d = crate::distance(49.0, 12., 49.1, 12.1)-13.29;
        assert_eq!( format!("{:.2}", d), "0.00");

        let d = crate::distance(89.99, 90., 90., 90.)-1.112;
        assert_eq!( format!("{:.2}", d.abs()), "0.00");

        let d = crate::distance(12.39354613,47.72882722, 12.39399601,47.72888672 )*1000.-50.44;
        assert_eq!( format!("{:.2}", d.abs()), "0.00");
    }
}