use mysql;

use crate::material::MySQLConnection;
use tools::{Exists, Select};

impl Exists for MySQLConnection {
    fn exists(&self, query_str: &str) -> bool {
        self.select_value(&["SELECT EXISTS(", query_str, ")"].concat(), &|row| mysql::from_row(row)).unwrap()
    }

    fn exists_wparams(&self, query_str: &str, params: std::vec::Vec<(std::string::String, mysql::Value)>) -> bool {
        self.select_wparams_value(&["SELECT EXISTS(", query_str, ")"].concat(), &|row| mysql::from_row(row), params).unwrap()
    }
}
