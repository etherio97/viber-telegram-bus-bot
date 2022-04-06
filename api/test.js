export default function(req, res) {
  let timeout = req.query.t || 0;
  let status = parseInt(req.query.s);
  
  console.log('started');
  setTimeout(() => {
    res.status((status > 199 && status < 300 || status > 399 && status < 500) ? status : 200).send(status > 300 ? 'error' : 'success');
  }, timeout);
}