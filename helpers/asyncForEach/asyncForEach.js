module.exports = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

// const start = async () => {
//     await asyncForEach(subscribesList, async (item) => {
//         let start = item._id.getTimestamp();
//         var timeDiff = Math.abs(currentDate.getTime() - start.getTime());
//         var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
//         let total = (diffDays < item.subscribe.numberDates ? item.subscribe.numberDates - diffDays : 0);
//         nbDates = nbDates + total;
//         return total
//     })
//     resolve(nbDates);
// }

// start()