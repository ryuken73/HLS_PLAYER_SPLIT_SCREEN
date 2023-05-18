import config from '../config';
const {YOUTUBE_HLS_URL_GET_API} = config;


export const setUniqAreasFromSources = (cctvs, setFunction) => {
    const areasOnly = cctvs.map(cctv => {
        return cctv.title.split(' ')[0]
    })
    const uniqAreas = [...new Set(areasOnly)];
    setFunction && setFunction(uniqAreas);
    return uniqAreas;
}
      
export const groupCCTVsByArea = (uniqAreas, cctvs, setFunction) => {
    const grouped = new Map();
    uniqAreas.forEach(area => {
        const cctvsInArea = cctvs.filter(cctv => {
        return cctv.title.startsWith(area);
        })
        grouped.set(area, cctvsInArea);
    })
    setFunction && setFunction(grouped);
    return grouped;
}

export const orderByArea = cctvs => {
    const uniqAreas = setUniqAreasFromSources(cctvs);
    const orderedByAreaMap = groupCCTVsByArea(uniqAreas, cctvs);
    return [...orderedByAreaMap.values()].flat();
}  

export const getYoutubePlaylistUrl = videoId => {
    return new Promise((resolve, reject) => {
        fetch(`${YOUTUBE_HLS_URL_GET_API}/${videoId}`)
        .then(response => response.json())
        .then(result => {
            if(result.success){
                resolve(result.result)
            } else {
                throw new Error(result.error)
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const getYoutubeId = url => {
    const addr = new URL(url);
    return addr.searchParams.get('v');
}
    
