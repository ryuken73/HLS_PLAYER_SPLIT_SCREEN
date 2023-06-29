const jsonF = require('./localSavedCCTV.json');
const fs = require('fs');
const outFile = fs.createWriteStream('uniq.json');

console.log(jsonF)
const uniq = jsonF.reduce((acct, cctv) => {
  const isDup = acct.some(uniqCCTV => uniqCCTV.cctvId === cctv.cctvId)
  if(isDup){
    return acct;
  } else {
    return [
      ...acct,
      cctv
    ]
  }
}, [])

outFile.write(JSON.stringify(uniq));