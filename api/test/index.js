module.exports = async function (context, req) {
  context.log("Azure Function 'test' chiamata");

  const responseMessage = {
    success: true,
    message: "Risposta dalla Azure Function!",
    timestamp: new Date().toISOString(),
    method: req.method,
    query: req.query,
  };

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: responseMessage,
  };
};
