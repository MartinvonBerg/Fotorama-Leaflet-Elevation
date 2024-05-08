use crate::DrawResult;
use plotters::prelude::*;
use plotters_canvas::CanvasBackend;
use core::f64;

/// Draw function for gpx
pub fn draw_gpx(canvas_id: &str, trackname: &str, info: &str, xptr: *mut f64, yptr: *mut f64, len: usize, xmin: f64, xmax: f64, ymin: f64, ymax: f64) -> DrawResult<impl Fn((i32, i32)) -> Option<(f32, f32)>> {
    
    let xvals: &[f64]= unsafe { std::slice::from_raw_parts(xptr, len) };
    let yvals: &[f64]= unsafe { std::slice::from_raw_parts(yptr, len) };
    let mut data2: Vec<(f32, f32)> = vec![];
    let mut sum: f32 = 0.0;
    let ixmin: f32;
    let ixmax: f32;
    let iymin: f32;
    let iymax: f32;

    let margin: u32 = 10; // px
    let x_label_size: u32 = 30; // px
    let y_label_size: u32 = 40; // px

    if trackname != "track" {
        // calc y,x min max here
        ixmin = 0.; //( (xmin /10.).round() as f32) *10.;
        ixmax = ( (xmax /10.).ceil() as f32) *10.;
        iymin = ( (ymin /100.).floor() as f32) *100.;
        iymax = ( (ymax /100.).ceil() as f32) *100.;
        for i in 0..len {
            sum += xvals[i] as f32;
            data2.push((sum, yvals[i] as f32));
        }
    } else {
        ixmin = xmin as f32;
        ixmax = xmax as f32;
        iymin = ymin as f32;
        iymax = ymax as f32;
        for i in 0..len {
            data2.push((xvals[i] as f32, yvals[i] as f32));
        }
    }

    let backend = CanvasBackend::new(canvas_id).expect("cannot find canvas");
    let root = backend.into_drawing_area();
    let font: FontDesc = ("sans-serif", 16.0).into();
    root.fill(&WHITE)?;

    let mut chart = ChartBuilder::on(&root)
        .margin(margin)
        .caption(format!("{}", info), font)
        .x_label_area_size(x_label_size)
        .y_label_area_size(y_label_size)
        .build_cartesian_2d(ixmin..ixmax, iymin..iymax)?;

    if trackname != "track" {
        chart.configure_mesh()
            .x_labels(10)
            .y_labels(10)
            .y_label_formatter(&|x| format!("{:.0}", x))
            .draw()?;
        chart.draw_series(LineSeries::new( data2, &RED))?;
    } else {
        chart.configure_mesh()
            .x_labels(10)
            .x_label_formatter(&|x| format!("{:.3}", x))
            .y_labels(12)
            .y_label_formatter(&|x| format!("{:.3}", x))
            .draw()?;
        chart.draw_series(LineSeries::new( data2, &RED).point_size(0))?;
    }
    
    root.present()?;
    return Ok(chart.into_coord_trans());
}
