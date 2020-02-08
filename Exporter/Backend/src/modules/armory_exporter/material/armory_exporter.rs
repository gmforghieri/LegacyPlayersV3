use std::sync::mpsc::Sender;

use mysql_connection::material::MySQLConnection;

use crate::modules::CharacterDto;

#[derive(Debug)]
pub struct ArmoryExporter {
  pub db_characters: MySQLConnection,
  pub sender_character: Option<Sender<(u32, CharacterDto)>>,
  pub last_fetch_time: u64
}

impl Default for ArmoryExporter {
  fn default() -> Self {
    ArmoryExporter {
      db_characters: MySQLConnection::new("characters"),
      sender_character: None,
      last_fetch_time: 0 // TODO: Save in DB!
    }
  }
}

impl ArmoryExporter {
  pub fn init(self) -> Self
  {
    self
  }
}