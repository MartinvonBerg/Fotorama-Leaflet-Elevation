use std::error;
/// get the current coordinates from line
/// 
/// * `line` - the line to parse
/// 
/// * `findwhat` - the string to search for
/// 
/// Returns lat or lon or Error
///
pub fn get_lat_or_lon(line: &str, findwhat: &str) -> Result<f64, Box<dyn error::Error>> {
    let poslat: Option<usize>;
    let index: Option<usize>;
    let cur_lat: f64;
    let value: usize;

    poslat = line.find( findwhat );
    match poslat {
        Some(poslat) => {value = poslat + 5;},
        None => return Err("no coords found".into()),
    }
    
    index = line[value..].find("\"").map(|i| i + value);
    match index {
        Some(index) => {cur_lat = line[value..index].parse()?;},
        None => return Err("no coords found".into()),
    }
    
    Ok(cur_lat)
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_get_lat_or_lon() {
        let test = crate::get_lat_or_lon("testdfg5634xb2", "lat=\"");
        assert!(test.is_err());

        let test = crate::get_lat_or_lon("<trkpt lat=\"48.245588\" lon=\"12.828193\">", "lat=\"").unwrap();
        assert_eq!(test, 48.245588);

        let test = crate::get_lat_or_lon("<trkpt lat=\"48.245588\" lon=\"12.828193\">", "lon=\"").unwrap();
        assert_eq!(test, 12.828193);

        let test = crate::get_lat_or_lon("<trkpt lat=\"48.24__5588\" lon=\"12.828193\">", "lat=\"");
        assert!(test.is_err());
        assert_eq!(test.unwrap_err().to_string(), "invalid float literal");

        let test = crate::get_lat_or_lon("<trkpt lat=\"48.24 >", "lat=\"");
        assert!(test.is_err());

    }
}