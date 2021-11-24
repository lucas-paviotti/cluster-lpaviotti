const randoms = (a) => {
    let numList = {};
    let max = a || 100000000;
    for (let i=0; i<=max; i++){
        num = Math.floor(Math.random() * (1000 - 1 + 1) + 1);
        numList[num] = (numList[num] + 1) || 1 ;
    }
    return numList;
}

process.send(randoms(process.argv[2]));