// TODO:
// Стрелочные функции
// Добавить 3 таблицу
// Перестроить функции addNewDate, addBaseInFilms с учетом addToSql


const mysql = require("mysql2");
let connection;

let getConnection = function() {
    connection = mysql.createConnection({
        host: "localhost",
        port: "3306",
        user: "root",
        database: "db_kinopoisk",
        password: "root"
    });

    connection.connect();
}

//добавление даты в таблицу с датами
async function addNewDate(date) {
    return new Promise(
        (resolve, reject) => {
            //проверка, существует ли данная дата уже в бд
            const sql = "SELECT id FROM dates WHERE dateOfTop =" + '\'' + date + '\'';

            connection.query(sql, function(err, rows, fields) {
                if (rows[0] == undefined) {
                    // если такой даты нет, то вставляем
                    const sql = "INSERT INTO dates(dateOfTop) VALUES(?)";                    
                    
                    connection.query(
                        sql, date,
                        function(err, result) {
                            resolve(result.insertId);
                        });
                    
                } else {
                    //если такая дата есть, пропускаем           
                    reject('already exist');
                }
            });
        }
    );
};

// добавление фильмов в таблицу с фильмами
async function addFilmsInBase(arrayOfFilms, id) {
    let arrayOfPromises = [];
    let strInsert = '';    

    for (let film of arrayOfFilms) {
        arrayOfPromises.push(new Promise((resolve, reject) => {
            const sql = "SELECT id FROM films WHERE title =" + '\'' + film['title'] + '\'';

            connection.query(sql, function(err, rows, fields) {
                if (rows[0] == undefined) {
                    // если такого фильма нет, то вставляем
                    strInsert += '(' + film['place'] + ', \'' + film['title'] + '\', '+ film['year'] + ',' + film['rating'] + ',' + id + '),';
                    resolve(strInsert);
                } else {
                    reject('already exist');
                }
            });
        }));
    }

    return Promise.all(arrayOfPromises);

    // Версия 1 без проверки повторения фильмов
    // работает
    /* 
    return new Promise(
        (resolve, reject) => {
            let allRows = '';

            for (let film of arrayOfFilms) {
                allRows += '(' + film['place'] + ', \'' + film['title'] + '\', '+ film['year'] + ',' + film['rating'] + ',' + id + '),';
            }

            let sql = "INSERT INTO films(place, title, year, rating, idOfDay) VALUES" + allRows.substring(0, allRows.length - 1) + ';';
           // connection.query(sql);
            connection.query(
                sql,
                function(err, result) {
                    resolve("Successfull");
                });

        }
    );*/
};


async function addToSql(sql) {
    return new Promise(
        (resolve, reject) => {
            let insert = 'INSERT INTO films(place, title, year, rating, idOfDay) VALUES' + sql.substring(0, sql.length-1) + ';';

            connection.query(
                insert,
                function(err, result) {
                    resolve("Successfull");
                });
        }
    );
};


async function addData(arrayOfFilms, date) {
    try {
        getConnection();
        
        // добавили дату
        let id = await addNewDate(date);
        // добавили 250 фильмов по этой дате
        
        let res = await addFilmsInBase(arrayOfFilms, id);
        await addToSql(res[arrayOfFilms.length-1]);

    } catch (error) {
        console.log(error);
    } finally {
        connection.end();
    }
};

module.exports = addData;