const { rpc } = require('./supabase');

const LINE_TYPES = [
  {
    line_color: 'အပြာ',
    line_name: 'မြောက်ပိုင်းခရိုင် အခြေပြု ယာဉ်လိုင်းများ',
  },
  {
    line_color: 'အနီ',
    line_name: 'အရှေ့ပိုင်းရိုင် အခြေပြု ယာဉ်လိုင်းများ',
  },
  {
    line_color: 'ခရမ်း',
    line_name: 'တောင်ပိုင်းခရိုင် အခြေပြု ယာဉ်လိုင်းများ',
  },
  {
    line_color: 'အစိမ်း',
    line_name: 'ပင်မလမ်းနဲ့ ချိတ်ဆက်သည့် ယာဉ်လိုင်းများ',
  },
  {
    line_color: 'အညို',
    line_name: 'မြို့တွင်းပတ်လိုင်းများ',
  },
];

const findNearestStops = (params) => rpc('find_nearest_stops', params);

const findLinesByStop = (stop_id_input) =>
  rpc('find_lines_by_stop', { stop_id_input });

const findStopsByLine = (line_id_input) => 
  rpc('find_stops_by_line', { line_id_input });

module.exports = {
  LINE_TYPES,
  findNearestStops,
  findLinesByStop,
  findStopsByLine,
};
