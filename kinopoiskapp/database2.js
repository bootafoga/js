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
    return new Promise(
        (resolve, reject) => {
            const sql = "INSERT INTO films(place, title, year, rating, idOfDay) VALUES(?, ?, ?, ?, ?)";

            for (let film of arrayOfFilms) {
                let currfilm = [film['place'], film['title'], film['year'], film['rating'], id];
                connection.query(sql, currfilm);
            }

            resolve("Successfull");
        }
    );
};


async function addData(arrayOfFilms, date) {
    try {
        getConnection();
        
        // добавили дату
        let id = await addNewDate(date);
        // добавили 250 фильмов по этой дате
        await addFilmsInBase(arrayOfFilms, id);

    } catch (error) {
        console.log(error);
    } finally {
        connection.end();
    }
};

module.exports = addData;