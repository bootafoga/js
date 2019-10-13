// TODO:
// Стрелочные функции
// Добавить цикл по 30 дням

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

async function insertInBD(sql) {
    return new Promise(
        (resolve, reject) => {
            connection.query(
                sql,
                function(err, result) {
                    if (err) resolve("already exist");
                    else resolve(result.insertId);
                });
        }
    );
};


function getQuery(num) {
    switch (num) {
        case 'insertFilm':
            return 'INSERT INTO films(title) VALUES';
        case 'insertTop':
            return 'INSERT INTO top(date, place, title, year, rating, idOfDay, idOfFilm) VALUES';
        case 'insertDate':
            return 'INSERT INTO dates(date) VALUES';
        default:
    }
}


// на этой функции у меня случился творческий кризис и я не смогла пока придумать для нее имя,
// но в ней проихсодит весь основной алгоритм:
// проверка на уже существование в БД записей о дате/фильме 
// и вызов функции вставки в случае, если такого поля даты/фильма еще нет.
// в чем смысл сия действия - раньше были две функции addDate и addFilms, но в них, по сути, был идентичный код,
// эта функция является, грубо говоря, объединением, и благодаря ней было убрано дублирование кода (что хорошо, наверное),
// но, с другой стороны, как по мне, код стал немного менее читабелен.
// как, по-твоему, лучше?

// upd: теперь там еще и формирование таблицы топа

async function name(flag, tableName, fieldName, value, forFilms, forTop) {
    return new Promise(
        (resolve, reject) => {
            const sql = `SELECT id FROM ${tableName} WHERE ${fieldName} = \'${value}\'`;

            // проверка присутствия в бд
            connection.query(sql, function(err, rows, fields) {

                if (!rows[0]) {
                    switch (flag) {
                        case 'insertDate': // код для обработки даты, если такой даты еще нет
                            const sql2 = getQuery('insertDate') + '(\'' + value + '\');';
                            resolve(insertInBD(sql2));
                            break;
                        case 'insertFilm': // код для обработки фильма, если такого фильма еще нет
                            resolve(forFilms);
                            break;
                        case 'insertTop':  // код для обработки топа. случай, когда искомый фильм не найден.
                            // в теории, это произойти не может, поэтому здесь можно, наверное, ничего не писать
                            resolve("");
                            break;
                        default:
                    }
                } else {
                    switch (flag) {
                        case 'insertDate': // код для обработки даты, если такая дата уже есть
                            resolve(0);
                            break;
                        case 'insertFilm': // код для обработки фильма, если такой фильм уже есть
                            resolve("");
                            break;
                        case 'insertTop':  // код для обработки топа. случай, когда искомый фильм найден
                            resolve(forTop + rows[0].id + ')');
                            break;
                        default:
                    }
                }
            });
        });
}

// добавление фильмов в таблицу с фильмами
async function addFilms(arrayOfFilms, id) {
    let arrayOfPromises = [];

    for (let film of arrayOfFilms) {
        arrayOfPromises.push(new Promise((resolve, reject) => {
            var strInsert = '(\'' + film['title'] + '\')';
            resolve(name('insertFilm', 'films', 'title', film['title'], strInsert));
        }));
    }

    return Promise.all(arrayOfPromises);
};

async function addInThirdTable(arrayOfFilms, idOfDay, date) {
    let arrayOfPromises = [];

    for (let film of arrayOfFilms) {
        arrayOfPromises.push(new Promise((resolve, reject) => {
            const sql = '(\'' + date + '\', ' + film['place'] + ', \'' + film['title'] + '\', ' + film['year'] + ',' + film['rating'] + ',' + idOfDay + ',';

            resolve(name('insertTop', 'films', 'title', film['title'], null, sql));
        }));
    }

    return Promise.all(arrayOfPromises);
}

async function addData(arrayOfFilms, date) {
    try {
        getConnection();

        // добавили дату
        let idOfDay = await name('insertDate', 'dates', 'date', date);

        // если такой даты не было ранее 
        if (idOfDay) {
            // добавили 250 фильмов по этой дате     
            await insertInBD(getQuery('insertFilm') + (await addFilms(arrayOfFilms, idOfDay)).join(', ') + ';');

            // добавили в таблицу с топами 250 записей дата/фильм 
            await insertInBD(getQuery('insertTop') + (await addInThirdTable(arrayOfFilms, idOfDay, date)).join(', ') + ';');
        }

    } catch (error) {
        console.log(error);
    } finally {
        connection.end();
    }
};

module.exports = addData;

///////////////////////////////////////////////////////////////////////////////
/*Promise.all([addFilmsInBase(arrayOfFilms, id)]).then(arrStrings => {
    var resultSql = arrStrings.join(', ');
    console.log(resultSql);
   // addToSql(resultSql);
}).catch(error => {
    console.log(error)
});*/
///////////////////////////////////////////////////////////////////////////////