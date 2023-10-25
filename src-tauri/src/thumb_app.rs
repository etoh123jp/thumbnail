use anyhow::Result;
// use image::{ImageBuffer, ImageEncoder};
// use image::codecs::gif::{GifDecoder, GifEncoder,GifReader};
// use image::codecs::webp::{WebPEncoder};
// use image::{ImageOutputFormat, DynamicImage,AnimationDecoder,Frames};
// use imageproc::drawing::Canvas;
// use imageproc::{drawing, rect::Rect};
// use gif as ggif;
// use ggif::{Decoder, Encoder};

use base64::Engine;
const CUSTOM_ENGINE: base64::engine::GeneralPurpose =
base64::engine::GeneralPurpose::new(&alphabet::STANDARD, general_purpose::NO_PAD);
use base64::alphabet;
use base64::engine::general_purpose;
// use std::io::{Cursor, BufWriter};
// use std::path::PathBuf;
// use std::sync::Arc;
use async_zip::tokio::read::seek::ZipFileReader as AsyncZipFileReader;
use tokio::fs::File;
// use tokio::sync::broadcast;
// use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};
use tokio::sync::mpsc;
// use tokio::io::AsyncReadExt;


// use webp_animation::prelude::*;
// use std::io::Read;
pub struct TaskManager {
    task_tx: mpsc::Sender<i32>,
    task_rx: Option<mpsc::Receiver<i32>>,
    result_tx: mpsc::Sender<String>,
    result_rx: mpsc::Receiver<String>,
    stop_tx: mpsc::Sender<()>,
    stop_rx: Option<mpsc::Receiver<()>>,
    archive: Option<AsyncZipFileReader<File>>,
    files: Vec<String>,
}

impl TaskManager {
    pub async fn new() -> Self {
        let (task_tx, task_rx) = mpsc::channel(32);
        let (result_tx, result_rx) = mpsc::channel(32);
        let (stop_tx, stop_rx) = mpsc::channel(1);
		let task_rx = Some(task_rx);
		let stop_rx = Some(stop_rx);
        Self {
            task_tx,
            task_rx,
            result_tx,
            result_rx,
            stop_tx,
            stop_rx,
            archive: None,
            files: Vec::new(),
        }
    }
	pub async fn open_new_file(&mut self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
		let file = tokio::fs::File::open(path).await?;
		let res = AsyncZipFileReader::with_tokio(file).await;
		
		match res {
			Ok(archive) => {
				self.files.clear();
				archive.file().entries().iter().for_each(|item| {
					let name = item.entry().filename().as_str();
					match name {
						Ok(name) => {
							self.files.push(name.to_string());
						},
						Err(e) => {
							println!("{:?}", e);
						}
					}
				});
				let _old = self.archive.replace(archive);
				drop(_old);
				Ok(())
			},
			Err(e) => Err(e.into())
		}
	}
	
	pub async fn task_loop(&mut self) {
        let mut task_rx = self.task_rx.take().unwrap();
        let result_tx = self.result_tx.clone();
        let mut stop_rx =  self.stop_rx.take().unwrap();
		//
		let mut reader = self.archive.take().unwrap();
        tokio::spawn(async move {
            loop {
                tokio::select! {
                    Some(index) = task_rx.recv() => {
						let reader = reader.reader_with_entry(index as usize).await;
                        
						//ここでarchiveからデータを取得してBase64でエンコードする処理を行う
						match reader {
							Ok(mut file) => {
								// read file
								let mut buf: Vec<u8> = Vec::new();
								let res = file.read_to_end_checked(&mut buf).await;
								match res {
									Ok(_) => {
										// create base64 data
										let encoded_data = CUSTOM_ENGINE.encode(&buf);
                        				let _re = result_tx.send(encoded_data);
									},
									Err(e) => {
										println!("error:{}", e);
									}
								}
							},
							Err(e) => {
								println!("error:{}", e);
							}
						}
                    }
                    None = stop_rx.recv() => {
                        println!("Task stopped.");
                        break;
                    }
                    else => {
                        // Handle error
                        println!("Task error stopped.");
						break;
                    }
                }
            }
        });
    }

	
    pub async fn send_task(&self, task: i32) {
    	match self.task_tx.send(task).await {
			Ok(_) => (),
			Err(e) => {
				println!("Failed to send task {}",e);
			}
		}
    }

    pub async fn receive_result(&mut self) -> String {
        self.result_rx.recv().await.expect("receive result")
    }

    pub async fn stop(&self) {
        self.stop_tx.send(()).await.expect("send stop");
    }
	// #reginon comment
	// #[allow(dead_code)]
	// pub async fn resize_image(image: &DynamicImage, size: (u32, u32)) -> std::result::Result<Vec<u8>, String> {
	// 	let (width, height) = image.dimensions();
	// 	// 画像のサイズをチェックし、指定のサイズよりも大きかったらアスペクトをあわせて縮小します。
	// 	let new_image = if width > size.0 || height > size.1 {
	// 		image.resize(size.0, size.1, image::imageops::FilterType::Lanczos3)
	// 	} else {
	// 		image.clone()
	// 	};
	// 	// 画像をバイトデータに変換します。
	// 	let mut data = Cursor::new(Vec::new());
	// 	new_image.write_to(&mut data, ImageOutputFormat::Png)
	// 		.map_err(|e| format!("Failed to write image data: {}", e))?;
	// 	Ok(data.into_inner())
	// }
	// async fn gif_to_webp(gif_path: &str, webp_path: &str) -> Result<(), Box<dyn std::error::Error>> {
	// 	// GIFを読み込む
	// 	let gg: DynamicImage = image::open(gif_path)?;
	// 	let file = std::fs::File::open(gif_path).unwrap();
	// 	let decoder = GifDecoder::new(file).unwrap();
	// 	let (w, h ) = gg.dimensions();
	// 	let color = gg.color();
	// 	let frames = decoder.into_frames();
	// 	// WebPエンコーダを作成
	// 	let webp_file = tokio::fs::File::create(webp_path).await?;
	// 	let writer = tokio::io::BufWriter::new(webp_file);
	// 	let mut wa: webp_animation::Encoder = webp_animation::Encoder::new((w,h)).unwrap();
	// 	// WebPエンコーダを作成
	// 	// 各フレームをWebPエンコーダに追加
	// 	let mut final_timestamp_ms:i32 = 0;
	// 	for frame in frames  {
	// 		let frame = frame.unwrap();
	// 		let (a, b) = frame.delay().numer_denom_ms();
	// 		let delay = a * 1000 / b;
	// 		let buf = frame.into_buffer();
	// 		let buf = &buf.to_vec();
	// 		wa.add_frame(buf, delay as i32 ).unwrap();
	// 		final_timestamp_ms += delay as i32;
	// 	}
	// 	let webp_data = wa.finalize(final_timestamp_ms).unwrap();
	// 	std::fs::write("my_animation.webp", webp_data).unwrap();
	// 	// WebPをファイルに書き込む
	// 	// let webp_file = File::create(webp_path)?;
	// 	// let mut writer = BufWriter::new(webp_file);
	// 	// webp_encoder.write(&mut writer)?;
	// 	Ok(())
	// }
	// #endregion
}