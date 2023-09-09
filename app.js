const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let data = null;
const databaseIntialization = async () => {
  try {
    let dbPath = path.join(__dirname, "todoApplication.db");
    data = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at ${dbPath}`);
    });
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
};
databaseIntialization();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getDetailsQuery = "";
  switch (true) {
    case status != undefined && priority != undefined:
      getDetailsQuery = `
                      SELECT * FROM todo
                      WHERE todo LIKE "%${search_q}%" 
                      AND status='${status}' AND priority='${priority}';
                      `;
      break;
    case status != undefined:
      getDetailsQuery = `
            SELECT * FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND status='${status}';
            `;
      break;
    case priority != undefined:
      getDetailsQuery = `
           SELECT * FROM todo
           WHERE todo LIKE "%${search_q}%"
           AND priority='${priority}'
           `;
      break;
    default:
      getDetailsQuery = `
            SELECT * FROM todo 
            WHERE todo LIKE "%${search_q}%";
            `;
      const getDetailsArray = await data.all(getDetailsQuery);
      console.log(getDetailsArray);
  }
  const todoArray = await data.all(getDetailsQuery);
  response.send(todoArray);
});

//get details by ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDetailsByQuery = `
  SELECT * FROM todo 
  WHERE id=${todoId};
  `;
  const requestArray = await data.get(getDetailsByQuery);
  response.send(requestArray);
});
//post a information API 3
app.post("/todos/", async (request, response) => {
  const postDetails = request.body;
  const { id, todo, status, priority } = postDetails;
  const postDetailsQuery = `
  INSERT INTO district (id,todo,status,priority)
  VALUES(
      ${id},
      '${todo}',
      '${status}',
      '${priority}'
  )
  `;
  const postDetailsArray = await data.run(postDetailsQuery);
  response.send("Todo Successfully Added");
});

//app put apit 4
app.put("/todos/:todoId/", async (request, response) => {
  const updateDetails = request.params;
  const {
    todo = undefined,
    priority = undefined,
    status = undefined,
  } = request.body;
  let updateDetailsQuery = "";
  let updateArray = "";
  switch (true) {
    case status !== undefined:
      updateDetailsQuery = `
      UPDATE todo 
      SET status='${status}'
      WHERE id=${todoId} AND 
      `;
      updateArray = await data.run(updateDetailsQuery);
      response.send("Status Updated");
    case priority !== undefined:
      updateDetailsQuery = `
        UPDATE TODO 
        SET priority='${priority}'
        WHERE id=${id};        
        `;
      updateArray = await data.run(updateDetailsQuery);
      response.send("Priority Updated");
    case todo !== undefined:
      updateDetailsQuery = `
        UPDATE TODO 
        SET todo='${todo}'
        WHERE id=${id}; 
        `;
      updateArray = await data.run(updateDetailsQuery);
      response.send("Todo Updated");
  }
});
module.exports = app;
