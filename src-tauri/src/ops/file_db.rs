

use sqlx::sqlite::SqliteQueryResult;
use sqlx::{migrate::MigrateDatabase, Row, QueryBuilder,  SqlitePool};
use std::path::Path;
use tokio::fs;
use sqlx::{query_as,};
use sqlx::{sqlite::SqliteConnectOptions, Error};
use sqlx::{Connection, Sqlite, Transaction};
use sqlx::{Executor, SqliteConnection};
use crate::models::fs::DirData;
use anyhow::Result;
const DB_URL: &str = "sqlite://database.db";

#[derive(Debug, Clone)]
pub struct Database {
	pool: SqlitePool ,
}

impl Database {
	pub async fn new() -> anyhow::Result< Self, sqlx::Error> {
		// データベースファイルの存在を確認
        
        if !Sqlite::database_exists(DB_URL).await.unwrap_or(false) {
			println!("Creating database {}", DB_URL);
			match Sqlite::create_database(DB_URL).await {
				Ok(_) => println!("Create db success"),
				Err(error) => panic!("error: {}", error),
			}
		} else {
			println!("Database already exists");
		}
        // データベースとの接続を確立
        let pool = SqlitePool::connect(DB_URL).await?;
        
        let db = Database { pool };

        Ok(db)
	}

	pub async fn initialize(&self) -> anyhow::Result<(), sqlx::Error> {
		// テーブルの初期化処理
		let res = sqlx::query(
			r#"
			CREATE TABLE IF NOT EXISTS paths (
				id INTEGER PRIMARY KEY,
				path TEXT NOT NULL unique
			);
			CREATE TABLE IF NOT EXISTS thumbnails (
				id INTEGER PRIMARY KEY,
				thumbnail_data BLOB NOT NULL,
				path_id INTEGER NOT NULL REFERENCES paths(id) ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS hashes (
				id INTEGER PRIMARY KEY,
				hash_value CHAR(64) NOT NULL ,
				path_id INTEGER NOT NULL REFERENCES paths(id) ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS duplicates (
				id INTEGER PRIMARY KEY,
				hash_id INTEGER NOT NULL REFERENCES hashes(id) ON DELETE CASCADE,
				path_id INTEGER NOT NULL REFERENCES paths(id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS idx_paths_path ON paths(path);
			CREATE INDEX IF NOT EXISTS idx_hashes_hash_value ON hashes(hash_value);
			"#
		)
		.execute(&self.pool)
		.await;
		match res {
			Ok(r) =>{
				Ok(())
			},
			Err(e) => {
				print!("Failed to initialize the tables: {:?}", e);
				Err(e)
			}
		}
		
	}

	pub async fn add_path(&self, path_value: &str) ->  Result<i32, Error>{
		println!("add_path   {} ", path_value);
		let result = sqlx::query("INSERT INTO paths (path) VALUES (?)")
		.bind(path_value)
			.execute(&self.pool)
			.await;
		match result {
			Ok(ok) => {
				Ok(ok.last_insert_rowid() as i32 )
			},
			Err(e) => {
				Err(e)
			}
		}
	}

 	// ファイルパスから主キーを検索するメソッド
	pub async fn find_exists_by_path(&self, file_path: &str) -> Result<i32, sqlx::Error> {
		//
		let result: Option<(i32,)> = sqlx::query_as("SELECT id FROM paths WHERE path = ?")
			.bind(file_path)
			.fetch_optional(&self.pool)
			.await?;
		match result  {
			Some(id) => {
				 Ok(id.0)
			},
			None => {
				Err(sqlx::Error::RowNotFound)
			}
		}
	}
	pub async fn check_hash_exists_by_path(&self, path: &str) ->  Result<i32, Error> {
		let result: Option<(i32,)> = sqlx::query_as("SELECT COUNT path_id FROM hashes WHERE path_id = ?")
			.bind(path)
			.fetch_optional(&self.pool)
			.await?;
		print!("result: {:?}", result);
		
		match result {
			Some(id) => {
				Ok(id.0)
			},
			None => {
				Err(Error::RowNotFound)
			}
		}
		
	}
	pub async fn check_hash_exists(&self, hash_value: &str) ->  Result<i32, Error> {
		let result: (i32,) = sqlx::query_as("SELECT COUNT(*) FROM hashes WHERE hash_value = ?")
			.bind(hash_value)
			.fetch_one(&self.pool)
			.await?;
		
		Ok(result.0)
	}

	pub async fn update_path(&self, old_path: &str, new_path: &str) ->  Result<bool, Error> {
		let result = sqlx::query("UPDATE paths SET path = ? WHERE path = ?")
			.bind(old_path)
			.bind(new_path)
			.execute(&self.pool)
			.await?;

		Ok(result.rows_affected() > 0)
	}
	pub async fn add_hash(&self, hash_value: &str, path_id: i32) ->  Result<i32, Error> {
		let result = sqlx::query("INSERT OR IGNORE INTO hashes (hash_value, path_id) VALUES (?, ?)")
			.bind(hash_value)
			.bind(path_id)
			.execute(&self.pool)
			.await;
		match result {
			Ok(res) => Ok(res.last_insert_rowid() as i32),
			Err(e) => Err(e),
		}
	}
	pub async fn check_thumbnail_exists(&self, path_id: i32) ->  Result<i32, Error> {
		let result: (i32,) = sqlx::query_as("SELECT COUNT(*) FROM thumbnails WHERE path_id = ?")
			.bind(path_id)
			.fetch_one(&self.pool)
			.await?;
		
		Ok(result.0)
	}
	pub async fn get_thumbnail_data(&self, path : &str) -> Result<Vec<u8>, Error> {
		let result: (Vec<u8>,) = sqlx::query_as("SELECT t.thumbnail_data FROM thumbnails AS t JOIN paths AS p ON t.path_id = p.id WHERE p.path = ?;")
			.bind(path)
			.fetch_one(&self.pool)
			.await?;
		
		Ok(result.0)
	}
	pub async fn add_thumbnail(&self, thumbnail_data: &[u8], index : i32) ->  Result<i32, Error>  {
		println!("add_thumbnail ");
		let result = sqlx::query("INSERT OR IGNORE INTO thumbnails (thumbnail_data, path_id) VALUES (?, ?)")
		.bind(thumbnail_data)
		.bind(index)
		.execute(&self.pool)
		.await;

			match result {
				Ok(res) => Ok(res.last_insert_rowid() as i32),
				Err(e) => Err(e),
			}
	}

	pub async fn add_duplicate(self, hash_id: i64, path_id: i64) ->  Result<i32, Error> {
		let result = sqlx::query("INSERT OR IGNORE INTO duplicates (hash_id, path_id) VALUES (?, ?)")
			.bind(hash_id)
			.bind(path_id)
			.execute(&self.pool)
			.await;

			match result {
				Ok(res) => Ok(res.last_insert_rowid() as i32),
				Err(e) => Err(e),
			}
	}
}