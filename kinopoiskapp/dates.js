var getDatesArray = function(start, end) {
    for (var arrayOfDates = [], current = start; current <= end; current.setDate(current.getDate() + 1)) {
        arrayOfDates.push(new Date(current));
    }
    return arrayOfDates;
};

function getDate() {
    // вычисление даты 30 дней назад
    var today = new Date();
    var priorDateObject = new Date(new Date().setDate(today.getDate() - 30));
    var priorDateString = priorDateObject.toISOString().substring(0, 10);

    // получение списка 30 предыдущих дат
    var datesList = getDatesArray(new Date(priorDateString), new Date());

    // преобразование списка дат к строковому типу
    var datesInSting = [];
    for (var day of datesList) {
        datesInSting.push(day.toISOString().substring(0, 10));
    }

    return datesInSting;
}

module.exports.getDate = getDate;