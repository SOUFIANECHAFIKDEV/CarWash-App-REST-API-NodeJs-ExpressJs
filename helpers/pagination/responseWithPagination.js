async function asyncForEach(indexStart, indexEnd, array, callback) {
    for (let index = indexStart; index <= indexEnd; index++) {
        await callback(array[index], index, array)
    }
}

function TotalPages(TotalItems, pageSize) {
    const sum = TotalItems / (pageSize == 0 ? TotalItems : pageSize);
    return (sum - Math.floor(sum)) == 0 ? Math.floor(sum) : Math.floor(sum + 1);
}

async function pagination(AllItems, pageSize, pageNumber) {
    let listOfItems = [];
    const TotalItems = AllItems.length;
    const NumberPages = TotalPages(TotalItems, pageSize)

    const indexStart = (pageSize * pageNumber) - pageSize;
    const indexEnd = (pageSize * pageNumber) - 1;
    await asyncForEach(indexStart, indexEnd, AllItems, async (item) => {
        if (item != undefined) listOfItems.push(item);
    });

    return {
        "Items": listOfItems,
        "Paging": { TotalItems, pageNumber, pageSize, NumberPages }
    };
};

module.exports = async (AllItems, pageSize, pageNumber) => {
    return await pagination(AllItems, pageSize, pageNumber);
};