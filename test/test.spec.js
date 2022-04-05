const R = 6371e3;
const coords = {
    latitude: 16.8844268,
    longitude: 96.1318427
}
const results = [
    {
        id: 11,
        name: '(၁၀)မိုင်ကုန်း',
        longitude: 96.130621,
        latitude: 16.889317
    },
    {
        id: 78,
        name: '(၉)မိုင်',
        longitude: 96.134968,
        latitude: 16.881858
    },
    {
        id: 79,
        name: '(၉)မိုင်ခွဲ',
        longitude: 96.135772,
        latitude: 16.884384
    },
    {
        id: 718,
        name: 'အဝေးပြေး',
        longitude: 96.123154,
        latitude: 16.888701
    },
    {
        id: 743,
        name: 'အေဝမ်း',
        longitude: 96.137706,
        latitude: 16.877716
    }
];

const data = results.map((result) => {
    result.distance = Math.acos(Math.sin(result.latitude * Math.PI / 180) * Math.sin(coords.latitude * Math.PI / 180) + Math.cos(result.latitude * Math.PI / 180) * Math.cos(coords.latitude * Math.PI / 180) * Math.cos(result.longitude * Math.PI / 180 - coords.longitude * Math.PI / 180)) * 6371e3;
    return result;
}).sort((a, b) => a.distance - b.distance);

console.log(data);