// JavaScript Document

var db = openDatabase('cloud_potato_db', '1.0', 'Cloud Potato', 5 * 1024 * 1024);
db.transaction(function (tx) {				
		//tx.executeSql('DROP TABLE ep_list');
		tx.executeSql('CREATE TABLE IF NOT EXISTS myshows (id INTEGER, Name TEXT, Premiered TEXT, Runtime TEXT, Status TEXT, Day TEXT, AirTime Text, Summary TEXT,  PRIMARY KEY(id))');
		
		//store eps for show  items.push( name + " " + season + " " + epnum + " " + airdate + " " + img  + " " + summary);
		tx.executeSql('CREATE TABLE IF NOT EXISTS ep_list (Name TEXT, Season INTEGER, Epnum INTEGER, Airdate TEXT, Img TEXT, Summary TEXT)');;
});

