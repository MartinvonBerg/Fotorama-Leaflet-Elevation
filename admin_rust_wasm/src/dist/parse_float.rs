use std::str;
use std::error;

/// Parse a float from a string with a decimal point and other characters
/// 
/// * `text` - text to parse
/// 
/// Returns float or Error
/// 
pub fn parse_float(text: &str) -> Result<f64, Box<dyn error::Error>> {
    // alternative II using chars:
    let mut buf: Vec<u8> =vec![];
    let iter: str::Chars<'_> = text.chars();

    for c in iter {
        if c == '-' ||c == '0' || c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' || c == '8' || c == '9' || c == '.' {
            buf.push(c as u8);
        }
    }

    let s = str::from_utf8(&buf)?;
    let e = s.parse::<f64>()?;
    Ok(e)
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_parse_float() {
        let e = crate::parse_float("1.0").unwrap();
        assert_eq!(e, 1.0);

        let e = crate::parse_float("1,001234").unwrap();
        assert_eq!(e, 1001234.);

        let e2 = crate::parse_float("💖");
        assert!(e2.is_err());

        let e = crate::parse_float("abcd");
        assert!(e.is_err());

        let e = crate::parse_float("");
        assert!(e.is_err());
    }
}