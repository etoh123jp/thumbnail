use image::{DynamicImage, GenericImageView, imageops, codecs::webp, codecs::gif };
use webp_animation;
use image::ImageDecoder;
use image::{self, ImageOutputFormat, AnimationDecoder, Frame};
use std::io::Cursor;
use std::path::PathBuf;
use tokio::{fs::File, io::BufWriter};
use tokio::io::AsyncWriteExt;
use log;

#[allow(dead_code)]
pub async fn resize_image(image: &DynamicImage, size: (u32, u32)) -> std::result::Result<Vec<u8>, String> {
    let (width, height) = image.dimensions();

    // 画像のサイズをチェックし、指定のサイズよりも大きかったらアスペクトをあわせて縮小します。
    let new_image = if width > size.0 || height > size.1 {
        image.resize(size.0, size.1, image::imageops::FilterType::Lanczos3)
    } else {
        image.clone()
    };

    // 画像をバイトデータに変換します。
    let mut data = Cursor::new(Vec::new());
    new_image.write_to(&mut data, ImageOutputFormat::Png)
        .map_err(|e| format!("Failed to write image data: {}", e))?;

    Ok(data.into_inner())
}





#[allow(dead_code)]
pub async fn resize_and_get_avif_data(image: &DynamicImage, size: (u32, u32)) -> std::result::Result<Vec<u8>, String> {

    let (width, height) = image.dimensions();

    let new_image = if width > size.0 || height > size.1 {
        let aspect_ratio = width as f64 / height as f64;
        if aspect_ratio > 1.0 {
            // 横長の画像
            image.resize(size.0, (size.0 as f64 / aspect_ratio) as u32, imageops::FilterType::Lanczos3)
        } else {
            // 縦長の画像
            image.resize((size.1 as f64 * aspect_ratio) as u32, size.1, imageops::FilterType::Lanczos3)
        }
    } else {
        image.clone()
    };

    let mut buffer = Cursor::new(Vec::new());
    new_image.write_to(&mut buffer, ImageOutputFormat::Avif)
        .map_err(|e| format!("Failed to write image data: {}", e))?;

    Ok(buffer.into_inner())
}
#[allow(dead_code)]
pub async fn resize_image_and_convert_to_webp(image: &DynamicImage, size: (u32, u32)) ->std::result:: Result<Vec<u8>, image::ImageError> {
     // 画像を読み込む
	 let (width, height) = image.dimensions();
	 log::info!("Original dimensions: {}x{}", width, height);
	 let new_image = if width > size.0 || height > size.1 {
		 let aspect_ratio = width as f64 / height as f64;
		 if aspect_ratio > 1.0 {
			 // 横長の画像
			 image.resize(size.0, (size.0 as f64 / aspect_ratio) as u32, imageops::FilterType::Lanczos3)
		 } else {
			 // 縦長の画像
			 image.resize((size.1 as f64 * aspect_ratio) as u32, size.1, imageops::FilterType::Lanczos3)
		 }
	 } else {
		 image.clone()
	 };
	let res = tokio::spawn(async move {
		let mut buffer = Cursor::new(Vec::new());
		let encoder = webp::WebPEncoder::new(&mut buffer);
		let (width, height) = new_image.dimensions();
		log::info!("new_image dimensions: {}x{}", width, height);
		let color_type = new_image.color();
		let res = encoder.encode(&new_image.into_bytes(), width, height, color_type);
		match res {
			Ok(_) => Ok(buffer.into_inner()),
			Err(e) => {
				print!("Error occurred in resize_image_and_convert_to_webp: {:?}", e);
				Err(e)
			} 
		}
	}).await;
	let res = res.unwrap();
	match res {
		Ok(res) => {
			Ok(res)
		},
		Err(e) => {
			print!("Error occurred in resize_image_and_convert_to_webp: {:?}", e);
			Err(e)
		}
	}
}

#[allow(dead_code)]
pub async fn gif_to_webp(gif_path: &str, webp_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // GIFを読み込む
	let file_in = std::fs::File::open(gif_path)?;
    let decoder = gif::GifDecoder::new(file_in).unwrap();
	let dimensions = decoder.dimensions();
    let frames = decoder.into_frames();
    // WebPエンコーダを作成
    let mut encoder = webp_animation::Encoder::new(dimensions)?;

    // 各フレームをWebPエンコーダに追加
    for frame_result in frames {
		let frame = frame_result?;
		let (numer, denom) = frame.delay().numer_denom_ms();
		let delay_ms = numer as i32 / denom as i32;
		encoder.add_frame(frame.buffer(), delay_ms)?;

	}

    // WebPをファイルに書き込む
    let webp_file = tokio::fs::File::create(webp_path).await?;
    let mut writer = BufWriter::new(webp_file);
    let data = encoder.finalize(1000)?;
	writer.write_all(&data).await?;
	Ok(())
}










