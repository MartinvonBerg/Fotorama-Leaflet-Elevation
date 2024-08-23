use wasm_bindgen::prelude::*;
use js_sys::Float64Array;

mod dist;
use dist::*;
//mod func_plot;
//extern crate web_sys;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
/*
macro_rules! conlog {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
} */

#[wasm_bindgen]
pub fn get_array(ptr: *mut f64, count: usize) -> Float64Array {
    unsafe { Float64Array::view(std::slice::from_raw_parts(ptr, count)) }
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct AllGpxStats2 {
    asc: f64,
    desc: f64,
    min: f64,
    max: f64,
    dist: f64,
    minlat: f64,
    minlon: f64,
    maxlat: f64,
    maxlon: f64,
    eleptr: *mut f64,
    disptr: *mut f64,
    latptr: *mut f64,
    lonptr: *mut f64,
    npts: i32,
    //chart1: Chart,
    //chart2: Chart,
}

#[wasm_bindgen]	
impl AllGpxStats2 {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AllGpxStats2 {
        AllGpxStats2 {
            asc: 0.0,
            desc: 0.0,
            min: 0.0,
            max: 0.0,
            dist: 0.0,
            minlat: 0.0,
            minlon: 0.0,
            maxlat: 0.0,
            maxlon: 0.0,
            eleptr: std::ptr::null_mut(),
            disptr: std::ptr::null_mut(),
            latptr: std::ptr::null_mut(),
            lonptr: std::ptr::null_mut(),
            npts: 0,
            //chart1: Chart::new(),
            //chart2: Chart::new(),
        }
    }
    
    #[wasm_bindgen(getter)]
    pub fn asc(&self) -> f64 {
        self.asc
    }
    
    #[wasm_bindgen(getter)]
    pub fn desc(&self) -> f64 {
        self.desc
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> f64 {
        self.min
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> f64 {
        self.max
    }

    #[wasm_bindgen(getter)]
    pub fn dist(&self) -> f64 {
        self.dist
    }

    #[wasm_bindgen(getter)]
    pub fn minlat(&self) -> f64 {
        self.minlat
    }

    #[wasm_bindgen(getter)]
    pub fn minlon(&self) -> f64 {
        self.minlon
    }

    #[wasm_bindgen(getter)]
    pub fn maxlat(&self) -> f64 {
        self.maxlat
    }

    #[wasm_bindgen(getter)]
    pub fn maxlon(&self) -> f64 {
        self.maxlon
    }

    #[wasm_bindgen(getter)]
    pub fn npts(&self) -> i32 {
        self.npts
    }

    #[wasm_bindgen(getter)]
    pub fn eleptr(&self) -> *mut f64 {
        self.eleptr
    }

    #[wasm_bindgen(getter)]
    pub fn disptr(&self) -> *mut f64 {
        self.disptr
    }

    #[wasm_bindgen(getter)]
    pub fn latptr(&self) -> *mut f64 {
        self.latptr
    }

    #[wasm_bindgen(getter)]
    pub fn lonptr(&self) -> *mut f64 {
        self.lonptr
    }
    /* 
    #[wasm_bindgen(getter)]
    pub fn chart1(&self) -> Chart {
        Chart { convert: Box::new(|_| None) }
    }

    #[wasm_bindgen(getter)]
    pub fn chart2(&self) -> Chart {
        Chart { convert: Box::new(|_| None) }
    }
    */
}

#[wasm_bindgen]
pub struct AllGpxStats {
    file_content: String,
}

#[wasm_bindgen]
impl AllGpxStats {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AllGpxStats {
        let val = AllGpxStats { file_content: String::from("NULL") };
        val
    }

    #[wasm_bindgen(getter)]
    pub fn file_content(&self) -> String {
        self.file_content.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_file_content(&mut self, content: String) {
        self.file_content = content;
    }
    
    pub async fn get_url(&self, esm:f64, dsm:f64, check_len: usize, filter: f64) -> AllGpxStats2 {
        let mut elevs: Vec<f64> = vec![];
        let mut dists: Vec<f64> = vec![];
        let mut lats: Vec<f64> = vec![];
        let mut lons: Vec<f64> = vec![];

        let content: &String = &self.file_content;
        let len_content_diff = content.len() - check_len;

        if content == "" || content == "NULL" {
            log("no file content");
        }

        if len_content_diff > 10 {
            log(&format!("Error content length Diff = {}", len_content_diff));
        }  

        let (asc,desc,dist,minele,maxele,minlat, minlon, maxlat, maxlon,n) = 
            get_track_statistics(&self.file_content, esm, dsm, filter, &mut dists, &mut elevs, &mut lats, &mut lons);
        
        let ptr1: *mut f64 = elevs.as_mut_ptr();
        let ptr2: *mut f64 = dists.as_mut_ptr();
        let ptr3: *mut f64 = lats.as_mut_ptr();
        let ptr4: *mut f64 = lons.as_mut_ptr();

        //let info: String = format!("Asc: {:.1} m / Desc: {:.1} m / Dist: {:.1} km / Npts: {}", asc, desc, dist, n);
        //let chart1 = Chart::gpx("gpx_canvas1", "test", info, ptr2, ptr1, n as usize, 0., dist, minele, maxele).unwrap();
        //let chart2 = Chart::gpx("gpx_canvas2", "track", "Map".to_string(), ptr4, ptr3, n as usize, minlon, maxlon, minlat, maxlat ).unwrap();
    
        let test = AllGpxStats2 { asc: asc, desc: desc, min: minele, max: maxele, dist: dist, minlat: minlat, minlon: minlon, maxlat: maxlat, maxlon: maxlon, 
            eleptr:ptr1, disptr:ptr2, latptr:ptr3, lonptr:ptr4, npts: n };
        test
    }
}


// ------------------ plotters-part ---------------------------
// Type alias for the result of a drawing function.
//pub type DrawResult<T> = Result<T, Box<dyn std::error::Error>>;
/*
/// Result of screen to chart coordinates conversion.
#[wasm_bindgen]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

/// Type used on the JS side to convert screen coordinates to chart coordinates.

#[wasm_bindgen]
pub struct Chart {
    convert: Box<dyn Fn((i32, i32)) -> Option<(f64, f64)> >,
}
/*
This code is written in Rust, and it defines a public struct called Chart. Inside the Chart struct, there is a field named convert, which is of type Box<dyn Fn((i32, i32)) -> Option<(f64, f64)>>.

Let's break it down:

pub struct Chart { ... }: This line defines a public struct named Chart.

convert: Box<dyn Fn((i32, i32)) -> Option<(f64, f64)>>: This line declares a field named convert inside the Chart struct. The field is of type Box<dyn Fn((i32, i32)) -> Option<(f64, f64)>>.

Box<...>: The Box type in Rust is used to store data on the heap. It provides a way to store a value of any type in a memory location that is allocated at runtime.

dyn Fn((i32, i32)) -> Option<(f64, f64)>: This part specifies that the convert field is a trait object. It means that the convert field can hold any function that takes a tuple of two i32 values as input and returns an optional tuple of two f64 values. The Fn trait is a trait for types that can be called like a function, and Option is an enum in Rust that represents either Some or None.

In summary, the code defines a public struct Chart with a field convert that can hold a boxed function taking a tuple of two i32 values and returning an optional tuple of two f64 values.
 */
#[wasm_bindgen]
impl Chart {
    pub fn new() -> Chart {
        Chart { convert: Box::new(|_| None) }
    }

    pub fn gpx(canvas_id: &str, trname: &str, info: String, xptr: *mut f64, yptr: *mut f64, len:usize, xmin: f64, xmax: f64, ymin: f64, ymax: f64) -> Result<Chart, JsValue> {
        let map_coord = func_plot::draw_gpx(canvas_id, trname, &info, xptr, yptr,len, xmin, xmax, ymin, ymax).map_err(|err| err.to_string())?;
        Ok(Chart {
            convert: Box::new(move |coord| map_coord(coord).map(|(x, y)| (x.into(), y.into()))),
        })
    }

    /// This function can be used to convert screen coordinates to chart coordinates.
    pub fn coord(&self, x: i32, y: i32) -> Option<Point> {
        (self.convert)((x, y)).map(|(x, y)| Point { x, y })
    }
}
    */