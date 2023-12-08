DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS UserList;
DROP TABLE IF EXISTS ShoppingList;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS Demo;

CREATE TABLE User(
	idUser integer primary key NOT NULL,
    username varchar(15) NOT NULL UNIQUE,
    name varchar(30),
    password varchar(20) NOT NULL
);

CREATE TABLE ShoppingList(
	idList integer PRIMARY KEY NOT NULL,
    listName varchar(30)
);

CREATE TABLE UserList(
	idUserList integer PRIMARY KEY NOT NULL,
    idUser REFERENCES User on update CASCADE ON DELETE CASCADE,
    idList REFERENCES ShoppingList ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Item(
	idItem integer PRIMARY KEY NOT NULL,
    itemName varchar(30) NOT NULL,
    amountNeeded integer DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    idList REFERENCES ShoppingList on update cascade on delete cascade
);