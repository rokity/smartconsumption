module.exports = [
    {
        method: 'GET',
        path: '/stocazzo',
        handler: (req, h) => {
          console.log(req.payload);
          console.log(req.params);
          
          return h.response("ciao").code(200);
        }
      },
];