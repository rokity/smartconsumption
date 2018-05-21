module.exports = [
    {
        method: 'GET',
        path: '/stocazzo',
        handler: (req, h) => 
        {
            console.log("stocazzo")
            return h.response("ciao").code(200);
        },
      },
]